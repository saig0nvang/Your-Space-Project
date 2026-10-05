import { expect, test } from "vitest";
import { floorFitFailed } from "./useSceneDepth";

test("floorFitFailed: depth 'ready' của ảnh CŨ (ngay sau xóa/hoàn tác) không báo lỗi", () => {
  expect(floorFitFailed({ status: "ready", forUrl: "blob:cu" }, "blob:moi", false)).toBe(false);
});

test("floorFitFailed: depth xong cho đúng ảnh mà không có occluder → báo", () => {
  expect(floorFitFailed({ status: "ready", forUrl: "blob:a" }, "blob:a", false)).toBe(true);
  expect(floorFitFailed({ status: "ready", forUrl: "blob:a" }, "blob:a", true)).toBe(false);
  expect(floorFitFailed({ status: "running", forUrl: "blob:a" }, "blob:a", false)).toBe(false);
});
