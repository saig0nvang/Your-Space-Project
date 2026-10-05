/**
 * Thao tác trên phiên chụp dùng chung cho các màn C1–C7 (bản thử, thuần giả lập).
 * Store phiên chụp nằm ở src/store/captureSession.ts.
 */
import { router } from 'expo-router';
import { useCallback } from 'react';

import { STYLES } from '@/data/catalog';
import { findSamplePhoto, samplePhotoRef, type SamplePhoto } from '@/data/samplePhotos';
import { useFinishCapture } from '@/flows';
import { localId } from '@/lib/id';
import { useAppStore } from '@/store/appStore';
import { useCaptureSession } from '@/store/captureSession';
import { useDevFlags } from '@/store/devFlags';
import { useEditorBridge } from '@/store/editorBridge';
import type { Space } from '@/types';

/** Góc ngửa/cúi giả lập (độ) lúc ngắm bằng camera: máy hơi chúc xuống để thấy sàn. */
export const MOCK_PITCH_DEG = 12;

/** Chiều cao máy mặc định khi chưa có kết quả quét (mét). */
export const DEFAULT_CAMERA_HEIGHT_M = 1.4;

/** Đường sàn mặc định khi chưa có kết quả quét (0..1 theo chiều cao ảnh). */
export const DEFAULT_FLOOR_LINE_Y = 0.6;

/** Đặt ảnh mới cho phiên chụp và xóa mọi kết quả gắn với ảnh trước (quét, chân trời, sàn, consent của lượt này). */
export function setSessionPhoto(photo: SamplePhoto, source: 'camera' | 'library', pitchDeg: number | null) {
  useCaptureSession.getState().set({
    photoUri: samplePhotoRef(photo.id),
    photoAspect: photo.aspect,
    source,
    pitchDeg,
    photoSent: false,
    scan: null,
    manualMode: false,
    horizonY: null,
    cameraHeightM: DEFAULT_CAMERA_HEIGHT_M,
    floorConfirmed: false,
  });
}

/** Quyền camera (giả lập): đã qua C1 và không bật cờ "từ chối quyền camera". */
export function isCameraGranted(): boolean {
  return useAppStore.getState().user.cameraIntroSeen && !useDevFlags.getState().cameraDenied;
}

/**
 * Về camera để chụp lại. Camera có trong stack thì quay về đó, không thì thay màn hiện tại.
 * Chưa có quyền camera thì về C1.
 */
export function goToCamera() {
  router.dismissTo(isCameraGranted() ? '/capture/camera' : '/capture/permission');
}

/**
 * Tạo không gian mới từ phiên chụp, một lần mỗi phiên (G5), rồi trả về id.
 * Khay đồ mở sẵn phong cách đang xem nếu đến từ Khám phá; không thì phong cách đầu tiên (PRD §4.2: phong cách là tab trong khay).
 */
export function createSpaceFromSession(): string {
  const s = useCaptureSession.getState();
  if (s.createdSpaceId) return s.createdSpaceId;
  const now = Date.now();
  const space: Space = {
    id: localId('space'),
    // Tên mặc định gần với "phòng của mình" hơn: theo nhãn ảnh (ảnh mẫu) kèm ngày; không có nhãn thì "Phòng".
    name: `${findSamplePhoto(s.photoUri)?.label ?? 'Phòng'} ${formatDayMonth(now)}`,
    photoUri: s.photoUri,
    photoAspect: s.photoAspect,
    source: s.source ?? 'library',
    styleId: s.preselectStyleId ?? STYLES[0].id,
    items: [],
    erasedRegions: [],
    calibration: {
      cameraHeightM: s.cameraHeightM,
      floorConfirmed: s.floorConfirmed,
      horizonY: s.horizonY,
      floorLineY: s.scan?.floorLineY ?? DEFAULT_FLOOR_LINE_Y,
      wallBase: s.scan?.wallBase,
      camera: s.scan?.camera,
    },
    aiMode: s.manualMode ? 'manual' : 'auto',
    photoSent: s.photoSent,
    createdAt: now,
    updatedAt: now,
    savedAt: null,
  };
  useAppStore.getState().addSpace(space);
  s.set({ createdSpaceId: space.id });
  // Món chờ từ K4 chỉ được chọn sẵn trong khay, không tự đặt lên ảnh (AI/app chỉ gợi ý).
  if (s.pendingProductId) useEditorBridge.getState().requestPlaceProduct(s.pendingProductId);
  return space.id;
}

/** Kết thúc luồng chụp: tạo không gian, đóng modal chụp, mở trình chỉnh sửa. */
export function useBeginEditing() {
  const finishCapture = useFinishCapture();
  return useCallback(() => finishCapture(createSpaceFromSession()), [finishCapture]);
}

/**
 * Ảnh khó hoặc không có sàn: lần đầu trong phiên app → C7; đã hiện C7 rồi → vào thẳng trình chỉnh sửa
 * chế độ thủ công (E3-US6 CC1).
 */
export function goToHardPhotoOrManual(wasShown: boolean, beginEditing: () => void, mode: 'replace' | 'push' = 'replace') {
  if (wasShown) {
    useCaptureSession.getState().set({ manualMode: true });
    beginEditing();
  } else if (mode === 'replace') {
    router.replace('/capture/hard-photo');
  } else {
    router.push('/capture/hard-photo');
  }
}

/** Số thập phân kiểu Việt Nam: 1,4 · 0,8. */
export function formatDecimal(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',');
}

/** Chiều cao tính bằng cm → "1,4" / "1,45" (mét, bỏ số 0 thừa). */
export function formatMetersFromCm(cm: number): string {
  return formatDecimal(cm / 100, cm % 10 === 0 ? 1 : 2);
}

/** Ngày dạng dd/mm cho tên không gian mặc định. */
export function formatDayMonth(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}
