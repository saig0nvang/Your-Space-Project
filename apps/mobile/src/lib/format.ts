/** Tiền dạng `12.400.000 ₫` (PRODUCT.md · Brand Commitments). */
export function formatVND(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${digits} ₫`;
}

/** Kích thước dạng `101 × 119 × 117 cm` (rộng × sâu × cao). */
export function formatDimensions(d: { widthCm: number; depthCm: number; heightCm: number }): string {
  return `${d.widthCm} × ${d.depthCm} × ${d.heightCm} cm`;
}

/** "2 món", "1 món". */
export function formatItemCount(n: number): string {
  return `${n} món`;
}

const DAY = 24 * 60 * 60 * 1000;

/** Thời điểm lưu gần nhất, dạng ngắn: "vừa xong", "lưu hôm qua", "lưu 3 ngày trước", "lưu 12/09". */
export function formatSavedAt(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  if (diff < 60 * 1000) return 'lưu vừa xong';
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (timestamp >= startOfToday.getTime()) {
    const d = new Date(timestamp);
    return `lưu lúc ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  if (timestamp >= startOfToday.getTime() - DAY) return 'lưu hôm qua';
  const days = Math.floor((startOfToday.getTime() - timestamp) / DAY) + 1;
  if (days <= 6) return `lưu ${days} ngày trước`;
  return `lưu ${formatDate(timestamp)}`;
}

/** Ngày dạng `12/09/2026`. */
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Ngày giờ dạng `14:30 · 12/09/2026`. */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const hh = d.getHours().toString().padStart(2, '0');
  const mi = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mi} · ${formatDate(timestamp)}`;
}

/** Khoảng ngày giao dạng "giao 5–7 ngày". */
export function formatDeliveryWindow(minDays: number, maxDays: number): string {
  return minDays === maxDays ? `giao trong ${minDays} ngày` : `giao ${minDays}–${maxDays} ngày`;
}

/** Chỉ giữ chữ số. */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

/** SĐT di động Việt Nam: 10 chữ số, bắt đầu bằng 0. */
export function isValidVietnamesePhone(s: string): boolean {
  return /^0\d{9}$/.test(digitsOnly(s));
}

/** Hiển thị SĐT dạng `0912 345 678`. */
export function formatPhone(s: string): string {
  const d = digitsOnly(s).slice(0, 10);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}
