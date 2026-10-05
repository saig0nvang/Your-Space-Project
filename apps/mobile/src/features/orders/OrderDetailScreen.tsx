/** DH2 — Chi tiết đơn và dòng thời gian giữ tiền (E8-US2). */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  CalendarBlank,
  CalendarX,
  Hammer,
  MapPin,
  Package,
  ShieldCheck,
  Storefront,
  Truck,
  User,
  WifiSlash,
} from 'phosphor-react-native';
import { View } from 'react-native';

import { AppText, Button, Card, ErrorState, OfflineBanner, ScreenScroll, StatusTag, TrustNote } from '@/components/ui';
import { findProduct, SUPPLIERS } from '@/data/catalog';
import { useReviewFlags } from '@/features/me/reviewFlags';
import { formatDate, formatPhone } from '@/lib/format';
import { useIsOnline } from '@/services/network';
import { devAdvanceOrder, devPostponeDelivery } from '@/services/orders';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { Order } from '@/types';

import { DevBlock } from './DevBlock';
import { InfoRow } from './InfoRow';
import { retryConnection } from './offline';
import { canConfirmOrReport, ORDER_STATUS_TAG, statusAt, supplierName } from './orderHelpers';
import { OrderItemsCard } from './OrderItemsCard';
import { DetailSkeleton } from './OrderSkeletons';
import { Timeline, type TimelineStep } from './Timeline';
import { useSimulatedLoad } from './useSimulatedLoad';

const RANK: Record<Order['status'], number> = { paid: 0, shipping: 1, delivered: 1, disputed: 1, received: 2 };

function orderSteps(order: Order, escrowUnknown: boolean): TimelineStep[] {
  const rank = RANK[order.status];
  const delivered = statusAt(order, 'delivered');
  const steps: TimelineStep[] = [
    {
      key: 'paid',
      title: 'Đã thanh toán',
      detail: escrowUnknown
        ? 'Đang kiểm tra trạng thái thanh toán'
        : rank === 2
          ? 'Khoản thanh toán được giữ tại đối tác thanh toán được cấp phép cho tới khi bạn xác nhận.'
          : 'Khoản thanh toán được giữ tại đối tác thanh toán được cấp phép.',
      at: statusAt(order, 'paid'),
      state: rank > 0 ? 'done' : 'current',
      icon: ShieldCheck,
    },
    {
      key: 'shipping',
      title: delivered || rank === 2 ? 'Đã giao' : 'Đang giao',
      detail: delivered
        ? order.status === 'delivered'
          ? 'Nhà cung cấp báo đã giao. Bạn kiểm tra hàng rồi xác nhận.'
          : 'Nhà cung cấp báo đã giao.'
        : `Ngày giao dự kiến ${formatDate(order.deliveryDate)}`,
      at: delivered ?? statusAt(order, 'shipping'),
      state: rank === 0 ? 'upcoming' : rank === 1 && order.status !== 'disputed' ? 'current' : 'done',
      icon: delivered ? Package : Truck,
    },
  ];
  if (order.status === 'disputed') {
    const closed = order.complaint?.status === 'closed';
    steps.push({
      key: 'disputed',
      title: closed ? 'Khiếu nại đã kết thúc' : 'Đang khiếu nại',
      detail: closed
        ? 'Xem kết quả và tiền về đâu trong khiếu nại.'
        : 'Khoản thanh toán tiếp tục được giữ tại đối tác. Nhà cung cấp chưa nhận tiền.',
      at: statusAt(order, 'disputed'),
      state: 'current',
      tone: closed ? 'default' : 'danger',
    });
  }
  steps.push({
    key: 'received',
    title: 'Đã nhận',
    detail:
      rank === 2
        ? 'Bạn đã xác nhận. Khoản thanh toán được chuyển cho nhà cung cấp.'
        : 'Khi bạn xác nhận đã nhận hàng, nhà cung cấp mới nhận tiền.',
    at: statusAt(order, 'received'),
    state: rank === 2 ? 'current' : 'upcoming',
  });
  return steps;
}

export function OrderDetailScreen() {
  const t = useTheme();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useAppStore((s) => s.orders.find((o) => o.id === orderId));
  const online = useIsOnline();
  const loading = useSimulatedLoad();
  const escrowUnknown = useReviewFlags((s) => s.escrowUnknown);

  if (!order) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chi tiết đơn' }} />
        <ScreenScroll>
          <ErrorState title="Không tìm thấy đơn hàng" body="Đơn này không còn trên máy. Bạn xem lại danh sách đơn nhé." />
          <View style={{ alignItems: 'center' }}>
            <Button variant="secondary" label="Về danh sách đơn" onPress={() => router.navigate('/me/orders')} />
          </View>
        </ScreenScroll>
      </>
    );
  }

  const tag = ORDER_STATUS_TAG[order.status];
  const supplier = SUPPLIERS.find((s) => s.id === order.supplierId);
  const needsInstall = order.items.some((i) => findProduct(i.productId)?.needsInstall);
  const installText = order.installSlot ?? (needsInstall ? 'Chưa có lịch lắp đặt' : 'Không cần lắp đặt');
  const canAct = canConfirmOrReport(order.status);
  const params = { orderId: order.id };

  const footer = loading ? undefined : canAct ? (
    <>
      {online ? null : (
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
          <WifiSlash size={18} color={t.colors.mutedForeground} />
          <AppText variant="footnote" color="mutedForeground" style={{ flex: 1 }}>
            Cần có mạng để xác nhận đã nhận hàng.
          </AppText>
        </View>
      )}
      <Button
        label="Xác nhận đã nhận hàng"
        disabled={!online}
        fullWidth
        onPress={() => router.push({ pathname: '/me/orders/[orderId]/receive', params })}
      />
      <Button
        variant="secondary"
        label="Báo sự cố"
        fullWidth
        onPress={() => router.push({ pathname: '/me/orders/[orderId]/issue', params })}
      />
    </>
  ) : order.status === 'disputed' && order.complaint ? (
    <Button
      label="Xem khiếu nại"
      fullWidth
      onPress={() => router.push({ pathname: '/me/orders/[orderId]/complaint', params })}
    />
  ) : undefined;

  return (
    <>
      <Stack.Screen options={{ title: 'Chi tiết đơn' }} />
      <ScreenScroll footer={footer}>
        <OfflineBanner body="Đang hiện trạng thái lần cập nhật gần nhất." onRetry={retryConnection} />
        {loading ? (
          <DetailSkeleton />
        ) : (
          <>
            <View style={{ gap: t.spacing.sm }}>
              <AppText variant="title2" accessibilityRole="header">
                {supplierName(order.supplierId)}
              </AppText>
              <AppText variant="footnote" color="mutedForeground">
                Mã đơn {order.id.slice(-6).toUpperCase()}
              </AppText>
              <StatusTag
                tone={tag.tone}
                label={order.status === 'paid' && escrowUnknown ? 'Đang kiểm tra trạng thái thanh toán' : tag.label}
                icon={tag.icon}
              />
            </View>

            <Card padding="md">
              <Timeline steps={orderSteps(order, escrowUnknown)} accessibilityLabel="Dòng thời gian đơn hàng" />
            </Card>

            <TrustNote />

            <View style={{ gap: t.spacing.sm }}>
              <AppText variant="title3" accessibilityRole="header">
                Các món
              </AppText>
              <OrderItemsCard order={order} />
            </View>

            <View style={{ gap: t.spacing.sm }}>
              <AppText variant="title3" accessibilityRole="header">
                Giao hàng
              </AppText>
              <Card padding="md" style={{ paddingVertical: t.spacing.xs }}>
                <InfoRow icon={CalendarBlank} label="Ngày giao dự kiến" value={formatDate(order.deliveryDate)}>
                  {order.previousDeliveryDate ? (
                    <View style={{ flexDirection: 'row', gap: t.spacing.xs + 2, alignItems: 'flex-start', marginTop: 2 }}>
                      <CalendarX size={16} color={t.colors.foreground} weight="bold" style={{ marginTop: 1 }} />
                      <AppText variant="footnote" weight="600" style={{ flex: 1 }}>
                        Ngày giao đổi từ {formatDate(order.previousDeliveryDate)} sang {formatDate(order.deliveryDate)}
                      </AppText>
                    </View>
                  ) : null}
                </InfoRow>
                <InfoRow icon={Hammer} label="Lắp đặt" value={installText} />
                <InfoRow icon={User} label="Người nhận" value={`${order.recipientName} · ${formatPhone(order.phone)}`} />
                <InfoRow icon={MapPin} label="Địa chỉ" value={order.address} />
                <InfoRow
                  icon={Storefront}
                  label="Liên hệ nhà cung cấp"
                  value={supplier?.contactNote ?? 'Số liên hệ hiện khi nhà cung cấp xác nhận đơn.'}
                  last
                />
              </Card>
            </View>

            {order.status === 'paid' ? (
              <AppText variant="footnote" color="mutedForeground">
                Nhà cung cấp đang chuẩn bị hàng. Bạn xác nhận hoặc báo sự cố được khi đơn bắt đầu giao.
              </AppText>
            ) : null}

            <DevBlock>
              <Button
                variant="secondary"
                label="Chuyển sang bước tiếp theo"
                disabled={order.status !== 'paid' && order.status !== 'shipping'}
                onPress={() => devAdvanceOrder(order.id)}
              />
              <Button
                variant="secondary"
                label="Nhà cung cấp dời ngày giao"
                disabled={order.status === 'received'}
                onPress={() => devPostponeDelivery(order.id)}
              />
            </DevBlock>
          </>
        )}
      </ScreenScroll>
    </>
  );
}
