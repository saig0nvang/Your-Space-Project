/** Dòng món trong K3 (E1-US6 AC3): ảnh, tên, giá, nhà cung cấp, kích thước. */
import { CaretRight } from 'phosphor-react-native';
import { Platform, Pressable, View } from 'react-native';

import { AppText, Price, StatusTag } from '@/components/ui';
import { getSupplier } from '@/data/catalog';
import { formatDimensions, formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';
import type { Product } from '@/types';

import { ArtTile } from './ArtTile';

const THUMB = 88;

export function ProductRow({
  product,
  loading,
  offline,
  onPress,
}: {
  product: Product;
  loading: boolean;
  offline: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const supplier = getSupplier(product.supplierId);
  const dims = formatDimensions(product.dimensions);
  const outOfStock = product.status === 'out_of_stock';

  return (
    // Hướng A: dòng phẳng, không khung thẻ; ô ảnh muted bên trái, giá vàng đồng (MASTER.md · Cards).
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ paddingVertical: t.spacing.sm, opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1 })}
      accessibilityLabel={[
        product.name,
        formatVND(product.priceVND),
        supplier.name,
        `kích thước ${dims}`,
        outOfStock ? 'tạm hết hàng' : null,
      ]
        .filter(Boolean)
        .join(', ')}
      accessibilityHint="Mở chi tiết món"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <ArtTile
          categories={[product.category]}
          productIds={[product.id]}
          width={THUMB}
          height={THUMB}
          artSize={70}
          loading={loading}
          offline={offline}
          style={{ borderRadius: t.radius.md }}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="headline" numberOfLines={2}>
            {product.name}
          </AppText>
          <Price amount={product.priceVND} variant="callout" color="accentText" />
          <AppText variant="footnote" color="mutedForeground">
            {supplier.name}
          </AppText>
          <AppText variant="footnote" color="mutedForeground" tabular>
            Kích thước {dims}
          </AppText>
          {outOfStock ? (
            <View style={{ marginTop: t.spacing.xs }}>
              <StatusTag tone="attention" label="Tạm hết hàng" />
            </View>
          ) : null}
        </View>
        <CaretRight size={18} color={t.colors.mutedForeground} />
      </View>
    </Pressable>
  );
}
