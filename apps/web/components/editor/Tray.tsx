"use client";
import type { StyleId } from "@yourspace/core";
import { CATEGORY_LABEL, STYLES, modelsOfStyle } from "@/lib/catalog";
import { formatVND } from "@/lib/format";
import { autoPlace } from "@/lib/autoPlace";
import { useEditor } from "@/lib/store";

/** Khay đồ lọc theo phong cách. Chạm một món là tự đặt vào chỗ sàn trống; chưa có depth thì "cầm" rồi chạm lên sàn để đặt. */
export function Tray() {
  const { styleId, setStyle, armedProductId, arm } = useEditor();
  const items = modelsOfStyle(styleId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Phong cách">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === styleId}
            onClick={() => setStyle(s.id as StyleId)}
            className={`shrink-0 min-h-[44px] px-4 rounded-pill text-[15px] font-semibold ${s.id === styleId ? "bg-accent text-on-accent" : "bg-muted"}`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {items.map((m) => {
          const armed = m.id === armedProductId;
          return (
            <li key={m.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={armed}
                onClick={() => armed ? arm(null) : autoPlace(m.id) || arm(m.id)}
                className={`w-[132px] min-h-[88px] text-left rounded-md2 p-3 flex flex-col justify-between ${armed ? "bg-accent text-on-accent" : "bg-card border border-border"}`}
              >
                <span className="text-[12px] leading-4 opacity-80">{CATEGORY_LABEL[m.category]}</span>
                <span className="text-[15px] leading-5 font-semibold">{m.name}</span>
                <span className={`text-[13px] font-semibold tabular ${armed ? "" : "text-accent-text"}`}>{formatVND(m.priceVND)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[13px] text-muted-foreground min-h-[18px]">
        {armedProductId ? "Chạm lên sàn trong ảnh để đặt món." : "Chọn một món để đặt vào chỗ sàn trống, rồi kéo để chỉnh."}
      </p>
    </div>
  );
}
