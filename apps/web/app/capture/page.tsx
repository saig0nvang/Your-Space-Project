"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  DEFAULT_PHONE_FOV_Y,
  ULTRAWIDE_FOV_Y,
  horizonNdcYFromCamera,
  placeOnFloor,
  rollDegFromDeviceTilt,
  solveCameraFromDeviceTilt,
  type Calibration,
} from "@yourspace/core";
import { SPIKE_SOFA } from "@/lib/rooms";
import { RoomCanvas } from "@/components/scene/RoomCanvas";

// "Kreativ-lite": CHỤP TRONG APP → đọc hướng máy lúc bấm → camera pose biết ngay
// → đặt đồ TỰ ĐỘNG, không cần kéo chân trời, không cần model depth.
// (Ảnh upload từ thư viện không có dữ liệu này → dùng /spike assisted.)

type Tilt = { beta: number; gamma: number; screenAngle: number };

export default function CapturePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const [sensorMsg, setSensorMsg] = useState("Chưa bật cảm biến.");
  const [shot, setShot] = useState<{ url: string; aspect: number; tilt: Tilt } | null>(null);
  const [ultrawide, setUltrawide] = useState(false);
  const [heightM, setHeightM] = useState(1.5);
  const [placeNdc, setPlaceNdc] = useState<{ x: number; y: number } | null>(null);
  const [rotDeg, setRotDeg] = useState(0);

  // ── cảm biến hướng máy ────────────────────────────────────────────────
  const onOrient = useCallback((e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;
    setTilt({
      beta: e.beta,
      gamma: e.gamma,
      screenAngle: typeof screen !== "undefined" && screen.orientation ? screen.orientation.angle : 0,
    });
  }, []);

  async function enableSensor() {
    try {
      type IOSDOE = { requestPermission?: () => Promise<"granted" | "denied"> };
      const DOE = DeviceOrientationEvent as unknown as IOSDOE;
      if (typeof DOE.requestPermission === "function") {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          setSensorMsg("Bị từ chối quyền cảm biến → dùng /spike (kéo chân trời).");
          return;
        }
      }
      window.addEventListener("deviceorientation", onOrient);
      setSensorMsg("Cảm biến ON — nghiêng máy thử, số bên dưới phải đổi.");
    } catch {
      setSensorMsg("Thiết bị không hỗ trợ cảm biến → dùng /spike.");
    }
  }

  useEffect(() => () => window.removeEventListener("deviceorientation", onOrient), [onOrient]);

  // ── camera ────────────────────────────────────────────────────────────
  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e) {
      setSensorMsg("Không mở được camera: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const cv = document.createElement("canvas");
    cv.width = v.videoWidth;
    cv.height = v.videoHeight;
    cv.getContext("2d")?.drawImage(v, 0, 0);
    const t: Tilt = tilt ?? { beta: 75, gamma: 0, screenAngle: 0 }; // desktop: giả định chúc 15°
    setShot({ url: cv.toDataURL("image/jpeg", 0.92), aspect: v.videoWidth / v.videoHeight, tilt: t });
    setPlaceNdc(null);
    stream?.getTracks().forEach((x) => x.stop());
    setStream(null);
  }

  // ── hình học ──────────────────────────────────────────────────────────
  const camera = shot
    ? solveCameraFromDeviceTilt({
        betaDeg: shot.tilt.beta,
        gammaDeg: shot.tilt.gamma,
        screenAngleDeg: shot.tilt.screenAngle,
        aspect: shot.aspect,
        fovYRad: ultrawide ? ULTRAWIDE_FOV_Y : DEFAULT_PHONE_FOV_Y,
        heightM,
      })
    : null;

  const calib: Calibration | null = camera
    ? { camera, floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 }, confidence: 1 }
    : null;

  const hz = camera ? horizonNdcYFromCamera(camera) : 0;
  const target = placeNdc ?? { x: 0, y: Math.max(-0.85, hz - 0.4) }; // mặc định: dưới chân trời
  const base = calib ? placeOnFloor(target, calib, SPIKE_SOFA.dims) : null;
  const transform = base ? { ...base, rotationYRad: (rotDeg * Math.PI) / 180 } : null;
  const dist = transform ? Math.hypot(transform.position.x, transform.position.z, heightM) : 0;

  function onPhotoClick(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setPlaceNdc({
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: 1 - ((e.clientY - r.top) / r.height) * 2,
    });
  }

  const roll = tilt ? rollDegFromDeviceTilt(tilt.gamma, tilt.screenAngle) : 0;

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Chụp phòng — đặt đồ tự động</h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 14 }}>
        Chụp ngay trong app → đọc hướng máy lúc bấm → camera biết chính xác → sofa đặt tự động.
        Ảnh có sẵn trong máy thì dùng <a href="/spike">/spike</a>.
      </p>

      {!shot && (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <button onClick={enableSensor}>1 · Bật cảm biến</button>
            <button onClick={startCamera}>2 · Mở camera</button>
            <button onClick={capture} disabled={!stream}>3 · Chụp</button>
          </div>
          <p style={{ fontSize: 12, color: "#444" }}>{sensorMsg}</p>
          {tilt && (
            <p style={{ fontSize: 12, fontFamily: "monospace", color: Math.abs(roll) > 8 ? "#b00" : "#060" }}>
              beta={tilt.beta.toFixed(0)}° gamma={tilt.gamma.toFixed(0)}° · pitch≈{(90 - tilt.beta).toFixed(0)}°
              {Math.abs(roll) > 8 ? " ⚠️ máy đang nghiêng — giữ thẳng" : " ✓ máy thẳng"}
            </p>
          )}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: "100%", marginTop: 10, background: "#111", borderRadius: 10 }}
          />
        </>
      )}

      {shot && calib && transform && (
        <>
          <p style={{ fontSize: 12, fontFamily: "monospace", color: dist > 15 ? "#b00" : "#060", marginBottom: 8 }}>
            pitch={((camera!.pitchRad * 180) / Math.PI).toFixed(1)}° (từ cảm biến) · sofa cách ≈ {dist.toFixed(1)}m
            {dist > 15 && " ⚠️ quá xa"}
          </p>
          <div style={{ position: "relative", cursor: "crosshair" }} onClick={onPhotoClick}>
            <RoomCanvas
              photoUrl={shot.url}
              glbUrl={SPIKE_SOFA.url}
              calibration={calib}
              transform={transform}
              aspect={shot.aspect}
            />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginTop: 10, fontSize: 13 }}>
            <label>
              <input type="checkbox" checked={ultrawide} onChange={(e) => setUltrawide(e.target.checked)} /> ống góc rộng
            </label>
            <label>
              cao máy <input type="range" min={1.0} max={1.8} step={0.05} value={heightM}
                onChange={(e) => setHeightM(parseFloat(e.target.value))} /> {heightM.toFixed(2)}m
            </label>
            <label>
              xoay <input type="range" min={-180} max={180} step={5} value={rotDeg}
                onChange={(e) => setRotDeg(parseFloat(e.target.value))} /> {rotDeg}°
            </label>
            <button onClick={() => { setShot(null); setPlaceNdc(null); }}>Chụp lại</button>
          </div>
          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Bấm vào sàn để dời sofa. Chấm: <b>scale</b> · <b>chạm sàn</b> · <b>phối cảnh</b>.
          </p>
        </>
      )}
    </main>
  );
}
