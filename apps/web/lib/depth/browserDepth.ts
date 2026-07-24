"use client";

import type { DepthMap } from "@yourspace/core";
import { pipeline } from "@huggingface/transformers";

// Adapter depth IN-BROWSER cho spike (transformers.js + Depth Anything V2 Small ONNX).
// Không cần API key. Cũng là POC cho tầm nhìn on-device (D3).

type Estimator = (input: string) => Promise<{ predicted_depth: { data: Float32Array; dims: number[] } }>;

let _estimator: Promise<Estimator> | null = null;

function getEstimator(): Promise<Estimator> {
  if (!_estimator) {
    _estimator = pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", {
      device: "webgpu",
    }).catch(() =>
      pipeline("depth-estimation", "onnx-community/depth-anything-v2-small"),
    ) as unknown as Promise<Estimator>;
  }
  return _estimator;
}

/**
 * Ước lượng depth từ 1 ảnh (URL) trong trình duyệt → DepthMap với quy ước
 * **giá trị LỚN = XA** (đúng thứ calibrate cần).
 *
 * Depth Anything trả **disparity** (gần = lớn), quan hệ NGHỊCH ĐẢO với khoảng cách.
 * Vì vậy phải đổi `distance ∝ 1/(disparity + eps)` — KHÔNG phải `1 - disparity`
 * (phép trừ làm point cloud méo phi tuyến → khớp mặt phẳng hỏng).
 *
 * @param asDisparity true (mặc định) = coi output là disparity và nghịch đảo.
 *   Nếu một model nào đó vốn đã trả khoảng cách, đặt false.
 * @param eps chặn chia 0 & giới hạn khoảng cách vùng trời/xa vô cực.
 */
export async function browserDepth(
  imageUrl: string,
  asDisparity = true,
  eps = 0.12,
): Promise<DepthMap> {
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

  // Bước 1: disparity chuẩn hoá 0..1 (1 = gần nhất) → khoảng cách thô.
  const dist = new Float32Array(w * h);
  let dmin = Infinity;
  let dmax = -Infinity;
  for (let i = 0; i < w * h; i++) {
    const disp = ((src[i] ?? mn) - mn) / range;
    const d = asDisparity ? 1 / (disp + eps) : disp;
    dist[i] = d;
    if (d < dmin) dmin = d;
    if (d > dmax) dmax = d;
  }

  // Bước 2: chuẩn hoá khoảng cách về 0..1 (giữ TỈ LỆ tuyến tính giữa các điểm).
  const drange = dmax - dmin || 1;
  const data = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) data[i] = ((dist[i] ?? dmin) - dmin) / drange;

  return { width: w, height: h, data };
}
