/** Checkbox, Chip lọc, SegmentedControl — theo MASTER.md (trạng thái không chỉ đổi màu). */
import { Check, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { Platform, Pressable, View } from 'react-native';

import { useTheme } from '@/theme';
import { disabledOpacity, pressedOpacity } from '@/theme/tokens';

import { AppText } from './AppText';

export function Checkbox({
  checked,
  onChange,
  accessibilityLabel,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={disabled ? undefined : () => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      aria-checked={checked}
      aria-disabled={disabled}
      style={{
        width: t.touchTarget,
        height: t.touchTarget,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? disabledOpacity : 1,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          borderWidth: checked ? 0 : 1.5,
          borderColor: c.borderStrong,
          backgroundColor: checked ? c.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Check size={16} color={c.onPrimary} weight="bold" /> : null}
      </View>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  disabled = false,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Icon nghĩa của chip (ví dụ loại đồ). Khi chọn, icon chuyển sang dạng Fill: trạng thái đổi cả hình lẫn màu. */
  icon?: PhosphorIcon;
}) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      aria-selected={selected}
      aria-disabled={disabled}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => ({
        minHeight: 36,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.xs,
        paddingHorizontal: t.spacing.md - 2,
        borderRadius: t.radius.pill,
        borderWidth: selected ? 0 : 1,
        borderColor: c.borderStrong,
        backgroundColor: selected ? c.foreground : 'transparent',
        opacity: disabled ? disabledOpacity : pressed && Platform.OS === 'ios' ? pressedOpacity : 1,
      })}
    >
      {Icon ? (
        <Icon size={16} color={selected ? c.background : c.foreground} weight={selected ? 'fill' : 'regular'} />
      ) : selected ? (
        <Check size={14} color={c.background} weight="bold" />
      ) : null}
      <AppText variant="subheadline" color={selected ? 'background' : 'foreground'} weight="600">
        {label}
      </AppText>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
}) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', backgroundColor: c.muted, borderRadius: t.radius.pill, padding: 3 }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            hitSlop={{ top: 6, bottom: 6 }}
            style={[
              {
                flex: 1,
                minHeight: 36,
                paddingHorizontal: t.spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.radius.pill,
                backgroundColor: selected ? c.card : 'transparent',
              },
              selected ? t.shadow('sm') : null,
            ]}
          >
            <AppText variant="footnote" weight="600" color={selected ? 'foreground' : 'mutedForeground'}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
