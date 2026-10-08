// Tải mô hình CC0 / CC-BY (Poly Haven, Khronos glTF Sample Assets), tối ưu (dedup, prune, weld, meshopt,
// nén texture WebP ≤ 1024px), đặt gốc ở tâm mặt đáy, rồi ghi public/models/<id>.glb + lib/models.json
// (kích thước thật) + CREDITS.md.
// Chạy lại được: bỏ qua bước tải nếu file nguồn đã có trong thư mục tạm.
import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { center, dedup, getBounds, meshopt, prune, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/models");
const TMP = join(tmpdir(), "yourspace-models");

/** id trong catalog → nguồn. */
const SOURCES = [
  { id: "sofa-nhung-xanh", khronos: "GlamVelvetSofa" },
  { id: "ghe-nhung-cam", khronos: "SheenChair" },
  { id: "den-san-xoan", khronos: "LightsPunctualLamp" },
  { id: "sofa-ni-xam", polyhaven: "sofa_02" },
  { id: "ban-tra-tron-thep", polyhaven: "coffee_table_round_01" },
  { id: "tu-go-thap", polyhaven: "modern_wooden_cabinet" },
  { id: "ban-canh-go", polyhaven: "side_table_01" },
  { id: "cay-xanh-chau-gom", polyhaven: "potted_plant_01" },
  { id: "cay-xanh-chau-cao", polyhaven: "potted_plant_02" },
  { id: "ghe-lounge-oc-cho", polyhaven: "mid_century_lounge_chair" },
  { id: "ban-tra-oc-cho", polyhaven: "modern_coffee_table_01" },
  { id: "tu-co-dien", polyhaven: "vintage_cabinet_01" },
  { id: "ghe-banh-khung-thep", polyhaven: "modern_arm_chair_01" },
  { id: "ke-thep-den", polyhaven: "steel_frame_shelves_03" },
  { id: "ban-tra-cong-nghiep", polyhaven: "industrial_coffee_table" },
  { id: "sen-da-chau-nho", polyhaven: "potted_plant_04" },
  { id: "binh-gom-men", polyhaven: "ceramic_vase_01" },
  { id: "binh-dong-co", polyhaven: "brass_vase_03" },
  { id: "den-ban-tay-gap", polyhaven: "desk_lamp_arm_01" },
];

const exists = (p) => access(p).then(() => true, () => false);

async function download(url, dest) {
  if (await exists(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tải ${url} thất bại: ${res.status}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function fetchPolyHaven(id) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
  const gltf = files.gltf["1k"].gltf;
  const dir = join(TMP, id);
  await download(gltf.url, join(dir, `${id}.gltf`));
  for (const [rel, f] of Object.entries(gltf.include)) await download(f.url, join(dir, rel));
  const info = await (await fetch(`https://api.polyhaven.com/info/${id}`)).json();
  const authors = Object.keys(info.authors ?? {}).join(", ");
  return { path: join(dir, `${id}.gltf`), credit: `"${info.name}" — ${authors}, Poly Haven (CC0)` };
}

async function fetchKhronos(name) {
  const base = `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/${name}`;
  const path = join(TMP, `${name}.glb`);
  await download(`${base}/glTF-Binary/${name}.glb`, path);
  const meta = await (await fetch(`${base}/metadata.json`)).json();
  const legal = (meta.legal ?? []).map((l) => `${l.artist} (${l.license})`).join("; ");
  return { path, credit: `"${name}" — ${legal}, Khronos glTF Sample Assets` };
}

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

await mkdir(OUT_DIR, { recursive: true });
const manifest = {};
const credits = [];

for (const src of SOURCES) {
  const { path, credit } = src.polyhaven ? await fetchPolyHaven(src.polyhaven) : await fetchKhronos(src.khronos);
  const doc = await io.read(path);
  await doc.transform(
    dedup(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024] }),
    weld(),
    center({ pivot: "below" }),
    meshopt({ encoder: MeshoptEncoder }),
  );
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
  const { min, max } = getBounds(scene);
  const file = `/models/${src.id}.glb`;
  await writeFile(join(OUT_DIR, `${src.id}.glb`), await io.writeBinary(doc));
  const r = (v) => Math.round(v * 1000) / 1000;
  manifest[src.id] = {
    file,
    dimsM: { widthM: r(max[0] - min[0]), heightM: r(max[1] - min[1]), depthM: r(max[2] - min[2]) },
    credit,
  };
  credits.push(`- \`${src.id}.glb\` — ${credit}`);
  console.log(`✓ ${src.id}`, manifest[src.id].dimsM);
}

await writeFile(join(ROOT, "lib/models.json"), JSON.stringify(manifest, null, 2) + "\n");
await writeFile(
  join(OUT_DIR, "CREDITS.md"),
  `# Mô hình 3D — nguồn và giấy phép\n\n` +
    `Sinh bởi \`pnpm --filter web build:models\`. Mô hình CC-BY phải giữ ghi công khi phân phối.\n` +
    `Texture đã được nén lại sang WebP, giới hạn tối đa 1024×1024px để giảm dung lượng .glb.\n\n` +
    `${credits.join("\n")}\n\n` +
    `## Ghi chú kích thước\n\n` +
    `- \`ban-tra-cong-nghiep\` (cao 0,64 m) hơi vượt khoảng gợi ý (bàn trà cao 0,3–0,5 m) ` +
    `nhưng vẫn là kích thước nội thất hợp lý trong thực tế (không lệch đơn vị kiểu cm/m), ` +
    `nên được giữ lại sau khi kiểm tra.\n`,
);
