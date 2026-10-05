/** P1 — Phòng của tôi (E6-US3): mở lại đúng không gian đã lưu. */
import { Stack, useFocusEffect } from 'expo-router';
import { House, Plus } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { AppText, EmptyState, IconButton, OfflineBanner, ScreenScroll, showToast } from '@/components/ui';
import { retryConnection } from '@/features/orders/offline';
import { openEditor, startCapture } from '@/flows';
import { confirmAction } from '@/lib/confirm';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/theme';
import type { Space } from '@/types';

import { RenameSpaceSheet } from './RenameSpaceSheet';
import { SpaceCard } from './SpaceCard';

/** Từ bề rộng này (iPad) và cỡ chữ không quá lớn thì danh sách chia hai cột; điện thoại luôn một cột. */
const TWO_COLUMN_MIN_WIDTH = 700;
const TWO_COLUMN_MAX_FONT_SCALE = 1.35;

export function RoomsScreen() {
  const t = useTheme();
  const spaces = useAppStore((s) => s.spaces);
  const deleteSpace = useAppStore((s) => s.deleteSpace);
  const { width, fontScale } = useWindowDimensions();
  const [now, setNow] = useState(() => Date.now());
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);

  // Cập nhật "lưu lúc …" mỗi lần quay lại tab.
  useFocusEffect(useCallback(() => setNow(Date.now()), []));

  const saved = spaces
    .filter((sp) => sp.savedAt !== null)
    .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
  const renameTarget = spaces.find((sp) => sp.id === renameId) ?? null;

  // Bolder (2026-10-03): một cột, ảnh lớn đi trước như Portfolio Grid của MASTER; hai cột chỉ trên màn rộng (iPad).
  const columns = width >= TWO_COLUMN_MIN_WIDTH && fontScale < TWO_COLUMN_MAX_FONT_SCALE ? 2 : 1;
  const gap = t.spacing.xl;
  const cardWidth = Math.floor((width - t.spacing.md * 2 - gap * (columns - 1)) / columns);

  const openRename = (space: Space) => {
    setRenameId(space.id);
    setRenameOpen(true);
  };

  const confirmDelete = async (space: Space) => {
    const choice = await confirmAction({
      title: `Xóa "${space.name}"?`,
      message: 'Ảnh phòng và cách bày của không gian này bị xóa khỏi máy. Đơn hàng đã đặt không bị ảnh hưởng.',
      options: [
        { label: 'Xóa không gian', style: 'destructive' },
        { label: 'Hủy', style: 'cancel' },
      ],
    });
    if (choice !== 0) return;
    deleteSpace(space.id);
    showToast('Đã xóa không gian');
  };

  const openMenu = async (space: Space) => {
    const choice = await confirmAction({
      title: space.name,
      options: [{ label: 'Đổi tên' }, { label: 'Xóa', style: 'destructive' }, { label: 'Hủy', style: 'cancel' }],
    });
    if (choice === 0) openRename(space);
    if (choice === 1) await confirmDelete(space);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Phòng của tôi',
          headerLargeTitleEnabled: true,
          headerRight: () => (
            <IconButton icon={Plus} accessibilityLabel="Chụp ảnh phòng mới" onPress={() => startCapture()} />
          ),
        }}
      />
      <ScreenScroll>
        <OfflineBanner onRetry={retryConnection} />
        {saved.length === 0 ? (
          <EmptyState
            icon={House}
            title="Chưa có phòng nào"
            body="Phòng của tôi giữ các không gian bạn đã lưu, để mở lại và mua tiếp."
            actionLabel="Chụp ảnh phòng"
            onAction={() => startCapture()}
          />
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, alignItems: 'flex-start' }}>
              {saved.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  width={cardWidth}
                  now={now}
                  onOpen={() => openEditor(space.id)}
                  onMenu={() => openMenu(space)}
                  onRename={() => openRename(space)}
                  onDelete={() => confirmDelete(space)}
                />
              ))}
            </View>
            <AppText variant="footnote" color="mutedForeground">
              Dự toán tính theo giá hiện tại của các món chưa mua. Giữ một thẻ để đổi tên hoặc xóa.
            </AppText>
          </>
        )}
      </ScreenScroll>
      <RenameSpaceSheet space={renameTarget} visible={renameOpen} onClose={() => setRenameOpen(false)} />
    </>
  );
}
