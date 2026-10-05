import { getNetworkStateAsync } from 'expo-network';

import { showToast } from '@/components/ui';
import { isOfflineForced } from '@/services/network';

/**
 * "Thử lại" của băng mất mạng (G1). Băng tự ẩn khi có mạng lại; nút này kiểm tra ngay
 * và báo nếu vẫn chưa có mạng, để người dùng không bấm mà không thấy gì.
 */
export async function retryConnection(): Promise<void> {
  if (isOfflineForced()) {
    showToast('Vẫn chưa có kết nối mạng', 'info');
    return;
  }
  try {
    const state = await getNetworkStateAsync();
    if (state.isConnected === false || state.isInternetReachable === false) {
      showToast('Vẫn chưa có kết nối mạng', 'info');
    }
  } catch {
    showToast('Vẫn chưa có kết nối mạng', 'info');
  }
}
