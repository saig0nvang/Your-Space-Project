/**
 * Khay đáy kéo được của E1 (thu gọn / mở). Phần đầu (grabber + hàng công cụ) luôn hiện trên thanh dự toán;
 * phần thân trượt xuống sau thanh dự toán khi thu gọn. Có nút chạm để mở / thu cho trợ năng
 * (ui-ux-pro-max: không để kéo là cách duy nhất). Reduce Motion: đổi vị trí tức thì và mờ dần thay cho trượt.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme';

export function Dock({
  open,
  expandable,
  onOpenChange,
  bottom,
  header,
  children,
  onHeaderHeight,
  minHeaderHeight,
  grabberLabel,
}: {
  /**
   * Nhãn trợ năng của thanh kéo khi đầu khay không có nút mở / thu riêng (panel món: kéo lên để chỉnh tỷ lệ).
   * Không có thì thanh kéo ẩn với trình đọc màn hình (đầu khay đã có nút).
   */
  grabberLabel?: string;
  /** Chiều cao tối thiểu của đầu khay (giữ mép khay ổn định khi đổi nội dung đầu khay). */
  minHeaderHeight?: number;
  open: boolean;
  /** false: khay không mở được ở chế độ này (đang chọn món, công cụ Xóa, chỉnh sàn). */
  expandable: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chiều cao thanh dự toán bên dưới. */
  bottom: number;
  header: ReactNode;
  children: ReactNode;
  onHeaderHeight?: (h: number) => void;
}) {
  const t = useTheme();
  const reduce = useReducedMotion();
  const shown = open && expandable;
  const contentH = useSharedValue(0);
  const progress = useSharedValue(shown ? 1 : 0);
  const fade = useSharedValue(1);
  // Bản sao chiều cao thân khay ở JS để tính kéo mà không đọc ngược shared value từ UI.
  const [bodyH, setBodyH] = useState(0);

  useEffect(() => {
    const target = shown ? 1 : 0;
    if (reduce) {
      progress.set(target);
      fade.set(0.4);
      fade.set(withTiming(1, { duration: t.motion.fast }));
    } else {
      progress.set(withTiming(target, { duration: t.motion.base }));
    }
  }, [shown, reduce, progress, fade, t.motion.base, t.motion.fast]);

  const settle = (next: boolean) => {
    progress.set(reduce ? (next ? 1 : 0) : withTiming(next ? 1 : 0, { duration: t.motion.fast }));
    if (next !== open) onOpenChange(next);
  };

  // Vị trí khay theo quãng kéo, tính từ trạng thái lúc bắt đầu kéo (1 = mở, 0 = thu gọn).
  const base = shown ? 1 : 0;
  const at = (translationY: number) => Math.min(Math.max(base - translationY / bodyH, 0), 1);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(expandable)
    .activeOffsetY([-10, 10])
    .failOffsetX([-24, 24])
    .onUpdate((e) => {
      if (bodyH <= 0) return;
      progress.set(at(e.translationY));
    })
    .onEnd((e) => {
      const p = bodyH > 0 ? at(e.translationY) : base;
      settle(e.velocityY < -400 ? true : e.velocityY > 400 ? false : p > 0.5);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * contentH.value }],
    opacity: fade.value,
  }));
  const bodyStyle = useAnimatedStyle(() => ({ opacity: contentH.value > 0 ? 1 : 0 }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom,
          backgroundColor: t.colors.card,
          borderTopLeftRadius: t.radius.lg,
          borderTopRightRadius: t.radius.lg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: t.colors.border,
        },
        t.shadow('sm'),
        sheetStyle,
      ]}
    >
      <GestureDetector gesture={pan}>
        <View
          onLayout={(e) => onHeaderHeight?.(e.nativeEvent.layout.height)}
          style={{ paddingBottom: t.spacing.sm, minHeight: minHeaderHeight }}
        >
          <Pressable
            accessible={Boolean(grabberLabel && expandable)}
            accessibilityRole="button"
            accessibilityLabel={grabberLabel}
            accessibilityState={{ expanded: shown }}
            onPress={expandable ? () => onOpenChange(!open) : undefined}
            hitSlop={{ top: 8, bottom: 4, left: 24, right: 24 }}
            style={{ alignSelf: 'center', paddingVertical: t.spacing.sm }}
          >
            <View
              style={{
                width: 36,
                height: 5,
                borderRadius: 3,
                backgroundColor: expandable ? t.colors.borderStrong : t.colors.border,
              }}
            />
          </Pressable>
          {header}
        </View>
      </GestureDetector>
      <Animated.View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          contentH.set(h);
          if (Math.abs(h - bodyH) > 1) setBodyH(h);
        }}
        pointerEvents={shown ? 'auto' : 'none'}
        accessibilityElementsHidden={!shown}
        importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
        style={[{ paddingBottom: t.spacing.md }, bodyStyle]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}
