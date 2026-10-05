/** DH1 — Đơn hàng (E8-US1). */
import { router, Stack } from 'expo-router';
import { Package } from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText, EmptyState, OfflineBanner, ScreenScroll } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';

import { retryConnection } from './offline';
import { formatDayMonth, groupOrdersByPayment } from './orderHelpers';
import { OrderRow } from './OrderRow';
import { OrderListSkeleton } from './OrderSkeletons';
import { useSimulatedLoad } from './useSimulatedLoad';

export function OrderListScreen() {
  const t = useTheme();
  const orders = useAppStore((s) => s.orders);
  const verifiedPhone = useAppStore((s) => s.user.verifiedPhone);
  const loading = useSimulatedLoad();
  const groups = groupOrdersByPayment(orders);

  return (
    <>
      <Stack.Screen options={{ title: 'Đơn hàng' }} />
      <ScreenScroll>
        <OfflineBanner body="Đang hiện danh sách lần cập nhật gần nhất." onRetry={retryConnection} />
        {loading ? (
          <OrderListSkeleton />
        ) : orders.length === 0 ? (
          <View>
            <EmptyState
              icon={Package}
              title="Chưa có đơn hàng"
              body="Đơn sẽ hiện ở đây sau khi bạn mua."
              actionLabel="Đến Phòng của tôi"
              actionVariant="secondary"
              onAction={() => router.navigate('/rooms')}
            />
            {verifiedPhone ? null : (
              <AppText variant="footnote" color="mutedForeground" align="center" style={{ paddingHorizontal: t.spacing.lg }}>
                Bạn từng mua trên máy khác? Khi thanh toán lần đầu trên máy này, hãy xác minh đúng số điện thoại đã dùng để
                xem lại các đơn cũ.
              </AppText>
            )}
          </View>
        ) : (
          groups.map((g) => (
            <View key={g.paymentId} style={{ gap: t.spacing.sm }}>
              <AppText variant="footnote" color="mutedForeground" style={{ paddingHorizontal: t.spacing.xs }}>
                {g.orders.length > 1
                  ? `Cùng một lần thanh toán · ${formatDayMonth(g.paidAt)} · tách thành ${g.orders.length} đơn theo nhà cung cấp`
                  : `Thanh toán · ${formatDayMonth(g.paidAt)}`}
              </AppText>
              {g.orders.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </View>
          ))
        )}
      </ScreenScroll>
    </>
  );
}
