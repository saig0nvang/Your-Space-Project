"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditorStage } from "@/components/editor/EditorStage";
import { EstimateBar } from "@/components/editor/EstimateBar";
import { ItemPanel } from "@/components/editor/ItemPanel";
import { TopBar } from "@/components/editor/TopBar";
import { Tray } from "@/components/editor/Tray";
import { Chip } from "@/components/ui/Chip";
import { useSceneDepth } from "@/lib/hooks/useSceneDepth";
import { usePhotoLighting } from "@/lib/hooks/usePhotoLighting";
import { useEditor } from "@/lib/store";

export default function EditorPage() {
  const router = useRouter();
  const { photo, history, notice, selectedUid } = useEditor();
  const [mode, setMode] = useState<"place" | "erase">("place");
  const [buyIds, setBuyIds] = useState<string[] | null>(null);
  const { occluder, status, progress } = useSceneDepth();
  const lighting = usePhotoLighting(history?.present.workingUrl ?? null);

  useEffect(() => {
    if (!photo || !history) router.replace("/thu-phong");
  }, [photo, history, router]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => useEditor.setState({ notice: null }), 3500);
    return () => clearTimeout(t);
  }, [notice]);
  if (!photo || !history) return null;

  const allIds = history.present.items.map((i) => i.productId);
  return (
    <main className="flex-1 flex flex-col">
      <TopBar mode={mode} onModeChange={setMode} />
      <div className="relative flex justify-center bg-black">
        <EditorStage mode={mode} occluder={occluder} lighting={lighting} showOriginal={false} onErasePoint={() => {}} />
        <div className="absolute top-3 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
          {status === "running" && <Chip tone="light">{progress !== null ? `Đang tải mô hình chiều sâu ${Math.round(progress * 100)}%` : "Đang tính chiều sâu…"}</Chip>}
          {notice && <Chip key={notice.id}>{notice.text}</Chip>}
        </div>
      </div>
      <section className="w-full max-w-xl mx-auto px-4 py-4 flex-1">
        {selectedUid ? <ItemPanel onBuy={setBuyIds} /> : <Tray />}
      </section>
      <EstimateBar onOpen={() => setBuyIds(allIds)} />
      {/* BuySheet gắn ở Task 16; tạm giữ state buyIds để không đổi chữ ký ItemPanel / EstimateBar */}
      {buyIds && null}
    </main>
  );
}
