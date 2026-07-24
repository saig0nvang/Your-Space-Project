"use client";

import { useState } from "react";
import { calibrate, placeOnFloor, type Calibration, type Transform } from "@yourspace/core";
import { browserDepth } from "@/lib/depth/browserDepth";
import { GOLDEN_ROOMS, SPIKE_SOFA } from "@/lib/rooms";
import { RoomCanvas } from "@/components/scene/RoomCanvas";

// SPIKE (decision-gate D4): đặt 1 sofa vào ảnh phòng thật, đánh giá bằng MẮT.
// Chạy: `pnpm dev` → /spike

export default function SpikePage() {
  const [room, setRoom] = useState<string>(GOLDEN_ROOMS[0] ?? "");
  const [asDisparity, setAsDisparity] = useState(true);
  const [ndcY, setNdcY] = useState(-0.4);
  const [pitchOverride, setPitchOverride] = useState<number | null>(null);
  const [status, setStatus] = useState("Chọn ảnh rồi bấm Chạy depth.");
  const [baseCalib, setBaseCalib] = useState<Calibration | null>(null);

  // Áp override pitch (nếu bật) lên calibration gốc.
  const calib: Calibration | null =
    baseCalib && pitchOverride !== null
      ? { ...baseCalib, camera: { ...baseCalib.camera, pitchRad: (pitchOverride * Math.PI) / 180 } }
      : baseCalib;

  const transform: Transform | null = calib
    ? placeOnFloor({ x: 0, y: ndcY }, calib, SPIKE_SOFA.dims)
    : null;

  const dist = transform
    ? Math.hypot(transform.position.x, transform.position.z, (calib?.camera.heightM ?? 1.4))
    : 0;

  async function run() {
    setBaseCalib(null);
    setStatus("Đang chạy Depth Anything V2 trong trình duyệt (lần đầu tải model)...");
    try {
      const depth = await browserDepth(room, asDisparity);
      const c = calibrate(depth, { assumedCameraHeightM: 1.4 });
      setBaseCalib(c);
      setStatus(
        `Depth OK (${depth.width}×${depth.height}). confidence=${c.confidence.toFixed(2)}, ` +
          `pitch tự động=${((c.camera.pitchRad * 180) / Math.PI).toFixed(1)}°`,
      );
    } catch (e) {
      setStatus("Lỗi: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>YourSpace — Spike depth-placement</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Decision-gate D4: đặt sofa vào ảnh phòng thật → chấm believability trên {GOLDEN_ROOMS.length} ảnh.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          {GOLDEN_ROOMS.map((r, i) => (
            <option key={r} value={r}>
              room-{String(i + 1).padStart(2, "0")}
            </option>
          ))}
        </select>
        <label title="Depth Anything trả disparity (gần=lớn); bật để đổi sang khoảng cách">
          <input type="checkbox" checked={asDisparity} onChange={(e) => setAsDisparity(e.target.checked)} />{" "}
          disparity→distance
        </label>
        <button onClick={run}>Chạy depth</button>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <label>
          đặt Y:{" "}
          <input type="range" min={-0.9} max={0.2} step={0.05} value={ndcY}
            onChange={(e) => setNdcY(parseFloat(e.target.value))} /> {ndcY.toFixed(2)}
        </label>
        <label>
          <input type="checkbox" checked={pitchOverride !== null}
            onChange={(e) => setPitchOverride(e.target.checked ? 15 : null)} /> override pitch
        </label>
        {pitchOverride !== null && (
          <label>
            pitch:{" "}
            <input type="range" min={-10} max={45} step={1} value={pitchOverride}
              onChange={(e) => setPitchOverride(parseFloat(e.target.value))} /> {pitchOverride}°
          </label>
        )}
      </div>

      <p style={{ fontSize: 13, color: "#444", marginBottom: 4 }}>{status}</p>
      {transform && (
        <p style={{ fontSize: 12, color: dist > 15 ? "#b00" : "#060", marginBottom: 12, fontFamily: "monospace" }}>
          sofa @ x={transform.position.x.toFixed(2)} y={transform.position.y.toFixed(2)}{" "}
          z={transform.position.z.toFixed(2)} · cách camera ≈ {dist.toFixed(1)}m
          {dist > 15 && " ⚠️ QUÁ XA → sẽ thấy tí xíu/không thấy. Chỉnh pitch hoặc đặt-Y."}
        </p>
      )}

      {calib && transform ? (
        <RoomCanvas photoUrl={room} glbUrl={SPIKE_SOFA.url} calibration={calib} transform={transform} />
      ) : (
        <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "#f2ede6" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={room} alt="room preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </main>
  );
}
