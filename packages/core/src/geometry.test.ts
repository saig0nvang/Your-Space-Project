import { expect, test } from "vitest";
import { cross, dot, normalize, sub } from "./geometry";

test("dot + normalize", () => {
  expect(dot({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 })).toBe(32);
  const n = normalize({ x: 0, y: 3, z: 4 });
  expect(n.y).toBeCloseTo(0.6);
  expect(n.z).toBeCloseTo(0.8);
});

test("sub", () => {
  expect(sub({ x: 5, y: 5, z: 5 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 4, y: 3, z: 2 });
});

test("cross vuông góc hai vector", () => {
  const c = cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
  expect(c).toEqual({ x: 0, y: 0, z: 1 });
});
