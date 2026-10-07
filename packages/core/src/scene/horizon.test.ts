import { expect, test } from "vitest";
import { horizonNdcYFromCamera, solveCameraFromHorizon, horizonFromGravity, cameraHeightFromVerticalObject } from "./horizon";
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

test("horizonFromGravity: GeoCalib pitch âm (chúc xuống) → chân trời phía trên giữa ảnh; khớp ngược solveCameraFromHorizon", () => {
  const vfov = (89.7 * Math.PI) / 180;
  const ny = horizonFromGravity({ pitchRad: -0.2805, vfovRad: vfov });
  expect(ny).toBeCloseTo(Math.tan(0.2805) / Math.tan(vfov / 2), 6);
  expect(ny).toBeGreaterThan(0);
  const cam = solveCameraFromHorizon({ horizonNdcY: ny, aspect: 4 / 3, fovYRad: vfov });
  expect(cam.pitchRad).toBeCloseTo(0.2805, 6);
});

test("horizonFromGravity: kẹp trong [-0,94; 0,94] như đường kéo tay", () => {
  expect(horizonFromGravity({ pitchRad: -1.2, vfovRad: 0.5 })).toBe(0.94);
  expect(horizonFromGravity({ pitchRad: 1.2, vfovRad: 0.5 })).toBe(-0.94);
});

test("cameraHeightFromVerticalObject: chạm chân + đỉnh cửa 2,1 m → khôi phục chiều cao máy", () => {
  const truth = { fovYRad: (60 * Math.PI) / 180, aspect: 4 / 3, heightM: 1.5, pitchRad: 0.25 };
  // Chiếu điểm thế giới (camera ở (0,h,0) nhìn −Z, chúc xuống pitch) ra NDC — dùng riêng cho test.
  const project = (p: { x: number; y: number; z: number }) => {
    const dy = p.y - truth.heightM;
    const c = Math.cos(truth.pitchRad), s = Math.sin(truth.pitchRad);
    const yc = dy * c - p.z * s, zc = dy * s + p.z * c; // thế giới → camera (nghịch đảo phép quay của worldRay)
    const t = Math.tan(truth.fovYRad / 2);
    return { x: p.x / (-zc * t * truth.aspect), y: yc / (-zc * t) };
  };
  const bottom = project({ x: 0.6, y: 0, z: -3.2 });
  const top = project({ x: 0.6, y: 2.1, z: -3.2 });
  const cam = { ...truth, heightM: 1 }; // chiều cao máy chưa biết
  expect(cameraHeightFromVerticalObject(bottom, top, cam, 2.1)).toBeCloseTo(1.5, 3);
});

test("cameraHeightFromVerticalObject: chạm ngược (đỉnh dưới chân) hoặc chân trên chân trời → null", () => {
  const cam = { fovYRad: 1, aspect: 1, heightM: 1, pitchRad: 0.2 };
  expect(cameraHeightFromVerticalObject({ x: 0, y: -0.2 }, { x: 0, y: -0.5 }, cam, 2.1)).toBeNull();
  expect(cameraHeightFromVerticalObject({ x: 0, y: 0.9 }, { x: 0, y: 0.95 }, cam, 2.1)).toBeNull();
});
