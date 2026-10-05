import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Checkbox } from '@/components/ui';
import { useTheme } from '@/theme';

/**
 * Checkbox + nhãn bấm được. VoiceOver chỉ dừng ở Checkbox (nhãn đầy đủ);
 * người dùng nhìn thấy chạm vào chữ cũng đổi được trạng thái.
 */
export function CheckRow({
  label,
  checked,
  onChange,
  disabled = false,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: t.touchTarget }}>
      <Checkbox checked={checked} onChange={onChange} accessibilityLabel={label} disabled={disabled} />
      <Pressable
        onPress={disabled ? undefined : () => onChange(!checked)}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{ flex: 1, minHeight: t.touchTarget, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}
      >
        {children}
        <AppText variant="body" style={{ flex: 1 }}>
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}
