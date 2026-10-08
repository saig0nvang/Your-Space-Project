"use client";
import {
  estimateWalls, findSupport, fitDepthToFloor, floorEdge, keepOnVisibleFloor, nearestWall, scaleWall, separateFromOthers,
  snapToWall, wallGuide, yawFacingAway, type FloorEdge, type Footprint, type Support, type Wall,
} from "@yourspace/core";
import { modelById } from "./catalog";
import { cameraOf, setItemConstraint, useEditor, type PlacedItem } from "./store";

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

/** Chân đế món trên sàn (mét, theo cỡ hiển thị); null nếu không có model. */
const footprintOf = (i: PlacedItem): Footprint | null => {
  const m = modelById(i.productId);
  return m ? { x: i.x, z: i.z, yaw: i.rotationYRad + m.baseYawRad, w: m.dimsM.widthM * i.scale, d: m.dimsM.depthM * i.scale } : null;
};
const heightOf = (i: PlacedItem) => (modelById(i.productId)?.dimsM.heightM ?? 0) * i.scale;
/** Mặt đỡ: bàn, tủ/kệ. Đặt lên được: cây cảnh, đèn nhỏ (≤ 90 cm) — như mặt "stackable" của Kreativ. */
const SUPPORT_CATEGORIES = new Set(["table", "shelf"]);
const canStack = (i: PlacedItem) => {
  const m = modelById(i.productId);
  return !!m && (m.category === "plant" || m.category === "lamp") && m.dimsM.heightM * i.scale <= 0.9;
};
const supportOf = (o: PlacedItem): Support | null => {
  const m = modelById(o.productId), f = footprintOf(o);
  return m && f && SUPPORT_CATEGORIES.has(m.category) && !o.onUid ? { ...f, uid: o.uid, top: (o.y ?? 0) + heightOf(o) } : null;
};

// Mọi thay đổi món (đặt, kéo, xoay, đổi cỡ, nhân bản, đổi món), theo thứ tự:
// 1. món đặt-lên-được có tâm nằm trong mặt trên của bàn/tủ → lên mặt đó (y = độ cao mặt, nhớ món cha);
// 2. không chồng lên món khác ở CÙNG tầng cao (như Kreativ kiểm va chạm) — chậu trên tủ không va với chính cái tủ;
// 3. món trên sàn: chân món trên sàn thấy được — chạm lên tường dưới tầm mắt, hay xoay/phóng món dài ra sau tường, không
//    còn "treo tường". Bị kéo về có thể lấn lại món khác; sàn thắng vì treo tường sai rõ hơn chạm nhẹ món bên cạnh.
setItemConstraint((i, items) => {
  const f = footprintOf(i);
  if (!f) return i;
  const others = items.filter((o) => o.uid !== i.uid && o.onUid !== i.uid);
  const supports = canStack(i) ? others.flatMap((o) => supportOf(o) ?? []) : [];
  const h = heightOf(i);
  const place = (x: number, z: number) => {
    const sup = findSupport({ ...f, x, z }, supports);
    const y = sup?.top ?? 0;
    const colliders = others.filter((o) => o.uid !== sup?.uid && (o.y ?? 0) < y + h - 1e-3 && y < (o.y ?? 0) + heightOf(o) - 1e-3);
    return { sup, y, ...separateFromOthers({ ...f, x, z }, colliders.flatMap((o) => footprintOf(o) ?? [])) };
  };
  let p = place(f.x, f.z);
  if (p.sup && !findSupport({ ...f, x: p.x, z: p.z }, [p.sup])) p = { ...p, sup: null, y: 0 }; // bị đẩy ra khỏi mặt
  if (p.sup) return { x: p.x, z: p.z, y: p.y, onUid: p.sup.uid };
  const { photo, setup } = useEditor.getState();
  const edge = room()?.edge;
  if (!edge || !photo || !setup) return { x: p.x, z: p.z, y: 0, onUid: undefined };
  const q = keepOnVisibleFloor(edge, cameraOf(setup, photo.width / photo.height), p.x, p.z, f.yaw, f.w, f.d);
  return { ...q, y: 0, onUid: undefined };
});

/** Góc xoay khi đặt món tại (x, z): quay lưng vào tường gần nếu có, không thì 0 (nhìn về máy). */
export function placementYaw(x: number, z: number): number {
  const wl = nearestWall(currentWalls(), x, z, FACE_WALL_WITHIN_M);
  return wl ? yawFacingAway(wl) : 0;
}

/**
 * Vị trí + góc khi kéo tới (x, z): sát tường thì hít vào (xoay lưng, áp sát), lấn tường thì bị đẩy ra. `guide` = vạch
 * chân tường khi đang hít, null khi không.
 */
export function dragAgainstWalls(
  productId: string, scale: number, yawRad: number, x: number, z: number,
): { x: number; z: number; yawRad: number; guide: ReturnType<typeof wallGuide> | null } {
  const d = modelById(productId)?.dimsM;
  if (!d) return { x, z, yawRad, guide: null };
  const q = snapToWall(currentWalls(), x, z, yawRad, d.widthM * scale, d.depthM * scale, SNAP_M);
  return { ...q, guide: q.wall ? wallGuide(q.wall, q.x, q.z, d.widthM * scale) : null };
}
