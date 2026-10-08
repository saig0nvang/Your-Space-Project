import { expect, test } from "vitest";
import type { Mask } from "../mask/mask";
import type { CameraModel } from "../types";
import { floorGridFor, floorMaskFromDepth, floorPartOfMask, floorPointToNdc, floorTopByColumn, sampleFromFloorGrid, warpToFloorGrid, worldToNdc } from "./floor-rectify";
import { floorViewZ } from "./occlusion";
import { pointOnHorizontalPlane } from "./placement";

const cam: CameraModel = { fovYRad: (60 * Math.PI) / 180, aspect: 4 / 3, heightM: 1.5, pitchRad: (20 * Math.PI) / 180 };

test("floorPointToNdc là nghịch đảo của pointOnHorizontalPlane ở y=0; điểm sau máy → null", () => {
  for (const ndc of [{ x: 0, y: -0.5 }, { x: 0.7, y: -0.9 }, { x: -0.4, y: 0.1 }]) {
    const p = pointOnHorizontalPlane(ndc, cam, 0)!;
    const back = floorPointToNdc(p.x, p.z, cam)!;
    expect(back.x).toBeCloseTo(ndc.x, 6);
    expect(back.y).toBeCloseTo(ndc.y, 6);
  }
  expect(floorPointToNdc(0, 3, cam)).toBeNull();
});

const W = 80;
const H = 60;
const rect = (x0: number, y0: number, x1: number, y1: number): Mask => {
  const data = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) data[y * W + x] = 1;
  return { width: W, height: H, data };
};

test("floorTopByColumn: cột có mask lấy chân tường nội suy từ cột không mask hai bên", () => {
  // Chân tường dốc: hàng 20 ở cột 0 → hàng 40 ở cột 79; dưới đó là sàn. Một vệt nhiễu "sàn" lẻ trên tường.
  const floor = new Uint8Array(W * H);
  const base = (x: number) => 20 + (20 * x) / (W - 1);
  for (let x = 0; x < W; x++) for (let y = Math.ceil(base(x)); y < H; y++) floor[y * W + x] = 1;
  floor[5 * W + 10] = 1;
  const hole = rect(30, 10, 50, 50); // vật che chân tường ở cột 30..49
  const top = floorTopByColumn({ width: W, height: H, data: floor }, hole);
  for (const x of [30, 40, 49]) expect(Math.abs(top[x]! - base(x))).toBeLessThan(1.5);
  expect(top[10]).toBeCloseTo(Math.ceil(base(10)), 6); // nhiễu lẻ không kéo chân tường lên
});

test("floorTopByColumn: không thấy sàn ở cột lân cận → không có sàn (H)", () => {
  const top = floorTopByColumn({ width: W, height: H, data: new Uint8Array(W * H) }, rect(30, 10, 50, 50));
  expect(top[40]).toBe(H);
});

test("floorGridFor phủ dấu chân mask trên sàn; điểm quá xa → null", () => {
  const hole = rect(30, 40, 50, 55);
  const g = floorGridFor(hole, cam, 256)!;
  expect(g.size).toBe(256);
  for (const [x, y] of [[30, 40], [49, 54]] as const) {
    const p = pointOnHorizontalPlane({ x: ((x + 0.5) / W) * 2 - 1, y: 1 - ((y + 0.5) / H) * 2 }, cam, 0)!;
    const c = (p.x - g.x0) / g.cell;
    const r = (p.z - g.zFar) / g.cell;
    expect(c).toBeGreaterThan(0); expect(c).toBeLessThan(256);
    expect(r).toBeGreaterThan(0); expect(r).toBeLessThan(256);
  }
  expect(floorGridFor(rect(30, 12, 50, 14), cam, 256)).toBeNull(); // sát chân trời (~60 m)
});

test("warp sang lưới sàn rồi lấy lại: tái tạo ảnh có kết cấu theo sàn, mask lỗ phủ đủ", () => {
  // Ảnh bàn cờ vẽ TRÊN SÀN (ô 0,25 m) — sau nắn thẳng là bàn cờ thẳng, lấy lại phải ra gần đúng ảnh gốc.
  const img = { width: W, height: H, data: new Uint8ClampedArray(W * H * 4) };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = pointOnHorizontalPlane({ x: ((x + 0.5) / W) * 2 - 1, y: 1 - ((y + 0.5) / H) * 2 }, cam, 0);
    const v = p ? 60 + 40 * Math.sin(p.x * 3) + 40 * Math.cos(p.z * 3) : 0;
    img.data.set([v, v, v, 255], (y * W + x) * 4);
  }
  const hole = rect(30, 40, 50, 55);
  const g = floorGridFor(hole, cam, 256)!;
  const warped = warpToFloorGrid(img, hole, g, cam);
  let holeCells = 0;
  for (const v of warped.hole.data) holeCells += v;
  expect(holeCells).toBeGreaterThan(0);
  const out = { width: W, height: H, data: new Uint8ClampedArray(W * H * 4) };
  sampleFromFloorGrid(warped.image, g, cam, hole, out);
  let err = 0, n = 0;
  for (let k = 0; k < W * H; k++) {
    if (!hole.data[k]) { expect(out.data[k * 4]).toBe(0); continue; }
    err += Math.abs((out.data[k * 4] ?? 0) - (img.data[k * 4] ?? 0)); n++;
  }
  expect(err / n).toBeLessThan(3);
});

test("floorMaskFromDepth: sàn đúng mô hình là sàn; vật trước sàn và vùng trên chân trời thì không", () => {
  const data = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const zf = floorViewZ(((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, cam);
    const z = zf === null ? 0 : x >= 30 && x < 50 && y >= 40 ? zf * 0.6 : zf;
    data[y * W + x] = z ? 1 / z : 0.01; // fit a=1, b=0
  }
  const m = floorMaskFromDepth({ width: W, height: H, data }, { a: 1, b: 0, confidence: 1, samples: 1 }, cam);
  expect(m.data[50 * W + 10]).toBe(1);
  expect(m.data[50 * W + 40]).toBe(0);
  expect(m.data[2 * W + 10]).toBe(0);
});

test("floorPartOfMask: chỉ giữ pixel mask dưới chân tường; mask sàn ở độ phân giải thấp hơn ảnh", () => {
  // Sàn (ảnh 2× nhỏ hơn): chân tường ngang ở hàng 15 của 30 → hàng 30 của ảnh 60.
  const floor = { width: W / 2, height: H / 2, data: new Uint8Array((W / 2) * (H / 2)) };
  for (let y = 15; y < H / 2; y++) for (let x = 0; x < W / 2; x++) floor.data[y * (W / 2) + x] = 1;
  const part = floorPartOfMask(rect(30, 10, 50, 50), floor);
  expect(part.data[29 * W + 40]).toBe(0);
  expect(part.data[30 * W + 40]).toBe(1);
  expect(part.data[49 * W + 40]).toBe(1);
  expect(part.data[55 * W + 40]).toBe(0); // ngoài mask
});

test("worldToNdc là nghịch đảo của pointOnHorizontalPlane ở mặt y bất kỳ", () => {
  const p = pointOnHorizontalPlane({ x: 0.3, y: -0.2 }, cam, 0.7)!;
  const back = worldToNdc(p.x, 0.7, p.z, cam)!;
  expect(back.x).toBeCloseTo(0.3, 6);
  expect(back.y).toBeCloseTo(-0.2, 6);
});
