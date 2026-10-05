import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABEL, STYLES, modelsOfStyle, styleById } from "@/lib/catalog";
import { formatDimsCm, formatVND } from "@/lib/format";

export function generateStaticParams() {
  return STYLES.map((s) => ({ id: s.id }));
}

export default async function StylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const style = styleById(id);
  if (!style) notFound();
  const items = modelsOfStyle(style.id);
  return (
    <main className="flex-1 flex flex-col pb-28">
      <div className="relative h-[50vh] min-h-[300px] w-full">
        <Image src={style.photo} alt={`Ảnh tâm trạng phong cách ${style.name}`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <Link href="/phong-cach" aria-label="Quay lại" className="absolute top-4 left-4 size-11 rounded-pill bg-card inline-flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.1)]">←</Link>
        <h1 className="absolute left-[22px] bottom-12 font-display font-extrabold text-white text-[44px] leading-[48px] tracking-[-1.5px]">{style.name}</h1>
      </div>
      <section className="relative -mt-7 bg-background rounded-t-xl2 px-[22px] pt-8 flex flex-col gap-6 max-w-xl w-full mx-auto">
        <p className="text-[17px] leading-[22px]">{style.summary}</p>
        <dl className="grid grid-cols-[96px_1fr] gap-y-2 text-[15px] leading-5">
          <dt className="text-muted-foreground">Màu</dt><dd>{style.traits.colors}</dd>
          <dt className="text-muted-foreground">Chất liệu</dt><dd>{style.traits.materials}</dd>
          <dt className="text-muted-foreground">Cảm giác</dt><dd>{style.traits.mood}</dd>
        </dl>
        <h2 className="text-[20px] leading-[25px] font-semibold">Món tiêu biểu</h2>
        <ul className="flex flex-col divide-y divide-border">
          {items.map((m) => (
            <li key={m.id} className="py-3 flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[15px] leading-5 font-semibold">{m.name}</p>
                <p className="text-[13px] leading-[18px] text-muted-foreground tabular">{CATEGORY_LABEL[m.category]} · {formatDimsCm(m.dimsM)}</p>
              </div>
              <p className="text-[15px] font-semibold text-accent-text tabular whitespace-nowrap">{formatVND(m.priceVND)}</p>
            </li>
          ))}
        </ul>
        <p className="text-[12px] leading-4 text-muted-foreground">Giá mẫu. Ảnh: {style.photoCredit}.</p>
      </section>
      <div className="fixed inset-x-0 bottom-0 p-4 bg-background/95 border-t border-border">
        <div className="max-w-xl mx-auto"><Button href={`/thu-phong?style=${style.id}`} full>Thử trong phòng của bạn</Button></div>
      </div>
    </main>
  );
}
