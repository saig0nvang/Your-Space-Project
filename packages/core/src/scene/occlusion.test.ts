import { expect, test } from "vitest";
import type { CameraModel } from "../types";
import {
  buildOccluderDepth,
  fitDepthToFloor,
  floorViewZ,
  viewZFromDisparity,
  type DisparityMap,
} from "./occlusion";

const W = 64;
const H = 48;
const cam: CameraModel = { fovYRad: (60 * Math.PI) / 180, aspect: W / H, heightM: 1.4, pitchRad: (20 * Math.PI) / 180 };
const TRUE_A = 2;
const TRUE_B = 0.05;
const ndc = (i: number, j: number) => ({ nx: ((i + 0.5) / W) * 2 - 1, ny: 1 - ((j + 0.5) / H) * 2 });
const inBox = (i: number, j: number) => i >= 20 && i < 30 && j >= 30 && j < 40;

/** Disparity tổng hợp: sàn đúng mô hình 1/z = a·d + b; trên chân trời là tường xa; một hộp gần hơn sàn. */
function synthetic(): DisparityMap {
  const data = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const { nx, ny } = ndc(i, j);
      const zf = floorViewZ(nx, ny, cam);
      let d = 0.01;
      if (zf !== null) d = (1 / zf - TRUE_B) / TRUE_A;
      if (inBox(i, j) && zf !== null) d = (1 / (zf * 0.6) - TRUE_B) / TRUE_A; // vật cách máy 60% khoảng tới sàn
      data[j * W + i] = d;
    }
  }
  return { width: W, height: H, data };
}

test("floorViewZ: tia giữa ảnh chạm sàn ở z = h / sin(pitch)", () => {
  expect(floorViewZ(0, 0, cam)).toBeCloseTo(1.4 / Math.sin(cam.pitchRad), 3);
  expect(floorViewZ(0, 0.99, cam)).toBeNull(); // trên chân trời
});

test("fitDepthToFloor khôi phục a, b dù có vật thể lẫn vào", () => {
  const fit = fitDepthToFloor(synthetic(), cam);
  expect(fit.a).toBeCloseTo(TRUE_A, 1);
  expect(fit.b).toBeCloseTo(TRUE_B, 1);
  expect(fit.confidence).toBeGreaterThan(0.5);
});

test("viewZFromDisparity trên pixel sàn sai số < 5%", () => {
  const disp = synthetic();
  const fit = fitDepthToFloor(disp, cam);
  const i = 10, j = 44;
  const { nx, ny } = ndc(i, j);
  const zf = floorViewZ(nx, ny, cam)!;
  const z = viewZFromDisparity(fit, disp.data[j * W + i]!)!;
  expect(Math.abs(z - zf) / zf).toBeLessThan(0.05);
});

test("buildOccluderDepth: sàn = 0, hộp > 0 và gần hơn sàn", () => {
  const disp = synthetic();
  const fit = fitDepthToFloor(disp, cam);
  const occ = buildOccluderDepth(disp, fit, cam);
  expect(occ[44 * W + 10]).toBe(0);
  const i = 25, j = 35;
  const zBox = occ[j * W + i]!;
  const { nx, ny } = ndc(i, j);
  expect(zBox).toBeGreaterThan(0);
  expect(zBox).toBeLessThan(floorViewZ(nx, ny, cam)!);
});

test("quá ít điểm sàn → confidence 0", () => {
  const flat: DisparityMap = { width: 4, height: 2, data: new Float32Array(8).fill(0.5) };
  const up: CameraModel = { ...cam, pitchRad: -0.5 }; // nhìn lên: không tia nào chạm sàn
  expect(fitDepthToFloor(flat, up).confidence).toBe(0);
});
