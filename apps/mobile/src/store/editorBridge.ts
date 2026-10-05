/**
 * Cầu nối nhỏ giữa trình chỉnh sửa (E1) và các màn khác.
 * - openSpaceId: không gian đang mở trong E1 (null khi E1 đóng).
 * - pendingProductId: món cần chọn sẵn trong khay (từ K4 mở dạng sheet trên E1).
 */
import { create } from 'zustand';

type EditorBridge = {
  openSpaceId: string | null;
  pendingProductId: string | null;
  setOpenSpace: (id: string | null) => void;
  requestPlaceProduct: (productId: string) => void;
  consumePendingProduct: () => string | null;
};

export const useEditorBridge = create<EditorBridge>((set, get) => ({
  openSpaceId: null,
  pendingProductId: null,
  setOpenSpace: (id) => set({ openSpaceId: id }),
  requestPlaceProduct: (productId) => set({ pendingProductId: productId }),
  consumePendingProduct: () => {
    const id = get().pendingProductId;
    if (id) set({ pendingProductId: null });
    return id;
  },
}));
