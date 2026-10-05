import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme, type ColorTokens } from '@/theme';
import type { TypographyVariant } from '@/theme/tokens';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: keyof ColorTokens;
  /** Chữ số đều độ rộng cho giá và số tiền (MASTER.md · Typography). */
  tabular?: boolean;
  align?: TextStyle['textAlign'];
  weight?: '400' | '600';
};

/** Chữ của app: luôn theo thang chữ và màu token; co giãn theo cỡ chữ hệ thống. */
export function AppText({
  variant = 'body',
  color = 'foreground',
  tabular,
  align,
  weight,
  style,
  ...rest
}: AppTextProps) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[
        t.typography[variant],
        { color: t.colors[color] },
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        align ? { textAlign: align } : null,
        weight && variant !== 'display' && variant !== 'largeTitle' && variant !== 'title1' ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
}
