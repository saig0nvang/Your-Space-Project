/** Thẻ phong cách ở K1 (E1-US1 AC1, E1-US5 AC1): ảnh phong cách, tên, một câu mô tả, chấm mẫu chất liệu chữ ký. */
import { CaretRight } from 'phosphor-react-native';
import { Platform, Pressable, View } from 'react-native';

import { AppText } from '@/components/ui';
import { MaterialSwatch } from '@/components/ProductArt';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';
import type { Style } from '@/types';

import { StylePhotoTile } from './StylePhotoTile';

const ART_HEIGHT = 220;

export function StyleCard({
  style,
  loading,
  offline,
  onPress,
}: {
  style: Style;
  loading: boolean;
  offline: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  // Hướng A · Portfolio Grid: ảnh lớn đi trước, chữ bên dưới, không khung thẻ (MASTER.md · Cards).
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Phong cách ${style.name}. ${style.summary} Chất liệu: ${style.traits.materials}.`}
      accessibilityHint="Mở chi tiết phong cách"
      style={({ pressed }) => ({ gap: t.spacing.sm + 4, opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1 })}
    >
      <StylePhotoTile
        styleId={style.id}
        width="100%"
        height={ART_HEIGHT}
        loading={loading}
        offline={offline}
        offlineText="Chưa tải được ảnh"
        style={{ borderRadius: t.radius.md }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        <View style={{ flex: 1, gap: t.spacing.xs }}>
          <AppText variant="title1">{style.name}</AppText>
          <AppText variant="subheadline" color="mutedForeground">
            {style.summary}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t.spacing.md, rowGap: t.spacing.xs, marginTop: t.spacing.xs }}>
            {style.materialKeys.map((m) => (
              <MaterialSwatch key={m} material={m} />
            ))}
          </View>
        </View>
        <CaretRight size={20} color={t.colors.mutedForeground} />
      </View>
    </Pressable>
  );
}
