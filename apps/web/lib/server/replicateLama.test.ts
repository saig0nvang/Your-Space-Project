import { expect, test, vi } from "vitest";
import { LAMA_VERSION, runLama } from "./replicateLama";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const input = { image: "data:image/jpeg;base64,AA==", mask: "data:image/png;base64,AA==" };

test("xong ngay nhờ Prefer: wait", async () => {
  const fetchFn = vi.fn().mockResolvedValue(json({ id: "p1", status: "succeeded", output: "https://x/out.png" }, 201));
  await expect(runLama(input, { token: "t", fetchFn })).resolves.toBe("https://x/out.png");
  const [url, init] = fetchFn.mock.calls[0]!;
  expect(url).toBe("https://api.replicate.com/v1/predictions");
  expect(init.headers.Authorization).toBe("Bearer t");
  expect(init.headers.Prefer).toBe("wait=60");
  expect(JSON.parse(init.body)).toEqual({ version: LAMA_VERSION, input });
});

test("chưa xong thì hỏi lại urls.get tới khi xong", async () => {
  const fetchFn = vi.fn()
    .mockResolvedValueOnce(json({ id: "p1", status: "processing", urls: { get: "https://api/p1" } }, 201))
    .mockResolvedValueOnce(json({ id: "p1", status: "processing", urls: { get: "https://api/p1" } }))
    .mockResolvedValueOnce(json({ id: "p1", status: "succeeded", output: ["https://x/o.png"] }));
  const sleep = vi.fn().mockResolvedValue(undefined);
  await expect(runLama(input, { token: "t", fetchFn, sleep })).resolves.toBe("https://x/o.png");
  expect(fetchFn.mock.calls[1]![0]).toBe("https://api/p1");
  expect(sleep).toHaveBeenCalledTimes(2);
});

test("failed → ném lỗi có thông báo của Replicate", async () => {
  const fetchFn = vi.fn().mockResolvedValue(json({ id: "p1", status: "failed", error: "CUDA OOM" }, 201));
  await expect(runLama(input, { token: "t", fetchFn })).rejects.toThrow("CUDA OOM");
});

test("HTTP 429 → lỗi có '429' để gateway ánh xạ RateLimited", async () => {
  const fetchFn = vi.fn().mockResolvedValue(new Response("slow down", { status: 429 }));
  await expect(runLama(input, { token: "t", fetchFn })).rejects.toThrow(/429/);
});
