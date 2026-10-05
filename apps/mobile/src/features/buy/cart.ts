/**
 * Dữ liệu của sheet Mua suy ra từ buySession + không gian + catalog. Mọi màn M1–TT7 đọc qua đây
 * để tổng tiền, nhóm nhà cung cấp và danh sách dòng đơn luôn khớp nhau.
 */
import { findProduct, getSupplier } from '@/data/catalog';
import { useAppStore, type BuySession } from '@/store/appStore';
import type { OrderItem, Product, Space, Supplier } from '@/types';

import { readSessionScoped, useSessionScoped, type SessionScoped } from './flowStore';

export type CartEntry = {
  /** Id món đã đặt (origin space) hoặc id sản phẩm (origin product). */
  key: string;
  product: Product;
  supplier: Supplier;
  /** Đã mua trong một lần trước (nhãn "Đã mua"). */
  purchased: boolean;
  /** Lý do không chọn được. */
  blocked: 'discontinued' | 'out_of_stock' | null;
  /** Giá hiện tại (giá mới đã xác nhận nếu có). */
  priceVND: number;
  selected: boolean;
};

export type CartGroup = {
  supplier: Supplier;
  entries: CartEntry[];
  selected: CartEntry[];
  subtotal: number;
  needsInstall: boolean;
};

export type BuyCart =
  | { status: 'no_session' }
  | { status: 'missing_origin'; session: BuySession }
  | {
      status: 'ok';
      session: BuySession;
      space: Space | undefined;
      spaceId: string | null;
      entries: CartEntry[];
      groups: CartGroup[];
      selected: CartEntry[];
      /** Nhóm có ít nhất một món đang chọn — mỗi nhóm thành một đơn. */
      selectedGroups: CartGroup[];
      total: number;
      lines: OrderItem[];
    };

export type ReadyCart = Extract<BuyCart, { status: 'ok' }>;

type RawItem = { key: string; productId: string; purchased: boolean };

function rawItems(session: BuySession, space: Space | undefined): RawItem[] | null {
  if (!space) return null;
  return space.items.map((it) => ({ key: it.id, productId: it.productId, purchased: it.purchased }));
}

export function buildCart(session: BuySession | null, space: Space | undefined, scoped: SessionScoped): BuyCart {
  if (!session) return { status: 'no_session' };
  const raw = rawItems(session, space);
  if (!raw) return { status: 'missing_origin', session };

  const entries: CartEntry[] = [];
  for (const item of raw) {
    const product = findProduct(item.productId);
    if (!product) continue;
    const blocked: CartEntry['blocked'] =
      product.status === 'discontinued'
        ? 'discontinued'
        : product.status === 'out_of_stock' || scoped.unavailable.includes(product.id)
          ? 'out_of_stock'
          : null;
    const selected =
      blocked === null &&
      session.selectedKeys.includes(item.key) &&
      (!item.purchased || scoped.rebuyKeys.includes(item.key));
    entries.push({
      key: item.key,
      product,
      supplier: getSupplier(product.supplierId),
      purchased: item.purchased,
      blocked,
      priceVND: scoped.priceOverrides[product.id] ?? product.priceVND,
      selected,
    });
  }
  if (entries.length === 0) return { status: 'missing_origin', session };

  const groupMap = new Map<string, CartGroup>();
  for (const e of entries) {
    const g = groupMap.get(e.supplier.id) ?? {
      supplier: e.supplier,
      entries: [],
      selected: [],
      subtotal: 0,
      needsInstall: false,
    };
    g.entries.push(e);
    if (e.selected) {
      g.selected.push(e);
      g.subtotal += e.priceVND;
      if (e.product.needsInstall) g.needsInstall = true;
    }
    groupMap.set(e.supplier.id, g);
  }
  const groups = [...groupMap.values()];
  const selected = entries.filter((e) => e.selected);

  return {
    status: 'ok',
    session,
    space,
    spaceId: session.origin.kind === 'space' ? session.origin.spaceId : null,
    entries,
    groups,
    selected,
    selectedGroups: groups.filter((g) => g.selected.length > 0),
    total: selected.reduce((sum, e) => sum + e.priceVND, 0),
    lines: selected.map((e) => ({ productId: e.product.id, priceVND: e.priceVND })),
  };
}

export function useBuyCart(): BuyCart {
  const session = useAppStore((s) => s.buySession);
  const space = useAppStore((s) => {
    const origin = s.buySession?.origin;
    return origin?.kind === 'space' ? s.spaces.find((sp) => sp.id === origin.spaceId) : undefined;
  });
  const scoped = useSessionScoped(session?.origin);
  return buildCart(session, space, scoped);
}

/** Đọc giỏ ngay lúc gọi (ngoài render), ví dụ sau khi vừa bỏ một món hết hàng trong event handler. */
export function readBuyCart(): BuyCart {
  const s = useAppStore.getState();
  const session = s.buySession;
  if (!session) return { status: 'no_session' };
  const origin = session.origin;
  const space = origin.kind === 'space' ? s.spaces.find((sp) => sp.id === origin.spaceId) : undefined;
  return buildCart(session, space, readSessionScoped(origin));
}

/** "3 món từ 2 nhà cung cấp". */
export function describeSelection(itemCount: number, supplierCount: number): string {
  return `${itemCount} món từ ${supplierCount} nhà cung cấp`;
}
