"use client";
import { ArrowClockwise, ArrowCounterClockwise, ArrowLeft, Ruler } from "@phosphor-icons/react";
import { canRedo, canUndo } from "@yourspace/core";
import Link from "next/link";
import { useState } from "react";
import { useEditor } from "@/lib/store";
import { RoomScalePopover } from "./RoomScalePopover";

const round = "size-11 inline-flex items-center justify-center rounded-pill bg-card disabled:opacity-40";

/** `historyLocked`: đang gửi xóa đồ — chặn hoàn tác/làm lại để kết quả xóa không đè lên một trạng thái khác. */
export function TopBar({ mode, onModeChange, historyLocked = false }: { mode: "place" | "erase"; onModeChange: (m: "place" | "erase") => void; historyLocked?: boolean }) {
  const undoable = useEditor((s) => !!s.history && canUndo(s.history));
  const redoable = useEditor((s) => !!s.history && canRedo(s.history));
  const { undo, redo } = useEditor.getState();
  const [scaleOpen, setScaleOpen] = useState(false);
  return (
    <div className="relative flex items-center justify-between gap-2 px-4 py-2 bg-background border-b border-border">
      <Link href="/thu-phong" aria-label="Về chọn ảnh" className={round}><ArrowLeft size={20} /></Link>
      <div className="inline-flex bg-muted rounded-pill p-1" role="tablist" aria-label="Chế độ">
        {(["place", "erase"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => onModeChange(m)}
            className={`min-h-[44px] px-4 rounded-pill text-[15px] font-semibold ${mode === m ? "bg-accent text-on-accent" : ""}`}>
            {m === "place" ? "Bày đồ" : "Xóa đồ"}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        <button type="button" aria-label="Hoàn tác" className={round} disabled={historyLocked || !undoable} onClick={undo}><ArrowCounterClockwise size={20} /></button>
        <button type="button" aria-label="Làm lại" className={round} disabled={historyLocked || !redoable} onClick={redo}><ArrowClockwise size={20} /></button>
        <button type="button" aria-label="Chỉnh cỡ phòng" aria-expanded={scaleOpen} className={round} onClick={() => setScaleOpen((o) => !o)}><Ruler size={20} /></button>
      </div>
      {scaleOpen && <RoomScalePopover onClose={() => setScaleOpen(false)} />}
    </div>
  );
}
