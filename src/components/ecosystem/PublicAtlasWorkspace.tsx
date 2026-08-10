"use client";

import { useState } from "react";
import {
  Anchor,
  ChevronDown,
  Compass,
  Factory,
  Fish,
  MapPin,
  ShieldCheck,
  Waves
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";

type PublicView = "portrait" | "activites" | "capacites" | "produits";

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
  { id: "portrait" as const, label: "Portrait du territoire", icon: Compass },
  { id: "activites" as const, label: "Activités", icon: Waves },
  { id: "capacites" as const, label: "Services & capacités", icon: Factory },
  { id: "produits" as const, label: "Espèces & produits", icon: Fish }
];

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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
  const landings = state.landings.filter((item) => item.siteId === quayId);
  const catches = landings.flatMap((item) => item.catches);
  const speciesIds = new Set(catches.map((item) => item.speciesId));
  const species = state.species.filter((item) => speciesIds.has(item.id));
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);

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
          <p>L’Atlas public donne des repères territoriaux et des informations documentaires. Il ne publie ni opérations individuelles, ni volumes privés, ni disponibilité en temps réel.</p>
        </div>
        <div className="public-atlas-selectors">
          <label>
            <span>Région</span>
            <span className="public-select-wrap"><MapPin size={16} /><select aria-label="Filtrer par région" value={region} onChange={(event) => selectRegion(event.target.value)}><option value="all">Toutes les régions</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={15} /></span>
          </label>
          <label>
            <span>Territoire / quai</span>
            <span className="public-select-wrap"><Anchor size={16} /><select aria-label="Choisir un territoire" value={territory.id} onChange={(event) => setSelectedId(event.target.value)}>{territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={15} /></span>
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
          <div className="public-map-heading"><Waves size={18} /><div><span>Océan Atlantique</span><strong>Territoires de pêche artisanale</strong></div></div>
          <p className="public-map-caption">Représentation illustrative · couverture de démonstration</p>
          {territories.map((item) => {
            const [left, top] = positions[item.id] ?? [45, 50];
            const active = item.id === territory.id;
            return (
              <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} style={{ left: `${left}%`, top: `${top}%` }} className={active ? "public-quay-marker public-quay-marker-active" : "public-quay-marker"} aria-label={`Découvrir ${item.name}`}>
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
              <p className="public-story-intro">Un point d’ancrage de l’économie halieutique où se croisent métiers, débarquement, transformation, conservation, transport et services.</p>
              <div className="public-plain-list">
                <p><Anchor size={15} /><span>Territoire référencé dans l’Atlas Mbàmbulaan</span></p>
                <p><Factory size={15} /><span>{infrastructures.length ? "Services et infrastructures documentés dans la démonstration" : "Services et infrastructures à documenter"}</span></p>
                <p><Fish size={15} /><span>{species.length ? "Espèces et produits représentés dans la démonstration" : "Espèces et produits à enrichir"}</span></p>
              </div>
              <p className="public-source-note"><ShieldCheck size={15} /> Les informations affichées ici sont publiques, documentaires ou clairement identifiées comme démonstration.</p>
            </div>
          )}

          {view === "activites" && (
            <div className="public-story-body">
              <p className="public-story-intro">Cette lecture décrit les grandes activités du territoire sans publier de métriques opérationnelles privées.</p>
              <div className="public-species-cloud">
                <span><Waves size={14} /> Pêche artisanale</span>
                <span><Anchor size={14} /> Débarquement</span>
                {infrastructures.length > 0 && <span><Factory size={14} /> Services aux activités</span>}
                {species.length > 0 && <span><Fish size={14} /> Valorisation des produits</span>}
              </div>
              <p className="public-source-note"><ShieldCheck size={15} /> Les niveaux d’activité, volumes, tensions et opérations individuelles restent hors de l’Atlas public.</p>
            </div>
          )}

          {view === "capacites" && (
            <div className="public-story-body">
              <p className="public-story-intro">Les capacités sont présentées comme catégories de services documentés, jamais comme disponibilités instantanées ou garanties commerciales.</p>
              <div className="public-plain-list">
                {infrastructures.length ? infrastructures.map((item) => <p key={item.id}><Factory size={15} /><span>{humanize(item.type)}</span></p>) : <p><Factory size={15} /><span>Capacités à documenter</span></p>}
              </div>
              <p className="public-source-note"><ShieldCheck size={15} /> Pour vérifier une capacité mobilisable, décrivez votre besoin à Mbàmbulaan.</p>
            </div>
          )}

          {view === "produits" && (
            <div className="public-story-body">
              <p className="public-story-intro">Cette lecture présente les espèces ou produits représentés dans le jeu de démonstration sans publier les quantités débarquées.</p>
              <div className="public-species-cloud">{species.length ? species.map((item) => <span key={item.id}><Fish size={14} /> {item.name}</span>) : <span><Fish size={14} /> Informations à enrichir</span>}</div>
              <p className="public-source-note"><ShieldCheck size={15} /> Aucune donnée individuelle de lot, de capture ou de transaction n’est exposée.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
