/**
 * Công cụ Xóa đồ cũ (E05), theo kiểu IKEA Kreativ (founder yêu cầu 2026-10-03): vào công cụ là AI nhận diện các món
 * đồ có sẵn trong ảnh và vẽ viền từng món; chạm vào món nào là xóa món đó (inpainting), không có bước chọn rồi bấm Xóa.
 * Xóa hoàn tác được nên không hỏi lại; mỗi món xóa xong là một bước hoàn tác. "Xóa hết" (Hide All của IKEA) xóa mọi món
 * còn viền trong một lượt. Lỗi thì ảnh không đổi và cho thử lại.
 * Không còn món nào AI nhận ra: chạm vào món đồ cũ thì chọn theo điểm chạm (segmentation) rồi xóa luôn.
 * Gọi AI giả lập ở services/ai.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { localId } from '@/lib/id';
import type { SampleObject } from '@/data/samplePhotos';
import { detectObjects, inpaint, segmentAt, type AIFailure } from '@/services/ai';
import type { ErasedRegion, Space } from '@/types';

import { snapshotOf, type Snapshot } from './model';

export type EraseBlock = { kind: 'consent' | 'offline' | 'paused'; text: string };
/** `retry`: các món xóa lỗi, để "Thử lại" xóa lại đúng các món đó. */
export type EraseError = { title: string; body: string; retry?: ErasedRegion[] };
export type PendingPoint = { id: string; x: number; y: number };
/** Kết quả một lần chạm: đang xóa, chạm trượt khỏi mọi món có viền, hoặc công cụ chưa sẵn sàng. */
export type EraseTap = 'erasing' | 'missed' | 'busy';

const NO_OBJECTS: SampleObject[] = [];

function errorFor(error: AIFailure, phase: 'select' | 'erase'): { title: string; body: string; canRetry: boolean } {
  const title = phase === 'erase' ? 'Chưa xóa được' : 'Chưa nhận ra món này';
  const keep = phase === 'erase' ? 'Ảnh vẫn như cũ.' : 'Không có gì bị xóa.';
  switch (error.kind) {
    case 'Offline':
      return { title: 'Mất kết nối mạng', body: `${keep} Có mạng lại thì bạn thử lại.`, canRetry: phase === 'erase' };
    case 'RateLimited':
    case 'BudgetExceeded':
      return { title: 'AI đang tạm ngưng', body: `${keep} Thêm đồ vẫn dùng bình thường.`, canRetry: false };
    case 'Timeout':
      return { title, body: `Dịch vụ xóa đồ phản hồi quá lâu. ${keep}`, canRetry: phase === 'erase' };
    default:
      return {
        title,
        body: phase === 'erase' ? `${keep} Bạn thử lại sau ít phút.` : `${keep} Bạn chạm lại vào món đồ cũ.`,
        canRetry: phase === 'erase',
      };
  }
}

function sameRect(a: ErasedRegion, b: ErasedRegion): boolean {
  const eq = (u: number, v: number) => Math.abs(u - v) < 1e-6;
  return eq(a.x, b.x) && eq(a.y, b.y) && eq(a.w, b.w) && eq(a.h, b.h);
}

export function useEraseTool({
  active,
  photoKey,
  objects,
  erasedRegions,
  block,
  commit,
  onErased,
}: {
  /** Đang ở công cụ Xóa: lần đầu vào thì nhận diện đồ trong ảnh. */
  active: boolean;
  /** Tham chiếu ảnh phòng: nhận diện một lần mỗi ảnh. */
  photoKey: string;
  /** Vật thể đo sẵn của ảnh mẫu (bản thử), thay cho kết quả nhận diện thật. */
  objects?: SampleObject[];
  /** Vùng đã xóa của không gian: món đã xóa thì không vẽ viền nữa, hoàn tác thì viền hiện lại. */
  erasedRegions: ErasedRegion[];
  /** Lý do công cụ đang tắt (chưa gửi ảnh, mất mạng, AI tạm ngưng); null = dùng được. */
  block: EraseBlock | null;
  commit: (recipe: (current: Space) => Snapshot | null) => boolean;
  /** Một lượt xóa xong (một món, hoặc nhiều món khi "Xóa hết"). */
  onErased: (regions: ErasedRegion[]) => void;
}) {
  const [detected, setDetected] = useState<{ key: string; regions: ErasedRegion[] } | null>(null);
  const [pending, setPending] = useState<PendingPoint[]>([]);
  const [erasing, setErasing] = useState<ErasedRegion[]>([]);
  const [error, setError] = useState<EraseError | null>(null);
  const [comparing, setComparing] = useState(false);
  const segCtrls = useRef(new Set<AbortController>());
  const eraseCtrls = useRef(new Set<AbortController>());

  useEffect(() => {
    const seg = segCtrls.current;
    const erase = eraseCtrls.current;
    return () => {
      seg.forEach((c) => c.abort());
      erase.forEach((c) => c.abort());
    };
  }, []);

  const blocked = block !== null;
  const sampleObjects = objects ?? NO_OBJECTS;
  const hasDetection = detected?.key === photoKey;

  // Nhận diện khi vào công cụ, một lần mỗi ảnh. Đang bị chặn (chưa gửi ảnh, mất mạng, AI ngưng) thì đợi dùng được.
  useEffect(() => {
    if (!active || blocked || hasDetection) return;
    const ctrl = new AbortController();
    detectObjects(photoKey, sampleObjects, ctrl.signal)
      .then((res) => setDetected({ key: photoKey, regions: res.ok ? res.value : [] }))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [active, blocked, hasDetection, photoKey, sampleObjects]);

  const detecting = active && !blocked && !hasDetection;
  /** Món AI nhận ra còn trong ảnh: chưa xóa, không đang xóa. */
  const objectsLeft = hasDetection
    ? detected.regions.filter((o) => !erasing.some((r) => sameRect(r, o)) && !erasedRegions.some((r) => sameRect(r, o)))
    : [];

  /** Xóa các món trong một lượt inpainting. Không khóa thao tác khác; chạm món khác trong lúc chờ thì xóa song song. */
  const eraseRegions = (input: ErasedRegion[]) => {
    const regions = input.filter((region) => !erasing.some((r) => sameRect(r, region)));
    if (blocked || regions.length === 0) return;
    const ctrl = new AbortController();
    eraseCtrls.current.add(ctrl);
    setErasing((list) => [...list, ...regions]);
    setError(null);
    setComparing(false);
    inpaint(regions, ctrl.signal)
      .then((res) => {
        setErasing((list) => list.filter((r) => !regions.includes(r)));
        if (res.ok) {
          const done = regions.map((r) => ({ ...r, id: localId('mask') }));
          commit((sp) => ({ ...snapshotOf(sp), erasedRegions: [...sp.erasedRegions, ...done] }));
          onErased(done);
        } else {
          const e = errorFor(res.error, 'erase');
          setError({ title: e.title, body: e.body, retry: e.canRetry ? regions : undefined });
        }
      })
      .catch(() => undefined)
      .finally(() => eraseCtrls.current.delete(ctrl));
  };

  /**
   * Chạm lên ảnh ở chế độ Xóa (toạ độ chuẩn hoá). Chạm trúng món có viền thì xóa món đó; món nhỏ được nới vùng chạm
   * tới `minSize` (chuẩn hoá, ~44 pt). `pointSelect`: khi không còn món nào có viền, cho chọn theo điểm chạm.
   */
  const tapAt = (p: { x: number; y: number }, opts: { minSize: { w: number; h: number }; pointSelect: boolean }): EraseTap => {
    if (blocked || detecting) return 'busy';
    const hit = objectsLeft
      .filter((o) => {
        const padX = Math.max(0.01, (opts.minSize.w - o.w) / 2);
        const padY = Math.max(0.01, (opts.minSize.h - o.h) / 2);
        return p.x >= o.x - padX && p.x <= o.x + o.w + padX && p.y >= o.y - padY && p.y <= o.y + o.h + padY;
      })
      .sort((a, b) => a.w * a.h - b.w * b.h)[0];
    if (hit) {
      eraseRegions([hit]);
      return 'erasing';
    }
    if (objectsLeft.length > 0 || !opts.pointSelect) return 'missed';

    const id = localId('seg');
    const ctrl = new AbortController();
    segCtrls.current.add(ctrl);
    setPending((ps) => [...ps, { id, x: p.x, y: p.y }]);
    setError(null);
    segmentAt(p, ctrl.signal)
      .then((res) => {
        setPending((ps) => ps.filter((x) => x.id !== id));
        if (res.ok) {
          eraseRegions([res.value]);
        } else {
          const e = errorFor(res.error, 'select');
          setError({ title: e.title, body: e.body });
        }
      })
      .catch(() => undefined)
      .finally(() => segCtrls.current.delete(ctrl));
    return 'erasing';
  };

  /** Rời công cụ Xóa: bỏ các lần chọn theo điểm đang chờ. Món đang xóa vẫn xóa tiếp. */
  const leave = useCallback(() => {
    segCtrls.current.forEach((c) => c.abort());
    segCtrls.current.clear();
    setPending([]);
    setError(null);
    setComparing(false);
  }, []);

  return {
    detecting,
    /** Số món AI nhận ra trong ảnh (kể cả món đã xóa). */
    detectedCount: hasDetection ? detected.regions.length : 0,
    objectsLeft,
    erasing,
    pending,
    error,
    comparing,
    setComparing,
    dismissError: () => setError(null),
    tapAt,
    eraseRegion: (region: ErasedRegion) => eraseRegions([region]),
    /** "Xóa hết": mọi món còn viền, một lượt. */
    eraseAll: () => eraseRegions(objectsLeft),
    retry: () => {
      if (error?.retry) eraseRegions(error.retry);
    },
    leave,
  };
}
