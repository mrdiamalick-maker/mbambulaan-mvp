"use client";

import { useState } from "react";
import { Boxes, Factory, Fish, Layers3, MapPinned, ShieldCheck, Store } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TerritoryMap } from "@/components/territories/TerritoryMap";
import { TrustBadge } from "@/components/ui/Badges";

type Layer = "situation" | "infrastructure" | "espece" | "prix" | "rarete" | "durabilite";

const layerLabels: Array<{ id: Layer; label: string; icon: typeof Layers3 }> = [
  { id: "situation", label: "Tensions", icon: MapPinned },
  { id: "infrastructure", label: "Capacités", icon: Factory },
  { id: "espece", label: "Espèces", icon: Fish },
  { id: "prix", label: "Prix", icon: Store },
  { id: "rarete", label: "Rareté", icon: Boxes },
  { id: "durabilite", label: "Durabilité", icon: ShieldCheck }
];

export function AtlasWorkspace({ publicMode = false }: { publicMode?: boolean }) {
  const { state } = useProduct();
  const [selected, setSelected] = useState("joal");
  const [layer, setLayer] = useState<Layer>("situation");
  if (!state) return null;
  const territory = state.territories.find((item) => item.id === selected) ?? state.territories[0];
  const content = (() => {
    if (layer === "situation") {
      return state.situations.filter((item) => item.territoryId === territory.id).map((item) => ({
        title: item.title,
        value: item.priority,
        detail: item.nextStep,
        trust: item.trust
      }));
    }
    if (layer === "infrastructure") {
      return state.infrastructures.filter((item) => item.territoryId === territory.id).map((item) => ({
        title: item.name,
        value: item.status,
        detail: `${item.availableCapacity}/${item.theoreticalCapacity} ${item.unit}`,
        trust: item.trust
      }));
    }
    if (layer === "prix") {
      return state.priceObservations.filter((item) => item.territoryId === territory.id).map((item) => ({
        title: state.species.find((species) => species.id === item.speciesId)?.name ?? item.speciesId,
        value: `${item.priceFcfaKg.toLocaleString("fr-FR")} FCFA/kg`,
        detail: `${item.marketName} · tendance ${item.trend}`,
        trust: item.trust
      }));
    }
    if (layer === "rarete") {
      return state.scarcity.filter((item) => item.territoryId === territory.id).map((item) => ({
        title: state.species.find((species) => species.id === item.speciesId)?.name ?? item.speciesId,
        value: item.status.replaceAll("_", " "),
        detail: item.reasons[0],
        trust: item.trust
      }));
    }
    if (layer === "espece") {
      const speciesIds = new Set(
        state.lots.filter((lot) => lot.siteId === `quai-${territory.id}`).map((lot) => lot.speciesId)
      );
      return state.species.filter((item) => speciesIds.has(item.id)).map((item) => ({
        title: item.name,
        value: item.sensitivity,
        detail: item.seasonality,
        trust: "observee" as const
      }));
    }
    return state.sustainability
      .filter((item) => state.lots.find((lot) => lot.id === item.lotId)?.siteId === `quai-${territory.id}`)
      .map((item) => ({
        title: state.species.find((species) => species.id === state.lots.find((lot) => lot.id === item.lotId)?.speciesId)?.name ?? "Lot",
        value: item.status,
        detail: item.recommendation,
        trust: item.trust
      }));
  })();

  return (
    <div className="space-y-5">
      <div className="surface flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="label">{publicMode ? "Atlas public limité" : "Couches professionnelles"}</p><p className="mt-1 text-sm text-[#60737a]">Sélectionnez une lecture pour comprendre une tension et son action possible.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Couches de l’Atlas">
          {layerLabels.filter((item) => !publicMode || ["situation", "infrastructure", "espece"].includes(item.id)).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setLayer(id)} className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold ${layer === id ? "border-[#075466] bg-[#075466] text-white" : "border-[#c8d7da] bg-white text-[#52666d]"}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
      <TerritoryMap state={state} selectedId={selected} onSelect={setSelected} />
      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#d8e1e2] bg-[#f8fbfb] p-4">
          <div><p className="label">{layerLabels.find((item) => item.id === layer)?.label}</p><h2 className="mt-1 text-lg font-bold">{territory.name}</h2></div>
          <span className="text-xs text-[#60737a]">{content.length} élément(s)</span>
        </div>
        {content.length ? (
          <div className="grid gap-px bg-[#d8e1e2] md:grid-cols-2 xl:grid-cols-3">
            {content.map((item, index) => (
              <article key={`${item.title}-${index}`} className="min-w-0 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold">{item.title}</h3>
                  <TrustBadge trust={item.trust} />
                </div>
                <p className="mt-3 text-sm font-bold capitalize text-[#075466]">{item.value}</p>
                <p className="mt-2 text-xs leading-5 text-[#60737a]">{item.detail}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-[#60737a]">Aucune donnée exploitable sur cette couche pour le territoire sélectionné. La lacune est visible, elle n’est pas interprétée comme une absence de problème.</div>
        )}
      </section>
    </div>
  );
}
