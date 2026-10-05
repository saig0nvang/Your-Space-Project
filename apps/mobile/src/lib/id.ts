let counter = 0;

/** Id cục bộ cho dữ liệu trên máy (không dùng làm id máy chủ). */
export function localId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
