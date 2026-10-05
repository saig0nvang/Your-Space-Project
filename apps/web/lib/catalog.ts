// Catalog MẪU cho bản demo: tên, nhà cung cấp, giá là dữ liệu mẫu (phong cách, nhà cung cấp lấy theo
// apps/mobile/src/data/catalog.ts). Kích thước đo từ chính mô hình (lib/models.json, sinh bởi scripts/build-models.mjs).
import type { Category, FurnitureModel, Style, StyleId, Supplier } from "@yourspace/core";
import models from "./models.json";

type ModelEntry = { file: string; dimsM: { widthM: number; heightM: number; depthM: number }; credit: string };
const MODEL_FILES = models as Record<string, ModelEntry>;

export const STYLES: Style[] = [
  {
    id: "japandi",
    name: "Japandi",
    summary: "Gỗ sáng, đường nét gọn, nhiều khoảng thở.",
    traits: { colors: "Be, xám ấm, trắng ngà", materials: "Gỗ sồi, gỗ tần bì, mây, vải lanh", mood: "Tĩnh, mộc, gọn gàng" },
    photo: "/styles/japandi.jpg",
    photoCredit: "Puscas Adryan, Unsplash",
  },
  {
    id: "mid-century",
    name: "Mid-Century",
    summary: "Gỗ óc chó, chân thon, đường cong mềm.",
    traits: { colors: "Nâu óc chó, cam đất, vàng mù tạt, xanh lục", materials: "Gỗ óc chó, nhung, đồng", mood: "Ấm, hoài cổ, có điểm nhấn" },
    photo: "/styles/mid-century.jpg",
    photoCredit: "Stephen Leonardi, Pexels",
  },
  {
    id: "bauhaus",
    name: "Bauhaus",
    summary: "Hình khối rõ, thép uốn, đen trắng dứt khoát.",
    traits: { colors: "Đen, trắng, ánh thép", materials: "Thép mạ crôm, kính, da", mood: "Rõ ràng, công năng, cá tính" },
    photo: "/styles/bauhaus.jpg",
    photoCredit: "Ksenia Chernaya, Pexels",
  },
];

export const SUPPLIERS: Supplier[] = [
  { id: "sup-a", name: "Xưởng gỗ A", deliveryMinDays: 5, deliveryMaxDays: 7 },
  { id: "sup-b", name: "Xưởng đèn B", deliveryMinDays: 2, deliveryMaxDays: 3 },
  { id: "sup-c", name: "Xưởng sofa C", deliveryMinDays: 7, deliveryMaxDays: 10 },
  { id: "sup-d", name: "Xưởng thép D", deliveryMinDays: 4, deliveryMaxDays: 6 },
  { id: "sup-e", name: "Nhà vườn E", deliveryMinDays: 1, deliveryMaxDays: 2 },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  sofa: "Sofa", chair: "Ghế", table: "Bàn", shelf: "Tủ, kệ", lamp: "Đèn", plant: "Cây",
};

type Entry = Omit<FurnitureModel, "dimsM" | "glbUrl" | "baseYawRad"> & { baseYawRad?: number };

const ENTRIES: Entry[] = [
  { id: "sofa-vai-be", name: "Sofa vải be ba chỗ", styleId: "japandi", category: "sofa", supplierId: "sup-c", priceVND: 12_400_000, material: "Khung gỗ, bọc vải màu be" },
  { id: "tu-go-thap", name: "Tủ gỗ thấp", styleId: "japandi", category: "shelf", supplierId: "sup-a", priceVND: 7_800_000, material: "Gỗ tự nhiên, dầu lau" },
  { id: "ban-canh-go", name: "Bàn cạnh gỗ", styleId: "japandi", category: "table", supplierId: "sup-a", priceVND: 1_900_000, material: "Gỗ tự nhiên" },
  { id: "cay-xanh-chau-gom", name: "Cây xanh chậu gốm", styleId: "japandi", category: "plant", supplierId: "sup-e", priceVND: 650_000, material: "Cây thật, chậu gốm" },
  { id: "den-san-xoan", name: "Đèn sàn thân xoắn", styleId: "japandi", category: "lamp", supplierId: "sup-b", priceVND: 3_400_000, material: "Thân kim loại giả đồng, chao giấy" },
  { id: "sofa-nhung-xanh", name: "Sofa nhung", styleId: "mid-century", category: "sofa", supplierId: "sup-c", priceVND: 18_900_000, material: "Bọc nhung, chân kim loại" },
  { id: "ghe-lounge-oc-cho", name: "Ghế lounge gỗ óc chó", styleId: "mid-century", category: "chair", supplierId: "sup-c", priceVND: 9_500_000, material: "Gỗ óc chó, nệm da" },
  { id: "ghe-nhung-cam", name: "Ghế nhung", styleId: "mid-century", category: "chair", supplierId: "sup-c", priceVND: 5_900_000, material: "Bọc nhung, chân gỗ sẫm" },
  { id: "ban-tra-oc-cho", name: "Bàn trà gỗ óc chó", styleId: "mid-century", category: "table", supplierId: "sup-a", priceVND: 4_200_000, material: "Gỗ óc chó" },
  { id: "tu-co-dien", name: "Tủ cổ điển", styleId: "mid-century", category: "shelf", supplierId: "sup-a", priceVND: 8_600_000, material: "Gỗ sẫm màu" },
  { id: "sofa-ni-xam", name: "Sofa nỉ", styleId: "bauhaus", category: "sofa", supplierId: "sup-c", priceVND: 14_200_000, material: "Bọc nỉ, khung thép" },
  { id: "ghe-banh-khung-thep", name: "Ghế bành khung thép", styleId: "bauhaus", category: "chair", supplierId: "sup-d", priceVND: 6_800_000, material: "Khung thép, nệm bọc" },
  { id: "ban-tra-tron-thep", name: "Bàn trà tròn chân thép", styleId: "bauhaus", category: "table", supplierId: "sup-d", priceVND: 4_600_000, material: "Mặt tròn, chân thép uốn" },
  { id: "ban-tra-cong-nghiep", name: "Bàn trà khung thép", styleId: "bauhaus", category: "table", supplierId: "sup-d", priceVND: 3_500_000, material: "Khung thép, mặt gỗ" },
  { id: "ke-thep-den", name: "Kệ khung thép", styleId: "bauhaus", category: "shelf", supplierId: "sup-d", priceVND: 3_900_000, material: "Khung thép sơn" },
  { id: "cay-xanh-chau-cao", name: "Cây xanh chậu cao", styleId: "bauhaus", category: "plant", supplierId: "sup-e", priceVND: 790_000, material: "Cây thật, chậu cao" },
];

export const MODELS: FurnitureModel[] = ENTRIES.flatMap((e) => {
  const f = MODEL_FILES[e.id];
  if (!f) return []; // món bị loại ở bước dựng mô hình
  return [{ ...e, dimsM: f.dimsM, glbUrl: f.file, baseYawRad: e.baseYawRad ?? 0 }];
});

const modelMap = new Map(MODELS.map((m) => [m.id, m]));
export const modelById = (id: string): FurnitureModel | undefined => modelMap.get(id);
export const styleById = (id: string): Style | undefined => STYLES.find((s) => s.id === id);
export const modelsOfStyle = (id: StyleId): FurnitureModel[] => MODELS.filter((m) => m.styleId === id);

/** Ảnh mẫu cho /thu-phong (bộ golden, nguồn ở public/golden/CREDITS.md); ưu tiên ảnh "tin được" ở cả hai chế độ trong spike 2026-10-04. */
export const SAMPLE_ROOMS: { url: string; label: string }[] = [1, 2, 3, 5, 12, 14].map((n) => ({
  url: `/golden/rooms/room-${String(n).padStart(2, "0")}.jpg`,
  label: `Ảnh mẫu ${n}`,
}));
