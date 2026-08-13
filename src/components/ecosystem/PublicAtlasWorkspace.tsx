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
import { trackPublicEvent } from "@/lib/public-analytics";
import { BlurFade } from "@/components/magicui/blur-fade";

type PublicView = "portrait" | "activites" | "capacites" | "produits";

const views = [
  { id: "portrait" as const, label: "Portrait", icon: Compass },
  { id: "activites" as const, label: "Activités", icon: Waves },
  { id: "capacites" as const, label: "Services", icon: Factory },
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
    trackPublicEvent("atlas_search", { region: value });
    const first = value === "all" ? publicTerritories[0] : publicTerritories.find((item) => item.region === value);
    if (first) setSelectedId(first.id);
  };

  const selectTerritory = (id: string) => {
    setSelectedId(id);
    trackPublicEvent("atlas_location_view", { territory: id });
  };

  return (
    <section className="overflow-hidden rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)] shadow-[var(--pub-shadow)]">
      <div className="grid gap-5 border-b border-[var(--pub-stone-150)] bg-white p-5 md:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="pub-eyebrow">Explorer le littoral</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)] md:text-2xl">Filtrer la couverture publique.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--pub-stone-700)]">La sélection change le portrait affiché ; elle ne révèle aucune donnée privée du Produit.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-bold text-[var(--pub-stone-500)]">
            <span>Région</span>
            <span className="relative flex min-w-48 items-center rounded-xl border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] text-[var(--pub-deep-800)]"><MapPin size={15} className="ml-3 shrink-0"/><select aria-label="Filtrer par région" value={region} onChange={(event) => selectRegion(event.target.value)} className="min-h-11 w-full appearance-none bg-transparent px-2 pr-8 text-sm font-semibold outline-none"><option value="all">Toutes les régions</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3"/></span>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-[var(--pub-stone-500)]">
            <span>Territoire / quai</span>
            <span className="relative flex min-w-48 items-center rounded-xl border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] text-[var(--pub-deep-800)]"><Anchor size={15} className="ml-3 shrink-0"/><select aria-label="Choisir un territoire" value={territory.id} onChange={(event) => selectTerritory(event.target.value)} className="min-h-11 w-full appearance-none bg-transparent px-2 pr-8 text-sm font-semibold outline-none">{territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3"/></span>
          </label>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[var(--pub-stone-150)] bg-[var(--pub-surface)] p-2" role="group" aria-label="Choisir une lecture publique">
        {views.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setView(id)} aria-pressed={view === id} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${view === id ? "bg-[var(--pub-deep-800)] text-white shadow-sm" : "text-[var(--pub-stone-700)] hover:bg-white"}`}>
            <Icon size={16}/><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="grid min-h-[620px] lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative min-h-[520px] overflow-hidden border-b border-[var(--pub-stone-150)] bg-[var(--pub-deep-900)] lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_18%_18%,rgba(247,243,233,.08)_0_1px,transparent_1.5px)] [background-size:20px_20px]" />
          <div className="absolute bottom-[-8%] left-[-12%] h-[112%] w-[58%] rounded-[42%_58%_40%_60%/30%_35%_65%_70%] bg-[var(--pub-ivory-200)] shadow-[18px_0_40px_rgba(0,0,0,.16)]" />
          <div className="absolute left-5 top-5 z-10 rounded-xl border border-white/10 bg-[var(--pub-deep-800)]/90 px-4 py-3 text-white backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[var(--pub-turquoise-300)]"><Waves size={16}/><span className="text-[10px] font-black uppercase tracking-[.12em]">Océan Atlantique</span></div>
            <strong className="mt-1 block text-sm">Territoires de pêche artisanale</strong>
          </div>
          <p className="absolute bottom-4 left-5 z-10 text-[10px] font-semibold uppercase tracking-[.08em] text-white/45">Représentation illustrative · couverture en enrichissement</p>

          {territories.map((item) => {
            const [left, top] = item.mapPosition;
            const active = item.id === territory.id;
            return (
              <button key={item.id} type="button" onClick={() => selectTerritory(item.id)} style={{ left: `${left}%`, top: `${top}%` }} className="group absolute z-20 -translate-x-1/2 -translate-y-1/2" aria-label={`Découvrir ${item.name}`}>
                <span className={`grid size-8 place-items-center rounded-full border-2 shadow-lg transition ${active ? "scale-110 border-[var(--pub-ivory-100)] bg-[var(--pub-turquoise-500)] text-white" : "border-white/80 bg-[var(--pub-deep-800)] text-white group-hover:bg-[var(--pub-turquoise-500)]"}`}><Anchor size={13}/></span>
                <span className={`absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left shadow-md transition ${active ? "bg-[var(--pub-turquoise-500)] text-white" : "bg-white text-[var(--pub-deep-900)] opacity-0 group-hover:opacity-100"}`}><strong className="block text-xs">{item.name}</strong><small className="text-[10px] opacity-65">{item.region}</small></span>
              </button>
            );
          })}
        </div>

        <BlurFade key={`${territory.id}-${view}`} className="flex min-h-full flex-col bg-white">
          <div className="border-b border-[var(--pub-stone-150)] p-6 md:p-8">
            <p className="pub-eyebrow">{views.find((item) => item.id === view)?.label}</p>
            <h2 className="pub-display mt-3 text-[2.35rem] not-italic leading-none text-[var(--pub-deep-900)] md:text-[3rem]">{territory.name}</h2>
            <p className="mt-3 text-sm font-semibold text-[var(--pub-stone-500)]">{territory.region}{territory.department ? ` · ${territory.department}` : ""} · {territory.type}</p>
          </div>

          <div className="flex-1 p-6 md:p-8">
            {view === "portrait" && <><p className="text-base leading-7 text-[var(--pub-stone-700)]">{territory.description}</p><div className="mt-7 grid gap-3"><p className="flex items-center gap-3 rounded-xl bg-[var(--pub-ivory-100)] p-3 text-sm font-semibold text-[var(--pub-deep-800)]"><Anchor size={16}/> Niveau de couverture : {territory.verification}</p><p className="flex items-center gap-3 rounded-xl bg-[var(--pub-ivory-100)] p-3 text-sm font-semibold text-[var(--pub-deep-800)]"><Factory size={16}/> {territory.documentedServices.length} service(s) documenté(s)</p>{territory.species && <p className="flex items-center gap-3 rounded-xl bg-[var(--pub-ivory-100)] p-3 text-sm font-semibold text-[var(--pub-deep-800)]"><Fish size={16}/> {territory.species.length} espèce(s) représentée(s)</p>}</div></>}
            {view === "activites" && <><p className="text-sm leading-6 text-[var(--pub-stone-700)]">Grandes activités documentées, sans métriques opérationnelles privées.</p><div className="mt-6 flex flex-wrap gap-2">{territory.activities.map((activity) => <span key={activity} className="inline-flex items-center gap-2 rounded-full border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] px-3 py-2 text-sm font-semibold text-[var(--pub-deep-800)]"><Waves size={14}/>{activity}</span>)}</div></>}
            {view === "capacites" && <><p className="text-sm leading-6 text-[var(--pub-stone-700)]">Catégories de services documentés ; elles ne constituent ni une disponibilité instantanée ni une garantie commerciale.</p><div className="mt-6 grid gap-3">{territory.documentedServices.length ? territory.documentedServices.map((item) => <p key={item} className="flex items-center gap-3 rounded-xl bg-[var(--pub-ivory-100)] p-3 text-sm font-semibold text-[var(--pub-deep-800)]"><Factory size={15}/>{item}</p>) : <p className="text-sm">Capacités à documenter</p>}</div></>}
            {view === "produits" && <><p className="text-sm leading-6 text-[var(--pub-stone-700)]">Espèces ou produits représentés publiquement, sans quantités débarquées.</p><div className="mt-6 flex flex-wrap gap-2">{territory.species?.length ? territory.species.map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] px-3 py-2 text-sm font-semibold text-[var(--pub-deep-800)]"><Fish size={14}/>{item}</span>) : <span className="text-sm">Informations à enrichir</span>}</div></>}

            <p className="mt-7 flex items-start gap-2 border-t border-[var(--pub-stone-150)] pt-5 text-xs leading-5 text-[var(--pub-stone-500)]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--pub-turquoise-500)]"/> Source : {territory.source} · mise à jour {territory.updatedAt}. Les données opérationnelles individuelles restent hors de l’Atlas public.</p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[var(--pub-stone-150)] bg-[var(--pub-surface)] p-5 md:px-8">
            <Link href={`/atlas/${territory.slug}`} className="pub-btn pub-btn-dark">Voir la fiche territoire <ArrowRight size={15}/></Link>
            <Link href={`/solutions?source=atlas&territory=${encodeURIComponent(territory.name)}`} className="pub-btn pub-btn-outline">Décrire une situation ici</Link>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
