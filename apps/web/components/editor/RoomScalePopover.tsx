"use client";
import { useEditor } from "@/lib/store";

export const ROOM_HEIGHT_RANGE = { min: 0.8, max: 2.0 };

/**
 * F1 ở mức phòng (không có tỷ lệ từng món — MASTER.md): chỉnh tầm mắt (đường chân trời) và độ cao máy lúc chụp →
 * mọi món đổi cỡ và góc nhìn cùng lúc. Tầm mắt sai (vd chạm nhầm ở bước Thử phòng) là lý do hay gặp nhất khiến đồ to bất thường.
 */
export function RoomScalePopover({ onClose }: { onClose: () => void }) {
  const { setup, setCameraHeight, setHorizon } = useEditor();
  if (!setup) return null;
  return (
    <div className="absolute right-4 top-14 z-20 w-72 bg-card rounded-md2 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] flex flex-col gap-3">
      <p className="text-[15px] font-semibold">Đồ trông to hoặc nhỏ quá?</p>
      <p className="text-[13px] text-muted-foreground">Kéo tầm mắt tới chỗ các đường của tường và sàn hội tụ, rồi chỉnh độ cao máy. Mọi món đổi cỡ cùng lúc, kích thước thật giữ nguyên.</p>
      <label className="flex flex-col gap-1 text-[13px]">
        <span className="font-semibold">Tầm mắt (đường chân trời)</span>
        <input type="range" aria-label="Tầm mắt" min={-0.94} max={0.94} step={0.01} value={setup.horizonNdcY}
          className="accent-foreground h-11" onChange={(e) => setHorizon(Number(e.target.value))} />
      </label>
      <button type="button" className="min-h-[44px] rounded-pill border-[1.5px] border-foreground text-[15px] font-semibold"
        onClick={() => { useEditor.setState({ measure: { objectHeightM: 2.1, bottom: null }, notice: { id: Date.now(), text: "Chạm vào chân cửa đi (chỗ cửa chạm sàn)" } }); onClose(); }}>
        Đo theo cửa đi (cao 2,1 m)
      </button>
      <span className="text-[13px] font-semibold">Độ cao máy</span>
      <input type="range" aria-label="Độ cao máy" min={ROOM_HEIGHT_RANGE.min} max={ROOM_HEIGHT_RANGE.max} step={0.05} value={setup.heightM}
        className="accent-foreground h-11" onChange={(e) => setCameraHeight(Number(e.target.value))} />
      <div className="flex items-center justify-between text-[13px] tabular">
        <span>Máy cao {setup.heightM.toFixed(2)} m</span>
        <button type="button" className="min-h-[44px] font-semibold" onClick={onClose}>Xong</button>
      </div>
    </div>
  );
}
