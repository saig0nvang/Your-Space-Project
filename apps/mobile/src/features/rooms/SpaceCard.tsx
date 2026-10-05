/**
 * Thẻ không gian ở Phòng của tôi (impeccable bolder 2026-10-03, hướng A): ảnh cảnh thật lớn đi trước, tên viết
 * Title 1 (Bricolage), không khung thẻ; số món, dự toán, thời điểm lưu, nhãn "Đã mua".
 * Ảnh không mở được → thẻ báo lỗi và cho xóa.
 */
import { DotsThree, ImageBroken, Trash } from 'phosphor-react-native';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { AppText, Button, Card, IconButton, StatusTag } from '@/components/ui';
import { formatSavedAt } from '@/lib/format';
import { useTheme } from '@/theme';
import { pressedOpacity } from '@/theme/tokens';
import type { Space } from '@/types';

import { SceneWindow } from '@/features/editor/SceneLayers';

import { isPhotoMissing, summarizeSpace, summaryLine } from './spaceSummary';

/** Ảnh thu nhỏ: khung ngang 4:3 cắt từ cảnh thật của không gian (món đúng tỉ lệ, vùng đã xóa vẫn hiện). */
function SpacePhoto({ space, width, onError }: { space: Space; width: number; onError: () => void }) {
  const t = useTheme();
  return (
    <View style={{ borderRadius: t.radius.md, overflow: 'hidden' }}>
      <SceneWindow
        photoUri={space.photoUri}
        photoAspect={space.photoAspect}
        items={space.items}
        erasedRegions={space.erasedRegions}
        calibration={space.calibration}
        width={width}
        height={Math.round(width * 0.75)}
        onPhotoError={onError}
      />
    </View>
  );
}

export function SpaceCard({
  space,
  width,
  now,
  onOpen,
  onMenu,
  onRename,
  onDelete,
}: {
  space: Space;
  width: number;
  now: number;
  onOpen: () => void;
  onMenu: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const t = useTheme();
  const [loadFailed, setLoadFailed] = useState(false);
  const broken = loadFailed || isPhotoMissing(space.photoUri);
  const summary = summarizeSpace(space);
  const line = summaryLine(summary);
  const saved = space.savedAt ? formatSavedAt(space.savedAt, now) : '';
  const savedLabel = saved ? saved.charAt(0).toUpperCase() + saved.slice(1) : '';

  if (broken) {
    return (
      <Card padding="none" style={{ width }}>
        <View
          style={{
            width,
            height: width / (space.photoAspect || 0.75),
            borderTopLeftRadius: t.radius.md,
            borderTopRightRadius: t.radius.md,
            backgroundColor: t.colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.spacing.sm,
            padding: t.spacing.md,
          }}
        >
          <ImageBroken size={32} color={t.colors.destructiveText} />
          <AppText variant="footnote" weight="600" color="destructiveText" align="center">
            Không mở được ảnh
          </AppText>
        </View>
        <View style={{ padding: t.spacing.md, gap: t.spacing.xs }}>
          <AppText variant="headline" numberOfLines={2}>
            {space.name}
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            Ảnh của không gian này không còn trên máy nên không mở lại được. Đơn hàng đã đặt không bị ảnh hưởng.
          </AppText>
          <View style={{ alignItems: 'flex-start', marginLeft: -t.spacing.sm }}>
            <Button
              variant="destructivePlain"
              icon={Trash}
              label="Xóa"
              onPress={onDelete}
              accessibilityHint={`Xóa không gian ${space.name}`}
            />
          </View>
        </View>
      </Card>
    );
  }

  const a11yLabel = [
    space.name,
    line,
    savedLabel,
    summary.purchasedCount > 0 ? `Đã mua ${summary.purchasedCount} món` : null,
    summary.unavailableNames.length > 0 ? `Ngừng bán: ${summary.unavailableNames.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View style={{ width }}>
      <Pressable
        onPress={onOpen}
        onLongPress={onMenu}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint="Mở trong trình chỉnh sửa"
        accessibilityActions={[
          { name: 'rename', label: 'Đổi tên' },
          { name: 'delete', label: 'Xóa' },
        ]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'rename') onRename();
          if (e.nativeEvent.actionName === 'delete') onDelete();
        }}
        android_ripple={{ color: t.colors.border, foreground: true }}
        style={({ pressed }) => ({ opacity: pressed && Platform.OS === 'ios' ? pressedOpacity : 1 })}
      >
        <SpacePhoto space={space} width={width} onError={() => setLoadFailed(true)} />
        <View style={{ paddingTop: t.spacing.sm + 4, gap: t.spacing.xs }}>
          <AppText variant="title1" numberOfLines={2}>
            {space.name}
          </AppText>
          <AppText variant="subheadline" tabular>
            {line}
          </AppText>
          {savedLabel ? (
            <AppText variant="footnote" color="mutedForeground">
              {savedLabel}
            </AppText>
          ) : null}
          {summary.purchasedCount > 0 || summary.unavailableNames.length > 0 ? (
            <View style={{ gap: t.spacing.xs, marginTop: t.spacing.xs }}>
              {summary.purchasedCount > 0 ? <StatusTag tone="done" label={`Đã mua ${summary.purchasedCount} món`} /> : null}
              {summary.unavailableNames.length > 0 ? (
                <StatusTag tone="attention" label={`${summary.unavailableNames.length} món ngừng bán`} />
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
      <View style={{ position: 'absolute', top: t.spacing.sm, right: t.spacing.sm }}>
        <IconButton icon={DotsThree} variant="floating" accessibilityLabel={`Tùy chọn cho ${space.name}`} onPress={onMenu} />
      </View>
    </View>
  );
}
