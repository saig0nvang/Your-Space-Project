"use client";
import { useEffect, useRef } from "react";
import type { EraseObject } from "./EraseTool";

/** Vẽ mọi vùng đang chọn lên trên ảnh: món đang chọn trắng 45%, món khác trắng 28%; kèm chấm điểm chạm. */
export function MaskOverlay({ objects, activeIndex }: { objects: EraseObject[]; activeIndex: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const first = objects.find((o) => o.mask)?.mask;
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
    ctx.putImageData(img, 0, 0);
  }, [objects, activeIndex, first]);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {first && <canvas ref={ref} className="absolute inset-0 size-full" />}
      {objects.flatMap((o, idx) => o.points.map((p, j) => (
        <span key={`${idx}-${j}`} aria-hidden
          className={`absolute -translate-x-1/2 -translate-y-1/2 size-5 rounded-full border-2 border-white text-[12px] leading-4 text-center font-bold ${p.positive ? "bg-accent text-on-accent" : "bg-destructive text-white"}`}
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>{p.positive ? "+" : "−"}</span>
      )))}
    </div>
  );
}
