import type { CameraModel } from "../types";

const DEFAULT_FOV_Y = (60 * Math.PI) / 180;

/**
 * Hiệu chỉnh CÓ TRỢ GIÚP: suy camera từ ĐƯỜNG CHÂN TRỜI do user kéo trong ảnh.
 *
 * Đường chân trời = tập tia song song mặt sàn (không bao giờ chạm sàn).
 * Với camera nhìn -Z nghiêng xuống θ, tia tại NDC y = ny có
 *   dir.y = ny·tan(fov/2)·cosθ − sinθ
 * Chân trời ⇔ dir.y = 0 ⇒ **tan θ = ny_horizon · tan(fov/2)**
 *
 * Đây là thông tin mà depth *tương đối* KHÔNG cho được (mơ hồ scale + FOV),
 * nên ta lấy trực tiếp từ user — nhanh, tất định, không cần model lớn.
 */
export function solveCameraFromHorizon(opts: {
  /** NDC y của đường chân trời: -1 = đáy ảnh, +1 = đỉnh ảnh. */
  horizonNdcY: number;
  aspect: number;
  fovYRad?: number;
  heightM?: number;
}): CameraModel {
  const fovYRad = opts.fovYRad ?? DEFAULT_FOV_Y;
  const heightM = opts.heightM ?? 1.4;
  const pitchRad = Math.atan(opts.horizonNdcY * Math.tan(fovYRad / 2));
  return { fovYRad, aspect: opts.aspect, heightM, pitchRad };
}

/** NDC y của đường chân trời ứng với một camera (nghịch đảo của hàm trên). */
export function horizonNdcYFromCamera(cam: CameraModel): number {
  return Math.tan(cam.pitchRad) / Math.tan(cam.fovYRad / 2);
}
