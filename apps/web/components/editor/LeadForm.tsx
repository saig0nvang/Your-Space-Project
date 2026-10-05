"use client";
import { normalizeVnPhone } from "@yourspace/core";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/format";

/** M1: chưa có link affiliate thật → để lại SĐT. Bản demo KHÔNG gửi, KHÔNG lưu. */
export function LeadForm({ productIds, totalVND, onDone }: { productIds: string[]; totalVND: number; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[17px] leading-[22px]">Cảm ơn {name.trim() || "bạn"}. Nhà cung cấp sẽ gọi lại để xác nhận {productIds.length} món, tổng {formatVND(totalVND)}.</p>
        <p className="text-[13px] text-muted-foreground">Bản demo · thông tin không được gửi đi.</p>
        <Button full onClick={onDone}>Quay lại phòng</Button>
      </div>
    );
  }
  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!normalizeVnPhone(phone)) { setError("Số điện thoại chưa đúng. Nhập số di động 10 số, ví dụ 0912 345 678."); return; }
      setError(null);
      setSent(true);
    }}>
      <label className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Tên của bạn</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
          className="min-h-11 px-4 py-3 rounded-[8px] border border-border-strong text-[17px] focus:outline-2 focus:outline-ring" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Số điện thoại</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" aria-invalid={!!error}
          className="min-h-11 px-4 py-3 rounded-[8px] border border-border-strong text-[17px] focus:outline-2 focus:outline-ring" />
        {error && <span className="text-[13px] text-destructive-text" role="alert">⚠ {error}</span>}
      </label>
      <Button full type="submit">Để lại số để được gọi lại</Button>
      <p className="text-[12px] text-muted-foreground">Bản demo · thông tin không được gửi đi.</p>
    </form>
  );
}
