import { expect, test } from "vitest";
import type { Mask } from "../mask/mask";
import type { CameraModel } from "../types";
import { floorPointToNdc } from "./floor-rectify";
import { findFreeFloorSpot } from "./free-spot";

const cam: CameraModel = { fovYRad: (60 * Math.PI) / 180, aspect: 4 / 3, heightM: 1.5, pitchRad: (20 * Math.PI) / 180 };
const W = 80;
const H = 60;
/** Sàn = nửa dưới ảnh, trừ các cột trong [x0, x1). */
const floor = (x0 = 0, x1 = 0): Mask => {
  const data = new Uint8Array(W * H);
  for (let y = H / 2; y < H; y++) for (let x = 0; x < W; x++) if (x < x0 || x >= x1) data[y * W + x] = 1;
  return { width: W, height: H, data };
};

test("chỗ trống nằm trên sàn thấy được, có khoảng hở", () => {
  const s = findFreeFloorSpot(floor(), cam, [], 0.4)!;
  const ndc = floorPointToNdc(s.x, s.z, cam)!;
  expect(Math.abs(ndc.x)).toBeLessThan(0.3); // sàn đối xứng → giữa ảnh
  expect(ndc.y).toBeLessThan(0);
  expect(s.clearanceM).toBeGreaterThanOrEqual(0.4);
});

test("tránh phần không phải sàn và đồ đã bày", () => {
  const left = findFreeFloorSpot(floor(0, W / 2), cam, [], 0.4)!;
  expect(floorPointToNdc(left.x, left.z, cam)!.x).toBeGreaterThan(0);
  const first = findFreeFloorSpot(floor(), cam, [], 0.4)!;
  const second = findFreeFloorSpot(floor(), cam, [{ x: first.x, z: first.z, radiusM: 0.6 }], 0.4)!;
  expect(Math.hypot(second.x - first.x, second.z - first.z)).toBeGreaterThanOrEqual(0.6 + 0.4 - 0.15); // không chồng lên
});

test("không chỗ nào vừa → chỗ hở nhất; không có sàn → null", () => {
  const s = findFreeFloorSpot(floor(), cam, [], 50)!;
  expect(s.clearanceM).toBeLessThan(50);
  expect(findFreeFloorSpot({ width: W, height: H, data: new Uint8Array(W * H) }, cam, [], 0.4)).toBeNull();
});
