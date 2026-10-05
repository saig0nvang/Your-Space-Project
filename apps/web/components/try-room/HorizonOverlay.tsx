"use client";
import { useRef } from "react";

/** Đường chân trời kéo dọc trên ảnh. `value` là NDC y (−1 đáy … +1 đỉnh), kẹp [−0,94; 0,94] như HorizonLine của spike. */
export function HorizonOverlay({ value, onChange }: { value: number; onChange: (ndcY: number) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const toNdc = (clientY: number) => {
    const r = boxRef.current!.getBoundingClientRect();
    return Math.min(0.94, Math.max(-0.94, 1 - ((clientY - r.top) / r.height) * 2));
  };
  const topPct = ((1 - value) / 2) * 100;
  return (
    <div
      ref={boxRef}
      className="absolute inset-0 touch-none cursor-ns-resize"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onChange(toNdc(e.clientY)); }}
      onPointerMove={(e) => { if (e.buttons) onChange(toNdc(e.clientY)); }}
    >
      <div className="absolute inset-x-0 border-t-2 border-dashed border-white shadow-[0_1px_2px_rgba(0,0,0,0.6)]" style={{ top: `${topPct}%` }}>
        <span className="absolute right-3 -top-9 bg-accent text-on-accent rounded-pill px-3 py-1 text-[12px] font-semibold">
          Kéo tới ngang tầm mắt
        </span>
      </div>
    </div>
  );
}
