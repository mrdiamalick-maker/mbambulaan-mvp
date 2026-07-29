"use client";

import Link from "next/link";
import { Anchor, Factory, MapPin } from "lucide-react";
import type { ProductState } from "@/domain/types";

const positions: Record<string, [number, number]> = {
  "saint-louis": [38, 16],
  kayar: [48, 36],
  hann: [42, 47],
  mbour: [48, 58],
  joal: [50, 66],
  kafountine: [37, 88]
};

export function TerritoryMap({ state, selectedId, onSelect }: { state: ProductState; selectedId?: string; onSelect?: (id: string) => void }) {
  const selected = state.territories.find((item) => item.id === selectedId) ?? state.territories[0];
  const related = state.situations.filter((item) => item.territoryId === selected?.id);
  return (
    <div className="grid min-w-0 overflow-hidden border border-[#c8d7da] bg-white lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)]">
      <div className="map-grid relative min-h-[480px] overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-[46%] bg-[#eef0e8] [clip-path:polygon(40%_0,100%_0,100%_100%,25%_100%,48%_78%,32%_62%,50%_43%,30%_24%)]" />
        <div className="absolute left-5 top-5 border border-[#b9dfe4] bg-white/90 px-3 py-2 text-xs font-semibold text-[#075466]">
          Littoral sénégalais · données simulées
        </div>
        <span className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[.1em] text-[#4a8792]">Océan Atlantique</span>
        {state.territories.map((territory) => {
          const [left, top] = positions[territory.id] ?? [50, 50];
          const count = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").length;
          const tone = territory.activity === "critique" ? "bg-[#c94f3d]" : territory.activity === "vigilance" ? "bg-[#d89614]" : "bg-[#18a394]";
          return (
            <button
              key={territory.id}
              onClick={() => onSelect?.(territory.id)}
              style={{ left: `${left}%`, top: `${top}%` }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-left"
              aria-label={`Sélectionner ${territory.name}`}
            >
              <span className={`block size-4 rounded-full border-3 border-white shadow-sm ${tone} ${selected?.id === territory.id ? "ring-4 ring-[#075466]/20" : ""}`} />
              <span className="mt-1 block whitespace-nowrap bg-white/90 px-2 py-1 text-xs font-bold text-[#17313a]">{territory.name} · {count}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <aside className="min-w-0 border-t border-[#c8d7da] p-5 lg:border-l lg:border-t-0">
          <p className="label">Territoire sélectionné</p>
          <h2 className="mt-2 text-xl font-bold text-[#062d36]">{selected.name}</h2>
          <p className="mt-1 text-sm text-[#60737a]">Région de {selected.region}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-[#f4fbfc] p-3"><dt className="text-xs text-[#60737a]">Situations ouvertes</dt><dd className="mt-1 text-2xl font-bold">{related.filter((item) => item.status !== "reglee").length}</dd></div>
            <div className="bg-[#f1faf7] p-3"><dt className="text-xs text-[#60737a]">Infrastructures</dt><dd className="mt-1 text-2xl font-bold">{selected.infrastructureIds.length}</dd></div>
          </dl>
          <div className="mt-6 space-y-3">
            {state.infrastructures.filter((item) => item.territoryId === selected.id).map((item) => (
              <div key={item.id} className="flex items-start gap-3 border-t border-[#e2e8e8] pt-3">
                {item.type === "quai" ? <Anchor size={17} className="mt-0.5 text-[#087287]" /> : <Factory size={17} className="mt-0.5 text-[#087287]" />}
                <div><p className="text-sm font-bold">{item.name}</p><p className="text-xs text-[#60737a]">État : {item.status}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-[#d8e1e2] pt-5">
            <p className="text-xs font-bold uppercase text-[#60737a]">Action recommandée</p>
            <p className="mt-2 text-sm leading-6">{related[0]?.nextStep ?? "Maintenir la veille territoriale"}</p>
            {related[0] && <Link href={`/app/situations/${related[0].id}`} className="mt-4 inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white"><MapPin size={16} /> Ouvrir la situation</Link>}
          </div>
        </aside>
      )}
    </div>
  );
}
