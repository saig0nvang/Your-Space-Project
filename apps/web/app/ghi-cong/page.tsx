import Link from "next/link";
import { STYLES } from "@/lib/catalog";
import models from "@/lib/models.json";

const AI = [
  { name: "GeoCalib — tự đoán tầm mắt, góc nhìn", by: "ETH Zürich (cvg/GeoCalib)", license: "Mã nguồn Apache-2.0 · trọng số CC BY 4.0", url: "https://github.com/cvg/GeoCalib" },
  { name: "Depth Anything V2 Small — chiều sâu ảnh", by: "Depth Anything (onnx-community)", license: "Apache-2.0", url: "https://huggingface.co/onnx-community/depth-anything-v2-small" },
  { name: "SlimSAM — chạm chọn đồ", by: "Xenova/slimsam-77-uniform", license: "Apache-2.0", url: "https://huggingface.co/Xenova/slimsam-77-uniform" },
  { name: "LaMa — xóa đồ", by: "Samsung AI (Carve/LaMa-ONNX)", license: "Apache-2.0", url: "https://huggingface.co/Carve/LaMa-ONNX" },
];

// Ảnh phòng mẫu đang dùng ở /thu-phong (SAMPLE_ROOMS); nguồn đầy đủ: public/golden/CREDITS.md.
const ROOMS = [
  { file: "Ảnh mẫu 1", by: "Kwameghana", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:A_standard_living_room_in_Accra.jpg" },
  { file: "Ảnh mẫu 2", by: "Mike Peel (mikepeel.net)", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:At_La_Palma_2021_1854.jpg" },
  { file: "Ảnh mẫu 3", by: "Olashxs", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:A_Kenya_(11).jpg" },
  { file: "Ảnh mẫu 5", by: "J.Stiegler", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:7.5_Wohnzimmer._Poliert.jpg" },
  { file: "Ảnh mẫu 12", by: "IFERREIRO", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Bedroom_king_size.jpg" },
  { file: "Ảnh mẫu 14", by: "linhvan", license: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:Bedroom_with_wooden_bed_(1133).jpg" },
];

const h2 = "text-[20px] leading-[25px] font-semibold mt-6";
const li = "text-[15px] leading-5";
const a = "underline underline-offset-2";

export default function CreditsPage() {
  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col gap-3">
      <Link href="/" className="text-[15px] text-muted-foreground">← YourSpace</Link>
      <h1 className="font-display font-extrabold text-[34px] leading-[40px] tracking-[-1px]">Ghi công</h1>
      <p className="text-[15px] text-muted-foreground">Bản demo dùng các mô hình và tư liệu mở dưới đây, theo giấy phép của từng tác giả.</p>

      <h2 className={h2}>Mô hình AI</h2>
      <ul className="flex flex-col gap-2">
        {AI.map((m) => <li key={m.name} className={li}><a className={a} href={m.url}>{m.name}</a> — {m.by} · {m.license}</li>)}
      </ul>

      <h2 className={h2}>Mô hình 3D</h2>
      <ul className="flex flex-col gap-2">
        {Object.values(models as Record<string, { credit: string }>).map((m) => <li key={m.credit} className={li}>{m.credit}</li>)}
      </ul>

      <h2 className={h2}>Ảnh phong cách</h2>
      <ul className="flex flex-col gap-2">
        {STYLES.map((s) => <li key={s.id} className={li}>{s.name} — {s.photoCredit}</li>)}
      </ul>

      <h2 className={h2}>Ảnh phòng mẫu (Wikimedia Commons)</h2>
      <ul className="flex flex-col gap-2">
        {ROOMS.map((r) => <li key={r.file} className={li}>{r.file} — <a className={a} href={r.url}>{r.by}</a> · {r.license}</li>)}
      </ul>
    </main>
  );
}
