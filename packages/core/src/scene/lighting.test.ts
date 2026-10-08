import { expect, test } from "vitest";
import { brightSpot, imageStats, keyLightDir, lightingFromImageStats } from "./lighting";

const solid = (r: number, g: number, b: number, n = 16) => {
  const px = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) px.set([r, g, b, 255], i * 4);
  return imageStats(px, n, 1);
};

test("xám 18% (sRGB 118) → exposure ≈ 1", () => {
  expect(lightingFromImageStats(solid(118, 118, 118)).exposure).toBeCloseTo(1, 1);
});

test("ảnh đen → exposure kẹp 0,25; ảnh trắng → kẹp 1,8", () => {
  expect(lightingFromImageStats(solid(0, 0, 0)).exposure).toBe(0.25);
  expect(lightingFromImageStats(solid(255, 255, 255)).exposure).toBe(1.8);
});

test("ảnh ấm → đèn ấm (r > b); ảnh trung tính → đèn trắng", () => {
  const warm = lightingFromImageStats(solid(200, 150, 100)).color;
  expect(warm.r).toBeGreaterThan(warm.b);
  const grey = lightingFromImageStats(solid(128, 128, 128)).color;
  expect(grey).toEqual({ r: 1, g: 1, b: 1 });
});

test("brightSpot: cửa sổ sáng góc trên trái → tâm ở trái-trên; ảnh đều → null", () => {
  const w = 40, h = 30;
  const px = new Uint8ClampedArray(w * h * 4);
  for (let k = 0; k < w * h; k++) {
    const x = k % w, y = Math.floor(k / w);
    const v = x < 8 && y < 10 ? 255 : 90;
    px.set([v, v, v, 255], k * 4);
  }
  const s = brightSpot(px, w, h)!;
  expect(s.x).toBeLessThan(-0.5);
  expect(s.y).toBeGreaterThan(0.2);
  expect(brightSpot(new Uint8ClampedArray(w * h * 4).fill(128), w, h)).toBeNull();
});

test("keyLightDir: nguồn sáng bên trái → đèn từ trái (x < 0), độ cao trong 35–65°", () => {
  const cam = { fovYRad: (60 * Math.PI) / 180, aspect: 4 / 3, heightM: 1.5, pitchRad: (10 * Math.PI) / 180 };
  const d = keyLightDir({ x: -0.8, y: 0.2 }, cam);
  expect(d.x).toBeLessThan(0);
  const el = (Math.asin(d.y) * 180) / Math.PI;
  expect(el).toBeGreaterThanOrEqual(35 - 1e-9);
  expect(el).toBeLessThanOrEqual(65 + 1e-9);
  expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(1);
});
