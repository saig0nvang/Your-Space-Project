/**
 * Điều hướng trong sheet Mua: đóng sheet (có hỏi lại khi đã nhập dữ liệu), chặn vuốt xuống,
 * bỏ các bước thanh toán khỏi lịch sử quay lại.
 */
import { useFocusEffect, useNavigation, type NativeStackNavigationProp } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { useExitModal } from '@/flows';
import { confirmAction } from '@/lib/confirm';
import { useAppStore, type BuySession } from '@/store/appStore';

/** Tên route trong stack `buy` (theo tên file). */
export type BuyStackParams = {
  index: undefined;
  phone: undefined;
  otp: { phone: string };
  checkout: undefined;
  done: undefined;
};

export function useBuyNavigation() {
  return useNavigation<NativeStackNavigationProp<BuyStackParams>>();
}

/**
 * Mức hỏi lại khi đóng sheet:
 * - none: đóng ngay (M1, TT1, TT2, TT7).
 * - entered: đã nhập thông tin giao hàng (TT3).
 * - waiting: đang chờ đối tác xác nhận thanh toán (TT3).
 */
export type CloseGuard = 'none' | 'entered' | 'waiting';

/** Thời gian sheet trượt xuống; kết thúc phiên sau mốc này để màn đang đóng không nháy trạng thái trống. */
const SHEET_DISMISS_MS = 600;

/** Kết thúc đúng phiên đã đóng (không đụng phiên mới nếu người dùng vừa mở lại sheet). */
function endSessionLater(session: BuySession | null) {
  if (!session) return;
  setTimeout(() => {
    const s = useAppStore.getState();
    if (s.buySession && s.buySession.origin === session.origin) s.endBuySession();
  }, SHEET_DISMISS_MS);
}

/**
 * Đóng sheet Mua về đúng nơi đã mở, rồi kết thúc phiên mua.
 * `then` chạy sau khi sheet đã đóng (ví dụ chuyển sang Đơn hàng).
 */
export function closeBuySession(exit: (then?: () => void) => void, then?: () => void) {
  const session = useAppStore.getState().buySession;
  exit(then);
  endSessionLater(session);
}

const CONFIRM: Record<Exclude<CloseGuard, 'none'>, { title: string; message: string }> = {
  entered: {
    title: 'Đóng sheet mua?',
    message: 'Bạn chưa thanh toán nên chưa có đơn nào được tạo.',
  },
  waiting: {
    title: 'Đóng khi đang chờ xác nhận thanh toán?',
    message:
      'Nếu bạn đã trả tiền, đừng trả lần nữa. Đơn sẽ hiện trong Đơn hàng khi đối tác xác nhận thanh toán.',
  },
};

/**
 * Trả về hàm đóng sheet cho nút "Đóng". Khi `guard` khác none: hỏi lại bằng action sheet hệ thống
 * và chặn vuốt xuống để đóng (chỉ còn nút Đóng có xác nhận).
 */
export function useBuyClose(guard: CloseGuard) {
  const navigation = useNavigation();
  const exit = useExitModal();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ gestureEnabled: guard === 'none' });
    }, [navigation, guard]),
  );

  // Sheet bị vuốt xuống để đóng (khi được phép) cũng kết thúc phiên mua.
  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return undefined;
    return parent.addListener('beforeRemove', () => endSessionLater(useAppStore.getState().buySession));
  }, [navigation]);

  return useCallback(
    async (then?: () => void) => {
      if (guard !== 'none') {
        const c = CONFIRM[guard];
        const choice = await confirmAction({
          title: c.title,
          message: c.message,
          options: [
            { label: 'Đóng', style: 'destructive' },
            { label: 'Ở lại', style: 'cancel' },
          ],
        });
        if (choice !== 0) return;
      }
      closeBuySession(exit, then);
    },
    [guard, exit],
  );
}

/**
 * Chống bấm hai lần (G5): bỏ qua lần gọi mới khi lần trước chưa xong, kể cả khi hai lần bấm
 * đến trước khi nút kịp chuyển sang trạng thái đang xử lý.
 */
export function useSubmitLock() {
  const busy = useRef(false);
  return useCallback(async (task: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await task();
    } finally {
      busy.current = false;
    }
  }, []);
}
