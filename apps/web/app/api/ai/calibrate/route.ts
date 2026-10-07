// Proxy tới service Python GeoCalib (services/calibrate). Tắt/không tới được → 503, web quay về chân trời giữa ảnh.
export const runtime = "nodejs";

const CALIBRATE_URL = process.env.CALIBRATE_URL ?? "http://127.0.0.1:8001";
const MAX_BYTES = 7_000_000;

export async function POST(req: Request) {
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!(len > 0 && len <= MAX_BYTES)) return Response.json({ error: "Ảnh quá lớn hoặc thiếu." }, { status: 400 });
  try {
    const res = await fetch(`${CALIBRATE_URL}/calibrate`, {
      method: "POST",
      body: await req.formData(),
      signal: AbortSignal.timeout(20_000),
    });
    return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
  } catch {
    return Response.json({ error: "Chưa bật dịch vụ đoán tầm mắt." }, { status: 503 });
  }
}
