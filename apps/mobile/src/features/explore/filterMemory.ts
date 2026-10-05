/**
 * Bộ nhớ của K3 theo từng phong cách, sống trong phiên app (E1-US6 AC5: quay lại giữ bộ lọc và vị trí cuộn).
 * Khi K4 đẩy lên trên, K3 vẫn mounted nên tự giữ; bộ nhớ này giữ cả khi người dùng rời K3 rồi vào lại.
 * Chỉ ghi trong event handler, không ghi trong render.
 */
import type { ProductCategory } from '@/types';

import type { MaterialKey } from './catalogView';

export type ProductListMemory = {
  categories: ProductCategory[];
  materials: MaterialKey[];
  scrollY: number;
};

const EMPTY: ProductListMemory = { categories: [], materials: [], scrollY: 0 };

const memory = new Map<string, ProductListMemory>();

export function readProductListMemory(styleId: string): ProductListMemory {
  return memory.get(styleId) ?? EMPTY;
}

export function writeProductListMemory(styleId: string, patch: Partial<ProductListMemory>) {
  memory.set(styleId, { ...readProductListMemory(styleId), ...patch });
}
