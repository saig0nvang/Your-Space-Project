"use client";
import { prepareEraseMask, type Mask } from "@yourspace/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { decodePoints, encodeImage, onSamProgress, warmupSam, type SamPoint } from "@/lib/ai/samClient";
import { eraseWithLama } from "@/lib/erase";
import { cameraOf, useEditor } from "@/lib/store";

export type EraseObject = { points: SamPoint[]; mask: Mask | null };

const ERROR_TEXT: Record<string, string> = {
  BudgetExceeded: "Hết lượt xóa thử trong giờ này",
  RateLimited: "Dịch vụ đang bận, thử lại sau ít phút",
  Timeout: "Xóa quá lâu, thử lại với vùng nhỏ hơn",
};

export function useEraseSession(active: boolean) {
  // Selector hẹp: không render lại khi kéo món (history.present.items đổi liên tục).
  const workingUrl = useEditor((s) => s.history?.present.workingUrl ?? null);
  const { applyErase, notify } = useEditor.getState();
  const [status, setStatus] = useState<"loading" | "encoding" | "ready" | "erasing">("loading");
  const [progress, setProgress] = useState<number | null>(null);
  const [objects, setObjects] = useState<EraseObject[]>([]);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [wasActive, setWasActive] = useState(active);
  const decoding = useRef(false); // chặn chạm chồng lên khi SAM còn đang giải mã điểm trước

  // Rời chế độ Xóa đồ → dọn lựa chọn ngay trong lúc render (mẫu "adjusting state" của React, không qua
  // effect) để không bao giờ thấy lại món cũ, dù chỉ một khung hình, khi vào lại.
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) { setObjects([]); setMode("add"); }
  }

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
    if (status !== "ready" || decoding.current) return; // bỏ chạm khi chưa sẵn sàng hoặc đang giải mã điểm trước
    const positive = mode === "add";
    const list = objects.length === 0 ? [{ points: [], mask: null }] : objects;
    const idx = list.length - 1;
    const current = list[idx]!;
    if (!positive && current.points.length === 0) return; // điểm Bớt cần một món đang chọn
    const points = [...current.points, { ...p, positive }];
    decoding.current = true;
    try {
      const mask = await decodePoints(points);
      setObjects([...list.slice(0, idx), { points, mask }]);
    } finally {
      decoding.current = false;
    }
  }, [status, mode, objects]);

  const nextObject = () => setObjects((o) => (o.length && o[o.length - 1]!.mask ? [...o, { points: [], mask: null }] : o));
  const removeObject = (i: number) => setObjects((o) => o.filter((_, k) => k !== i));

  const erase = useCallback(async () => {
    const masks = objects.flatMap((o) => (o.mask ? [o.mask] : []));
    const { photo, history, setup, depth } = useEditor.getState();
    if (!photo || masks.length === 0) return;
    setStatus("erasing");
    try {
      const union = prepareEraseMask(masks, history?.present.eraseMask ?? null);
      // Depth của đúng ảnh đang thấy (sàn đã xóa trước đó vẫn là sàn) → phần sàn được lấp trong ảnh nắn thẳng.
      const floor = setup && depth.disparity && depth.forUrl === history?.present.workingUrl
        ? { camera: cameraOf(setup, photo.width / photo.height), disparity: depth.disparity } : null;
      const r = await eraseWithLama(photo.url, union, floor);
      if (!r.ok) {
        // VendorError luôn có message đã được server soạn sẵn cho người dùng (xem inpaintHandler.ts/route.ts) —
        // gồm cả thông báo vận hành "chưa có mô hình trên máy chủ" (503). Lỗi khác (Budget/RateLimited/Timeout/
        // LowConfidence) mới dùng câu chung.
        notify(r.error.kind === "VendorError" ? r.error.message : ERROR_TEXT[r.error.kind] ?? "Xóa chưa được · thử lại hoặc chọn vùng nhỏ hơn");
        setStatus("ready");
        return;
      }
      applyErase(r.value, union); // workingUrl đổi → depth và SAM tự chạy lại
      notify("Đã xóa · giữ nút Trước để so sánh");
    } catch {
      // Lỗi bất ngờ khi cắt ảnh/dán lại (ví dụ tải ảnh hoặc toBlob thất bại) — ảnh giữ nguyên.
      notify("Xóa chưa được · thử lại hoặc chọn vùng nhỏ hơn");
      setStatus("ready");
    }
  }, [objects, applyErase, notify]);

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
              className={`min-h-[44px] px-4 rounded-pill text-[15px] font-semibold ${mode === m ? "bg-accent text-on-accent" : ""}`}>
              {m === "add" ? "Thêm" : "Bớt"}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={nextObject} disabled={!objects.length || !objects[objects.length - 1]!.mask}>Chọn món khác</Button>
        <button type="button" className="min-h-[44px] px-3 rounded-pill bg-muted text-[15px] font-semibold select-none touch-none"
          onPointerDown={() => onHoldOriginal(true)} onPointerUp={() => onHoldOriginal(false)} onPointerLeave={() => onHoldOriginal(false)}
          onPointerCancel={() => onHoldOriginal(false)} onContextMenu={(e) => e.preventDefault()}>
          Trước
        </button>
      </div>
      {objects.length > 0 && (
        <ul className="flex gap-2 flex-wrap">
          {objects.map((o, i) => o.mask && (
            <li key={i}><button type="button" onClick={() => removeObject(i)} className="min-h-[44px] px-3 rounded-pill bg-muted text-[13px] font-semibold">Món {i + 1} ×</button></li>
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
