"use client";

import { useState, type MouseEvent } from "react";
import {
  placeOnFloor,
  solveCameraFromHorizon,
  type Calibration,
} from "@yourspace/core";
import { GOLDEN_ROOMS, SPIKE_SOFA } from "@/lib/rooms";
import { RoomCanvas } from "@/components/scene/RoomCanvas";

// SPIKE (decision-gate D4) — hiệu chỉnh CÓ TRỢ GIÚP.
// Depth tương đối KHÔNG đủ để suy scale+camera (đã chứng minh ở vòng trước):
// nên lấy đường chân trời từ user → pitch chính xác; chiều cao camera → scale.
// (Relative depth sẽ dùng lại cho OCCLUSION ở bước sau.)

const ASPECT = 4 / 3;

export default function SpikePage() {
  const [room, setRoom] = useState<string>(GOLDEN_ROOMS[0] ?? "");
  const [horizonNdcY, setHorizonNdcY] = useState(0.15);
  const [heightM, setHeightM] = useState(1.4);
  const [placeNdc, setPlaceNdc] = useState<{ x: number; y: number }>({ x: 0, y: -0.45 });
  const [rotDeg, setRotDeg] = useState(0);

  const camera = solveCameraFromHorizon({ horizonNdcY, aspect: ASPECT, heightM });
  const calib: Calibration = {
    camera,
    floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 },
    confidence: 1,
  };
  const base = placeOnFloor(placeNdc, calib, SPIKE_SOFA.dims);
  const transform = { ...base, rotationYRad: (rotDeg * Math.PI) / 180 };

  const dist = Math.hypot(transform.position.x, transform.position.z, heightM);
  const belowHorizon = placeNdc.y < horizonNdcY;

  function onPhotoClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    setPlaceNdc({ x: nx, y: ny });
  }

  // vị trí CSS của đường chân trời
  const horizonTopPct = ((1 - horizonNdcY) / 2) * 100;

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>YourSpace — Spike depth-placement</h1>
      <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
        Decision-gate D4 · <b>hiệu chỉnh có trợ giúp</b>: kéo đường chân trời cho khớp ảnh (thường ngang tầm
        mắt), rồi <b>bấm vào sàn</b> để đặt sofa.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          {GOLDEN_ROOMS.map((r, i) => (
            <option key={r} value={r}>
              room-{String(i + 1).padStart(2, "0")}
            </option>
          ))}
        </select>
        <label>
          chân trời:{" "}
          <input type="range" min={-0.5} max={0.9} step={0.01} value={horizonNdcY}
            onChange={(e) => setHorizonNdcY(parseFloat(e.target.value))} />{" "}
          {horizonNdcY.toFixed(2)}
        </label>
        <label>
          cao camera:{" "}
          <input type="range" min={0.8} max={2.0} step={0.05} value={heightM}
            onChange={(e) => setHeightM(parseFloat(e.target.value))} /> {heightM.toFixed(2)}m
        </label>
        <label>
          xoay Y:{" "}
          <input type="range" min={-180} max={180} step={5} value={rotDeg}
            onChange={(e) => setRotDeg(parseFloat(e.target.value))} /> {rotDeg}°
        </label>
      </div>

      <p style={{ fontSize: 12, fontFamily: "monospace", color: dist > 15 || !belowHorizon ? "#b00" : "#060", marginBottom: 10 }}>
        pitch={((camera.pitchRad * 180) / Math.PI).toFixed(1)}° · sofa @ x={transform.position.x.toFixed(2)}{" "}
        z={transform.position.z.toFixed(2)} · cách camera ≈ {dist.toFixed(1)}m
        {!belowHorizon && " ⚠️ bấm DƯỚI đường chân trời mới ra điểm trên sàn"}
        {belowHorizon && dist > 15 && " ⚠️ quá xa — bấm thấp hơn hoặc hạ chân trời"}
      </p>

      <div style={{ position: "relative", cursor: "crosshair" }} onClick={onPhotoClick}>
        <RoomCanvas photoUrl={room} glbUrl={SPIKE_SOFA.url} calibration={calib} transform={transform} />
        {/* đường chân trời */}
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: `${horizonTopPct}%`,
            borderTop: "2px dashed rgba(176,101,74,0.9)", pointerEvents: "none",
          }}
        >
          <span style={{ position: "absolute", right: 6, top: -20, fontSize: 11, color: "#B0654A", background: "rgba(255,255,255,.75)", padding: "1px 6px", borderRadius: 4 }}>
            chân trời
          </span>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
        Chấm cho ảnh này: <b>scale đúng?</b> · <b>chạm sàn?</b> · <b>phối cảnh khớp?</b> — (occlusion là bước sau)
      </p>
    </main>
  );
}
