"use client";
import { maskArea } from "@yourspace/core";
import { useState } from "react";
import { getDisparity, warmupDepth } from "@/lib/ai/depthClient";
import { decodePoints, encodeImage, warmupSam } from "@/lib/ai/samClient";

const URL_ = "/golden/rooms/room-01.jpg";

export default function DevAI() {
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, `${new Date().toLocaleTimeString()} ${s}`]);
  async function run() {
    add("depth: tải model…"); await warmupDepth();
    const t0 = performance.now(); const d = await getDisparity(URL_);
    add(d.ok ? `depth ${d.value.width}×${d.value.height} trong ${Math.round(performance.now() - t0)} ms` : `depth lỗi ${d.error.kind}`);
    add("sam: tải model…"); await warmupSam();
    const t1 = performance.now(); const size = await encodeImage(URL_);
    add(`sam encode ${size.width}×${size.height} trong ${Math.round(performance.now() - t1)} ms`);
    const t2 = performance.now(); const m = await decodePoints([{ x: 0.5, y: 0.7, positive: true }]);
    add(`sam decode ${m.width}×${m.height}, diện tích ${maskArea(m)} px trong ${Math.round(performance.now() - t2)} ms`);
  }
  return (
    <main className="p-6 flex flex-col gap-3">
      <button type="button" className="self-start bg-accent text-on-accent rounded-pill px-6 min-h-11" onClick={() => void run()}>Chạy thử</button>
      <pre className="text-[13px] whitespace-pre-wrap">{log.join("\n")}</pre>
    </main>
  );
}
