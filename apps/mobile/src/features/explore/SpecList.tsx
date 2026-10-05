/**
 * Danh sách nhãn – giá trị (đặc trưng phong cách, thông số món). Nhãn ở trên, giá trị ở dưới,
 * để giá trị dài (chất liệu, kích thước) xuống dòng tự nhiên ở cỡ chữ lớn.
 */
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { MaterialSwatch } from '@/components/ProductArt';
import { useTheme } from '@/theme';
import type { MaterialKey } from '@/theme/tokens';

export type SpecItem = {
  label: string;
  value: string;
  tabular?: boolean;
  icon?: PhosphorIcon;
  /** Chấm mẫu chất liệu hiện dưới giá trị (MASTER.md · Màu chất liệu). */
  swatches?: MaterialKey[];
};

export function SpecList({ items }: { items: SpecItem[] }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.colors.card,
        borderRadius: t.radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.colors.border,
        overflow: 'hidden',
      }}
    >
      {items.map((it, i) => (
        <View
          key={it.label}
          accessible
          accessibilityLabel={`${it.label}: ${it.value}`}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: t.spacing.sm + 4,
            paddingHorizontal: t.spacing.md,
            paddingVertical: t.spacing.sm + 4,
            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: t.colors.border,
          }}
        >
          {it.icon ? <it.icon size={22} color={t.colors.primaryText} style={{ marginTop: 2 }} /> : null}
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="footnote" color="mutedForeground">
              {it.label}
            </AppText>
            <AppText variant="body" tabular={it.tabular}>
              {it.value}
            </AppText>
            {it.swatches?.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.xs }}>
                {it.swatches.map((m) => (
                  <MaterialSwatch key={m} material={m} size={16} showLabel={false} />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
