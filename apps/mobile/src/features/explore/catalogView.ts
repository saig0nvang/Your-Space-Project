/**
 * Cách nhóm Khám phá đọc catalog: món nào được hiện, món tiêu biểu của phong cách, nhóm chất liệu cho chip lọc.
 * Chỉ đọc từ src/data/catalog.ts, không sửa dữ liệu nền.
 */
import { findProduct, productsByStyle } from '@/data/catalog';
import { findSamplePhoto, photoSource, samplePhotoRef } from '@/data/samplePhotos';
import type { Product, ProductCategory, StyleId } from '@/types';
import type { ImageSourcePropType } from 'react-native';

/** Món đủ dữ liệu để hiện (E1-US6 CC3): có giá, đủ ba kích thước, chưa ngừng bán. */
export function isDisplayable(p: Product): boolean {
  const d = p.dimensions;
  return p.priceVND > 0 && d.widthCm > 0 && d.depthCm > 0 && d.heightCm > 0 && p.status !== 'discontinued';
}

export function displayableProducts(styleId: StyleId): Product[] {
  return productsByStyle(styleId).filter(isDisplayable);
}

/**
 * Món dùng làm hình minh họa cho thẻ phong cách. Chọn cặp loại đồ khác nhau giữa các phong cách
 * để ba thẻ không trông giống nhau (hình minh họa vẽ theo loại đồ, chưa phải ảnh phong cách thật).
 */
const HIGHLIGHT_IDS: Record<StyleId, string[]> = {
  japandi: ['jp-sofa-lanh', 'jp-den-may'],
  'mid-century': ['mc-ke-oc-cho', 'mc-ghe-banh'],
  bauhaus: ['bh-ghe-thep', 'bh-ban-tra-kinh'],
};

export function styleHighlights(styleId: StyleId): Product[] {
  const picked = HIGHLIGHT_IDS[styleId]
    .map((id) => findProduct(id))
    .filter((p): p is Product => p !== undefined && p.styleId === styleId && isDisplayable(p));
  return picked.length > 0 ? picked : displayableProducts(styleId).slice(0, 2);
}

/** Thứ tự chip loại đồ. */
export const CATEGORY_ORDER: ProductCategory[] = ['sofa', 'table', 'chair', 'shelf', 'lamp'];

export type MaterialKey = 'wood' | 'fabric' | 'rattan' | 'metal' | 'glass' | 'leather' | 'brass';

export const MATERIAL_LABEL: Record<MaterialKey, string> = {
  wood: 'Gỗ',
  fabric: 'Vải',
  rattan: 'Mây',
  metal: 'Thép',
  glass: 'Kính',
  leather: 'Da',
  brass: 'Đồng',
};

export const MATERIAL_ORDER = Object.keys(MATERIAL_LABEL) as MaterialKey[];

/** Từ khóa trong `product.material` ứng với từng nhóm chất liệu (so khớp nguyên từ). */
const MATERIAL_WORDS: Record<MaterialKey, string[]> = {
  wood: ['gỗ'],
  fabric: ['vải', 'lanh', 'nhung'],
  rattan: ['mây'],
  metal: ['thép'],
  glass: ['kính'],
  leather: ['da'],
  brass: ['đồng'],
};

/** Nhóm chất liệu suy từ mô tả chất liệu của món. Một món có thể thuộc nhiều nhóm. */
export function materialKeys(p: Product): MaterialKey[] {
  const words = new Set(
    p.material
      .normalize('NFC')
      .toLowerCase()
      .split(/[\s,.;:()/-]+/),
  );
  return MATERIAL_ORDER.filter((k) => MATERIAL_WORDS[k].some((w) => words.has(w)));
}

const SAMPLE_PREFIX = samplePhotoRef('');

/**
 * Nguồn ảnh của một không gian, hoặc undefined khi ảnh không còn (không có ảnh, hoặc ảnh mẫu không tồn tại).
 * Ảnh thật (uri) bị xóa khỏi máy thì chỉ biết khi tải lỗi — xử lý ở onError của ảnh.
 */
export function resolveSpacePhoto(ref: string | null): ImageSourcePropType | undefined {
  if (!ref) return undefined;
  if (ref.startsWith(SAMPLE_PREFIX) && !findSamplePhoto(ref)) return undefined;
  return photoSource(ref);
}
