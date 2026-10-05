import { expect, test } from "vitest";
import { fovYFromFocal35 } from "./exif-fov";

const deg = (r: number) => (r * 180) / Math.PI;

test("26 mm, ảnh dọc 3:4 → FOV dọc ≈ 67,3°", () => {
  expect(deg(fovYFromFocal35(26, 3 / 4)!)).toBeCloseTo(67.3, 0);
});

test("26 mm, ảnh ngang 4:3 → FOV dọc ≈ 53,1°", () => {
  expect(deg(fovYFromFocal35(26, 4 / 3)!)).toBeCloseTo(53.1, 0);
});

test("thiếu hoặc vô lý → null", () => {
  expect(fovYFromFocal35(undefined, 1)).toBeNull();
  expect(fovYFromFocal35(null, 1)).toBeNull();
  expect(fovYFromFocal35(0, 1)).toBeNull();
  expect(fovYFromFocal35(500, 1)).toBeNull();
});
