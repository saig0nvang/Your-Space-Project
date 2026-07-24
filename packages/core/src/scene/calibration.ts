import { cross, dot, normalize, scale, sub, type Vec3 } from "../geometry";
import type { Calibration, DepthMap } from "../types";
import { pixelRayDir } from "./ray";

const DEFAULT_FOV_Y = (60 * Math.PI) / 180;

/**
 * Ước lượng camera + mặt sàn từ depth map (relative).
 * - Back-project các pixel nửa dưới ảnh → point cloud (không gian camera).
 * - Khớp mặt phẳng bằng 3 điểm trải rộng (TẤT ĐỊNH, không Math.random) → normal.
 * - Ép scale metric bằng chiều cao camera giả định (không tin depth tuyệt đối).
 * Trả về khung THẾ GIỚI: sàn = mặt phẳng y=0, camera cao heightM, nghiêng pitchRad.
 */
export function calibrate(
  depth: DepthMap,
  meta: { fovYRad?: number; assumedCameraHeightM?: number } = {},
): Calibration {
  const fovYRad = meta.fovYRad ?? DEFAULT_FOV_Y;
  const heightM = meta.assumedCameraHeightM ?? 1.4;
  const { width: w, height: h, data } = depth;
  const aspect = w / h;

  const pts: Vec3[] = [];
  for (let j = Math.floor(h * 0.4); j < h; j++) {
    for (let i = 0; i < w; i++) {
      const dv = data[j * w + i] ?? 0;
      if (dv <= 1e-5) continue;
      const nx = ((i + 0.5) / w) * 2 - 1;
      const ny = 1 - ((j + 0.5) / h) * 2;
      pts.push(scale(pixelRayDir(nx, ny, fovYRad, aspect), dv));
    }
  }

  const worldFloor = { normal: { x: 0, y: 1, z: 0 }, d: 0 };
  if (pts.length < 3) {
    return { camera: { fovYRad, aspect, heightM, pitchRad: 0 }, floor: worldFloor, confidence: 0 };
  }

  // Khớp mặt phẳng tất định: 3 điểm trải rộng, không cộng tuyến.
  const p1 = pts[0]!;
  const p2 = pts[pts.length - 1]!;
  const p3 = pts[Math.floor(pts.length / 2)]!;
  let nrm = cross(sub(p2, p1), sub(p3, p1));
  if (dot(nrm, nrm) < 1e-9) {
    for (const p of pts) {
      const c = cross(sub(p2, p1), sub(p, p1));
      if (dot(c, c) > 1e-9) {
        nrm = c;
        break;
      }
    }
  }
  let n = normalize(nrm);
  if (n.y < 0) n = scale(n, -1); // hướng lên (camera ở trên sàn)

  // Tỉ lệ inlier quanh mặt phẳng qua centroid → confidence.
  let cx = 0,
    cy = 0,
    cz = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
    cz += p.z;
  }
  const centroid: Vec3 = { x: cx / pts.length, y: cy / pts.length, z: cz / pts.length };
  const dPlane = -dot(n, centroid);
  let spread = 0;
  for (const p of pts) spread = Math.max(spread, Math.abs(dot(n, p) + dPlane));
  const thresh = Math.max(1e-4, spread * 0.05);
  let inliers = 0;
  for (const p of pts) if (Math.abs(dot(n, p) + dPlane) <= thresh) inliers++;
  const confidence = inliers / pts.length;

  // pitch từ normal (camera nhìn -Z): normal sàn ≈ (0, cosθ, sinθ).
  const pitchRad = Math.atan2(n.z, n.y);

  return { camera: { fovYRad, aspect, heightM, pitchRad }, floor: worldFloor, confidence };
}
