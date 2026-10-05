/**
 * Lịch sử hoàn tác / làm lại của trình chỉnh sửa (E4-US7). Giữ cục bộ trong màn, mỗi bước là ảnh chụp
 * món + vùng đã xóa + đường sàn. Thay đổi ghi thẳng vào store (updateSpace) để app bị đóng không mất dữ liệu.
 * Hoàn tác chỉ đặt lại trạng thái đã giữ trên máy, không gọi AI (AC3).
 */
import { useCallback, useState } from 'react';

import { useAppStore } from '@/store/appStore';
import type { Space } from '@/types';

import { HISTORY_LIMIT, patchFromSnapshot, restoreSnapshot, sameSnapshot, snapshotOf, type Snapshot } from './model';

function readSpace(id: string): Space | undefined {
  return useAppStore.getState().spaces.find((s) => s.id === id);
}

export function useEditorHistory(spaceId: string) {
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);

  /**
   * Ghi một thao tác: `recipe` nhận không gian hiện tại, trả về trạng thái mới (hoặc null nếu không đổi).
   * Trả về true khi thật sự có thay đổi.
   */
  const commit = useCallback(
    (recipe: (current: Space) => Snapshot | null): boolean => {
      const sp = readSpace(spaceId);
      if (!sp) return false;
      const before = snapshotOf(sp);
      const after = recipe(sp);
      if (!after || sameSnapshot(before, after)) return false;
      setPast((p) => [...p, before].slice(-HISTORY_LIMIT));
      setFuture([]);
      useAppStore.getState().updateSpace(spaceId, patchFromSnapshot(sp, after));
      return true;
    },
    [spaceId],
  );

  const undo = useCallback(() => {
    const sp = readSpace(spaceId);
    const prev = past[past.length - 1];
    if (!sp || !prev) return;
    setPast(past.slice(0, -1));
    setFuture((f) => [snapshotOf(sp), ...f].slice(0, HISTORY_LIMIT));
    useAppStore.getState().updateSpace(spaceId, restoreSnapshot(sp, prev));
  }, [past, spaceId]);

  const redo = useCallback(() => {
    const sp = readSpace(spaceId);
    const next = future[0];
    if (!sp || !next) return;
    setFuture(future.slice(1));
    setPast((p) => [...p, snapshotOf(sp)].slice(-HISTORY_LIMIT));
    useAppStore.getState().updateSpace(spaceId, restoreSnapshot(sp, next));
  }, [future, spaceId]);

  return { commit, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}
