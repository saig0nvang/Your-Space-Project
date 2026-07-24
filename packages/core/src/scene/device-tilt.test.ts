import { expect, test } from "vitest";
import { solveCameraFromDeviceTilt } from "./device-tilt";
import { horizonNdcYFromCamera } from "./horizon";

const deg = (rad: number) => (rad * 180) / Math.PI;

test("máy dựng đứng (beta=90) → camera nằm ngang", () => {
  const cam = solveCameraFromDeviceTilt({ betaDeg: 90, aspect: 4 / 3 });
  expect(deg(cam.pitchRad)).toBeCloseTo(0, 5);
});

test("chúc máy xuống (beta=70) → pitch 20°", () => {
  const cam = solveCameraFromDeviceTilt({ betaDeg: 70, aspect: 4 / 3 });
  expect(deg(cam.pitchRad)).toBeCloseTo(20, 5);
});

test("landscape dùng gamma thay beta", () => {
  const cam = solveCameraFromDeviceTilt({
    betaDeg: 0,
    gammaDeg: -70,
    screenAngleDeg: 90,
    aspect: 4 / 3,
  });
  expect(deg(cam.pitchRad)).toBeCloseTo(20, 5);
});

test("chặn giá trị vô lý (máy úp thẳng xuống)", () => {
  const cam = solveCameraFromDeviceTilt({ betaDeg: 0, aspect: 4 / 3 });
  expect(deg(cam.pitchRad)).toBeLessThanOrEqual(85);
});

test("nối được với hình học chân trời: pitch → chân trời hợp lệ", () => {
  const cam = solveCameraFromDeviceTilt({ betaDeg: 75, aspect: 4 / 3 });
  const hz = horizonNdcYFromCamera(cam);
  expect(hz).toBeGreaterThan(0); // chúc xuống → chân trời nằm trên tâm ảnh
  expect(Number.isFinite(hz)).toBe(true);
});
