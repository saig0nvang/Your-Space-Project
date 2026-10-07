/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoProcessor, RawImage, SamModel, Tensor } from "@huggingface/transformers";
import { loadWithFallback, pickDevice, samOptions } from "./device";
import { fetchAsBlob, forwardProgress, serveRpc } from "./rpc";
import { cleanObjectMask } from "@yourspace/core";
import { pickMask } from "../ai/pickMask";

const MODEL = "Xenova/slimsam-77-uniform";
let loaded: Promise<{ model: any; processor: any }> | null = null;
let current: { inputs: any; embeddings: any } | null = null;

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
    const { model, processor } = await load();
    const blob = await fetchAsBlob(url);
    const image = await RawImage.fromBlob(blob);
    const inputs = await processor(image);
    const embeddings = await model.get_image_embeddings(inputs);
    current = { inputs, embeddings };
    return { value: { width: image.width, height: image.height } };
  },
  /** points: x, y chuẩn hoá 0..1. Chọn mask theo pickMask (lớn nhất nhưng không phải sàn/tường). */
  async decode({ points }: { points: { x: number; y: number; positive: boolean }[] }) {
    if (!current) throw new Error("Chưa mã hoá ảnh");
    const { model, processor } = await load();
    const [rh, rw] = current.inputs.reshaped_input_sizes[0] as [number, number];
    const input_points = new Tensor("float32", Float32Array.from(points.flatMap((p) => [p.x * rw, p.y * rh])), [1, 1, points.length, 2]);
    const input_labels = new Tensor("int64", BigInt64Array.from(points.map((p) => BigInt(p.positive ? 1 : 0))), [1, 1, points.length]);
    const outputs = await model({ ...current.embeddings, input_points, input_labels });
    const masks = await processor.post_process_masks(outputs.pred_masks, current.inputs.original_sizes, current.inputs.reshaped_input_sizes);
    const m = masks[0] as { dims: number[]; data: Uint8Array };
    const channels = m.dims[1] ?? 1;
    const H = m.dims[2] ?? 0;
    const W = m.dims[3] ?? 0;
    const size = W * H;
    const areas: number[] = [];
    for (let c = 0; c < channels; c++) {
      let area = 0;
      for (let k = c * size; k < (c + 1) * size; k++) if (m.data[k]) area++;
      areas.push(area);
    }
    const best = pickMask(areas, Array.from(outputs.iou_scores.data as Float32Array), size);
    const data = new Uint8Array(size);
    for (let k = 0; k < size; k++) data[k] = m.data[best * size + k] ? 1 : 0;
    const seeds = points.filter((p) => p.positive).map((p) => ({ x: Math.min(W - 1, p.x * W), y: Math.min(H - 1, p.y * H) }));
    const clean = cleanObjectMask({ width: W, height: H, data }, seeds);
    return { value: clean, transfer: [clean.data.buffer] };
  },
});
