/**
 * Phiên chụp (C1–C7), chỉ sống trong bộ nhớ. Bắt đầu bằng flows.startCapture().
 * Kết thúc: luồng chụp tạo một Space mới trong appStore rồi mở trình chỉnh sửa.
 */
import { create } from 'zustand';

import type { ScanResult } from '@/services/ai';
import type { StyleId } from '@/types';

export type CaptureSession = {
  /** Phong cách đang xem khi đến từ K2/K4: khay đồ mở sẵn tab này. */
  preselectStyleId: StyleId | null;
  /** Món chờ sẵn trong khay khi đến từ K4 "Thử trong phòng của bạn". */
  pendingProductId: string | null;
  photoUri: string | null;
  /** width / height của ảnh. */
  photoAspect: number;
  source: 'camera' | 'library' | null;
  /** Góc ngửa/cúi của máy lúc ngắm (độ); null = không có số đo cảm biến → đi qua C6. */
  pitchDeg: number | null;
  /** Người dùng chọn không gửi ảnh ở C3 → vào trình chỉnh sửa thủ công (đề xuất E3-US3 CC1). */
  photoSent: boolean;
  scan: ScanResult | null;
  /** AI lỗi / quá giờ / ảnh khó → trình chỉnh sửa mở ở chế độ thủ công. */
  manualMode: boolean;
  horizonY: number | null;
  cameraHeightM: number;
  floorConfirmed: boolean;
  /** Không gian đã tạo từ phiên này (chống tạo hai lần khi bấm liên tiếp — G5). */
  createdSpaceId: string | null;
};

const initial: CaptureSession = {
  preselectStyleId: null,
  pendingProductId: null,
  photoUri: null,
  photoAspect: 3 / 4,
  source: null,
  pitchDeg: null,
  photoSent: false,
  scan: null,
  manualMode: false,
  horizonY: null,
  cameraHeightM: 1.4,
  floorConfirmed: false,
  createdSpaceId: null,
};

type Store = CaptureSession & {
  reset: (patch?: Partial<CaptureSession>) => void;
  set: (patch: Partial<CaptureSession>) => void;
};

export const useCaptureSession = create<Store>((set) => ({
  ...initial,
  reset: (patch) => set({ ...initial, ...patch }),
  set: (patch) => set(patch),
}));

/** Đã hiện C7 trong phiên app này chưa (E3-US6 CC1: không đẩy lại C7 lần nữa trong cùng phiên). */
let hardPhotoShownThisAppSession = false;
export function markHardPhotoShown() {
  hardPhotoShownThisAppSession = true;
}
export function wasHardPhotoShown() {
  return hardPhotoShownThisAppSession;
}
