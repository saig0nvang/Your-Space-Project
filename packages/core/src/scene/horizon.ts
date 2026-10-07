import type { CameraModel } from "../types";
import { pointOnHorizontalPlane } from "./placement";

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

/** FOV của GeoCalib chỉ tin khi độ bất định ≤ 10° (spike 2026-10-04: trung vị ~10,7°, có ảnh lệch 25°). */
export const MAX_TRUSTED_VFOV_UNCERTAINTY_RAD = (10 * Math.PI) / 180;

/**
 * Đường chân trời (NDC y) từ hướng trọng lực của GeoCalib. GeoCalib: pitch ÂM = máy chúc xuống; core: pitchRad DƯƠNG
 * = chúc xuống. Tính bằng FOV của chính GeoCalib để đường nằm đúng chỗ trên ảnh; camera của app sau đó giải lại pitch
 * theo FOV app dùng (EXIF hoặc mặc định). Kẹp [-0,94; 0,94] như đường kéo tay.
 */
export function horizonFromGravity(g: { pitchRad: number; vfovRad: number }): number {
  const ny = Math.tan(-g.pitchRad) / Math.tan(g.vfovRad / 2);
  return Math.min(0.94, Math.max(-0.94, ny));
}

/**
 * Chiều cao máy (m) từ một vật đứng thẳng đã biết chiều cao (vd cửa đi 2,1 m): người dùng chạm chân rồi đỉnh vật.
 * Mọi khoảng cách trong cảnh tỷ lệ thuận với chiều cao máy, nên giải với máy cao 1 m: chân vật chạm sàn tại P, tia qua
 * đỉnh vật cắt đường thẳng đứng qua P ở độ cao y; chiều cao máy = chiều cao vật / y. null khi chạm không hợp lệ.
 * Cùng cách "vật đã biết kích thước làm thước" của Kreativ (US20200302686A1, bước S570).
 */
export function cameraHeightFromVerticalObject(
  bottomNdc: { x: number; y: number },
  topNdc: { x: number; y: number },
  cam: CameraModel,
  objectHeightM: number,
): number | null {
  if (topNdc.y <= bottomNdc.y) return null;
  const unit = { ...cam, heightM: 1 };
  const foot = pointOnHorizontalPlane(bottomNdc, unit, 0);
  if (!foot) return null;
  const t = Math.tan(cam.fovYRad / 2);
  const c = Math.cos(-cam.pitchRad), s = Math.sin(-cam.pitchRad);
  const lx = topNdc.x * t * cam.aspect, ly = topNdc.y * t, lz = -1;
  const dir = { x: lx, y: ly * c - lz * s, z: ly * s + lz * c };
  const reach = Math.hypot(foot.x, foot.z);
  const along = Math.hypot(dir.x, dir.z);
  if (along < 1e-9) return null;
  const yTop = 1 + (reach / along) * dir.y;
  return yTop > 1e-3 ? objectHeightM / yTop : null;
}
