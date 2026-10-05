/**
 * E2 — Lưu & chia sẻ (docs/screens.md §5 E2; E6-US1, E6-US2). Sheet hệ thống trên trình chỉnh sửa.
 * Lưu trên máy, không cần đăng nhập; lưu được cả khi chưa có món. "Chia sẻ ảnh" là giả lập ở bản thử.
 */
import { router } from 'expo-router';
import { DeviceMobile, ShareNetwork, WarningCircle } from 'phosphor-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, EmptyState, Price, SheetHeader, StatusTag, TextField, showToast } from '@/components/ui';
import { formatSavedAt } from '@/lib/format';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { Space } from '@/types';

import { estimateOf } from './model';
import { SceneLayers } from './SceneLayers';

const THUMB_W = 112;

export function SaveSheet({ spaceId }: { spaceId: string }) {
  const space = useAppStore((s) => s.spaces.find((sp) => sp.id === spaceId));
  const close = () => router.back();
  if (!space) {
    return (
      <View style={{ flex: 1 }}>
        <SheetHeader title="Lưu không gian" onClose={close} />
        <EmptyState
          icon={WarningCircle}
          title="Không tìm thấy không gian này"
          body="Không gian có thể đã bị xóa khỏi máy này."
          actionLabel="Đóng"
          actionVariant="secondary"
          onAction={close}
        />
      </View>
    );
  }
  return <SaveForm space={space} onClose={close} />;
}

function SaveForm({ space, onClose }: { space: Space; onClose: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(space.name);
  const trimmed = name.trim();
  const nameError = trimmed.length === 0 ? 'Tên không được để trống. Bạn đặt một tên ngắn, ví dụ "Phòng khách".' : null;
  const estimate = estimateOf(space.items);
  const thumb = { width: THUMB_W, height: THUMB_W / (space.photoAspect || 3 / 4) };

  const onSave = () => {
    if (nameError) return;
    useAppStore.getState().markSpaceSaved(space.id, trimmed);
    showToast('Đã lưu vào Phòng của tôi');
    onClose();
  };

  return (
    <View style={{ flex: 1 }}>
      <SheetHeader title="Lưu không gian" onClose={onClose} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.sm,
          paddingBottom: insets.bottom + t.spacing.lg,
          gap: t.spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'center' }}>
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Ảnh thu nhỏ của ${space.name}, ${space.items.length} món đã đặt`}
            style={{ borderRadius: t.radius.sm, overflow: 'hidden', backgroundColor: t.colors.muted }}
          >
            <SceneLayers
              photoUri={space.photoUri}
              items={space.items}
              erasedRegions={space.erasedRegions}
              calibration={space.calibration}
              frame={thumb}
            />
          </View>
          <View style={{ flex: 1, gap: t.spacing.xs }}>
            <AppText variant="footnote" color="mutedForeground">
              Dự toán
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' }}>
              <Price amount={estimate.total} variant="headline" />
              <AppText variant="headline" tabular>{` · ${estimate.count} món`}</AppText>
            </View>
            {estimate.purchasedCount > 0 ? <StatusTag tone="done" label={`${estimate.purchasedCount} món đã mua`} /> : null}
            {space.savedAt !== null ? (
              <AppText variant="footnote" color="mutedForeground">
                Lần trước: {formatSavedAt(space.savedAt)}
              </AppText>
            ) : null}
          </View>
        </View>

        <TextField
          label="Tên không gian"
          value={name}
          onChangeText={setName}
          error={nameError}
          maxLength={60}
          autoCapitalize="sentences"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSave}
        />

        <View style={{ gap: t.spacing.sm + 4 }}>
          <Button
            variant="primary"
            label="Lưu vào Phòng của tôi"
            onPress={onSave}
            disabled={nameError !== null}
            fullWidth
          />
          <Button
            variant="secondary"
            label="Chia sẻ ảnh"
            icon={ShareNetwork}
            onPress={() => showToast('Bản thử: chưa xuất ảnh', 'info')}
            accessibilityHint="Bản thử chưa xuất ảnh"
            fullWidth
          />
        </View>

        <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' }}>
          <DeviceMobile size={18} color={t.colors.mutedForeground} />
          <AppText variant="footnote" color="mutedForeground" style={{ flex: 1 }}>
            Lưu trên máy này, không cần đăng nhập.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
