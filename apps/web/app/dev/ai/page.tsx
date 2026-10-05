"use client";
import { maskArea } from "@yourspace/core";
import { useState } from "react";
import { getDisparity, warmupDepth } from "@/lib/ai/depthClient";
import { decodePoints, encodeImage, warmupSam } from "@/lib/ai/samClient";
import { preparePhoto } from "@/lib/image";

const SAMPLES = ["room-02.jpg", "room-01.jpg"] as const;

export default function DevAI() {
  const [log, setLog] = useState<string[]>([]);
  const [sample, setSample] = useState<(typeof SAMPLES)[number]>(SAMPLES[0]);
  const add = (s: string) => setLog((l) => [...l, `${new Date().toLocaleTimeString()} ${s}`]);

  async function run() {
    try {
      add(`chuẩn bị ảnh: /golden/rooms/${sample}…`);
      const res = await fetch(`/golden/rooms/${sample}`);
      if (!res.ok) throw new Error(`Không tải được ảnh mẫu (${res.status})`);
      const photo = await preparePhoto(await res.blob());
      add(`ảnh đã chuẩn bị ${photo.width}×${photo.height}`);

      add("depth: tải model…");
      await warmupDepth();
      const t0 = performance.now();
      const d = await getDisparity(photo.url);
      add(d.ok ? `depth ${d.value.width}×${d.value.height} trong ${Math.round(performance.now() - t0)} ms` : `depth lỗi ${d.error.kind}: ${d.error.message}`);

      add("sam: tải model…");
      await warmupSam();
      const t1 = performance.now();
      const size = await encodeImage(photo.url);
      add(`sam encode ${size.width}×${size.height} trong ${Math.round(performance.now() - t1)} ms`);
      const t2 = performance.now();
      const m = await decodePoints([{ x: 0.5, y: 0.7, positive: true }]);
      add(`sam decode ${m.width}×${m.height}, diện tích ${maskArea(m)} px trong ${Math.round(performance.now() - t2)} ms`);
    } catch (err) {
      add(`lỗi: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <main className="p-6 flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        Ảnh mẫu
        <select
          className="border rounded px-2 py-1"
          value={sample}
          onChange={(e) => setSample(e.target.value as (typeof SAMPLES)[number])}
        >
          {SAMPLES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="self-start bg-accent text-on-accent rounded-pill px-6 min-h-11" onClick={() => void run()}>Chạy thử</button>
      <pre className="text-[13px] whitespace-pre-wrap">{log.join("\n")}</pre>
    </main>
  );
}
