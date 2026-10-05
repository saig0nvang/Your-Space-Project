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
  const histRef = useRef<Array<Tilt & { t: number }>>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const [sensorMsg, setSensorMsg] = useState("Chưa bật cảm biến.");
  const [evtCount, setEvtCount] = useState(0);
  const [raw, setRaw] = useState<string>("(chưa có sự kiện)");
  const [env, setEnv] = useState<string>("");
  const [shot, setShot] = useState<{ url: string; aspect: number; tilt: Tilt } | null>(null);
  const [ultrawide, setUltrawide] = useState(false);
  const [heightM, setHeightM] = useState(1.5);
  const [placeNdc, setPlaceNdc] = useState<{ x: number; y: number } | null>(null);
  const [rotDeg, setRotDeg] = useState(0);
  const [pitchManual, setPitchManual] = useState<number | null>(null);

  // ── cảm biến hướng máy ────────────────────────────────────────────────
  const onOrient = useCallback((e: DeviceOrientationEvent) => {
    // Lưu lịch sử để lấy mẫu TRƯỚC lúc bấm nút (thao tác bấm làm nghiêng máy).
    if (e.beta !== null && e.gamma !== null) {
      const angle = typeof screen !== "undefined" && screen.orientation ? screen.orientation.angle : 0;
      histRef.current.push({ t: Date.now(), beta: e.beta, gamma: e.gamma, screenAngle: angle });
      if (histRef.current.length > 120) histRef.current.shift();
    }
    setEvtCount((n) => n + 1);
    setRaw(
      `type=${e.type} alpha=${e.alpha?.toFixed(0) ?? "null"} beta=${e.beta?.toFixed(1) ?? "null"} gamma=${e.gamma?.toFixed(1) ?? "null"}`,
    );
    if (e.beta === null || e.gamma === null) return; // sự kiện rỗng → vẫn đếm để chẩn đoán
    setTilt({
      beta: e.beta,
      gamma: e.gamma,
      screenAngle: typeof screen !== "undefined" && screen.orientation ? screen.orientation.angle : 0,
    });
  }, []);

  useEffect(() => {
    const hasReq =
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission ===
      "function";
    setEnv(
      `${location.protocol}//${location.host} · secure=${window.isSecureContext} · ` +
        `DeviceOrientationEvent=${typeof DeviceOrientationEvent !== "undefined"} · iOS-permission=${hasReq}`,
    );
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
      // một số máy Android chỉ bắn 'deviceorientationabsolute'
      window.addEventListener("deviceorientation", onOrient);
      window.addEventListener("deviceorientationabsolute", onOrient as EventListener);
      setSensorMsg("Đã đăng ký lắng nghe — NGHIÊNG MÁY, xem 'sự kiện nhận' bên dưới có tăng không.");
    } catch (e) {
      setSensorMsg("Lỗi bật cảm biến: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  useEffect(
    () => () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("deviceorientationabsolute", onOrient as EventListener);
    },
    [onOrient],
  );

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
    // Lấy mẫu ~600ms TRƯỚC khi bấm: lúc đó máy còn ở tư thế ngắm, chưa bị ngả để với nút.
    const cutoff = Date.now() - 600;
    const hist = histRef.current;
    const aimed = [...hist].reverse().find((s) => s.t <= cutoff);
    const t: Tilt = aimed ?? tilt ?? { beta: 75, gamma: 0, screenAngle: 0 };
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

  // Override pitch thủ công (khi cảm biến cho số vô lý)
  const camEff = camera
    ? pitchManual !== null
      ? { ...camera, pitchRad: (pitchManual * Math.PI) / 180 }
      : camera
    : null;

  const calib: Calibration | null = camEff
    ? { camera: camEff, floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 }, confidence: 1 }
    : null;

  const pitchDeg = camEff ? (camEff.pitchRad * 180) / Math.PI : 0;
  // Chụp phòng thì pitch hợp lý ~5-40°. Ngoài khoảng này gần như chắc là số đo hỏng.
  const pitchSuspect = pitchManual === null && (pitchDeg > 55 || pitchDeg < -5);
  const hzRaw = camEff ? horizonNdcYFromCamera(camEff) : 0;
  const hz = Math.max(-0.9, Math.min(0.7, hzRaw)); // chặn biên: pitch lớn làm hz văng ra vô cực
  const target = placeNdc ?? { x: 0, y: Math.max(-0.85, hz - 0.35) }; // mặc định: dưới chân trời
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

          {/* bảng chẩn đoán — LUÔN hiện, kể cả khi chưa có sự kiện */}
          <div style={{ fontSize: 11, fontFamily: "monospace", background: "#f5f1ea", border: "1px solid #d8d0c4", borderRadius: 8, padding: "8px 10px", margin: "8px 0", lineHeight: 1.7 }}>
            <div style={{ color: "#8A8275" }}>{env}</div>
            <div>
              sự kiện nhận: <b style={{ color: evtCount > 0 ? "#060" : "#b00" }}>{evtCount}</b>
              {evtCount === 0 && " ← nếu vẫn 0 khi đã nghiêng máy: thiết bị/trình duyệt không cấp cảm biến"}
            </div>
            <div>raw: {raw}</div>
            {tilt ? (
              <div style={{ color: Math.abs(roll) > 8 ? "#b00" : "#060" }}>
                pitch≈{(90 - tilt.beta).toFixed(0)}° · screenAngle={tilt.screenAngle}°
                {Math.abs(roll) > 8 ? " ⚠️ máy nghiêng — giữ thẳng" : " ✓ máy thẳng"}
              </div>
            ) : (
              <div style={{ color: "#8A8275" }}>chưa có beta/gamma hợp lệ — vẫn chụp được (dùng pitch giả định 15°)</div>
            )}
          </div>
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
          <p style={{ fontSize: 12, fontFamily: "monospace", color: dist > 15 || pitchSuspect ? "#b00" : "#060", marginBottom: 8 }}>
            pitch={pitchDeg.toFixed(1)}° (từ cảm biến) · sofa cách ≈ {dist.toFixed(1)}m
            {dist > 15 && " ⚠️ quá xa"}
          </p>
          {pitchSuspect && (
            <p style={{ fontSize: 12, color: "#9E4B3F", background: "#fdeceb", border: "1px solid #e0a9a2", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
              ⚠️ Góc {pitchDeg.toFixed(0)}° không giống tư thế chụp phòng (hợp lý ~5-40°). Giữ iPad như khi
              ngắm, <b>đừng ngả máy ra sau lúc bấm nút</b> — hoặc chỉnh tay bằng slider bên dưới.
            </p>
          )}
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
            <label title="Bật khi cảm biến cho góc sai">
              <input type="checkbox" checked={pitchManual !== null}
                onChange={(e) => setPitchManual(e.target.checked ? 18 : null)} /> pitch tay
            </label>
            {pitchManual !== null && (
              <label>
                góc <input type="range" min={-5} max={55} step={1} value={pitchManual}
                  onChange={(e) => setPitchManual(parseFloat(e.target.value))} /> {pitchManual}°
              </label>
            )}
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
