/**
 * Thanh tác vụ của món đang chọn (founder yêu cầu 2026-10-03, theo kiểu IKEA Kreativ): viên thuốc nền `accent`
 * nổi ngay trên món, icon + nhãn chữ `onAccent`. MASTER.md · Component Specs · Thanh tác vụ của món.
 * Nằm ngoài vùng cử chỉ của canvas để chạm nút không bị hiểu là chạm lên ảnh.
 */
import {
  Copy,
  FlipHorizontal,
  PuzzlePiece,
  ShoppingBagOpen,
  Swap,
  Trash,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, withTiming, type EntryAnimationsValues, type ExitAnimationsValues } from 'react-native-reanimated';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';
import { darkColors, disabledOpacity, lightColors, pressedOpacity } from '@/theme/tokens';

const ACTION_W = 58;

type ItemActions = {
  onBuy: () => void;
  onFlip: () => void;
  onReplace: () => void;
  onGoesWith: () => void;
  onCopy: () => void;
  onRemove: () => void;
};

function popIn(_: EntryAnimationsValues) {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 6 }, { scale: 0.94 }] },
    animations: {
      opacity: withTiming(1, { duration: 160 }),
      transform: [
        { translateY: withTiming(0, { duration: 200, easing: Easing.bezier(0.16, 1, 0.3, 1) }) },
        { scale: withTiming(1, { duration: 200, easing: Easing.bezier(0.16, 1, 0.3, 1) }) },
      ],
    },
  };
}

function popOut(_: ExitAnimationsValues) {
  'worklet';
  return { initialValues: { opacity: 1 }, animations: { opacity: withTiming(0, { duration: 110 }) } };
}

// Web chỉ chạy hiệu ứng dựng sẵn của Reanimated: mờ dần thay cho bật lên.
const enter = Platform.OS === 'web' ? FadeIn.duration(160) : popIn;
const exit = Platform.OS === 'web' ? FadeOut.duration(110) : popOut;

function Action({
  icon: Icon,
  label,
  a11yLabel,
  onPress,
  disabled = false,
  tone = 'default',
}: {
  icon: PhosphorIcon;
  label: string;
  a11yLabel: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'destructive';
}) {
  const t = useTheme();
  // Nền accent là đen (theme sáng) / trắng (theme tối): chữ phá hủy lấy destructiveText của theme ngược màu
  // với nền để đủ tương phản (≥ 4.5:1).
  const color = tone === 'destructive' ? (t.scheme === 'dark' ? lightColors.destructiveText : darkColors.destructiveText) : t.colors.onAccent;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        width: ACTION_W,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        opacity: disabled ? disabledOpacity : pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
      })}
    >
      <Icon size={20} color={color} />
      {/* Ô rộng cố định: chữ lớn của hệ thống được phóng tới mức vẫn vừa ô. */}
      <AppText variant="caption2" weight="600" numberOfLines={1} maxFontSizeMultiplier={1.25} style={{ color }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ItemActionBar({
  productName,
  purchased,
  anchor,
  avoidTop,
  avoidBottom,
  screenW,
  onBuy,
  onFlip,
  onReplace,
  onGoesWith,
  onCopy,
  onRemove,
}: ItemActions & {
  productName: string;
  purchased: boolean;
  /** Khung của món trên màn (pt): thanh nằm trên món, không đủ chỗ thì ghim dưới thanh trên. */
  anchor: { x0: number; y0: number; x1: number; y1: number };
  /** Vùng trên cùng không được che (thanh trên và thông báo đang hiện). */
  avoidTop: number;
  /** Mép trên của khay đáy / panel món. */
  avoidBottom: number;
  screenW: number;
}) {
  const t = useTheme();
  const [barH, setBarH] = useState(64);
  const barW = ACTION_W * 6 + t.spacing.sm * 2 + 1 + t.spacing.xs * 2;
  const gap = t.spacing.sm + 4;
  // Ưu tiên nằm trên đầu món. Món cao chạm thanh trên thì thanh ghim ngay dưới thanh trên, đè lên phần đầu món:
  // dưới chân món là chỗ của số đo và tay cầm dời, không được che.
  const above = anchor.y0 - gap - barH;
  const top = Math.min(Math.max(above, avoidTop), avoidBottom - barH - t.spacing.sm);
  const left = Math.min(Math.max((anchor.x0 + anchor.x1) / 2 - barW / 2, t.spacing.sm), screenW - barW - t.spacing.sm);

  return (
    <Animated.View
      entering={enter}
      exiting={exit}
      onLayout={(e) => setBarH(e.nativeEvent.layout.height)}
      accessibilityRole="toolbar"
      accessibilityLabel={`Tác vụ cho ${productName}`}
      style={[
        {
          position: 'absolute',
          left,
          top,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: t.spacing.sm,
          paddingVertical: t.spacing.xs,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.accent,
        },
        t.shadow('lg'),
      ]}
    >
      <Action
        icon={ShoppingBagOpen}
        label={purchased ? 'Đã mua' : 'Mua'}
        a11yLabel={purchased ? `${productName} đã mua` : `Mua riêng ${productName}`}
        onPress={onBuy}
        disabled={purchased}
      />
      <View style={{ width: 1, alignSelf: 'stretch', marginVertical: t.spacing.sm, marginHorizontal: t.spacing.xs, backgroundColor: t.colors.onAccent, opacity: 0.25 }} />
      <Action icon={FlipHorizontal} label="Lật" a11yLabel={`Lật ${productName}, quay 180 độ`} onPress={onFlip} />
      <Action
        icon={Swap}
        label="Đổi món"
        a11yLabel={`Đổi ${productName} sang món khác cùng loại, giữ chỗ đặt`}
        onPress={onReplace}
        disabled={purchased}
      />
      <Action icon={PuzzlePiece} label="Hợp với" a11yLabel={`Xem món cùng phong cách hợp với ${productName}`} onPress={onGoesWith} />
      <Action icon={Copy} label="Nhân bản" a11yLabel={`Nhân bản ${productName}`} onPress={onCopy} />
      <Action icon={Trash} label="Bỏ" a11yLabel={`Bỏ ${productName} khỏi phòng`} onPress={onRemove} tone="destructive" />
    </Animated.View>
  );
}
