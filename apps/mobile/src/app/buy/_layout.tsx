/** Sheet Mua: M1 → [TT1 → TT2] → TT3 Thanh toán → TT7 trong một modal có stack riêng. */
import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function BuyLayout() {
  const t = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.card } }} />;
}
