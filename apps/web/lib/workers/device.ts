/** Chọn thiết bị + dtype cho model chạy trong worker (thuần, test được — không chạy gì lúc import). */

export type DeviceInfo = { device: "webgpu" | "wasm"; fp16: boolean };
const WASM: DeviceInfo = { device: "wasm", fp16: false };
type GpuNavigator = { gpu?: { requestAdapter(): Promise<{ features: { has(f: string): boolean } } | null> } };

/**
 * `"gpu" in navigator` có thể đúng mà requestAdapter() vẫn ra null (GPU bị chặn, driver lỗi…) → phải xin
 * adapter thật mới biết dùng được WebGPU. `fp16` = adapter có "shader-f16" (chạy được model fp16).
 */
export async function detectDevice(nav: GpuNavigator = self.navigator as unknown as GpuNavigator): Promise<DeviceInfo> {
  if (!nav.gpu) return WASM;
  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter ? { device: "webgpu", fp16: adapter.features.has("shader-f16") } : WASM;
  } catch {
    return WASM;
  }
}

let detected: Promise<DeviceInfo> | null = null;
export const pickDevice = (): Promise<DeviceInfo> => (detected ??= detectDevice());

/** Tải model trên thiết bị đã chọn; WebGPU lỗi (tạo session thất bại…) → thử lại MỘT lần trên wasm. */
export async function loadWithFallback<T>(info: DeviceInfo, load: (info: DeviceInfo) => Promise<T>): Promise<T> {
  if (info.device === "wasm") return load(info);
  try {
    return await load(info);
  } catch (e) {
    console.warn("[model] WebGPU lỗi, chuyển sang wasm:", e);
    return load(WASM);
  }
}

/**
 * Kho onnx-community/depth-anything-v2-small/onnx: model.onnx (fp32) 99,1 MB · model_fp16.onnx 49,6 MB ·
 * model_quantized.onnx (q8) 27,3 MB. WebGPU có shader-f16 → fp16; còn lại (wasm, WebGPU không f16) → q8.
 */
export const depthDtype = (info: DeviceInfo) => (info.device === "webgpu" && info.fp16 ? "fp16" : "q8");

/**
 * Bộ mã hoá ảnh (vision_encoder) chạy WebGPU khi có để nhanh; bộ giải mã điểm/mask
 * (prompt_encoder_mask_decoder) LUÔN chạy wasm — shader MatMul của nó không biên dịch được
 * trên WebGPU compute pipeline ở một số GPU/driver (lỗi "Invalid ShaderModule" quan sát thực tế
 * trên Chrome). Tên 2 session khớp đúng 2 file .onnx trong kho Xenova/slimsam-77-uniform/onnx/
 * (vision_encoder*.onnx, prompt_encoder_mask_decoder*.onnx). Không có WebGPU → cả hai dùng wasm.
 *
 * dtype vision_encoder: WebGPU có shader-f16 → fp16 (vision_encoder_fp16.onnx 12,2 MB); WebGPU không f16 → fp32
 * (vision_encoder.onnx 23,3 MB, như trước). wasm: để mặc định của transformers.js (q8 → vision_encoder_quantized
 * 8,9 MB + prompt_encoder_mask_decoder_quantized 4,9 MB), như trước.
 */
export function samOptions(info: DeviceInfo) {
  if (info.device !== "webgpu") return { device: { vision_encoder: "wasm", prompt_encoder_mask_decoder: "wasm" } as const, dtype: undefined };
  return {
    device: { vision_encoder: "webgpu", prompt_encoder_mask_decoder: "wasm" } as const,
    dtype: { vision_encoder: info.fp16 ? "fp16" : "fp32", prompt_encoder_mask_decoder: "q8" } as const,
  };
}

