/** Thanh trên của luồng chụp: nút quay lại (tuỳ màn) và nút Đóng ở mọi bước (docs/screens.md §2). */
import { CaretLeft, X } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText, IconButton } from '@/components/ui';
import { useExitModal } from '@/flows';
import { useTheme } from '@/theme';

export function CaptureHeader({
  title,
  onBack,
  left,
}: {
  title?: string;
  onBack?: () => void;
  /** Nội dung riêng ở bên trái khi màn không có nút quay lại. */
  left?: ReactNode;
}) {
  const t = useTheme();
  const exit = useExitModal();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.sm,
        minHeight: t.touchTarget + t.spacing.sm,
        paddingHorizontal: t.spacing.md,
        paddingVertical: t.spacing.xs,
      }}
    >
      <View style={{ minWidth: t.touchTarget, alignItems: 'flex-start' }}>
        {onBack ? <IconButton icon={CaretLeft} accessibilityLabel="Quay lại" onPress={onBack} variant="tinted" /> : left}
      </View>
      <View style={{ flex: 1 }}>
        {title ? (
          <AppText variant="headline" align="center" accessibilityRole="header" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={{ minWidth: t.touchTarget, alignItems: 'flex-end' }}>
        <IconButton icon={X} accessibilityLabel="Đóng" onPress={() => exit()} variant="tinted" />
      </View>
    </View>
  );
}
