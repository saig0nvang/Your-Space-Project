"use client";
import { estimate } from "@yourspace/core";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { MODELS, SUPPLIERS } from "@/lib/catalog";
import { formatVND } from "@/lib/format";
import { LeadForm } from "./LeadForm";

export function BuySheet({ productIds, onClose }: { productIds: string[] | null; onClose: () => void }) {
  const [leadFor, setLeadFor] = useState<string[] | null>(null);
  if (!productIds) return null;
  const e = estimate(productIds, MODELS, SUPPLIERS);
  const lead = leadFor ? estimate(leadFor, MODELS, SUPPLIERS) : null;
  const close = () => { setLeadFor(null); onClose(); };
  return (
    <Sheet open title={leadFor ? "Để lại số điện thoại" : "Mua đồ trong phòng"} onClose={close}>
      {lead && leadFor ? (
        <LeadForm productIds={leadFor} totalVND={lead.totalVND} onDone={close} />
      ) : (
        <div className="flex flex-col gap-6">
          {e.groups.map((g) => (
            <section key={g.supplier.id} className="flex flex-col gap-2">
              <h3 className="text-[15px] font-semibold">{g.supplier.name} · giao {g.supplier.deliveryMinDays}–{g.supplier.deliveryMaxDays} ngày</h3>
              <ul className="flex flex-col divide-y divide-border">
                {g.lines.map((l) => (
                  <li key={l.model.id} className="py-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold">{l.model.name}{l.qty > 1 ? ` × ${l.qty}` : ""}</p>
                      <p className="text-[15px] font-semibold text-accent-text tabular">{formatVND(l.lineVND)}</p>
                    </div>
                    <Button variant="secondary" onClick={() => setLeadFor(Array(l.qty).fill(l.model.id))}>Mua</Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <Button full onClick={() => setLeadFor(productIds)}>Mua cả bộ · {formatVND(e.totalVND)}</Button>
          <p className="text-[12px] text-muted-foreground">Giá mẫu. Một lần đặt cho nhiều nhà cung cấp; mỗi nhà cung cấp gọi lại riêng.</p>
        </div>
      )}
    </Sheet>
  );
}
