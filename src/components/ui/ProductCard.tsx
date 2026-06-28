import type { ReactNode } from "react";

type ProductCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "plain" | "soft" | "active" | "dark";
};

const toneStyles = {
  plain: "border-[#14312d]/10 bg-white text-[#14312d]",
  soft: "border-[#14312d]/8 bg-[#f7f9f8] text-[#14312d]",
  active: "border-[#7fc7a4] bg-[#eef8f1] text-[#14312d]",
  dark: "border-[#14312d] bg-[#14312d] text-white"
};

export function ProductCard({ children, className = "", tone = "plain" }: ProductCardProps) {
  return <section className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone]} ${className}`}>{children}</section>;
}
