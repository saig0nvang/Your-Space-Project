import { createHash } from "node:crypto";
import { makeCachedCall, type AIError } from "@yourspace/core";

const MAX_BYTES = 3_000_000;
const STATUS: Record<AIError["kind"], number> = { Timeout: 504, RateLimited: 429, BudgetExceeded: 429, VendorError: 502, LowConfidence: 422 };

const fail = (status: number, error: AIError) => Response.json({ error }, { status });

type Deps = {
  lama: (i: { image: string; mask: string }) => Promise<string>;
  fetchOutput: (url: string) => Promise<Uint8Array>;
  limiter: { take(k: string): boolean };
  timeoutMs: number;
};

export function createInpaintHandler(deps: Deps): (req: Request) => Promise<Response> {
  const call = makeCachedCall<{ key: string; image: string; mask: string }, Uint8Array>({
    run: async ({ image, mask }) => deps.fetchOutput(await deps.lama({ image, mask })),
    cache: new Map(),
    keyOf: (i) => i.key,
    timeoutMs: deps.timeoutMs,
    label: "inpaint",
  });

  return async (req) => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!deps.limiter.take(ip)) return fail(429, { kind: "BudgetExceeded", message: "Bạn đã dùng hết lượt xóa thử trong giờ này." });

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
    if (!r.ok) return fail(STATUS[r.error.kind], r.error);
    return new Response(new Uint8Array(r.value), { headers: { "content-type": "image/png", "cache-control": "no-store" } });
  };
}
