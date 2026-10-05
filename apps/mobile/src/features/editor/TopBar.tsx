/**
 * Thanh trên của E1, nổi trên ảnh: Quay lại · Hoàn tác / Làm lại · Lưu · menu "…".
 * Hoàn tác / Làm lại luôn có nhãn chữ, nên khi hết lịch sử nút mờ đi mà vẫn đọc được (E4-US7 CC1).
 */
import { ArrowUUpLeft, ArrowUUpRight, CaretLeft, DotsThree, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { Platform, Pressable, View } from 'react-native';

import { AppText, Button, IconButton } from '@/components/ui';
import { useTheme } from '@/theme';
import { disabledOpacity, pressedOpacity } from '@/theme/tokens';

function HistoryButton({
  icon: Icon,
  label,
  disabledLabel,
  disabled,
  onPress,
}: {
  icon: PhosphorIcon;
  label: string;
  disabledLabel: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={disabled ? disabledLabel : undefined}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        minWidth: t.touchTarget + t.spacing.sm,
        minHeight: t.touchTarget,
        paddingHorizontal: t.spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        opacity: disabled ? disabledOpacity : pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
      })}
    >
      <Icon size={18} color={t.colors.foreground} weight="regular" />
      <AppText variant="caption2" weight="600" numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function TopBar({
  onBack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onMore,
  floating = true,
}: {
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onMore: () => void;
  /** true: nổi trên ảnh (nền card + bóng). false: nằm trong luồng nội dung (xem 2D). */
  floating?: boolean;
}) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
      <IconButton icon={CaretLeft} variant={floating ? 'floating' : 'tinted'} accessibilityLabel="Quay lại" onPress={onBack} />
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: t.radius.pill,
            backgroundColor: floating ? c.card : c.muted,
            paddingHorizontal: t.spacing.xs,
          },
          floating ? t.shadow('md') : null,
        ]}
      >
        <HistoryButton
          icon={ArrowUUpLeft}
          label="Hoàn tác"
          disabledLabel="Chưa có thao tác nào để hoàn tác"
          disabled={!canUndo}
          onPress={onUndo}
        />
        <HistoryButton
          icon={ArrowUUpRight}
          label="Làm lại"
          disabledLabel="Chưa có thao tác nào để làm lại"
          disabled={!canRedo}
          onPress={onRedo}
        />
      </View>
      <View pointerEvents="none" style={{ flex: 1 }} />
      <Button
        variant="secondary"
        label="Lưu"
        onPress={onSave}
        accessibilityHint="Mở bảng lưu và chia sẻ không gian"
        style={{
          backgroundColor: floating ? c.card : 'transparent',
          paddingHorizontal: t.spacing.md,
          ...(floating ? t.shadow('md') : null),
        }}
      />
      <IconButton
        icon={DotsThree}
        variant={floating ? 'floating' : 'tinted'}
        accessibilityLabel="Tùy chọn khác"
        onPress={onMore}
      />
    </View>
  );
}
