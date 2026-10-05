import { createInpaintHandler } from "@/lib/server/inpaintHandler";
import { createRateLimiter } from "@/lib/server/rateLimit";
import { runLama } from "@/lib/server/replicateLama";

let handler: ((req: Request) => Promise<Response>) | null = null;

function getHandler() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;
  handler ??= createInpaintHandler({
    lama: (input) => runLama(input, { token }),
    fetchOutput: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Tải kết quả thất bại ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    },
    limiter: createRateLimiter({ limit: 30, windowMs: 60 * 60 * 1000 }),
    timeoutMs: 60_000,
  });
  return handler;
}

export async function POST(req: Request) {
  const h = getHandler();
  if (!h) return Response.json({ error: { kind: "VendorError", message: "Chưa cấu hình REPLICATE_API_TOKEN" } }, { status: 503 });
  return h(req);
}
