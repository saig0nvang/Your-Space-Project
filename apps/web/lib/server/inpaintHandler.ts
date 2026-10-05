import { createHash } from "node:crypto";
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

/** Cache kết quả bị chặn ở N phần tử để không phình bộ nhớ qua thời gian dài; xoá entry cũ nhất (theo thứ tự chèn) khi đầy. */
class BoundedCache<V> extends Map<string, V> {
  constructor(private readonly limit: number) {
    super();
  }
  override set(key: string, value: V): this {
    if (!this.has(key) && this.size >= this.limit) {
      const oldestKey = this.keys().next().value;
      if (oldestKey !== undefined) this.delete(oldestKey);
    }
    return super.set(key, value);
  }
}

type Deps = {
  lama: (i: { image: string; mask: string }) => Promise<string>;
  fetchOutput: (url: string) => Promise<Uint8Array>;
  limiter: { take(k: string): boolean };
  timeoutMs: number;
};

export function createInpaintHandler(deps: Deps): (req: Request) => Promise<Response> {
  const call = makeCachedCall<{ key: string; image: string; mask: string }, Uint8Array>({
    run: async ({ image, mask }) => deps.fetchOutput(await deps.lama({ image, mask })),
    cache: new BoundedCache<Uint8Array>(50),
    keyOf: (i) => i.key,
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
    const key = createHash("sha256").update(imageBytes).update(maskBytes).digest("hex");
    const r = await call({
      key,
      image: `data:${image.type || "image/jpeg"};base64,${imageBytes.toString("base64")}`,
      mask: `data:${mask.type || "image/png"};base64,${maskBytes.toString("base64")}`,
    });
    if (!r.ok) {
      console.error("[inpaint]", r.error.kind, r.error.message);
      const message = CLIENT_MESSAGE[r.error.kind] ?? DEFAULT_CLIENT_MESSAGE;
      return fail(STATUS[r.error.kind], { kind: r.error.kind, message });
    }
    return new Response(new Uint8Array(r.value), { headers: { "content-type": "image/png", "cache-control": "no-store" } });
  };
}
