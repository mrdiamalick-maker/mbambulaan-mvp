import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
  badge?: ReactNode;
  tone?: "default" | "warm" | "dark";
  size?: "default" | "compact";
};

const toneStyles = {
  default: "bg-white text-[#14312d] ring-[#14312d]/10",
  warm: "bg-[#f7f4ec] text-[#14312d] ring-[#14312d]/8",
  dark: "bg-[#14312d] text-white ring-[#14312d]"
};

export function MetricCard({ badge, description, label, size = "default", tone = "warm", value }: MetricCardProps) {
  return (
    <article className={`rounded-2xl p-5 shadow-sm ring-1 ${toneStyles[tone]}`}>
      <p className={`text-xs font-black uppercase tracking-[0.12em] ${tone === "dark" ? "text-[#f5c85d]" : "text-[#d65a31]"}`}>{label}</p>
      <p className={`mt-2 font-black leading-tight ${size === "compact" ? "text-sm leading-6" : "text-3xl"}`}>{value}</p>
      {description ? <p className={`mt-2 text-sm font-bold leading-6 ${tone === "dark" ? "text-white/75" : "text-[#14312d]/65"}`}>{description}</p> : null}
      {badge ? <div className="mt-3">{badge}</div> : null}
    </article>
  );
}
