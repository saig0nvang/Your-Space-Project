/** Danh sách món của một đơn kèm giá đã trả và tổng. */
import { StyleSheet, View } from 'react-native';

import { ProductThumb } from '@/components/ProductArt';
import { AppText, Card, Price } from '@/components/ui';
import { findProduct } from '@/data/catalog';
import { formatDimensions, formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import type { Order } from '@/types';

import { productName } from './orderHelpers';

export function OrderItemsCard({ order }: { order: Order }) {
  const t = useTheme();
  return (
    <Card padding="md" style={{ gap: t.spacing.sm + 4 }}>
      {order.items.map((item, i) => {
        const product = findProduct(item.productId);
        const name = productName(item.productId);
        return (
          <View
            key={`${item.productId}-${i}`}
            accessible
            accessibilityLabel={`${name}, ${formatVND(item.priceVND)}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm + 4 }}
          >
            <ProductThumb category={product?.category ?? 'chair'} productId={product?.id} size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="body">{name}</AppText>
              {product ? (
                <AppText variant="footnote" color="mutedForeground">
                  {formatDimensions(product.dimensions)}
                </AppText>
              ) : null}
            </View>
            <Price amount={item.priceVND} variant="subheadline" />
          </View>
        );
      })}
      <View
        accessible
        accessibilityLabel={`Tổng đơn ${formatVND(order.totalVND)}`}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: t.spacing.sm + 4,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: t.colors.border,
        }}
      >
        <AppText variant="headline">Tổng đơn</AppText>
        <Price amount={order.totalVND} variant="headline" />
      </View>
    </Card>
  );
}
