/**
 * Hoàn tất một lần thanh toán: tạo đơn theo nhà cung cấp, gắn nhãn "Đã mua", cập nhật phiên mua.
 * Gọi khi đối tác xác nhận đã nhận tiền.
 *
 * Việc chờ đối tác xác nhận sống ở cấp module, không gắn với màn: người dùng đóng sheet khi đang chờ
 * thì đơn vẫn được tạo khi đối tác xác nhận và hiện trong Đơn hàng (docs/screens.md · TT3).
 */
import { createPartnerPayment, waitForPayment } from '@/services/payment';
import { createOrdersForPayment } from '@/services/orders';
import { useAppStore } from '@/store/appStore';
import type { BuyOrigin, DeliveryInfo, OrderItem } from '@/types';

import { readBuyCart, type ReadyCart } from './cart';

export type PurchaseSnapshot = {
  origin: BuyOrigin;
  spaceId: string | null;
  /** Khóa món đã chọn (id món đã đặt khi mua từ không gian). */
  keys: string[];
  lines: OrderItem[];
  supplierByProduct: Record<string, string>;
  delivery: DeliveryInfo;
};

export type PaymentOutcome = 'paid' | 'failed' | 'cancelled';

export function snapshotFromCart(cart: ReadyCart): PurchaseSnapshot | null {
  const delivery = cart.session.delivery;
  if (!delivery || cart.selected.length === 0) return null;
  return {
    origin: cart.session.origin,
    spaceId: cart.spaceId,
    keys: cart.selected.map((e) => e.key),
    lines: cart.lines,
    supplierByProduct: Object.fromEntries(cart.selected.map((e) => [e.product.id, e.supplier.id])),
    delivery,
  };
}

const completed = new Map<string, string[]>();

/** Tạo đơn đúng MỘT lần cho mỗi paymentId (G5). Trả về id các đơn đã tạo. */
export function completePurchase(paymentId: string, snap: PurchaseSnapshot): string[] {
  const done = completed.get(paymentId);
  if (done) return done;

  const store = useAppStore.getState();
  const orders = createOrdersForPayment({
    paymentId,
    spaceId: snap.spaceId,
    lines: snap.lines,
    delivery: snap.delivery,
    productSupplier: (productId) => snap.supplierByProduct[productId],
  });
  store.addOrders(orders);
  const orderIds = orders.map((o) => o.id);
  completed.set(paymentId, orderIds);

  if (snap.spaceId && store.spaces.some((sp) => sp.id === snap.spaceId)) {
    store.markItemsPurchased(snap.spaceId, snap.keys);
  }

  const session = useAppStore.getState().buySession;
  if (session && session.origin === snap.origin) {
    useAppStore.getState().updateBuySession({ paymentId, paymentStatus: 'paid', createdOrderIds: orderIds });
  }
  return orderIds;
}

const snapshots = new Map<string, PurchaseSnapshot>();
const watchers = new Map<string, Promise<PaymentOutcome>>();
const cancelled = new Set<string>();

/** Ghi lại phiên mua của một lần thanh toán vừa mở, để hoàn tất được cả khi sheet đã đóng. */
export function registerPendingPayment(paymentId: string, snap: PurchaseSnapshot) {
  snapshots.set(paymentId, snap);
}

/** Số tiền của một lần thanh toán đang chờ (giữ nguyên cả sau khi món đã mang nhãn "Đã mua"). */
export function paymentAmount(paymentId: string): number | null {
  const snap = snapshots.get(paymentId);
  return snap ? snap.lines.reduce((sum, l) => sum + l.priceVND, 0) : null;
}

/** Chờ đối tác xác nhận; gọi nhiều lần cho cùng paymentId chỉ chờ một lần. */
export function watchPayment(paymentId: string): Promise<PaymentOutcome> {
  const existing = watchers.get(paymentId);
  if (existing) return existing;
  const p = waitForPayment(paymentId).then((status): PaymentOutcome => {
    if (cancelled.has(paymentId)) return 'cancelled';
    const snap = snapshots.get(paymentId);
    if (status === 'paid' && snap) {
      completePurchase(paymentId, snap);
      return 'paid';
    }
    const session = useAppStore.getState().buySession;
    if (session && session.paymentId === paymentId) {
      useAppStore.getState().updateBuySession({ paymentStatus: 'failed' });
    }
    return 'failed';
  });
  watchers.set(paymentId, p);
  return p;
}

/** Người dùng hủy khi đang chờ: bỏ qua mọi kết quả về sau của lần thanh toán này, không tạo đơn. */
export function cancelPayment(paymentId: string) {
  cancelled.add(paymentId);
  const session = useAppStore.getState().buySession;
  if (session && session.paymentId === paymentId) {
    useAppStore.getState().updateBuySession({ paymentStatus: 'cancelled' });
  }
}

/**
 * Mở thanh toán tại đối tác cho đúng giỏ hiện tại (sau khi đã bỏ món hết hàng / nhận giá mới),
 * ghi lại phiên để hoàn tất được về sau, rồi đánh dấu phiên đang chờ đối tác xác nhận.
 */
export async function startPayment(): Promise<'ok' | 'offline' | 'empty'> {
  const cart = readBuyCart();
  if (cart.status !== 'ok') return 'empty';
  const snap = snapshotFromCart(cart);
  if (!snap) return 'empty';
  const res = await createPartnerPayment(cart.total);
  if (!res.ok) return 'offline';
  registerPendingPayment(res.value.paymentId, snap);
  useAppStore.getState().updateBuySession({
    paymentId: res.value.paymentId,
    paymentStatus: 'pending',
    createdOrderIds: [],
  });
  return 'ok';
}
