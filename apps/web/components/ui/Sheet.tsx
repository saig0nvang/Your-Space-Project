"use client";
import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Đóng" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <section role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-card rounded-t-lg2 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] leading-[25px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="size-11 inline-flex items-center justify-center rounded-pill bg-muted">
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
