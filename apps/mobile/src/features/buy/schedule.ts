/**
 * Ngày giao dự kiến và khung giờ lắp đặt MẪU cho bản thử (chưa có lịch thật của nhà cung cấp).
 * Ngày giao dự kiến tính như services/orders: hôm nay + số ngày giao tối đa của nhà cung cấp.
 */
import type { Supplier } from '@/types';

const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** Mốc 0 giờ hôm nay (dùng làm giá trị khởi tạo lười của useState, giữ cố định trong một lần mở màn). */
export function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "Thứ Năm 16/10". */
export function formatDayLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${WEEKDAYS[d.getDay()]} ${dd}/${mm}`;
}

export function estimatedDeliveryDate(supplier: Supplier, today: number): number {
  return today + supplier.deliveryMaxDays * DAY;
}

/** Bốn khung giờ lắp mẫu: ngày giao dự kiến và ngày kế tiếp, sáng và chiều. */
export function installSlotOptions(supplier: Supplier, today: number): string[] {
  const first = estimatedDeliveryDate(supplier, today);
  const days = [first, first + DAY];
  return days.flatMap((d) => [`${formatDayLabel(d)} · 09:00–12:00`, `${formatDayLabel(d)} · 13:00–17:00`]);
}
