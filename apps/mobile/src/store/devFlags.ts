/**
 * Cờ giả lập trạng thái — CHỈ để review giao diện trên máy ảo khi chưa có backend thật.
 * Bật/tắt ở tab Tôi → "Giả lập trạng thái" (chỉ hiện trong bản dev).
 */
import { Platform } from 'react-native';
import { create } from 'zustand';

export type AIScenario = 'normal' | 'paused' | 'hard_photo';
export type PaymentScenario = 'success' | 'fail' | 'out_of_stock' | 'price_changed';

type DevFlags = {
  aiScenario: AIScenario;
  /** Giả lập người dùng từ chối quyền camera ở C1. */
  cameraDenied: boolean;
  eraseFails: boolean;
  forceOffline: boolean;
  lowEndDevice: boolean;
  paymentScenario: PaymentScenario;
  /**
   * Hiện các nút / khối giả lập ngay trên màn (nút dev ở màn mở đầu, mã OTP thử, "Giả lập: đối tác xác nhận",
   * khối giả lập ở chi tiết đơn, lỗi camera). Mặc định tắt để ảnh chụp màn hình sạch như app thật.
   */
  showDevControls: boolean;
  /** Phủ lưới sàn 3D (ô 1 m) lên ảnh phòng ở trình chỉnh sửa, để kiểm máy ảnh ảo có khớp ảnh không (bản thử 3D). */
  show3dGrid: boolean;
  set: (patch: Partial<Omit<DevFlags, 'set'>>) => void;
};

/** Bản web: mở app với `?grid3d=1` là bật sẵn lưới sàn 3D (không phải vào tab Tôi; chuyển tab trên web tải lại trang). */
const gridFromUrl =
  Platform.OS === 'web' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('grid3d') === '1';

export const useDevFlags = create<DevFlags>((set) => ({
  aiScenario: 'normal',
  cameraDenied: false,
  eraseFails: false,
  forceOffline: false,
  lowEndDevice: false,
  paymentScenario: 'success',
  showDevControls: false,
  show3dGrid: gridFromUrl,
  set: (patch) => set(patch),
}));
