/** Kiểu header native dùng chung cho các stack trong tab (large title ở màn gốc dùng Bricolage Grotesque). */
import type { NativeStackNavigationOptions } from 'expo-router/native-stack';

import type { Theme } from '@/theme';
import { fontFamilies } from '@/theme/tokens';

export function stackScreenOptions(t: Theme): NativeStackNavigationOptions {
  return {
    // Một màu tint cho điều khiển (ios.md): màu chữ chính; vàng đồng chỉ dành cho giá.
    headerTintColor: t.colors.foreground,
    headerStyle: { backgroundColor: t.colors.background },
    headerShadowVisible: false,
    headerTitleStyle: { fontSize: t.typography.headline.fontSize, fontWeight: '600', color: t.colors.foreground },
    headerLargeTitleStyle: { fontFamily: fontFamilies.display, color: t.colors.foreground },
    headerLargeTitleShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: t.colors.background },
  };
}
