import { add, normalize, scale, type Vec3 } from "../geometry";
import type { Calibration, CameraModel, FurnitureDims, Transform } from "../types";

/** Hướng tia thế giới qua NDC, camera tại (0,heightM,0) nhìn -Z nghiêng xuống pitchRad. */
function worldRay(nx: number, ny: number, cam: CameraModel): Vec3 {
  const t = Math.tan(cam.fovYRad / 2);
  const local: Vec3 = { x: nx * t * cam.aspect, y: ny * t, z: -1 };
  // xoay xuống quanh trục X một góc pitch (pitch>0 → nhìn xuống)
  const c = Math.cos(-cam.pitchRad);
  const s = Math.sin(-cam.pitchRad);
  return normalize({
    x: local.x,
    y: local.y * c - local.z * s,
    z: local.y * s + local.z * c,
  });
}

/**
 * Đặt đồ tại điểm màn hình (NDC): raycast xuống mặt sàn y=0 → chạm sàn.
 * Đồ có kích thước THẬT (mét) nên scale=1 (phối cảnh camera lo phần thu nhỏ theo xa/gần).
 * Xoay chỉ trục Y (rotationYRad khởi tạo 0, user override sau).
 */
export function placeOnFloor(
  screenNdc: { x: number; y: number },
  calib: Calibration,
  _dims: FurnitureDims,
): Transform {
  const cam = calib.camera;
  const camPos: Vec3 = { x: 0, y: cam.heightM, z: 0 };
  const dir = worldRay(screenNdc.x, screenNdc.y, cam);

  if (dir.y >= -1e-4) {
    // tia không chúc xuống đủ → đặt xa phía trước như fallback
    return { position: { x: 0, y: 0, z: -5 }, rotationYRad: 0, scale: 1 };
  }
  const t = -camPos.y / dir.y;
  const position = add(camPos, scale(dir, t));
  position.y = 0;
  return { position, rotationYRad: 0, scale: 1 };
}
