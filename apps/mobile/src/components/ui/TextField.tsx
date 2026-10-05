import { WarningCircle } from 'phosphor-react-native';
import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  helper?: string;
  error?: string | null;
  optional?: boolean;
};

/**
 * Ô nhập theo MASTER.md · Inputs: nhãn luôn hiện phía trên (không dùng placeholder làm nhãn),
 * viền borderStrong, focus viền 2 màu ring, lỗi có icon + chữ ngay dưới ô.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helper, error, optional, onFocus, onBlur, multiline, ...rest },
  ref,
) {
  const t = useTheme();
  const c = t.colors;
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={{ gap: t.spacing.xs + 2 }}>
      <AppText variant="subheadline" weight="600" nativeID={`${label}-label`}>
        {label}
        {optional ? <AppText variant="subheadline" color="mutedForeground"> (không bắt buộc)</AppText> : null}
      </AppText>
      <TextInput
        ref={ref}
        {...rest}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error ?? helper}
        placeholderTextColor={c.mutedForeground}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          t.typography.body,
          {
            minHeight: multiline ? 96 : t.touchTarget,
            paddingHorizontal: t.spacing.md - (focused || hasError ? 1 : 0),
            paddingVertical: multiline ? t.spacing.sm + 4 : 0,
            borderRadius: t.radius.sm,
            borderWidth: focused || hasError ? 2 : 1,
            borderColor: hasError ? c.destructiveText : focused ? c.ring : c.borderStrong,
            backgroundColor: c.card,
            color: c.cardForeground,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
      {hasError ? (
        <View style={{ flexDirection: 'row', gap: t.spacing.xs + 2, alignItems: 'flex-start' }} accessibilityLiveRegion="polite">
          <WarningCircle size={16} color={c.destructiveText} weight="bold" style={{ marginTop: 1 }} />
          <AppText variant="footnote" color="destructiveText" style={{ flex: 1 }}>
            {error}
          </AppText>
        </View>
      ) : helper ? (
        <AppText variant="footnote" color="mutedForeground">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
});
