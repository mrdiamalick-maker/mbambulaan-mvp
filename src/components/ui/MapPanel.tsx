import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

export type MapPoint = {
  name: string;
  x: number;
  y: number;
  tension: string;
  volume: string;
  priority: string;
  tone: "success" | "warning" | "danger" | "info";
};

const pointTone: Record<MapPoint["tone"], string> = {
  success: "bg-[#0B3B2E]",
  warning: "bg-[#D85A34]",
  danger: "bg-[#9F2D1E]",
  info: "bg-[#1F6F8B]"
};

const badgeTone: Record<MapPoint["tone"], StatusTone> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info"
};

export const pilotMapPoints: MapPoint[] = [
  { name: "Saint-Louis", x: 32, y: 12, tension: "Moyenne", volume: "1.2 t", priority: "Surveiller", tone: "info" },
  { name: "Kayar", x: 48, y: 30, tension: "Forte", volume: "2.8 t", priority: "Prioritaire", tone: "warning" },
  { name: "Hann", x: 54, y: 45, tension: "Critique", volume: "0.9 t", priority: "Agir", tone: "danger" },
  { name: "Soumbédioune", x: 49, y: 49, tension: "Moyenne", volume: "1.1 t", priority: "Coordonner", tone: "info" },
  { name: "Rufisque", x: 61, y: 52, tension: "Forte", volume: "1.7 t", priority: "Mobiliser", tone: "warning" },
  { name: "Mbour", x: 58, y: 65, tension: "Moyenne", volume: "2.1 t", priority: "Orienter", tone: "info" },
  { name: "Joal", x: 52, y: 75, tension: "Faible", volume: "1.4 t", priority: "Suivre", tone: "success" }
];

export function MapPanel({ points = pilotMapPoints, title = "Carte des quais prioritaires" }: { points?: MapPoint[]; title?: string }) {
  return (
    <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_45px_rgba(15,45,74,0.07)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1F6F8B]">Lecture territoriale</p>
          <h3 className="mt-2 text-xl font-black text-[#0F2D4A]">{title}</h3>
        </div>
        <StatusBadge tone="info">Quais pilotes</StatusBadge>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[21rem] overflow-hidden rounded-[1.5rem] bg-[#EAF6F8] ring-1 ring-[#D9E7EE]">
          <div className="absolute left-[18%] top-[4%] h-[92%] w-[48%] rounded-[45%_55%_50%_48%] bg-white shadow-inner shadow-[#1F6F8B]/10" />
          <div className="absolute left-[27%] top-[10%] h-[78%] w-[31%] rounded-[52%_45%_56%_44%] bg-[#F8FAFC] ring-1 ring-[#E2E8F0]" />
          <div className="absolute inset-y-0 right-0 w-[34%] bg-gradient-to-l from-[#1F6F8B]/24 to-transparent" />
          {points.map((point) => (
            <div key={point.name} className="absolute" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
              <div className={`h-4 w-4 rounded-full ${pointTone[point.tone]} shadow-[0_0_0_5px_rgba(255,255,255,0.85)]`} />
              <p className="mt-1 whitespace-nowrap rounded-full bg-white/92 px-2 py-1 text-[0.68rem] font-black text-[#0F2D4A] shadow-sm ring-1 ring-[#E2E8F0]">{point.name}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          {points.slice(0, 5).map((point) => (
            <article key={point.name} className="rounded-2xl bg-[#F8FAFC] p-3 ring-1 ring-[#E2E8F0]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-[#0F2D4A]">{point.name}</p>
                  <p className="mt-1 text-xs font-semibold text-[#334155]">{point.volume} · {point.priority}</p>
                </div>
                <StatusBadge tone={badgeTone[point.tone]}>{point.tension}</StatusBadge>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
