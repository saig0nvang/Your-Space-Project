import type { Vec3 } from "./geometry";

/** Relative depth map (data normalized 0..1), row-major, y-down image rows. */
export type DepthMap = { width: number; height: number; data: Float32Array };

/** Plane defined by normal·p + d = 0. */
export type Plane = { normal: Vec3; d: number };

export type CameraModel = {
  fovYRad: number;
  aspect: number;
  heightM: number;
  pitchRad: number;
};

export type Calibration = { camera: CameraModel; floor: Plane; confidence: number };

export type FurnitureDims = { widthM: number; heightM: number; depthM: number };

export type Transform = { position: Vec3; rotationYRad: number; scale: number };
