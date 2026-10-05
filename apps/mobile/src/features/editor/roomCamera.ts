/**
 * Máy ảnh khớp ảnh phòng — phần "hiểu phòng" giả lập cho bước đặt đồ kiểu IKEA (món là mô hình 3D dựng bằng máy ảo trùng
 * máy thật). Toạ độ thế giới: mét, trục Y hướng lên, sàn là mặt y = 0, máy ở (0, độ cao, 0) nhìn về phía −Z.
 * Dùng chung cho: vị trí món 3D, khung món trên ảnh (dò chạm, số đo, thanh tác vụ) và lớp dựng 3D (three.js).
 */
import type { Calibration, RoomCamera } from '@/types';

export type Vec3 = { x: number; y: number; z: number };

/** Góc nhìn dọc mặc định khi chưa đo được máy ảnh (ảnh không phải ảnh mẫu): ống kính chính của điện thoại để dọc. */
const DEFAULT_FOV_Y_DEG = 67;

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Máy ảnh của không gian: số đo từ ảnh (ảnh mẫu — giả lập kết quả AI) hoặc ước lượng từ đường chân trời người dùng chỉnh
 * ở C6 với góc nhìn mặc định. Đường chân trời nằm trên tâm ảnh nghĩa là máy đang chúc xuống.
 */
export function roomCamera(cal: Calibration): RoomCamera {
  if (cal.camera) return cal.camera;
  const f = 0.5 / Math.tan(rad(DEFAULT_FOV_Y_DEG) / 2);
  const horizon = cal.horizonY ?? cal.floorLineY - 0.22;
  return { f, cx: 0.5, cy: 0.5, pitchDeg: (Math.atan((0.5 - horizon) / f) * 180) / Math.PI, rollDeg: 0 };
}

/** Ba trục của máy trong toạ độ thế giới: nhìn tới (F), phải (R), lên (U). */
function basis(cam: RoomCamera): { F: Vec3; R: Vec3; U: Vec3 } {
  const p = rad(cam.pitchDeg);
  const r = rad(cam.rollDeg);
  const F = { x: 0, y: -Math.sin(p), z: -Math.cos(p) };
  const U0 = { x: 0, y: Math.cos(p), z: -Math.sin(p) };
  const R = { x: Math.cos(r), y: U0.y * Math.sin(r), z: U0.z * Math.sin(r) };
  const U = { x: -Math.sin(r), y: U0.y * Math.cos(r), z: U0.z * Math.cos(r) };
  return { F, R, U };
}

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

/**
 * Chiếu điểm thế giới lên ảnh: (u, v) chuẩn hoá 0..1 theo khung ảnh. `aspect` = rộng / cao của ảnh.
 * null khi điểm nằm sau máy.
 */
export function projectPoint(cam: RoomCamera, heightM: number, aspect: number, P: Vec3): { u: number; v: number } | null {
  const { F, R, U } = basis(cam);
  const d = { x: P.x, y: P.y - heightM, z: P.z };
  const zc = dot(d, F);
  if (zc <= 0.01) return null;
  return { u: cam.cx + ((cam.f / aspect) * dot(d, R)) / zc, v: cam.cy - (cam.f * dot(d, U)) / zc };
}

/** Điểm trên sàn (y = 0) ứng với điểm (u, v) trên ảnh; null khi (u, v) nằm trên đường chân trời. */
export function floorPointAt(cam: RoomCamera, heightM: number, aspect: number, u: number, v: number): Vec3 | null {
  const { F, R, U } = basis(cam);
  const a = ((u - cam.cx) * aspect) / cam.f;
  const b = (cam.cy - v) / cam.f;
  const dir = { x: F.x + R.x * a + U.x * b, y: F.y + R.y * a + U.y * b, z: F.z + R.z * a + U.z * b };
  if (dir.y >= -1e-4) return null;
  const t = heightM / -dir.y;
  return { x: dir.x * t, y: 0, z: dir.z * t };
}

/** Khung bao của mô hình (m, theo trục của mô hình; mặt trước món hướng +Z, chân món ở y = 0). */
export type ModelBounds = { minX: number; maxX: number; minZ: number; maxZ: number; height: number };

/** Hướng thật của món: trục phòng (song song với tường, như thước xoay 0° của IKEA) cộng góc người dùng xoay. */
export function itemYaw(cam: RoomCamera, rotationYDeg: number): number {
  return rad((cam.roomYawDeg ?? 0) + rotationYDeg);
}

/** Tâm khung bao trên mặt sàn và nửa bề ngang / nửa bề sâu, theo trục của mô hình. */
function footprint(bounds: ModelBounds) {
  return {
    cx: (bounds.minX + bounds.maxX) / 2,
    cz: (bounds.minZ + bounds.maxZ) / 2,
    hx: (bounds.maxX - bounds.minX) / 2,
    hz: (bounds.maxZ - bounds.minZ) / 2,
  };
}

/** Đổi điểm (lx, lz) theo trục mô hình sang toạ độ thế giới (xoay quanh trục đứng một góc yaw, như three.js). */
function rotateY(lx: number, lz: number, yaw: number) {
  return { x: lx * Math.cos(yaw) + lz * Math.sin(yaw), z: -lx * Math.sin(yaw) + lz * Math.cos(yaw) };
}

/**
 * Vị trí đặt mô hình: (x, y) của món là **tâm mặt đáy** của món trên ảnh (điểm sàn ngay dưới tâm món), nên xoay là xoay
 * tại chỗ như IKEA. Món luôn đúng kích thước thật (không có tỷ lệ). Trả về gốc mô hình (m) và góc xoay quanh trục đứng.
 */
export function modelPlacement(
  item: { x: number; y: number; rotationYDeg: number },
  bounds: ModelBounds,
  cam: RoomCamera,
  heightM: number,
  aspect: number,
): { origin: Vec3; yaw: number } | null {
  const center = floorPointAt(cam, heightM, aspect, item.x, Math.max(item.y, cam.cy + 0.01));
  if (!center) return null;
  const yaw = itemYaw(cam, item.rotationYDeg);
  const fp = footprint(bounds);
  const o = rotateY(fp.cx, fp.cz, yaw);
  return { origin: { x: center.x - o.x, y: 0, z: center.z - o.z }, yaw };
}

/** Khung chữ nhật trên ảnh (chuẩn hoá) bao trọn khối hộp của mô hình đã đặt — để dò chạm, số đo, thanh tác vụ. */
export function projectedBounds(
  placement: { origin: Vec3; yaw: number },
  bounds: ModelBounds,
  cam: RoomCamera,
  heightM: number,
  aspect: number,
): { u0: number; v0: number; u1: number; v1: number } | null {
  const { origin, yaw } = placement;
  let u0 = Infinity;
  let v0 = Infinity;
  let u1 = -Infinity;
  let v1 = -Infinity;
  for (const x of [bounds.minX, bounds.maxX]) {
    for (const z of [bounds.minZ, bounds.maxZ]) {
      for (const y of [0, bounds.height]) {
        const w = rotateY(x, z, yaw);
        const q = projectPoint(cam, heightM, aspect, { x: origin.x + w.x, y, z: origin.z + w.z });
        if (!q) return null;
        u0 = Math.min(u0, q.u);
        v0 = Math.min(v0, q.v);
        u1 = Math.max(u1, q.u);
        v1 = Math.max(v1, q.v);
      }
    }
  }
  return { u0, v0, u1, v1 };
}

// ── Tường thật (mặt phẳng đứng dựng từ chân tường trên ảnh) — món 3D va, hít, không xuyên tường.

/** Một đoạn chân tường trên sàn (m): hai đầu, hướng, pháp tuyến chỉ vào trong phòng (phía máy). */
type WallSeg = { a: Vec3; dir: { x: number; z: number }; len: number; n: { x: number; z: number }; openA: boolean; openB: boolean };

/** Khoảng hít vào tường khi kéo món 3D (m). */
const WALL_SNAP_M = 0.15;

/** Các đoạn tường từ chân tường AI nhận ra (không có thì là một đường sàn ngang). Đầu đoạn ở mép ảnh coi như kéo dài mãi. */
export function wallSegments(cal: { floorLineY: number; wallBase?: [number, number][]; cameraHeightM: number }, cam: RoomCamera, aspect: number): WallSeg[] {
  const pts: [number, number][] =
    cal.wallBase && cal.wallBase.length >= 2
      ? cal.wallBase.map(([u, d]) => [u, cal.floorLineY + d])
      : [
          [0, cal.floorLineY],
          [1, cal.floorLineY],
        ];
  const segs: WallSeg[] = [];
  for (let i = 1; i < pts.length; i++) {
    const A = floorPointAt(cam, cal.cameraHeightM, aspect, pts[i - 1][0], pts[i - 1][1]);
    const B = floorPointAt(cam, cal.cameraHeightM, aspect, pts[i][0], pts[i][1]);
    if (!A || !B) continue;
    const dx = B.x - A.x;
    const dz = B.z - A.z;
    const len = Math.hypot(dx, dz);
    if (len < 1e-3) continue;
    const dir = { x: dx / len, z: dz / len };
    let n = { x: -dir.z, z: dir.x };
    // Pháp tuyến hướng về phía máy (gốc toạ độ): đó là phía trong phòng.
    if (n.x * -A.x + n.z * -A.z < 0) n = { x: -n.x, z: -n.z };
    segs.push({ a: A, dir, len, n, openA: pts[i - 1][0] <= 0.001, openB: pts[i][0] >= 0.999 });
  }
  return segs;
}

/**
 * Đặt tâm đáy món 3D tại điểm (u, v) trên ảnh rồi giữ trong phòng: món (hình chữ nhật đáy đã xoay) không xuyên bức tường
 * nào; cách tường ≤ WALL_SNAP_M thì hít vào, lưng áp sát tường (`snap`). Trả về điểm trên ảnh và đã áp tường chưa.
 */
export function clampFootprint(
  u: number,
  v: number,
  bounds: ModelBounds,
  rotationYDeg: number,
  cal: { floorLineY: number; wallBase?: [number, number][]; cameraHeightM: number },
  cam: RoomCamera,
  aspect: number,
  snap: boolean,
): { x: number; y: number; againstWall: boolean } {
  const h = cal.cameraHeightM;
  const C = floorPointAt(cam, h, aspect, u, Math.max(v, cam.cy + 0.02)) ?? floorPointAt(cam, h, aspect, u, 0.98)!;
  const yaw = itemYaw(cam, rotationYDeg);
  const fp = footprint(bounds);
  const ex = rotateY(1, 0, yaw);
  const ez = rotateY(0, 1, yaw);
  const segs = wallSegments(cal, cam, aspect);
  let against = false;
  for (let pass = 0; pass < 3; pass++) {
    for (const s of segs) {
      // Nửa bề dày của đáy món theo pháp tuyến tường, và khoảng cách từ tâm đáy tới tường.
      const e = fp.hx * Math.abs(ex.x * s.n.x + ex.z * s.n.z) + fp.hz * Math.abs(ez.x * s.n.x + ez.z * s.n.z);
      const t = (C.x - s.a.x) * s.dir.x + (C.z - s.a.z) * s.dir.z;
      const reach = e + 0.05;
      if ((!s.openA && t < -reach) || (!s.openB && t > s.len + reach)) continue;
      const d = (C.x - s.a.x) * s.n.x + (C.z - s.a.z) * s.n.z;
      const limit = snap ? e + WALL_SNAP_M : e;
      if (d < limit) {
        C.x += s.n.x * (e - d);
        C.z += s.n.z * (e - d);
        against = true;
      }
    }
  }
  const q = projectPoint(cam, h, aspect, C);
  return q ? { x: q.u, y: q.v, againstWall: against } : { x: u, y: v, againstWall: against };
}
