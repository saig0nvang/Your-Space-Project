/** K3 — Món theo phong cách. */
import { useLocalSearchParams } from 'expo-router';

import { StyleProducts } from '@/features/explore/StyleProducts';

export default function Screen() {
  const { styleId } = useLocalSearchParams<{ styleId: string }>();
  return <StyleProducts styleId={styleId} />;
}
