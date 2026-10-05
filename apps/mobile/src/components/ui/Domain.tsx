/** Thành phần gắn với nghiệp vụ: câu giữ tiền, chip AI, giá. */
import { ShieldCheck, Sparkle } from 'phosphor-react-native';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';

import { ESCROW_TEXT } from '@/lib/copy';
import { formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import { pressedOpacity, type TypographyVariant } from '@/theme/tokens';

import { AppText } from './AppText';

/** Câu giữ tiền nguyên văn, luôn kèm icon (E7-US5 AC4, E8-US2 AC2). */
export function TrustNote({ style }: { style?: ViewStyle }) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: t.spacing.sm + 2, alignItems: 'flex-start' }, style]}>
      <ShieldCheck size={22} color={t.colors.primaryText} weight="regular" />
      <AppText variant="footnote" color="primaryText" style={{ flex: 1 }}>
        {ESCROW_TEXT}
      </AppText>
    </View>
  );
}

/** Chip nói AI vừa làm gì và cách sửa (PRD §4.2). Nổi trên ảnh phòng. */
export function AIChip({ text, actionLabel, onAction }: { text: string; actionLabel?: string; onAction?: () => void }) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.sm,
          alignSelf: 'center',
          maxWidth: '92%',
          paddingLeft: t.spacing.md - 2,
          paddingRight: actionLabel ? t.spacing.xs : t.spacing.md,
          minHeight: 40,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.accent,
        },
        t.shadow('md'),
      ]}
    >
      {/* MASTER.md · Chip AI: viên thuốc nền accent, chữ onAccent. */}
      <Sparkle size={18} color={t.colors.onAccent} weight="fill" />
      <AppText variant="footnote" weight="600" color="onAccent" style={{ flexShrink: 1 }}>
        {text}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          style={({ pressed }) => ({
            minHeight: t.touchTarget,
            justifyContent: 'center',
            paddingHorizontal: t.spacing.sm,
            opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
          })}
        >
          <AppText variant="footnote" weight="600" color="onAccent" style={{ textDecorationLine: 'underline' }}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Giá dạng `12.400.000 ₫`, chữ số đều độ rộng. */
export function Price({
  amount,
  variant = 'body',
  color = 'foreground',
  strike = false,
}: {
  amount: number;
  variant?: TypographyVariant;
  /** `accentText` (vàng đồng) chỉ trên nền background / card, không trên muted (MASTER.md). */
  color?: 'foreground' | 'mutedForeground' | 'cardForeground' | 'accentText';
  strike?: boolean;
}) {
  return (
    <AppText variant={variant} color={color} tabular style={strike ? { textDecorationLine: 'line-through' } : undefined}>
      {formatVND(amount)}
    </AppText>
  );
}
