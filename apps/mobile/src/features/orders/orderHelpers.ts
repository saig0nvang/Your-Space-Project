/** Hàm thuần cho nhóm màn Đơn hàng (DH1–DH5): nhãn trạng thái, nhóm theo lần thanh toán, tên hiển thị. */
import { Package, ShieldCheck, Truck, type Icon as PhosphorIcon } from 'phosphor-react-native';

import type { StatusTone } from '@/components/ui';
import { findProduct, SUPPLIERS } from '@/data/catalog';
import type { ComplaintStatus, Order, OrderStatus } from '@/types';

export const ORDER_STATUS_TAG: Record<OrderStatus, { tone: StatusTone; label: string; icon?: PhosphorIcon }> = {
  paid: { tone: 'neutral', label: 'Đã thanh toán · tiền đang được giữ', icon: ShieldCheck },
  shipping: { tone: 'neutral', label: 'Đang giao', icon: Truck },
  delivered: { tone: 'attention', label: 'Đã giao · chờ bạn xác nhận', icon: Package },
  received: { tone: 'done', label: 'Đã nhận' },
  disputed: { tone: 'danger', label: 'Đang khiếu nại' },
};

export const COMPLAINT_STATUS_LABEL: Record<ComplaintStatus, string> = {
  submitted: 'Đã gửi',
  supplier_replied: 'Nhà cung cấp đã phản hồi',
  processing: 'Đang xử lý',
  closed: 'Đã kết thúc',
};

/** Đơn còn cho xác nhận nhận hàng hoặc báo sự cố (E8-US3, E8-US4 pre-condition). */
export function canConfirmOrReport(status: OrderStatus): boolean {
  return status === 'shipping' || status === 'delivered';
}

export function supplierName(supplierId: string): string {
  return SUPPLIERS.find((s) => s.id === supplierId)?.name ?? 'Nhà cung cấp';
}

export function productName(productId: string): string {
  return findProduct(productId)?.name ?? 'Món không còn trong danh mục';
}

/** Thời điểm gần nhất đơn chuyển sang một trạng thái (null nếu chưa từng). */
export function statusAt(order: Order, status: OrderStatus): number | null {
  for (let i = order.timeline.length - 1; i >= 0; i--) {
    if (order.timeline[i].status === status) return order.timeline[i].at;
  }
  return null;
}

/** Ngày dạng `03/10` cho chú thích nhóm thanh toán. */
export function formatDayMonth(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

export type PaymentGroup = {
  paymentId: string;
  paidAt: number;
  orders: Order[];
  awaiting: number;
};

/**
 * Nhóm đơn theo lần thanh toán (E8-US1 AC1). Nhóm có đơn đã giao chờ xác nhận đứng đầu (AC3),
 * trong nhóm thì đơn chờ xác nhận đứng đầu; còn lại mới nhất trước.
 */
export function groupOrdersByPayment(orders: Order[]): PaymentGroup[] {
  const map = new Map<string, Order[]>();
  for (const o of orders) map.set(o.paymentId, [...(map.get(o.paymentId) ?? []), o]);
  const groups: PaymentGroup[] = [...map.entries()].map(([paymentId, list]) => {
    const sorted = [...list].sort((a, b) => {
      const da = a.status === 'delivered' ? 0 : 1;
      const db = b.status === 'delivered' ? 0 : 1;
      return da - db || b.createdAt - a.createdAt;
    });
    return {
      paymentId,
      paidAt: Math.min(...list.map((o) => o.createdAt)),
      orders: sorted,
      awaiting: list.filter((o) => o.status === 'delivered').length,
    };
  });
  return groups.sort((a, b) => (b.awaiting > 0 ? 1 : 0) - (a.awaiting > 0 ? 1 : 0) || b.paidAt - a.paidAt);
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
