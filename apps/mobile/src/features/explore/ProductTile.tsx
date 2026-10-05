/** Ô món trong lưới "Món tiêu biểu" (K2): ảnh, tên, giá. */
import { Platform, Pressable, View } from 'react-native';

import { AppText, Price } from '@/components/ui';
import { formatVND } from '@/lib/format';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';
import type { Product } from '@/types';

import { ArtTile } from './ArtTile';

export function ProductTile({
  product,
  width,
  loading,
  offline,
  onPress,
}: {
  product: Product;
  width: number;
  loading: boolean;
  offline: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatVND(product.priceVND)}`}
      accessibilityHint="Mở chi tiết món"
      android_ripple={{ color: t.colors.border, foreground: true }}
      style={({ pressed }) => ({
        width,
        gap: t.spacing.sm,
        opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
      })}
    >
      <ArtTile
        categories={[product.category]}
          productIds={[product.id]}
        width={width}
        height={width}
        artSize={Math.round(width * 0.72)}
        loading={loading}
        offline={offline}
      />
      <View style={{ gap: 2 }}>
        <AppText variant="subheadline" weight="600" numberOfLines={2}>
          {product.name}
        </AppText>
        <Price amount={product.priceVND} variant="subheadline" color="accentText" />
      </View>
    </Pressable>
  );
}
