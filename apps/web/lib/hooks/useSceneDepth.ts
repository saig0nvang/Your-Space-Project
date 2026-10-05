"use client";
import { buildOccluderDepth, fitDepthToFloor } from "@yourspace/core";
import { useEffect, useMemo, useState } from "react";
import { getDisparity, onDepthProgress, warmupDepth } from "@/lib/ai/depthClient";
import { cameraOf, useEditor } from "@/lib/store";

const MIN_CONFIDENCE = 0.3;

/** Chạy depth cho ảnh đang sửa (lại sau mỗi lần xóa), khớp theo mặt sàn, dựng ảnh độ sâu che khuất. */
export function useSceneDepth() {
  const { photo, setup, history, depth, setDepth, notify } = useEditor();
  const [progress, setProgress] = useState<number | null>(null);
  const url = history?.present.workingUrl ?? null;

  useEffect(() => onDepthProgress((p) => setProgress(p.total ? p.loaded / p.total : null)), []);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    (async () => {
      setDepth({ status: "running", forUrl: url, disparity: null });
      await warmupDepth();
      const r = await getDisparity(url);
      if (cancelled) return;
      setProgress(null);
      if (!r.ok) {
        setDepth({ status: "failed", forUrl: url, disparity: null });
        notify("Chưa tính được chiều sâu · đồ sẽ luôn nằm trên");
        return;
      }
      setDepth({ status: "ready", forUrl: url, disparity: r.value });
    })();
    return () => { cancelled = true; };
  }, [url, setDepth, notify]);

  const occluder = useMemo(() => {
    if (!photo || !setup || depth.status !== "ready" || !depth.disparity || depth.forUrl !== url) return null;
    const camera = cameraOf(setup, photo.width / photo.height);
    const fit = fitDepthToFloor(depth.disparity, camera);
    if (fit.confidence < MIN_CONFIDENCE) return null;
    return { data: buildOccluderDepth(depth.disparity, fit, camera), width: depth.disparity.width, height: depth.disparity.height };
  }, [photo, setup, depth, url]);

  // F4: depth chạy được nhưng không khớp nổi mặt sàn (ảnh không thấy sàn, cận cảnh…).
  useEffect(() => {
    if (depth.status === "ready" && occluder === null) notify("Ảnh khó phân tích chiều sâu · đồ sẽ luôn nằm trên");
  }, [depth.status, occluder, notify]);

  return { occluder, status: depth.status, progress };
}
