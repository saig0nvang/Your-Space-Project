/** K4 — Chi tiết món dạng sheet trên trình chỉnh sửa (mở từ khay E1 qua openProductSheet). */
import { useLocalSearchParams } from 'expo-router';

import { ProductDetail } from '@/features/explore/ProductDetail';

export default function Screen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  return <ProductDetail productId={productId} mode="sheet" />;
}
