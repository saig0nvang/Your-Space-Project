import { Flask } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { useDevFlags } from '@/store/devFlags';
import { useTheme } from '@/theme';

/** Khối điều khiển giả lập, chỉ render khi __DEV__ và đã bật "Hiện nút giả lập trên màn" (bản thử chưa có backend). */
export function DevBlock({ children }: { children: ReactNode }) {
  const t = useTheme();
  const show = useDevFlags((s) => s.showDevControls);
  if (!__DEV__ || !show) return null;
  return (
    <Card padding="md" style={{ gap: t.spacing.sm, borderStyle: 'dashed', borderColor: t.colors.borderStrong, borderWidth: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        <Flask size={20} color={t.colors.primaryText} />
        <AppText variant="headline" accessibilityRole="header">
          Giả lập
        </AppText>
      </View>
      <AppText variant="footnote" color="mutedForeground">
        Chỉ có trong bản thử, thay cho cập nhật từ nhà cung cấp và đối tác thanh toán.
      </AppText>
      <View style={{ gap: t.spacing.sm, alignItems: 'flex-start' }}>{children}</View>
    </Card>
  );
}
