import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="relative h-[52vh] min-h-[320px] w-full">
        <Image src="/styles/japandi.jpg" alt="Phòng khách sáng kiểu Japandi" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 to-transparent" />
        <h1 className="absolute left-[22px] right-[22px] bottom-12 font-display font-extrabold text-white text-[44px] leading-[48px] tracking-[-1.5px] max-w-xl">
          Thử đồ trong chính căn phòng của bạn
        </h1>
      </div>
      <section className="relative -mt-7 flex-1 bg-background rounded-t-xl2 px-[22px] pt-8 pb-10 flex flex-col gap-6 max-w-xl w-full mx-auto">
        <p className="text-[17px] leading-[22px] text-muted-foreground">
          Chụp phòng, xóa đồ cũ, đặt đồ 3D đúng tỷ lệ và thấy tổng tiền trước khi mua.
        </p>
        <div className="flex flex-col gap-3">
          <Button href="/thu-phong" full>Thử phòng</Button>
          <Button href="/phong-cach" variant="secondary" full>Khám phá phong cách</Button>
        </div>
        <p className="text-[12px] leading-4 text-muted-foreground">Bản demo · giá và nhà cung cấp là dữ liệu mẫu.</p>
      </section>
    </main>
  );
}
