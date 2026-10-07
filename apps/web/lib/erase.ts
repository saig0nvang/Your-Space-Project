"use client";
import {
  cropSquare, fitDepthToFloor, floorGridFor, floorMaskFromDepth, floorPartOfMask, maskArea, maskBBox, sampleFromFloorGrid,
  warpToFloorGrid, type AIError, type CameraModel, type DisparityMap, type FloorGrid, type Mask, type Result, type Rgba,
} from "@yourspace/core";
import { inpaint } from "@/lib/ai/inpaintClient";
import { canvasToBlob, loadImage } from "@/lib/image";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

/** Cạnh dài tối đa của ô gửi LaMa: ô 1024² JPEG q0.9 ≈ 0,2–0,5 MB, base64 vẫn < ~1 MB. */
export const LAMA_MAX_SIDE = 1024;

/** Kích thước gửi đi: thu nhỏ đều để cạnh dài ≤ `max` (không phóng to). */
export function sendSize(w: number, h: number, max = LAMA_MAX_SIDE): { w: number; h: number } {
  const s = Math.min(1, max / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

/** Ép mask RGBA về đúng trắng/đen (ngưỡng 128 trên kênh R), alpha 255 — không để lại viền xám sau khi co. */
export function binarizeMask(rgba: Uint8ClampedArray): void {
  for (let k = 0; k < rgba.length; k += 4) {
    const v = (rgba[k] ?? 0) >= 128 ? 255 : 0;
    rgba[k] = v; rgba[k + 1] = v; rgba[k + 2] = v; rgba[k + 3] = 255;
  }
}

/** Camera + depth của ảnh đang sửa — có thì vùng xóa nằm trọn trên sàn được lấp trong ảnh nắn thẳng. */
export type FloorHint = { camera: CameraModel; disparity: DisparityMap };

/** Cạnh lưới sàn nắn thẳng = cạnh LaMa chạy bên trong (lamaLocal), khỏi co/giãn thêm. */
const FLOOR_GRID = 512;
/**
 * Ngưỡng khớp sàn để nắn, cao hơn 0,3 của lượt che khuất: benchmark 14 ảnh mẫu (2026-10-07) — ảnh không thấy sàn
 * (giường cận cảnh) vẫn khớp 0,36–0,40 và nắn làm tệ hơn; ảnh có sàn khớp 0,43–0,66.
 */
const MIN_FLOOR_FIT = 0.4;

/**
 * Lưới nắn khi CẢ mask nằm dưới chân tường (theo depth); null → lấp thường.
 * ponytail: mask lẫn sàn + đồ/tường không nắn — ghép hai kết quả lộ ranh chéo (chân tường nội suy sai giữa hai món
 * đồ, đồ khác bị kéo dài trong lưới); cần bố cục tường/che chắn mới làm được.
 */
function floorGrid(mask: Mask, hint: FloorHint): FloorGrid | null {
  if (Math.abs(hint.camera.aspect - mask.width / mask.height) > 0.01) return null;
  const cam1 = { ...hint.camera, heightM: 1 }; // khớp sàn bất biến theo chiều cao máy (xem useSceneDepth)
  const fit = fitDepthToFloor(hint.disparity, cam1);
  if (fit.confidence < MIN_FLOOR_FIT) return null;
  if (maskArea(floorPartOfMask(mask, floorMaskFromDepth(hint.disparity, fit, cam1))) < maskArea(mask)) return null;
  return floorGridFor(mask, hint.camera, FLOOR_GRID);
}

/** Lấp trong lưới nhìn từ trên xuống rồi chiếu lại: RGBA cỡ ảnh, chỉ có màu ở pixel mask. */
async function inpaintFloorGrid(original: HTMLImageElement, mask: Mask, grid: FloorGrid, cam: CameraModel): Promise<Result<Rgba, AIError>> {
  const { width: W, height: H } = mask;
  const src = canvas(W, H).getContext("2d")!;
  src.drawImage(original, 0, 0);
  const warped = warpToFloorGrid(src.getImageData(0, 0, W, H), mask, grid, cam);
  const n = grid.size;
  const gridImg = canvas(n, n);
  gridImg.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(warped.image.data), n, n), 0, 0);
  const r = await inpaint(await canvasToBlob(gridImg, "image/jpeg", 0.9), await canvasToBlob(maskCanvas(warped.hole), "image/png"));
  if (!r.ok) return r;
  const url = URL.createObjectURL(r.value);
  const filled = await loadImage(url).finally(() => URL.revokeObjectURL(url));
  const fctx = canvas(n, n).getContext("2d")!;
  fctx.drawImage(filled, 0, 0, n, n);
  const out = { width: W, height: H, data: new Uint8ClampedArray(W * H * 4) };
  sampleFromFloorGrid(fctx.getImageData(0, 0, n, n), grid, cam, mask, out);
  return { ok: true, value: out };
}

/** Mask (1 = xóa) → canvas trắng/đen cùng kích thước. */
function maskCanvas(mask: Mask): HTMLCanvasElement {
  const c = canvas(mask.width, mask.height);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(mask.width, mask.height);
  for (let k = 0; k < mask.data.length; k++) {
    const v = mask.data[k] ? 255 : 0;
    img.data[k * 4] = v; img.data[k * 4 + 1] = v; img.data[k * 4 + 2] = v; img.data[k * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Lấp từ ẢNH GỐC với mask gộp (E5-US2): cắt ô vuông quanh mask (spike), co về cạnh dài ≤ 1024 px rồi gửi LaMa,
 * phóng kết quả về đúng ô và dán chỉ trong mask (mask gốc, viền mềm 2 px) lên ảnh gốc. Trả URL ảnh làm việc mới.
 * Có `floor` và mask nằm trọn trên sàn: lấp trong ảnh nắn thẳng nhìn từ trên xuống (floorGrid) thay vì ô vuông —
 * vẫn một lượt LaMa, cùng hợp đồng HTTP.
 */
export async function eraseWithLama(originalUrl: string, mask: Mask, floor: FloorHint | null = null): Promise<Result<string, AIError>> {
  const original = await loadImage(originalUrl);
  const W = original.naturalWidth;
  const H = original.naturalHeight;
  const bbox = maskBBox(mask);
  if (!bbox) return { ok: false, error: { kind: "VendorError", message: "Chưa chọn vùng nào" } };
  const rect = cropSquare(bbox, W, H);
  const fullMask = maskCanvas(mask);

  const maskCrop = canvas(rect.w, rect.h); // độ phân giải đầy đủ — dùng làm alpha khi dán
  maskCrop.getContext("2d")!.drawImage(fullMask, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

  // Mảnh vá = kết quả LaMa (phóng từ cỡ gửi đi về đúng kích thước ô) chỉ giữ trong mask gốc đã làm mềm viền.
  const patch = canvas(rect.w, rect.h);
  const pctx = patch.getContext("2d")!;
  const grid = floor && mask.width === W && mask.height === H ? floorGrid(mask, floor) : null;
  if (grid && floor) {
    const r = await inpaintFloorGrid(original, mask, grid, floor.camera);
    if (!r.ok) return r;
    pctx.drawImage(original, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h); // nền cho viền mềm
    const p = pctx.getImageData(0, 0, rect.w, rect.h);
    for (let y = 0; y < rect.h; y++) {
      for (let x = 0; x < rect.w; x++) {
        const k = (rect.y + y) * W + rect.x + x;
        if (mask.data[k]) p.data.set(r.value.data.subarray(k * 4, k * 4 + 4), (y * rect.w + x) * 4);
      }
    }
    pctx.putImageData(p, 0, 0);
  } else {
    // Bản gửi đi: ảnh co mượt; mask co kiểu lân cận gần nhất (tắt làm mượt) rồi ép ngưỡng → chỉ trắng/đen.
    const send = sendSize(rect.w, rect.h);
    const imgSend = canvas(send.w, send.h);
    const ictx = imgSend.getContext("2d")!;
    ictx.imageSmoothingQuality = "high";
    ictx.drawImage(original, rect.x, rect.y, rect.w, rect.h, 0, 0, send.w, send.h);
    const maskSend = canvas(send.w, send.h);
    const mctx = maskSend.getContext("2d")!;
    mctx.imageSmoothingEnabled = false;
    mctx.drawImage(fullMask, rect.x, rect.y, rect.w, rect.h, 0, 0, send.w, send.h);
    const m = mctx.getImageData(0, 0, send.w, send.h);
    binarizeMask(m.data);
    mctx.putImageData(m, 0, 0);

    const r = await inpaint(await canvasToBlob(imgSend, "image/jpeg", 0.9), await canvasToBlob(maskSend, "image/png"));
    if (!r.ok) return r;
    const filledUrl = URL.createObjectURL(r.value);
    const filled = await loadImage(filledUrl).finally(() => URL.revokeObjectURL(filledUrl));
    pctx.drawImage(filled, 0, 0, rect.w, rect.h);
  }
  const alpha = canvas(rect.w, rect.h);
  const actx = alpha.getContext("2d")!;
  actx.filter = "blur(2px)";
  actx.drawImage(maskCrop, 0, 0);
  const a = actx.getImageData(0, 0, rect.w, rect.h);
  for (let k = 0; k < a.data.length; k += 4) a.data[k + 3] = a.data[k] ?? 0; // độ sáng mask → alpha
  actx.putImageData(a, 0, 0);
  pctx.globalCompositeOperation = "destination-in";
  pctx.drawImage(alpha, 0, 0);

  const out = canvas(W, H);
  const octx = out.getContext("2d")!;
  octx.drawImage(original, 0, 0);
  octx.drawImage(patch, rect.x, rect.y);
  return { ok: true, value: URL.createObjectURL(await canvasToBlob(out, "image/jpeg", 0.92)) };
}
