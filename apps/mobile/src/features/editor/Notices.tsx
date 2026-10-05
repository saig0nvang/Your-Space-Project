/**
 * Các thông báo nổi trên ảnh của E1, xếp dọc dưới thanh trên: mất mạng (G1), chế độ tự đặt (G2), gợi ý bước tiếp
 * theo (đặt món, đổi món, xóa đồ cũ), chip AI sau khi đặt / sau khi xóa, lỗi xóa đồ cũ. Luôn icon + chữ; xuất hiện
 * bằng mờ dần.
 */
import { Info, PauseCircle, type Icon as PhosphorIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AIChip, AppText, Button } from '@/components/ui';
import { useTheme } from '@/theme';

export type Notice = {
  id: number;
  /** "ai": chip AI (AIChip). "info": chip thông tin thường. */
  kind: 'ai' | 'info';
  text: string;
  /** Dòng phụ hiện thành chip riêng bên dưới (ví dụ: món được dời xuống sàn). */
  note?: string;
  /** Có nút "Hoàn tác" ngay trên chip (gọi hoàn tác của màn tại thời điểm bấm). */
  undoable?: boolean;
};

/** Chip thông tin nổi trên ảnh, cùng dáng với AIChip nhưng không gắn với AI. */
export function InfoChip({
  text,
  icon: Icon = Info,
  busy,
  actionLabel,
  onAction,
  a11yAction,
}: {
  text: string;
  icon?: PhosphorIcon;
  busy?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  /** VoiceOver: chạm hai lần vào chữ để làm thay một thao tác trên ảnh (ví dụ đặt món vào giữa sàn). */
  a11yAction?: { label: string; onActivate: () => void };
}) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.sm,
          alignSelf: 'center',
          maxWidth: '92%',
          paddingLeft: t.spacing.md - 2,
          paddingRight: actionLabel ? t.spacing.xs : t.spacing.md,
          minHeight: 40,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.card,
        },
        t.shadow('md'),
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={t.colors.foreground} /> : <Icon size={18} color={t.colors.primaryText} />}
      <View
        style={{ flexShrink: 1 }}
        accessible={a11yAction !== undefined}
        accessibilityRole={a11yAction ? 'button' : undefined}
        accessibilityLabel={a11yAction ? `${text}. ${a11yAction.label}` : undefined}
        onAccessibilityTap={a11yAction?.onActivate}
      >
        <AppText variant="footnote" weight="600">
          {text}
        </AppText>
      </View>
      {actionLabel && onAction ? <Button variant="plain" label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

export function NoticeStack({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View pointerEvents="box-none" style={{ gap: t.spacing.sm, paddingHorizontal: t.spacing.md }}>
      {children}
    </View>
  );
}

/** Bọc một thông báo để nó hiện / ẩn bằng mờ dần (MASTER.md · Key Effects). */
export function FadeSlot({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Animated.View pointerEvents="box-none" entering={FadeIn.duration(t.motion.base)} exiting={FadeOut.duration(t.motion.fast)}>
      {children}
    </Animated.View>
  );
}

export function TransientNotice({ notice, onUndo }: { notice: Notice; onUndo?: () => void }) {
  const actionLabel = onUndo ? 'Hoàn tác' : undefined;
  return notice.kind === 'ai' ? (
    <AIChip text={notice.text} actionLabel={actionLabel} onAction={onUndo} />
  ) : (
    <InfoChip text={notice.text} actionLabel={actionLabel} onAction={onUndo} />
  );
}

/** G2: AI tạm ngưng / chế độ tự đặt — nói ngắn, không đổ lỗi người dùng. */
export function ManualModeChip({ text }: { text: string }) {
  return <InfoChip icon={PauseCircle} text={text} />;
}
