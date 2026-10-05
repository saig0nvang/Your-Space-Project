/** Thông báo ngắn tự ẩn sau ~4 giây; không lấy focus, được đọc lịch sự bởi trình đọc màn hình. */
import { CheckCircle, Info, WarningCircle } from 'phosphor-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

/** success: việc đã xong · error: việc không thành · info: thông tin trung tính (ví dụ chức năng chưa có trong bản thử). */
type ToastItem = { id: number; message: string; tone: 'success' | 'error' | 'info' };

const useToastStore = create<{ current: ToastItem | null; show: (m: string, tone?: ToastItem['tone']) => void; clear: () => void }>(
  (set) => ({
    current: null,
    show: (message, tone = 'success') => set({ current: { id: Date.now(), message, tone } }),
    clear: () => set({ current: null }),
  }),
);

export function showToast(message: string, tone: ToastItem['tone'] = 'success') {
  useToastStore.getState().show(message, tone);
}

export function ToastHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.current);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(clear, 4000);
    return () => clearTimeout(timer);
  }, [current, clear]);

  if (!current) return null;
  const Icon = current.tone === 'success' ? CheckCircle : current.tone === 'info' ? Info : WarningCircle;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 72, alignItems: 'center' }}>
      <Animated.View
        key={current.id}
        entering={FadeInDown.duration(t.motion.base)}
        exiting={FadeOutDown.duration(t.motion.fast)}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.sm,
            maxWidth: '90%',
            paddingHorizontal: t.spacing.md,
            paddingVertical: t.spacing.sm + 4,
            borderRadius: t.radius.md,
            backgroundColor: t.colors.foreground,
          },
          t.shadow('lg'),
        ]}
      >
        <Icon size={20} color={t.colors.background} weight="fill" />
        <AppText variant="subheadline" weight="600" color="background" style={{ flexShrink: 1 }}>
          {current.message}
        </AppText>
      </Animated.View>
    </View>
  );
}
