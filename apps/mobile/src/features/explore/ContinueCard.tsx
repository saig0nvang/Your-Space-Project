/**
 * Khối "Tiếp tục" ở K1 (E1-US2): không gian lưu gần nhất, mở lại bằng một chạm.
 * Không gian hỏng (ảnh phòng không còn) → báo không mở được và cho xóa khỏi danh sách (E1-US2 CC2).
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ImageBroken, Trash } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, SectionHeader, StatusTag, showToast } from '@/components/ui';
import { openEditor } from '@/flows';
import { confirmAction } from '@/lib/confirm';
import { formatItemCount, formatSavedAt } from '@/lib/format';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { Space } from '@/types';

import { resolveSpacePhoto } from './catalogView';

/** Ảnh thu nhỏ khổ dọc 3:4 như ảnh phòng. */
const THUMB_W = 60;
const THUMB_H = 80;

export function ContinueSection({ space }: { space: Space }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <SectionHeader
        title="Tiếp tục"
        action={
          <Button
            variant="plain"
            label="Xem tất cả"
            accessibilityHint="Mở tab Phòng với mọi không gian đã lưu"
            onPress={() => router.navigate('/rooms')}
          />
        }
      />
      <ContinueCard space={space} />
    </View>
  );
}

function ContinueCard({ space }: { space: Space }) {
  const t = useTheme();
  const deleteSpace = useAppStore((s) => s.deleteSpace);
  /** Ảnh thật bị xóa khỏi máy chỉ lộ ra khi tải lỗi. */
  const [failedSpaceId, setFailedSpaceId] = useState<string | null>(null);

  const source = resolveSpacePhoto(space.photoUri);
  const broken = !source || failedSpaceId === space.id;
  const name = space.name.trim() || 'Không gian chưa đặt tên';
  const meta = `${formatItemCount(space.items.length)} · ${formatSavedAt(space.savedAt ?? space.updatedAt)}`;

  async function confirmDelete() {
    const choice = await confirmAction({
      title: `Xóa "${name}" khỏi danh sách?`,
      message: 'Không gian này không mở được nữa. Xóa sẽ bỏ nó khỏi Phòng của tôi trên máy này.',
      options: [
        { label: 'Xóa khỏi danh sách', style: 'destructive' },
        { label: 'Hủy', style: 'cancel' },
      ],
    });
    if (choice === 0) {
      deleteSpace(space.id);
      showToast('Đã xóa không gian khỏi danh sách');
    }
  }

  if (broken) {
    return (
      <Card padding="md" style={{ gap: t.spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: THUMB_W,
              height: THUMB_H,
              borderRadius: t.radius.sm,
              backgroundColor: t.colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageBroken size={24} color={t.colors.mutedForeground} />
          </View>
          <View style={{ flex: 1, gap: t.spacing.xs }}>
            <AppText variant="headline" numberOfLines={2}>
              {name}
            </AppText>
            <StatusTag tone="danger" label="Không mở được không gian này" />
            <AppText variant="footnote" color="mutedForeground">
              Ảnh phòng của không gian này bị thiếu hoặc đã bị xóa khỏi máy.
            </AppText>
          </View>
        </View>
        <View style={{ alignItems: 'flex-start', marginLeft: -t.spacing.sm }}>
          <Button variant="destructivePlain" icon={Trash} label="Xóa khỏi danh sách" onPress={confirmDelete} />
        </View>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <Image
          source={source}
          contentFit="cover"
          accessible={false}
          accessibilityIgnoresInvertColors
          onError={() => setFailedSpaceId(space.id)}
          style={{ width: THUMB_W, height: THUMB_H, borderRadius: t.radius.sm, backgroundColor: t.colors.muted }}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="headline" numberOfLines={2}>
            {name}
          </AppText>
          <AppText variant="footnote" color="mutedForeground">
            {meta}
          </AppText>
        </View>
        <Button
          variant="plain"
          label="Mở"
          accessibilityHint={`Mở ${name} trong trình chỉnh sửa`}
          onPress={() => openEditor(space.id)}
          style={{ minWidth: t.touchTarget }}
        />
      </View>
    </Card>
  );
}
