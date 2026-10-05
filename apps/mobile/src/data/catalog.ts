/**
 * Catalog MẪU cho bản thử. Repo chưa có catalog thật: tên món, nhà cung cấp và giá dưới đây là dữ liệu mẫu.
 * Bốn món đầu giữ giá đã dùng trong PRD và flow "Hành trình YourSpace"; tên, chất liệu và kích thước đã chỉnh
 * cho khớp ảnh mẫu (data/productImages) — ví dụ "Đèn sàn mây" thành "Đèn sàn chao vải" vì chưa có ảnh đèn mây phù hợp.
 * Thay bằng dữ liệu thật của nhà cung cấp khi có (PRODUCT.md · Evidence on Hand).
 */
import type { Product, Style, StyleId, Supplier } from '@/types';

export const STYLES: Style[] = [
  {
    id: 'japandi',
    name: 'Japandi',
    summary: 'Gỗ sáng, đường nét gọn, nhiều khoảng thở.',
    traits: {
      colors: 'Be, xám ấm, trắng ngà',
      materials: 'Gỗ sồi, gỗ tần bì, mây, vải lanh',
      mood: 'Tĩnh, mộc, gọn gàng',
    },
    materialKeys: ['oak', 'ash', 'rattan', 'linen'],
  },
  {
    id: 'mid-century',
    name: 'Mid-Century',
    summary: 'Gỗ óc chó, chân thon, đường cong mềm.',
    traits: {
      colors: 'Nâu óc chó, cam đất, vàng mù tạt, xanh lục',
      materials: 'Gỗ óc chó, nhung, đồng',
      mood: 'Ấm, hoài cổ, có điểm nhấn',
    },
    materialKeys: ['walnut', 'velvetMoss', 'brass'],
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus',
    summary: 'Hình khối rõ, thép uốn, đen trắng dứt khoát.',
    traits: {
      colors: 'Đen, trắng, ánh thép',
      materials: 'Thép mạ crôm, kính, da',
      mood: 'Rõ ràng, công năng, cá tính',
    },
    materialKeys: ['steelBlack', 'chrome', 'glass', 'leather'],
  },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'sup-a', name: 'Xưởng gỗ A', deliveryMinDays: 5, deliveryMaxDays: 7, contactNote: 'Số liên hệ hiện khi nhà cung cấp xác nhận đơn.' },
  { id: 'sup-b', name: 'Xưởng đèn B', deliveryMinDays: 2, deliveryMaxDays: 3, contactNote: 'Số liên hệ hiện khi nhà cung cấp xác nhận đơn.' },
  { id: 'sup-c', name: 'Xưởng sofa C', deliveryMinDays: 7, deliveryMaxDays: 10, contactNote: 'Số liên hệ hiện khi nhà cung cấp xác nhận đơn.' },
  { id: 'sup-d', name: 'Xưởng thép D', deliveryMinDays: 4, deliveryMaxDays: 6, contactNote: 'Số liên hệ hiện khi nhà cung cấp xác nhận đơn.' },
];

export const PRODUCTS: Product[] = [
  // ── Món 3D cho bản thử đặt đồ kiểu IKEA (founder yêu cầu 2026-10-04): dựng bằng mô hình GLB miễn phí, xóa được khi
  // không cần nữa (xóa cả mục tương ứng ở data/productModels.ts và data/productImages.ts).
  {
    id: '3d-ban-tra-tron',
    name: 'Bàn trà tròn chân thép (3D)',
    category: 'table',
    styleId: 'japandi',
    supplierId: 'sup-d',
    priceVND: 4_600_000,
    dimensions: { widthCm: 130, depthCm: 130, heightCm: 49 },
    material: 'Mặt đá nhân tạo xám nhạt, chân thép uốn sơn đen',
    description: 'Mẫu 3D để thử đặt đồ: món dựng theo góc máy của ảnh phòng, nhìn từ góc nào cũng đúng phối cảnh.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'frostedGlass', frame: 'steelBlack' },
  },
  {
    id: '3d-ghe-nhung-cam',
    name: 'Ghế nhung cam (3D)',
    category: 'chair',
    styleId: 'japandi',
    supplierId: 'sup-c',
    priceVND: 5_900_000,
    dimensions: { widthCm: 83, depthCm: 57, heightCm: 69 },
    material: 'Bọc nhung màu cam, chân gỗ sồi sẫm',
    description: 'Mẫu 3D để thử đặt đồ: món dựng theo góc máy của ảnh phòng, nhìn từ góc nào cũng đúng phối cảnh.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'woven', frame: 'walnut' },
  },
  {
    id: '3d-den-san-xoan',
    name: 'Đèn sàn thân xoắn (3D)',
    category: 'lamp',
    styleId: 'japandi',
    supplierId: 'sup-b',
    priceVND: 3_400_000,
    dimensions: { widthCm: 113, depthCm: 72, heightCm: 187 },
    material: 'Thân kim loại giả đồng uốn xoắn, chao giấy hình hoa',
    description: 'Mẫu 3D để thử đặt đồ: món dựng theo góc máy của ảnh phòng, nhìn từ góc nào cũng đúng phối cảnh.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'paperCord', frame: 'brass' },
  },
  {
    id: 'jp-sofa-lanh',
    name: 'Sofa vải lanh',
    category: 'sofa',
    styleId: 'japandi',
    supplierId: 'sup-a',
    priceVND: 12_400_000,
    dimensions: { widthCm: 220, depthCm: 88, heightCm: 72 },
    material: 'Khung gỗ sồi, bọc vải lanh màu be xám',
    description: 'Sofa ba chỗ, lưng thấp, tay vịn nan gỗ, nệm ngồi tháo được để giặt.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'linen', frame: 'oak' },
  },
  {
    id: 'jp-ban-tra-soi',
    name: 'Bàn trà sồi',
    category: 'table',
    styleId: 'japandi',
    supplierId: 'sup-a',
    priceVND: 3_200_000,
    dimensions: { widthCm: 110, depthCm: 50, heightCm: 40 },
    material: 'Gỗ sồi tự nhiên, dầu lau',
    description: 'Mặt chữ nhật, hai chân tấm gỗ đặc, dáng thấp.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'oak', frame: 'oak' },
  },
  {
    id: 'jp-den-may',
    name: 'Đèn sàn chao vải',
    category: 'lamp',
    styleId: 'japandi',
    supplierId: 'sup-b',
    priceVND: 1_850_000,
    dimensions: { widthCm: 42, depthCm: 42, heightCm: 150 },
    material: 'Chao vải màu nâu, thân kim loại màu đồng, đế gỗ',
    description: 'Ánh sáng vàng dịu hắt xuống, hợp góc đọc sách cạnh sofa.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'linen', frame: 'walnut' },
  },
  {
    id: 'mc-ke-oc-cho',
    name: 'Kệ tủ óc chó',
    category: 'shelf',
    styleId: 'mid-century',
    supplierId: 'sup-a',
    priceVND: 10_450_000,
    dimensions: { widthCm: 160, depthCm: 45, heightCm: 74 },
    material: 'Gỗ óc chó, chân gỗ vát',
    description: 'Kệ tủ thấp ba khoang: hai bên ngăn kéo, giữa là cửa có hoa văn khắc chìm.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'walnut', frame: 'walnut' },
  },
  {
    id: 'jp-ghe-tan-bi',
    name: 'Ghế gỗ sồi đan dây',
    category: 'chair',
    styleId: 'japandi',
    supplierId: 'sup-a',
    priceVND: 2_600_000,
    dimensions: { widthCm: 55, depthCm: 51, heightCm: 76 },
    material: 'Gỗ sồi, mặt ngồi đan dây giấy',
    description: 'Ghế ăn lưng cong chữ Y, nhẹ, dễ dời.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'paperCord', frame: 'oak' },
  },
  {
    id: 'mc-sofa-nhung',
    name: 'Sofa nhung xanh lục',
    category: 'sofa',
    styleId: 'mid-century',
    supplierId: 'sup-c',
    priceVND: 14_800_000,
    dimensions: { widthCm: 214, depthCm: 92, heightCm: 82 },
    material: 'Bọc nhung xanh lục, chân gỗ sồi',
    description: 'Sofa ba chỗ, tay vịn cong, nệm lưng rời.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'velvetMoss', frame: 'oak' },
  },
  {
    id: 'mc-ghe-banh',
    name: 'Ghế bành chân thon',
    category: 'chair',
    styleId: 'mid-century',
    supplierId: 'sup-c',
    priceVND: 6_900_000,
    dimensions: { widthCm: 68, depthCm: 76, heightCm: 85 },
    material: 'Khung gỗ óc chó, bọc vải dệt màu vàng mù tạt',
    description: 'Ghế bành một chỗ, tay vịn gỗ, hợp góc đọc sách.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'woven', frame: 'walnut' },
  },
  {
    id: 'mc-den-ban-dong',
    name: 'Đèn bàn đồng',
    category: 'lamp',
    styleId: 'mid-century',
    supplierId: 'sup-b',
    priceVND: 1_450_000,
    dimensions: { widthCm: 36, depthCm: 36, heightCm: 52 },
    material: 'Thân và chao bằng đồng',
    description: 'Đèn dáng nấm, chao bán cầu hắt sáng xuống mặt bàn hoặc kệ.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'brass', frame: 'brass' },
  },
  {
    id: 'bh-ghe-thep',
    name: 'Ghế thép uốn có tay',
    category: 'chair',
    styleId: 'bauhaus',
    supplierId: 'sup-d',
    priceVND: 3_900_000,
    dimensions: { widthCm: 58, depthCm: 60, heightCm: 80 },
    material: 'Thép mạ crôm, đệm da đen',
    description: 'Ghế khung thép uốn liền, không chân sau, có tay vịn.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'leather', frame: 'chrome' },
  },
  {
    id: 'bh-ban-tra-kinh',
    name: 'Bàn trà kính chân crôm',
    category: 'table',
    styleId: 'bauhaus',
    supplierId: 'sup-d',
    priceVND: 4_200_000,
    dimensions: { widthCm: 90, depthCm: 90, heightCm: 40 },
    material: 'Kính cường lực màu khói, chân thép mạ crôm',
    description: 'Mặt kính vuông, bốn chân khối vuông để lộ kết cấu.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'glass', frame: 'chrome' },
  },
  {
    id: 'bh-ke-thep',
    name: 'Kệ thép đen năm tầng',
    category: 'shelf',
    styleId: 'bauhaus',
    supplierId: 'sup-d',
    priceVND: 4_800_000,
    dimensions: { widthCm: 150, depthCm: 38, heightCm: 175 },
    material: 'Thép sơn tĩnh điện đen, mặt gỗ nhuộm tối',
    description: 'Kệ hai khoang, năm tầng, bắt vít cố định vào tường.',
    status: 'available',
    needsInstall: true,
    tones: { body: 'walnut', frame: 'steelBlack' },
  },
  {
    id: 'bh-den-san-thep',
    name: 'Đèn sàn cần cong',
    category: 'lamp',
    styleId: 'bauhaus',
    supplierId: 'sup-b',
    priceVND: 2_300_000,
    dimensions: { widthCm: 170, depthCm: 40, heightCm: 200 },
    material: 'Cần thép mạ crôm, chao bán cầu, đế đá',
    description: 'Cần cong vươn xa, đặt cạnh sofa mà chiếu được tới giữa phòng.',
    status: 'available',
    needsInstall: false,
    tones: { body: 'chrome', frame: 'steelBlack' },
  },
];

export function getStyle(id: StyleId): Style {
  const s = STYLES.find((x) => x.id === id);
  if (!s) throw new Error(`Không có phong cách ${id}`);
  return s;
}

export function findStyle(id: string | undefined): Style | undefined {
  return STYLES.find((x) => x.id === id);
}

export function findProduct(id: string | undefined): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getSupplier(id: string): Supplier {
  const s = SUPPLIERS.find((x) => x.id === id);
  if (!s) throw new Error(`Không có nhà cung cấp ${id}`);
  return s;
}

export function productsByStyle(styleId: StyleId): Product[] {
  return PRODUCTS.filter((p) => p.styleId === styleId);
}
