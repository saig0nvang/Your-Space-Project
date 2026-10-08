"use client";
import { useEffect, useRef } from "react";
import type { AutoObject, EraseObject } from "./EraseTool";

/**
 * Vẽ mọi vùng đang chọn lên trên ảnh: món đang chọn trắng 45%, món khác trắng 28%; kèm chấm điểm chạm.
 * Món máy dò thấy mà chưa chọn: viền trắng + nhãn — như Eraser của Kreativ.
 */
export function MaskOverlay({ objects, activeIndex, auto }: { objects: EraseObject[]; activeIndex: number; auto: AutoObject[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const outlined = auto.filter((a) => !objects.some((o) => o.mask === a.mask));
  const first = objects.find((o) => o.mask)?.mask ?? auto[0]?.mask;
  useEffect(() => {
    const c = ref.current;
    if (!c || !first) return;
    c.width = first.width;
    c.height = first.height;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(first.width, first.height);
    objects.forEach((o, idx) => {
      if (!o.mask) return;
      const alpha = idx === activeIndex ? 115 : 72;
      for (let k = 0; k < o.mask.data.length; k++) {
        if (!o.mask.data[k]) continue;
        img.data[k * 4] = 255; img.data[k * 4 + 1] = 255; img.data[k * 4 + 2] = 255;
        img.data[k * 4 + 3] = Math.max(img.data[k * 4 + 3] ?? 0, alpha);
      }
    });
    const { width: w, height: h } = first;
    const t = Math.max(1, Math.round(Math.max(w, h) / 600)); // viền ~2 px trên màn hình
    for (const { mask: m } of outlined) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!m.data[y * w + x]) continue;
          const edge = x < t || y < t || x >= w - t || y >= h - t
            || !m.data[y * w + x - t] || !m.data[y * w + x + t] || !m.data[(y - t) * w + x] || !m.data[(y + t) * w + x];
          if (!edge) continue;
          const k = (y * w + x) * 4;
          img.data[k] = 255; img.data[k + 1] = 255; img.data[k + 2] = 255; img.data[k + 3] = 235;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [objects, activeIndex, first, outlined]);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {first && <canvas ref={ref} className="absolute inset-0 size-full" />}
      {objects.flatMap((o, idx) => o.points.map((p, j) => (
        <span key={`${idx}-${j}`} aria-hidden
          className={`absolute -translate-x-1/2 -translate-y-1/2 size-5 rounded-full border-2 border-white text-[12px] leading-4 text-center font-bold ${p.positive ? "bg-accent text-on-accent" : "bg-destructive text-white"}`}
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>{p.positive ? "+" : "−"}</span>
      )))}
      {outlined.map((a, i) => (
        <span key={i} aria-hidden className="absolute rounded-pill bg-black/60 text-white px-2 text-[12px] leading-5 font-semibold"
          style={{ left: `${a.box[0] * 100}%`, top: `${a.box[1] * 100}%` }}>{a.label}</span>
      ))}
    </div>
  );
}
