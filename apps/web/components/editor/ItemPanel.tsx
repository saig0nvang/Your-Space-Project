"use client";
import { Copy, ShoppingBag, Trash } from "@phosphor-icons/react";
import { modelById } from "@/lib/catalog";
import { formatDimsCm, formatVND } from "@/lib/format";
import { useEditor } from "@/lib/store";

const SNAPS = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
const snap = (deg: number) => SNAPS.find((a) => Math.abs(a - deg) <= 5) ?? deg;

export function ItemPanel({ onBuy }: { onBuy: (productIds: string[]) => void }) {
  const { history, selectedUid, select, rotateItem, beginGesture, endGesture, duplicateItem, removeItem } = useEditor();
  const item = history?.present.items.find((i) => i.uid === selectedUid);
  const model = item ? modelById(item.productId) : undefined;
  if (!item || !model) return null;
  const deg = Math.round((item.rotationYRad * 180) / Math.PI);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[17px] leading-[22px] font-semibold">{model.name}</p>
          <p className="text-[15px] font-semibold text-accent-text tabular">{formatVND(model.priceVND)}</p>
          <p className="text-[13px] text-muted-foreground tabular">{formatDimsCm(model.dimsM)}</p>
        </div>
        <button type="button" className="min-h-[44px] px-3 font-semibold" onClick={() => select(null)}>Xong</button>
      </div>
      <label className="flex items-center gap-3 text-[13px] font-semibold">
        <span className="w-12">Xoay</span>
        <input type="range" min={-180} max={180} step={1} value={deg} className="flex-1 accent-foreground h-11"
          onPointerDown={beginGesture}
          onPointerUp={(e) => { rotateItem(item.uid, (snap(Number(e.currentTarget.value)) * Math.PI) / 180); endGesture(); }}
          onKeyUp={endGesture} onKeyDown={beginGesture}
          onChange={(e) => rotateItem(item.uid, (Number(e.target.value) * Math.PI) / 180)} />
        <span className="w-12 text-right tabular">{deg}°</span>
      </label>
      <div className="inline-flex self-start items-stretch bg-accent text-on-accent rounded-pill px-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
        <button type="button" className="w-[58px] h-[52px] flex flex-col items-center justify-center text-[11px] font-semibold" onClick={() => onBuy([model.id])}>
          <ShoppingBag size={20} />Mua
        </button>
        <span className="w-px my-3 bg-on-accent/25" aria-hidden />
        <button type="button" className="w-[58px] h-[52px] flex flex-col items-center justify-center text-[11px] font-semibold" onClick={() => duplicateItem(item.uid)}>
          <Copy size={20} />Nhân bản
        </button>
        <button type="button" className="w-[58px] h-[52px] flex flex-col items-center justify-center text-[11px] font-semibold text-destructive-on-accent" onClick={() => removeItem(item.uid)}>
          <Trash size={20} />Bỏ
        </button>
      </div>
    </div>
  );
}
