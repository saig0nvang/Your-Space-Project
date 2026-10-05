export type ModelProgress = { file: string; loaded: number; total: number };
export type RpcResult = { value: unknown; transfer?: Transferable[] };
type Req = { id: number; method: string; args: unknown };
type Res = { id: number; ok: true; value: unknown } | { id: number; ok: false; error: string } | { progress: ModelProgress };

export function createRpcClient(make: () => Worker) {
  let worker: Worker | null = null;
  let seq = 0;
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  const listeners = new Set<(p: ModelProgress) => void>();

  const get = () => {
    if (worker) return worker;
    worker = make();
    worker.onmessage = (e: MessageEvent<Res>) => {
      const m = e.data;
      if ("progress" in m) { listeners.forEach((fn) => fn(m.progress)); return; }
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id);
      if (m.ok) p.resolve(m.value); else p.reject(new Error(m.error));
    };
    worker.onerror = (e) => {
      pending.forEach((p) => p.reject(new Error(e.message || "Worker lỗi")));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
    return worker;
  };

  return {
    call<T>(method: string, args: unknown): Promise<T> {
      const id = ++seq;
      return new Promise<T>((resolve, reject) => {
        pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
        get().postMessage({ id, method, args } satisfies Req);
      });
    },
    onProgress(fn: (p: ModelProgress) => void) {
      listeners.add(fn);
      return () => { listeners.delete(fn); };
    },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function serveRpc(handlers: Record<string, (args: any) => Promise<RpcResult>>): void {
  self.onmessage = async (e: MessageEvent<Req>) => {
    const { id, method, args } = e.data;
    const h = handlers[method];
    try {
      if (!h) throw new Error(`Không có phương thức ${method}`);
      const { value, transfer } = await h(args);
      (self as unknown as Worker).postMessage({ id, ok: true, value } satisfies Res, transfer ?? []);
    } catch (err) {
      (self as unknown as Worker).postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) } satisfies Res);
    }
  };
}

export function postProgress(p: ModelProgress): void {
  (self as unknown as Worker).postMessage({ progress: p } satisfies Res);
}

/** transformers.js gọi progress_callback với nhiều kiểu sự kiện; chỉ chuyển sự kiện có byte. */
export function forwardProgress(e: { status?: string; file?: string; loaded?: number; total?: number }): void {
  if (e.status === "progress" && e.file && e.total) postProgress({ file: e.file, loaded: e.loaded ?? 0, total: e.total });
}

/**
 * Tải `url` (kể cả `blob:` do main thread tạo) thành Blob ngay trong worker, rồi đưa thẳng
 * Blob cho transformers.js — tránh để RawImage/pipeline tự `fetch` + suy luận kiểu input,
 * vốn có thể không ổn định với URL blob: trong môi trường worker.
 */
export async function fetchAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được ảnh ${url} (${res.status})`);
  return res.blob();
}
