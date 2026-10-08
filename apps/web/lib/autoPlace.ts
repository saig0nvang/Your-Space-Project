"use client";
import { findFreeFloorSpot, fitDepthToFloor, floorMaskFromDepth } from "@yourspace/core";
import { modelById } from "./catalog";
import { cameraOf, useEditor } from "./store";
import { onVisibleFloor, placementYaw } from "./walls";

/** Cùng ngưỡng khớp sàn với lượt che khuất (useSceneDepth). */
const MIN_FLOOR_FIT = 0.3;
const footprintRadius = (productId: string, scale: number) => {
  const d = modelById(productId)?.dimsM;
  return d ? (Math.hypot(d.widthM, d.depthM) / 2) * scale : 0.5;
};

/**
 * Đặt món vào chỗ sàn trống rộng nhất (theo depth của ảnh đang thấy, tránh đồ đã bày), gần tường thì quay lưng vào
 * tường — như Kreativ.
 * false nếu chưa có depth/không khớp được sàn → để người dùng chạm lên sàn như cũ.
 */
export function autoPlace(productId: string): boolean {
  const { photo, setup, depth, history, placeItem, notify } = useEditor.getState();
  if (!photo || !setup || !history || !depth.disparity || depth.forUrl !== history.present.workingUrl) return false;
  const aspect = photo.width / photo.height;
  const cam1 = cameraOf({ ...setup, heightM: 1 }, aspect); // mask sàn bất biến theo chiều cao máy (xem useSceneDepth)
  const fit = fitDepthToFloor(depth.disparity, cam1);
  if (fit.confidence < MIN_FLOOR_FIT) return false;
  const obstacles = history.present.items.map((i) => ({ x: i.x, z: i.z, radiusM: footprintRadius(i.productId, i.scale) }));
  const need = footprintRadius(productId, 1);
  const spot = findFreeFloorSpot(floorMaskFromDepth(depth.disparity, fit, cam1), cameraOf(setup, aspect), obstacles, need);
  if (!spot) return false;
  const p = onVisibleFloor(productId, 1, spot.x, spot.z);
  placeItem(productId, p.x, p.z, placementYaw(p.x, p.z));
  notify(spot.clearanceM < need ? "Sàn trống hơi chật · kéo để chỉnh" : "Đã đặt vào chỗ sàn trống · kéo để chỉnh");
  return true;
}
