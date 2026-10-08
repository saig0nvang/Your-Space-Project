"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BuySheet } from "@/components/editor/BuySheet";
import { EditorStage } from "@/components/editor/EditorStage";
import { EraseTool, useEraseSession } from "@/components/editor/EraseTool";
import { EstimateBar } from "@/components/editor/EstimateBar";
import { ItemPanel } from "@/components/editor/ItemPanel";
import { MaskOverlay } from "@/components/editor/MaskOverlay";
import { TopBar } from "@/components/editor/TopBar";
import { Tray } from "@/components/editor/Tray";
import { Chip } from "@/components/ui/Chip";
import { useSceneDepth } from "@/lib/hooks/useSceneDepth";
import { usePhotoLighting } from "@/lib/hooks/usePhotoLighting";
import { useShallow } from "zustand/react/shallow";
import { useEditor } from "@/lib/store";

export default function EditorPage() {
  const router = useRouter();
  // Selector hẹp: kéo món chỉ đổi history.present.items — trang không cần render lại vì thế.
  const { ready, workingUrl, notice, selectedUid } = useEditor(
    useShallow((s) => ({
      ready: !!(s.photo && s.history),
      workingUrl: s.history?.present.workingUrl ?? null,
      notice: s.notice,
      selectedUid: s.selectedUid,
    })),
  );
  const [mode, setMode] = useState<"place" | "erase">("place");
  const [buyIds, setBuyIds] = useState<string[] | null>(null);
  const [holdOriginal, setHoldOriginal] = useState(false);
  const { occluder, status, progress } = useSceneDepth();
  const lighting = usePhotoLighting(workingUrl);
  const erase = useEraseSession(mode === "erase");

  useEffect(() => {
    if (!ready) router.replace("/thu-phong");
  }, [ready, router]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => useEditor.setState({ notice: null }), 3500);
    return () => clearTimeout(t);
  }, [notice]);
  if (!ready) return null;

  const openAll = () => setBuyIds(useEditor.getState().history?.present.items.map((i) => i.productId) ?? []);
  return (
    <main className="flex-1 flex flex-col">
      <TopBar mode={mode} onModeChange={setMode} historyLocked={erase.status === "erasing"} />
      <div className="relative flex justify-center bg-black">
        <EditorStage mode={mode} occluder={occluder} lighting={lighting} showOriginal={holdOriginal}
          onErasePoint={(p) => void erase.addPoint(p)}>
          {mode === "erase" && erase.status === "ready" && <MaskOverlay objects={erase.objects} activeIndex={erase.objects.length - 1} auto={erase.auto} />}
        </EditorStage>
        <div className="absolute top-3 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
          {status === "running" && <Chip tone="light">{progress !== null ? `Đang tải mô hình chiều sâu ${Math.round(progress * 100)}%` : "Đang tính chiều sâu…"}</Chip>}
          {notice && <Chip key={notice.id}>{notice.text}</Chip>}
        </div>
      </div>
      <section className="w-full max-w-xl mx-auto px-4 py-4 flex-1">
        {mode === "erase" ? <EraseTool session={erase} onHoldOriginal={setHoldOriginal} /> : selectedUid ? <ItemPanel onBuy={setBuyIds} /> : <Tray />}
      </section>
      {mode === "place" && <EstimateBar onOpen={openAll} />}
      <BuySheet productIds={buyIds} onClose={() => setBuyIds(null)} />
    </main>
  );
}
