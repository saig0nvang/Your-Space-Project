export type ImageStats = { meanLuminance: number; meanColor: { r: number; g: number; b: number } };
export type PhotoLighting = {
  exposure: number;
  ambientIntensity: number;
  keyIntensity: number;
  color: { r: number; g: number; b: number };
};

const toLinear = (c8: number): number => {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Độ sáng và màu trung bình TUYẾN TÍNH của ảnh RGBA (bỏ pixel trong suốt). */
export function imageStats(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): ImageStats {
  let r = 0, g = 0, b = 0, n = 0;
  for (let k = 0; k < width * height; k++) {
    if ((rgba[k * 4 + 3] ?? 0) === 0) continue;
    r += toLinear(rgba[k * 4] ?? 0);
    g += toLinear(rgba[k * 4 + 1] ?? 0);
    b += toLinear(rgba[k * 4 + 2] ?? 0);
    n++;
  }
  if (n === 0) return { meanLuminance: 0, meanColor: { r: 0, g: 0, b: 0 } };
  const meanColor = { r: r / n, g: g / n, b: b / n };
  return { meanLuminance: 0.2126 * meanColor.r + 0.7152 * meanColor.g + 0.0722 * meanColor.b, meanColor };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Ánh sáng cho đồ 3D theo ảnh phòng. Phơi sáng như spike: clamp((L / 0,18)^0,6; 0,25; 1,8).
 * Màu đèn = màu trung bình chuẩn hoá theo kênh lớn nhất, pha 50% với trắng để không nhuộm quá tay.
 */
export function lightingFromImageStats(s: ImageStats): PhotoLighting {
  const exposure = clamp((s.meanLuminance / 0.18) ** 0.6, 0.25, 1.8);
  const max = Math.max(s.meanColor.r, s.meanColor.g, s.meanColor.b);
  const tint = (c: number) => (max > 0 ? Math.round((0.5 + 0.5 * (c / max)) * 1000) / 1000 : 1);
  return {
    exposure,
    ambientIntensity: 0.8,
    keyIntensity: 1.6,
    color: { r: tint(s.meanColor.r), g: tint(s.meanColor.g), b: tint(s.meanColor.b) },
  };
}
