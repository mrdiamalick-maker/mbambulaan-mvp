import type { MacroStat } from "@/data/public-stats";

export function StatBand({ stats, dark = false }: { stats: MacroStat[]; dark?: boolean }) {
  return (
    <div className="pub-stat-band">
      {stats.map((stat) => (
        <div key={stat.label} className={dark ? "pub-stat-tile pub-stat-tile--dark" : "pub-stat-tile"}>
          <p className="pub-stat-value">{stat.value}</p>
          <p className="pub-stat-label">{stat.label}</p>
          <p className="pub-stat-detail">{stat.detail}</p>
          <span className="pub-stat-source">Source · {stat.source}</span>
        </div>
      ))}
    </div>
  );
}
