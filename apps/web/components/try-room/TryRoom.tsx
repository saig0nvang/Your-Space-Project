"use client";
import { fovYFromFocal35, type StyleId } from "@yourspace/core";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SAMPLE_ROOMS } from "@/lib/catalog";
import { preparePhoto } from "@/lib/image";
import { useEditor } from "@/lib/store";
import { HorizonOverlay } from "./HorizonOverlay";

const DEFAULT_FOV = (60 * Math.PI) / 180;
const POSTURES = [{ label: "Đứng", heightM: 1.5 }, { label: "Ngồi", heightM: 1.1 }] as const;

export function TryRoom({ initialStyle }: { initialStyle: StyleId | null }) {
  const router = useRouter();
  const { photo, setPhoto, setStyle, startEditing } = useEditor();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(0);
  const [heightM, setHeightM] = useState<number>(POSTURES[0].heightM);

  useEffect(() => {
    if (initialStyle) setStyle(initialStyle);
  }, [initialStyle, setStyle]);

  async function choose(blob: Blob) {
    setBusy(true);
    setError(null);
    try {
      setPhoto(await preparePhoto(blob));
    } catch {
      setError("Không mở được ảnh này. Thử một ảnh JPEG hoặc PNG khác.");
    } finally {
      setBusy(false);
    }
  }

  function start() {
    if (!photo) return;
    const fovYRad = fovYFromFocal35(photo.focal35, photo.width / photo.height) ?? DEFAULT_FOV;
    startEditing({ horizonNdcY: horizon, heightM, fovYRad });
    router.push("/chinh-sua");
  }

  if (!photo) {
    return (
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
        <Link href="/" className="text-[15px] text-muted-foreground">← YourSpace</Link>
        <h1 className="font-display font-extrabold text-[34px] leading-[40px] tracking-[-1px]">Ảnh căn phòng của bạn</h1>
        <p className="text-[15px] leading-5 text-muted-foreground">
          Đứng ở góc phòng, cầm máy ngang tầm mắt, thấy được sàn. Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó.
        </p>
        <label className="inline-flex items-center justify-center bg-accent text-on-accent rounded-pill px-6 min-h-[54px] text-[17px] font-semibold cursor-pointer has-[:disabled]:opacity-40">
          {busy ? "Đang mở ảnh…" : "Chọn hoặc chụp ảnh phòng"}
          <input type="file" accept="image/*" className="sr-only" disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void choose(f); }} />
        </label>
        {error && <p className="text-[15px] text-destructive-text" role="alert">⚠ {error}</p>}
        <h2 className="text-[17px] font-semibold mt-2">Hoặc dùng ảnh mẫu</h2>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_ROOMS.map((r) => (
            <button key={r.url} type="button" disabled={busy} aria-label={r.label}
              onClick={async () => void choose(await (await fetch(r.url)).blob())}
              className="relative aspect-[4/3] overflow-hidden rounded-md2 bg-muted">
              <Image src={r.url} alt={r.label} fill className="object-cover" sizes="33vw" />
            </button>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground">Ảnh mẫu là ảnh phòng có sẵn để thử nhanh, không phải phòng của người dùng.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
      <Button variant="text" className="self-start" onClick={() => useEditor.setState({ photo: null })}>← Chọn ảnh khác</Button>
      <h1 className="font-display font-bold text-[28px] leading-[34px] tracking-[-0.6px]">Kéo đường ngang tầm mắt</h1>
      <p className="text-[15px] leading-5 text-muted-foreground">Đặt đường nét đứt ở độ cao mắt bạn lúc chụp — thường là nơi các đường của tường và sàn hội tụ.</p>
      <div className="relative w-full overflow-hidden rounded-md2 bg-muted" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="Ảnh phòng của bạn" className="absolute inset-0 size-full object-cover" />
        <HorizonOverlay value={horizon} onChange={setHorizon} />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[15px] font-semibold mb-2">Lúc chụp bạn đang</legend>
        <div className="inline-flex bg-muted rounded-pill p-1 self-start">
          {POSTURES.map((p) => (
            <button key={p.label} type="button" aria-pressed={heightM === p.heightM} onClick={() => setHeightM(p.heightM)}
              className={`min-h-[44px] px-5 rounded-pill text-[15px] font-semibold ${heightM === p.heightM ? "bg-accent text-on-accent" : "text-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>
      <Button full onClick={start}>Bắt đầu bày</Button>
    </main>
  );
}
