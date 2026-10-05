/** Dấu chọn cho ô đang chọn: icon check trong vòng tròn `primary` (trạng thái không chỉ đổi màu viền). */
import { Check } from 'phosphor-react-native';
import { View } from 'react-native';

import { useTheme } from '@/theme';

export function SelectedBadge({ size = 28 }: { size?: number }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: t.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Check size={16} color={t.colors.onPrimary} weight="bold" />
    </View>
  );
}
