import { expect, test, vi } from "vitest";
import { createInpaintHandler } from "./inpaintHandler";

const req = (fields: Record<string, Blob>, ip = "1.1.1.1") => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v, k);
  return new Request("http://localhost/api/ai/inpaint", { method: "POST", body: fd, headers: { "x-forwarded-for": ip } });
};
const img = () => new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
const mask = () => new Blob([new Uint8Array([4, 5])], { type: "image/png" });
const deps = () => ({
  lama: vi.fn().mockResolvedValue("https://x/out.png"),
  fetchOutput: vi.fn().mockResolvedValue(new Uint8Array([9, 9])),
  limiter: { take: vi.fn().mockReturnValue(true) },
  timeoutMs: 1000,
});

test("thành công: trả PNG, gửi data URI; lần 2 cùng ảnh+mask dùng cache", async () => {
  const d = deps();
  const handle = createInpaintHandler(d);
  const res = await handle(req({ image: img(), mask: mask() }));
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("image/png");
  expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([9, 9]));
  expect(d.lama.mock.calls[0]![0].image).toBe("data:image/jpeg;base64,AQID");
  await handle(req({ image: img(), mask: mask() }));
  expect(d.lama).toHaveBeenCalledTimes(1);
});

test("thiếu mask → 400", async () => {
  const res = await createInpaintHandler(deps())(req({ image: img() }));
  expect(res.status).toBe(400);
});

test("vượt giới hạn lượt → 429 BudgetExceeded", async () => {
  const d = deps();
  d.limiter.take.mockReturnValue(false);
  const res = await createInpaintHandler(d)(req({ image: img(), mask: mask() }));
  expect(res.status).toBe(429);
  expect((await res.json()).error.kind).toBe("BudgetExceeded");
});

test("vendor lỗi → 502 VendorError", async () => {
  const d = deps();
  d.lama.mockRejectedValue(new Error("boom"));
  const res = await createInpaintHandler(d)(req({ image: img(), mask: mask() }));
  expect(res.status).toBe(502);
  expect((await res.json()).error.kind).toBe("VendorError");
});
