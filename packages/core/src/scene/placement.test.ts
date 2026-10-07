import { expect, test } from "vitest";
import { calibrate } from "./calibration";
import { placeOnFloor, pointOnHorizontalPlane } from "./placement";
import { syntheticFloor } from "./fixtures/synthetic-floor";

test("placeOnFloor: đồ chạm sàn (y≈0), trước camera (z<0), scale≈1", () => {
  const c = calibrate(syntheticFloor().depth, {
    fovYRad: (60 * Math.PI) / 180,
    assumedCameraHeightM: 1.4,
  });
  const t = placeOnFloor({ x: 0, y: -0.4 }, c, { widthM: 2, heightM: 0.8, depthM: 0.9 });
  expect(Math.abs(t.position.y)).toBeLessThan(0.05);
  expect(t.position.z).toBeLessThan(0);
  expect(t.scale).toBeCloseTo(1, 2);
});

const cam = { fovYRad: (60 * Math.PI) / 180, aspect: 4 / 3, heightM: 1.4, pitchRad: (20 * Math.PI) / 180 };

test("pointOnHorizontalPlane: mặt y=0 trùng placeOnFloor; mặt cao hơn cho điểm gần hơn", () => {
  const ndc = { x: 0.2, y: -0.3 };
  const onFloor = placeOnFloor(ndc, { camera: cam, floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 }, confidence: 1 }, { widthM: 0, heightM: 0, depthM: 0 }).position;
  const p0 = pointOnHorizontalPlane(ndc, cam, 0)!;
  expect(p0.x).toBeCloseTo(onFloor.x, 6);
  expect(p0.z).toBeCloseTo(onFloor.z, 6);
  const half = pointOnHorizontalPlane(ndc, cam, 0.7)!; // nửa độ cao máy → nửa khoảng cách
  expect(half.z).toBeCloseTo(onFloor.z / 2, 6);
  expect(half.y).toBeCloseTo(0.7, 6);
});

test("pointOnHorizontalPlane: tia không chạm mặt phẳng (trên chân trời, hoặc mặt cao hơn máy) → null", () => {
  expect(pointOnHorizontalPlane({ x: 0, y: 0.9 }, cam, 0)).toBeNull();
  expect(pointOnHorizontalPlane({ x: 0, y: -0.5 }, cam, 2)).toBeNull();
});
