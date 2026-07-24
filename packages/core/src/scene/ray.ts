import { normalize, type Vec3 } from "../geometry";

/**
 * Hướng tia (đã chuẩn hoá) qua điểm NDC (nx,ny ∈ [-1,1], ny hướng lên)
 * trong không gian camera nhìn theo -Z. Dùng chung cho fixture & calibrate.
 */
export function pixelRayDir(nx: number, ny: number, fovYRad: number, aspect: number): Vec3 {
  const t = Math.tan(fovYRad / 2);
  return normalize({ x: nx * t * aspect, y: ny * t, z: -1 });
}
