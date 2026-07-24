import { expect, test } from "vitest";
import { cameraToThree } from "./to-three";

test("fovYRad → fovDeg và vị trí camera theo chiều cao", () => {
  const p = cameraToThree({ fovYRad: Math.PI / 3, aspect: 1.5, heightM: 1.4, pitchRad: 0.3 });
  expect(p.fovDeg).toBeCloseTo(60, 1);
  expect(p.position[1]).toBeCloseTo(1.4, 2);
  expect(p.rotationXRad).toBeCloseTo(-0.3, 5);
});
