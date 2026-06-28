import type { ReactNode } from "react";

type ProductCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "plain" | "soft" | "active" | "dark";
};

const toneStyles = {
  plain: "border-[#E2E8F0] bg-white text-[#0F2D4A]",
  soft: "border-[#E2E8F0] bg-[#F8FAFC] text-[#0F2D4A]",
  active: "border-[#1F6F8B]/30 bg-white text-[#0F2D4A] shadow-md shadow-[#1F6F8B]/10",
  dark: "border-[#E2E8F0] bg-[#F8FAFC] text-[#0F2D4A]"
};

export function ProductCard({ children, className = "", tone = "plain" }: ProductCardProps) {
  return <section className={`rounded-2xl border p-4 shadow-[0_16px_40px_rgba(15,45,74,0.06)] ${toneStyles[tone]} ${className}`}>{children}</section>;
}
