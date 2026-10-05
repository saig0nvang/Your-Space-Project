"use client";
import { prepareEraseMask, type Mask } from "@yourspace/core";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { decodePoints, encodeImage, onSamProgress, warmupSam, type SamPoint } from "@/lib/ai/samClient";
import { eraseWithLama } from "@/lib/erase";
import { useEditor } from "@/lib/store";

export type EraseObject = { points: SamPoint[]; mask: Mask | null };

const ERROR_TEXT: Record<string, string> = {
  BudgetExceeded: "Hết lượt xóa thử trong giờ này",
  RateLimited: "Dịch vụ đang bận, thử lại sau ít phút",
  Timeout: "Xóa quá lâu, thử lại với vùng nhỏ hơn",
};

export function useEraseSession(active: boolean) {
  const { history, photo, applyErase, notify } = useEditor();
  const workingUrl = history?.present.workingUrl ?? null;
  const [status, setStatus] = useState<"loading" | "encoding" | "ready" | "erasing">("loading");
  const [progress, setProgress] = useState<number | null>(null);
  const [objects, setObjects] = useState<EraseObject[]>([]);
  const [mode, setMode] = useState<"add" | "remove">("add");

  useEffect(() => onSamProgress((p) => setProgress(p.total ? p.loaded / p.total : null)), []);

  useEffect(() => {
    if (!active || !workingUrl) return;
    let cancelled = false;
    (async () => {
      setStatus("loading");
      await warmupSam();
      if (cancelled) return;
      setProgress(null);
      setStatus("encoding");
      await encodeImage(workingUrl); // chọn trên đúng ảnh người dùng đang thấy
      if (!cancelled) { setObjects([]); setStatus("ready"); }
    })().catch(() => { if (!cancelled) notify("Không tải được công cụ chọn đồ · thử tải lại trang"); });
    return () => { cancelled = true; };
  }, [active, workingUrl, notify]);

  const addPoint = useCallback(async (p: { x: number; y: number }) => {
    if (status !== "ready") return;
    const positive = mode === "add";
    const list = objects.length === 0 ? [{ points: [], mask: null }] : objects;
    const idx = list.length - 1;
    const current = list[idx]!;
    if (!positive && current.points.length === 0) return; // điểm Bớt cần một món đang chọn
    const points = [...current.points, { ...p, positive }];
    const mask = await decodePoints(points);
    setObjects([...list.slice(0, idx), { points, mask }]);
  }, [status, mode, objects]);

  const nextObject = () => setObjects((o) => (o.length && o[o.length - 1]!.mask ? [...o, { points: [], mask: null }] : o));
  const removeObject = (i: number) => setObjects((o) => o.filter((_, k) => k !== i));

  const erase = useCallback(async () => {
    const masks = objects.flatMap((o) => (o.mask ? [o.mask] : []));
    if (!photo || masks.length === 0) return;
    setStatus("erasing");
    const union = prepareEraseMask(masks, history?.present.eraseMask ?? null);
    const r = await eraseWithLama(photo.url, union);
    if (!r.ok) {
      notify(ERROR_TEXT[r.error.kind] ?? "Xóa chưa được · thử lại hoặc chọn vùng nhỏ hơn");
      setStatus("ready");
      return;
    }
    applyErase(r.value, union); // workingUrl đổi → depth và SAM tự chạy lại
    notify("Đã xóa · giữ nút Trước để so sánh");
  }, [objects, photo, history, applyErase, notify]);

  return { status, progress, objects, mode, setMode, addPoint, nextObject, removeObject, erase };
}

export function EraseTool({ session, onHoldOriginal }: { session: ReturnType<typeof useEraseSession>; onHoldOriginal: (hold: boolean) => void }) {
  const { status, progress, objects, mode, setMode, nextObject, removeObject, erase } = session;
  const selected = objects.filter((o) => o.mask).length;
  if (status === "loading" || status === "encoding") {
    return (
      <p className="text-[15px] text-muted-foreground" role="status">
        {status === "loading" ? `Đang tải công cụ chọn đồ${progress !== null ? ` ${Math.round(progress * 100)}%` : "…"}` : "Đang chuẩn bị ảnh để chạm chọn…"}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] leading-5">Chạm vào món đồ cũ muốn xóa. Vùng trắng là vùng sẽ xóa — chạm thêm để sửa.</p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex bg-muted rounded-pill p-1">
          {(["add", "remove"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
              className={`min-h-[40px] px-4 rounded-pill text-[15px] font-semibold ${mode === m ? "bg-accent text-on-accent" : ""}`}>
              {m === "add" ? "Thêm" : "Bớt"}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={nextObject} disabled={!objects.length || !objects[objects.length - 1]!.mask}>Chọn món khác</Button>
        <button type="button" className="min-h-[44px] px-3 rounded-pill bg-muted text-[15px] font-semibold"
          onPointerDown={() => onHoldOriginal(true)} onPointerUp={() => onHoldOriginal(false)} onPointerLeave={() => onHoldOriginal(false)}>
          Trước
        </button>
      </div>
      {objects.length > 0 && (
        <ul className="flex gap-2 flex-wrap">
          {objects.map((o, i) => o.mask && (
            <li key={i}><button type="button" onClick={() => removeObject(i)} className="min-h-[36px] px-3 rounded-pill bg-muted text-[13px] font-semibold">Món {i + 1} ×</button></li>
          ))}
        </ul>
      )}
      <Button full onClick={() => void erase()} disabled={selected === 0 || status === "erasing"}>
        {status === "erasing" ? "Đang xóa…" : selected ? `Xóa ${selected} món` : "Chọn món để xóa"}
      </Button>
      <p className="text-[12px] text-muted-foreground">Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó. Kết quả chưa ưng: bấm Hoàn tác hoặc chọn vùng nhỏ hơn.</p>
    </div>
  );
}
