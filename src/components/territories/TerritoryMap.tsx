"use client";

import {
  Anchor,
  Radio,
  Waves
} from "lucide-react";
import type { ProductState } from "@/domain/types";
import { TerritoryDecisionPanel } from "@/components/territories/TerritoryDecisionPanel";

const positions: Record<string, [number, number]> = {
  "saint-louis": [43, 9],
  lompoul: [34, 15],
  "fass-boye": [49, 21],
  kayar: [36, 27],
  yoff: [47, 33],
  ouakam: [34, 38],
  soumbedioune: [48, 41],
  hann: [59, 43],
  rufisque: [49, 48],
  popenguine: [35, 52],
  mbour: [49, 57],
  joal: [37, 63],
  foundiougne: [51, 68],
  djiffer: [37, 73],
  missirah: [50, 78],
  kafountine: [34, 84],
  elinkine: [48, 89],
  "cap-skirring": [36, 95]
};

const activityTone = {
  critique: { dot: "#c65242", halo: "bg-[#c65242]", label: "Action requise" },
  vigilance: { dot: "#d8951a", halo: "bg-[#d8951a]", label: "Sous vigilance" },
  stable: { dot: "#1fb6a4", halo: "bg-[#1fb6a4]", label: "Situation stable" }
} as const;

export function TerritoryMap({
  state,
  selectedId,
  onSelect,
  compact = false
}: {
  state: ProductState;
  selectedId?: string;
  onSelect?: (id: string) => void;
  compact?: boolean;
}) {
  const selected = state.territories.find((item) => item.id === selectedId) ?? state.territories[0];
  return (
    <section className={`overflow-hidden rounded-[22px] border border-[#bfd0d2] bg-white shadow-[0_24px_70px_rgba(3,26,34,.12)] ${compact ? "" : "xl:grid xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,.7fr)]"}`}>
      <div className={`ocean-grid relative overflow-hidden ${compact ? "min-h-[440px]" : "min-h-[620px]"}`}>
        <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#031a22]/72 px-4 py-3 text-white backdrop-blur md:px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#5fe0d3]/14 text-[#74e1d6]"><Waves size={18} /></span>
            <div><p className="text-[10px] font-black uppercase tracking-[.1em] text-white/42">Vue littorale commune</p><p className="mt-0.5 text-sm font-bold">Quais et activité territoriale</p></div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-white/54">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#1fb6a4]" /> Stable</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#d8951a]" /> Vigilance</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#c65242]" /> Action</span>
          </div>
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 820 620" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4f1e8" />
              <stop offset="1" stopColor="#dddccf" />
            </linearGradient>
            <linearGradient id="coastGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#74e1d6" stopOpacity=".35" />
              <stop offset="1" stopColor="#74e1d6" stopOpacity=".08" />
            </linearGradient>
          </defs>
          <path d="M650 0 L820 0 L820 620 L595 620 C620 560 570 516 606 467 C642 418 579 366 620 315 C659 265 594 210 635 163 C671 122 626 78 650 0Z" fill="url(#land)" />
          <path d="M650 0 C626 78 671 122 635 163 C594 210 659 265 620 315 C579 366 642 418 606 467 C570 516 620 560 595 620" fill="none" stroke="url(#coastGlow)" strokeWidth="5" />
          <path className="flow-line" d="M250 105 C330 140 386 212 338 278 C290 344 316 426 390 487" fill="none" stroke="#74e1d6" strokeWidth="2" strokeDasharray="8 13" opacity=".35" />
          <path className="flow-line" d="M175 350 C270 314 350 334 450 404" fill="none" stroke="#d7aa58" strokeWidth="2" strokeDasharray="5 12" opacity=".30" />
          <circle cx="220" cy="215" r="3" fill="#74e1d6" opacity=".5" />
          <circle cx="282" cy="412" r="3" fill="#74e1d6" opacity=".5" />
          <circle cx="150" cy="487" r="2.5" fill="#74e1d6" opacity=".4" />
        </svg>

        <div className="absolute bottom-5 left-5 z-10 hidden text-[10px] font-black uppercase tracking-[.16em] text-white/32 sm:block">Océan Atlantique</div>
        <div className="absolute left-5 top-20 z-10 hidden rounded-xl border border-white/10 bg-[#031a22]/55 px-3 py-2 text-[10px] font-bold text-white/52 backdrop-blur sm:block">
          Données de démonstration · géométrie illustrative
        </div>

        {state.territories.map((territory) => {
          const [left, top] = positions[territory.id] ?? [50, 50];
          const situations = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee");
          const territoryLandings = state.landings.filter((item) => item.siteId === `quai-${territory.id}`);
          const volume = territoryLandings.reduce((sum, item) => sum + item.totalWeightKg, 0);
          const tone = activityTone[territory.activity];
          const active = selected.id === territory.id;
          return (
            <button
              key={territory.id}
              onClick={() => onSelect?.(territory.id)}
              style={{ left: `${left}%`, top: `${top}%` }}
              className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left"
              aria-label={`Ouvrir le quai de ${territory.name}`}
            >
              <span className={`absolute left-1/2 top-0 size-7 -translate-x-1/2 -translate-y-[7px] rounded-full opacity-45 map-pulse ${tone.halo}`} />
              <span className="relative mx-auto grid size-8 place-items-center rounded-full border-[3px] border-white shadow-[0_5px_18px_rgba(3,26,34,.35)]" style={{ backgroundColor: tone.dot }}>
                <Anchor size={13} className="text-white" strokeWidth={2.5} />
              </span>
              <span className={`mt-1.5 block min-w-28 rounded-lg border px-2.5 py-1.5 shadow-lg backdrop-blur transition ${active ? "border-[#74e1d6] bg-[#052630] text-white" : "border-white/12 bg-[#031a22]/82 text-white/85 group-hover:border-white/28 group-hover:bg-[#052630]"}`}>
                <span className="block text-[11px] font-extrabold">{territory.name}</span>
                <span className="mt-0.5 block text-[9px] font-semibold text-white/48">{volume ? `${(volume / 1000).toFixed(1)} t · ` : ""}{situations.length} situation{situations.length > 1 ? "s" : ""}</span>
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-4 right-4 z-20 rounded-xl border border-white/10 bg-[#031a22]/72 px-3 py-2 text-[10px] text-white/54 backdrop-blur">
          <Radio size={12} className="mr-1.5 inline text-[#74e1d6]" /> Sources et fraîcheur visibles dans chaque fiche
        </div>
      </div>

      {!compact && (
        <TerritoryDecisionPanel
          state={state}
          territory={selected}
        />
      )}
    </section>
  );
}
