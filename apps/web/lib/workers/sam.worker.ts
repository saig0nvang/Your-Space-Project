/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoProcessor, RawImage, SamModel, Tensor } from "@huggingface/transformers";
import { loadWithFallback, pickDevice, samOptions } from "./device";
import { fetchAsBlob, forwardProgress, serveRpc } from "./rpc";
import { cleanObjectMask, maskBBox, rectIoU, type Mask } from "@yourspace/core";
import { pickMask } from "../ai/pickMask";

const MODEL = "Xenova/slimsam-77-uniform";
let loaded: Promise<{ model: any; processor: any }> | null = null;
let current: { url: string; inputs: any; embeddings: any } | null = null;
/** Điểm chạm thử trong khung (tỉ lệ theo khung): giữa trước, rồi trên/dưới/trái/phải — ghế khung thưa hay trượt giữa. */
const BOX_PROBES = [[0.5, 0.5], [0.5, 0.3], [0.5, 0.7], [0.3, 0.5], [0.7, 0.5]] as const;

/** Chạy decoder cho một điểm dương; trả 3 mask SAM (cỡ ảnh gốc) cùng điểm số. */
async function decodeOne(model: any, processor: any, p: { x: number; y: number }[], labels: bigint[]) {
  const [rh, rw] = current!.inputs.reshaped_input_sizes[0] as [number, number];
  const input_points = new Tensor("float32", Float32Array.from(p.flatMap((q) => [q.x * rw, q.y * rh])), [1, 1, p.length, 2]);
  const input_labels = new Tensor("int64", BigInt64Array.from(labels), [1, 1, p.length]);
  const outputs = await model({ ...current!.embeddings, input_points, input_labels });
  const masks = await processor.post_process_masks(outputs.pred_masks, current!.inputs.original_sizes, current!.inputs.reshaped_input_sizes);
  const m = masks[0] as { dims: number[]; data: Uint8Array };
  const W = m.dims[3] ?? 0;
  const H = m.dims[2] ?? 0;
  const channel = (c: number): Mask => ({ width: W, height: H, data: m.data.subarray(c * W * H, (c + 1) * W * H) });
  return { W, H, channels: m.dims[1] ?? 1, channel, scores: Array.from(outputs.iou_scores.data as Float32Array) };
}

const load = () =>
  (loaded ??= (async () => {
    const info = await pickDevice();
    const model = await loadWithFallback(info, (d) => SamModel.from_pretrained(MODEL, { ...samOptions(d), progress_callback: forwardProgress }));
    const processor = await AutoProcessor.from_pretrained(MODEL, { progress_callback: forwardProgress });
    return { model, processor };
  })().catch((e: unknown) => {
    loaded = null;
    throw e;
  }));

serveRpc({
  async warmup() {
    await load();
    return { value: true };
  },
  /** Mã hoá ảnh MỘT lần; các lần chạm sau chỉ chạy decoder. */
  async encode({ url }: { url: string }) {
    if (current?.url === url) return { value: { width: current.inputs.original_sizes[0][1], height: current.inputs.original_sizes[0][0] } };
    const { model, processor } = await load();
    const blob = await fetchAsBlob(url);
    const image = await RawImage.fromBlob(blob);
    const inputs = await processor(image);
    const embeddings = await model.get_image_embeddings(inputs);
    current = { url, inputs, embeddings };
    return { value: { width: image.width, height: image.height } };
  },
  /** points: x, y chuẩn hoá 0..1. Chọn mask theo pickMask (lớn nhất nhưng không phải sàn/tường). */
  async decode({ points }: { points: { x: number; y: number; positive: boolean }[] }) {
    if (!current) throw new Error("Chưa mã hoá ảnh");
    const { model, processor } = await load();
    const { W, H, channels, channel, scores } = await decodeOne(model, processor, points, points.map((p) => BigInt(p.positive ? 1 : 0)));
    const size = W * H;
    const areas: number[] = [];
    for (let c = 0; c < channels; c++) {
      let area = 0;
      const d = channel(c).data;
      for (let k = 0; k < size; k++) if (d[k]) area++;
      areas.push(area);
    }
    const best = pickMask(areas, scores, size);
    const data = new Uint8Array(size);
    const picked = channel(best).data;
    for (let k = 0; k < size; k++) data[k] = picked[k] ? 1 : 0;
    const seeds = points.filter((p) => p.positive).map((p) => ({ x: Math.min(W - 1, p.x * W), y: Math.min(H - 1, p.y * H) }));
    const clean = cleanObjectMask({ width: W, height: H, data }, seeds);
    return { value: clean, transfer: [clean.data.buffer] };
  },
  /**
   * Mask cho một khung máy dò (x0, y0, x1, y1 chuẩn hoá 0..1): decoder SlimSAM không nhận khung, nên thử vài điểm
   * dương trong khung, lấy mask (trong 3 × số điểm) có khung bao khớp khung dò nhất, cắt theo khung rồi dọn mảng rời.
   * `iou` thấp (vật bị che, khung lệch) → người gọi bỏ.
   */
  async decodeBox({ box }: { box: [number, number, number, number] }) {
    if (!current) throw new Error("Chưa mã hoá ảnh");
    const { model, processor } = await load();
    const [x0, y0, x1, y1] = box;
    let best: { mask: Mask; iou: number; seed: { x: number; y: number } } | null = null;
    for (const [fx, fy] of BOX_PROBES) {
      const p = { x: x0 + (x1 - x0) * fx, y: y0 + (y1 - y0) * fy };
      const { W, H, channels, channel } = await decodeOne(model, processor, [p], [BigInt(1)]);
      const target = { x: x0 * W, y: y0 * H, w: (x1 - x0) * W, h: (y1 - y0) * H };
      for (let c = 0; c < channels; c++) {
        const bb = maskBBox(channel(c));
        const iou = bb ? rectIoU(bb, target) : 0;
        if (!best || iou > best.iou) best = { mask: channel(c), iou, seed: { x: p.x * W, y: p.y * H } };
      }
    }
    const { mask, iou, seed } = best!;
    const { width: W, height: H } = mask;
    const data = new Uint8Array(W * H);
    const [cx0, cy0, cx1, cy1] = [Math.floor(x0 * W), Math.floor(y0 * H), Math.ceil(x1 * W), Math.ceil(y1 * H)];
    for (let y = cy0; y < cy1; y++) for (let x = cx0; x < cx1; x++) data[y * W + x] = mask.data[y * W + x] ? 1 : 0;
    const clean = cleanObjectMask({ width: W, height: H, data }, [seed]);
    return { value: { mask: clean, iou }, transfer: [clean.data.buffer] };
  },
});
