import type { CameraModel } from "../types";

/** FOV dọc mặc định cho camera chính điện thoại (~26mm equiv, khung 4:3). */
export const DEFAULT_PHONE_FOV_Y = (55 * Math.PI) / 180;
/** FOV dọc ước lượng cho ống góc siêu rộng (~13mm equiv). */
export const ULTRAWIDE_FOV_Y = (80 * Math.PI) / 180;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Suy camera từ CẢM BIẾN HƯỚNG MÁY tại thời điểm chụp (DeviceOrientationEvent).
 *
 * Đây là cách IKEA Kreativ làm được "1 ảnh là đủ": app native đọc thẳng
 * trọng lực + intrinsics từ OS, KHÔNG suy ngược từ pixel. Web làm tương tự khi
 * ảnh được CHỤP TRONG APP (upload từ thư viện thì không có dữ liệu này).
 *
 * Quy ước DeviceOrientation (portrait, camera sau hướng ra xa):
 *   beta = 90  → máy dựng đứng   → camera nằm ngang     → pitch 0
 *   beta = 0   → máy nằm ngửa    → camera chúc thẳng xuống → pitch 90°
 *   ⇒ pitch = 90 − beta
 * Landscape: vai trò front-back chuyển sang gamma ⇒ pitch = 90 − |gamma|.
 */
export function solveCameraFromDeviceTilt(opts: {
  betaDeg: number;
  gammaDeg?: number;
  /** screen.orientation.angle: 0/180 = portrait, 90/270 = landscape. */
  screenAngleDeg?: number;
  aspect: number;
  fovYRad?: number;
  heightM?: number;
}): CameraModel {
  const fovYRad = opts.fovYRad ?? DEFAULT_PHONE_FOV_Y;
  const heightM = opts.heightM ?? 1.5;
  const angle = ((opts.screenAngleDeg ?? 0) % 360 + 360) % 360;
  const isLandscape = angle === 90 || angle === 270;

  const pitchDeg = isLandscape
    ? 90 - Math.abs(opts.gammaDeg ?? 0)
    : 90 - opts.betaDeg;

  // Chặn giá trị vô lý (ngửa lên trời / úp thẳng xuống) để hình học không vỡ.
  const pitchRad = (clamp(pitchDeg, -25, 85) * Math.PI) / 180;
  return { fovYRad, aspect: opts.aspect, heightM, pitchRad };
}

/** Độ nghiêng trái-phải (roll) — dùng để nhắc user giữ máy thẳng. */
export function rollDegFromDeviceTilt(gammaDeg: number, screenAngleDeg = 0): number {
  const angle = ((screenAngleDeg % 360) + 360) % 360;
  return angle === 90 || angle === 270 ? 0 : gammaDeg;
}
