import { Platform, Pressable, View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';

type CardProps = ViewProps & {
  onPress?: () => void;
  padding?: 'none' | 'md' | 'lg';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Khối nội dung theo MASTER.md · Cards (hướng A, phẳng): nền muted, bo radius-md, không viền, không bóng.
 * Thẻ bấm được có phản hồi nhấn như nút, không nhấc lên khi nhấn. Không đặt chữ vàng đồng bên trong (4.48:1).
 */
export function Card({ onPress, padding = 'lg', style, children, accessibilityLabel, accessibilityHint, ...rest }: CardProps) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.colors.muted,
    borderRadius: t.radius.md,
    padding: padding === 'none' ? 0 : padding === 'md' ? t.spacing.md : t.spacing.lg,
  };
  if (!onPress) {
    return (
      <View {...rest} style={[base, style]}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: t.colors.border, foreground: true }}
      style={({ pressed }) => [base, { opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
