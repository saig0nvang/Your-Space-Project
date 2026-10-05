/**
 * Stack gốc (docs/screens.md §2): tab bar + trình chỉnh sửa (push toàn màn) + luồng chụp (modal toàn màn)
 * + sheet Mua (modal) + sheet Lưu & chia sẻ, chi tiết món (formSheet).
 */
// Nạp đúng hai độ đậm đang dùng (MASTER.md · Typography) để bản build không kèm 5 tệp font thừa.
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme as NavTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/ui';
import { useStoreHydrated } from '@/store/appStore';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold });
  const hydrated = useStoreHydrated();
  const t = useTheme();
  const ready = (fontsLoaded || Boolean(fontError)) && hydrated;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(t.colors.background);
  }, [t.colors.background]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  const navTheme = useMemo<NavTheme>(() => {
    const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        // Một màu tint cho điều khiển (ios.md): đen / trắng theo theme, vàng đồng chỉ cho chữ nhấn.
        primary: t.colors.foreground,
        background: t.colors.background,
        card: t.colors.background,
        text: t.colors.foreground,
        border: t.colors.border,
        notification: t.colors.foreground,
      },
    };
  }, [t]);

  if (!ready) return null;

  const sheet = {
    presentation: 'formSheet' as const,
    sheetGrabberVisible: true,
    sheetCornerRadius: t.radius.lg,
    contentStyle: { backgroundColor: t.colors.card },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="editor/[spaceId]" options={{ gestureEnabled: true }} />
            <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="buy" options={{ presentation: 'modal', contentStyle: { backgroundColor: t.colors.card } }} />
            <Stack.Screen name="save/[spaceId]" options={{ ...sheet, sheetAllowedDetents: [0.6, 1] }} />
            <Stack.Screen name="product-sheet/[productId]" options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }} />
          </Stack>
          <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
          <ToastHost />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
