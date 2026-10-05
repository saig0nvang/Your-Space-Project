/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoProcessor, RawImage, SamModel, Tensor } from "@huggingface/transformers";
import { forwardProgress, pickDevice, serveRpc } from "./rpc";

const MODEL = "Xenova/slimsam-77-uniform";
let loaded: Promise<{ model: any; processor: any }> | null = null;
let current: { inputs: any; embeddings: any } | null = null;

const load = () =>
  (loaded ??= (async () => {
    const model = await SamModel.from_pretrained(MODEL, { device: pickDevice(), progress_callback: forwardProgress });
    const processor = await AutoProcessor.from_pretrained(MODEL, { progress_callback: forwardProgress });
    return { model, processor };
  })());

serveRpc({
  async warmup() {
    await load();
    return { value: true };
  },
  /** Mã hoá ảnh MỘT lần; các lần chạm sau chỉ chạy decoder. */
  async encode({ url }: { url: string }) {
    const { model, processor } = await load();
    const image = await RawImage.read(url);
    const inputs = await processor(image);
    const embeddings = await model.get_image_embeddings(inputs);
    current = { inputs, embeddings };
    return { value: { width: image.width, height: image.height } };
  },
  /** points: x, y chuẩn hoá 0..1. Trả mask LỚN NHẤT trong 3 mask (spike: ưu tiên mask lớn cứu thêm 11/65 món). */
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
    let best = 0, bestArea = -1;
    for (let c = 0; c < channels; c++) {
      let area = 0;
      for (let k = c * size; k < (c + 1) * size; k++) if (m.data[k]) area++;
      if (area > bestArea) { bestArea = area; best = c; }
    }
    const data = new Uint8Array(size);
    for (let k = 0; k < size; k++) data[k] = m.data[best * size + k] ? 1 : 0;
    return { value: { width: W, height: H, data }, transfer: [data.buffer] };
  },
});
