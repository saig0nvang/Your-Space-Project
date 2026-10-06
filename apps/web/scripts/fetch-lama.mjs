// Tải model LaMa ONNX (Carve/LaMa-ONNX, ~208 MB) cho Xóa đồ tự host (D11), ghi vào
// apps/web/.models/lama_fp32.onnx (hoặc $LAMA_MODEL_PATH). Bỏ qua nếu file đã có.
// Tải ra file tạm cùng thư mục rồi rename — tránh để lại file nửa vời nếu mất mạng giữa chừng.
import { mkdir, rename, rm, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const URL_LAMA = "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx";
const dest = process.env.LAMA_MODEL_PATH ?? join(process.cwd(), ".models", "lama_fp32.onnx");
const tmp = `${dest}.part`;

async function exists(p) {
  return stat(p).then(() => true, () => false);
}

if (await exists(dest)) {
  const { size } = await stat(dest);
  console.log(`Đã có ${dest} (${(size / 1024 / 1024).toFixed(1)} MB) — bỏ qua tải.`);
  process.exit(0);
}

await mkdir(dirname(dest), { recursive: true });
console.log(`Tải ${URL_LAMA}\n→ ${tmp}`);

const res = await fetch(URL_LAMA);
if (!res.ok || !res.body) {
  throw new Error(`Tải LaMa thất bại: HTTP ${res.status}`);
}
try {
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp));
} catch (err) {
  await rm(tmp, { force: true });
  throw err;
}

await rename(tmp, dest);
const { size } = await stat(dest);
console.log(`Xong — ${dest} (${(size / 1024 / 1024).toFixed(1)} MB).`);
