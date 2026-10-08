import type { Vec3 } from "../geometry";
import type { CameraModel } from "../types";
import { pixelRayDir } from "./ray";

export type ImageStats = { meanLuminance: number; meanColor: { r: number; g: number; b: number } };
/** `keySpot`: tâm vùng sáng nổi bật (cửa sổ, đèn) theo NDC — đèn chính chiếu từ hướng đó; null = hướng mặc định. */
export type PhotoLighting = {
  exposure: number;
  ambientIntensity: number;
  keyIntensity: number;
  color: { r: number; g: number; b: number };
  keySpot?: { x: number; y: number } | null;
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

/** Tỉ lệ pixel sáng nhất coi là "nguồn sáng"; nhóm đó phải sáng gấp ≥ BRIGHT_RATIO lần trung bình ảnh mới tính. */
const BRIGHT_FRACTION = 0.03;
const BRIGHT_RATIO = 2.5;

/**
 * Tâm (NDC) vùng sáng nổi bật của ảnh — cửa sổ, đèn — như IKEA Kreativ ước lượng một đèn chính từ ảnh. Lấy 3% pixel
 * sáng nhất (độ sáng tuyến tính); null nếu nhóm đó không nổi hẳn lên (ảnh sáng đều, không thấy nguồn sáng).
 */
export function brightSpot(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): { x: number; y: number } | null {
  const n = width * height;
  const lum = new Float32Array(n);
  let mean = 0;
  for (let k = 0; k < n; k++) {
    lum[k] = 0.2126 * toLinear(rgba[k * 4] ?? 0) + 0.7152 * toLinear(rgba[k * 4 + 1] ?? 0) + 0.0722 * toLinear(rgba[k * 4 + 2] ?? 0);
    mean += lum[k]!;
  }
  mean /= n;
  const sorted = Float32Array.from(lum).sort();
  const cut = sorted[Math.floor(n * (1 - BRIGHT_FRACTION))]!;
  let sx = 0, sy = 0, sl = 0;
  for (let k = 0; k < n; k++) {
    if (lum[k]! < cut) continue;
    sx += (((k % width) + 0.5) / width) * 2 - 1;
    sy += 1 - ((Math.floor(k / width) + 0.5) / height) * 2;
    sl += lum[k]!;
  }
  const count = n - sorted.findIndex((v) => v >= cut);
  if (!count || sl / count < BRIGHT_RATIO * mean) return null;
  return { x: sx / count, y: sy / count };
}

const ELEVATION_RAD = [(55 * Math.PI) / 180, (75 * Math.PI) / 180] as const;

/**
 * Hướng (đơn vị, từ cảnh tới đèn) của đèn chính đặt theo vùng sáng: phương vị = hướng từ giữa vùng sàn trước máy
 * (cách 2,5·h) tới nguồn sáng (coi cách máy 4·h theo tia qua `spot`); độ cao kẹp 55–75° — cửa sổ thường ngang tầm mắt,
 * để thật thì bóng dài quá, mà ánh sáng cửa sổ vốn là trời phía trên chiếu xuống.
 */
export function keyLightDir(spot: { x: number; y: number }, cam: CameraModel): Vec3 {
  const d = pixelRayDir(spot.x, spot.y, cam.fovYRad, cam.aspect);
  const c = Math.cos(-cam.pitchRad), s = Math.sin(-cam.pitchRad);
  const R = 4 * cam.heightM;
  const lx = d.x * R, ly = cam.heightM + (d.y * c - d.z * s) * R, lz = (d.y * s + d.z * c) * R;
  const ox = 0, oz = -2.5 * cam.heightM;
  const az = Math.atan2(lx - ox, lz - oz);
  const el = clamp(Math.atan2(ly, Math.hypot(lx - ox, lz - oz)), ELEVATION_RAD[0], ELEVATION_RAD[1]);
  return { x: Math.sin(az) * Math.cos(el), y: Math.sin(el), z: Math.cos(az) * Math.cos(el) };
}
