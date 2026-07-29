import type { LucideIcon } from "lucide-react";

export function Metric({ label, value, detail, icon: Icon, tone = "ocean" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "ocean" | "lagoon" | "sand" | "coral" }) {
  const tones = {
    ocean: "border-t-[#087287] bg-[#f4fbfc] text-[#075466]",
    lagoon: "border-t-[#18a394] bg-[#f1faf7] text-[#126b58]",
    sand: "border-t-[#d6b66d] bg-[#fcfaf4] text-[#725b25]",
    coral: "border-t-[#c94f3d] bg-[#fff7f5] text-[#9c392b]"
  };
  return (
    <div className={`min-w-0 border border-[#d8e1e2] border-t-4 p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.06em] text-[#60737a]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-[#17313a]">{value}</p>
        </div>
        <Icon size={20} aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm leading-5 text-[#60737a]">{detail}</p>
    </div>
  );
}
