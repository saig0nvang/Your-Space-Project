import { dot } from "../../geometry";
import type { DepthMap } from "../../types";
import { pixelRayDir } from "../ray";

/**
 * Sinh DepthMap tổng hợp của MỘT mặt sàn phẳng đã biết, nhìn bởi camera ở gốc
 * (nhìn -Z) nghiêng xuống `pitchRad`, cao `heightM` so với sàn. Depth lưu là
 * khoảng cách tia (chuẩn hoá 0..1). Dùng để test calibrate khôi phục đúng sàn.
 */
export function syntheticFloor(
  w = 64,
  h = 48,
): { depth: DepthMap; truth: { heightM: number; pitchRad: number; fovYRad: number } } {
  const heightM = 1.4;
  const pitchRad = (20 * Math.PI) / 180;
  const fovYRad = (60 * Math.PI) / 180;
  const aspect = w / h;

  // Mặt sàn trong không gian camera: normal hướng lên-ra-sau, cách gốc heightM.
  const n = { x: 0, y: Math.cos(pitchRad), z: Math.sin(pitchRad) };
  const d = heightM; // n·X + d = 0 → khoảng cách gốc→mặt phẳng = heightM

  const r = new Float32Array(w * h);
  let maxR = 0;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const nx = ((i + 0.5) / w) * 2 - 1;
      const ny = 1 - ((j + 0.5) / h) * 2;
      const dir = pixelRayDir(nx, ny, fovYRad, aspect);
      const denom = dot(n, dir);
      let rr = 0;
      if (denom < -1e-4) rr = -d / denom; // tia đâm xuống sàn phía trước
      r[j * w + i] = rr;
      if (rr > maxR) maxR = rr;
    }
  }

  const data = new Float32Array(w * h);
  for (let k = 0; k < w * h; k++) data[k] = maxR > 0 ? (r[k] ?? 0) / maxR : 0;

  return { depth: { width: w, height: h, data }, truth: { heightM, pitchRad, fovYRad } };
}
