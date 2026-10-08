import { expect, test } from "vitest";
import type { CameraModel } from "../types";
import type { DisparityMap } from "./occlusion";
import { pixelRayDir } from "./ray";
import { floorPointToNdc } from "./floor-rectify";
import { estimateWalls, keepInFrontOfWalls, keepOnVisibleFloor, nearestWall, snapToWall, wallGuide, yawFacingAway, type Wall } from "./walls";

const cam: CameraModel = { fovYRad: (60 * Math.PI) / 180, aspect: 4 / 3, heightM: 1.5, pitchRad: (12 * Math.PI) / 180 };

/** Disparity (= 1/z view) của phòng hộp: sàn y=0, trần 2,6, tường sau z=−4, trái x=−2, phải x=1,8; sofa thấp giữa phòng. */
function boxRoom(w = 160, h = 120): DisparityMap {
  const data = new Float32Array(w * h);
  const c = Math.cos(-cam.pitchRad), s = Math.sin(-cam.pitchRad);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const d = pixelRayDir(((i + 0.5) / w) * 2 - 1, 1 - ((j + 0.5) / h) * 2, cam.fovYRad, cam.aspect);
      const wx = d.x, wy = d.y * c - d.z * s, wz = d.y * s + d.z * c;
      const ts: number[] = [];
      if (wy < 0) ts.push(-cam.heightM / wy);
      if (wy > 0) ts.push((2.6 - cam.heightM) / wy);
      if (wz < 0) ts.push(-4 / wz);
      if (wx < 0) ts.push(-2 / wx);
      if (wx > 0) ts.push(1.8 / wx);
      if (wz < 0) { // sofa: hộp x∈[−1,1], z∈[−3,2;−2,5], y ≤ 0,9 — mặt trước z = −2,5
        const t = -2.5 / wz;
        const x = wx * t, y = cam.heightM + wy * t;
        if (Math.abs(x) <= 1 && y <= 0.9 && y >= 0) ts.push(t);
      }
      const t = Math.min(...ts.filter((v) => v > 0));
      data[j * w + i] = 1 / (t * -d.z);
    }
  }
  return { width: w, height: h, data };
}

test("estimateWalls tìm đủ tường sau/trái/phải của phòng hộp", () => {
  const walls = estimateWalls(boxRoom(), { a: 1, b: 0, confidence: 1, samples: 0 }, cam);
  const find = (nx: number, nz: number) => walls.find((wl) => wl.nx * nx + wl.nz * nz > 0.98);
  const off = (nx: number, nz: number, d: number) => Math.abs((find(nx, nz)?.d ?? Infinity) - d);
  expect(off(0, 1, -4)).toBeLessThan(0.15); // tường sau z = −4, pháp tuyến hướng về máy (+z)
  expect(off(1, 0, -2)).toBeLessThan(0.15);
  expect(off(-1, 0, -1.8)).toBeLessThan(0.15);
});

const back: Wall = { nx: 0, nz: 1, d: -4, t0: -2, t1: 2.5 };

test("nearestWall + yawFacingAway: món gần tường sau quay mặt ra phòng (yaw 0)", () => {
  expect(nearestWall([back], 0, -3.5, 1.2)).toBe(back);
  expect(nearestWall([back], 0, -1, 1.2)).toBeNull(); // quá xa
  expect(nearestWall([back], 5, -3.5, 1.2)).toBeNull(); // ngoài đoạn tường
  expect(yawFacingAway(back)).toBeCloseTo(0);
  expect(yawFacingAway({ nx: 1, nz: 0, d: -2, t0: -4, t1: 0 })).toBeCloseTo(Math.PI / 2); // tường trái → quay sang phải
});

test("keepInFrontOfWalls: kéo lấn tường thì bị đẩy ra vừa chạm, xa tường thì giữ nguyên", () => {
  const p = keepInFrontOfWalls([back], 0, -3.9, 0, 1.6, 0.4);
  expect(p.z).toBeCloseTo(-3.8); // tâm cách tường nửa chiều sâu
  expect(keepInFrontOfWalls([back], 0, -3.9, Math.PI / 2, 1.6, 0.4).z).toBeCloseTo(-3.2); // xoay 90°: nửa chiều rộng
  expect(keepInFrontOfWalls([back], 0.3, -2, 0, 1.6, 0.4)).toEqual({ x: 0.3, z: -2 });
});

test("snapToWall: gần tường thì xoay lưng vào và áp sát; xa thì giữ nguyên góc", () => {
  const left: Wall = { nx: 1, nz: 0, d: -2, t0: -4, t1: 0 };
  const p = snapToWall([left], -1.6, -2, 0, 1.6, 0.4, 0.25); // lưng cách tường 0,2 ≤ 0,25
  expect(p.yawRad).toBeCloseTo(Math.PI / 2);
  expect(p.x).toBeCloseTo(-1.8); // lưng chạm tường x = −2
  expect(p.wall).toBe(left);
  const [a, b] = wallGuide(left, p.x, p.z, 1.6); // trên chân tường x = −2, dài 1,7 × rộng, quanh z = −2
  expect(a[0]).toBeCloseTo(-2); expect(b[0]).toBeCloseTo(-2);
  expect(Math.abs(a[1] - b[1])).toBeCloseTo(1.6 * 1.7); expect((a[1] + b[1]) / 2).toBeCloseTo(-2);
  expect(snapToWall([left], 0, -2, 0.3, 1.6, 0.4, 0.25)).toEqual({ x: 0, z: -2, yawRad: 0.3 });
});

test("keepOnVisibleFloor: chân món ra sau mép sàn (trông như treo trên tường) bị kéo về; trên sàn thì để nguyên", () => {
  const edge = { top: new Float32Array(80).fill(60), rows: 120 }; // mép sàn ở giữa ảnh, mọi cột
  const far = keepOnVisibleFloor(edge, cam, 0.5, -20, 0, 1, 0.4);
  const ndc = floorPointToNdc(far.x, far.z, cam)!;
  expect(ndc.y).toBeLessThan(0); // chân giờ ở dưới mép sàn (nửa dưới ảnh)
  expect(far.x / far.z).toBeCloseTo(0.5 / -20); // kéo theo đúng hướng nhìn
  expect(keepOnVisibleFloor(edge, cam, 0, -2, 0, 1, 0.4)).toEqual({ x: 0, z: -2 });
  expect(keepOnVisibleFloor({ top: new Float32Array(80).fill(120), rows: 120 }, cam, 0, -20, 0, 1, 0.4)).toEqual({ x: 0, z: -20 });
  // tủ dài xoay 90°: cạnh dài chĩa theo hướng nhìn → phải lùi thêm nửa chiều dài
  const long = keepOnVisibleFloor(edge, cam, 0, -20, Math.PI / 2, 2.4, 0.5);
  const short = keepOnVisibleFloor(edge, cam, 0, -20, 0, 2.4, 0.5);
  expect(short.z - long.z).toBeCloseTo(-(1.2 - 0.25), 5);
});
