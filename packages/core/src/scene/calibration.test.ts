import { expect, test } from "vitest";
import { calibrate } from "./calibration";
import { syntheticFloor } from "./fixtures/synthetic-floor";

test("calibrate khôi phục mặt sàn + confidence hợp lý", () => {
  const { depth } = syntheticFloor();
  const c = calibrate(depth, { fovYRad: (60 * Math.PI) / 180, assumedCameraHeightM: 1.4 });
  expect(c.floor.normal.y).toBeGreaterThan(0.9); // sàn thế giới nằm ngang
  expect(c.camera.heightM).toBeCloseTo(1.4, 1); // chiều cao ép theo giả định
  expect(c.confidence).toBeGreaterThan(0.5); // đa số điểm coplanar
});

test("pitch ước lượng gần góc thật (~20°)", () => {
  const { depth, truth } = syntheticFloor();
  const c = calibrate(depth, { fovYRad: truth.fovYRad, assumedCameraHeightM: 1.4 });
  expect(c.camera.pitchRad).toBeCloseTo(truth.pitchRad, 1);
});
