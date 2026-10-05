import Image from "next/image";
import Link from "next/link";
import { STYLES } from "@/lib/catalog";

export default function StylesPage() {
  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-[15px] text-muted-foreground">← YourSpace</Link>
        <h1 className="font-display font-extrabold text-[34px] leading-[40px] tracking-[-1px]">Chọn phong cách</h1>
      </header>
      {STYLES.map((s) => (
        <Link key={s.id} href={`/phong-cach/${s.id}`} className="flex flex-col gap-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md2 bg-muted">
            <Image src={s.photo} alt={`Ảnh tâm trạng phong cách ${s.name}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 576px" />
          </div>
          <h2 className="font-display font-bold text-[28px] leading-[34px] tracking-[-0.6px]">{s.name}</h2>
          <p className="text-[15px] leading-5 text-muted-foreground">{s.summary}</p>
        </Link>
      ))}
    </main>
  );
}
