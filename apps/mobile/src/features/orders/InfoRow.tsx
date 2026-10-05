import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';

/** Dòng thông tin chỉ đọc: icon, nhãn nhỏ, giá trị. Dùng trong thẻ chi tiết đơn và khiếu nại. */
export function InfoRow({
  icon: Icon,
  label,
  value,
  children,
  last = false,
}: {
  icon: PhosphorIcon;
  label: string;
  value?: string;
  children?: ReactNode;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={value && !children ? `${label}: ${value}` : undefined}
      style={{
        flexDirection: 'row',
        gap: t.spacing.sm + 4,
        paddingVertical: t.spacing.sm + 4,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: t.colors.border,
      }}
    >
      <Icon size={22} color={t.colors.primaryText} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="footnote" color="mutedForeground">
          {label}
        </AppText>
        {value ? <AppText variant="body">{value}</AppText> : null}
        {children}
      </View>
    </View>
  );
}
