import type { Mask } from "../mask/mask";
import type { CameraModel } from "../types";
import { floorPointToNdc } from "./floor-rectify";

/** Vật đã có trên sàn (đồ đã bày), coi như hình tròn bán kính `radiusM` quanh tâm. */
export type FloorObstacle = { x: number; z: number; radiusM: number };

/** Chỉ xét sàn trong `MAX_DIST_H` lần chiều cao máy — xa hơn thì món đặt vào nhỏ xíu, depth gần chân trời kém tin. */
const MAX_DIST_H = 6;

/**
 * Chỗ thả đồ trên sàn trống, như worker "drop-locations"/"poles-of-inaccessibility" của IKEA Kreativ: lưới nhìn từ
 * trên xuống (ô `cellM` mét), ô trống = chiếu vào trong ảnh, trúng `floor` (mask sàn cỡ bất kỳ, cùng tỉ lệ khung với
 * `cam`) và ngoài mọi vật cản; khoảng hở mỗi ô = khoảng cách tới ô không trống gần nhất (chamfer 2 lượt).
 * Trong các ô hở ≥ `needM` (vừa món), lấy ô có ảnh gần tâm vùng sàn nhìn thấy nhất — chỗ rộng nhất thường là sàn
 * sát máy, đặt đó món che cả phòng. Không ô nào vừa → ô hở nhất. null nếu không có ô trống nào.
 */
export function findFreeFloorSpot(
  floor: Mask,
  cam: CameraModel,
  obstacles: readonly FloorObstacle[],
  needM: number,
  cellM = 0.1,
): { x: number; z: number; clearanceM: number } | null {
  const R = MAX_DIST_H * cam.heightM;
  const cols = Math.ceil((2 * R) / cellM);
  const rows = Math.ceil(R / cellM);
  const at = (c: number, r: number) => ({ x: -R + (c + 0.5) * cellM, z: -(r + 0.5) * cellM }); // r = 0 sát máy
  const dist = new Float32Array(cols * rows); // 0 = không trống
  const ndcs = new Float32Array(cols * rows * 2);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = at(c, r);
      if (Math.hypot(p.x, p.z) > R) continue;
      if (obstacles.some((o) => Math.hypot(p.x - o.x, p.z - o.z) < o.radiusM)) continue;
      const ndc = floorPointToNdc(p.x, p.z, cam);
      if (!ndc || Math.abs(ndc.x) >= 1 || Math.abs(ndc.y) >= 1) continue;
      const i = Math.min(floor.width - 1, Math.floor(((ndc.x + 1) / 2) * floor.width));
      const j = Math.min(floor.height - 1, Math.floor(((1 - ndc.y) / 2) * floor.height));
      if (!floor.data[j * floor.width + i]) continue;
      dist[r * cols + c] = Infinity;
      ndcs[(r * cols + c) * 2] = ndc.x;
      ndcs[(r * cols + c) * 2 + 1] = ndc.y;
    }
  }
  const relax = (k: number, n: number, w: number) => {
    if (n >= 0 && n < dist.length && dist[n]! + w < dist[k]!) dist[k] = dist[n]! + w;
  };
  // Ô ngoài lưới coi là không trống: ô ở mép lưới bị chặn ở 1 ô.
  const edge = (c: number, r: number) => c === 0 || r === 0 || c === cols - 1 || r === rows - 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = r * cols + c;
      if (!dist[k]) continue;
      if (edge(c, r)) { dist[k] = Math.min(dist[k]!, 1); continue; }
      relax(k, k - 1, 1); relax(k, k - cols, 1); relax(k, k - cols - 1, Math.SQRT2); relax(k, k - cols + 1, Math.SQRT2);
    }
  }
  let best = -1;
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const k = r * cols + c;
      if (!dist[k]) continue;
      if (!edge(c, r)) { relax(k, k + 1, 1); relax(k, k + cols, 1); relax(k, k + cols + 1, Math.SQRT2); relax(k, k + cols - 1, Math.SQRT2); }
    }
  }
  for (let k = 0; k < dist.length; k++) if (dist[k]! > (best < 0 ? 0 : dist[best]!)) best = k;
  if (best < 0) return null;
  let tx = 0, ty = 0, n = 0; // tâm vùng sàn trên ảnh
  for (let j = 0; j < floor.height; j++) {
    for (let i = 0; i < floor.width; i++) {
      if (!floor.data[j * floor.width + i]) continue;
      tx += ((i + 0.5) / floor.width) * 2 - 1;
      ty += 1 - ((j + 0.5) / floor.height) * 2;
      n++;
    }
  }
  let bestD = Infinity;
  for (let k = 0; k < dist.length; k++) {
    if (dist[k]! * cellM < needM) continue;
    const d = Math.hypot(ndcs[k * 2]! - tx / n, ndcs[k * 2 + 1]! - ty / n);
    if (d < bestD) { bestD = d; best = k; }
  }
  const p = at(best % cols, Math.floor(best / cols));
  return { ...p, clearanceM: dist[best]! * cellM };
}
