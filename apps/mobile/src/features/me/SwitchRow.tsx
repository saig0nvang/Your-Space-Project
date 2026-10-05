import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme';

/** Dòng cài đặt có Switch gốc của RN; mô tả nói nó ảnh hưởng màn nào. VoiceOver dừng ở Switch (nhãn + mô tả). */
export function SwitchRow({
  title,
  description,
  value,
  onChange,
  last = false,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <SettingRow title={title} description={description} last={last}>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={title}
        accessibilityHint={description}
        trackColor={{ false: t.colors.secondary, true: t.colors.primaryText }}
        ios_backgroundColor={t.colors.secondary}
        thumbColor={t.colors.card}
      />
    </SettingRow>
  );
}

/** Khung dòng: tiêu đề + mô tả bên trái, điều khiển bên phải (hoặc bên dưới nếu `stacked`). */
export function SettingRow({
  title,
  description,
  children,
  stacked = false,
  last = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  stacked?: boolean;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : 'center',
        gap: t.spacing.sm + 4,
        paddingHorizontal: t.spacing.md,
        paddingVertical: t.spacing.sm + 4,
        minHeight: 52,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: t.colors.border,
      }}
    >
      <View
        style={{ flex: stacked ? undefined : 1, gap: 2 }}
        accessibilityElementsHidden={!stacked}
        importantForAccessibility={stacked ? 'auto' : 'no-hide-descendants'}
      >
        <AppText variant="body">{title}</AppText>
        <AppText variant="footnote" color="mutedForeground">
          {description}
        </AppText>
      </View>
      {children}
    </View>
  );
}
