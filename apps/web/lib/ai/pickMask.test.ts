import { expect, test } from "vitest";
import { pickMask } from "./pickMask";

test("bỏ mask sàn/tường quá lớn, lấy mask lớn nhất còn lại", () => {
  // 100 px ảnh: mask 2 (60%) là sàn → chọn mask 1 (20%), không phải mask 0 (5%, một tấm đệm)
  expect(pickMask([5, 20, 60], [0.9, 0.8, 0.95], 100)).toBe(1);
});

test("mọi mask đều quá lớn → lấy điểm cao nhất", () => {
  expect(pickMask([50, 70, 90], [0.7, 0.9, 0.8], 100)).toBe(1);
});
