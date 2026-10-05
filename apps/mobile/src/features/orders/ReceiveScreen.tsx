/** DH3 — Xác nhận đã nhận hàng sau checklist (E8-US3). */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Info } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ProductThumb } from '@/components/ProductArt';
import { AppText, Banner, Button, Card, ErrorState, OfflineBanner, ScreenScroll, showToast } from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { formatDimensions } from '@/lib/format';
import { isOfflineForced, useIsOnline } from '@/services/network';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { ComplaintType, Order } from '@/types';

import { CheckRow } from './CheckRow';
import { retryConnection } from './offline';
import { canConfirmOrReport, productName, supplierName, wait } from './orderHelpers';

type CheckKind = 'item' | 'material' | 'size' | 'intact' | 'installed';
type CheckItem = { key: string; kind: CheckKind; label: string };

/** Cách nói vấn đề khi một mục chưa được đánh dấu đạt (tránh phủ định kép kiểu "Chưa đạt: Không hư hỏng"). */
const PROBLEM_FOR_CHECK: Record<CheckKind, string> = {
  item: 'giao sai món',
  material: 'sai chất liệu',
  size: 'sai kích thước',
  intact: 'bị hư hỏng',
  installed: 'chưa được lắp đặt',
};

/** Loại sự cố gợi ý từ mục chưa đạt đầu tiên, để form báo sự cố điền sẵn (critique 2026-10-03). */
const ISSUE_FOR_CHECK: Record<CheckKind, ComplaintType | null> = {
  item: 'wrong_item',
  material: 'wrong_size_material',
  size: 'wrong_size_material',
  intact: 'damaged',
  installed: null,
};

function checksFor(order: Order, index: number): CheckItem[] {
  const product = findProduct(order.items[index].productId);
  const noneNeedInstall = !order.items.some((i) => findProduct(i.productId)?.needsInstall);
  const installed = order.installSlot !== null && (product?.needsInstall || noneNeedInstall);
  return [
    { key: `${index}:item`, kind: 'item', label: 'Đúng món' },
    { key: `${index}:material`, kind: 'material', label: product ? `Đúng chất liệu: ${product.material}` : 'Đúng chất liệu' },
    {
      key: `${index}:size`,
      kind: 'size',
      label: product ? `Đúng kích thước: ${formatDimensions(product.dimensions)}` : 'Đúng kích thước',
    },
    { key: `${index}:intact`, kind: 'intact', label: 'Không hư hỏng' },
    ...(installed ? [{ key: `${index}:installed`, kind: 'installed' as const, label: 'Đã lắp đặt' }] : []),
  ];
}

export function ReceiveScreen() {
  const t = useTheme();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useAppStore((s) => s.orders.find((o) => o.id === orderId));
  const setOrderStatus = useAppStore((s) => s.setOrderStatus);
  const online = useIsOnline();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const inFlight = useRef(false);

  if (!order || (!canConfirmOrReport(order.status) && !done)) {
    return (
      <>
        <Stack.Screen options={{ title: 'Xác nhận nhận hàng' }} />
        <ScreenScroll>
          <ErrorState
            title={order ? 'Đơn này không chờ xác nhận' : 'Không tìm thấy đơn hàng'}
            body={
              order
                ? 'Đơn đã được xác nhận, đang khiếu nại hoặc chưa bắt đầu giao. Bạn xem trạng thái ở chi tiết đơn.'
                : 'Đơn này không còn trên máy.'
            }
          />
          <View style={{ alignItems: 'center' }}>
            <Button variant="secondary" label="Quay lại" onPress={() => router.back()} />
          </View>
        </ScreenScroll>
      </>
    );
  }

  const groups = order.items.map((_, i) => checksFor(order, i));
  const all = groups.flat();
  const doneCount = all.filter((c) => checked[c.key]).length;
  const remaining = all.length - doneCount;
  const params = { orderId: order.id };

  /** Mở báo sự cố cho riêng một món, mang theo các mục chưa đạt để không phải nhập lại. */
  const reportItem = (index: number) => {
    const failedChecks = groups[index].filter((c) => !checked[c.key]);
    const type = failedChecks.map((c) => ISSUE_FOR_CHECK[c.kind]).find((x) => x !== null) ?? '';
    const problems = failedChecks.map((c) => PROBLEM_FOR_CHECK[c.kind]);
    const note = problems.length > 0 ? `Món có vấn đề: ${problems.join(', ')}.` : '';
    router.replace({
      pathname: '/me/orders/[orderId]/issue',
      params: { orderId: order.id, productId: order.items[index].productId, type, note },
    });
  };

  const confirm = async () => {
    if (inFlight.current || remaining > 0) return;
    inFlight.current = true;
    setSubmitting(true);
    setFailed(false);
    await wait(700);
    if (!online || isOfflineForced()) {
      setFailed(true);
      setSubmitting(false);
      inFlight.current = false;
      return;
    }
    setDone(true);
    setOrderStatus(order.id, 'received');
    showToast('Đã xác nhận nhận hàng. Khoản thanh toán được chuyển cho nhà cung cấp.');
    router.back();
  };

  const footer = (
    <>
      {failed ? (
        <Animated.View entering={FadeIn.duration(t.motion.base)}>
          <Banner
            tone="error"
            title="Chưa gửi được xác nhận"
            body="Chưa có kết nối mạng nên xác nhận chưa được ghi nhận. Kiểm tra mạng rồi bấm xác nhận lại."
          />
        </Animated.View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'flex-start' }}>
        <Info size={18} color={t.colors.primaryText} style={{ marginTop: 1 }} />
        <AppText variant="footnote" color="primaryText" style={{ flex: 1 }}>
          Sau khi xác nhận, khoản thanh toán được chuyển cho nhà cung cấp.
        </AppText>
      </View>
      <Button
        label="Xác nhận đã nhận hàng"
        loadingLabel="Đang gửi xác nhận"
        loading={submitting}
        disabled={remaining > 0}
        fullWidth
        onPress={confirm}
        accessibilityHint={remaining > 0 ? `Còn ${remaining} mục chưa kiểm` : undefined}
      />
      <Button
        variant="secondary"
        label="Báo sự cố"
        fullWidth
        disabled={submitting}
        onPress={() => router.replace({ pathname: '/me/orders/[orderId]/issue', params })}
      />
    </>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Xác nhận nhận hàng' }} />
      <ScreenScroll footer={footer}>
        <OfflineBanner body="Cần có mạng để gửi xác nhận. Bạn vẫn kiểm từng món được." onRetry={retryConnection} />
        <View style={{ gap: t.spacing.xs }}>
          <AppText variant="title2" accessibilityRole="header">
            Kiểm từng món của {supplierName(order.supplierId)}
          </AppText>
          <AppText variant="callout" color="mutedForeground">
            Đánh dấu từng mục khi hàng đúng như bạn đã chọn. Món nào không đạt thì báo sự cố, khoản thanh toán tiếp tục được giữ.
          </AppText>
          <AppText variant="footnote" weight="600" color="primaryText" accessibilityLiveRegion="polite">
            Đã kiểm {doneCount}/{all.length} mục
          </AppText>
        </View>

        {order.items.map((item, i) => {
          const product = findProduct(item.productId);
          return (
            <Card key={`${item.productId}-${i}`} padding="md" style={{ gap: t.spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm + 4, marginBottom: t.spacing.xs }}>
                <ProductThumb category={product?.category ?? 'chair'} productId={product?.id} size={56} />
                <AppText variant="headline" style={{ flex: 1 }} accessibilityRole="header">
                  {productName(item.productId)}
                </AppText>
              </View>
              {groups[i].map((c) => (
                <CheckRow
                  key={c.key}
                  label={c.label}
                  checked={Boolean(checked[c.key])}
                  disabled={submitting}
                  onChange={(next) => setChecked((prev) => ({ ...prev, [c.key]: next }))}
                />
              ))}
              <View style={{ alignItems: 'flex-start' }}>
                <Button
                  variant="plain"
                  label="Món này không đạt"
                  disabled={submitting}
                  accessibilityHint="Mở báo sự cố cho món này, điền sẵn các mục chưa đánh dấu"
                  onPress={() => reportItem(i)}
                />
              </View>
            </Card>
          );
        })}
      </ScreenScroll>
    </>
  );
}
