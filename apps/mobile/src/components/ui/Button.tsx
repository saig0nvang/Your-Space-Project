import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { disabledOpacity, pressedOpacity } from '@/theme/tokens';

import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'plain' | 'link' | 'destructive' | 'destructivePlain';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: PhosphorIcon;
  loading?: boolean;
  /** Chữ hiện thay nhãn khi đang xử lý, ví dụ "Đang gửi". */
  loadingLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Ghi đè tên đọc bởi trình đọc màn hình khi nhãn ngắn chưa đủ rõ (ví dụ "Mở"). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  testID?: string;
};

/**
 * Nút theo MASTER.md · Buttons (hướng A): viên thuốc. "primary" (nền accent, đen) tối đa MỘT nút mỗi màn;
 * nút toàn chiều ngang cao 54. "plain" là nút chữ màu chữ chính; "link" là nút chữ vàng đồng, dùng tiết kiệm.
 * Nhấn: phản hồi trong 100 ms, không đổi kích thước. Đang xử lý: giữ kích thước, không nhận bấm lần hai.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  loading = false,
  loadingLabel,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const t = useTheme();
  const c = t.colors;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.accent, fg: c.onAccent },
    secondary: { bg: 'transparent', fg: c.primaryText, border: c.primaryText },
    plain: { bg: 'transparent', fg: c.foreground },
    link: { bg: 'transparent', fg: c.accentText },
    destructive: { bg: c.destructive, fg: c.onDestructive },
    destructivePlain: { bg: 'transparent', fg: c.destructiveText },
  };
  const p = palette[variant];
  const isPlain = variant === 'plain' || variant === 'link' || variant === 'destructivePlain';
  const inactive = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : (accessibilityLabel ?? label)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      aria-disabled={inactive}
      aria-busy={loading}
      android_ripple={isPlain ? undefined : { color: c.border, foreground: true }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: fullWidth && !isPlain ? 54 : t.touchTarget,
          borderRadius: t.radius.pill,
          backgroundColor: p.bg,
          paddingHorizontal: isPlain ? t.spacing.sm : t.spacing.lg,
          paddingVertical: p.border ? 10.5 : 12,
          borderWidth: p.border ? 1.5 : 0,
          borderColor: p.border,
          opacity: disabled ? disabledOpacity : pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      <View style={[styles.row, { gap: t.spacing.sm }]}>
        {loading ? (
          <ActivityIndicator size="small" color={p.fg} />
        ) : Icon ? (
          <Icon size={20} color={p.fg} weight="regular" />
        ) : null}
        <AppText variant="headline" style={{ color: p.fg }} numberOfLines={2} align="center">
          {loading && loadingLabel ? loadingLabel : label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
});
