import { cross, dot, normalize, scale, sub, type Vec3 } from "../geometry";
import type { Calibration, DepthMap } from "../types";
import { pixelRayDir } from "./ray";

const DEFAULT_FOV_Y = (60 * Math.PI) / 180;

/** Mặt phẳng qua 3 điểm → normal (chưa chuẩn hoá). */
function planeNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return cross(sub(b, a), sub(c, a));
}

/**
 * Ước lượng camera + mặt sàn từ depth map (relative, quy ước: giá trị LỚN = XA).
 *
 * - Back-project pixel nửa dưới ảnh → point cloud (không gian camera).
 * - RANSAC TẤT ĐỊNH (bộ ba chỉ số theo bước nguyên tố, không Math.random):
 *   thử nhiều mặt phẳng ứng viên, chỉ nhận mặt "giống sàn" (|normal.y| lớn),
 *   chọn mặt nhiều inlier nhất → bền với nhiễu/tường/đồ đạc.
 * - Ép scale metric bằng chiều cao camera giả định (không tin depth tuyệt đối).
 *
 * Trả khung THẾ GIỚI: sàn = y=0, camera cao heightM, nghiêng pitchRad.
 */
export function calibrate(
  depth: DepthMap,
  meta: { fovYRad?: number; assumedCameraHeightM?: number } = {},
): Calibration {
  const fovYRad = meta.fovYRad ?? DEFAULT_FOV_Y;
  const heightM = meta.assumedCameraHeightM ?? 1.4;
  const { width: w, height: h, data } = depth;
  const aspect = w / h;

  // Lấy mẫu thưa nửa dưới ảnh (đủ dày để bền, đủ thưa để nhanh).
  const stepX = Math.max(1, Math.floor(w / 64));
  const stepY = Math.max(1, Math.floor(h / 48));
  const pts: Vec3[] = [];
  for (let j = Math.floor(h * 0.45); j < h; j += stepY) {
    for (let i = 0; i < w; i += stepX) {
      const dv = data[j * w + i] ?? 0;
      if (dv <= 1e-5) continue;
      const nx = ((i + 0.5) / w) * 2 - 1;
      const ny = 1 - ((j + 0.5) / h) * 2;
      pts.push(scale(pixelRayDir(nx, ny, fovYRad, aspect), dv));
    }
  }

  const worldFloor = { normal: { x: 0, y: 1, z: 0 }, d: 0 };
  const n = pts.length;
  if (n < 8) {
    return { camera: { fovYRad, aspect, heightM, pitchRad: 0 }, floor: worldFloor, confidence: 0 };
  }

  // Ngưỡng inlier theo quy mô đám mây điểm.
  let maxAbs = 0;
  for (const p of pts) maxAbs = Math.max(maxAbs, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
  const thresh = Math.max(1e-5, maxAbs * 0.02);

  // RANSAC tất định: bộ ba chỉ số theo bước nguyên tố.
  const STRIDES = [1, 7, 13, 31, 61, 127];
  let bestNormal: Vec3 | null = null;
  let bestOffset = 0;
  let bestInliers = 0;

  for (const s1 of STRIDES) {
    for (const s2 of STRIDES) {
      for (let start = 0; start < n; start += Math.max(1, Math.floor(n / 24))) {
        const a = pts[start]!;
        const b = pts[(start + s1 * 3) % n]!;
        const c = pts[(start + s2 * 7 + 5) % n]!;
        const raw = planeNormal(a, b, c);
        if (dot(raw, raw) < 1e-12) continue;
        let nm = normalize(raw);
        if (nm.y < 0) nm = scale(nm, -1);
        if (Math.abs(nm.y) < 0.55) continue; // chỉ nhận mặt phẳng "giống sàn"
        const off = -dot(nm, a);
        let inliers = 0;
        for (const p of pts) if (Math.abs(dot(nm, p) + off) <= thresh) inliers++;
        if (inliers > bestInliers) {
          bestInliers = inliers;
          bestNormal = nm;
          bestOffset = off;
        }
      }
    }
  }

  if (!bestNormal) {
    return { camera: { fovYRad, aspect, heightM, pitchRad: 0 }, floor: worldFloor, confidence: 0 };
  }

  const confidence = bestInliers / n;

  // pitch từ normal sàn trong không gian camera (camera nhìn -Z): ≈ (0, cosθ, sinθ).
  const pitchRad = Math.atan2(bestNormal.z, bestNormal.y);

  return { camera: { fovYRad, aspect, heightM, pitchRad }, floor: worldFloor, confidence };
}
