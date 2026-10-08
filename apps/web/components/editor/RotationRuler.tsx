"use client";
import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useEditor, type PlacedItem } from "@/lib/store";

const PX_PER_DEG = 3;
const SNAP_EVERY = 45; // 0°, ±45°, ±90°…
const SNAP_WITHIN = 5;
const KEY_STEP = 15;

export const wrap = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;
/** Thả tay trong ±5° quanh 0°, ±45°, ±90°… thì hít vào góc đó (dùng chung cho thước và vặn hai ngón). */
export const snapped = (deg: number) => {
  const s = Math.round(deg / SNAP_EVERY) * SNAP_EVERY;
  return Math.abs(s - deg) <= SNAP_WITHIN ? wrap(s) : deg;
};

/**
 * Thước xoay món (MASTER.md · Thước xoay món, theo IKEA Kreativ): thước dọc rộng 44 ở mép trái ảnh; kéo lên/xuống để
 * xoay (3 px mỗi độ), vạch giữa đứng yên; vạch ngắn mỗi 5°, vạch dài mỗi 15° kèm số; góc hiện tại là viên thuốc
 * `accent` cạnh vạch giữa. Đi qua 0°, ±45°, ±90° thì rung nhẹ; thả tay trong ±5° quanh các góc đó thì hít vào. Mỗi
 * lần thả là một bước hoàn tác. Phím ↑/↓ xoay mỗi nấc 15°. Chưa có xoay bằng hai ngón trên ảnh.
 */
export function RotationRuler({ item, name, height }: { item: PlacedItem; name: string; height: number }) {
  const { rotateItem, beginGesture, endGesture } = useEditor.getState();
  // `last`: góc vừa đặt — thả tay dùng giá trị này, không dùng props (chưa render lại sau lần di cuối thì props còn cũ).
  const start = useRef<{ y: number; deg: number; last: number } | null>(null);
  const deg = Math.round((item.rotationYRad * 180) / Math.PI);
  const set = (d: number) => rotateItem(item.uid, (wrap(d) * Math.PI) / 180);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.stopPropagation(); // không để chạm thước bị hiểu là chạm ảnh (bỏ chọn)
    e.currentTarget.setPointerCapture(e.pointerId);
    const d = (item.rotationYRad * 180) / Math.PI;
    start.current = { y: e.clientY, deg: d, last: d };
    beginGesture();
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    const next = s.deg + (s.y - e.clientY) / PX_PER_DEG; // kéo lên = tăng góc
    if (Math.floor(s.last / SNAP_EVERY) !== Math.floor(next / SNAP_EVERY)) navigator.vibrate?.(8);
    s.last = next;
    set(next);
  }
  function onPointerUp() {
    const s = start.current;
    if (!s) return;
    start.current = null;
    set(snapped(wrap(s.last)));
    endGesture();
  }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === "ArrowUp" ? KEY_STEP : e.key === "ArrowDown" ? -KEY_STEP : 0;
    if (!step) return;
    e.preventDefault();
    beginGesture();
    set(Math.round((deg + step) / KEY_STEP) * KEY_STEP);
    endGesture();
  }

  // Vạch trong khung nhìn: góc d nằm ở y = giữa − (d − deg)·3 (góc lớn hơn ở phía trên).
  const half = height / 2;
  const span = Math.ceil(half / PX_PER_DEG);
  const ticks: { d: number; y: number }[] = [];
  for (let d = Math.ceil((deg - span) / 5) * 5; d <= deg + span; d += 5) ticks.push({ d, y: half - (d - deg) * PX_PER_DEG });
  return (
    <div role="slider" tabIndex={0} aria-label={`Xoay ${name}`} aria-orientation="vertical" aria-valuemin={-180} aria-valuemax={180}
      aria-valuenow={deg} aria-valuetext={`${deg}°`}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown}
      className="absolute left-6 w-11 bg-card rounded-pill shadow-[0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto touch-none cursor-ns-resize focus-visible:outline-2 focus-visible:outline-ring"
      style={{ height, top: `calc(50% - ${half}px)` }}>
      <svg aria-hidden width={44} height={height} className="absolute inset-0">
        {ticks.map(({ d, y }) => {
          const long = d % 15 === 0;
          return (
            <g key={d}>
              <line x1={long ? 4 : 8} x2={long ? 18 : 14} y1={y} y2={y} strokeWidth={long ? 1.5 : 1} className={long ? "stroke-foreground" : "stroke-border-strong"} />
              {long && d !== deg && <text x={22} y={y + 3.5} className="fill-muted-foreground text-[11px] tabular-nums">{wrap(d)}</text>}
            </g>
          );
        })}
      </svg>
      <span aria-hidden className="absolute left-1 right-1 -translate-y-1/2 bg-accent text-on-accent rounded-pill text-[11px] leading-5 font-semibold text-center tabular-nums" style={{ top: half }}>
        {deg}°
      </span>
    </div>
  );
}
