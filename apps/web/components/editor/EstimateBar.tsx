"use client";
import { estimate } from "@yourspace/core";
import { Button } from "@/components/ui/Button";
import { MODELS, SUPPLIERS } from "@/lib/catalog";
import { formatVND } from "@/lib/format";
import { useEditor } from "@/lib/store";

/** Thanh dự toán luôn hiện ở đáy. Nút chính duy nhất của màn trình chỉnh sửa. */
export function EstimateBar({ onOpen }: { onOpen: () => void }) {
  const items = useEditor((s) => s.history?.present.items ?? []);
  const e = estimate(items.map((i) => i.productId), MODELS, SUPPLIERS);
  return (
    <div className="sticky bottom-0 inset-x-0 bg-background border-t border-border px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] text-muted-foreground">{e.itemCount} món · giá mẫu</p>
          <p className="font-display font-bold text-[22px] leading-7 tabular">{formatVND(e.totalVND)}</p>
        </div>
        <Button onClick={onOpen} disabled={e.itemCount === 0}>Xem & mua</Button>
      </div>
    </div>
  );
}
