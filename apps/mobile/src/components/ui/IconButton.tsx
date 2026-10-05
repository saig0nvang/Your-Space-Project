import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { Platform, Pressable, View } from 'react-native';

import { useTheme } from '@/theme';
import { disabledOpacity, pressedOpacity } from '@/theme/tokens';

import { AppText } from './AppText';

export type IconButtonProps = {
  icon: PhosphorIcon;
  /** Bắt buộc: tên đọc bởi VoiceOver/TalkBack. */
  accessibilityLabel: string;
  onPress?: () => void;
  /** "floating": nền card + bóng, dùng khi nổi trên ảnh phòng. */
  variant?: 'plain' | 'floating' | 'tinted';
  disabled?: boolean;
  selected?: boolean;
  badge?: number;
  /** Nhãn chữ nhỏ dưới icon, dùng khi icon đứng một mình chưa đủ rõ. */
  caption?: string;
  testID?: string;
};

/** Nút icon, vùng chạm ≥ 44 pt (iOS) / 48 dp (Android). */
export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  disabled = false,
  selected = false,
  badge,
  caption,
  testID,
}: IconButtonProps) {
  const t = useTheme();
  const c = t.colors;
  const size = t.touchTarget;
  const bg = variant === 'floating' ? c.card : variant === 'tinted' ? c.muted : 'transparent';

  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      aria-disabled={disabled}
      aria-selected={selected}
      hitSlop={4}
      style={({ pressed }) => ({
        alignItems: 'center',
        gap: 2,
        opacity: disabled ? disabledOpacity : pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
      })}
    >
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? c.foreground : bg,
          },
          variant === 'floating' ? t.shadow('md') : null,
        ]}
      >
        <Icon size={22} color={selected ? c.background : c.foreground} weight={selected ? 'fill' : 'regular'} />
        {badge ? (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              paddingHorizontal: 4,
              backgroundColor: c.foreground,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText variant="caption2" color="background" weight="600" tabular>
              {badge}
            </AppText>
          </View>
        ) : null}
      </View>
      {caption ? (
        <AppText variant="caption1" color="foreground">
          {caption}
        </AppText>
      ) : null}
    </Pressable>
  );
}
