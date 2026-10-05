/**
 * Logic thuần của trình chỉnh sửa (E1): ảnh chụp lịch sử, dự toán, "có thay đổi chưa lưu".
 * Không phụ thuộc React để dễ dùng lại ở E2 và khi build bản thật.
 */
import { findProduct } from '@/data/catalog';
import type { ErasedRegion, PlacedItem, Space } from '@/types';

/** Một bước trong lịch sử hoàn tác: chỉ những gì thao tác trên canvas đổi được. */
export type Snapshot = {
  items: PlacedItem[];
  erasedRegions: ErasedRegion[];
  floorLineY: number;
};

/** Hoàn tác tối thiểu 10 bước (E4-US7 AC1); giữ dư để không chạm trần khi thử nhiều. */
export const HISTORY_LIMIT = 30;

export function snapshotOf(space: Space): Snapshot {
  return { items: space.items, erasedRegions: space.erasedRegions, floorLineY: space.calibration.floorLineY };
}

export function sameSnapshot(a: Snapshot, b: Snapshot): boolean {
  return a.items === b.items && a.erasedRegions === b.erasedRegions && a.floorLineY === b.floorLineY;
}

/**
 * Món đã mua không đi theo lịch sử hoàn tác: nhãn "Đã mua" ghi ngoài lịch sử (sau khi thanh toán), nên khi
 * hoàn tác / làm lại thì giữ cờ đã mua theo trạng thái hiện tại, và giữ lại món đã mua mà bước cũ chưa có.
 * Nếu không, hoàn tác sẽ gỡ nhãn và mở lại đường mua món đó lần hai (critique 2026-10-03, P1).
 */
export function keepPurchased(snapItems: PlacedItem[], current: PlacedItem[]): PlacedItem[] {
  const bought = new Map(current.filter((it) => it.purchased).map((it) => [it.id, it]));
  if (bought.size === 0) return snapItems;
  const out = snapItems.map((it) => (bought.has(it.id) && !it.purchased ? { ...it, purchased: true } : it));
  for (const [id, it] of bought) {
    if (!snapItems.some((s) => s.id === id)) out.push(it);
  }
  return out;
}

/** Áp một bước lịch sử (hoàn tác / làm lại) lên không gian, giữ nguyên các món đã mua. */
export function restoreSnapshot(space: Space, snap: Snapshot): Partial<Space> {
  return patchFromSnapshot(space, { ...snap, items: keepPurchased(snap.items, space.items) });
}

export function patchFromSnapshot(space: Space, snap: Snapshot): Partial<Space> {
  return {
    items: snap.items,
    erasedRegions: snap.erasedRegions,
    calibration: { ...space.calibration, floorLineY: snap.floorLineY },
  };
}

const SAVE_CLOCK_SLACK_MS = 5;

/**
 * Có thay đổi chưa lưu: bản nháp chưa từng lưu nhưng đã có món hoặc vùng đã xóa,
 * hoặc không gian đã lưu bị sửa sau lần lưu gần nhất.
 */
export function hasUnsavedChanges(space: Space): boolean {
  if (space.savedAt === null) return space.items.length > 0 || space.erasedRegions.length > 0;
  // Dung sai vài ms: store đặt savedAt và updatedAt bằng hai lần gọi Date.now() liên tiếp.
  return space.updatedAt - space.savedAt > SAVE_CLOCK_SLACK_MS;
}

export type Estimate = {
  /** Tổng tiền các món chưa mua. */
  total: number;
  /** Số món chưa mua. */
  count: number;
  purchasedCount: number;
  /** Id món đã đặt (PlacedItem.id) chưa mua — truyền cho sheet Mua. */
  unpurchasedIds: string[];
};

export function estimateOf(items: PlacedItem[]): Estimate {
  let total = 0;
  let purchasedCount = 0;
  const unpurchasedIds: string[] = [];
  for (const it of items) {
    if (it.purchased) {
      purchasedCount += 1;
      continue;
    }
    const p = findProduct(it.productId);
    if (!p) continue;
    total += p.priceVND;
    unpurchasedIds.push(it.id);
  }
  return { total, count: unpurchasedIds.length, purchasedCount, unpurchasedIds };
}
