/**
 * Bộ chọn ảnh GIẢ LẬP thay cho bộ chọn ảnh hệ thống (bản thử không đọc thư viện ảnh thật).
 * Liệt kê SAMPLE_PHOTOS, ghi rõ "Ảnh mẫu trong bản thử". Dùng cho: thư viện ở C1/C2/C3, và đổi ảnh khung ngắm ở C2.
 */
import { Images, Info } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, EmptyState, SheetHeader } from '@/components/ui';
import { SAMPLE_PHOTOS, samplePhotoRef, type SamplePhoto } from '@/data/samplePhotos';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';

import { RoomPhoto } from './RoomPhoto';
import { SelectedBadge } from './SelectedBadge';

export function SamplePhotoPicker({
  visible,
  title,
  note = 'Ảnh mẫu trong bản thử. Bản thật mở thư viện ảnh của máy.',
  selectedId,
  onSelect,
  onClose,
  emptyActionLabel,
  onEmptyAction,
  footer,
}: {
  visible: boolean;
  title: string;
  note?: string;
  selectedId?: string | null;
  onSelect: (photo: SamplePhoto) => void;
  onClose: () => void;
  /** Thư viện trống (C2 · Empty): gợi ý chụp ảnh mới. */
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  footer?: ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const gap = t.spacing.sm + 4;
  const tileW = (window.width - t.spacing.md * 2 - gap) / 2;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      allowSwipeDismissal
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: t.colors.card }}>
        <SheetHeader title={title} onClose={onClose} />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: t.spacing.md,
            paddingTop: t.spacing.sm,
            paddingBottom: insets.bottom + t.spacing.lg,
            gap: t.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'flex-start' }}>
            <Info size={18} color={t.colors.mutedForeground} />
            <AppText variant="footnote" color="mutedForeground" style={{ flex: 1 }}>
              {note}
            </AppText>
          </View>

          {SAMPLE_PHOTOS.length === 0 ? (
            <EmptyState
              icon={Images}
              title="Thư viện chưa có ảnh"
              body="Bạn chụp một ảnh căn phòng mới nhé, nhớ để thấy rõ sàn nhà."
              actionLabel={emptyActionLabel}
              onAction={onEmptyAction}
              actionVariant="secondary"
            />
          ) : (
            <View
              accessibilityRole={selectedId !== undefined ? 'radiogroup' : 'list'}
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}
            >
              {SAMPLE_PHOTOS.map((photo) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  width={tileW}
                  selectable={selectedId !== undefined}
                  selected={photo.id === selectedId}
                  onPress={() => onSelect(photo)}
                />
              ))}
            </View>
          )}

          {footer}
        </ScrollView>
      </View>
    </Modal>
  );
}

function PhotoTile({
  photo,
  width,
  selectable,
  selected,
  onPress,
}: {
  photo: SamplePhoto;
  width: number;
  selectable: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={selectable ? 'radio' : 'button'}
      accessibilityLabel={selectable ? photo.label : `Chọn ${photo.label}`}
      accessibilityState={selectable ? { checked: selected } : undefined}
      android_ripple={{ color: c.border, foreground: true }}
      style={({ pressed }) => ({
        width,
        gap: t.spacing.xs + 2,
        opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
      })}
    >
      <View
        style={{
          width,
          height: width / photo.aspect,
          borderRadius: t.radius.md,
          overflow: 'hidden',
          backgroundColor: c.muted,
          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          borderColor: selected ? c.ring : c.border,
        }}
      >
        <RoomPhoto uri={samplePhotoRef(photo.id)} accessibilityLabel={photo.label} />
        {selected ? (
          <View style={{ position: 'absolute', top: t.spacing.sm, right: t.spacing.sm }}>
            <SelectedBadge />
          </View>
        ) : null}
      </View>
      <AppText variant="subheadline" weight={selected ? '600' : '400'} numberOfLines={2}>
        {photo.label}
      </AppText>
    </Pressable>
  );
}
