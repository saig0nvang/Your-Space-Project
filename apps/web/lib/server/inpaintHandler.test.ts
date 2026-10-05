import { expect, test, vi } from "vitest";
import { createInpaintHandler } from "./inpaintHandler";

/**
 * Xây Request multipart thật (qua Response để có boundary khớp giữa content-type và body),
 * rồi tự đặt header content-length — Node không tự gắn content-length khi body là FormData.
 */
async function req(
  fields: Record<string, Blob>,
  opts: { ip?: string; contentLength?: number | null } = {},
): Promise<Request> {
  const { ip = "1.1.1.1", contentLength } = opts;
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v, k);
  const probe = new Response(fd);
  const contentType = probe.headers.get("content-type")!;
  const body = await probe.arrayBuffer();
  const headers: Record<string, string> = { "x-forwarded-for": ip, "content-type": contentType };
  const len = contentLength === undefined ? body.byteLength : contentLength;
  if (len !== null) headers["content-length"] = String(len);
  return new Request("http://localhost/api/ai/inpaint", { method: "POST", body, headers });
}

const img = () => new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
const mask = () => new Blob([new Uint8Array([4, 5])], { type: "image/png" });
const deps = () => ({
  lama: vi.fn().mockResolvedValue("https://x/out.png"),
  fetchOutput: vi.fn().mockResolvedValue(new Uint8Array([9, 9])),
  limiter: { take: vi.fn().mockReturnValue(true) },
  timeoutMs: 1000,
});

test("thành công: trả PNG, gửi data URI; KHÔNG cache phía server (lần 2 gọi lại vendor)", async () => {
  const d = deps();
  const handle = createInpaintHandler(d);
  const res = await handle(await req({ image: img(), mask: mask() }));
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("image/png");
  expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([9, 9]));
  expect(d.lama.mock.calls[0]![0].image).toBe("data:image/jpeg;base64,AQID");
  await handle(await req({ image: img(), mask: mask() }));
  expect(d.lama).toHaveBeenCalledTimes(2);
});

test("MIME data URI theo danh sách cho phép, không tin type client khai", async () => {
  const d = deps();
  const evil = new Blob([new Uint8Array([1, 2, 3])], { type: "text/html" });
  const pngMask = new Blob([new Uint8Array([4, 5])], { type: "image/png" });
  await createInpaintHandler(d)(await req({ image: evil, mask: pngMask }));
  expect(d.lama.mock.calls[0]![0].image).toBe("data:image/jpeg;base64,AQID");
  expect(d.lama.mock.calls[0]![0].mask).toBe("data:image/png;base64,BAU=");
});

test("log lỗi vendor chỉ gồm kind + 200 ký tự đầu message", async () => {
  const d = deps();
  d.lama.mockRejectedValue(new Error("x".repeat(500)));
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  await createInpaintHandler(d)(await req({ image: img(), mask: mask() }));
  expect(spy).toHaveBeenCalledWith("[inpaint]", "VendorError", "x".repeat(200));
  spy.mockRestore();
});

test("thiếu mask → 400", async () => {
  const res = await createInpaintHandler(deps())(await req({ image: img() }));
  expect(res.status).toBe(400);
});

test("vượt giới hạn lượt → 429 BudgetExceeded", async () => {
  const d = deps();
  d.limiter.take.mockReturnValue(false);
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mask() }));
  expect(res.status).toBe(429);
  expect((await res.json()).error.kind).toBe("BudgetExceeded");
});

test("vendor lỗi → 502 VendorError", async () => {
  const d = deps();
  d.lama.mockRejectedValue(new Error("boom"));
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mask() }));
  expect(res.status).toBe(502);
  expect((await res.json()).error.kind).toBe("VendorError");
});

test("Content-Length vượt 7MB → 400 trước khi đọc body", async () => {
  const d = deps();
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mask() }, { contentLength: 7_000_001 }));
  expect(res.status).toBe(400);
  expect((await res.json()).error.kind).toBe("VendorError");
  expect(d.lama).not.toHaveBeenCalled();
});

test("thiếu Content-Length → 400", async () => {
  const res = await createInpaintHandler(deps())(await req({ image: img(), mask: mask() }, { contentLength: null }));
  expect(res.status).toBe(400);
  expect((await res.json()).error.kind).toBe("VendorError");
});

test("lỗi vendor không rò message gốc ra client", async () => {
  const d = deps();
  d.lama.mockRejectedValue(new Error("Replicate 500: internal stack trace nhạy cảm"));
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mask() }));
  const bodyText = await res.text();
  expect(bodyText).not.toContain("internal stack trace nhạy cảm");
  expect(bodyText).not.toContain("Replicate 500");
  expect(JSON.parse(bodyText).error.kind).toBe("VendorError");
});
