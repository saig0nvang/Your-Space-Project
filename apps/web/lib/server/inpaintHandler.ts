import { makeCachedCall, type AIError } from "@yourspace/core";

const MAX_BYTES = 3_000_000;
// 2 × 3 MB cho ảnh + mask, cộng dư cho overhead multipart (boundary, header từng phần).
const MAX_CONTENT_LENGTH = 7_000_000;
const STATUS: Record<AIError["kind"], number> = { Timeout: 504, RateLimited: 429, BudgetExceeded: 429, VendorError: 502, LowConfidence: 422 };

// Thông báo cố định gửi cho client — không bao giờ lộ message gốc (có thể chứa chi tiết vendor nhạy cảm).
const CLIENT_MESSAGE: Partial<Record<AIError["kind"], string>> = {
  Timeout: "Xóa quá lâu, thử lại với vùng nhỏ hơn.",
  RateLimited: "Dịch vụ đang bận, thử lại sau ít phút.",
};
const DEFAULT_CLIENT_MESSAGE = "Xóa chưa được, thử lại sau.";

const fail = (status: number, error: AIError) => Response.json({ error }, { status });

/** Chỉ nhận 2 định dạng ta tự sinh ở client; không tin `Blob.type` do client khai báo. */
const ALLOWED_MIME = new Set(["image/jpeg", "image/png"]);
const dataUri = (type: string, fallback: string, bytes: Buffer) =>
  `data:${ALLOWED_MIME.has(type) ? type : fallback};base64,${bytes.toString("base64")}`;

type Deps = {
  lama: (i: { image: string; mask: string }) => Promise<string>;
  fetchOutput: (url: string) => Promise<Uint8Array>;
  limiter: { take(k: string): boolean };
  timeoutMs: number;
};

export function createInpaintHandler(deps: Deps): (req: Request) => Promise<Response> {
  // KHÔNG cache kết quả phía server: câu đồng thuận nói ảnh "được xóa ngay sau đó" — client tự giữ kết quả
  // cho hoàn tác/làm lại nên server không cần giữ bản sao nào.
  const call = makeCachedCall<{ image: string; mask: string }, Uint8Array>({
    run: async ({ image, mask }) => deps.fetchOutput(await deps.lama({ image, mask })),
    timeoutMs: deps.timeoutMs,
    label: "inpaint",
  });

  return async (req) => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!deps.limiter.take(ip)) return fail(429, { kind: "BudgetExceeded", message: "Bạn đã dùng hết lượt xóa thử trong giờ này." });

    // Chặn sớm theo Content-Length trước khi formData() đọc hết body vào bộ nhớ —
    // App Router route handler không có giới hạn kích thước body mặc định.
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN;
    if (!contentLengthHeader || !Number.isFinite(contentLength) || contentLength > MAX_CONTENT_LENGTH) {
      return fail(400, { kind: "VendorError", message: "Ảnh quá lớn." });
    }

    const form = await req.formData().catch(() => null);
    const image = form?.get("image");
    const mask = form?.get("mask");
    if (!(image instanceof Blob) || !(mask instanceof Blob)) return fail(400, { kind: "VendorError", message: "Thiếu ảnh hoặc mask." });
    if (image.size > MAX_BYTES || mask.size > MAX_BYTES) return fail(400, { kind: "VendorError", message: "Ảnh quá lớn." });

    const imageBytes = Buffer.from(await image.arrayBuffer());
    const maskBytes = Buffer.from(await mask.arrayBuffer());
    const r = await call({ image: dataUri(image.type, "image/jpeg", imageBytes), mask: dataUri(mask.type, "image/png", maskBytes) });
    if (!r.ok) {
      console.error("[inpaint]", r.error.kind, r.error.message.slice(0, 200));
      const message = CLIENT_MESSAGE[r.error.kind] ?? DEFAULT_CLIENT_MESSAGE;
      return fail(STATUS[r.error.kind], { kind: r.error.kind, message });
    }
    return new Response(new Uint8Array(r.value), { headers: { "content-type": "image/png", "cache-control": "no-store" } });
  };
}
