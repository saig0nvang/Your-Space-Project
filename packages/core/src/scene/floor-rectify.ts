import type { Mask } from "../mask/mask";
import type { CameraModel } from "../types";
import { buildOccluderDepth, floorViewZ, type DisparityMap, type FloorFit } from "./occlusion";
import { pointOnHorizontalPlane } from "./placement";

/**
 * Lấp sàn trong ảnh NẮN THẲNG (nhìn từ trên xuống), theo Geomagical/IKEA (arXiv 2210.15796): LaMa thấy vân sàn
 * thẳng, đều cỡ thay vì co dần theo phối cảnh. Chỉ làm cho SÀN — chưa có bố cục tường.
 */

/** Ảnh RGBA xen kênh (như ImageData). */
export type Rgba = { width: number; height: number; data: Uint8ClampedArray | Uint8Array };

/** Lưới vuông trên sàn: ô (c, r) có tâm X = x0 + (c+0,5)·cell, Z = zFar + (r+0,5)·cell (r = 0 xa máy nhất). */
export type FloorGrid = { x0: number; zFar: number; cell: number; size: number };

/** Mask có điểm sàn xa hơn `MAX_FLOOR_DIST_H` lần chiều cao máy → không nắn (một pixel ảnh phủ quá nhiều ô lưới). */
const MAX_FLOOR_DIST_H = 8;

/** NDC của điểm sàn (X, 0, Z) — nghịch đảo của pointOnHorizontalPlane ở y = 0. null nếu điểm ở sau máy. */
export const floorPointToNdc = (X: number, Z: number, cam: CameraModel) => worldToNdc(X, 0, Z, cam);

/** NDC của điểm thế giới (X, Y, Z) — nghịch đảo của pointOnHorizontalPlane ở mặt y = Y. null nếu điểm ở sau máy. */
export function worldToNdc(X: number, Y: number, Z: number, cam: CameraModel): { x: number; y: number } | null {
  const c = Math.cos(-cam.pitchRad);
  const s = Math.sin(-cam.pitchRad);
  const wy = Y - cam.heightM;
  const ly = wy * c + Z * s; // xoay ngược phép xoay của worldRay
  const lz = -wy * s + Z * c;
  if (lz > -1e-6) return null;
  const t = Math.tan(cam.fovYRad / 2);
  return { x: X / -lz / (t * cam.aspect), y: ly / -lz / t };
}

const ndcOf = (x: number, y: number, w: number, h: number) => ({ x: ((x + 0.5) / w) * 2 - 1, y: 1 - ((y + 0.5) / h) * 2 });

/**
 * Lưới `size`² ô bao dấu chân trên sàn của mask (pixel ảnh, cùng tỉ lệ khung với `cam`), cạnh gấp đôi phần rộng nhất
 * — như cropSquare, nửa còn lại làm ngữ cảnh. null nếu mask rỗng, có pixel không chạm sàn hoặc quá xa.
 */
export function floorGridFor(mask: Mask, cam: CameraModel, size: number): FloorGrid | null {
  const { width: w, height: h, data } = mask;
  let xMin = Infinity, xMax = -Infinity, zMin = Infinity, zMax = -Infinity;
  const maxDist = MAX_FLOOR_DIST_H * cam.heightM;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!data[y * w + x]) continue;
      const p = pointOnHorizontalPlane(ndcOf(x, y, w, h), cam, 0);
      if (!p || Math.hypot(p.x, p.z) > maxDist) return null;
      if (p.x < xMin) xMin = p.x;
      if (p.x > xMax) xMax = p.x;
      if (p.z < zMin) zMin = p.z;
      if (p.z > zMax) zMax = p.z;
    }
  }
  if (xMin > xMax) return null;
  const side = 2 * Math.max(xMax - xMin, zMax - zMin, 1e-3);
  return { x0: (xMin + xMax - side) / 2, zFar: (zMin + zMax - side) / 2, cell: side / size, size };
}

/**
 * Hàng chân tường (đỉnh vùng sàn) cho từng cột ảnh: cột có mask nội suy tuyến tính giữa trung vị `win` cột không mask
 * gần nhất hai bên; cột không mask lấy hàng trên cùng mở đầu một đoạn sàn liền ≥ 3 hàng (bỏ nhiễu lẻ). = h nếu không thấy sàn.
 * Pixel mask ở hàng ≥ giá trị này là sàn. Cột lân cận bị đồ khác che chân tường → ước lượng thấp hơn thật (an toàn: phần đó
 * đi đường lấp thường).
 */
export function floorTopByColumn(floor: Mask, hole: Mask, win = 5): Float32Array {
  const { width: w, height: h } = floor;
  const top = new Float32Array(w).fill(h);
  const masked = new Uint8Array(w);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) if (hole.data[y * w + x]) { masked[x] = 1; break; }
    if (masked[x]) continue;
    let run = 0;
    for (let y = h - 1; y >= 0; y--) {
      run = floor.data[y * w + x] ? run + 1 : 0;
      if (run >= 3) top[x] = y;
    }
  }
  const side = (x: number, dir: -1 | 1): { at: number; v: number } | null => {
    const vals: number[] = [];
    const cols: number[] = [];
    for (let i = x + dir; i >= 0 && i < w && vals.length < win; i += dir) {
      if (masked[i]) continue;
      vals.push(top[i]!);
      cols.push(i);
    }
    if (!vals.length) return null;
    vals.sort((a, b) => a - b);
    return { at: cols.reduce((a, b) => a + b, 0) / cols.length, v: vals[vals.length >> 1]! };
  };
  const out = top.slice();
  for (let x = 0; x < w; x++) {
    if (!masked[x]) continue;
    const l = side(x, -1);
    const r = side(x, 1);
    if (l && r) out[x] = l.v + ((r.v - l.v) * (x - l.at)) / (r.at - l.at);
    else out[x] = (l ?? r)?.v ?? h;
  }
  return out;
}

/** Lấy mẫu song tuyến tại toạ độ liên tục (tâm pixel i ở i + 0,5), kẹp mép. */
function bilinear(img: Rgba, u: number, v: number, out: Uint8ClampedArray, o: number): void {
  const { width: w, height: h, data } = img;
  const fx = Math.min(Math.max(u - 0.5, 0), w - 1);
  const fy = Math.min(Math.max(v - 0.5, 0), h - 1);
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, w - 1), y1 = Math.min(y0 + 1, h - 1);
  const ax = fx - x0, ay = fy - y0;
  for (let c = 0; c < 3; c++) {
    const a = data[(y0 * w + x0) * 4 + c]! * (1 - ax) + data[(y0 * w + x1) * 4 + c]! * ax;
    const b = data[(y1 * w + x0) * 4 + c]! * (1 - ax) + data[(y1 * w + x1) * 4 + c]! * ax;
    out[o + c] = a * (1 - ay) + b * ay;
  }
  out[o + 3] = 255;
}

/**
 * Ảnh + mask lỗ chiếu sang lưới sàn. Ô lỗ = một trong 4 pixel nguồn quanh nó thuộc lỗ (lỗ trong lưới không hụt khi
 * ảnh bị phóng). Ô ra ngoài khung ảnh lấy pixel mép (kẹp) — ponytail: vệt kéo dài ở mép làm ngữ cảnh kém; thay bằng
 * phản chiếu nếu mask sát mép ảnh hay hỏng.
 */
export function warpToFloorGrid(img: Rgba, hole: Mask, grid: FloorGrid, cam: CameraModel): { image: Rgba; hole: Mask } {
  const n = grid.size;
  const { width: w, height: h } = img;
  const data = new Uint8ClampedArray(n * n * 4);
  const holeData = new Uint8Array(n * n);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const k = r * n + c;
      const ndc = floorPointToNdc(grid.x0 + (c + 0.5) * grid.cell, grid.zFar + (r + 0.5) * grid.cell, cam);
      if (!ndc) { data[k * 4 + 3] = 255; continue; }
      const u = ((ndc.x + 1) / 2) * w;
      const v = ((1 - ndc.y) / 2) * h;
      bilinear(img, u, v, data, k * 4);
      const x0 = Math.floor(u - 0.5), y0 = Math.floor(v - 0.5);
      for (let dy = 0; dy <= 1; dy++) {
        for (let dx = 0; dx <= 1; dx++) {
          const x = x0 + dx, y = y0 + dy;
          if (x >= 0 && x < w && y >= 0 && y < h && hole.data[y * w + x]) holeData[k] = 1;
        }
      }
    }
  }
  return { image: { width: n, height: n, data }, hole: { width: n, height: n, data: holeData } };
}

/** Ghi vào `out` (cỡ ảnh) màu lấy từ lưới sàn đã lấp, chỉ tại pixel thuộc `floorHole`. */
export function sampleFromFloorGrid(filled: Rgba, grid: FloorGrid, cam: CameraModel, floorHole: Mask, out: Rgba): void {
  const { width: w, height: h } = floorHole;
  const px = new Uint8ClampedArray(4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (!floorHole.data[k]) continue;
      const p = pointOnHorizontalPlane(ndcOf(x, y, w, h), cam, 0);
      if (!p) continue;
      bilinear(filled, ((p.x - grid.x0) / grid.cell) * (filled.width / grid.size), ((p.z - grid.zFar) / grid.cell) * (filled.height / grid.size), px, 0);
      out.data[k * 4] = px[0]!;
      out.data[k * 4 + 1] = px[1]!;
      out.data[k * 4 + 2] = px[2]!;
      out.data[k * 4 + 3] = 255;
    }
  }
}

/** Mask "là sàn" từ depth đã khớp sàn: dưới chân trời và không có vật nào trước mặt sàn (cùng tiêu chí buildOccluderDepth). */
export function floorMaskFromDepth(disp: DisparityMap, fit: FloorFit, cam: CameraModel, floorTolerance?: number): Mask {
  const { width: w, height: h } = disp;
  const occ = buildOccluderDepth(disp, fit, cam, { floorTolerance });
  const data = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const n = ndcOf(i, j, w, h);
      if (!occ[j * w + i] && floorViewZ(n.x, n.y, cam) !== null) data[j * w + i] = 1;
    }
  }
  return { width: w, height: h, data };
}

/**
 * Phần SÀN của mask lỗ (cỡ ảnh): pixel ở dưới chân tường nội suy (floorTopByColumn) trên `floor` — mask sàn từ depth,
 * độ phân giải bất kỳ cùng tỉ lệ khung. Một ô depth thuộc lỗ khi có bất kỳ pixel lỗ nào rơi vào nó.
 */
export function floorPartOfMask(hole: Mask, floor: Mask): Mask {
  const { width: w, height: h } = hole;
  const { width: dw, height: dh } = floor;
  const col = (x: number) => Math.floor((x * dw) / w);
  const holeD = new Uint8Array(dw * dh);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (hole.data[y * w + x]) holeD[Math.floor((y * dh) / h) * dw + col(x)] = 1;
  const top = floorTopByColumn(floor, { width: dw, height: dh, data: holeD });
  const data = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (hole.data[k] && ((y + 0.5) * dh) / h >= top[col(x)]!) data[k] = 1;
    }
  }
  return { width: w, height: h, data };
}
