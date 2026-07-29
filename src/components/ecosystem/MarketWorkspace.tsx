"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, CircleHelp, Minus, Search, ShieldAlert } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { CommandButton } from "@/components/ui/CommandButton";
import { TrustBadge } from "@/components/ui/Badges";

export function MarketWorkspace() {
  const { state } = useProduct();
  const [speciesId, setSpeciesId] = useState("all");
  const [territoryId, setTerritoryId] = useState("all");
  if (!state) return null;
  const prices = state.priceObservations.filter((item) =>
      (speciesId === "all" || item.speciesId === speciesId) &&
      (territoryId === "all" || item.territoryId === territoryId)
  );
  return (
    <div className="space-y-6">
      <section className="surface grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block"><span className="text-xs font-bold text-[#60737a]">Espèce</span><select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} className="mt-2 w-full border border-[#c8d7da] bg-white p-2.5 text-sm"><option value="all">Toutes les espèces</option>{state.species.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block"><span className="text-xs font-bold text-[#60737a]">Territoire</span><select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-2 w-full border border-[#c8d7da] bg-white p-2.5 text-sm"><option value="all">Tous les territoires</option>{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <div className="inline-flex items-center gap-2 bg-[#f4fbfc] px-4 py-3 text-sm font-bold text-[#075466]"><Search size={16} /> {prices.length} observation(s)</div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="surface overflow-hidden">
          <div className="border-b border-[#d8e1e2] bg-[#f8fbfb] p-4"><p className="label">Observations de prix</p><h2 className="mt-1 text-lg font-bold">Source, date et confiance visibles</h2></div>
          <div className="divide-y divide-[#e1e8e8]">
            {prices.map((item) => {
              const species = state.species.find((speciesItem) => speciesItem.id === item.speciesId);
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              const TrendIcon = item.trend === "hausse" ? ArrowUpRight : item.trend === "baisse" ? ArrowDownRight : Minus;
              return (
                <article key={item.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{species?.name}</h3><TrustBadge trust={item.trust} source={item.source} />{item.flagged && <span className="rounded-full bg-[#fff1ee] px-2 py-1 text-xs font-bold text-[#9c392b]">À vérifier</span>}</div><p className="mt-2 text-xs text-[#60737a]">{territory?.name} · {item.marketName} · {item.source}</p></div>
                  <div className="min-w-36"><p className="text-xl font-bold">{item.priceFcfaKg.toLocaleString("fr-FR")} FCFA</p><p className="text-xs text-[#60737a]">par kg · simulation</p></div>
                  <div className="flex items-center gap-3"><span className={`inline-flex items-center gap-1 text-xs font-bold ${item.trend === "hausse" ? "text-[#9c392b]" : item.trend === "baisse" ? "text-[#126b58]" : "text-[#60737a]"}`}><TrendIcon size={15} /> {item.trend}</span>{!item.flagged && <CommandButton tone="secondary" command={{ type: "flag_price", priceId: item.id }}>Signaler une anomalie</CommandButton>}</div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="surface p-5">
          <div className="flex items-center gap-2 text-[#075466]"><ShieldAlert size={20} /><p className="label">Rareté explicable</p></div>
          <div className="mt-5 space-y-5">
            {state.scarcity.filter((item) => speciesId === "all" || item.speciesId === speciesId).map((item) => {
              const species = state.species.find((speciesItem) => speciesItem.id === item.speciesId);
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              return <article key={item.id} className="border-l-4 border-[#d89614] bg-[#fff8e8] p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{species?.name}</h3><p className="text-xs text-[#60737a]">{territory?.name}</p></div><strong className="text-xs uppercase text-[#76530d]">{item.status.replaceAll("_", " ")}</strong></div><p className="mt-3 text-xs leading-5 text-[#60737a]">{item.reasons.join(" · ")}</p><div className="mt-3 flex items-center gap-2 text-xs"><CircleHelp size={14} /><span>{item.availableKg} kg observés / {item.requestedKg} kg demandés</span></div></article>;
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}
