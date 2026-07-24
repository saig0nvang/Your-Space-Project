"use client";

import { useEffect, useState } from "react";

// Trang CHẨN ĐOÁN tối giản: KHÔNG import three/R3F/transformers.
// Mục đích: tách bạch "React không hydrate" vs "iOS không cấp cảm biến".

export default function SensorTest() {
  const [tapped, setTapped] = useState(0);
  const [count, setCount] = useState(0);
  const [raw, setRaw] = useState("(chưa có sự kiện)");
  const [msg, setMsg] = useState("chưa bấm");
  const [errors, setErrors] = useState<string[]>([]);
  const [env, setEnv] = useState("(đang đọc...)");

  useEffect(() => {
    const onErr = (e: ErrorEvent) => setErrors((p) => [...p, `error: ${e.message}`]);
    const onRej = (e: PromiseRejectionEvent) => setErrors((p) => [...p, `rejection: ${String(e.reason)}`]);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);

    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: unknown };
    setEnv(
      [
        `${location.protocol}//${location.host}`,
        `secure=${window.isSecureContext}`,
        `DOE=${typeof DeviceOrientationEvent !== "undefined"}`,
        `needPermission=${typeof DOE?.requestPermission === "function"}`,
        `touch=${navigator.maxTouchPoints}`,
        `UA=${navigator.userAgent.slice(0, 90)}`,
      ].join(" · "),
    );

    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  function handle(e: DeviceOrientationEvent) {
    setCount((n) => n + 1);
    setRaw(`beta=${e.beta?.toFixed(1) ?? "null"} gamma=${e.gamma?.toFixed(1) ?? "null"} alpha=${e.alpha?.toFixed(0) ?? "null"}`);
  }

  async function enable() {
    setTapped((n) => n + 1);
    setMsg("đã bấm — đang xin quyền...");
    try {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof DOE.requestPermission === "function") {
        const res = await DOE.requestPermission();
        setMsg(`requestPermission → ${res}`);
        if (res !== "granted") return;
      } else {
        setMsg("không cần xin quyền (không phải iOS) — đã đăng ký");
      }
      window.addEventListener("deviceorientation", handle);
      window.addEventListener("deviceorientationabsolute", handle as EventListener);
    } catch (err) {
      setMsg("LỖI: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  const box: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: 13,
    background: "#f5f1ea",
    border: "1px solid #d8d0c4",
    borderRadius: 8,
    padding: 12,
    margin: "10px 0",
    wordBreak: "break-all",
    lineHeight: 1.7,
  };

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20 }}>Sensor test (tối giản)</h1>
      <p style={{ fontSize: 13, color: "#666" }}>
        Trang này KHÔNG dùng 3D. Nếu nút bấm được ở đây mà /capture không bấm được → lỗi nằm ở phần 3D.
      </p>

      <button
        onClick={enable}
        style={{ fontSize: 18, padding: "14px 22px", width: "100%", background: "#B0654A", color: "#fff", border: 0, borderRadius: 10 }}
      >
        BẤM VÀO ĐÂY để bật cảm biến
      </button>

      <div style={box}>
        <div>số lần bấm nút: <b style={{ color: tapped > 0 ? "#060" : "#b00" }}>{tapped}</b>{tapped === 0 && " ← nếu bấm mà vẫn 0 → React KHÔNG hydrate"}</div>
        <div>trạng thái: {msg}</div>
        <div>sự kiện cảm biến: <b style={{ color: count > 0 ? "#060" : "#b00" }}>{count}</b></div>
        <div>raw: {raw}</div>
      </div>

      <div style={{ ...box, background: "#fff" }}>
        <div style={{ color: "#8A8275" }}>ENV</div>
        <div>{env}</div>
      </div>

      {errors.length > 0 && (
        <div style={{ ...box, background: "#fdeceb", borderColor: "#e0a9a2" }}>
          <div style={{ color: "#9E4B3F", fontWeight: 700 }}>LỖI JS BẮT ĐƯỢC</div>
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 13, color: "#444", marginTop: 14 }}>
        <b>iPad/iPhone:</b> nếu bấm được nhưng cảm biến vẫn 0 — vào{" "}
        <b>Cài đặt → Safari → Chuyển động &amp; Hướng (Motion &amp; Orientation Access)</b> và BẬT nó. Mặc định
        nhiều máy đang tắt. Ngoài ra iPad hay ở chế độ <b>&quot;Trang web dành cho máy tính&quot;</b> — thử tắt chế độ đó
        (biểu tượng aA trên thanh địa chỉ) rồi tải lại.
      </p>
    </main>
  );
}
