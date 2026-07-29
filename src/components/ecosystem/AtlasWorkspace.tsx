"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Boxes, Factory, Fish, Layers3, MapPinned, ShieldCheck, Store } from "lucide-react";
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
  const [speciesId, setSpeciesId] = useState("all");
  const [period, setPeriod] = useState("today");
  if (!state) return null;
  const territory = state.territories.find((item) => item.id === selected) ?? state.territories[0];
  const acceptsSpecies = (candidate?: string) => speciesId === "all" || candidate === speciesId;
  const content = (() => {
    if (layer === "situation") {
      return state.situations.filter((item) => item.territoryId === territory.id).map((item) => ({
        title: item.title,
        value: item.priority,
        detail: item.nextStep,
        trust: item.trust,
        source: state.observations.find((observation) => item.observationIds.includes(observation.id))?.source ?? "Signal territorial",
        updatedAt: item.history.at(-1)?.at,
        href: `/app/situations/${item.id}`
      }));
    }
    if (layer === "infrastructure") {
      return state.infrastructures.filter((item) => item.territoryId === territory.id).map((item) => ({
        title: item.name,
        value: item.status,
        detail: `${item.availableCapacity}/${item.theoreticalCapacity} ${item.unit} disponibles · gestionnaire ${state.organizations.find((organization) => organization.id === item.organizationId)?.name ?? "non renseigné"}`,
        trust: item.trust,
        source: state.sites.find((site) => site.id === item.siteId)?.source ?? "Référentiel de démonstration",
        updatedAt: item.updatedAt,
        href: state.situations.find((situation) => situation.territoryId === territory.id && situation.title.toLowerCase().includes("glace")) ? `/app/situations/${state.situations.find((situation) => situation.territoryId === territory.id && situation.title.toLowerCase().includes("glace"))?.id}` : "/app/coordination"
      }));
    }
    if (layer === "prix") {
      return state.priceObservations.filter((item) => item.territoryId === territory.id && acceptsSpecies(item.speciesId)).map((item) => ({
        title: state.species.find((species) => species.id === item.speciesId)?.name ?? item.speciesId,
        value: `${item.priceFcfaKg.toLocaleString("fr-FR")} FCFA/kg`,
        detail: `${item.marketName} · tendance ${item.trend}`,
        trust: item.trust,
        source: item.source,
        updatedAt: item.observedAt,
        href: "/app/marches",
        speciesId: item.speciesId
      }));
    }
    if (layer === "rarete") {
      return state.scarcity.filter((item) => item.territoryId === territory.id && acceptsSpecies(item.speciesId)).map((item) => ({
        title: state.species.find((species) => species.id === item.speciesId)?.name ?? item.speciesId,
        value: item.status.replaceAll("_", " "),
        detail: `${item.availableKg.toLocaleString("fr-FR")} kg disponibles / ${item.requestedKg.toLocaleString("fr-FR")} kg demandés · ${item.reasons[0]}`,
        trust: item.trust,
        source: "Lots, besoins et observations de marché du seed",
        updatedAt: state.priceObservations.find((price) => price.speciesId === item.speciesId && price.territoryId === territory.id)?.observedAt,
        href: "/app/marches",
        speciesId: item.speciesId
      }));
    }
    if (layer === "espece") {
      const speciesIds = new Set(
        state.lots.filter((lot) => lot.siteId === `quai-${territory.id}`).map((lot) => lot.speciesId)
      );
      return state.species.filter((item) => speciesIds.has(item.id) && acceptsSpecies(item.id)).map((item) => ({
        title: item.name,
        value: item.sensitivity,
        detail: `${item.family} · ${item.seasonality} · prix indicatif ${item.indicativePriceFcfaKg.toLocaleString("fr-FR")} FCFA/kg`,
        trust: "observee" as const,
        source: "Référentiel partagé et lots de démonstration",
        updatedAt: state.landings.find((landing) => landing.siteId === `quai-${territory.id}`)?.weighedAt,
        href: "/app/durabilite",
        speciesId: item.id
      }));
    }
    return state.sustainability
      .filter((item) => {
        const lot = state.lots.find((candidate) => candidate.id === item.lotId);
        return lot?.siteId === `quai-${territory.id}` && acceptsSpecies(lot.speciesId);
      })
      .map((item) => ({
        title: state.species.find((species) => species.id === state.lots.find((lot) => lot.id === item.lotId)?.speciesId)?.name ?? "Lot",
        value: item.status,
        detail: item.recommendation,
        trust: item.trust,
        source: `Traçabilité du lot ${item.lotId}`,
        updatedAt: state.landings.find((landing) => landing.id === state.lots.find((lot) => lot.id === item.lotId)?.landingId)?.weighedAt,
        href: "/app/durabilite",
        speciesId: state.lots.find((lot) => lot.id === item.lotId)?.speciesId
      }));
  })();
  const selectedSpecies = state.species.find((species) => species.id === speciesId);
  const speciesLots = selectedSpecies ? state.lots.filter((lot) => lot.speciesId === selectedSpecies.id) : [];
  const speciesPrices = selectedSpecies ? state.priceObservations.filter((price) => price.speciesId === selectedSpecies.id) : [];
  const speciesNeeds = selectedSpecies ? state.needs.filter((need) => need.speciesId === selectedSpecies.id) : [];
  const averagePrice = speciesPrices.length
    ? Math.round(speciesPrices.reduce((sum, price) => sum + price.priceFcfaKg, 0) / speciesPrices.length)
    : selectedSpecies?.indicativePriceFcfaKg;

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
      {!publicMode && (
        <div className="surface grid gap-4 p-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-[#60737a]">Espèce</span>
            <select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} className="mt-2 w-full border border-[#c8d7da] bg-white p-2.5 text-sm">
              <option value="all">Toutes les espèces</option>
              {state.species.map((species) => <option key={species.id} value={species.id}>{species.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-[#60737a]">Période de lecture</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-2 w-full border border-[#c8d7da] bg-white p-2.5 text-sm">
              <option value="today">Aujourd’hui</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
            </select>
          </label>
        </div>
      )}
      <TerritoryMap state={state} selectedId={selected} onSelect={setSelected} />
      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#d8e1e2] bg-[#f8fbfb] p-4">
          <div><p className="label">{layerLabels.find((item) => item.id === layer)?.label}</p><h2 className="mt-1 text-lg font-bold">{territory.name}</h2></div>
          <span className="text-right text-xs text-[#60737a]">{content.length} élément(s){!publicMode && <><br />{period === "today" ? "Aujourd’hui" : period === "7d" ? "7 derniers jours" : "30 derniers jours"}</>}</span>
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
                <div className="mt-4 border-t border-[#e1e8e8] pt-3 text-xs leading-5 text-[#60737a]">
                  <p><strong className="text-[#445b62]">Source :</strong> {item.source}</p>
                  <p><strong className="text-[#445b62]">Fraîcheur :</strong> {item.updatedAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.updatedAt)) : "date non disponible"}</p>
                </div>
                {!publicMode && <Link href={item.href} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#075466]">Ouvrir l’objet métier <ArrowRight size={14} /></Link>}
              </article>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-[#60737a]">Aucune donnée exploitable sur cette couche pour le territoire sélectionné. La lacune est visible, elle n’est pas interprétée comme une absence de problème.</div>
        )}
      </section>
      {selectedSpecies && (
        <section className="surface overflow-hidden">
          <div className="border-b border-[#d8e1e2] bg-[#eef8f7] p-5">
            <p className="label">Dossier espèce</p>
            <h2 className="mt-1 text-2xl font-bold text-[#062d36]">{selectedSpecies.name}</h2>
            <p className="mt-2 text-sm text-[#60737a]">{selectedSpecies.family} · {selectedSpecies.seasonality}</p>
          </div>
          <div className="grid gap-px bg-[#d8e1e2] sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Volumes récents", `${speciesLots.reduce((sum, lot) => sum + lot.quantityKg, 0).toLocaleString("fr-FR")} kg`, "Lots reliés aux débarquements"],
              ["Prix indicatif", `${(averagePrice ?? 0).toLocaleString("fr-FR")} FCFA/kg`, speciesPrices[0]?.trend ? `Tendance ${speciesPrices[0].trend}` : "Référentiel partagé"],
              ["Débouchés", speciesNeeds.length ? [...new Set(speciesNeeds.map((need) => need.purpose))].join(", ") : "À qualifier", "Besoins ouverts du seed"],
              ["Vigilance", selectedSpecies.sensitivity, state.scarcity.find((item) => item.speciesId === selectedSpecies.id)?.reasons[0] ?? "Aucune alerte active"]
            ].map(([label, value, detail]) => (
              <article key={label} className="bg-white p-4">
                <p className="text-xs text-[#60737a]">{label}</p>
                <p className="mt-2 font-bold capitalize text-[#062d36]">{value}</p>
                <p className="mt-2 text-xs leading-5 text-[#60737a]">{detail}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div><p className="text-xs font-bold uppercase text-[#60737a]">Formes et qualité observées</p><p className="mt-2 text-sm leading-6">{[...new Set(speciesLots.map((lot) => `${lot.productForm.replaceAll("_", " ")} · qualité ${lot.quality}`))].join(" ; ") || "Aucun lot récent"}</p></div>
            <div><p className="text-xs font-bold uppercase text-[#60737a]">Valorisation et transformation</p><p className="mt-2 text-sm leading-6">{speciesNeeds.some((need) => need.purpose === "transformation") ? "Transformation identifiée dans les besoins ouverts ; orientation humaine requise." : "Débouché à qualifier avec les acteurs du territoire."}</p></div>
          </div>
        </section>
      )}
    </div>
  );
}
