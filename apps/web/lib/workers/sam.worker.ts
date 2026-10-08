/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoProcessor, RawImage, SamModel, Tensor } from "@huggingface/transformers";
import { loadWithFallback, pickDevice, samOptions } from "./device";
import { fetchAsBlob, forwardProgress, serveRpc } from "./rpc";
import { cleanObjectMask, rectIoU, type Mask } from "@yourspace/core";
import { pickMask } from "../ai/pickMask";

const MODEL = "Xenova/slimsam-77-uniform";
let loaded: Promise<{ model: any; processor: any }> | null = null;
let current: { url: string; inputs: any; embeddings: any } | null = null;
/** Điểm chạm thử trong khung (tỉ lệ theo khung): giữa trước, rồi trên/dưới/trái/phải — ghế khung thưa hay trượt giữa. */
const BOX_PROBES = [[0.5, 0.5], [0.5, 0.3], [0.5, 0.7], [0.3, 0.5], [0.7, 0.5]] as const;

/** Khớp khung đủ tốt ở điểm giữa thì khỏi thử thêm điểm. */
const GOOD_BOX_IOU = 0.8;

/**
 * Chạy MỘT lượt decoder cho các điểm dương (point_batch = số điểm), chấm khớp khung `box` trên mask thô 256² của SAM
 * (không phóng lên cỡ ảnh); trả mask thô thắng (tensor 1×1×1×256×256) + điểm của nó.
 */
async function scoreProbes(model: any, probes: { x: number; y: number }[], box: [number, number, number, number]) {
  const [x0, y0, x1, y1] = box;
  const [rh, rw] = current!.inputs.reshaped_input_sizes[0] as [number, number];
  const input_points = new Tensor("float32", Float32Array.from(probes.flatMap((p) => [p.x * rw, p.y * rh])), [1, probes.length, 1, 2]);
  const input_labels = new Tensor("int64", BigInt64Array.from(probes.map(() => BigInt(1))), [1, probes.length, 1]);
  const out = await model({ ...current!.embeddings, input_points, input_labels });
  const [, P, C, LH, LW] = out.pred_masks.dims as number[];
  const logits = out.pred_masks.data as Float32Array;
  // Mask thô phủ ô vuông 1024 đã đệm; ảnh nằm ở góc trên-trái, cỡ reshaped/4 ô thô.
  const vw = (rw / 1024) * LW!, vh = (rh / 1024) * LH!;
  const target = { x: x0 * vw, y: y0 * vh, w: (x1 - x0) * vw, h: (y1 - y0) * vh };
  let best = { k: 0, iou: -1 };
  for (let k = 0; k < P! * C!; k++) {
    const off = k * LH! * LW!;
    let bx0 = Infinity, by0 = Infinity, bx1 = -1, by1 = -1;
    for (let y = 0; y < vh; y++) {
      for (let x = 0; x < vw; x++) {
        if (logits[off + y * LW! + x]! <= 0) continue;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
      }
    }
    const iou = bx1 < 0 ? 0 : rectIoU({ x: bx0, y: by0, w: bx1 - bx0 + 1, h: by1 - by0 + 1 }, target);
    if (iou > best.iou) best = { k, iou };
  }
  const n = LH! * LW!;
  return {
    iou: best.iou,
    seed: probes[Math.floor(best.k / C!)]!,
    logits: new Tensor("float32", logits.slice(best.k * n, (best.k + 1) * n), [1, 1, 1, LH!, LW!]),
  };
}

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
    const probes = BOX_PROBES.map(([fx, fy]) => ({ x: x0 + (x1 - x0) * fx, y: y0 + (y1 - y0) * fy }));
    // Điểm giữa trước; khớp khung kém (ghế khung thưa…) mới chạy 4 điểm còn lại (một lượt). Decoder wasm q8 ~270 ms mỗi
    // điểm — chạy đủ 5 điểm cho mọi món mất ~20 s cho 10 món; đa số món (sofa, TV, tủ, đèn) khớp ≥ 0,9 ngay điểm giữa.
    let best = await scoreProbes(model, probes.slice(0, 1), box);
    if (best.iou < GOOD_BOX_IOU) {
      const rest = await scoreProbes(model, probes.slice(1), box);
      if (rest.iou > best.iou) best = rest;
    }
    const m = (await processor.post_process_masks(best.logits, current.inputs.original_sizes, current.inputs.reshaped_input_sizes))[0] as { dims: number[]; data: Uint8Array };
    const H = m.dims[2] ?? 0, W = m.dims[3] ?? 0;
    const data = new Uint8Array(W * H);
    const [cx0, cy0, cx1, cy1] = [Math.floor(x0 * W), Math.floor(y0 * H), Math.min(W, Math.ceil(x1 * W)), Math.min(H, Math.ceil(y1 * H))];
    for (let y = cy0; y < cy1; y++) for (let x = cx0; x < cx1; x++) data[y * W + x] = m.data[y * W + x] ? 1 : 0;
    const clean = cleanObjectMask({ width: W, height: H, data }, [{ x: best.seed.x * W, y: best.seed.y * H }]);
    return { value: { mask: clean, iou: best.iou }, transfer: [clean.data.buffer] };
  },
});
