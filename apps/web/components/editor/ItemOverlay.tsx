"use client";
import { Copy, FlipHorizontal, ShoppingBag, Trash } from "@phosphor-icons/react";
import { worldToNdc, type CameraModel } from "@yourspace/core";
import { useLayoutEffect, useRef, useState } from "react";
import { modelById } from "@/lib/catalog";
import { useEditor, type PlacedItem } from "@/lib/store";
import { RotationRuler } from "./RotationRuler";

type P = { x: number; y: number };
const TICK = 9;
const GAP = 8; // đường cách chân/cạnh món
const EDGE = 4; // MASTER: đường và chip cách mép ảnh ≥ 4

const BAR_W = 250; // 4 tác vụ × 58 + vạch + đệm 8 hai bên
const BAR_H = 52;

/**
 * Lớp trên món đang chọn (MASTER.md, theo IKEA Kreativ):
 * - Số đo: đường `onImage` 1,5 có vạch 9 ở hai đầu — "rộng" ngay dưới cạnh đáy gần máy, "cao" dọc cạnh đứng bên phải
 *   (chật thì bên trái) — kèm chip `accent`. Luôn ghi kích thước THẬT, không theo thanh Cỡ. Ẩn với trình đọc màn hình.
 * - Thanh tác vụ: Mua | Lật · Nhân bản · Bỏ, nổi ngay trên đỉnh món, cách mép ảnh ≥ 8; món cao chạm mép trên thì ghim
 *   ở mép trên, đè lên đầu món (không bao giờ dưới chân — chỗ của số đo). Ẩn khi đang kéo. ("Đổi món" là hàng Đổi với
 *   ở panel; "Hợp với" chưa có định nghĩa hành vi.)
 */
export function ItemOverlay({ item, camera, dragging, onBuy }: { item: PlacedItem; camera: CameraModel; dragging: boolean; onBuy: (ids: string[]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  // Cỡ ban đầu đo ngay (layout effect) — ResizeObserver chỉ báo trong bước vẽ, tab bị che/không vẽ khung thì không
  // bao giờ báo và lớp này trống; RO chỉ để theo khi cỡ đổi.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const model = modelById(item.productId);
  const lines = size && model ? measureLines(item, model.dimsM, model.baseYawRad, camera, size) : null;
  const top = size && model ? topCenter(item, model.dimsM, model.baseYawRad, camera, size) : null;
  const { flipItem, duplicateItem, removeItem } = useEditor.getState();
  const btn = "w-[58px] h-[52px] flex flex-col items-center justify-center text-[11px] font-semibold";
  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none">
      {top && size && model && !dragging && (
        <div role="toolbar" aria-label={`Tác vụ cho ${model.name}`} onPointerDown={(e) => e.stopPropagation()} // không để chạm thanh bị hiểu là chạm ảnh (bỏ chọn)
          className="absolute -translate-x-1/2 pointer-events-auto inline-flex items-stretch bg-accent text-on-accent rounded-pill px-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
          style={{ left: clamp(top.x, 8 + BAR_W / 2, size.w - 8 - BAR_W / 2), top: Math.max(8, top.y - 12 - BAR_H) }}>
          <button type="button" className={btn} onClick={() => onBuy([model.id])}><ShoppingBag size={20} />Mua</button>
          <span className="w-px my-3 bg-on-accent/25" aria-hidden />
          <button type="button" className={btn} aria-pressed={!!item.flipped} onClick={() => flipItem(item.uid)}><FlipHorizontal size={20} />Lật</button>
          <button type="button" className={btn} onClick={() => duplicateItem(item.uid)}><Copy size={20} />Nhân bản</button>
          <button type="button" className={`${btn} text-destructive-on-accent`} onClick={() => removeItem(item.uid)}><Trash size={20} />Bỏ</button>
        </div>
      )}
      {size && model && !dragging && <RotationRuler item={item} name={model.name} height={Math.min(260, size.h - 32)} />}
      {lines && size && (
        <>
          <svg aria-hidden width={size.w} height={size.h} className="absolute inset-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
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
            <span key={l.label} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2 bg-accent text-on-accent rounded-pill px-2 text-[12px] leading-4 font-semibold tabular-nums whitespace-nowrap"
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

/** Điểm giữa-trên của hộp món trên ảnh (đỉnh cao nhất), để đặt thanh tác vụ. */
function topCenter(
  item: PlacedItem, dims: { widthM: number; depthM: number; heightM: number }, baseYawRad: number, cam: CameraModel, size: { w: number; h: number },
): P | null {
  const yaw = item.rotationYRad + baseYawRad;
  const W = dims.widthM * item.scale, D = dims.depthM * item.scale, H = dims.heightM * item.scale;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const pts: P[] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const y of [0, H]) {
    const n = worldToNdc(item.x + (a * W / 2) * c + (b * D / 2) * s, y, item.z - (a * W / 2) * s + (b * D / 2) * c, cam);
    if (n) pts.push({ x: ((n.x + 1) / 2) * size.w, y: ((1 - n.y) / 2) * size.h });
  }
  if (!pts.length) return null;
  const xs = pts.map((p) => p.x);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: Math.min(...pts.map((p) => p.y)) };
}

const add = (p: P, q: P): P => ({ x: p.x + q.x, y: p.y + q.y });
/** Pháp tuyến đơn vị của đoạn a→b trên màn hình (hướng vạch ở hai đầu). */
function perp(a: P, b: P): P {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}
