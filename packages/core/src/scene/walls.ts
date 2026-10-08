import type { CameraModel } from "../types";
import { floorMaskFromDepth, floorPointToNdc, floorTopByColumn } from "./floor-rectify";
import { floorViewZ, viewZFromDisparity, type DisparityMap, type FloorFit } from "./occlusion";
import { pointOnHorizontalPlane } from "./placement";
import { pixelRayDir } from "./ray";

/**
 * Tường = mặt thẳng đứng, nhìn từ trên xuống là đường `nx·x + nz·z = d` (pháp tuyến đơn vị hướng về máy, nên d < 0),
 * kéo dài từ t0 tới t1 theo tiếp tuyến (−nz, nx). Cùng đơn vị với `cam.heightM` lúc ước lượng (như lớp plane_polygon
 * của IKEA Kreativ, chỉ phần tường).
 */
export type Wall = { nx: number; nz: number; d: number; t0: number; t1: number };

/** Dải cao (theo bội số chiều cao máy) lấy điểm tường: trên đa số đồ (bàn ~0,75 m, sofa ~0,9 m), dưới trần. */
const BAND = [0.75, 1.6] as const;
const MAX_DIST_H = 12;
const MAX_WALLS = 3;
/** Tường sau phải gần song song/vuông góc với tường đầu (phòng "Manhattan") — loại đường xiên do đồ đạc. */
const MANHATTAN_TOL = (15 * Math.PI) / 180;
const STRIDES = [1, 7, 13, 31, 61, 127];
/** Dung sai "là sàn" khi tìm mép sàn — chặt hơn 8% của lượt che khuất, không thì sàn bò lên chân tường (tường xa ra). */
const EDGE_FLOOR_TOL = 0.03;
const EDGE_QUANTILE = 0.5;

type P = { x: number; z: number };
const tol = (p: P, h: number) => 0.04 * h + 0.03 * Math.hypot(p.x, p.z); // depth sai số tăng theo khoảng cách

/** Đường qua các điểm theo bình phương tối thiểu toàn phần (PCA), pháp tuyến hướng về máy (gốc toạ độ). */
function fitLine(pts: readonly P[]): { nx: number; nz: number; d: number } {
  let mx = 0, mz = 0;
  for (const p of pts) { mx += p.x; mz += p.z; }
  mx /= pts.length; mz /= pts.length;
  let sxx = 0, sxz = 0, szz = 0;
  for (const p of pts) { const dx = p.x - mx, dz = p.z - mz; sxx += dx * dx; sxz += dx * dz; szz += dz * dz; }
  const angle = 0.5 * Math.atan2(2 * sxz, sxx - szz); // hướng trục chính
  let nx = -Math.sin(angle), nz = Math.cos(angle);
  let d = nx * mx + nz * mz;
  if (d > 0) { nx = -nx; nz = -nz; d = -d; }
  return { nx, nz, d };
}

/** Mép sàn trên ảnh: `top[i]` = hàng trên cùng của vùng sàn ở cột i (= `rows` nếu cột không thấy sàn). */
export type FloorEdge = { top: Float32Array; rows: number };

/** Mép sàn từ depth đã khớp sàn — dung sai chặt EDGE_FLOOR_TOL để sàn không bò lên chân tường. Không phụ thuộc heightM. */
export function floorEdge(disp: DisparityMap, fit: FloorFit, cam: CameraModel): FloorEdge {
  const floor = floorMaskFromDepth(disp, fit, cam, EDGE_FLOOR_TOL);
  const { width: w, height: h } = floor;
  return { top: floorTopByColumn(floor, { width: w, height: h, data: new Uint8Array(w * h) }), rows: h };
}

/**
 * Giữ món đứng trên sàn THẤY ĐƯỢC: góc đáy nào của món (hộp `widthM` × `depthM` xoay `yawRad`) chiếu lên ảnh mà nằm
 * trên mép sàn của cột ảnh chứa nó (tức ra sau tường/đồ — trên ảnh trông như treo trên tường) thì kéo cả món về theo
 * hướng nhìn, tới vị trí xa nhất mà mọi góc còn trên sàn (chia đôi). Mỗi góc so với mép sàn của chính cột nó — món dài
 * trải qua nhiều cột, tường xiên. Đo trực tiếp trên ảnh nên chắc hơn tường ước lượng (lệch ~5–15%). Góc ra ngoài khung
 * ảnh hay rơi vào cột không thấy sàn thì bỏ qua.
 */
export function keepOnVisibleFloor(
  edge: FloorEdge, cam: CameraModel, x: number, z: number, yawRad: number, widthM: number, depthM: number,
): { x: number; z: number } {
  const w = edge.top.length;
  const c = Math.cos(yawRad), s = Math.sin(yawRad);
  const onFloor = (cx: number, cz: number) => {
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      const px = cx + (a * widthM / 2) * c + (b * depthM / 2) * s;
      const pz = cz - (a * widthM / 2) * s + (b * depthM / 2) * c;
      const ndc = floorPointToNdc(px, pz, cam);
      if (!ndc || Math.abs(ndc.x) >= 1) continue;
      const row = edge.top[Math.min(w - 1, Math.floor(((ndc.x + 1) / 2) * w))]!;
      if (row >= edge.rows) continue;
      const e = pointOnHorizontalPlane({ x: ndc.x, y: 1 - (row / edge.rows) * 2 }, cam, 0);
      if (e && Math.hypot(px, pz) > Math.hypot(e.x, e.z)) return false;
    }
    return true;
  };
  if (onFloor(x, z)) return { x, z };
  const r = Math.hypot(x, z);
  let lo = Math.min(1, (0.3 * cam.heightM) / r), hi = 1; // phần của khoảng cách tới máy; lo là sàn tối thiểu
  for (let k = 0; k < 20; k++) {
    const mid = (lo + hi) / 2;
    if (onFloor(x * mid, z * mid)) lo = mid; else hi = mid;
  }
  return { x: x * lo, z: z * lo };
}

/**
 * Điểm chân tường đo trên mặt sàn: mỗi cột ảnh lấy hàng trên cùng của vùng sàn (floorTopByColumn), chiếu xuống sàn
 * — chính xác hơn depth (chỉ dùng hình học camera), nhưng cột bị đồ che cho ra chân đồ (gần máy hơn tường).
 */
function floorEdgePoints(disp: DisparityMap, fit: FloorFit, cam: CameraModel): P[] {
  const { top, rows: h } = floorEdge(disp, fit, cam);
  const w = top.length;
  const out: P[] = [];
  for (let i = 0; i < w; i++) {
    if (top[i]! >= h) continue;
    const p = pointOnHorizontalPlane({ x: ((i + 0.5) / w) * 2 - 1, y: 1 - (top[i]! / h) * 2 }, cam, 0);
    if (p) out.push({ x: p.x, z: p.z });
  }
  return out;
}

/**
 * Ước lượng tối đa 3 tường từ depth đã khớp sàn: điểm 3D của pixel KHÔNG phải sàn trong dải cao BAND, chiếu xuống
 * mặt bằng, RANSAC tất định tìm đường nhiều điểm nhất, lặp trên phần còn lại. Đường cần ≥ 8% số điểm (ít nhất 30)
 * và cách máy ≥ 0,3·h. Hướng lấy từ depth; khoảng cách chỉnh lại theo mép sàn (depth tương đối suy từ sàn lên tường
 * hay đặt tường xa hơn thật ~10–15%): trong các điểm mép sàn sát đường (±0,6·h), lấy phân vị 25% xa máy nhất — điểm
 * gần hơn là chân đồ đứng trước tường. Rỗng nếu không đủ điểm (ảnh cận cảnh, depth kém).
 */
export function estimateWalls(disp: DisparityMap, fit: FloorFit, cam: CameraModel): Wall[] {
  const { width: w, height: hgt, data } = disp;
  const h = cam.heightM;
  const c = Math.cos(-cam.pitchRad), s = Math.sin(-cam.pitchRad);
  const step = Math.max(1, Math.round(Math.max(w, hgt) / 160));
  let pts: P[] = [];
  for (let j = 0; j < hgt; j += step) {
    for (let i = 0; i < w; i += step) {
      const z = viewZFromDisparity(fit, data[j * w + i] ?? 0);
      if (z === null || z > MAX_DIST_H * h) continue;
      const nx = ((i + 0.5) / w) * 2 - 1, ny = 1 - ((j + 0.5) / hgt) * 2;
      const zf = floorViewZ(nx, ny, cam);
      if (zf !== null && z >= zf * 0.92) continue; // chính mặt sàn (cùng tiêu chí buildOccluderDepth)
      const dir = pixelRayDir(nx, ny, cam.fovYRad, cam.aspect);
      const k = z / -dir.z;
      const yc = dir.y * k, zc = dir.z * k;
      const yw = yc * c - zc * s + h;
      if (yw < BAND[0] * h || yw > BAND[1] * h) continue;
      pts.push({ x: dir.x * k, z: yc * s + zc * c });
    }
  }
  const minInliers = Math.max(30, Math.floor(0.08 * pts.length));
  const walls: Wall[] = [];
  let edges: P[] | null = null;
  while (walls.length < MAX_WALLS && pts.length >= minInliers) {
    const n = pts.length;
    let best: { nx: number; nz: number; d: number; count: number } | null = null;
    const startStep = Math.max(1, Math.floor(n / 48));
    for (const st of STRIDES) {
      for (let a = 0; a < n; a += startStep) {
        const p = pts[a]!, q = pts[(a + st * 5 + 3) % n]!;
        const len = Math.hypot(q.x - p.x, q.z - p.z);
        if (len < 0.2 * h) continue;
        let nx = -(q.z - p.z) / len, nz = (q.x - p.x) / len;
        let d = nx * p.x + nz * p.z;
        if (d > 0) { nx = -nx; nz = -nz; d = -d; }
        if (-d < 0.3 * h) continue;
        if (walls.length) {
          const ang = Math.acos(Math.min(1, Math.abs(nx * walls[0]!.nx + nz * walls[0]!.nz)));
          if (Math.min(ang, Math.PI / 2 - ang) > MANHATTAN_TOL) continue;
        }
        let count = 0;
        for (const r of pts) if (Math.abs(nx * r.x + nz * r.z - d) <= tol(r, h)) count++;
        if (!best || count > best.count) best = { nx, nz, d, count };
      }
    }
    if (!best || best.count < minInliers) break;
    const b = best;
    const inl = pts.filter((r) => Math.abs(b.nx * r.x + b.nz * r.z - b.d) <= tol(r, h));
    const line = fitLine(inl);
    const ts = inl.map((r) => -line.nz * r.x + line.nx * r.z).sort((u, v) => u - v);
    const t0 = ts[Math.floor(ts.length * 0.05)]!, t1 = ts[Math.floor(ts.length * 0.95)]!;
    edges ??= floorEdgePoints(disp, fit, cam);
    const near = edges.flatMap((e) => {
      const t = -line.nz * e.x + line.nx * e.z, off = line.nx * e.x + line.nz * e.z;
      return t >= t0 && t <= t1 && Math.abs(off - line.d) <= 0.6 * h ? [off] : [];
    }).sort((u, v) => u - v);
    const d = near.length >= 10 ? near[Math.floor(near.length * EDGE_QUANTILE)]! : line.d;
    walls.push({ ...line, d, t0, t1 });
    pts = pts.filter((r) => Math.abs(b.nx * r.x + b.nz * r.z - b.d) > tol(r, h));
  }
  return walls;
}

/** Tường ước lượng ở chiều cao máy giả định đổi sang chiều cao thật: mọi độ dài tỉ lệ theo heightM. */
export const scaleWall = (wl: Wall, k: number): Wall => ({ ...wl, d: wl.d * k, t0: wl.t0 * k, t1: wl.t1 * k });

/** Tường gần (x, z) nhất mà điểm chiếu nằm trong đoạn tường (nới `margin`), cách ≤ `maxDist`; null nếu không có. */
export function nearestWall(walls: readonly Wall[], x: number, z: number, maxDist: number, margin = 0.3): Wall | null {
  let best: Wall | null = null, bestDist = maxDist;
  for (const wl of walls) {
    const t = -wl.nz * x + wl.nx * z;
    const dist = wl.nx * x + wl.nz * z - wl.d;
    if (t < wl.t0 - margin || t > wl.t1 + margin || dist < -margin || dist > bestDist) continue;
    best = wl;
    bestDist = dist;
  }
  return best;
}

/** Góc xoay Y để mặt trước món (+Z khi xoay 0) quay ra phòng, lưng áp về tường. */
export const yawFacingAway = (wl: Wall): number => Math.atan2(wl.nx, wl.nz);

/**
 * Đẩy tâm món (hộp rộng `widthM` × sâu `depthM`, xoay `yawRad`) ra trước mọi tường mà nó lấn, để kéo sát tường
 * không xuyên vào. Chỉ xét tường mà tâm món chiếu vào trong đoạn (nới nửa đường chéo món).
 */
export function keepInFrontOfWalls(
  walls: readonly Wall[], x: number, z: number, yawRad: number, widthM: number, depthM: number,
): { x: number; z: number } {
  const ux = Math.cos(yawRad), uz = -Math.sin(yawRad); // trục rộng (+X xoay quanh Y)
  const vx = Math.sin(yawRad), vz = Math.cos(yawRad); // trục sâu (+Z xoay quanh Y)
  const reach = Math.hypot(widthM, depthM) / 2;
  for (const wl of walls) {
    const t = -wl.nz * x + wl.nx * z;
    if (t < wl.t0 - reach || t > wl.t1 + reach) continue;
    const extent = (Math.abs(wl.nx * ux + wl.nz * uz) * widthM + Math.abs(wl.nx * vx + wl.nz * vz) * depthM) / 2;
    const dist = wl.nx * x + wl.nz * z - wl.d;
    if (dist < extent) { x += (extent - dist) * wl.nx; z += (extent - dist) * wl.nz; }
  }
  return { x, z };
}

/**
 * Hít tường khi kéo: lưng món (sâu `depthM`) cách tường gần nhất ≤ `snapM` → xoay lưng vào tường và áp sát; không thì
 * giữ góc cũ. Sau đó vẫn đẩy ra trước mọi tường (góc phòng).
 */
export function snapToWall(
  walls: readonly Wall[], x: number, z: number, yawRad: number, widthM: number, depthM: number, snapM: number,
): { x: number; z: number; yawRad: number } {
  const wl = nearestWall(walls, x, z, depthM / 2 + snapM);
  if (wl) {
    const gap = wl.nx * x + wl.nz * z - wl.d - depthM / 2;
    x -= gap * wl.nx;
    z -= gap * wl.nz;
    yawRad = yawFacingAway(wl);
  }
  return { ...keepInFrontOfWalls(walls, x, z, yawRad, widthM, depthM), yawRad };
}
