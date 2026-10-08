"use client";
import { estimateWalls, fitDepthToFloor, nearestWall, scaleWall, snapToWall, yawFacingAway, type Wall } from "@yourspace/core";
import { modelById } from "./catalog";
import { cameraOf, useEditor } from "./store";

/** Cùng ngưỡng khớp sàn với lượt che khuất (useSceneDepth). */
const MIN_FLOOR_FIT = 0.3;
/** Món đặt cách tường ≤ khoảng này (m) thì tự quay lưng vào tường. */
const FACE_WALL_WITHIN_M = 1.5;
/** Kéo lưng món tới cách tường ≤ khoảng này (m) thì hít vào tường. */
const SNAP_M = 0.25;

let cache: { key: unknown[]; walls: Wall[] } | null = null;

/**
 * Tường của ảnh đang thấy, đơn vị mét theo chiều cao máy hiện tại. Ước lượng ở chiều cao giả định 1 m (bất biến như
 * occluder — xem useSceneDepth) rồi nhân heightM; nhớ kết quả theo depth + chân trời + FOV để kéo món không tính lại.
 */
export function currentWalls(): Wall[] {
  const { photo, setup, depth, history } = useEditor.getState();
  if (!photo || !setup || !history || !depth.disparity || depth.forUrl !== history.present.workingUrl) return [];
  const key = [depth.disparity, setup.horizonNdcY, setup.fovYRad, photo.width, photo.height];
  if (!cache || cache.key.some((v, i) => v !== key[i])) {
    const cam1 = cameraOf({ ...setup, heightM: 1 }, photo.width / photo.height);
    const fit = fitDepthToFloor(depth.disparity, cam1);
    cache = { key, walls: fit.confidence < MIN_FLOOR_FIT ? [] : estimateWalls(depth.disparity, fit, cam1) };
  }
  return cache.walls.map((wl) => scaleWall(wl, setup.heightM));
}

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
