import type { LucideIcon } from "lucide-react";

export function Metric({ label, value, detail, icon: Icon, tone = "ocean" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "ocean" | "lagoon" | "sand" | "coral" }) {
  const accent = {
    ocean: "#0f3440",
    lagoon: "#2f9d91",
    sand: "#a87a2e",
    coral: "#bd5f43"
  }[tone];

  return (
    <div className="metric-premium p-5">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#66767a]">{label}</p>
          <p className="mt-3 text-4xl font-[760] tracking-[-.05em] text-[#122b33]">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-full border border-black/10 bg-[#fffaf2]" style={{ color: accent }}><Icon size={18} aria-hidden="true" /></span>
      </div>
      <div className="mt-5 h-px bg-[linear-gradient(90deg,var(--mb-line),transparent)]" />
      <p className="relative z-10 mt-3 text-xs leading-5 text-[#66767a]">{detail}</p>
    </div>
  );
}
