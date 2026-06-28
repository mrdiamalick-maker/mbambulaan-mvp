import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "info" | "danger" | "neutral" | "dark" | "impact";

type StatusBadgeProps = {
  children?: ReactNode;
  label?: string;
  tone?: StatusTone;
  className?: string;
};

const toneStyles: Record<StatusTone, string> = {
  success: "bg-[#EAF6F8] text-[#0B3B2E] ring-[#1F6F8B]/25",
  warning: "bg-[#FFF4D9] text-[#71520f] ring-[#E8C76A]/60",
  info: "bg-[#E7F1F6] text-[#0F2D4A] ring-[#1F6F8B]/30",
  danger: "bg-[#FBE8E2] text-[#8f321d] ring-[#D85A34]/30",
  neutral: "bg-white text-[#0F2D4A]/65 ring-[#0F2D4A]/10",
  dark: "bg-[#0F2D4A] text-white ring-[#0F2D4A]",
  impact: "bg-[#EAF3EE] text-[#0B3B2E] ring-[#0B3B2E]/20"
};

export function StatusBadge({ children, className = "", label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${toneStyles[tone]} ${className}`}>
      {label ?? children}
    </span>
  );
}
