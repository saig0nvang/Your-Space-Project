/**
 * Điều hướng xuyên nhóm màn — điểm duy nhất để mở luồng chụp, trình chỉnh sửa, sheet Mua.
 * Xem docs/screens.md §2 cho cấu trúc điều hướng.
 */
import { router, useNavigation } from 'expo-router';
import { useCallback } from 'react';

import { useAppStore } from '@/store/appStore';
import { useCaptureSession } from '@/store/captureSession';
import type { BuyOrigin, StyleId } from '@/types';

/** Mở luồng chụp (modal toàn màn). Đóng luồng chụp là về đúng màn đã mở nó. */
export function startCapture(opts: { styleId?: StyleId; productId?: string } = {}) {
  useCaptureSession.getState().reset({
    preselectStyleId: opts.styleId ?? null,
    pendingProductId: opts.productId ?? null,
  });
  router.push('/capture');
}

/** Mở trình chỉnh sửa cho một không gian (từ K1, P1). */
export function openEditor(spaceId: string) {
  router.push({ pathname: '/editor/[spaceId]', params: { spaceId } });
}

/** Mở sheet Mua. `selectedKeys`: id món đã đặt (origin space) hoặc id sản phẩm (origin product). */
export function startBuy(origin: BuyOrigin, selectedKeys: string[]) {
  useAppStore.getState().startBuySession(origin, selectedKeys);
  router.push('/buy');
}

/** Mở chi tiết món dạng sheet trên trình chỉnh sửa. */
export function openProductSheet(productId: string) {
  router.push({ pathname: '/product-sheet/[productId]', params: { productId } });
}

/** Mở sheet Lưu & chia sẻ (E2). */
export function openSaveSheet(spaceId: string) {
  router.push({ pathname: '/save/[spaceId]', params: { spaceId } });
}

/**
 * Đóng cả modal đang chứa màn hiện tại (luồng chụp, sheet Mua) — về đúng nơi đã mở modal.
 * `then` chạy sau khi modal đã đóng, ví dụ để mở trình chỉnh sửa hoặc chuyển tab.
 */
export function useExitModal() {
  const navigation = useNavigation();
  return useCallback(
    (then?: () => void) => {
      const parent = navigation.getParent();
      if (parent?.canGoBack()) parent.goBack();
      else if (router.canGoBack()) router.back();
      if (then) setTimeout(then, 0);
    },
    [navigation],
  );
}

/** Kết thúc luồng chụp: đóng modal chụp rồi đẩy trình chỉnh sửa lên (không quay lại camera được). */
export function useFinishCapture() {
  const exit = useExitModal();
  return useCallback(
    (spaceId: string) => exit(() => router.push({ pathname: '/editor/[spaceId]', params: { spaceId } })),
    [exit],
  );
}
