/** K2 — Chi tiết phong cách. */
import { useLocalSearchParams } from 'expo-router';

import { StyleDetail } from '@/features/explore/StyleDetail';

export default function Screen() {
  const { styleId } = useLocalSearchParams<{ styleId: string }>();
  return <StyleDetail styleId={styleId} />;
}
