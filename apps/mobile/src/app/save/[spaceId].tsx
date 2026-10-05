/** E2 — Lưu & chia sẻ (formSheet trên trình chỉnh sửa). Logic ở src/features/editor. */
import { useLocalSearchParams } from 'expo-router';

import { SaveSheet } from '@/features/editor/SaveSheet';

export default function SaveRoute() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const id = typeof spaceId === 'string' ? spaceId : '';
  return <SaveSheet key={id} spaceId={id} />;
}
