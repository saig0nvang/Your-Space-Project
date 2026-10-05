"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DEFAULT_LIGHTING } from "@/components/editor/RoomScene";
import { EditorStage } from "@/components/editor/EditorStage";
import { Tray } from "@/components/editor/Tray";
import { Chip } from "@/components/ui/Chip";
import { useEditor } from "@/lib/store";

export default function EditorPage() {
  const router = useRouter();
  const { photo, history, notice } = useEditor();
  useEffect(() => {
    if (!photo || !history) router.replace("/thu-phong");
  }, [photo, history, router]);
  if (!photo || !history) return null;
  return (
    <main className="flex-1 flex flex-col">
      <div className="relative flex justify-center bg-black">
        <EditorStage mode="place" occluder={null} lighting={DEFAULT_LIGHTING} showOriginal={false} onErasePoint={() => {}} />
        {notice && (
          <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
            <Chip key={notice.id}>{notice.text}</Chip>
          </div>
        )}
      </div>
      <section className="w-full max-w-xl mx-auto px-4 py-4">
        <Tray />
      </section>
    </main>
  );
}
