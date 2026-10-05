"use client";
import { makeCachedCall, type DisparityMap } from "@yourspace/core";
import { createRpcClient, type ModelProgress } from "@/lib/workers/rpc";

const rpc = createRpcClient(() => new Worker(new URL("../workers/depth.worker.ts", import.meta.url), { type: "module" }));
let warm: Promise<void> | null = null;

/** Tải model (27–50 MB lần đầu tuỳ thiết bị — xem lib/workers/device.ts, sau đó cache trình duyệt). Không có timeout vì phụ thuộc mạng. */
export const warmupDepth = (): Promise<void> =>
  (warm ??= rpc
    .call<boolean>("warmup", {})
    .then(() => undefined)
    .catch((e: unknown) => {
      warm = null;
      throw e;
    }));
export const onDepthProgress = (fn: (p: ModelProgress) => void) => rpc.onProgress(fn);

/** Gọi SAU warmupDepth: timeout 20 s chỉ tính phần suy luận (F5). */
export const getDisparity = makeCachedCall<string, DisparityMap>({
  run: (url) => rpc.call<DisparityMap>("disparity", { url }),
  cache: new Map(),
  keyOf: (url) => url,
  timeoutMs: 20_000,
  label: "depth",
});
