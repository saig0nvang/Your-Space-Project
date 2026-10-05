/**
 * Tạo và tiến trình đơn hàng GIẢ LẬP (chưa có backend). Một lần thanh toán tách thành
 * một đơn cho mỗi nhà cung cấp (D10, E7-US5 AC2).
 */
import { getSupplier } from '@/data/catalog';
import { localId } from '@/lib/id';
import { useAppStore } from '@/store/appStore';
import type { ComplaintStatus, DeliveryInfo, Order, OrderItem, OrderStatus } from '@/types';

const DAY = 24 * 60 * 60 * 1000;

export function createOrdersForPayment(input: {
  paymentId: string;
  spaceId: string | null;
  lines: OrderItem[];
  delivery: DeliveryInfo;
  productSupplier: (productId: string) => string;
}): Order[] {
  const now = Date.now();
  const bySupplier = new Map<string, OrderItem[]>();
  for (const line of input.lines) {
    const sid = input.productSupplier(line.productId);
    bySupplier.set(sid, [...(bySupplier.get(sid) ?? []), line]);
  }
  return [...bySupplier.entries()].map(([supplierId, items]) => {
    const supplier = getSupplier(supplierId);
    return {
      id: localId('order'),
      paymentId: input.paymentId,
      supplierId,
      spaceId: input.spaceId,
      items,
      totalVND: items.reduce((sum, i) => sum + i.priceVND, 0),
      status: 'paid' as OrderStatus,
      timeline: [{ status: 'paid' as OrderStatus, at: now }],
      deliveryDate: now + supplier.deliveryMaxDays * DAY,
      previousDeliveryDate: null,
      installSlot: input.delivery.installSlots[supplierId] ?? null,
      address: input.delivery.address,
      recipientName: input.delivery.recipientName,
      phone: input.delivery.phone,
      complaint: null,
      createdAt: now,
    };
  });
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'shipping',
  shipping: 'delivered',
};

/** Chỉ bản dev: đẩy đơn sang bước kế tiếp (đã thanh toán → đang giao → đã giao). */
export function devAdvanceOrder(orderId: string) {
  const store = useAppStore.getState();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return;
  const next = NEXT_STATUS[order.status];
  if (next) store.setOrderStatus(orderId, next);
}

/** Chỉ bản dev: nhà cung cấp dời ngày giao thêm 2 ngày (E8-US2 CC1). */
export function devPostponeDelivery(orderId: string) {
  const store = useAppStore.getState();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return;
  store.updateOrder(orderId, { previousDeliveryDate: order.deliveryDate, deliveryDate: order.deliveryDate + 2 * DAY });
}

const NEXT_COMPLAINT: Partial<Record<ComplaintStatus, ComplaintStatus>> = {
  submitted: 'supplier_replied',
  supplier_replied: 'processing',
  processing: 'closed',
};

/** Chỉ bản dev: đẩy khiếu nại sang bước kế tiếp; bước cuối ghi kết quả mẫu. */
export function devAdvanceComplaint(orderId: string) {
  const store = useAppStore.getState();
  const order = store.orders.find((o) => o.id === orderId);
  const complaint = order?.complaint;
  if (!order || !complaint) return;
  const next = NEXT_COMPLAINT[complaint.status];
  if (!next) return;
  const now = Date.now();
  store.updateComplaint(orderId, {
    status: next,
    timeline: [...complaint.timeline, { status: next, at: now }],
    outcome:
      next === 'closed'
        ? 'Nhà cung cấp nhận lỗi và hoàn tiền món bị lỗi. Khoản hoàn lấy từ khoản đang giữ tại đối tác thanh toán, về lại tài khoản bạn đã dùng để trả.'
        : complaint.outcome,
  });
}
