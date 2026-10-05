/**
 * Mô hình 3D (GLB) của món cho bản thử đặt đồ kiểu IKEA: món dựng 3D bằng máy ảo khớp ảnh phòng (features/editor/
 * roomCamera.ts) ở trình chỉnh sửa, trên web và trên máy. Ảnh thu nhỏ (Lưu, Phòng của tôi…) dùng ảnh tách nền của món.
 * Khung bao đo từ chính mô hình (m): mặt trước hướng +Z, chân món ở y = 0. Nguồn miễn phí, ghi công ở tab Tôi.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- mô hình .glb nạp qua Metro bằng require, như ảnh. */

import type { ModelBounds } from '@/features/editor/roomCamera';

export type ProductModel = {
  /** Tài nguyên GLB (require). */
  source: number;
  bounds: ModelBounds;
  credit: string;
};

export const PRODUCT_MODELS: Partial<Record<string, ProductModel>> = {
  '3d-ban-tra-tron': {
    source: require('../../assets/models/3d-ban-tra-tron.glb'),
    bounds: { minX: -0.651, maxX: 0.651, minZ: -0.651, maxZ: 0.651, height: 0.49 },
    credit: 'Mô hình "Coffee Table Round 01" — Ulan Cabanilla, Poly Haven (CC0)',
  },
  '3d-ghe-nhung-cam': {
    source: require('../../assets/models/3d-ghe-nhung-cam.glb'),
    bounds: { minX: -0.414, maxX: 0.413, minZ: -0.277, maxZ: 0.294, height: 0.686 },
    credit: 'Mô hình "Sheen Chair" — Eric Chadwick / Wayfair, Khronos glTF Sample Assets (CC0)',
  },
  '3d-den-san-xoan': {
    source: require('../../assets/models/3d-den-san-xoan.glb'),
    bounds: { minX: -0.312, maxX: 0.815, minZ: -0.362, maxZ: 0.36, height: 1.875 },
    credit: 'Mô hình "Lamp with Punctual Lights" — DGG, Khronos glTF Sample Assets (CC-BY 4.0)',
  },
};

export function productModel(productId: string | undefined): ProductModel | undefined {
  return productId ? PRODUCT_MODELS[productId] : undefined;
}

/** Món này dựng bằng mô hình 3D (ở trình chỉnh sửa) thay cho ảnh tách nền. */
export function renders3D(productId: string | undefined): boolean {
  return productModel(productId) !== undefined;
}
