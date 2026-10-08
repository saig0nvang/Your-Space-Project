"use client";

/** Món nội thất máy dò thấy: nhãn tiếng Việt, khung x0, y0, x1, y1 chuẩn hoá 0..1. */
export type Detection = { label: string; score: number; box: [number, number, number, number] };

/** Grounding DINO qua /api/ai/detect. null khi service tắt/lỗi — Xóa đồ vẫn chạm chọn tay. */
export async function detectFurniture(image: Blob): Promise<Detection[] | null> {
  const fd = new FormData();
  fd.set("image", image, "photo.jpg");
  try {
    const res = await fetch("/api/ai/detect", { method: "POST", body: fd });
    return res.ok ? ((await res.json()) as { objects: Detection[] }).objects : null;
  } catch {
    return null;
  }
}
