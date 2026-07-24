import { expect, test } from "vitest";
import { calibrate } from "./calibration";
import { placeOnFloor } from "./placement";
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
