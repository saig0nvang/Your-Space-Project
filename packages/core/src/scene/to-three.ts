import type { CameraModel } from "../types";

export type ThreeCamera = {
  fovDeg: number;
  aspect: number;
  position: [number, number, number];
  rotationXRad: number;
};

/**
 * Map CameraModel → props camera three.js. Camera ở (0,heightM,0) nhìn -Z,
 * nghiêng xuống bằng rotation.x = -pitchRad (khớp convention của placeOnFloor).
 */
export function cameraToThree(cam: CameraModel): ThreeCamera {
  return {
    fovDeg: (cam.fovYRad * 180) / Math.PI,
    aspect: cam.aspect,
    position: [0, cam.heightM, 0],
    rotationXRad: -cam.pitchRad,
  };
}
