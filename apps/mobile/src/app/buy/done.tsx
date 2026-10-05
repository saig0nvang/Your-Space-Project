/**
 * TT7 — Đặt hàng xong (E7-US6). Mở đầu bằng chính căn phòng của người mua với các món vừa mua
 * (critique 2026-10-03: khoảnh khắc kết phải là căn phòng, không phải dấu check). Nói số đơn và số nhà cung cấp,
 * nhắc khoản tiền đang được giữ, đưa người dùng về đúng nơi đã mở sheet Mua. Không quay lại được các bước thanh toán.
 */
import { router } from 'expo-router';
import { Bell, CheckCircle } from 'phosphor-react-native';
import { View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn, useReducedMotion } from 'react-native-reanimated';

import { AppText, Button, Card, ErrorState, showToast } from '@/components/ui';
import { Appear, BuySheet, BuyUnavailable } from '@/features/buy/BuySheet';
import { DetailRow, Group } from '@/features/buy/components';
import { SceneLayers } from '@/features/editor/SceneLayers';
import { useBuyClose } from '@/features/buy/navigation';
import { formatDayLabel } from '@/features/buy/schedule';
import { getSupplier } from '@/data/catalog';
import { formatVND } from '@/lib/format';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { Order, Space } from '@/types';

const EMPTY_ORDERS: Order[] = [];

export default function DoneScreen() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const session = useAppStore((s) => s.buySession);
  const allOrders = useAppStore((s) => (s.buySession ? s.orders : EMPTY_ORDERS));
  const notificationsAsked = useAppStore((s) => s.user.notificationsAsked);
  const space = useAppStore((s) => {
    const origin = s.buySession?.origin;
    return origin ? s.spaces.find((sp) => sp.id === origin.spaceId) : undefined;
  });
  const spaceExists = space !== undefined;
  const close = useBuyClose('none');

  if (!session) return <BuyUnavailable title="Đặt hàng xong" />;

  const orders = allOrders.filter((o) => session.createdOrderIds.includes(o.id));
  if (session.paymentStatus !== 'paid' || orders.length === 0) {
    return (
      <BuySheet
        title="Đặt hàng xong"
        onClose={() => void close()}
        footer={<Button variant="secondary" label="Đóng" onPress={() => void close()} fullWidth />}
      >
        <ErrorState
          title="Chưa có đơn nào được tạo"
          body="Thanh toán chưa hoàn tất. Đơn sẽ hiện trong Đơn hàng khi đối tác xác nhận thanh toán."
        />
      </BuySheet>
    );
  }

  const supplierCount = new Set(orders.map((o) => o.supplierId)).size;

  const primary = spaceExists
    ? { label: 'Về không gian', onPress: () => void close() }
    : { label: 'Về Phòng của tôi', onPress: () => void close(() => router.navigate('/rooms')) };

  const footer = (
    <>
      <Button label={primary.label} onPress={primary.onPress} fullWidth />
      <Button
        variant="secondary"
        label="Xem đơn hàng"
        onPress={() => void close(() => router.navigate('/me/orders'))}
        fullWidth
      />
    </>
  );

  return (
    <BuySheet title="Đặt hàng xong" onClose={() => void close()} footer={footer}>
      {space ? (
        <Animated.View entering={FadeIn.duration(reduceMotion ? t.motion.fast : t.motion.slow)}>
          <PurchasedRoom space={space} purchasedCount={orders.reduce((n, o) => n + o.items.length, 0)} />
        </Animated.View>
      ) : (
        <View style={{ alignItems: 'center', paddingTop: t.spacing.md }}>
          <Animated.View
            entering={reduceMotion ? FadeIn.duration(t.motion.base) : ZoomIn.duration(t.motion.slow)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: t.colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={40} color={t.colors.primaryText} weight="fill" />
          </Animated.View>
        </View>
      )}
      <View style={{ gap: t.spacing.sm }}>
        <AppText variant="title2" accessibilityRole="header">
          Đã đặt {orders.length} đơn từ {supplierCount} nhà cung cấp
        </AppText>
        <AppText variant="callout" color="mutedForeground">
          Khoản thanh toán được giữ tại đối tác thanh toán được cấp phép đến khi bạn xác nhận đã nhận hàng.
        </AppText>
      </View>

      <Group>
        {orders.map((o, i) => {
          const supplier = getSupplier(o.supplierId);
          const detail = [
            `${o.items.length} món · ${formatVND(o.totalVND)}`,
            `Giao dự kiến ${formatDayLabel(o.deliveryDate)}`,
            o.installSlot ? `Lắp đặt ${o.installSlot}` : null,
          ]
            .filter(Boolean)
            .join('\n');
          return <DetailRow key={o.id} label={supplier.name} value={detail} last={i === orders.length - 1} />;
        })}
      </Group>

      {!notificationsAsked ? (
        <Appear>
          <Card padding="md">
            <View style={{ flexDirection: 'row', gap: t.spacing.sm + 4, alignItems: 'flex-start' }}>
              <Bell size={22} color={t.colors.primaryText} />
              <View style={{ flex: 1, gap: t.spacing.sm + 4 }}>
                <AppText variant="subheadline">
                  Bật thông báo để được nhắc ngày giao và nhắc xác nhận đã nhận hàng.
                </AppText>
                <View style={{ alignItems: 'flex-start' }}>
                  <Button
                    variant="secondary"
                    label="Bật thông báo"
                    onPress={() => {
                      useAppStore.getState().updateUser({ notificationsAsked: true });
                      showToast('Bản thử: đã ghi nhận', 'info');
                    }}
                  />
                </View>
              </View>
            </View>
          </Card>
        </Appear>
      ) : null}
    </BuySheet>
  );
}

/**
 * Căn phòng của người mua với các món đã đặt, cắt về khung ngang quanh vùng có món đã mua.
 * Nhãn "Đã mua N món" ở góc ảnh.
 */
function PurchasedRoom({ space, purchasedCount }: { space: Space; purchasedCount: number }) {
  const t = useTheme();
  const window = useWindowDimensions();
  const width = window.width - t.spacing.md * 2;
  const fullH = width / (space.photoAspect > 0 ? space.photoAspect : 3 / 4);
  const winH = Math.min(fullH, Math.round(width * 0.8));
  const bought = space.items.filter((it) => it.purchased);
  const focus = bought.length > 0 ? bought.reduce((sum, it) => sum + it.y, 0) / bought.length : 0.7;
  const offset = Math.min(Math.max(focus * fullH - winH * 0.62, 0), fullH - winH);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Ảnh ${space.name} với ${purchasedCount} món đã mua`}
      style={{ height: winH, borderRadius: t.radius.md, overflow: 'hidden', backgroundColor: t.colors.muted }}
    >
      <View style={{ transform: [{ translateY: -offset }] }}>
        <SceneLayers
          photoUri={space.photoUri}
          items={space.items}
          erasedRegions={space.erasedRegions}
          calibration={space.calibration}
          frame={{ width, height: fullH }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          left: t.spacing.sm,
          bottom: t.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.xs,
          paddingHorizontal: t.spacing.sm,
          paddingVertical: t.spacing.xs,
          borderRadius: t.radius.sm,
          backgroundColor: t.colors.card,
        }}
      >
        <CheckCircle size={16} color={t.colors.foreground} weight="fill" />
        <AppText variant="footnote" weight="600">
          Đã mua {purchasedCount} món
        </AppText>
      </View>
    </View>
  );
}
