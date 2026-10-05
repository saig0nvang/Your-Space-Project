/** K4 — Chi tiết món (push trong tab Khám phá, từ K2 / K3). */
import { useLocalSearchParams } from 'expo-router';

import { ProductDetail } from '@/features/explore/ProductDetail';

export default function Screen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  return <ProductDetail productId={productId} mode="tab" />;
}
