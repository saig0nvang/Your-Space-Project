// GeoCalib đoán tầm mắt (services/calibrate). Tắt → 503, web quay về chân trời giữa ảnh.
import { proxyAnalysis } from "@/lib/server/analysisProxy";

export const runtime = "nodejs";

export const POST = (req: Request) => proxyAnalysis(req, "/calibrate", 20_000, "Chưa bật dịch vụ đoán tầm mắt.");
