"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Anchor,
  BarChart3,
  ChevronDown,
  Compass,
  Factory,
  Fish,
  MapPin,
  Sparkles,
  Waves
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";

type PublicView = "portrait" | "activite" | "capacites" | "produits";

const positions: Record<string, [number, number]> = {
  "saint-louis": [43, 8],
  lompoul: [30, 14],
  "fass-boye": [49, 20],
  kayar: [33, 26],
  yoff: [48, 32],
  ouakam: [30, 37],
  soumbedioune: [48, 40],
  hann: [61, 43],
  rufisque: [48, 47],
  popenguine: [31, 52],
  mbour: [49, 57],
  joal: [33, 62],
  foundiougne: [51, 67],
  djiffer: [33, 72],
  missirah: [51, 77],
  kafountine: [31, 83],
  elinkine: [49, 88],
  "cap-skirring": [33, 94]
};

const views = [
  { id: "portrait" as const, label: "Portrait du quai", icon: Compass },
  { id: "activite" as const, label: "Activité observée", icon: BarChart3 },
  { id: "capacites" as const, label: "Capacités locales", icon: Factory },
  { id: "produits" as const, label: "Espèces & produits", icon: Fish }
];

export function PublicAtlasWorkspace() {
  const { state } = useProduct();
  const [region, setRegion] = useState("all");
  const [selectedId, setSelectedId] = useState("joal");
  const [view, setView] = useState<PublicView>("portrait");
  if (!state) return null;

  const regions = [...new Set(state.territories.map((item) => item.region))].sort((a, b) => a.localeCompare(b, "fr"));
  const territories = region === "all" ? state.territories : state.territories.filter((item) => item.region === region);
  const territory = territories.find((item) => item.id === selectedId) ?? territories[0] ?? state.territories[0];
  const quayId = `quai-${territory.id}`;
  const vessels = state.vessels.filter((item) => item.homeSiteId === quayId);
  const trips = state.trips.filter((item) => vessels.some((vessel) => vessel.id === item.vesselId));
  const landings = state.landings.filter((item) => item.siteId === quayId);
  const catches = landings.flatMap((item) => item.catches);
  const speciesIds = new Set(catches.map((item) => item.speciesId));
  const species = state.species.filter((item) => speciesIds.has(item.id));
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const volumeKg = catches.reduce((sum, item) => sum + item.quantityKg, 0);
  const availableCapacity = infrastructures.reduce((sum, item) => sum + item.availableCapacity, 0);
  const theoreticalCapacity = infrastructures.reduce((sum, item) => sum + item.theoreticalCapacity, 0);
  const availability = theoreticalCapacity ? Math.round((availableCapacity / theoreticalCapacity) * 100) : 0;

  const selectRegion = (value: string) => {
    setRegion(value);
    const first = value === "all" ? state.territories[0] : state.territories.find((item) => item.region === value);
    if (first) setSelectedId(first.id);
  };

  return (
    <section className="public-atlas-experience">
      <div className="public-atlas-toolbar">
        <div>
          <p className="public-kicker">Explorer le littoral</p>
          <h2>Choisissez un territoire, puis une lecture.</h2>
          <p>L’Atlas public partage des repères agrégés. Il ne montre ni dossiers, ni alertes, ni informations opérationnelles sensibles.</p>
        </div>
        <div className="public-atlas-selectors">
          <label>
            <span>Région</span>
            <span className="public-select-wrap"><MapPin size={16} /><select aria-label="Filtrer par région" value={region} onChange={(event) => selectRegion(event.target.value)}><option value="all">Toutes les régions</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={15} /></span>
          </label>
          <label>
            <span>Quai</span>
            <span className="public-select-wrap"><Anchor size={16} /><select aria-label="Choisir un quai" value={territory.id} onChange={(event) => setSelectedId(event.target.value)}>{territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={15} /></span>
          </label>
        </div>
      </div>

      <div className="public-view-tabs" role="group" aria-label="Choisir une lecture publique">
        {views.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setView(id)} aria-pressed={view === id} className={view === id ? "public-view-tab public-view-tab-active" : "public-view-tab"}>
            <Icon size={17} /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="public-atlas-stage">
        <div className="public-coast-map">
          <div className="public-coast-land" />
          <div className="public-map-heading"><Waves size={18} /><div><span>Océan Atlantique</span><strong>Quais de pêche artisanale</strong></div></div>
          <p className="public-map-caption">Représentation illustrative · données agrégées de démonstration</p>
          {territories.map((item) => {
            const [left, top] = positions[item.id] ?? [45, 50];
            const active = item.id === territory.id;
            return (
              <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} style={{ left: `${left}%`, top: `${top}%` }} className={active ? "public-quay-marker public-quay-marker-active" : "public-quay-marker"} aria-label={`Découvrir le quai de ${item.name}`}>
                <span className="public-marker-dot"><Anchor size={13} /></span>
                <span className="public-marker-label">{item.name}<small>{item.region}</small></span>
              </button>
            );
          })}
        </div>

        <article className="public-quay-story" aria-live="polite">
          <div className="public-story-cover">
            <p className="public-kicker">{views.find((item) => item.id === view)?.label}</p>
            <h2>{territory.name}</h2>
            <p>{territory.region} · Littoral sénégalais</p>
          </div>

          {view === "portrait" && (
            <div className="public-story-body">
              <p className="public-story-intro">Un point d’ancrage où se rencontrent sorties en mer, débarquements, métiers, produits et capacités locales.</p>
              <div className="public-number-grid">
                <div><span>Pirogues observées</span><strong>{vessels.length}</strong></div>
                <div><span>Sorties documentées</span><strong>{trips.length}</strong></div>
                <div><span>Débarquements agrégés</span><strong>{landings.length}</strong></div>
                <div><span>Espèces représentées</span><strong>{species.length}</strong></div>
              </div>
              <p className="public-source-note"><Sparkles size={15} /> Une lecture synthétique pour comprendre le rôle du quai dans la filière.</p>
            </div>
          )}

          {view === "activite" && (
            <div className="public-story-body">
              <p className="public-story-intro">L’activité est présentée sous forme agrégée pour donner un ordre de grandeur sans exposer les opérations individuelles.</p>
              <div className="public-feature-number"><span>Volume représenté</span><strong>{volumeKg ? `${(volumeKg / 1000).toFixed(1)} t` : "À documenter"}</strong><small>sur les débarquements du jeu de données</small></div>
              <div className="public-mini-bars"><div><span>Sorties reliées</span><i style={{ width: `${Math.min(100, trips.length * 28)}%` }} /></div><div><span>Débarquements documentés</span><i style={{ width: `${Math.min(100, landings.length * 42)}%` }} /></div><div><span>Diversité des espèces</span><i style={{ width: `${Math.min(100, species.length * 22)}%` }} /></div></div>
            </div>
          )}

          {view === "capacites" && (
            <div className="public-story-body">
              <p className="public-story-intro">Les capacités collectives rendent visibles les services qui soutiennent la qualité, la conservation et la circulation des produits.</p>
              <div className="public-capacity-ring" style={{ "--progress": `${availability * 3.6}deg` } as CSSProperties}><strong>{availability}%</strong><span>disponibilité agrégée</span></div>
              <div className="public-plain-list">{infrastructures.length ? infrastructures.map((item) => <p key={item.id}><Factory size={15} /><span>{item.type.replaceAll("_", " ")}</span><strong>{item.unit}</strong></p>) : <p><Factory size={15} /><span>Capacités à documenter</span></p>}</div>
            </div>
          )}

          {view === "produits" && (
            <div className="public-story-body">
              <p className="public-story-intro">Les espèces et formes de produits racontent la diversité économique et alimentaire du territoire.</p>
              <div className="public-species-cloud">{species.length ? species.map((item) => <span key={item.id}><Fish size={14} /> {item.name}</span>) : <span><Fish size={14} /> Observations à enrichir</span>}</div>
              <div className="public-product-lines">{catches.slice(0, 4).map((item) => <div key={item.id}><span>{state.species.find((speciesItem) => speciesItem.id === item.speciesId)?.name ?? "Produit observé"}</span><strong>{item.quantityKg.toLocaleString("fr-FR")} kg</strong></div>)}</div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
