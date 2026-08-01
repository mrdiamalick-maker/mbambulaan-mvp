import type { LucideIcon } from "lucide-react";

export function Metric({ label, value, detail, icon: Icon, tone = "ocean" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "ocean" | "lagoon" | "sand" | "coral" }) {
  const tones = {
    ocean: "bg-[#f4fbfc] text-[#075568]",
    lagoon: "bg-[#f1faf7] text-[#118f83]",
    sand: "bg-[#fcfaf4] text-[#886721]",
    coral: "bg-[#fff7f5] text-[#b84638]"
  };
  return (
    <div className={`metric-premium ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.09em] text-[#71858a]">{label}</p>
          <p className="mt-2 text-3xl font-[740] tracking-[-.04em] text-[#102e37]">{value}</p>
        </div>
        <span className="relative z-10 grid size-9 place-items-center rounded-xl bg-white/78 shadow-sm"><Icon size={18} aria-hidden="true" /></span>
      </div>
      <p className="relative z-10 mt-3 text-xs leading-5 text-[#667b81]">{detail}</p>
    </div>
  );
}
