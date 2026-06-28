import type { ReactNode } from "react";

type ProductCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "plain" | "soft" | "active" | "dark";
};

const toneStyles = {
  plain: "border-[#0F2D4A]/10 bg-white text-[#0F2D4A]",
  soft: "border-[#0F2D4A]/8 bg-[#F8FAFC] text-[#0F2D4A]",
  active: "border-[#1F6F8B]/28 bg-white text-[#0F2D4A] shadow-md shadow-[#1F6F8B]/8",
  dark: "border-[#0F2D4A]/12 bg-[#F8FAFC] text-[#0F2D4A]"
};

export function ProductCard({ children, className = "", tone = "plain" }: ProductCardProps) {
  return <section className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone]} ${className}`}>{children}</section>;
}
