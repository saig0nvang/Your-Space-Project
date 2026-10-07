import { expect, test } from "vitest";
import {
  cleanObjectMask, cropSquare, dilateMask, emptyMask, extendDown, maskArea, maskBBox, prepareEraseMask, unionMasks, type Mask,
} from "./mask";

const withPixels = (w: number, h: number, pts: Array<[number, number]>): Mask => {
  const m = emptyMask(w, h);
  for (const [x, y] of pts) m.data[y * w + x] = 1;
  return m;
};

test("unionMasks gộp, sai kích thước thì ném lỗi", () => {
  const u = unionMasks([withPixels(4, 4, [[0, 0]]), withPixels(4, 4, [[3, 3]])]);
  expect(maskArea(u)).toBe(2);
  expect(() => unionMasks([emptyMask(4, 4), emptyMask(5, 4)])).toThrow();
  expect(() => unionMasks([])).toThrow();
});

test("dilateMask nới vuông bán kính r", () => {
  expect(maskArea(dilateMask(withPixels(9, 9, [[4, 4]]), 1))).toBe(9);
  expect(maskArea(dilateMask(withPixels(9, 9, [[0, 0]]), 2))).toBe(9); // bị cắt ở góc
});

test("extendDown kéo xuống, không vượt đáy", () => {
  const m = extendDown(withPixels(3, 5, [[1, 2]]), 5);
  expect(maskBBox(m)).toEqual({ x: 1, y: 2, w: 1, h: 3 });
});

test("maskBBox của mask rỗng là null", () => {
  expect(maskBBox(emptyMask(3, 3))).toBeNull();
});

test("prepareEraseMask: nới + kéo bóng cho món ở nửa dưới, gộp vùng cũ", () => {
  const W = 200, H = 100;
  const low = withPixels(W, H, [[50, 80]]); // nửa dưới
  const high = withPixels(W, H, [[150, 10]]); // nửa trên
  const prev = withPixels(W, H, [[0, 0]]);
  const m = prepareEraseMask([low, high], prev);
  // r = round(0,012·200) = 2; kéo xuống round(0,025·100) = 3 (rồi nới, nên vẫn tới đáy vùng nới)
  const lowBox = maskBBox(unionMasks([prepareEraseMask([low], null)]))!;
  expect(lowBox.y + lowBox.h).toBe(80 + 2 + 3 + 1);
  const highBox = maskBBox(prepareEraseMask([high], null))!;
  expect(highBox.h).toBe(5); // chỉ nới, không kéo
  expect(m.data[0]).toBe(1);
});

test("cropSquare: ô 512 quanh bbox nhỏ, kẹp trong ảnh; bbox quá lớn → cả ảnh", () => {
  expect(cropSquare({ x: 10, y: 10, w: 20, h: 20 }, 1600, 1200)).toEqual({ x: 0, y: 0, w: 512, h: 512 });
  expect(cropSquare({ x: 700, y: 500, w: 100, h: 100 }, 1600, 1200)).toEqual({ x: 494, y: 294, w: 512, h: 512 });
  expect(cropSquare({ x: 0, y: 0, w: 1500, h: 100 }, 1600, 1200)).toEqual({ x: 0, y: 0, w: 1600, h: 1200 });
});

test("cleanObjectMask: bỏ mảng rời không chứa điểm chạm, lấp lỗ (khe nan sofa)", () => {
  // 7×5: mảng chính cột 1..4 (có lỗ ở (2,2)); mảng rời ở cột 6; chạm tại (1,1)
  const m = withPixels(7, 5, [
    [1, 1], [2, 1], [3, 1], [4, 1],
    [1, 2], /* lỗ (2,2) */ [3, 2], [4, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
    [6, 2],
  ]);
  const c = cleanObjectMask(m, [{ x: 1, y: 1 }]);
  expect(c.data[2 * 7 + 2]).toBe(1); // lỗ đã lấp
  expect(c.data[2 * 7 + 6]).toBe(0); // mảng rời đã bỏ
  expect(maskArea(c)).toBe(12);
});

test("cleanObjectMask: điểm chạm trượt khỏi mask → giữ mảng lớn nhất", () => {
  const m = withPixels(6, 3, [[0, 0], [1, 0], [2, 0], [5, 2]]);
  expect(maskArea(cleanObjectMask(m, [{ x: 4, y: 1 }]))).toBe(3);
});
