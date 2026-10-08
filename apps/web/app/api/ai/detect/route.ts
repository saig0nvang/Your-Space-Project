// Grounding DINO tìm đồ nội thất trong ảnh (services/calibrate /detect). Tắt → 503, Xóa đồ vẫn chạm chọn tay.
import { proxyAnalysis } from "@/lib/server/analysisProxy";

export const runtime = "nodejs";

// Lần đầu service còn tải model (~700 MB) — để rộng tay.
export const POST = (req: Request) => proxyAnalysis(req, "/detect", 120_000, "Chưa bật dịch vụ nhận diện đồ.");
