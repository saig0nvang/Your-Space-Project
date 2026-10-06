import { join } from "node:path";
import { createLocalLama } from "@/lib/server/lamaLocal";
import { createInpaintHandler } from "@/lib/server/inpaintHandler";
import { createRateLimiter } from "@/lib/server/rateLimit";

// Chạy trên Node (không Edge): cần `onnxruntime-node` (native addon) và `sharp`.
export const runtime = "nodejs";

// `next dev`/`build`/`start` luôn chạy với cwd = apps/web (dù gọi qua `pnpm --filter web`
// hay `pnpm -C apps/web`), nên mặc định này tương ứng với `apps/web/.models/lama_fp32.onnx` trong repo.
const MODEL_PATH = process.env.LAMA_MODEL_PATH ?? join(process.cwd(), ".models", "lama_fp32.onnx");

let lama: ReturnType<typeof createLocalLama> | null = null;
let handler: ((req: Request) => Promise<Response>) | null = null;

function getLama() {
  lama ??= createLocalLama({ modelPath: MODEL_PATH });
  return lama;
}

function getHandler() {
  handler ??= createInpaintHandler({
    inpaint: (image, mask) => getLama().inpaint(image, mask),
    limiter: createRateLimiter({ limit: 30, windowMs: 60 * 60 * 1000 }),
    timeoutMs: 60_000,
  });
  return handler;
}

export async function POST(req: Request) {
  if (!getLama().isAvailable()) {
    return Response.json(
      {
        error: {
          kind: "VendorError",
          message: "Chưa có mô hình xóa đồ trên máy chủ — chạy pnpm --filter web fetch:lama",
        },
      },
      { status: 503 },
    );
  }
  return getHandler()(req);
}
