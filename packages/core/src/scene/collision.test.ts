import { expect, test } from "vitest";
import { separateFromOthers, separation, type Footprint } from "./collision";

const box = (x: number, z: number, w = 1, d = 1, yaw = 0): Footprint => ({ x, z, yaw, w, d });

test("separation: không chồng → null; chồng → đẩy theo trục lấn ít nhất, vừa hết chồng", () => {
  expect(separation(box(0, 0), box(2, 0))).toBeNull();
  const s = separation(box(0.8, 0.1), box(0, 0))!; // lấn 0,2 theo x, 0,9 theo z → đẩy +x
  expect(s.x).toBeCloseTo(0.21);
  expect(s.z).toBeCloseTo(0);
  expect(separation(box(0.8 + s.x, 0.1 + s.z), box(0, 0))).toBeNull();
});

test("separation: món xoay 45° — hình vuông xoay chạm góc thì tách theo trục của nó", () => {
  const a = box(1.1, 0, 1, 1, Math.PI / 4); // bán kính theo x = √2/2 ≈ 0,707 → lấn 0,107
  const s = separation(a, box(0, 0))!;
  expect(separation({ ...a, x: a.x + s.x, z: a.z + s.z }, box(0, 0))).toBeNull();
  expect(Math.hypot(s.x, s.z)).toBeLessThan(0.2);
});

test("separateFromOthers: kẹt giữa hai món thì đẩy ra khỏi cả hai nếu được", () => {
  const p = separateFromOthers(box(0, 0.5), [box(-0.6, 0), box(0.6, 0)]);
  for (const b of [box(-0.6, 0), box(0.6, 0)]) expect(separation(box(p.x, p.z), b)).toBeNull();
  expect(separateFromOthers(box(5, 5), [box(0, 0)])).toEqual({ x: 5, z: 5 });
});
