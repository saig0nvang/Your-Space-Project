"use client";
import {
  begin, commit, createHistory, end, redo, replace, solveCameraFromHorizon, undo,
  type CameraModel, type DisparityMap, type History, type Mask, type StyleId,
} from "@yourspace/core";
import { create } from "zustand";
import type { PreparedPhoto } from "./image";

export type PlacedItem = { uid: string; productId: string; x: number; z: number; rotationYRad: number };
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
  setStyle: (id: StyleId) => void;
  setPhoto: (p: PreparedPhoto) => void;
  startEditing: (setup: CameraSetup) => void;
  setCameraHeight: (heightM: number) => void;
  arm: (productId: string | null) => void;
  select: (uid: string | null) => void;
  placeItem: (productId: string, x: number, z: number) => void;
  beginGesture: () => void;
  moveItem: (uid: string, x: number, z: number) => void;
  rotateItem: (uid: string, rad: number) => void;
  endGesture: () => void;
  duplicateItem: (uid: string) => void;
  removeItem: (uid: string) => void;
  applyErase: (workingUrl: string, mask: Mask) => void;
  undo: () => void;
  redo: () => void;
  setDepth: (d: DepthState) => void;
  notify: (text: string) => void;
};

const IDLE_DEPTH: DepthState = { status: "idle", forUrl: null, disparity: null };

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
    setStyle: (styleId) => set({ styleId }),
    setPhoto: (photo) => set({ photo, setup: null, history: null, selectedUid: null, armedProductId: null, depth: IDLE_DEPTH }),
    startEditing: (setup) => {
      const photo = get().photo;
      if (!photo) return;
      set({ setup, history: createHistory<EditorDoc>({ items: [], workingUrl: photo.url, eraseMask: null }), selectedUid: null });
    },
    setCameraHeight: (heightM) => {
      const s = get().setup;
      if (s) set({ setup: { ...s, heightM } });
    },
    arm: (armedProductId) => set({ armedProductId, selectedUid: null }),
    select: (selectedUid) => set({ selectedUid }),
    placeItem: (productId, x, z) => {
      const uid = crypto.randomUUID();
      commitItems((items) => [...items, { uid, productId, x, z, rotationYRad: 0 }]);
      set({ selectedUid: uid, armedProductId: null });
    },
    beginGesture: () => {
      const h = get().history;
      if (h) set({ history: begin(h) });
    },
    moveItem: (uid, x, z) => patchItems((items) => items.map((i) => (i.uid === uid ? { ...i, x, z } : i))),
    rotateItem: (uid, rad) => patchItems((items) => items.map((i) => (i.uid === uid ? { ...i, rotationYRad: rad } : i))),
    endGesture: () => {
      const h = get().history;
      if (h) set({ history: end(h) });
    },
    duplicateItem: (uid) => {
      const src = get().history?.present.items.find((i) => i.uid === uid);
      if (!src) return;
      const copy = { ...src, uid: crypto.randomUUID(), x: src.x + 0.4 };
      commitItems((items) => [...items, copy]);
      set({ selectedUid: copy.uid });
    },
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
