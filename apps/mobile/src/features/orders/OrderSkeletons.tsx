/** Khung xương (G4) đúng bố cục của danh sách đơn và chi tiết đơn / khiếu nại. */
import { View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { useTheme } from '@/theme';

export function OrderListSkeleton() {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel="Đang tải đơn hàng" style={{ gap: t.spacing.md }}>
      {[0, 1, 2].map((i) => (
        <Card key={i} padding="md" style={{ gap: t.spacing.sm + 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width="45%" height={20} />
            <Skeleton width="30%" height={20} />
          </View>
          <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
            <Skeleton width={48} height={48} />
            <Skeleton width={48} height={48} />
          </View>
          <Skeleton width="55%" height={22} />
        </Card>
      ))}
    </View>
  );
}

export function DetailSkeleton() {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel="Đang tải" style={{ gap: t.spacing.lg }}>
      <Skeleton width="60%" height={28} />
      <Card padding="md" style={{ gap: t.spacing.md }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flexDirection: 'row', gap: t.spacing.sm + 4 }}>
            <Skeleton width={24} height={24} radius={12} />
            <View style={{ flex: 1, gap: t.spacing.xs }}>
              <Skeleton width="50%" height={20} />
              <Skeleton width="80%" height={16} />
            </View>
          </View>
        ))}
      </Card>
      <Skeleton width="100%" height={56} />
      <Card padding="md" style={{ gap: t.spacing.sm }}>
        <Skeleton width="40%" height={20} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="70%" height={16} />
      </Card>
    </View>
  );
}
