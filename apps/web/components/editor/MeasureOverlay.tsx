"use client";
import { worldToNdc, type CameraModel } from "@yourspace/core";
import { useEffect, useRef, useState } from "react";
import { modelById } from "@/lib/catalog";
import type { PlacedItem } from "@/lib/store";

type P = { x: number; y: number };
const TICK = 9;
const GAP = 8; // đường cách chân/cạnh món
const EDGE = 4; // MASTER: đường và chip cách mép ảnh ≥ 4

/**
 * Số đo trên món đang chọn (MASTER.md · Số đo trên món, theo IKEA Kreativ): đường `onImage` 1,5 có vạch 9 ở hai đầu —
 * "rộng" ngay dưới cạnh đáy gần máy, "cao" dọc cạnh đứng bên phải (chật thì bên trái) — kèm chip `accent`. Luôn ghi
 * kích thước THẬT, không theo thanh Cỡ. Độ sâu ở panel món. Ẩn với trình đọc màn hình.
 */
export function MeasureOverlay({ item, camera }: { item: PlacedItem; camera: CameraModel }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const model = modelById(item.productId);
  const lines = size && model ? measureLines(item, model.dimsM, model.baseYawRad, camera, size) : null;
  return (
    <div ref={ref} aria-hidden className="absolute inset-0 pointer-events-none">
      {lines && size && (
        <>
          <svg width={size.w} height={size.h} className="absolute inset-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            {lines.map((l) => (
              <g key={l.label} stroke="white" strokeWidth={1.5} strokeLinecap="round">
                <line x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} />
                {[l.a, l.b].map((p, i) => (
                  <line key={i} x1={p.x - l.n.x * TICK / 2} y1={p.y - l.n.y * TICK / 2} x2={p.x + l.n.x * TICK / 2} y2={p.y + l.n.y * TICK / 2} />
                ))}
              </g>
            ))}
          </svg>
          {lines.map((l) => (
            <span key={l.label} className="absolute -translate-x-1/2 -translate-y-1/2 bg-accent text-on-accent rounded-pill px-2 text-[12px] leading-4 font-semibold tabular-nums whitespace-nowrap"
              style={{ left: clamp((l.a.x + l.b.x) / 2, EDGE + 40, size.w - EDGE - 40), top: clamp((l.a.y + l.b.y) / 2, EDGE + 8, size.h - EDGE - 8) }}>
              {l.label}
            </span>
          ))}
        </>
      )}
    </div>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function measureLines(
  item: PlacedItem, dims: { widthM: number; depthM: number; heightM: number }, baseYawRad: number, cam: CameraModel, size: { w: number; h: number },
): { a: P; b: P; n: P; label: string }[] | null {
  const yaw = item.rotationYRad + baseYawRad;
  const W = dims.widthM * item.scale, D = dims.depthM * item.scale, H = dims.heightM * item.scale;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const px = (lx: number, y: number, lz: number): P | null => {
    const n = worldToNdc(item.x + lx * c + lz * s, y, item.z - lx * s + lz * c, cam);
    return n && { x: ((n.x + 1) / 2) * size.w, y: ((1 - n.y) / 2) * size.h };
  };
  // Cạnh đáy theo chiều rộng nằm thấp hơn trên ảnh = gần máy hơn.
  const edges = [D / 2, -D / 2].map((lz) => ({ lz, a: px(-W / 2, 0, lz), b: px(W / 2, 0, lz) }));
  const front = edges.filter((e) => e.a && e.b).sort((u, v) => v.a!.y + v.b!.y - (u.a!.y + u.b!.y))[0];
  if (!front) return null;
  const [l, r] = front.a!.x <= front.b!.x ? [front.a!, front.b!] : [front.b!, front.a!];
  const down = { x: 0, y: GAP };
  const width = { a: add(l, down), b: add(r, down), n: perp(l, r), label: `rộng ${Math.round(dims.widthM * 100)} cm` };
  // Cạnh đứng: bên phải nếu còn chỗ cho chip, không thì bên trái.
  const rightLx = front.a!.x <= front.b!.x ? W / 2 : -W / 2;
  const useRight = r.x + GAP + 90 <= size.w;
  const lx = useRight ? rightLx : -rightLx;
  const foot = px(lx, 0, front.lz), top = px(lx, H, front.lz);
  if (!foot || !top) return [width];
  const side = { x: useRight ? GAP : -GAP, y: 0 };
  return [width, { a: add(foot, side), b: add(top, side), n: perp(foot, top), label: `cao ${Math.round(dims.heightM * 100)} cm` }];
}

const add = (p: P, q: P): P => ({ x: p.x + q.x, y: p.y + q.y });
/** Pháp tuyến đơn vị của đoạn a→b trên màn hình (hướng vạch ở hai đầu). */
function perp(a: P, b: P): P {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}
