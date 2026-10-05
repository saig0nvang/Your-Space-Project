/**
 * Cổng AI GIẢ LẬP cho bản thử giao diện. Bản thật đi qua AIGateway (packages/core, spec M1 §5):
 * depth trên server một lần mỗi ảnh, segmentation theo điểm chạm, inpainting trên cloud.
 * Hành vi lỗi điều khiển bằng cờ giả lập trong store/devFlags.
 */
import type { AIError, Result } from '@yourspace/core';

import { useDevFlags } from '@/store/devFlags';
import { findSamplePhoto, type SampleObject } from '@/data/samplePhotos';
import { isOfflineForced } from '@/services/network';
import type { ErasedRegion, RoomCamera } from '@/types';
import { localId } from '@/lib/id';

export type ScanResult = {
  /** Đường mặt sàn – tường ước lượng (0..1 theo chiều cao ảnh); có `wallBase` thì là chân tường ở giữa ảnh. */
  floorLineY: number;
  /** Chân tường theo bề ngang ảnh: [x, độ lệch so với floorLineY] (xem Calibration.wallBase). */
  wallBase?: [number, number][];
  /** Máy ảnh đo được từ ảnh (xem Calibration.camera). */
  camera?: RoomCamera;
  /** Chiều cao máy giả định, mét. */
  cameraHeightM: number;
  confidence: number;
};

export type AIFailure = AIError | { kind: 'Offline'; message: string };

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new Error('aborted'));
    });
  });
}

const OFFLINE: AIFailure = { kind: 'Offline', message: 'Không có kết nối mạng.' };

/** Độ cao (y) của đường gãy khúc tại x, nội suy tuyến tính. */
function polylineAt(points: [number, number][], x: number): number {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[i - 1];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return points[points.length - 1][1];
}

/**
 * Quét phòng: depth + mặt sàn + chân tường. Mục tiêu ≤ 5 giây; quá ~20 giây thì coi là AI tạm ngưng (G2).
 * Bản thử: ảnh mẫu trả về chân tường đo sẵn (đường gãy khúc theo tường thật); ảnh khác trả về đường sàn ngang.
 */
export async function scanRoom(signal?: AbortSignal, photoRef?: string | null): Promise<Result<ScanResult, AIFailure>> {
  if (isOfflineForced()) {
    await wait(600, signal);
    return { ok: false, error: OFFLINE };
  }
  const scenario = useDevFlags.getState().aiScenario;
  await wait(scenario === 'paused' ? 3500 : 2600, signal);
  if (scenario === 'paused') {
    return { ok: false, error: { kind: 'Timeout', message: 'Dịch vụ phân tích ảnh không phản hồi.' } };
  }
  if (scenario === 'hard_photo') {
    return { ok: false, error: { kind: 'LowConfidence', message: 'Không nhận ra rõ mặt sàn trong ảnh.' } };
  }
  const sample = findSamplePhoto(photoRef);
  if (sample) {
    const floorLineY = polylineAt(sample.wallBase, 0.5);
    const wallBase = sample.wallBase.map(([x, y]): [number, number] => [x, y - floorLineY]);
    const { heightM, ...camera } = sample.camera;
    return { ok: true, value: { floorLineY, wallBase, camera, cameraHeightM: heightM, confidence: 0.86 } };
  }
  return { ok: true, value: { floorLineY: 0.58, cameraHeightM: 1.4, confidence: 0.82 } };
}

/** Ảnh đã nhận diện đồ (theo tham chiếu ảnh): nhận diện một lần mỗi ảnh, như depth. */
const detectedPhotos = new Set<string>();

/**
 * Vào công cụ Xóa đồ cũ: nhận diện các món đồ có sẵn trong ảnh để vẽ viền cho người dùng chạm xóa
 * (object detection + mask ở bản thật). Bản thử: ảnh mẫu có danh sách vật thể đo sẵn; ảnh khác trả về rỗng.
 */
export async function detectObjects(
  photoKey: string,
  objects: SampleObject[] = [],
  signal?: AbortSignal,
): Promise<Result<ErasedRegion[], AIFailure>> {
  if (isOfflineForced()) return { ok: false, error: OFFLINE };
  if (useDevFlags.getState().aiScenario === 'paused') {
    return { ok: false, error: { kind: 'RateLimited', message: 'AI đang tạm ngưng.' } };
  }
  if (!detectedPhotos.has(photoKey)) await wait(1100, signal);
  detectedPhotos.add(photoKey);
  return {
    ok: true,
    value: objects.map((o) => ({ id: `obj-${o.id}`, objectId: o.id, label: o.label, x: o.x, y: o.y, w: o.w, h: o.h })),
  };
}

/**
 * Chạm để chọn đồ cũ theo điểm (segmentation theo điểm chạm), dùng khi AI không nhận ra món nào trong ảnh.
 * Bản thử: trả về một vùng quanh điểm chạm.
 */
export async function segmentAt(point: { x: number; y: number }, signal?: AbortSignal): Promise<Result<ErasedRegion, AIFailure>> {
  if (isOfflineForced()) return { ok: false, error: OFFLINE };
  if (useDevFlags.getState().aiScenario === 'paused') {
    return { ok: false, error: { kind: 'RateLimited', message: 'AI đang tạm ngưng.' } };
  }
  await wait(550, signal);
  const w = 0.32;
  const h = 0.2;
  const x = Math.min(Math.max(point.x - w / 2, 0), 1 - w);
  const y = Math.min(Math.max(point.y - h / 2, 0), 1 - h);
  return { ok: true, value: { id: localId('mask'), x, y, w, h } };
}

/** Xóa đồ cũ: các vùng truyền vào xóa trong một lượt inpainting. Timeout ~30 giây ở bản thật. */
export async function inpaint(
  regions: ErasedRegion[],
  signal?: AbortSignal,
): Promise<Result<ErasedRegion[], AIFailure>> {
  if (isOfflineForced()) return { ok: false, error: OFFLINE };
  const flags = useDevFlags.getState();
  await wait(2200, signal);
  if (flags.aiScenario === 'paused') {
    return { ok: false, error: { kind: 'Timeout', message: 'Dịch vụ xóa đồ không phản hồi.' } };
  }
  if (flags.eraseFails) {
    return { ok: false, error: { kind: 'VendorError', message: 'Không xóa được lượt này.' } };
  }
  return { ok: true, value: regions };
}
