/**
 * Trạng thái phụ của MỘT phiên mua, chỉ sống trong bộ nhớ (không lưu máy).
 * Gắn với phiên bằng tham chiếu `buySession.origin`: phiên mới (startBuy tạo origin mới) thì tự về mặc định,
 * không cần dọn tay.
 */
import { create } from 'zustand';

import type { BuyOrigin } from '@/types';

export type SessionScoped = {
  /** Phiên này có bước "Xác minh SĐT" không — chốt lúc bấm Tiếp tục ở M1 để số bước không đổi giữa chừng. */
  includePhoneStep: boolean | null;
  /** Giá mới người dùng đã xác nhận ở bước Thanh toán (productId → giá). */
  priceOverrides: Record<string, number>;
  /** Món phát hiện hết hàng khi kiểm tra trước thanh toán (productId). */
  unavailable: string[];
  /** Món đã mua trước đó mà người dùng chủ động chọn mua lại (khóa món đã đặt). */
  rebuyKeys: string[];
};

const EMPTY: SessionScoped = {
  includePhoneStep: null,
  priceOverrides: {},
  unavailable: [],
  rebuyKeys: [],
};

type FlowStore = {
  origin: BuyOrigin | null;
  scoped: SessionScoped;
  patch: (origin: BuyOrigin, patch: Partial<SessionScoped>) => void;
};

export const useBuyFlowStore = create<FlowStore>((set) => ({
  origin: null,
  scoped: EMPTY,
  patch: (origin, patch) => set((s) => ({ origin, scoped: { ...(s.origin === origin ? s.scoped : EMPTY), ...patch } })),
}));

/** Đọc trạng thái phụ của phiên đang mở; phiên khác thì trả mặc định. */
export function useSessionScoped(origin: BuyOrigin | undefined): SessionScoped {
  return useBuyFlowStore((s) => (origin && s.origin === origin ? s.scoped : EMPTY));
}

export function readSessionScoped(origin: BuyOrigin): SessionScoped {
  const s = useBuyFlowStore.getState();
  return s.origin === origin ? s.scoped : EMPTY;
}

export function patchSessionScoped(origin: BuyOrigin, patch: Partial<SessionScoped>) {
  useBuyFlowStore.getState().patch(origin, patch);
}
