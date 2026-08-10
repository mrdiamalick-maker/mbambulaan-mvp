"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  ChevronDown,
  Compass,
  Factory,
  Fish,
  MapPin,
  ShieldCheck,
  Waves
} from "lucide-react";
import { publicTerritories } from "@/data/public-atlas";

type PublicView = "portrait" | "activites" | "capacites" | "produits";

const views = [
  { id: "portrait" as const, label: "Portrait du territoire", icon: Compass },
  { id: "activites" as const, label: "Activités", icon: Waves },
  { id: "capacites" as const, label: "Services documentés", icon: Factory },
  { id: "produits" as const, label: "Espèces & produits", icon: Fish }
];

export function PublicAtlasWorkspace() {
  const [region, setRegion] = useState("all");
  const [selectedId, setSelectedId] = useState("joal");
  const [view, setView] = useState<PublicView>("portrait");

  const regions = [...new Set(publicTerritories.map((item) => item.region))].sort((a, b) => a.localeCompare(b, "fr"));
  const territories = region === "all" ? publicTerritories : publicTerritories.filter((item) => item.region === region);
  const territory = territories.find((item) => item.id === selectedId) ?? territories[0] ?? publicTerritories[0];

  const selectRegion = (value: string) => {
    setRegion(value);
    const first = value === "all" ? publicTerritories[0] : publicTerritories.find((item) => item.region === value);
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
          <p className="public-map-caption">Représentation illustrative · couverture en cours d’enrichissement</p>
          {territories.map((item) => {
            const [left, top] = item.mapPosition;
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
            <p>{territory.region}{territory.department ? ` · ${territory.department}` : ""} · {territory.type}</p>
          </div>

          {view === "portrait" && (
            <div className="public-story-body">
              <p className="public-story-intro">{territory.description}</p>
              <div className="public-plain-list">
                <p><Anchor size={15} /><span>Niveau de couverture : {territory.verification}</span></p>
                <p><Factory size={15} /><span>{territory.documentedServices.length} service(s) documenté(s)</span></p>
                {territory.species && <p><Fish size={15} /><span>{territory.species.length} espèce(s) représentée(s)</span></p>}
              </div>
              <p className="public-source-note"><ShieldCheck size={15} /> Source : {territory.source} · mise à jour {territory.updatedAt}.</p>
            </div>
          )}

          {view === "activites" && (
            <div className="public-story-body">
              <p className="public-story-intro">Cette lecture décrit les grandes activités du territoire sans publier de métriques opérationnelles privées.</p>
              <div className="public-species-cloud">
                {territory.activities.map((activity) => <span key={activity}><Waves size={14} /> {activity}</span>)}
              </div>
              <p className="public-source-note"><ShieldCheck size={15} /> Les niveaux d’activité, volumes, tensions et opérations individuelles restent hors de l’Atlas public.</p>
            </div>
          )}

          {view === "capacites" && (
            <div className="public-story-body">
              <p className="public-story-intro">Les capacités sont présentées comme catégories de services documentés, jamais comme disponibilités instantanées ou garanties commerciales.</p>
              <div className="public-plain-list">
                {territory.documentedServices.length
                  ? territory.documentedServices.map((item) => <p key={item}><Factory size={15} /><span>{item}</span></p>)
                  : <p><Factory size={15} /><span>Capacités à documenter</span></p>}
              </div>
              <p className="public-source-note"><ShieldCheck size={15} /> Pour vérifier une capacité mobilisable, décrivez votre besoin à Mbàmbulaan.</p>
            </div>
          )}

          {view === "produits" && (
            <div className="public-story-body">
              <p className="public-story-intro">Cette lecture présente les espèces ou produits documentés pour ce territoire, sans publier les quantités débarquées.</p>
              <div className="public-species-cloud">
                {territory.species?.length ? territory.species.map((item) => <span key={item}><Fish size={14} /> {item}</span>) : <span><Fish size={14} /> Informations à enrichir</span>}
              </div>
              <p className="public-source-note"><ShieldCheck size={15} /> Aucune donnée individuelle de lot, de capture ou de transaction n’est exposée.</p>
            </div>
          )}

          <div className="public-story-actions">
            <Link href={`/atlas/${territory.slug}`} className="btn-primary">Voir la fiche complète <ArrowRight size={15} /></Link>
            <Link href={`/solutions?source=atlas&territory=${encodeURIComponent(territory.name)}`} className="btn-secondary">Trouver une solution ici</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
