/** Tóm tắt một không gian cho thẻ ở Phòng của tôi (E6-US3 AC1, AC2, CC2). */
import { findProduct } from '@/data/catalog';
import { findSamplePhoto } from '@/data/samplePhotos';
import { formatItemCount, formatVND } from '@/lib/format';
import type { Space } from '@/types';

export type SpaceSummary = {
  itemCount: number;
  purchasedCount: number;
  /** Tổng các món chưa mua và còn bán, theo giá hiện tại của catalog. */
  openTotal: number;
  /** Món ngừng bán, hết hàng hoặc không còn trong catalog (không tính vào dự toán). */
  unavailableNames: string[];
};

export function summarizeSpace(space: Space): SpaceSummary {
  let openTotal = 0;
  let purchasedCount = 0;
  const unavailableNames: string[] = [];
  for (const item of space.items) {
    if (item.purchased) {
      purchasedCount += 1;
      continue;
    }
    const product = findProduct(item.productId);
    if (!product || product.status !== 'available') {
      unavailableNames.push(product?.name ?? 'Một món');
      continue;
    }
    openTotal += product.priceVND;
  }
  return { itemCount: space.items.length, purchasedCount, openTotal, unavailableNames };
}

/** Dòng "N món · tổng" trên thẻ. */
export function summaryLine(s: SpaceSummary): string {
  if (s.itemCount === 0) return 'Chưa có món nào';
  if (s.purchasedCount === s.itemCount) return formatItemCount(s.itemCount);
  if (s.purchasedCount > 0) return `${formatItemCount(s.itemCount)} · còn ${formatVND(s.openTotal)} chưa mua`;
  return `${formatItemCount(s.itemCount)} · ${formatVND(s.openTotal)}`;
}

/** Ảnh của không gian không còn trên máy (tham chiếu hỏng) — thẻ báo lỗi và cho xóa. */
export function isPhotoMissing(photoUri: string | null): boolean {
  if (!photoUri) return true;
  if (photoUri.startsWith('sample:')) return !findSamplePhoto(photoUri);
  return false;
}
