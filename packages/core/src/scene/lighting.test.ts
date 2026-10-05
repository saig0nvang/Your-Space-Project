import { expect, test } from "vitest";
import { imageStats, lightingFromImageStats } from "./lighting";

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
