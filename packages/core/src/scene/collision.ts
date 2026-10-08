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

/** Mặt trên của món làm mặt đỡ (bàn, tủ): chân đế + độ cao mặt. */
export type Support = Footprint & { uid: string; top: number };

/**
 * Mặt đỡ cho món `f` (đồ trang trí đặt lên mặt tủ/bàn, như mặt "stackable" của Kreativ): tâm món nằm trong mặt trên
 * (chừa 30% bề rộng món ở mép — cho thò ra chút như đồ thật) và món không rộng hơn mặt. Nhiều mặt thì lấy mặt cao nhất.
 */
export function findSupport(f: Footprint, supports: readonly Support[]): Support | null {
  let best: Support | null = null;
  for (const s of supports) {
    const [u, v] = axes(s);
    const lu = (f.x - s.x) * u[0] + (f.z - s.z) * u[1];
    const lv = (f.x - s.x) * v[0] + (f.z - s.z) * v[1];
    const eu = radius(f, u), ev = radius(f, v); // nửa bề rộng món theo hai trục của mặt
    if (eu > s.w / 2 || ev > s.d / 2) continue;
    if (Math.abs(lu) > s.w / 2 - eu * 0.3 || Math.abs(lv) > s.d / 2 - ev * 0.3) continue;
    if (!best || s.top > best.top) best = s;
  }
  return best;
}
