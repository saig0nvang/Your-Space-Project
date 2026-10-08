"use client";
import { cameraHeightFromVerticalObject, placeOnFloor, pointOnHorizontalPlane, type Calibration, type CameraModel, type PhotoLighting } from "@yourspace/core";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { modelById } from "@/lib/catalog";
import { useShallow } from "zustand/react/shallow";
import { cameraOf, useEditor, type PlacedItem } from "@/lib/store";
import { dragAgainstWalls, placementYaw } from "@/lib/walls";
import { MeasureOverlay } from "./MeasureOverlay";
import { RoomScene } from "./RoomScene";

export const floorCalib = (camera: CameraModel): Calibration => ({
  camera,
  floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 },
  confidence: 1,
});

type Occluder = Parameters<typeof RoomScene>[0]["occluder"];
const NO_ITEMS: PlacedItem[] = [];

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
  const { photo, setup, items, workingUrl, selectedUid, armedProductId, showHorizon, measure } = useEditor(
    useShallow((st) => ({
      photo: st.photo,
      setup: st.setup,
      items: st.history?.present.items ?? null,
      workingUrl: st.history?.present.workingUrl ?? null,
      selectedUid: st.selectedUid,
      armedProductId: st.armedProductId,
      showHorizon: st.showHorizon,
      measure: st.measure,
    })),
  );
  const s = useEditor.getState;
  const boxRef = useRef<HTMLDivElement>(null);
  const hitItem = useRef(false);
  const drag = useRef<{ uid: string; planeY: number; dx: number; dz: number } | null>(null);
  if (!photo || !setup || !items || !workingUrl) return null;
  const aspect = photo.width / photo.height;
  const camera = cameraOf(setup, aspect);
  const calib = floorCalib(camera);

  const toNdc = (e: PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: 1 - ((e.clientY - r.top) / r.height) * 2 };
  };
  const floorAt = (ndc: { x: number; y: number }) => placeOnFloor(ndc, calib, { widthM: 0, heightM: 0, depthM: 0 }).position;

  // Kéo trên mặt phẳng ngang ở độ cao điểm bấm vào món (vd lưng ghế), không chiếu xuống sàn: điểm bấm nằm trên
  // chân trời thì tia không chạm sàn, độ lệch tính sai và món bị giữ sát máy. Kẹp dưới tầm máy để tia luôn cắt mặt phẳng.
  function onItemPointerDown(uid: string, pointer: { x: number; y: number }, hitY: number) {
    if (mode !== "place") return;
    hitItem.current = true;
    const item = s().history?.present.items.find((i) => i.uid === uid);
    if (!item) return;
    const planeY = Math.min(Math.max(hitY, 0), camera.heightM * 0.9);
    const p = pointOnHorizontalPlane(pointer, camera, planeY);
    if (!p) return;
    drag.current = { uid, planeY, dx: item.x - p.x, dz: item.z - p.z };
    s().select(uid);
    s().beginGesture();
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ndc = toNdc(e);
    const m = s().measure;
    if (m) {
      if (!m.bottom) {
        useEditor.setState({ measure: { ...m, bottom: ndc } });
        s().notify("Giờ chạm vào đỉnh của vật");
        return;
      }
      const h = cameraHeightFromVerticalObject(m.bottom, ndc, camera, m.objectHeightM);
      useEditor.setState({ measure: null });
      if (h === null || h < 0.5 || h > 3) {
        s().notify("Chưa đo được — chạm chân vật (trên sàn) trước, rồi đỉnh vật phía trên");
        return;
      }
      s().setCameraHeight(Math.round(h * 100) / 100);
      s().notify(`Máy cao ${h.toFixed(2)} m theo vật ${m.objectHeightM} m · mọi món đã đổi cỡ theo`);
      return;
    }
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
    const p = floorAt(ndc); // chạm lên tường dưới tầm mắt → store kéo về mép sàn (setItemConstraint ở lib/walls)
    const first = (s().history?.present.items.length ?? 0) === 0;
    s().placeItem(productId, p.x, p.z, placementYaw(p.x, p.z));
    if (first) s().notify("Đã căn theo mặt sàn · kéo để chỉnh");
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const p = pointOnHorizontalPlane(toNdc(e), camera, d.planeY);
    if (!p) return; // con trỏ vượt chân trời của mặt kéo — giữ vị trí cũ (F2: món vẫn ở y = 0)
    const item = s().history?.present.items.find((i) => i.uid === d.uid);
    if (!item) return;
    const q = dragAgainstWalls(item.productId, item.scale, item.rotationYRad, p.x + d.dx, p.z + d.dz); // hít tường, không xuyên
    s().moveItem(d.uid, q.x, q.z);
    if (q.yawRad !== item.rotationYRad) s().rotateItem(d.uid, q.yawRad);
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
        photoUrl={showOriginal ? photo.url : workingUrl}
        aspect={aspect}
        camera={camera}
        items={mode === "erase" ? NO_ITEMS : items}
        selectedUid={selectedUid}
        occluder={occluder}
        lighting={lighting}
        onItemPointerDown={onItemPointerDown}
      />
      {mode === "place" && selectedUid && (() => {
        const item = items.find((i) => i.uid === selectedUid);
        return item ? <MeasureOverlay item={item} camera={camera} /> : null;
      })()}
      {measure?.bottom && (
        <span aria-hidden className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent pointer-events-none"
          style={{ left: `${((measure.bottom.x + 1) / 2) * 100}%`, top: `${((1 - measure.bottom.y) / 2) * 100}%` }} />
      )}
      {showHorizon && (
        <div aria-hidden className="absolute inset-x-0 border-t-2 border-dashed border-white pointer-events-none shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
          style={{ top: `${((1 - setup.horizonNdcY) / 2) * 100}%` }} />
      )}
      {children}
    </div>
  );
}
