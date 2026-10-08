// Proxy tới service Python phân tích ảnh (services/calibrate). Tắt/không tới được → 503, web giữ cách làm tay.
const ANALYSIS_URL = process.env.CALIBRATE_URL ?? "http://127.0.0.1:8001";
const MAX_BYTES = 7_000_000;

export async function proxyAnalysis(req: Request, path: "/calibrate" | "/detect", timeoutMs: number, offline: string): Promise<Response> {
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!(len > 0 && len <= MAX_BYTES)) return Response.json({ error: "Ảnh quá lớn hoặc thiếu." }, { status: 400 });
  try {
    const res = await fetch(`${ANALYSIS_URL}${path}`, { method: "POST", body: await req.formData(), signal: AbortSignal.timeout(timeoutMs) });
    return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
  } catch {
    return Response.json({ error: offline }, { status: 503 });
  }
}
