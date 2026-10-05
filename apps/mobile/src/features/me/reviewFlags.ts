/**
 * Cờ giả lập BỔ SUNG cho các màn tab Tôi và Đơn hàng (chỉ để review trên máy ảo, bật ở "Giả lập trạng thái").
 * Tách khỏi src/store/devFlags.ts vì chỉ nhóm màn này dùng.
 */
import { create } from 'zustand';

type ReviewFlags = {
  /** Đơn hàng, chi tiết đơn, khiếu nại hiện khung xương ~1,5 giây khi mở (G4). */
  slowLoad: boolean;
  /** Không đọc được trạng thái giữ tiền từ đối tác (E8-US2 CC3). */
  escrowUnknown: boolean;
  /** Xóa toàn bộ dữ liệu trên máy thất bại (T2 · Error). */
  wipeFails: boolean;
  set: (patch: Partial<Omit<ReviewFlags, 'set'>>) => void;
};

export const useReviewFlags = create<ReviewFlags>((set) => ({
  slowLoad: false,
  escrowUnknown: false,
  wipeFails: false,
  set: (patch) => set(patch),
}));
