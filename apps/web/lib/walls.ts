"use client";
import {
  estimateWalls, fitDepthToFloor, floorEdge, keepOnVisibleFloor, nearestWall, scaleWall, snapToWall, yawFacingAway,
  type FloorEdge, type Wall,
} from "@yourspace/core";
import { modelById } from "./catalog";
import { cameraOf, setItemConstraint, useEditor } from "./store";

/** Cùng ngưỡng khớp sàn với lượt che khuất (useSceneDepth). */
const MIN_FLOOR_FIT = 0.3;
/** Món đặt cách tường ≤ khoảng này (m) thì tự quay lưng vào tường. */
const FACE_WALL_WITHIN_M = 1.5;
/** Kéo lưng món tới cách tường ≤ khoảng này (m) thì hít vào tường. */
const SNAP_M = 0.25;

let cache: { key: unknown[]; walls: Wall[]; edge: FloorEdge | null } | null = null;

/**
 * Tường + mép sàn của ảnh đang thấy. Ước lượng ở chiều cao máy giả định 1 m (bất biến như occluder — xem
 * useSceneDepth); nhớ theo depth + chân trời + FOV để kéo món không tính lại. null khi chưa có depth/không khớp sàn.
 */
function room(): { walls: Wall[]; edge: FloorEdge | null } | null {
  const { photo, setup, depth, history } = useEditor.getState();
  if (!photo || !setup || !history || !depth.disparity || depth.forUrl !== history.present.workingUrl) return null;
  const key = [depth.disparity, setup.horizonNdcY, setup.fovYRad, photo.width, photo.height];
  if (!cache || cache.key.some((v, i) => v !== key[i])) {
    const cam1 = cameraOf({ ...setup, heightM: 1 }, photo.width / photo.height);
    const fit = fitDepthToFloor(depth.disparity, cam1);
    cache = fit.confidence < MIN_FLOOR_FIT
      ? { key, walls: [], edge: null }
      : { key, walls: estimateWalls(depth.disparity, fit, cam1), edge: floorEdge(depth.disparity, fit, cam1) };
  }
  return cache;
}

/** Tường của ảnh đang thấy, đơn vị mét theo chiều cao máy hiện tại (ước lượng ở 1 m rồi nhân heightM). */
export function currentWalls(): Wall[] {
  const heightM = useEditor.getState().setup?.heightM ?? 1;
  return room()?.walls.map((wl) => scaleWall(wl, heightM)) ?? [];
}

// Mọi thay đổi món (đặt, kéo, xoay, đổi cỡ, nhân bản) giữ chân món trên sàn thấy được — chạm lên tường dưới tầm mắt,
// hay xoay/phóng món dài ra sau tường, không còn ra món "treo tường".
setItemConstraint((i) => {
  const { photo, setup } = useEditor.getState();
  const edge = room()?.edge;
  const model = modelById(i.productId);
  if (!edge || !photo || !setup || !model) return i;
  const cam = cameraOf(setup, photo.width / photo.height);
  const d = model.dimsM;
  return keepOnVisibleFloor(edge, cam, i.x, i.z, i.rotationYRad + model.baseYawRad, d.widthM * i.scale, d.depthM * i.scale);
});

/** Góc xoay khi đặt món tại (x, z): quay lưng vào tường gần nếu có, không thì 0 (nhìn về máy). */
export function placementYaw(x: number, z: number): number {
  const wl = nearestWall(currentWalls(), x, z, FACE_WALL_WITHIN_M);
  return wl ? yawFacingAway(wl) : 0;
}

/** Vị trí + góc khi kéo tới (x, z): sát tường thì hít vào (xoay lưng, áp sát), lấn tường thì bị đẩy ra. */
export function dragAgainstWalls(productId: string, scale: number, yawRad: number, x: number, z: number): { x: number; z: number; yawRad: number } {
  const d = modelById(productId)?.dimsM;
  return d ? snapToWall(currentWalls(), x, z, yawRad, d.widthM * scale, d.depthM * scale, SNAP_M) : { x, z, yawRad };
}
