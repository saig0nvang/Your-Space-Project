/**
 * Thanh dự toán luôn hiện ở đáy E1 (E4-US2 AC4): tổng tiền món chưa mua + số món, nút chính duy nhất.
 * Chế độ Xóa có vùng chọn: thanh thu gọn còn tổng tiền và nút chính đổi thành "Xóa N vật thể" (docs/screens.md Q8).
 */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Price } from '@/components/ui';
import { formatVND } from '@/lib/format';
import { useTheme } from '@/theme';

import type { Estimate } from './model';

export function EstimateBar({
  estimate,
  compact = false,
  action,
  onLayoutHeight,
  floating = true,
}: {
  estimate: Estimate;
  /** Chỉ còn tổng tiền (khi nút Xóa thay chỗ nút Mua). */
  compact?: boolean;
  action: ReactNode;
  onLayoutHeight?: (h: number) => void;
  /** true: dính đáy màn, đè lên canvas. false: nằm cuối luồng nội dung (xem 2D). */
  floating?: boolean;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const purchasedNote = estimate.purchasedCount > 0 ? ` · ${estimate.purchasedCount} món đã mua không tính` : '';
  const a11y = compact
    ? `Dự toán ${formatVND(estimate.total)}`
    : `Dự toán ${formatVND(estimate.total)}, ${estimate.count} món${purchasedNote}`;

  return (
    <View
      onLayout={(e) => onLayoutHeight?.(e.nativeEvent.layout.height)}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.sm + 4,
          paddingHorizontal: t.spacing.md,
          paddingTop: t.spacing.sm + 4,
          paddingBottom: insets.bottom + t.spacing.sm + 4,
          backgroundColor: t.colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: t.colors.border,
        },
        floating ? { position: 'absolute', left: 0, right: 0, bottom: 0 } : null,
      ]}
    >
      <View style={{ flex: 1, gap: 2 }} accessible accessibilityLabel={a11y}>
        <AppText variant="footnote" color="mutedForeground" numberOfLines={2}>
          {compact ? 'Dự toán' : `Dự toán · ${estimate.count} món${purchasedNote}`}
        </AppText>
        {/* MASTER.md · Typography: tổng tiền ở thanh dự toán dùng Bricolage Grotesque. */}
        <Price amount={estimate.total} variant={compact ? 'title3' : 'title1'} />
      </View>
      {action}
    </View>
  );
}
