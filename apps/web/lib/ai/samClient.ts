"use client";
import type { Mask } from "@yourspace/core";
import { createRpcClient, type ModelProgress } from "@/lib/workers/rpc";

export type SamPoint = { x: number; y: number; positive: boolean };

const rpc = createRpcClient(() => new Worker(new URL("../workers/sam.worker.ts", import.meta.url), { type: "module" }));
let warm: Promise<void> | null = null;

export const warmupSam = (): Promise<void> =>
  (warm ??= rpc
    .call<boolean>("warmup", {})
    .then(() => undefined)
    .catch((e: unknown) => {
      warm = null;
      throw e;
    }));
export const onSamProgress = (fn: (p: ModelProgress) => void) => rpc.onProgress(fn);
export const encodeImage = (url: string) => rpc.call<{ width: number; height: number }>("encode", { url });
export const decodePoints = (points: SamPoint[]) => rpc.call<Mask>("decode", { points });
export const decodeBox = (box: [number, number, number, number]) => rpc.call<{ mask: Mask; iou: number }>("decodeBox", { box });
