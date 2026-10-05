let seq = 0;

/**
 * Id duy nhất trong phiên — thay crypto.randomUUID(), vốn KHÔNG có trên origin không bảo mật
 * (điện thoại mở http://192.168.x.x). Bộ đếm bảo đảm không trùng trong phiên; phần ngẫu nhiên chỉ để dễ đọc log.
 */
export function newId(): string {
  seq += 1;
  return `${seq.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
