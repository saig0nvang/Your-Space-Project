"use client";

export type Gravity = {
  rollRad: number;
  pitchRad: number;
  vfovRad: number;
  rollUncertainty: number;
  pitchUncertainty: number;
  vfovUncertainty: number;
};

/** GeoCalib qua /api/ai/calibrate. null khi service tắt/lỗi — người gọi giữ cách cũ (kéo tay). */
export async function calibrate(image: Blob): Promise<Gravity | null> {
  const fd = new FormData();
  fd.set("image", image, "photo.jpg");
  try {
    const res = await fetch("/api/ai/calibrate", { method: "POST", body: fd });
    return res.ok ? ((await res.json()) as Gravity) : null;
  } catch {
    return null;
  }
}
