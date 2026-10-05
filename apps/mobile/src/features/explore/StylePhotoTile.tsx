/** Ảnh phong cách (K1 thẻ, K2 ảnh lớn). Mất mạng hoặc đang tải: giữ khung đúng cỡ (G1, G4). */
import { Image } from 'expo-image';
import { ImageBroken } from 'phosphor-react-native';
import { View, type ViewStyle } from 'react-native';

import { AppText, Skeleton } from '@/components/ui';
import { STYLE_PHOTOS } from '@/data/stylePhotos';
import { useTheme } from '@/theme';
import type { StyleId } from '@/types';

export function StylePhotoTile({
  styleId,
  width,
  height,
  loading = false,
  offline = false,
  offlineText,
  style,
}: {
  styleId: StyleId;
  width: number | `${number}%`;
  height: number;
  loading?: boolean;
  offline?: boolean;
  offlineText?: string;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const photo = STYLE_PHOTOS[styleId];
  if (loading) return <Skeleton width={width} height={height} radius={t.radius.md} style={style} />;
  return (
    <View style={[{ width, height, borderRadius: t.radius.md, overflow: 'hidden', backgroundColor: t.colors.muted }, style]}>
      {offline ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.spacing.xs, paddingHorizontal: t.spacing.sm }}>
          <ImageBroken size={24} color={t.colors.mutedForeground} />
          {offlineText ? (
            <AppText variant="footnote" color="mutedForeground" align="center">
              {offlineText}
            </AppText>
          ) : null}
        </View>
      ) : (
        <Image
          source={photo.source}
          contentFit="cover"
          style={{ flex: 1 }}
          accessible
          accessibilityLabel={photo.description}
          transition={t.motion.base}
        />
      )}
    </View>
  );
}
