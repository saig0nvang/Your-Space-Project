/** Một dòng đơn trong DH1: nhà cung cấp, ảnh các món, tổng tiền, trạng thái (icon + chữ). */
import { router } from 'expo-router';
import { CaretRight, ListChecks } from 'phosphor-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ProductThumb } from '@/components/ProductArt';
import { AppText, Button, Card, Price, StatusTag } from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { formatItemCount, formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';
import type { Order } from '@/types';

import { ORDER_STATUS_TAG, supplierName } from './orderHelpers';

const MAX_THUMBS = 4;

export function OrderRow({ order }: { order: Order }) {
  const t = useTheme();
  const tag = ORDER_STATUS_TAG[order.status];
  const name = supplierName(order.supplierId);
  const shown = order.items.slice(0, MAX_THUMBS);
  const more = order.items.length - shown.length;

  const openDetail = () => router.push({ pathname: '/me/orders/[orderId]', params: { orderId: order.id } });
  const openReceive = () => router.push({ pathname: '/me/orders/[orderId]/receive', params: { orderId: order.id } });

  return (
    <Card padding="none">
      <Pressable
        onPress={openDetail}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${formatItemCount(order.items.length)}, ${formatVND(order.totalVND)}, ${tag.label}`}
        accessibilityHint="Mở chi tiết đơn"
        android_ripple={{ color: t.colors.border, foreground: true }}
        style={({ pressed }) => ({
          padding: t.spacing.md,
          gap: t.spacing.sm + 4,
          opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <AppText variant="headline" style={{ flex: 1 }} numberOfLines={2}>
            {name}
          </AppText>
          <Price amount={order.totalVND} variant="headline" />
          <CaretRight size={18} color={t.colors.mutedForeground} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          {shown.map((item, i) => {
            const product = findProduct(item.productId);
            return <ProductThumb key={`${item.productId}-${i}`} category={product?.category ?? 'chair'} productId={item.productId} size={48} />;
          })}
          {more > 0 ? (
            <AppText variant="footnote" color="mutedForeground">
              +{more}
            </AppText>
          ) : null}
          <AppText variant="footnote" color="mutedForeground" style={{ marginLeft: 'auto' }}>
            {formatItemCount(order.items.length)}
          </AppText>
        </View>
        <StatusTag tone={tag.tone} label={tag.label} icon={tag.icon} />
      </Pressable>
      {order.status === 'delivered' ? (
        <View
          style={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: t.colors.border,
            paddingHorizontal: t.spacing.sm,
            paddingVertical: t.spacing.xs,
            alignItems: 'flex-start',
          }}
        >
          <Button
            variant="plain"
            icon={ListChecks}
            label="Xác nhận đã nhận hàng"
            onPress={openReceive}
            accessibilityHint={`Kiểm tra hàng của ${name} rồi xác nhận`}
          />
        </View>
      ) : null}
    </Card>
  );
}
