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
  default: "bg-white text-[#0F2D4A] ring-[#0F2D4A]/10",
  warm: "bg-[#F8FAFC] text-[#0F2D4A] ring-[#0F2D4A]/8",
  dark: "bg-white text-[#0F2D4A] ring-[#0F2D4A]/12",
  success: "bg-[#EAF6F8] text-[#0F2D4A] ring-[#1F6F8B]/30",
  info: "bg-[#EEF6FA] text-[#0F2D4A] ring-[#1F6F8B]/35"
};

export function MetricCard({ badge, className = "", description, label, size = "default", tone = "warm", value }: MetricCardProps) {
  return (
    <article className={`rounded-2xl p-4 shadow-sm ring-1 sm:p-5 ${toneStyles[tone]} ${className}`}>
      <p className={`text-[0.68rem] font-black uppercase tracking-[0.12em] ${tone === "dark" ? "text-[#1F6F8B]" : "text-[#D85A34]"}`}>{label}</p>
      <p className={`mt-2 font-black leading-tight ${size === "compact" ? "text-base" : "text-2xl sm:text-3xl"}`}>{value}</p>
      {description ? <p className={`mt-2 text-sm font-bold leading-6 ${tone === "dark" ? "text-white/75" : "text-[#14312d]/65"}`}>{description}</p> : null}
      {badge ? <div className="mt-3">{badge}</div> : null}
    </article>
  );
}
