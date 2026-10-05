/** Luồng chụp C1–C7: modal toàn màn, header tự vẽ, nút Đóng ở mọi bước (docs/screens.md §2). */
import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function CaptureLayout() {
  const t = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.background } }} />;
}
