"use client";
import {
  begin, commit, createHistory, end, redo, replace, solveCameraFromHorizon, undo,
  type CameraModel, type DisparityMap, type History, type Mask, type StyleId,
} from "@yourspace/core";
import { create } from "zustand";
import type { Detection } from "./ai/detectClient";
import { newId } from "./id";
import type { PreparedPhoto } from "./image";

/** `scale`: cỡ hiển thị do người dùng chỉnh (1 = kích thước thật) — người dùng quyết 2026-10-07, lệch MASTER.md 2026-10-04. */
export type PlacedItem = { uid: string; productId: string; x: number; z: number; rotationYRad: number; scale: number };

export const ITEM_SCALE_RANGE = { min: 0.5, max: 1.5 };
/** Phần nằm trong lịch sử hoàn tác. `workingUrl` = ảnh sau các lần xóa; `eraseMask` = mọi vùng đã xóa (lấp lại từ ảnh gốc). */
export type EditorDoc = { items: PlacedItem[]; workingUrl: string; eraseMask: Mask | null };
export type CameraSetup = { horizonNdcY: number; heightM: number; fovYRad: number };
export type DepthState = { status: "idle" | "running" | "ready" | "failed"; forUrl: string | null; disparity: DisparityMap | null };
export type Notice = { id: number; text: string };

export const cameraOf = (s: CameraSetup, aspect: number): CameraModel =>
  solveCameraFromHorizon({ horizonNdcY: s.horizonNdcY, aspect, fovYRad: s.fovYRad, heightM: s.heightM });

type State = {
  styleId: StyleId;
  photo: PreparedPhoto | null;
  setup: CameraSetup | null;
  history: History<EditorDoc> | null;
  selectedUid: string | null;
  armedProductId: string | null;
  depth: DepthState;
  notice: Notice | null;
  /** Hiện đường tầm mắt trên ảnh (khi mở popover Chỉnh cỡ phòng). */
  showHorizon: boolean;
  /** Đo chiều cao máy bằng vật thẳng đứng đã biết chiều cao: chạm chân rồi đỉnh (vd cửa đi 2,1 m). */
  measure: { objectHeightM: number; bottom: { x: number; y: number } | null } | null;
  /** Vạch chân tường khi món đang kéo hít tường — tạm thời, không vào lịch sử. */
  wallGuide: [[number, number], [number, number]] | null;
  /** Đồ nội thất máy dò thấy trên ảnh GỐC (`forUrl` = photo.url) — Xóa đồ viền sẵn để chạm chọn. */
  detections: { forUrl: string; objects: Detection[] } | null;
  setStyle: (id: StyleId) => void;
  setPhoto: (p: PreparedPhoto) => void;
  /** Bỏ ảnh đang sửa cùng mọi thứ gắn với nó (đồ đã bày, lịch sử, depth, lựa chọn). */
  clearPhoto: () => void;
  startEditing: (setup: CameraSetup) => void;
  /** Quay lại trình sửa với chân trời/tư thế mới, GIỮ nguyên lịch sử (đồ đã bày, các lần xóa). */
  resumeEditing: (setup: Pick<CameraSetup, "horizonNdcY" | "heightM">) => void;
  setCameraHeight: (heightM: number) => void;
  setHorizon: (horizonNdcY: number) => void;
  arm: (productId: string | null) => void;
  select: (uid: string | null) => void;
  placeItem: (productId: string, x: number, z: number, rotationYRad?: number) => void;
  beginGesture: () => void;
  moveItem: (uid: string, x: number, z: number) => void;
  rotateItem: (uid: string, rad: number) => void;
  scaleItem: (uid: string, scale: number) => void;
  endGesture: () => void;
  duplicateItem: (uid: string) => void;
  /** Đổi món tại chỗ (giữ vị trí, góc; cỡ về 100% vì món mới có kích thước thật riêng) — một bước hoàn tác. */
  swapItem: (uid: string, productId: string) => void;
  removeItem: (uid: string) => void;
  applyErase: (workingUrl: string, mask: Mask) => void;
  undo: () => void;
  redo: () => void;
  setDepth: (d: DepthState) => void;
  notify: (text: string) => void;
};

const IDLE_DEPTH: DepthState = { status: "idle", forUrl: null, disparity: null };

/**
 * Ràng buộc vị trí món, áp cho MỌI thay đổi (đặt, kéo, xoay, đổi cỡ, nhân bản) — lib/walls đăng ký "chân món trên sàn
 * thấy được" (store không biết hình học phòng). Mặc định giữ nguyên.
 */
let constrain: (i: PlacedItem) => { x: number; z: number } = (i) => i;
export const setItemConstraint = (f: typeof constrain) => { constrain = f; };
const fitted = (i: PlacedItem): PlacedItem => ({ ...i, ...constrain(i) });

export const useEditor = create<State>()((set, get) => {
  /** Sửa `present.items` theo một gesture (không tạo bước; bước tạo ở endGesture). */
  const patchItems = (fn: (items: PlacedItem[]) => PlacedItem[]) => {
    const h = get().history;
    if (h) set({ history: replace(h, { ...h.present, items: fn(h.present.items) }) });
  };
  const commitItems = (fn: (items: PlacedItem[]) => PlacedItem[]) => {
    const h = get().history;
    if (h) set({ history: commit(h, { ...h.present, items: fn(h.present.items) }) });
  };

  return {
    styleId: "japandi",
    photo: null,
    setup: null,
    history: null,
    selectedUid: null,
    armedProductId: null,
    depth: IDLE_DEPTH,
    notice: null,
    showHorizon: false,
    measure: null,
    detections: null,
    wallGuide: null,
    setStyle: (styleId) => set({ styleId }),
    setPhoto: (photo) => set({ photo, setup: null, history: null, selectedUid: null, armedProductId: null, depth: IDLE_DEPTH, detections: null }),
    clearPhoto: () => set({ photo: null, setup: null, history: null, selectedUid: null, armedProductId: null, depth: IDLE_DEPTH, detections: null }),
    startEditing: (setup) => {
      const photo = get().photo;
      if (!photo) return;
      set({ setup, history: createHistory<EditorDoc>({ items: [], workingUrl: photo.url, eraseMask: null }), selectedUid: null });
    },
    resumeEditing: ({ horizonNdcY, heightM }) => {
      const s = get().setup;
      if (s && get().history) set({ setup: { ...s, horizonNdcY, heightM } });
    },
    setCameraHeight: (heightM) => {
      const s = get().setup;
      if (s) set({ setup: { ...s, heightM } });
    },
    setHorizon: (horizonNdcY) => {
      const s = get().setup;
      if (s) set({ setup: { ...s, horizonNdcY } });
    },
    arm: (armedProductId) => set({ armedProductId, selectedUid: null }),
    select: (selectedUid) => set({ selectedUid }),
    placeItem: (productId, x, z, rotationYRad = 0) => {
      const uid = newId();
      commitItems((items) => [...items, fitted({ uid, productId, x, z, rotationYRad, scale: 1 })]);
      set({ selectedUid: uid, armedProductId: null });
    },
    beginGesture: () => {
      const h = get().history;
      if (h) set({ history: begin(h) });
    },
    moveItem: (uid, x, z) => patchItems((items) => items.map((i) => (i.uid === uid ? fitted({ ...i, x, z }) : i))),
    rotateItem: (uid, rad) => patchItems((items) => items.map((i) => (i.uid === uid ? fitted({ ...i, rotationYRad: rad }) : i))),
    scaleItem: (uid, scale) => {
      const v = Math.min(ITEM_SCALE_RANGE.max, Math.max(ITEM_SCALE_RANGE.min, scale));
      patchItems((items) => items.map((i) => (i.uid === uid ? fitted({ ...i, scale: v }) : i)));
    },
    endGesture: () => {
      const h = get().history;
      if (h) set({ history: end(h) });
    },
    duplicateItem: (uid) => {
      const src = get().history?.present.items.find((i) => i.uid === uid);
      if (!src) return;
      const copy = fitted({ ...src, uid: newId(), x: src.x + 0.4 });
      commitItems((items) => [...items, copy]);
      set({ selectedUid: copy.uid });
    },
    swapItem: (uid, productId) => commitItems((items) => items.map((i) => (i.uid === uid ? fitted({ ...i, productId, scale: 1 }) : i))),
    removeItem: (uid) => {
      commitItems((items) => items.filter((i) => i.uid !== uid));
      set({ selectedUid: null });
    },
    applyErase: (workingUrl, mask) => {
      const h = get().history;
      if (h) set({ history: commit(h, { ...h.present, workingUrl, eraseMask: mask }) });
    },
    undo: () => {
      const h = get().history;
      if (h) set({ history: undo(h), selectedUid: null });
    },
    redo: () => {
      const h = get().history;
      if (h) set({ history: redo(h), selectedUid: null });
    },
    setDepth: (depth) => set({ depth }),
    notify: (text) => set({ notice: { id: Date.now(), text } }),
  };
});
