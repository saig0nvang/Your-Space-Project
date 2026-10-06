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

// Chữ ký (magic bytes) thật + vài byte đệm — handler kiểm nội dung thật, không tin `type` khai báo dưới đây.
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const img = () => new Blob([new Uint8Array([...JPEG_MAGIC, 1, 2, 3])], { type: "image/jpeg" });
const mask = () => new Blob([new Uint8Array([...PNG_MAGIC, 4, 5])], { type: "image/png" });
const deps = () => ({
  inpaint: vi.fn().mockResolvedValue(new Uint8Array([9, 9])),
  limiter: { take: vi.fn().mockReturnValue(true) },
  timeoutMs: 1000,
});

test("thành công: trả PNG, gửi byte thô cho inpaint; KHÔNG cache phía server (lần 2 gọi lại)", async () => {
  const d = deps();
  const handle = createInpaintHandler(d);
  const res = await handle(await req({ image: img(), mask: mask() }));
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("image/png");
  expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([9, 9]));
  expect(Array.from(d.inpaint.mock.calls[0]![0] as Uint8Array)).toEqual([...JPEG_MAGIC, 1, 2, 3]);
  expect(Array.from(d.inpaint.mock.calls[0]![1] as Uint8Array)).toEqual([...PNG_MAGIC, 4, 5]);
  await handle(await req({ image: img(), mask: mask() }));
  expect(d.inpaint).toHaveBeenCalledTimes(2);
});

test("nội dung không đúng chữ ký JPEG/PNG (magic bytes) → 400, không gọi inpaint", async () => {
  const d = deps();
  // Khai type: "image/jpeg" nhưng byte thật không phải JPEG/PNG nào cả — vẫn phải bị chặn.
  const fake = new Blob([new Uint8Array([1, 2, 3, 4, 5])], { type: "image/jpeg" });
  const res = await createInpaintHandler(d)(await req({ image: fake, mask: mask() }));
  expect(res.status).toBe(400);
  expect(d.inpaint).not.toHaveBeenCalled();
});

test("mask có nội dung không đúng chữ ký → 400, không gọi inpaint", async () => {
  const d = deps();
  const fake = new Blob([new Uint8Array([0, 0, 0, 0])], { type: "image/png" });
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: fake }));
  expect(res.status).toBe(400);
  expect(d.inpaint).not.toHaveBeenCalled();
});

test("không tin Content-Type khai báo sai — chữ ký thật đúng JPEG/PNG vẫn được chấp nhận", async () => {
  const d = deps();
  // Khai type: "text/html" nhưng byte thật là PNG thật — vẫn phải qua, vì ta kiểm nội dung, không kiểm khai báo.
  const mislabeled = new Blob([new Uint8Array([...PNG_MAGIC, 7])], { type: "text/html" });
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mislabeled }));
  expect(res.status).toBe(200);
  expect(d.inpaint).toHaveBeenCalledTimes(1);
});

test("log lỗi vendor chỉ gồm kind + 200 ký tự đầu message", async () => {
  const d = deps();
  d.inpaint.mockRejectedValue(new Error("x".repeat(500)));
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
  d.inpaint.mockRejectedValue(new Error("boom"));
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mask() }));
  expect(res.status).toBe(502);
  expect((await res.json()).error.kind).toBe("VendorError");
});

test("Content-Length vượt 7MB → 400 trước khi đọc body", async () => {
  const d = deps();
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mask() }, { contentLength: 7_000_001 }));
  expect(res.status).toBe(400);
  expect((await res.json()).error.kind).toBe("VendorError");
  expect(d.inpaint).not.toHaveBeenCalled();
});

test("thiếu Content-Length → 400", async () => {
  const res = await createInpaintHandler(deps())(await req({ image: img(), mask: mask() }, { contentLength: null }));
  expect(res.status).toBe(400);
  expect((await res.json()).error.kind).toBe("VendorError");
});

test("lỗi vendor không rò message gốc ra client", async () => {
  const d = deps();
  d.inpaint.mockRejectedValue(new Error("stack trace nhạy cảm của onnxruntime"));
  const res = await createInpaintHandler(d)(await req({ image: img(), mask: mask() }));
  const bodyText = await res.text();
  expect(bodyText).not.toContain("stack trace nhạy cảm");
  expect(JSON.parse(bodyText).error.kind).toBe("VendorError");
});
