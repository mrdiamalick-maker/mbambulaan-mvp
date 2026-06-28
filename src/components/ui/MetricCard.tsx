import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
  badge?: ReactNode;
  tone?: "default" | "warm" | "dark" | "success" | "info";
  size?: "default" | "compact";
  className?: string;
};

const toneStyles = {
  default: "bg-white text-[#14312d] ring-[#14312d]/10",
  warm: "bg-[#f8faf8] text-[#14312d] ring-[#14312d]/8",
  dark: "bg-[#14312d] text-white ring-[#14312d]",
  success: "bg-[#eef8f1] text-[#14312d] ring-[#95d5b2]/70",
  info: "bg-[#f0f6ff] text-[#14312d] ring-[#93c5fd]/60"
};

export function MetricCard({ badge, className = "", description, label, size = "default", tone = "warm", value }: MetricCardProps) {
  return (
    <article className={`rounded-2xl p-4 shadow-sm ring-1 sm:p-5 ${toneStyles[tone]} ${className}`}>
      <p className={`text-[0.68rem] font-black uppercase tracking-[0.12em] ${tone === "dark" ? "text-[#f5c85d]" : "text-[#d65a31]"}`}>{label}</p>
      <p className={`mt-2 font-black leading-tight ${size === "compact" ? "text-base" : "text-2xl sm:text-3xl"}`}>{value}</p>
      {description ? <p className={`mt-2 text-sm font-bold leading-6 ${tone === "dark" ? "text-white/75" : "text-[#14312d]/65"}`}>{description}</p> : null}
      {badge ? <div className="mt-3">{badge}</div> : null}
    </article>
  );
}
