"use client";

import type { DepthMap } from "@yourspace/core";
import { pipeline } from "@huggingface/transformers";

// Adapter depth IN-BROWSER cho spike (transformers.js + Depth Anything V2 Small ONNX).
// Không cần API key. Đây cũng là POC cho tầm nhìn on-device (D3).

type Estimator = (input: string) => Promise<{ predicted_depth: { data: Float32Array; dims: number[] } }>;

let _estimator: Promise<Estimator> | null = null;

function getEstimator(): Promise<Estimator> {
  if (!_estimator) {
    // WebGPU nếu có; transformers.js tự fallback WASM.
    _estimator = pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", {
      device: "webgpu",
    }).catch(() =>
      pipeline("depth-estimation", "onnx-community/depth-anything-v2-small"),
    ) as unknown as Promise<Estimator>;
  }
  return _estimator;
}

/**
 * Ước lượng depth từ 1 ảnh (URL) trong trình duyệt → DepthMap (relative 0..1).
 * @param invert Depth Anything trả disparity (gần = lớn). Ta cần "xa = lớn" cho
 *   calibrate → mặc định invert=true. NẾU đặt đồ bị lộn gần/xa, thử tắt invert.
 */
export async function browserDepth(imageUrl: string, invert = true): Promise<DepthMap> {
  const est = await getEstimator();
  const out = await est(imageUrl);
  const t = out.predicted_depth;
  const dims = t.dims;
  const h = dims[dims.length - 2] ?? 0;
  const w = dims[dims.length - 1] ?? 0;
  const src = t.data;

  let mn = Infinity;
  let mx = -Infinity;
  for (let i = 0; i < src.length; i++) {
    const v = src[i] ?? 0;
    if (v < mn) mn = v;
    if (v > mx) mx = v;
  }
  const range = mx - mn || 1;

  const data = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    let v = ((src[i] ?? mn) - mn) / range;
    if (invert) v = 1 - v;
    data[i] = v;
  }
  return { width: w, height: h, data };
}
