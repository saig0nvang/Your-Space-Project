"use client";
import { Copy, ShoppingBag, Trash } from "@phosphor-icons/react";
import { MODELS, modelById } from "@/lib/catalog";
import { formatDimsCm, formatVND } from "@/lib/format";
import { ITEM_SCALE_RANGE, useEditor } from "@/lib/store";

const SNAPS = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
const snap = (deg: number) => SNAPS.find((a) => Math.abs(a - deg) <= 5) ?? deg;

export function ItemPanel({ onBuy }: { onBuy: (productIds: string[]) => void }) {
  const { history, selectedUid, select, rotateItem, scaleItem, beginGesture, endGesture, duplicateItem, removeItem, swapItem } = useEditor();
  const item = history?.present.items.find((i) => i.uid === selectedUid);
  const model = item ? modelById(item.productId) : undefined;
  if (!item || !model) return null;
  const deg = Math.round((item.rotationYRad * 180) / Math.PI);
  // "Đổi với" (MASTER.md · Panel món, như swappables của Kreativ): cùng loại, cùng phong cách đứng trước.
  const swaps = MODELS.filter((m) => m.category === model.category && m.id !== model.id)
    .sort((a, b) => Number(b.styleId === model.styleId) - Number(a.styleId === model.styleId));
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
      {swaps.length > 0 && (
        // Chưa có ảnh món → thẻ chữ (tên + giá) thay ô ảnh 56 của MASTER.md.
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[13px] font-semibold">Đổi với</span>
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {swaps.map((m) => (
              <li key={m.id} className="shrink-0">
                <button type="button" onClick={() => swapItem(item.uid, m.id)}
                  className="w-[120px] min-h-[56px] text-left rounded-md2 bg-muted px-3 py-2 flex flex-col justify-between">
                  <span className="text-[13px] leading-4 font-semibold line-clamp-2">{m.name}</span>
                  <span className="text-[12px] font-semibold text-accent-text tabular">{formatVND(m.priceVND)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <label className="flex items-center gap-3 text-[13px] font-semibold">
        <span className="w-12">Xoay</span>
        <input type="range" min={-180} max={180} step={1} value={deg} className="flex-1 accent-foreground h-11"
          onPointerDown={beginGesture}
          onPointerUp={(e) => { rotateItem(item.uid, (snap(Number(e.currentTarget.value)) * Math.PI) / 180); endGesture(); }}
          onKeyUp={(e) => { rotateItem(item.uid, (snap(Number(e.currentTarget.value)) * Math.PI) / 180); endGesture(); }}
          onKeyDown={(e) => { if (!e.repeat) beginGesture(); }}
          onChange={(e) => rotateItem(item.uid, (Number(e.target.value) * Math.PI) / 180)} />
        <span className="w-12 text-right tabular">{deg}°</span>
      </label>
      <label className="flex items-center gap-3 text-[13px] font-semibold">
        <span className="w-12">Cỡ</span>
        <input type="range" min={ITEM_SCALE_RANGE.min} max={ITEM_SCALE_RANGE.max} step={0.01} value={item.scale}
          className="flex-1 accent-foreground h-11"
          onPointerDown={beginGesture} onPointerUp={endGesture}
          onKeyDown={(e) => { if (!e.repeat) beginGesture(); }} onKeyUp={endGesture}
          onChange={(e) => scaleItem(item.uid, Number(e.target.value))} />
        <span className="w-12 text-right tabular">{Math.round(item.scale * 100)}%</span>
      </label>
      {item.scale !== 1 && (
        <p className="text-[12px] text-muted-foreground">Đang hiển thị {Math.round(item.scale * 100)}% — kích thước thật vẫn là số đo ở trên.</p>
      )}
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
