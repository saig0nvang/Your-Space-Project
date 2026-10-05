/**
 * Ảnh đính kèm GIẢ LẬP cho báo sự cố và khiếu nại: "Thêm ảnh" lấy lần lượt ảnh phòng mẫu
 * (máy ảo không có camera). Bản thật: chụp hoặc chọn ảnh, thu nhỏ trên máy rồi gửi.
 */
import { Image, type ImageSource } from 'expo-image';
import { ImageSquare, X } from 'phosphor-react-native';
import { Platform, Pressable, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { photoSource, SAMPLE_PHOTOS, samplePhotoRef } from '@/data/samplePhotos';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';

const THUMB_W = 88;

export function PhotoThumb({ refId, width = THUMB_W, label }: { refId: string; width?: number; label?: string }) {
  const t = useTheme();
  return (
    <Image
      source={photoSource(refId) as ImageSource | number | undefined}
      contentFit="cover"
      accessible={Boolean(label)}
      accessibilityLabel={label}
      style={{ width, height: (width * 4) / 3, borderRadius: t.radius.sm, backgroundColor: t.colors.muted }}
    />
  );
}

export function PhotoAttachments({
  photos,
  onChange,
  disabled = false,
  max = SAMPLE_PHOTOS.length,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  max?: number;
}) {
  const t = useTheme();
  const next = SAMPLE_PHOTOS.map((p) => samplePhotoRef(p.id)).find((ref) => !photos.includes(ref));
  const full = photos.length >= max || !next;

  return (
    <View style={{ gap: t.spacing.sm }}>
      {photos.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm + 4 }}>
          {photos.map((ref, i) => (
            <View key={ref}>
              <PhotoThumb refId={ref} label={`Ảnh đính kèm ${i + 1}`} />
              <Pressable
                onPress={disabled ? undefined : () => onChange(photos.filter((p) => p !== ref))}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Gỡ ảnh ${i + 1}`}
                accessibilityState={{ disabled }}
                hitSlop={8}
                style={({ pressed }) => [
                  {
                    position: 'absolute',
                    top: t.spacing.xs,
                    right: t.spacing.xs,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: t.colors.card,
                    opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
                  },
                  t.shadow('md'),
                ]}
              >
                <X size={16} color={t.colors.foreground} weight="bold" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View style={{ alignItems: 'flex-start' }}>
        <Button
          variant="secondary"
          icon={ImageSquare}
          label="Thêm ảnh"
          disabled={disabled || full}
          onPress={() => (next ? onChange([...photos, next]) : undefined)}
        />
      </View>
      <AppText variant="footnote" color="mutedForeground">
        {`Bản thử: “Thêm ảnh” dùng ảnh phòng mẫu thay cho ảnh bạn chụp${full && photos.length > 0 ? ` · tối đa ${max} ảnh` : ''}.`}
      </AppText>
    </View>
  );
}
