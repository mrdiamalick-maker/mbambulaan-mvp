"use client";

import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Factory,
  Fish,
  MapPin,
  Radio,
  ShipWheel,
  Waves
} from "lucide-react";
import type { ProductState } from "@/domain/types";

const positions: Record<string, [number, number]> = {
  "saint-louis": [43, 13],
  kayar: [37, 31],
  hann: [47, 43],
  mbour: [41, 57],
  joal: [48, 68],
  kafountine: [33, 87]
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
  const relatedSituations = state.situations.filter((item) => item.territoryId === selected?.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === selected?.id);
  const vessels = state.vessels.filter((item) => item.homeSiteId === `quai-${selected?.id}`);
  const landings = state.landings.filter((item) => item.siteId === `quai-${selected?.id}`);
  const speciesIds = new Set(landings.flatMap((item) => item.catches.map((catchLine) => catchLine.speciesId)));
  const species = state.species.filter((item) => speciesIds.has(item.id));
  const landedKg = landings.reduce((sum, item) => sum + item.totalWeightKg, 0);
  const selectedTone = activityTone[selected.activity];

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
        <aside className="min-w-0 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label">Nœud opérationnel</p>
              <h2 className="mt-2 text-2xl font-[740] tracking-[-.04em] text-[#102e37]">{selected.name}</h2>
              <p className="mt-1 text-sm text-[#667b81]">Quai · région de {selected.region}</p>
            </div>
            <span className="data-chip" style={{ borderColor: `${selectedTone.dot}55`, color: selectedTone.dot }}>
              <span className="size-2 rounded-full" style={{ backgroundColor: selectedTone.dot }} /> {selectedTone.label}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#d9e3e3] bg-[#d9e3e3]">
            {[
              ["Volume documenté", landedKg ? `${(landedKg / 1000).toFixed(2)} t` : "—"],
              ["Pirogues rattachées", String(vessels.length)],
              ["Espèces observées", String(species.length)],
              ["Capacités", `${infrastructures.filter((item) => item.status === "operationnelle").length}/${infrastructures.length}`]
            ].map(([label, value]) => (
              <div key={label} className="bg-[#f8fbfa] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[#7a8e94]">{label}</p>
                <p className="mt-1.5 text-xl font-[740] tracking-[-.03em] text-[#102e37]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#7a8e94]">Activité liée</p><span className="text-[10px] font-bold text-[#08758a]">Aujourd’hui</span></div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-[#f3f8f7] p-3">
                <span className="grid size-9 place-items-center rounded-lg bg-white text-[#08758a] shadow-sm"><ShipWheel size={17} /></span>
                <div className="min-w-0"><p className="truncate text-sm font-bold">{vessels.length ? vessels.map((item) => item.name).join(", ") : "Aucune pirogue rattachée"}</p><p className="mt-0.5 text-[11px] text-[#667b81]">{landings.length} débarquement{landings.length > 1 ? "s" : ""} documenté{landings.length > 1 ? "s" : ""}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-[#f3f8f7] p-3">
                <span className="grid size-9 place-items-center rounded-lg bg-white text-[#118f83] shadow-sm"><Fish size={17} /></span>
                <div className="min-w-0"><p className="truncate text-sm font-bold">{species.length ? species.map((item) => item.name).join(", ") : "Espèces à renseigner"}</p><p className="mt-0.5 text-[11px] text-[#667b81]">Reliées aux débarquements, pas à un point cartographique</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-[#f3f8f7] p-3">
                <span className="grid size-9 place-items-center rounded-lg bg-white text-[#d8951a] shadow-sm"><Factory size={17} /></span>
                <div className="min-w-0"><p className="truncate text-sm font-bold">{infrastructures.find((item) => item.status !== "operationnelle")?.name ?? "Capacités disponibles"}</p><p className="mt-0.5 text-[11px] text-[#667b81]">{infrastructures.filter((item) => item.status !== "operationnelle").length ? "Une réponse opérationnelle peut être requise" : "Aucune rupture active"}</p></div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#d9e3e3] pt-5">
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#7a8e94]">Situation prioritaire</p>
            <p className="mt-2 text-sm font-bold leading-5 text-[#102e37]">{relatedSituations[0]?.title ?? "Maintenir la veille territoriale"}</p>
            <p className="mt-2 text-xs leading-5 text-[#667b81]">{relatedSituations[0]?.nextStep ?? "Les sources disponibles ne signalent aucune action immédiate."}</p>
            {relatedSituations[0] && (
              <Link href={`/app/situations/${relatedSituations[0].id}`} className="btn-primary mt-4 w-full">
                Ouvrir la situation <ArrowRight size={15} />
              </Link>
            )}
            {!relatedSituations[0] && (
              <Link href="/app/operations" className="btn-secondary mt-4 w-full">
                Consulter les opérations <MapPin size={15} />
              </Link>
            )}
          </div>
        </aside>
      )}
    </section>
  );
}
