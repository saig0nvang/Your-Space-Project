import { pipeline } from "@huggingface/transformers";
import { fetchAsBlob, forwardProgress, pickDevice, serveRpc } from "./rpc";

const MODEL = "onnx-community/depth-anything-v2-small";
type Estimator = (input: Blob) => Promise<{ predicted_depth: { data: Float32Array; dims: number[] } }>;
let estimator: Promise<Estimator> | null = null;

const load = () =>
  (estimator ??= (pipeline("depth-estimation", MODEL, { device: pickDevice(), progress_callback: forwardProgress }) as unknown as Promise<Estimator>).catch(
    (e: unknown) => {
      estimator = null;
      throw e;
    },
  ));

serveRpc({
  async warmup() {
    await load();
    return { value: true };
  },
  /** Disparity chuẩn hoá 0..1 (1 = gần nhất) — đúng quy ước DisparityMap của core. */
  async disparity({ url }: { url: string }) {
    const blob = await fetchAsBlob(url);
    const out = await (await load())(blob);
    const t = out.predicted_depth;
    const h = t.dims[t.dims.length - 2] ?? 0;
    const w = t.dims[t.dims.length - 1] ?? 0;
    let mn = Infinity, mx = -Infinity;
    for (const v of t.data) { if (v < mn) mn = v; if (v > mx) mx = v; }
    const range = mx - mn || 1;
    const data = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) data[i] = ((t.data[i] ?? mn) - mn) / range;
    return { value: { width: w, height: h, data }, transfer: [data.buffer] };
  },
});
