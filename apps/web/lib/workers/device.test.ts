import { expect, test, vi } from "vitest";
import { depthDtype, detectDevice, loadWithFallback, samOptions, type DeviceInfo } from "./device";

const adapter = (features: string[]) => ({ features: new Set(features) });

test("detectDevice: không có navigator.gpu → wasm", async () => {
  expect(await detectDevice({})).toEqual({ device: "wasm", fp16: false });
});

test("detectDevice: có gpu nhưng requestAdapter ra null hoặc ném lỗi → wasm", async () => {
  expect(await detectDevice({ gpu: { requestAdapter: async () => null } })).toEqual({ device: "wasm", fp16: false });
  expect(await detectDevice({ gpu: { requestAdapter: () => Promise.reject(new Error("blocked")) } })).toEqual({ device: "wasm", fp16: false });
});

test("detectDevice: adapter có / không có shader-f16", async () => {
  expect(await detectDevice({ gpu: { requestAdapter: async () => adapter(["shader-f16"]) } })).toEqual({ device: "webgpu", fp16: true });
  expect(await detectDevice({ gpu: { requestAdapter: async () => adapter([]) } })).toEqual({ device: "webgpu", fp16: false });
});

test("depthDtype: fp16 chỉ khi WebGPU có shader-f16, còn lại q8", () => {
  expect(depthDtype({ device: "webgpu", fp16: true })).toBe("fp16");
  expect(depthDtype({ device: "webgpu", fp16: false })).toBe("q8");
  expect(depthDtype({ device: "wasm", fp16: false })).toBe("q8");
});

test("samOptions: encoder fp16 trên WebGPU f16, fp32 trên WebGPU không f16, wasm giữ mặc định", () => {
  expect(samOptions({ device: "webgpu", fp16: true }).dtype?.vision_encoder).toBe("fp16");
  expect(samOptions({ device: "webgpu", fp16: false }).dtype?.vision_encoder).toBe("fp32");
  expect(samOptions({ device: "webgpu", fp16: true }).device.prompt_encoder_mask_decoder).toBe("wasm");
  expect(samOptions({ device: "wasm", fp16: false })).toEqual({ device: { vision_encoder: "wasm", prompt_encoder_mask_decoder: "wasm" }, dtype: undefined });
});

test("loadWithFallback: WebGPU lỗi → thử lại đúng một lần trên wasm", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const seen: DeviceInfo[] = [];
  const v = await loadWithFallback({ device: "webgpu", fp16: true }, async (d) => {
    seen.push(d);
    if (d.device === "webgpu") throw new Error("session");
    return "ok";
  });
  expect(v).toBe("ok");
  expect(seen).toEqual([{ device: "webgpu", fp16: true }, { device: "wasm", fp16: false }]);
});

test("loadWithFallback: wasm lỗi → ném lỗi, không thử lại", async () => {
  const load = vi.fn().mockRejectedValue(new Error("net"));
  await expect(loadWithFallback({ device: "wasm", fp16: false }, load)).rejects.toThrow("net");
  expect(load).toHaveBeenCalledTimes(1);
});
