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

          {/* Livrable 3 (DA, mandat Atlas Public) : silhouette calibrée du
              littoral (docs/design-reference/senegal-coast-atlas.svg,
              viewBox 0 0 1000 1400), reproduite ici en SVG natif plutôt
              qu'en <img>/blob CSS. Les 20 marqueurs vivent dans le même
              repère SVG que la silhouette (mapPosition, cf. public-atlas.ts)
              : preserveAspectRatio="xMidYMid meet" garantit un alignement
              exact quel que soit le ratio du panneau, sans les pièges de
              synchronisation flex/pourcentage déjà rencontrés ailleurs
              dans ce produit — pas de fond + overlay HTML séparés à
              garder synchronisés. */}
          <svg viewBox="0 0 1000 1400" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" role="img" aria-label="Carte illustrative du littoral sénégalais et de ses territoires documentés">
            <title>Littoral du Sénégal — territoires documentés par Mbàmbulaan</title>
            <defs>
              <filter id="atlas-landmass-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000" floodOpacity="0.28" /></filter>
            </defs>
            <g opacity="0.22" stroke="#f7f3e9" strokeWidth="1.5" fill="none" aria-hidden="true">
              <path d="M75 210C165 165 245 155 320 175" /><path d="M60 245C155 198 240 190 315 208" /><path d="M52 280C150 232 235 225 310 242" />
              <path d="M90 1110C185 1068 275 1062 355 1085" /><path d="M78 1145C175 1102 265 1098 348 1120" />
            </g>
            {/* Contour reconstruit mécaniquement le 2026-08-15 (cf.
                docs/design-reference/senegal-coast-atlas.svg pour le
                détail) : dérivé des 22 marqueurs (18 Pro + Bargny/
                Ngaparou/Toubacouta/Ziguinchor), chacun décalé de 24
                unités vers l'ouest. Le tracé DA d'origine passait à
                l'intérieur des terres par rapport à sa propre ligne de
                marqueurs (isPointInFill faux pour 15/18 des marqueurs
                d'origine, y compris Joal) — vérifié à nouveau ici après
                correction : les 22 marqueurs sont dans le remplissage. */}
            <path
              d="M 315 145 L 610 118 L 790 205 L 845 365 L 804 510 L 738 610 L 760 705 L 690 772 L 735 812 L 700 860 L 730 1015 L 680 1095 L 605 1140 L 520 1160 L 376 1135 L 341 1090 L 401 1055 L 311 1040 L 306 965 L 316 900 L 386 868 L 341 855 L 354 792 L 338 758 L 332 739 L 326 720 L 336 696 L 318 684 L 292 642 L 271 610 L 262 575 L 254 528 L 241 450 L 228 372 L 221 292 L 234 205 Z"
              fill="var(--pub-ivory-200)"
              stroke="var(--pub-deep-900)"
              strokeOpacity="0.45"
              strokeWidth="5"
              strokeLinejoin="round"
              filter="url(#atlas-landmass-shadow)"
              aria-hidden="true"
            />
            <path d="M375 806 C450 792 515 800 625 820 C670 828 705 830 742 816" stroke="var(--pub-deep-900)" strokeOpacity="0.5" strokeWidth="22" strokeLinecap="round" aria-hidden="true" />
            <path d="M234 205 L228 372 L254 528 L292 642 L326 720 L354 792 L316 900 L311 1040 L341 1090 L376 1135" fill="none" stroke="var(--pub-turquoise-500)" strokeOpacity="0.28" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />

            {territories.map((item) => {
              const [x, y] = item.mapPosition;
              const active = item.id === territory.id;
              const activate = () => selectTerritory(item.id);
              return (
                <g
                  key={item.id}
                  transform={`translate(${x} ${y})`}
                  className="group cursor-pointer outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Découvrir ${item.name}`}
                  aria-pressed={active}
                  onClick={activate}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } }}
                >
                  {/* Zone de clic/tap généreuse, invisible — le marqueur visuel
                      (7-12 unités) est trop petit pour rester tapable une fois
                      la carte réduite sur mobile. */}
                  <circle r="30" fill="transparent" />
                  {active && <circle r="19" fill="none" stroke="var(--pub-turquoise-500)" strokeOpacity="0.32" strokeWidth="3" className="pointer-events-none" />}
                  <circle r={active ? 12 : 7} fill={active ? "var(--pub-turquoise-500)" : "var(--pub-deep-800)"} stroke="#fff" strokeWidth={active ? 3 : 2} className="pointer-events-none transition-[fill] group-hover:fill-[var(--pub-turquoise-500)] group-focus-visible:fill-[var(--pub-turquoise-500)]" />
                  <text
                    x={active ? 20 : 14}
                    y="6"
                    fontSize={active ? 20 : 17}
                    fontWeight={active ? 700 : 600}
                    fill={active ? "var(--pub-turquoise-500)" : "var(--pub-deep-900)"}
                    paintOrder="stroke"
                    stroke="var(--pub-ivory-200)"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    className={`pointer-events-none transition-opacity ${active ? "" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}
                  >
                    {item.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-xl border border-white/10 bg-[var(--pub-deep-800)]/90 px-4 py-3 text-white backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[var(--pub-turquoise-300)]"><Waves size={16}/><span className="text-[10px] font-black uppercase tracking-[.12em]">Océan Atlantique</span></div>
            <strong className="mt-1 block text-sm">Territoires de pêche artisanale</strong>
          </div>
          <p className="pointer-events-none absolute bottom-4 left-5 z-10 text-[10px] font-semibold uppercase tracking-[.08em] text-white/45">Représentation illustrative · couverture en enrichissement</p>
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
