"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Anchor,
  ArrowRight,
  Boxes,
  CalendarDays,
  Factory,
  Fish,
  Layers3,
  Leaf,
  Radio,
  Search,
  Store
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TerritoryMap } from "@/components/territories/TerritoryMap";
import { TerritoryPulse } from "@/components/territories/TerritoryPulse";
import { TerritoryInsightPanel } from "@/components/territories/TerritoryInsightPanel";
import { TerritoryFlow } from "@/components/territories/TerritoryFlow";
import { TrustBadge } from "@/components/ui/Badges";
import type { TrustLevel } from "@/domain/types";

type Layer = "quai" | "capacites" | "produits" | "marches" | "durabilite";

const layers: Array<{ id: Layer; label: string; description: string; icon: typeof Anchor }> = [
  { id: "quai", label: "Vue du quai", description: "Activité, pirogues et situations", icon: Anchor },
  { id: "capacites", label: "Capacités", description: "Froid, pesée et transport", icon: Factory },
  { id: "produits", label: "Produits", description: "Débarquements, espèces et lots", icon: Fish },
  { id: "marches", label: "Marchés", description: "Prix, besoins et tensions", icon: Store },
  { id: "durabilite", label: "Durabilité", description: "Provenance, complétude et pratiques", icon: Leaf }
];

type AtlasItem = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  detail: string;
  source: string;
  updatedAt?: string;
  trust: TrustLevel;
  href?: string;
};

export function AtlasWorkspace({ publicMode = false }: { publicMode?: boolean }) {
  const { state } = useProduct();
  const [selected, setSelected] = useState("joal");
  const [layer, setLayer] = useState<Layer>("quai");
  const [speciesId, setSpeciesId] = useState("all");
  const [period, setPeriod] = useState("today");
  if (!state) return null;

  const territory = state.territories.find((item) => item.id === selected) ?? state.territories[0];
  const quayId = `quai-${territory.id}`;
  const selectedLayer = layers.find((item) => item.id === layer) ?? layers[0];
  const SelectedLayerIcon = selectedLayer.icon;

  const items: AtlasItem[] = (() => {
    if (layer === "quai") {
      const situations = state.situations.filter((item) => item.territoryId === territory.id);
      const vessels = state.vessels.filter((item) => item.homeSiteId === quayId);
      return [
        ...situations.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: "Situation territoriale",
          value: item.priority === "critique" ? "Action requise" : item.priority === "haute" ? "À coordonner" : "À surveiller",
          detail: item.nextStep,
          source: state.observations.find((observation) => item.observationIds.includes(observation.id))?.source ?? "Signal territorial",
          updatedAt: item.history.at(-1)?.at,
          trust: item.trust,
          href: `/app/situations/${item.id}`
        })),
        ...vessels.map((vessel) => ({
          id: vessel.id,
          title: vessel.name,
          subtitle: "Pirogue rattachée au quai",
          value: vessel.registration,
          detail: state.trips.find((trip) => trip.vesselId === vessel.id)?.status.replaceAll("_", " ") ?? "Aucune sortie active",
          source: "Référentiel des actifs de démonstration",
          trust: vessel.trust,
          href: "/app/operations"
        }))
      ];
    }
    if (layer === "capacites") {
      return state.infrastructures.filter((item) => item.territoryId === territory.id).map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.type.replaceAll("_", " "),
        value: item.status.replaceAll("_", " "),
        detail: `${item.availableCapacity}/${item.theoreticalCapacity} ${item.unit} disponibles`,
        source: state.sites.find((site) => site.id === item.siteId)?.source ?? "Référentiel de démonstration",
        updatedAt: item.updatedAt,
        trust: item.trust,
        href: state.situations.find((situation) => situation.territoryId === territory.id && situation.title.toLowerCase().includes("glace"))
          ? `/app/situations/${state.situations.find((situation) => situation.territoryId === territory.id && situation.title.toLowerCase().includes("glace"))?.id}`
          : "/app/coordination"
      }));
    }
    if (layer === "produits") {
      const landings = state.landings.filter((item) => item.siteId === quayId);
      return landings.flatMap((landing) => landing.catches)
        .filter((catchLine) => speciesId === "all" || catchLine.speciesId === speciesId)
        .map((catchLine) => {
          const species = state.species.find((item) => item.id === catchLine.speciesId);
          const landing = landings.find((item) => item.catches.some((candidate) => candidate.id === catchLine.id));
          return {
            id: catchLine.id,
            title: species?.name ?? catchLine.speciesId,
            subtitle: `Débarquement ${landing?.id ?? "non renseigné"}`,
            value: `${catchLine.quantityKg.toLocaleString("fr-FR")} kg`,
            detail: `Qualité ${catchLine.quality} · ${catchLine.productForm.replaceAll("_", " ")}`,
            source: landing?.weighingSource ?? "Pesée à confirmer",
            updatedAt: landing?.weighedAt,
            trust: landing?.trust ?? "declaree",
            href: "/app/operations"
          };
        });
    }
    if (layer === "marches") {
      return state.priceObservations
        .filter((item) => item.territoryId === territory.id && (speciesId === "all" || item.speciesId === speciesId))
        .map((item) => ({
          id: item.id,
          title: state.species.find((species) => species.id === item.speciesId)?.name ?? item.speciesId,
          subtitle: item.marketName,
          value: `${item.priceFcfaKg.toLocaleString("fr-FR")} FCFA/kg`,
          detail: `Tendance ${item.trend}${item.flagged ? " · observation à vérifier" : ""}`,
          source: item.source,
          updatedAt: item.observedAt,
          trust: item.trust,
          href: "/app/marches"
        }));
    }
    return state.sustainability
      .filter((item) => {
        const lot = state.lots.find((candidate) => candidate.id === item.lotId);
        return lot?.siteId === quayId && (speciesId === "all" || lot.speciesId === speciesId);
      })
      .map((item) => {
        const lot = state.lots.find((candidate) => candidate.id === item.lotId);
        const species = state.species.find((candidate) => candidate.id === lot?.speciesId);
        return {
          id: item.id,
          title: species?.name ?? item.lotId,
          subtitle: `Lot ${item.lotId}`,
          value: item.status,
          detail: item.recommendation,
          source: `Chaîne de traçabilité · complétude ${lot?.traceabilityCompleteness ?? 0}%`,
          trust: item.trust,
          href: "/app/durabilite"
        };
      });
  })();

  const visibleLayers = publicMode ? layers.filter((item) => ["quai", "capacites", "produits"].includes(item.id)) : layers;

  return (
    <div className="space-y-5">
      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-[#d9e3e3] p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
          <div className="max-w-lg">
            <p className="label">{publicMode ? "Atlas public · aperçu" : "Composer la vue"}</p>
            <p className="mt-2 text-sm leading-6 text-[#667b81]">
              La carte localise les quais. Les couches ouvrent leurs fiches d’activité, sans surcharger la géographie.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Vues du jumeau territorial">
            {visibleLayers.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setLayer(id)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${layer === id ? "border-[#075568] bg-[#075568] text-white shadow-sm" : "border-[#d0ddde] bg-white text-[#536970] hover:border-[#8ab9bf] hover:bg-[#f1f8f7]"}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {!publicMode && (
          <div className="grid gap-3 bg-[#f8fbfa] p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label>
              <span className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[#71858a]">Espèce</span>
              <span className="relative mt-1.5 block">
                <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[#71858a]" />
                <select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-[#d0ddde] bg-white pl-9 pr-3 text-sm font-semibold text-[#102e37]">
                  <option value="all">Toutes les espèces</option>
                  {state.species.map((species) => <option key={species.id} value={species.id}>{species.name}</option>)}
                </select>
              </span>
            </label>
            <label>
              <span className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[#71858a]">Période</span>
              <span className="relative mt-1.5 block">
                <CalendarDays size={15} className="pointer-events-none absolute left-3 top-3 text-[#71858a]" />
                <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-[#d0ddde] bg-white pl-9 pr-3 text-sm font-semibold text-[#102e37]">
                  <option value="today">Aujourd’hui</option>
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                </select>
              </span>
            </label>
            <div className="data-chip h-10 justify-center px-3"><Radio size={13} className="text-[#118f83]" /> {items.length} objet{items.length > 1 ? "s" : ""} relié{items.length > 1 ? "s" : ""}</div>
          </div>
        )}
      </section>

      <TerritoryPulse
        state={state}
        territory={territory}
      />

      <TerritoryInsightPanel
        state={state}
        territory={territory}
      />

      <TerritoryFlow
        state={state}
        territory={territory}
      />

      <TerritoryMap
        state={state}
        selectedId={selected}
        onSelect={setSelected}
      />

      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#d9e3e3] bg-[#f8fbfa] p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#08758a]"><SelectedLayerIcon size={17} /><p className="label">{selectedLayer.label}</p></div>
            <h2 className="mt-2 text-xl font-[740] tracking-[-.03em] text-[#102e37]">Fiche de {territory.name}</h2>
            <p className="mt-1 text-xs text-[#667b81]">{selectedLayer.description} · {period === "today" ? "situation du jour" : period === "7d" ? "7 derniers jours" : "30 derniers jours"}</p>
          </div>
          <span className="data-chip"><Layers3 size={13} /> Une représentation unique du quai</span>
        </div>

        {items.length ? (
          <div className="divide-y divide-[#e1e9e9]">
            {items.map((item) => (
              <article key={item.id} className="grid gap-4 p-4 transition hover:bg-[#fbfdfc] md:grid-cols-[minmax(0,1.25fr)_minmax(150px,.5fr)_minmax(0,1fr)_auto] md:items-center md:px-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.07em] text-[#7a8e94]">{item.subtitle}</p>
                  <h3 className="mt-1 truncate font-bold text-[#102e37]">{item.title}</h3>
                  <div className="mt-2"><TrustBadge trust={item.trust} source={item.source} /></div>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.07em] text-[#7a8e94]">Lecture</p>
                  <p className="mt-1 text-sm font-bold capitalize text-[#075568]">{item.value}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-5 text-[#526970]">{item.detail}</p>
                  <p className="mt-1 truncate text-[10px] text-[#8a9a9e]">Source : {item.source}{item.updatedAt ? ` · ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.updatedAt))}` : ""}</p>
                </div>
                {!publicMode && item.href ? <Link href={item.href} className="btn-secondary whitespace-nowrap">Ouvrir <ArrowRight size={14} /></Link> : <span className="text-[10px] font-bold text-[#8a9a9e]">Vue publique</span>}
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-44 place-items-center p-8 text-center">
            <div className="max-w-lg"><Boxes className="mx-auto text-[#9db0b4]" /><h3 className="mt-3 font-bold">Aucune observation pour cette lecture</h3><p className="mt-2 text-sm leading-6 text-[#667b81]">La lacune reste visible et ne sera pas interprétée automatiquement comme une absence d’activité.</p></div>
          </div>
        )}
      </section>
    </div>
  );
}
