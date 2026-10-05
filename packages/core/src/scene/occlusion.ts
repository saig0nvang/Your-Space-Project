import type { CameraModel, DepthMap } from "../types";
import { pixelRayDir } from "./ray";

/** Disparity tương đối của Depth Anything: giá trị LỚN = GẦN, chuẩn hoá 0..1, hàng 0 = đỉnh ảnh. */
export type DisparityMap = DepthMap;

/** Mô hình 1/z = a·disparity + b (z view-space, mét). */
export type FloorFit = { a: number; b: number; confidence: number; samples: number };

const MAX_FLOOR_Z = 30;
const INLIER_TOL = 0.08;
const STRIDES = [1, 7, 13, 31, 61, 127];

/** Độ sâu view-space (mét, dương theo trục nhìn) của mặt sàn tại NDC; null nếu tia không chạm sàn phía trước. */
export function floorViewZ(nx: number, ny: number, cam: CameraModel): number | null {
  const dir = pixelRayDir(nx, ny, cam.fovYRad, cam.aspect);
  const denom = Math.cos(cam.pitchRad) * dir.y + Math.sin(cam.pitchRad) * dir.z;
  if (denom > -1e-4) return null;
  const t = -cam.heightM / denom;
  return t * -dir.z;
}

type Pt = { x: number; y: number };

function countInliers(pts: readonly Pt[], a: number, b: number): number {
  let n = 0;
  for (const p of pts) if (Math.abs(a * p.x + b - p.y) <= INLIER_TOL * p.y) n++;
  return n;
}

function leastSquares(pts: readonly Pt[]): { a: number; b: number } | null {
  const n = pts.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of pts) { sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y; }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-12) return null;
  const a = (n * sxy - sx * sy) / den;
  return { a, b: (sy - a * sx) / n };
}

/**
 * Khớp disparity tương đối với khoảng cách sàn mà camera dự đoán: với mỗi pixel có tia chạm sàn,
 * cặp (disparity, 1/z_sàn) phải nằm trên một đường thẳng nếu pixel đó đúng là sàn. RANSAC tất định
 * (bộ đôi chỉ số theo bước nguyên tố, như `calibrate`) để bỏ tường, đồ đạc; rồi bình phương tối thiểu trên inlier.
 */
export function fitDepthToFloor(disp: DisparityMap, cam: CameraModel): FloorFit {
  const { width: w, height: h, data } = disp;
  const stepX = Math.max(1, Math.floor(w / 64));
  const stepY = Math.max(1, Math.floor(h / 48));
  const pts: Pt[] = [];
  for (let j = 0; j < h; j += stepY) {
    for (let i = 0; i < w; i += stepX) {
      const d = data[j * w + i] ?? 0;
      if (d <= 0) continue;
      const zf = floorViewZ(((i + 0.5) / w) * 2 - 1, 1 - ((j + 0.5) / h) * 2, cam);
      if (zf === null || zf > MAX_FLOOR_Z) continue;
      pts.push({ x: d, y: 1 / zf });
    }
  }
  const n = pts.length;
  if (n < 12) return { a: 0, b: 0, confidence: 0, samples: n };

  let best = { a: 0, b: 0, inliers: 0 };
  const startStep = Math.max(1, Math.floor(n / 32));
  for (const s of STRIDES) {
    for (let start = 0; start < n; start += startStep) {
      const p = pts[start]!;
      const q = pts[(start + s * 5 + 3) % n]!;
      if (Math.abs(q.x - p.x) < 1e-3) continue;
      const a = (q.y - p.y) / (q.x - p.x);
      if (a <= 0) continue;
      const b = p.y - a * p.x;
      const inliers = countInliers(pts, a, b);
      if (inliers > best.inliers) best = { a, b, inliers };
    }
  }
  if (best.inliers === 0) return { a: 0, b: 0, confidence: 0, samples: n };

  const inlierPts = pts.filter((p) => Math.abs(best.a * p.x + best.b - p.y) <= INLIER_TOL * p.y);
  const refit = leastSquares(inlierPts);
  const { a, b } = refit && refit.a > 0 ? refit : best;
  return { a, b, confidence: countInliers(pts, a, b) / n, samples: n };
}

export function viewZFromDisparity(fit: FloorFit, disparity: number): number | null {
  const inv = fit.a * disparity + fit.b;
  return inv > 1e-3 ? 1 / inv : null;
}

/**
 * Ảnh độ sâu cho lượt che khuất. Pixel có z ≥ (1 − floorTolerance)·z_sàn được coi là chính mặt sàn
 * (hoặc sau sàn) → 0, để chân đồ không bị sàn cắt. Pixel còn lại là vật thật trước sàn: trả z·(1 + margin)
 * — đồ mới chỉ bị che khi cảnh thật gần hơn quá `margin` (spike dùng 5%).
 */
export function buildOccluderDepth(
  disp: DisparityMap,
  fit: FloorFit,
  cam: CameraModel,
  opts: { floorTolerance?: number; margin?: number; maxZ?: number } = {},
): Float32Array {
  const tol = opts.floorTolerance ?? 0.08;
  const margin = opts.margin ?? 0.05;
  const maxZ = opts.maxZ ?? 40;
  const { width: w, height: h, data } = disp;
  const out = new Float32Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i;
      const z = viewZFromDisparity(fit, data[k] ?? 0);
      if (z === null || z > maxZ) continue;
      const zf = floorViewZ(((i + 0.5) / w) * 2 - 1, 1 - ((j + 0.5) / h) * 2, cam);
      if (zf !== null && z >= zf * (1 - tol)) continue;
      out[k] = z * (1 + margin);
    }
  }
  return out;
}
