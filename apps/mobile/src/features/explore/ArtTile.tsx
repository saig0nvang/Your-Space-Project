/**
 * Ô hình của nhóm Khám phá: nền `muted` + hình minh họa món (ProductArt).
 * Chưa có ảnh phong cách / ảnh món thật nên dùng hình minh họa, không dùng ảnh phòng mẫu để giả làm ảnh phong cách.
 * Mất mạng (G1): ảnh "chưa tải được" → giữ nền `muted` + icon (+ chữ khi ô đủ lớn), không để khung trắng.
 */
import { ImageBroken } from 'phosphor-react-native';
import { View, type ViewStyle } from 'react-native';

import { AppText, Skeleton } from '@/components/ui';
import { ProductArt } from '@/components/ProductArt';
import { useTheme } from '@/theme';
import type { ProductCategory } from '@/types';

export function ArtTile({
  categories,
  productIds,
  width,
  height,
  artSize,
  offline = false,
  loading = false,
  offlineText,
  style,
}: {
  categories: ProductCategory[];
  /** Id món tương ứng để tô đúng chất liệu. */
  productIds?: string[];
  width: number | `${number}%`;
  height: number;
  /** Cỡ hình của món đầu; món sau nhỏ hơn để có chiều sâu. */
  artSize: number;
  offline?: boolean;
  loading?: boolean;
  /** Chữ hiện cạnh icon khi mất mạng (chỉ dùng cho ô đủ lớn). */
  offlineText?: string;
  style?: ViewStyle;
}) {
  const t = useTheme();

  if (loading) {
    return <Skeleton width={width} height={height} radius={t.radius.md} style={style} />;
  }

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: t.radius.md,
          backgroundColor: t.colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {offline ? (
        <View style={{ alignItems: 'center', gap: t.spacing.xs, paddingHorizontal: t.spacing.sm }}>
          <ImageBroken size={offlineText ? 24 : 20} color={t.colors.mutedForeground} />
          {offlineText ? (
            <AppText variant="footnote" color="mutedForeground" align="center">
              {offlineText}
            </AppText>
          ) : null}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.xs }}>
          {categories.map((c, i) => (
            <ProductArt key={`${c}-${i}`} category={c} productId={productIds?.[i]} size={i === 0 ? artSize : Math.round(artSize * 0.72)} />
          ))}
        </View>
      )}
    </View>
  );
}
