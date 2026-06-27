import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "info" | "danger" | "neutral" | "dark" | "impact";

type StatusBadgeProps = {
  children?: ReactNode;
  label?: string;
  tone?: StatusTone;
  className?: string;
};

const toneStyles: Record<StatusTone, string> = {
  success: "bg-[#d8f3dc] text-[#1b5e20] ring-[#95d5b2]",
  warning: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
  info: "bg-[#dbeafe] text-[#174ea6] ring-[#93c5fd]",
  danger: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]",
  neutral: "bg-white text-[#14312d]/65 ring-[#14312d]/10",
  dark: "bg-[#14312d] text-white ring-[#14312d]",
  impact: "bg-[#e8f7f2] text-[#0f5132] ring-[#9ad6bf]"
};

export function StatusBadge({ children, className = "", label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${toneStyles[tone]} ${className}`}>
      {label ?? children}
    </span>
  );
}
