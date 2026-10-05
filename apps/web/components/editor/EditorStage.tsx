"use client";
import { placeOnFloor, type Calibration, type CameraModel, type PhotoLighting } from "@yourspace/core";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { modelById } from "@/lib/catalog";
import { cameraOf, useEditor } from "@/lib/store";
import { RoomScene } from "./RoomScene";

export const floorCalib = (camera: CameraModel): Calibration => ({
  camera,
  floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 },
  confidence: 1,
});

type Occluder = Parameters<typeof RoomScene>[0]["occluder"];

export function EditorStage({
  mode,
  occluder,
  lighting,
  showOriginal,
  onErasePoint,
  children,
}: {
  mode: "place" | "erase";
  occluder: Occluder;
  lighting: PhotoLighting;
  showOriginal: boolean;
  onErasePoint: (p: { x: number; y: number }) => void;
  children?: ReactNode;
}) {
  const { photo, setup, history, selectedUid, armedProductId } = useEditor();
  const s = useEditor.getState;
  const boxRef = useRef<HTMLDivElement>(null);
  const hitItem = useRef(false);
  const drag = useRef<{ uid: string; dx: number; dz: number } | null>(null);
  if (!photo || !setup || !history) return null;
  const aspect = photo.width / photo.height;
  const camera = cameraOf(setup, aspect);
  const calib = floorCalib(camera);

  const toNdc = (e: PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: 1 - ((e.clientY - r.top) / r.height) * 2 };
  };
  const floorAt = (ndc: { x: number; y: number }) => placeOnFloor(ndc, calib, { widthM: 0, heightM: 0, depthM: 0 }).position;

  function onItemPointerDown(uid: string, pointer: { x: number; y: number }) {
    if (mode !== "place") return;
    hitItem.current = true;
    const item = s().history?.present.items.find((i) => i.uid === uid);
    if (!item) return;
    const p = floorAt(pointer);
    drag.current = { uid, dx: item.x - p.x, dz: item.z - p.z };
    s().select(uid);
    s().beginGesture();
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ndc = toNdc(e);
    if (mode === "erase") {
      onErasePoint({ x: (ndc.x + 1) / 2, y: (1 - ndc.y) / 2 });
      return;
    }
    if (hitItem.current) {
      hitItem.current = false;
      return;
    } // R3F đã xử lý (chạy trước, vì lắng nghe ở phần tử con)
    const productId = s().armedProductId;
    if (!productId) {
      s().select(null);
      return;
    }
    if (ndc.y >= setup!.horizonNdcY) {
      s().notify("Chạm vào sàn, thấp hơn đường ngang tầm mắt");
      return;
    }
    if (!modelById(productId)) return;
    const p = floorAt(ndc);
    const first = (s().history?.present.items.length ?? 0) === 0;
    s().placeItem(productId, p.x, p.z);
    if (first) s().notify("Đã căn theo mặt sàn · kéo để chỉnh");
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const ndc = toNdc(e);
    if (ndc.y >= setup!.horizonNdcY - 0.01) return; // không kéo món lên trên chân trời (F2: luôn bám sàn)
    const p = floorAt(ndc);
    s().moveItem(d.uid, p.x + d.dx, p.z + d.dz);
  }

  function onPointerUp() {
    if (drag.current) {
      drag.current = null;
      s().endGesture();
    }
  }

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden bg-muted touch-none select-none ${armedProductId || mode === "erase" ? "cursor-crosshair" : ""}`}
      style={{ aspectRatio: `${photo.width} / ${photo.height}`, width: `min(100%, calc(62vh * ${aspect}))` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <RoomScene
        photoUrl={showOriginal ? photo.url : history.present.workingUrl}
        aspect={aspect}
        camera={camera}
        items={mode === "erase" ? [] : history.present.items}
        selectedUid={selectedUid}
        occluder={occluder}
        lighting={lighting}
        onItemPointerDown={onItemPointerDown}
      />
      {children}
    </div>
  );
}
