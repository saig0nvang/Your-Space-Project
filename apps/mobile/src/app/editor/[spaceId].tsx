/** E1 — Trình chỉnh sửa (push toàn màn trên stack gốc, ẩn tab bar). Logic ở src/features/editor. */
import { useLocalSearchParams } from 'expo-router';

import { EditorScreen } from '@/features/editor/EditorScreen';

export default function EditorRoute() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const id = typeof spaceId === 'string' ? spaceId : '';
  return <EditorScreen key={id} spaceId={id} />;
}
