"use client";
import { cropSquare, maskBBox, type AIError, type Mask, type Result } from "@yourspace/core";
import { inpaint } from "@/lib/ai/inpaintClient";
import { canvasToBlob, loadImage } from "@/lib/image";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

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
 * Lấp từ ẢNH GỐC với mask gộp (E5-US2): cắt ô vuông quanh mask (spike), gửi LaMa, dán kết quả chỉ trong mask
 * với viền mềm 2 px lên ảnh gốc. Trả URL ảnh làm việc mới.
 */
export async function eraseWithLama(originalUrl: string, mask: Mask): Promise<Result<string, AIError>> {
  const original = await loadImage(originalUrl);
  const W = original.naturalWidth;
  const H = original.naturalHeight;
  const bbox = maskBBox(mask);
  if (!bbox) return { ok: false, error: { kind: "VendorError", message: "Chưa chọn vùng nào" } };
  const rect = cropSquare(bbox, W, H);
  const fullMask = maskCanvas(mask);

  const imgCrop = canvas(rect.w, rect.h);
  imgCrop.getContext("2d")!.drawImage(original, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  const maskCrop = canvas(rect.w, rect.h);
  maskCrop.getContext("2d")!.drawImage(fullMask, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

  const r = await inpaint(await canvasToBlob(imgCrop, "image/jpeg", 0.92), await canvasToBlob(maskCrop, "image/png"));
  if (!r.ok) return r;

  const filledUrl = URL.createObjectURL(r.value);
  const filled = await loadImage(filledUrl).finally(() => URL.revokeObjectURL(filledUrl));

  // Mảnh vá = kết quả LaMa (kéo về đúng kích thước ô) chỉ giữ trong mask đã làm mềm viền.
  const patch = canvas(rect.w, rect.h);
  const pctx = patch.getContext("2d")!;
  pctx.drawImage(filled, 0, 0, rect.w, rect.h);
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
