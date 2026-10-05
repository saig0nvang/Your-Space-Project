import { Stack } from 'expo-router';

import { useTheme } from '@/theme';
import { stackScreenOptions } from '@/theme/navigation';

export default function GroupLayout() {
  const t = useTheme();
  return <Stack screenOptions={stackScreenOptions(t)} />;
}
