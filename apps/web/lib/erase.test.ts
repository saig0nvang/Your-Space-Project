import { expect, test } from "vitest";
import { binarizeMask, sendSize } from "./erase";

test("sendSize: co cạnh dài về 1024, giữ tỉ lệ; ô nhỏ giữ nguyên", () => {
  expect(sendSize(1600, 1600)).toEqual({ w: 1024, h: 1024 });
  expect(sendSize(1600, 800)).toEqual({ w: 1024, h: 512 });
  expect(sendSize(600, 900)).toEqual({ w: 600, h: 900 });
});

test("binarizeMask: chỉ còn 0 hoặc 255, alpha 255", () => {
  const px = new Uint8ClampedArray([127, 127, 127, 40, 128, 128, 128, 200, 0, 0, 0, 0, 255, 255, 255, 255]);
  binarizeMask(px);
  expect(Array.from(px)).toEqual([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
});
