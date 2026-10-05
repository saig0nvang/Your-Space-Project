/** Đường chéo khung 35 mm (36 × 24 mm). */
const DIAG_35 = Math.hypot(36, 24);

/**
 * FOV dọc từ tiêu cự tương đương 35 mm (EXIF FocalLengthIn35mmFormat).
 * Tiêu cự tương đương giữ nguyên góc nhìn theo ĐƯỜNG CHÉO, nên chiều cao cảm biến tương đương
 * = đường chéo 35 mm / √(1 + aspect²) với aspect = rộng / cao của ảnh đã xoay đúng chiều.
 */
export function fovYFromFocal35(focal35mm: number | null | undefined, aspect: number): number | null {
  if (focal35mm == null || !(focal35mm > 8) || !(focal35mm < 300) || !(aspect > 0)) return null;
  const heightMm = DIAG_35 / Math.sqrt(1 + aspect * aspect);
  return 2 * Math.atan(heightMm / (2 * focal35mm));
}
