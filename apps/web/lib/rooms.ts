// Golden-set ảnh phòng cho spike (public/golden/rooms/). License: xem public/golden/CREDITS.md
export const GOLDEN_ROOMS: string[] = Array.from(
  { length: 14 },
  (_, i) => `/golden/rooms/room-${String(i + 1).padStart(2, "0")}.jpg`,
);

// Sofa Khronos "Glam Velvet Sofa" (Wayfair, CC BY 4.0) — kích thước THẬT.
export const SPIKE_SOFA = {
  url: "/golden/sofa.glb",
  dims: { widthM: 2.19, heightM: 0.79, depthM: 1.02 },
};
