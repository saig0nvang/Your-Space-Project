/**
 * Mô phỏng lần tải đầu của ảnh / mô hình (bản thử chưa có máy chủ), để founder thấy khung xương G4.
 * Mỗi khóa chỉ "tải" một lần trong phiên app: quay lại màn đã xem thì hiện ngay, không nháy khung xương.
 */
import { useEffect, useState } from 'react';

import { showToast } from '@/components/ui';

/** Dưới 500 ms theo brief; đủ để thấy khung xương mà không làm chậm việc review. */
const DEFAULT_MS = 450;

const loadedKeys = new Set<string>();

export function useFirstLoad(key: string, ms: number = DEFAULT_MS): boolean {
  const [doneKey, setDoneKey] = useState<string | null>(() => (loadedKeys.has(key) ? key : null));

  useEffect(() => {
    if (loadedKeys.has(key)) return;
    const timer = setTimeout(() => {
      loadedKeys.add(key);
      setDoneKey(key);
    }, ms);
    return () => clearTimeout(timer);
  }, [key, ms]);

  return doneKey !== key && !loadedKeys.has(key);
}

/**
 * "Thử lại" khi mất mạng (G1). Trạng thái mạng tự cập nhật khi có mạng lại,
 * nên bấm lúc vẫn mất mạng thì báo ngắn gọn, không giả vờ đã tải xong.
 */
export function retryWhileOffline(online: boolean) {
  if (!online) {
    showToast('Vẫn chưa có kết nối mạng. Màn này tự cập nhật khi có mạng lại.', 'info');
  }
}
