"use client";
import { useEditor } from "@/lib/store";

export const ROOM_HEIGHT_RANGE = { min: 0.8, max: 2.0 };

/** F1 ở mức phòng: đổi chiều cao máy → mọi món cùng to/nhỏ theo (không có tỷ lệ từng món — MASTER.md). */
export function RoomScalePopover({ onClose }: { onClose: () => void }) {
  const { setup, setCameraHeight } = useEditor();
  if (!setup) return null;
  return (
    <div className="absolute right-4 top-14 z-20 w-72 bg-card rounded-md2 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] flex flex-col gap-3">
      <p className="text-[15px] font-semibold">Đồ trông to hoặc nhỏ quá?</p>
      <p className="text-[13px] text-muted-foreground">Chỉnh độ cao máy lúc chụp. Mọi món đổi cỡ cùng lúc, kích thước thật giữ nguyên.</p>
      <input type="range" aria-label="Độ cao máy" min={ROOM_HEIGHT_RANGE.min} max={ROOM_HEIGHT_RANGE.max} step={0.05} value={setup.heightM}
        className="accent-foreground h-11" onChange={(e) => setCameraHeight(Number(e.target.value))} />
      <div className="flex items-center justify-between text-[13px] tabular">
        <span>Máy cao {setup.heightM.toFixed(2)} m</span>
        <button type="button" className="min-h-[44px] font-semibold" onClick={onClose}>Xong</button>
      </div>
    </div>
  );
}
