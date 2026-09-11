import { ETAT_DEMO_SERIES_NOTICE, resultTrendDemo, signalTrendDemo } from "@/domain/etat-presentation";

// LOT V3.16 ("Brief national — copie conforme du rendu maquette") —
// mini-graphique de tendance pour chaque tuile KPI du Brief national,
// même géométrie SVG (viewBox 0 0 120 30, aire + ligne + point terminal)
// que la maquette Claude Design. Aucune série réelle hebdomadaire
// n'existe pour ces 5 indicateurs (comptages ponctuels, pas un historique
// stocké) — réutilise la même série illustrative déjà divulguée
// (signalTrendDemo/ETAT_DEMO_SERIES_NOTICE, utilisée plus haut sur cette
// même page pour "Évolution des signaux reçus") plutôt que d'inventer 5
// courbes différentes : une seule courbe illustrative honnêtement
// signalée, jamais 5 tendances fabriquées à part.
export function KpiSparkline({ color = "#0B1A2A" }: { color?: string }) {
  const values = signalTrendDemo.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 120;
    const y = 28 - ((value - min) / Math.max(1, max - min)) * 22;
    return { x, y };
  });
  const pointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaStr = `0,30 ${pointsStr} 120,30`;
  const last = points[points.length - 1];
  return (
    <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="h-[26px] w-full overflow-visible" aria-hidden="true">
      <polygon points={areaStr} fill={color} opacity="0.1" />
      <polyline points={pointsStr} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.6" fill={color} />
    </svg>
  );
}

export function SignalTrendChart() {
  const max = Math.max(...signalTrendDemo.map((item) => item.value));
  return (
    <figure aria-labelledby="etat-signal-trend-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <figcaption id="etat-signal-trend-title" className="text-[9.5px] font-semibold uppercase tracking-[.15em] text-[var(--etat-stone-600)]">
          Signaux captés par semaine · 12 semaines
        </figcaption>
        <p className="max-w-[330px] text-right text-[11px] leading-4 text-[var(--etat-stone-600)]">
          Lecture de tendance illustrative, conçue pour montrer le suivi attendu dans le temps.
        </p>
      </div>
      <div className="mt-5 flex h-[126px] items-end gap-2 border-b border-[rgba(11,26,42,.22)] pb-2 sm:gap-2.5">
        {signalTrendDemo.map((item, index) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-stretch justify-end gap-1">
            <span className="text-center text-[9px] text-[var(--etat-stone-600)]" style={{ fontFamily: "var(--etat-font-mono)" }}>{item.value}</span>
            <span
              className="block min-h-[8px]"
              style={{
                height: `${Math.max(8, (item.value / max) * 92)}px`,
                background: index === 7 ? "var(--etat-terracotta)" : item.value >= 4 ? "#C49A6C" : "var(--etat-navy)"
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-2.5">
        {signalTrendDemo.map((item) => <span key={item.label} className="min-w-0 flex-1 text-center text-[8.5px] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>{item.label}</span>)}
      </div>
      <p className="mt-4 text-[10.5px] leading-4 text-[var(--etat-stone-600)]">{ETAT_DEMO_SERIES_NOTICE}</p>
    </figure>
  );
}

function linePoints(values: number[], min: number, max: number) {
  return values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * 616;
    const y = 168 - ((value - min) / Math.max(1, max - min)) * 126;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export function ResultTrendChart() {
  const qualification = resultTrendDemo.map((item) => item.qualificationMinutes);
  const closure = resultTrendDemo.map((item) => item.closedWithConfirmationPct);
  const last = resultTrendDemo[resultTrendDemo.length - 1];
  return (
    <figure aria-labelledby="etat-result-trend-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <figcaption id="etat-result-trend-title" className="text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--etat-stone-600)]">
          Évolution de deux indicateurs suivis
        </figcaption>
        <span className="text-[11px] text-[var(--etat-stone-600)]">février → septembre 2026</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-[var(--etat-stone-600)]">
        <span className="flex items-center gap-2"><span className="h-[2px] w-4 bg-[var(--etat-terracotta)]" />Délai médian de qualification (min)</span>
        <span className="flex items-center gap-2"><span className="h-[2px] w-4 bg-[var(--etat-navy)]" />Situations closes avec confirmation (%)</span>
      </div>
      <svg viewBox="0 0 620 200" className="mt-4 block h-auto w-full" role="img" aria-label="Le délai illustratif baisse de 74 à 44 minutes tandis que les clôtures avec confirmation progressent de 21 à 43 pour cent.">
        <line x1="0" y1="174" x2="620" y2="174" stroke="rgba(11,26,42,.20)" />
        <line x1="0" y1="111" x2="620" y2="111" stroke="rgba(11,26,42,.07)" />
        <line x1="0" y1="48" x2="620" y2="48" stroke="rgba(11,26,42,.07)" />
        <polyline points={linePoints(qualification, 35, 80)} fill="none" stroke="#B6522F" strokeWidth="2.4" />
        <polyline points={linePoints(closure, 15, 50)} fill="none" stroke="#0B1A2A" strokeWidth="2.4" />
        <circle cx="616" cy={168 - ((last.qualificationMinutes - 35) / 45) * 126} r="4" fill="#B6522F" />
        <circle cx="616" cy={168 - ((last.closedWithConfirmationPct - 15) / 35) * 126} r="4" fill="#0B1A2A" />
        <text x="0" y="30" fontSize="10" fill="rgba(11,26,42,.60)" style={{ fontFamily: "var(--etat-font-mono)" }}>74 min</text>
        <text x="558" y="166" fontSize="10" fill="#B6522F" style={{ fontFamily: "var(--etat-font-mono)" }}>44 min</text>
        <text x="0" y="166" fontSize="10" fill="rgba(11,26,42,.60)" style={{ fontFamily: "var(--etat-font-mono)" }}>21 %</text>
        <text x="574" y="78" fontSize="10" fill="#0B1A2A" style={{ fontFamily: "var(--etat-font-mono)" }}>43 %</text>
        {[0, 2, 4, 7].map((index) => (
          <text key={resultTrendDemo[index].label} x={(index / 7) * 600} y="196" fontSize="9.5" fill="rgba(11,26,42,.45)" style={{ fontFamily: "var(--etat-font-mono)" }}>{resultTrendDemo[index].label}</text>
        ))}
      </svg>
      <p className="mt-3 text-[10.5px] leading-4 text-[var(--etat-stone-600)]">{ETAT_DEMO_SERIES_NOTICE} Aucune causalité n’est affirmée entre les deux courbes.</p>
    </figure>
  );
}

