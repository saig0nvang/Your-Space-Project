/** Chân đế món trên sàn: hình chữ nhật tâm (x, z), rộng `w` theo trục +X và sâu `d` theo trục +Z khi xoay `yaw` = 0. */
export type Footprint = { x: number; z: number; yaw: number; w: number; d: number };

const axes = (f: Footprint): [number, number][] => [
  [Math.cos(f.yaw), -Math.sin(f.yaw)], // trục rộng (cùng quy ước keepInFrontOfWalls)
  [Math.sin(f.yaw), Math.cos(f.yaw)], // trục sâu
];
const radius = (f: Footprint, n: [number, number]) => {
  const [u, v] = axes(f);
  return (Math.abs(u[0] * n[0] + u[1] * n[1]) * f.w + Math.abs(v[0] * n[0] + v[1] * n[1]) * f.d) / 2;
};

/**
 * Vector đẩy `a` ra khỏi `b` (định lý trục phân tách cho 2 hình chữ nhật xoay): trục có độ lấn nhỏ nhất, thêm 1 cm.
 * null nếu không chồng lên nhau.
 */
export function separation(a: Footprint, b: Footprint): { x: number; z: number } | null {
  let best: { n: [number, number]; overlap: number } | null = null;
  for (const n of [...axes(a), ...axes(b)]) {
    const dist = (b.x - a.x) * n[0] + (b.z - a.z) * n[1];
    const overlap = radius(a, n) + radius(b, n) - Math.abs(dist);
    if (overlap <= 0) return null;
    if (!best || overlap < best.overlap) best = { n: dist > 0 ? [-n[0], -n[1]] : n, overlap };
  }
  const k = best!.overlap + 0.01;
  return { x: best!.n[0] * k, z: best!.n[1] * k };
}

/**
 * Đẩy món `a` ra khỏi mọi món khác (như Kreativ kiểm va chạm khi kéo): lặp vài lượt vì đẩy khỏi món này có thể lấn món
 * kia. Món không tách được (kẹt giữa nhiều món) thì dừng ở lượt cuối.
 */
export function separateFromOthers(a: Footprint, others: readonly Footprint[], passes = 4): { x: number; z: number } {
  let { x, z } = a;
  for (let p = 0; p < passes; p++) {
    let moved = false;
    for (const b of others) {
      const s = separation({ ...a, x, z }, b);
      if (!s) continue;
      x += s.x;
      z += s.z;
      moved = true;
    }
    if (!moved) break;
  }
  return { x, z };
}
