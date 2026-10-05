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

  const aspect = photo ? photo.width / photo.height : null;
  const horizonNdcY = setup?.horizonNdcY ?? null;
  const fovYRad = setup?.fovYRad ?? null;

  // Độ sâu che khuất không phụ thuộc heightM: floorViewZ = heightM · f(ndc, pitch, fov), và pitchRad được giải
  // từ horizonNdcY + fovYRad độc lập với heightM (solveCameraFromHorizon) nên f không đổi theo heightM. fit
  // (1/z = a·d + b) vì vậy tỉ lệ 1/heightM, còn phép so sánh "z ≥ zf·(1 − tol)" trong buildOccluderDepth là một
  // TỈ SỐ nên bất biến theo heightM (cả hai vế cùng nhân heightM). Kết quả: depth tính ở heightM giả định = 1 m
  // dùng được cho MỌI heightM thật — chỉ cần nhân thêm heightM thật lúc dựng cảnh (RoomScene/OccluderQuad), khỏi
  // chạy lại fitDepthToFloor + buildOccluderDepth (toàn bộ pixel) mỗi lần kéo thanh "Chỉnh cỡ phòng".
  const occluder = useMemo(() => {
    if (aspect === null || horizonNdcY === null || fovYRad === null) return null;
    if (depth.status !== "ready" || !depth.disparity || depth.forUrl !== url) return null;
    const camera1 = cameraOf({ horizonNdcY, heightM: 1, fovYRad }, aspect);
    const fit = fitDepthToFloor(depth.disparity, camera1);
    if (fit.confidence < MIN_CONFIDENCE) return null;
    return { data: buildOccluderDepth(depth.disparity, fit, camera1), width: depth.disparity.width, height: depth.disparity.height };
  }, [aspect, horizonNdcY, fovYRad, depth, url]);

  // F4: depth chạy được nhưng không khớp nổi mặt sàn (ảnh không thấy sàn, cận cảnh…).
  useEffect(() => {
    if (depth.status === "ready" && occluder === null) notify("Ảnh khó phân tích chiều sâu · đồ sẽ luôn nằm trên");
  }, [depth.status, occluder, notify]);

  return { occluder, status: depth.status, progress };
}
