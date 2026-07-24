import type { AIError, DepthResult, Result } from "./types";

export type DepthRun<I> = (input: I) => Promise<DepthResult>;

class TimeoutError extends Error {}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new TimeoutError("timed out")), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

function toAIError(e: unknown): AIError {
  if (e instanceof TimeoutError) return { kind: "Timeout", message: "depth timed out" };
  const message = e instanceof Error ? e.message : String(e);
  if (/rate|429/i.test(message)) return { kind: "RateLimited", message };
  return { kind: "VendorError", message };
}

/**
 * Bọc một `run` (gọi vendor depth) với: cache theo key (content-addressed),
 * timeout tuỳ chọn, và ánh xạ lỗi sang AIError có kiểu. Thuần & test được.
 * Cache hit = 0 lần gọi vendor.
 */
export function makeCachedDepth<I>(opts: {
  run: DepthRun<I>;
  cache: Map<string, DepthResult>;
  keyOf: (input: I) => string;
  timeoutMs?: number;
}): (input: I) => Promise<Result<DepthResult, AIError>> {
  return async (input: I): Promise<Result<DepthResult, AIError>> => {
    const key = opts.keyOf(input);
    const cached = opts.cache.get(key);
    if (cached) return { ok: true, value: cached };
    try {
      const value = opts.timeoutMs
        ? await withTimeout(opts.run(input), opts.timeoutMs)
        : await opts.run(input);
      opts.cache.set(key, value);
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: toAIError(e) };
    }
  };
}
