import { expect, test, vi } from "vitest";
import { makeCachedDepth } from "./gateway";
import type { DepthResult } from "./types";

const fakeDepth = (): DepthResult => ({
  depth: { width: 2, height: 2, data: new Float32Array([0, 0, 0, 0]) },
});

test("cache theo key: vendor gọi 1 lần cho input trùng", async () => {
  const run = vi.fn().mockResolvedValue(fakeDepth());
  const depth = makeCachedDepth<Uint8Array>({
    run,
    cache: new Map(),
    keyOf: (b) => b.join(","),
  });
  const img = new Uint8Array([1, 2, 3]);
  await depth(img);
  await depth(img);
  expect(run).toHaveBeenCalledTimes(1);
});

test("timeout → AIError kind Timeout", async () => {
  const run = () => new Promise<DepthResult>(() => {}); // không bao giờ resolve
  const depth = makeCachedDepth<Uint8Array>({
    run,
    cache: new Map(),
    keyOf: () => "k",
    timeoutMs: 20,
  });
  const r = await depth(new Uint8Array());
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error.kind).toBe("Timeout");
});

test("lỗi vendor 429 → RateLimited", async () => {
  const run = () => Promise.reject(new Error("boom 429"));
  const depth = makeCachedDepth<Uint8Array>({ run, cache: new Map(), keyOf: () => "k" });
  const r = await depth(new Uint8Array());
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error.kind).toBe("RateLimited");
});
