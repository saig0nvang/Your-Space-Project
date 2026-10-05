import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Props = { variant?: "primary" | "secondary" | "text"; full?: boolean; href?: string } & ButtonHTMLAttributes<HTMLButtonElement>;

const base = "inline-flex items-center justify-center gap-2 font-semibold text-[17px] leading-[22px] transition-opacity active:opacity-85 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const variants = {
  primary: "bg-accent text-on-accent rounded-pill px-6 min-h-[54px]",
  secondary: "border-[1.5px] border-foreground text-foreground rounded-pill px-6 min-h-[44px]",
  text: "text-foreground min-h-[44px] px-2",
};

/** Nút theo MASTER.md. Tối đa MỘT nút `primary` mỗi màn. */
export function Button({ variant = "primary", full, href, className = "", children, ...rest }: Props) {
  const cls = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
