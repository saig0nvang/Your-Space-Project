import { expect, test } from "vitest";
import { horizonNdcYFromCamera, solveCameraFromHorizon } from "./horizon";
import { placeOnFloor } from "./placement";
import type { Calibration } from "../types";

const FOV = (60 * Math.PI) / 180;

test("chân trời giữa ảnh → camera nằm ngang (pitch 0)", () => {
  const cam = solveCameraFromHorizon({ horizonNdcY: 0, aspect: 1.5, fovYRad: FOV });
  expect(cam.pitchRad).toBeCloseTo(0, 6);
});

test("chân trời cao hơn tâm → camera chúc xuống (pitch > 0)", () => {
  const cam = solveCameraFromHorizon({ horizonNdcY: 0.3, aspect: 1.5, fovYRad: FOV });
  // tan θ = 0.3 · tan(30°) → θ ≈ 9.8°
  expect((cam.pitchRad * 180) / Math.PI).toBeCloseTo(9.83, 1);
});

test("round-trip: camera → chân trời → camera", () => {
  const cam = solveCameraFromHorizon({ horizonNdcY: 0.42, aspect: 1.5, fovYRad: FOV });
  expect(horizonNdcYFromCamera(cam)).toBeCloseTo(0.42, 6);
});

test("điểm càng gần chân trời càng xa camera", () => {
  const cam = solveCameraFromHorizon({ horizonNdcY: 0.25, aspect: 1.5, fovYRad: FOV, heightM: 1.4 });
  const calib: Calibration = { camera: cam, floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 }, confidence: 1 };
  const dims = { widthM: 2, heightM: 0.8, depthM: 0.9 };
  const near = placeOnFloor({ x: 0, y: -0.6 }, calib, dims); // gần đáy ảnh
  const far = placeOnFloor({ x: 0, y: 0.1 }, calib, dims); // sát chân trời hơn
  expect(Math.abs(near.position.z)).toBeLessThan(Math.abs(far.position.z));
  expect(near.position.y).toBeCloseTo(0, 6);
});
