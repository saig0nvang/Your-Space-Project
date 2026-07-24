"use client";

import { useState } from "react";
import { calibrate, placeOnFloor, type Calibration, type Transform } from "@yourspace/core";
import { browserDepth } from "@/lib/depth/browserDepth";
import { GOLDEN_ROOMS, SPIKE_SOFA } from "@/lib/rooms";
import { RoomCanvas } from "@/components/scene/RoomCanvas";

// SPIKE (decision-gate D4): đặt 1 sofa vào ảnh phòng thật, đánh giá bằng MẮT.
// Chạy: `pnpm dev` → http://localhost:3000/spike

export default function SpikePage() {
  const [room, setRoom] = useState<string>(GOLDEN_ROOMS[0] ?? "");
  const [invert, setInvert] = useState(true);
  const [ndcY, setNdcY] = useState(-0.4);
  const [status, setStatus] = useState("Chọn ảnh rồi bấm Chạy depth.");
  const [calib, setCalib] = useState<Calibration | null>(null);
  const [transform, setTransform] = useState<Transform | null>(null);

  async function run() {
    setCalib(null);
    setTransform(null);
    setStatus("Đang chạy Depth Anything V2 trong trình duyệt (lần đầu tải model ~vài chục MB)...");
    try {
      const depth = await browserDepth(room, invert);
      const c = calibrate(depth, { assumedCameraHeightM: 1.4 });
      const t = placeOnFloor({ x: 0, y: ndcY }, c, SPIKE_SOFA.dims);
      setCalib(c);
      setTransform(t);
      setStatus(
        `OK. confidence=${c.confidence.toFixed(2)}, pitch=${((c.camera.pitchRad * 180) / Math.PI).toFixed(0)}°. ` +
          `Chấm: scale đúng? chạm sàn? phối cảnh? (occlusion là bước sau)`,
      );
    } catch (e) {
      setStatus("Lỗi: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>YourSpace — Spike depth-placement</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Decision-gate D4: đặt sofa vào ảnh phòng thật → chấm believability bằng mắt trên {GOLDEN_ROOMS.length} ảnh.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          {GOLDEN_ROOMS.map((r, i) => (
            <option key={r} value={r}>
              room-{String(i + 1).padStart(2, "0")}
            </option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} /> invert depth
        </label>
        <label>
          đặt Y:
          <input
            type="range"
            min={-0.8}
            max={0.2}
            step={0.05}
            value={ndcY}
            onChange={(e) => setNdcY(parseFloat(e.target.value))}
          />
          {ndcY.toFixed(2)}
        </label>
        <button onClick={run}>Chạy depth + đặt đồ</button>
      </div>

      <p style={{ fontSize: 13, color: "#444", marginBottom: 12 }}>{status}</p>

      {calib && transform ? (
        <RoomCanvas
          photoUrl={room}
          glbUrl={SPIKE_SOFA.url}
          calibration={calib}
          transform={transform}
        />
      ) : (
        <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "#f2ede6" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={room} alt="room preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </main>
  );
}
