import type { ReactNode } from "react";

/** Chip AI / thông báo nổi trên ảnh (viên thuốc, có bóng vì nằm trên ảnh). */
export function Chip({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  const cls = tone === "dark" ? "bg-accent text-on-accent" : "bg-card text-foreground";
  return (
    <div role="status" className={`${cls} rounded-pill px-4 py-2 text-[13px] leading-[18px] font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.15)]`}>
      {children}
    </div>
  );
}
