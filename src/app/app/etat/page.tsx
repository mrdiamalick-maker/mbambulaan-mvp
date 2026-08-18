"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Compass, Factory, FileDown, Fish, Radio, Sailboat, Send, ShieldCheck } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { InstitutionIllustration } from "@/components/public/CoordinationIllustration";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Drawer } from "@/components/etat/Drawer";
import { DecisionIcon, ResultatIcon, SituationIcon } from "@/components/etat/MotifIcons";
import { CoastlineTerritoryMap } from "@/components/territories/CoastlineTerritoryMap";
import { coastlineViewBox, territoryMapPositions } from "@/domain/territory-map-positions";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { decisionTypeLabels, type Situation, type Territory } from "@/domain/types";
import { fieldVisitObjectiveLabels, type FieldVisit, type FieldVisitObjective } from "@/domain/ministry/field-visit";
import {
  vigilanceCategoryLabels,
  vigilanceSeverityLabels,
  type VigilanceCase,
  type VigilanceCategory,
  type VigilanceSeverity
} from "@/domain/ministry/vigilance";

// Audit DA Premium XXL v2 (mandat CEO 2026-08-17). Cette page adopte
// .etat-scope (etat-design-system.css), déjà construit et validé sur la
// page sœur /app/etat/rapport, plutôt qu'un 4e vocabulaire visuel — même
// discipline que le composant Drawer ci-dessus, lui aussi déjà construit
// mais jamais câblé avant le Lot A. Aucune donnée, aucun moteur métier
// touché dans ce lot.
//
// Lot A (fondations visuelles) : typographie serif d'affichage, palette
// --etat-*, cartes KPI → chiffres inline (§17 du mandat), retrait du
// Marquee (§5).
//
// Lot B (Chapitre 1 — lecture territoriale) : ancien Hero (bande sombre
// pleine largeur) + section "Atlas territorial" (DottedMap générique)
// fusionnés en un seul chapitre carte + décision prioritaire unique +
// compteurs, conformément à la référence visuelle et à l'option 2 tranchée
// par le CEO pour le point d'attention "carte" (cf. gap analysis). La
// carte réutilise la géométrie calibrée de PublicAtlasWorkspace.tsx via
// CoastlineTerritoryMap/territory-map-positions.ts — fichiers neufs, le
// Public n'est ni modifié ni affecté. AtlasExecutiveSummary
// (variant="institution") est retiré de cette page : composant partagé
// avec /app/atlas Pro (variant="coordinateur"), non modifié, seulement
// plus utilisé ici — ses 2 métriques encore non relogées (situations à
// arbitrer, capacités fragiles) restent trackées pour le Chapitre 2, pas
// perdues, juste pas encore leur place définitive. DottedMap n'est plus
// utilisé sur cette page (remplacé) ; InstitutionIllustration migre du
// Hero (retiré) vers le bandeau rapport bailleurs, où son usage reste
// légitime (§18 du mandat) plutôt que de devenir orphelin.
//
// Écarts assumés vs la référence, validés par le CEO (2026-08-17) : pas de
// score de confiance composite fabriqué (§20, doctrine anti-score déjà
// appliquée ailleurs) ; pas de second acteur "proposé par / validé par"
// inventé pour le journal de décisions (le modèle n'a qu'un décideur).
const severityToTag: Record<VigilanceSeverity, "stable" | "vigilance" | "critique"> = { faible: "stable", moyenne: "vigilance", haute: "vigilance", critique: "critique" };
const priorityLabels: Record<Situation["priority"], string> = { critique: "Critique", haute: "Élevé", moyenne: "Moyen", faible: "Faible" };
const priorityToTag: Record<Situation["priority"], "stable" | "vigilance" | "critique"> = { critique: "critique", haute: "vigilance", moyenne: "stable", faible: "stable" };
const glyphBorderColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "var(--etat-navy-600)", vigilance: "var(--etat-ocre)", critique: "var(--etat-terracotta)" };
const glyphFillColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "rgba(29,68,104,.05)", vigilance: "rgba(198,138,44,.07)", critique: "rgba(182,82,47,.07)" };
const arbitrageFillColor: Record<"stable" | "vigilance" | "critique", string> = { stable: "rgba(29,68,104,.08)", vigilance: "rgba(198,138,44,.14)", critique: "rgba(182,82,47,.15)" };
const statusTagClass: Record<"stable" | "vigilance" | "critique", string> = { stable: "etat-tag--stable", vigilance: "etat-tag--vigilance", critique: "etat-tag--critique" };
const statusTagLabel: Record<"stable" | "vigilance" | "critique", string> = { stable: "Stable", vigilance: "Vigilance", critique: "Critique" };
// Correctif 2026-08-17 (audit CTA) : la fiche territoire publique
// (/atlas/[slug]) est indexée par slug, pas par Territory.id du Produit —
// les deux coïncident pour 17 des 18 territoires partagés, sauf "joal"
// (Territory.id="joal", data/public-atlas.ts slug="joal-fadiouth") où le
// lien produisait une vraie 404, vérifié en conditions réelles. Petite
// table de correspondance plutôt qu'une dépendance du Produit vers
// data/public-atlas.ts (fichier 100% éditorial Public, à ne pas coupler).
const territoryPublicSlug: Partial<Record<string, string>> = { joal: "joal-fadiouth" };
// Correctif 2026-08-18 (CEO) : "Ouakam" n'a jamais eu de fiche Atlas
// publique (confirmé par grep sur data/public-atlas.ts, préexistant à
// l'intégration du jeu de données enrichi — pas un des 20 territoires
// éditoriaux couverts par le site public). Contrairement à Joal, il
// n'existe aucun slug de correspondance à mapper : le contenu public
// n'existe simplement pas. Même discipline de découplage que
// territoryPublicSlug ci-dessus (liste locale plutôt qu'un import
// depuis data/public-atlas.ts) — liste à tenir à jour si d'autres
// territoires Produit rejoignent la démonstration sans fiche publique.
const territoriesWithoutPublicAtlas = new Set(["ouakam"]);
const pipelineStages: Array<{ status: Situation["status"]; label: string }> = [
  { status: "recue", label: "Reçue" },
  { status: "qualification", label: "Qualification" },
  { status: "priorisee", label: "Priorisée" },
  { status: "coordination", label: "Coordination" },
  { status: "intervention", label: "Intervention" },
  { status: "attente", label: "En attente" },
  { status: "resultat", label: "Résultat" },
  { status: "reglee", label: "Réglée" }
];

// Mini-cartes du Chapitre 3 (maquette validée, arbitrage CEO 2026-08-18) :
// le littoral national entier, réduit à la hauteur d'une vignette
// (~110px), est trop long et étroit pour rester lisible — les marqueurs
// deviendraient de simples pixels. Plutôt que fabriquer une géométrie
// locale simplifiée, on affiche EXACTEMENT le même rendu calibré
// (CoastlineTerritoryMap, positions et tracé inchangés) zoomé par
// transform CSS autour du territoire concerné — un recadrage visuel,
// pas une nouvelle carte. territoryZoomStyle calcule un couple
// transform-origin (le point qui ne bouge pas pendant le zoom) +
// translate (pour ramener ensuite ce point au centre de la vignette —
// sans cette seconde étape, un territoire proche d'un bord du viewBox
// national, comme Kayar au nord, reste collé au bord de la vignette
// au lieu d'être recentré). Les deux valeurs sont en pourcentage de la
// boîte de l'élément lui-même (w-full/h-full = la vignette), donc
// robuste à n'importe quelle taille de carte, pas de calcul en pixels
// fixes.
const [viewBoxMinX, viewBoxMinY, viewBoxWidth, viewBoxHeight] = coastlineViewBox.split(" ").map(Number);
function territoryZoomStyle(territoryId: string, scale: number): React.CSSProperties {
  const position = territoryMapPositions[territoryId];
  if (!position) return { transform: `scale(${scale})`, transformOrigin: "50% 50%" };
  const [x, y] = position;
  const px = ((x - viewBoxMinX) / viewBoxWidth) * 100;
  const py = ((y - viewBoxMinY) / viewBoxHeight) * 100;
  return { transform: `translate(${50 - px}%, ${50 - py}%) scale(${scale})`, transformOrigin: `${px}% ${py}%` };
}

function StatusBadge({ status }: { status: "stable" | "vigilance" | "critique" }) {
  return <span className={`etat-tag ${statusTagClass[status]}`}>{statusTagLabel[status]}</span>;
}

function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

type Mission = {
  key: string;
  territoryId: string;
  territoryLabel: string;
  raison: string;
  action: string;
  glyphStatus: "stable" | "vigilance" | "critique";
  suggestedObjective: FieldVisitObjective;
};

export default function EtatPage() {
  const { state, actorId } = useProduct();
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [territoryDrawer, setTerritoryDrawer] = useState<Territory | null>(null);
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);
  const [signalDrawerOpen, setSignalDrawerOpen] = useState(false);
  const [prioritiesExpanded, setPrioritiesExpanded] = useState(false);

  const reload = async () => {
    const [visitsRes, casesRes] = await Promise.all([fetch("/api/ministry/field-visits"), fetch("/api/ministry/vigilance")]);
    if (visitsRes.ok) setVisits((await visitsRes.json()).visits ?? []);
    if (casesRes.ok) setCases((await casesRes.json()).cases ?? []);
  };

  useEffect(() => {
    void reload();
  }, []);

  const actor = state?.actors.find((item) => item.id === actorId);
  const openCases = useMemo(() => cases.filter((item) => item.status !== "clos"), [cases]);

  const { executedValue, engagedValue } = useMemo(() => {
    if (!state) return { executedValue: 0, engagedValue: 0 };
    let executed = 0;
    let engaged = 0;
    for (const opportunity of state.opportunities) {
      const lot = state.lots.find((item) => item.id === opportunity.lotId);
      const species = lot ? state.species.find((item) => item.id === lot.speciesId) : undefined;
      if (!lot || !species) continue;
      const value = lot.quantityKg * species.indicativePriceFcfaKg;
      if (opportunity.status === "executee") executed += value;
      if (opportunity.status === "engagee") engaged += value;
    }
    return { executedValue: executed, engagedValue: engaged };
  }, [state]);

  const dominant = useMemo(() => {
    if (openCases.length > 0) {
      const top = [...openCases].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
      return { kind: "signal" as const, glyphStatus: severityToTag[top.severity], case: top };
    }
    const critiqueTerritory = state?.territories.find((item) => item.activity === "critique");
    if (critiqueTerritory) return { kind: "territoire" as const, glyphStatus: "critique" as const, territory: critiqueTerritory };
    return { kind: "calme" as const, glyphStatus: "stable" as const };
  }, [openCases, state]);

  const leadIndicators = useMemo(() => {
    if (!state) return [];
    return state.initiatives.slice(0, 2).map((initiative) => ({ title: initiative.title, indicator: initiative.indicators[0] })).filter((item) => item.indicator);
  }, [state]);

  if (!state) return null;

  const territoiresActifs = state.territories.length;
  const territoiresVigilance = state.territories.filter((item) => item.activity === "vigilance").length;
  const territoiresCritiques = state.territories.filter((item) => item.activity === "critique").length;
  const territoiresAttention = state.territories.filter((item) => item.activity !== "stable");

  // Chapitre 1 — décision prioritaire unique : bulles réellement dérivables
  // du territoire/dossier dominant, pas les libellés illustratifs de la
  // référence (aucun champ "sorties de pêche concernées"/"tonnage
  // impacté"/"risque de pertes" n'existe dans le modèle — non fabriqués).
  const dominantTerritoryId = dominant.kind === "territoire" ? dominant.territory.id : dominant.kind === "signal" ? dominant.case.territoryId : undefined;
  const dominantOpenSituations = dominantTerritoryId ? state.situations.filter((item) => item.territoryId === dominantTerritoryId && item.status !== "reglee") : [];
  const dominantFragileInfra = dominantTerritoryId ? state.infrastructures.filter((item) => item.territoryId === dominantTerritoryId && item.status !== "operationnelle").length : 0;
  const dominantPrioritySituation = [...dominantOpenSituations].sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];

  // Chapitre 2 — Résultats de la coordination (Lot D). 4 mesures maximum
  // (§17 du mandat), toutes réellement dérivées :
  // - closedWithResult/closedRatio : situations réglées ET porteuses d'un
  //   résultat renseigné (Situation.result), pas juste "statut = réglée".
  // - involvedActors : acteurs distincts engagés dans au moins un
  //   Commitment, toutes coordinations confondues — pas "acteurs
  //   vérifiés" (déjà ailleurs), la boucle métier réellement mobilisée.
  // - availableCapacity : infrastructures opérationnelles / total — le
  //   pendant positif des "capacités fragiles" déjà utilisées ailleurs.
  // Histogramme "décisions par semaine" envisagé (alternative honnête à
  // une courbe de tendance KPI, gap analysis validée par le CEO) puis
  // écarté pour ce lot : toutes les décisions du jeu de démonstration
  // partagent le même decidedAt (généré au chargement, cf. demo-state.ts)
  // — un histogramme serait techniquement honnête (aucune donnée
  // fabriquée) mais un seul pic sur 8 barres vides n'apporte rien tant que
  // les données de démonstration n'ont pas de vraie dispersion
  // temporelle. Le calcul fonctionnerait correctement avec de vraies
  // décisions étalées dans le temps — non implémenté ici pour éviter une
  // dataviz vide en pratique (§16 du mandat : pas de viz sans valeur).
  const closedWithResult = state.situations.filter((item) => item.status === "reglee" && item.result).length;
  const closedRatio = state.situations.length > 0 ? Math.round((closedWithResult / state.situations.length) * 100) : 0;
  const involvedActors = new Set(state.coordinationSpaces.flatMap((space) => space.commitments.map((commitment) => commitment.actorId))).size;
  const availableCapacity = state.infrastructures.filter((item) => item.status === "operationnelle").length;

  // Chapitre 3 — territoires prioritaires. Priorisation dérivée de données
  // réelles (critique avant vigilance, puis charge décroissante = situations
  // ouvertes + capacités fragiles), pas d'un score fabriqué. "Tension
  // principale"/"impact" reprennent les mêmes champs réellement disponibles
  // que le panneau de décision du Chapitre 1 (pas de tonnage ni de "risque
  // de pertes" — aucun champ correspondant dans le modèle).
  const prioritized = territoiresAttention
    .map((territory) => {
      const openSituations = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee");
      const prioritySituation = [...openSituations].sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];
      const fragileInfra = state.infrastructures.filter((item) => item.territoryId === territory.id && item.status !== "operationnelle").length;
      const acteurs = state.actors.filter((item) => item.territoryIds.includes(territory.id)).length;
      return { territory, prioritySituation, openSituationsCount: openSituations.length, fragileInfra, acteurs };
    })
    .sort((a, b) => {
      if (a.territory.activity !== b.territory.activity) return a.territory.activity === "critique" ? -1 : b.territory.activity === "critique" ? 1 : 0;
      return (b.openSituationsCount + b.fragileInfra) - (a.openSituationsCount + a.fragileInfra);
    });
  const topPriorities = prioritized.slice(0, 3);
  const morePriorities = prioritized.slice(3);

  const totalValue = executedValue + engagedValue;
  const executedRatio = totalValue > 0 ? Math.round((executedValue / totalValue) * 100) : 0;
  const situationsAArbitrer = state.situations
    .filter((item) => item.status !== "reglee" && (item.priority === "critique" || item.priority === "haute"))
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])
    .slice(0, 5);
  const recentDecisions = [...state.decisions]
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
    .slice(0, 5);

  return (
    <div className="etat-scope space-y-16 bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
      <div className="flex items-start gap-3 border-b border-[var(--etat-line)] pb-4 text-sm">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--etat-navy-600)]" />
        <p>Mbàmbulaan <strong>qualifie et signale</strong> les situations remontées du terrain. La décision et l’action relèvent des autorités compétentes.</p>
      </div>

      {/* Raffinement visuel (maquette validée, arbitrage CEO 2026-08-18,
          point 2) : "Filtres avancés" retiré, Périmètre/Période en
          lecture seule (étiquettes fixes, pas des <select>) — construire
          un vrai filtrage des 6 chapitres est un chantier à part
          entière, hors périmètre de ce raffinement visuel. Jamais un
          contrôle qui a l'air interactif sans l'être. */}
      <div className="flex flex-wrap items-center gap-8 border-b border-[var(--etat-line)] pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Périmètre</p>
          <p className="mt-1 text-sm font-semibold text-[var(--etat-navy-950)]">Sénégal entier</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Période</p>
          <p className="mt-1 text-sm font-semibold text-[var(--etat-navy-950)]">30 derniers jours</p>
        </div>
      </div>

      {/* Chapitre 1 — Lecture territoriale (mandat §5, Lot B). Carte +
          décision prioritaire unique côte à côte ; sous les deux,
          uniquement les 3 compteurs — "rien d'autre dans ce premier
          chapitre" (mandat). H1 déplacé ici (était dans l'ancien Hero) :
          reste le titre principal de la page. */}
      <section id="terrain">
        <p className="etat-eyebrow">1 · Lecture territoriale</p>
        <h1 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)] md:text-3xl">Le littoral, territoire par territoire.</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--etat-stone-600)]">Espace État · {actor?.name ?? "Ministère"}. Cliquez un point sur la carte pour ouvrir le détail d’un territoire.</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_.7fr] lg:items-stretch">
          {/* Richesse visuelle de la carte (maquette validée, arbitrage
              CEO 2026-08-18) : texture/boussole/icônes décoratives
              ajoutées ICI, en habillage autour du composant partagé —
              CoastlineTerritoryMap.tsx lui-même n'est pas touché, pour ne
              pas propager cet habillage à /app/pilotage qui réutilise le
              même composant et dont la composition est déjà close et
              validée. Aucune nouvelle géométrie : coastlinePath et
              territoryMapPositions inchangés. Pas de bleu pour l'eau
              (contrairement à la maquette) : la palette D9 verrouillée
              n'en a pas — même règle déjà posée dans le commentaire de
              CoastlineTerritoryMap.tsx pour la même raison, appliquée ici
              à l'identique plutôt que rouverte pour cette maquette. Les
              icônes (pirogue, poisson, boussole) sont des éléments
              purement décoratifs, statiques, aria-hidden — jamais des
              données réelles (aucune position de pirogue en temps réel). */}
          <div className="etat-panel relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{ backgroundImage: "radial-gradient(circle at 18% 12%, rgba(29,68,104,.12), transparent 50%), radial-gradient(circle at 85% 78%, rgba(182,82,47,.07), transparent 45%), radial-gradient(circle at 90% 15%, rgba(198,138,44,.06), transparent 40%)" }}
              aria-hidden="true"
            />
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[.15]" aria-hidden="true">
              <pattern id="etat-map-waves" width="46" height="18" patternUnits="userSpaceOnUse">
                <path d="M0 9 Q11.5 2 23 9 T46 9" fill="none" stroke="var(--etat-navy-600)" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#etat-map-waves)" />
            </svg>
            <Compass size={38} className="pointer-events-none absolute bottom-5 left-5 text-[var(--etat-navy-600)]/25" aria-hidden="true" />
            <Sailboat size={22} className="pointer-events-none absolute right-10 top-12 text-[var(--etat-navy-600)]/20" aria-hidden="true" />
            <Fish size={18} className="pointer-events-none absolute bottom-24 right-8 text-[var(--etat-navy-600)]/20" aria-hidden="true" />
            <Fish size={14} className="pointer-events-none absolute right-20 top-1/3 rotate-[20deg] text-[var(--etat-navy-600)]/15" aria-hidden="true" />
            <div className="relative aspect-[4/5] p-4 sm:aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-[520px]">
              <CoastlineTerritoryMap
                territories={state.territories}
                selectedId={territoryDrawer?.id}
                onSelect={(id) => {
                  const territory = state.territories.find((item) => item.id === id);
                  if (territory) setTerritoryDrawer(territory);
                }}
              />
            </div>
          </div>

          <aside className="etat-panel flex flex-col p-6" style={{ borderLeftWidth: 4, borderLeftColor: dominant.kind === "calme" ? "var(--etat-navy-600)" : "var(--etat-terracotta)" }}>
            <div className="flex items-center gap-2.5" style={{ color: dominant.kind === "calme" ? "var(--etat-navy-600)" : "var(--etat-terracotta)" }}>
              <TensionGlyph status={dominant.glyphStatus} size={26} pulse={dominant.kind !== "calme"} />
              <p className="text-[11px] font-bold uppercase tracking-widest">{dominant.kind === "calme" ? "Situation calme" : "À décider aujourd’hui"}</p>
            </div>
            <h2 className="etat-display mt-3 text-xl not-italic text-[var(--etat-navy-950)]">
              {dominant.kind === "signal" && `${vigilanceCategoryLabels[dominant.case.category]} à ${dominant.case.territoryLabel}`}
              {dominant.kind === "territoire" && `${dominant.territory.name} concentre l’attention du réseau`}
              {dominant.kind === "calme" && "Aucune tension prioritaire signalée"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--etat-stone-600)]">
              {dominant.kind === "signal" && dominant.case.description}
              {dominant.kind === "territoire" && "Territoire classé en activité critique — voir le détail pour comprendre ce qui s’y joue."}
              {dominant.kind === "calme" && "Le réseau reste sous surveillance continue ; les territoires actifs restent consultables sur la carte."}
            </p>

            {dominant.kind !== "calme" && (
              <div className="mt-4 space-y-2.5 border-t border-[var(--etat-line)] pt-4 text-sm text-[var(--etat-navy-950)]">
                <p className="flex items-center gap-2"><SituationIcon size={15} color="var(--etat-stone-600)" /> {dominantOpenSituations.length} situation(s) ouverte(s) sur ce territoire</p>
                {dominantFragileInfra > 0 && <p className="flex items-center gap-2"><Factory size={15} color="var(--etat-ocre)" /> {dominantFragileInfra} capacité(s) fragile(s) ou indisponible(s)</p>}
                {dominantPrioritySituation && <p className="text-xs text-[var(--etat-stone-600)]">Prochaine étape : {dominantPrioritySituation.nextStep}</p>}
              </div>
            )}

            <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
              {dominant.kind === "territoire" && <button className="etat-btn etat-btn-outline justify-center" onClick={() => setTerritoryDrawer(dominant.territory)}>Voir le territoire <ArrowRight size={15} /></button>}
              {dominantPrioritySituation ? (
                <button onClick={() => setSituationDrawer(dominantPrioritySituation)} className="etat-btn etat-btn-primary justify-center">Ouvrir l’arbitrage <ArrowRight size={15} /></button>
              ) : (
                <a href="#arbitrage" className="etat-btn etat-btn-outline justify-center">Voir les situations à arbitrer <ArrowRight size={15} /></a>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6 border-t border-[var(--etat-line)] pt-5">
          <div>
            <p className="etat-display text-2xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={territoiresActifs} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Territoires suivis</p>
          </div>
          <div>
            <p className="etat-display text-2xl not-italic" style={{ color: "var(--etat-ocre)" }}><NumberTicker value={territoiresVigilance} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">En vigilance</p>
          </div>
          <div>
            <p className="etat-display text-2xl not-italic" style={{ color: "var(--etat-terracotta)" }}><NumberTicker value={territoiresCritiques} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">En critique</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="etat-eyebrow">2 · Résultats de la coordination</p>
          <span className="etat-tag etat-tag--demo whitespace-normal text-left">Mode démonstration · données non opérationnelles</span>
        </div>
        <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Ce que la coordination a produit, en un coup d’œil.</h2>

        {/* §17 du mandat : un chiffre important vit directement sur la
            page, pas dans des cartes complètes à fond plein. 4 mesures
            maximum, toutes réellement dérivées (cf. commentaire des
            constantes ci-dessus pour le détail et ce qui a été écarté). */}
        <div className="mt-6 grid gap-8 border-y border-[var(--etat-line)] py-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <ResultatIcon size={20} color="var(--etat-terracotta)" />
            <p className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={totalValue} /> <span className="text-sm font-semibold text-[var(--etat-stone-600)]">FCFA</span></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Valeur coordonnée</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--etat-line)]"><div className="h-full rounded-full bg-[var(--etat-terracotta)]" style={{ width: `${executedRatio}%` }} /></div>
            <p className="mt-2 text-[11px] text-[var(--etat-stone-400)]">{executedRatio}% exécuté · {formatFcfa(engagedValue)} engagés</p>
          </div>
          <div>
            <DecisionIcon size={20} color="var(--etat-navy-600)" />
            <p className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={closedRatio} />%</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Situations clôturées avec résultat</p>
            <p className="mt-2 text-[11px] text-[var(--etat-stone-400)]">{closedWithResult} / {state.situations.length} dossier(s)</p>
          </div>
          <div>
            <SituationIcon size={20} color="var(--etat-navy-600)" />
            <p className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={involvedActors} /></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Acteurs impliqués dans une coordination</p>
          </div>
          <div>
            <Factory size={20} color="var(--etat-navy-600)" />
            <p className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={availableCapacity} /> <span className="text-sm font-semibold text-[var(--etat-stone-600)]">/ {state.infrastructures.length}</span></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Capacités disponibles</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Évolution des programmes en cours</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {leadIndicators.map(({ title, indicator }) => indicator && (
              <div key={title} className="border-t border-[var(--etat-line)] pt-4">
                <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{title}</p>
                <p className="text-xs text-[var(--etat-stone-600)]">{indicator.label}</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--etat-line)]"><div className="h-full rounded-full bg-[var(--etat-navy-600)]" style={{ width: `${Math.min(100, (indicator.current / indicator.target) * 100)}%` }} /></div>
                <p className="mt-2 text-xs text-[var(--etat-stone-600)]">{indicator.current} / {indicator.target} {indicator.unit} <span className="text-[var(--etat-stone-400)]">(départ : {indicator.baseline})</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapitre 3 — Où concentrer l'attention ? (mandat §5, Lot C).
          Remplace l'ancienne liste plate "Explorer tous les territoires" —
          browse des territoires stables toujours possible via la carte du
          Chapitre 1 (tous les 18 y sont cliquables), donc rien n'est perdu
          en retirant cette liste ici. */}
      {prioritized.length > 0 && (
        <section>
          <p className="etat-eyebrow">3 · Où concentrer l’attention ?</p>
          <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">{prioritized.length} territoire(s) prioritaire(s) sur {territoiresActifs} suivis par le réseau.</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {topPriorities.map((entry, index) => (
              <article key={entry.territory.id} className="etat-panel flex flex-col p-5" style={{ borderTopWidth: 3, borderTopColor: glyphBorderColor[entry.territory.activity] }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: glyphBorderColor[entry.territory.activity] }}>{index + 1}</span>
                  <StatusBadge status={entry.territory.activity} />
                </div>
                <h3 className="etat-display mt-3 text-lg not-italic text-[var(--etat-navy-950)]">{entry.territory.name}</h3>
                {/* Mini-carte (maquette validée, arbitrage CEO 2026-08-18) :
                    même composant partagé, mêmes positions calibrées —
                    aucune géométrie simplifiée ou recréée pour la
                    miniature, seulement un recadrage visuel (zoom CSS
                    autour du territoire, cf. territoryZoomStyle plus
                    haut) : le littoral entier réduit à cette hauteur
                    serait un fil illisible. selectedId met en évidence
                    ce territoire ; onSelect omis volontairement
                    (vignette de lecture, pas un second point d'entrée
                    vers le tiroir — "Voir le détail" plus bas reste le
                    seul CTA de la carte). */}
                <div className="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-lg border border-[var(--etat-line)] bg-[var(--etat-offwhite)]">
                  {/* Le wrapper interne reprend le ratio réel du viewBox
                      (704/1122) — sans ça, preserveAspectRatio="meet" sur
                      le <svg> (h-full w-full dans un conteneur beaucoup
                      plus large que haut) le réduit en lettrebox centré,
                      et les pourcentages de territoryZoomStyle ne
                      correspondent plus à la zone réellement dessinée :
                      c'est ce qui rendait les 3 vignettes vides. */}
                  <div className="h-full" style={{ aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`, ...territoryZoomStyle(entry.territory.id, 3.4) }}>
                    <CoastlineTerritoryMap territories={state.territories} selectedId={entry.territory.id} />
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-xs text-[var(--etat-stone-600)]">
                  <p><span className="font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Tension principale · </span>{entry.prioritySituation ? entry.prioritySituation.title : "Aucune situation ouverte"}</p>
                  <p><span className="font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Impact · </span>{entry.openSituationsCount} situation(s) ouverte(s){entry.fragileInfra > 0 ? ` · ${entry.fragileInfra} capacité(s) fragile(s)` : ""}</p>
                  <p><span className="font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Acteurs concernés · </span>{entry.acteurs}</p>
                </div>
                <button onClick={() => setTerritoryDrawer(entry.territory)} className="etat-btn etat-btn-outline mt-4 justify-center">Voir le détail <ArrowRight size={15} /></button>
              </article>
            ))}
          </div>

          {morePriorities.length > 0 && (
            <div className="mt-5">
              <button onClick={() => setPrioritiesExpanded((value) => !value)} className="etat-btn etat-btn-outline">
                {prioritiesExpanded ? "Réduire" : `Voir toutes les priorités (${prioritized.length})`} <ArrowRight size={15} className={prioritiesExpanded ? "rotate-90" : undefined} />
              </button>
              {prioritiesExpanded && (
                <div className="mt-4 rounded-xl border border-[var(--etat-line)]">
                  {morePriorities.map((entry) => (
                    <button key={entry.territory.id} onClick={() => setTerritoryDrawer(entry.territory)} className="flex w-full items-center gap-3 border-b border-[var(--etat-line)] py-3.5 pl-3 pr-2 text-left transition last:border-b-0 hover:bg-[var(--etat-offwhite)]" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[entry.territory.activity], backgroundColor: glyphFillColor[entry.territory.activity] }}>
                      <TensionGlyph status={entry.territory.activity} size={24} />
                      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--etat-navy-950)]">{entry.territory.name}</span><span className="mt-0.5 block text-xs text-[var(--etat-stone-600)]">{entry.prioritySituation ? entry.prioritySituation.title : `${entry.openSituationsCount} situation(s) ouverte(s)`}</span></span>
                      <StatusBadge status={entry.territory.activity} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section id="arbitrage">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="etat-eyebrow">4 · Situations à arbitrer</p>
            <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Situations critiques à arbitrer.</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--etat-stone-600)]">{situationsAArbitrer.length} situation(s) de risque élevé ou critique attendent une décision, sur {state.situations.filter((item) => item.status !== "reglee").length} dossier(s) ouverts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="etat-btn etat-btn-outline" onClick={() => setSignalDrawerOpen(true)}><Radio size={15} /> Signaler une situation</button>
          </div>
        </div>
        {situationsAArbitrer.length === 0 ? (
          <p className="mt-5 text-sm text-[var(--etat-stone-600)]">Aucune situation de risque élevé ou critique en attente d’arbitrage pour le moment.</p>
        ) : (
          <>
            {/* Desktop : table — la vraie surface décisionnelle (mandat
                §5, chapitre 4), même grammaire dual desktop/table + mobile
                cartes déjà établie dans OpportunitiesExplorer.tsx (P4,
                audit XXL Public) plutôt qu'un nouveau patron inventé.
                Échéance/Responsable = Situation.dueAt/responsibleId
                (champs réels, optionnels — "—" si non renseignés, jamais
                fabriqués). */}
            <div className="mt-5 hidden overflow-x-auto rounded-xl border border-[var(--etat-line)] md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--etat-line)] text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">
                    <th className="px-4 py-3 font-bold">Situation</th>
                    <th className="px-4 py-3 font-bold">Territoire</th>
                    <th className="px-4 py-3 font-bold">Urgence</th>
                    <th className="px-4 py-3 font-bold">Étape</th>
                    <th className="px-4 py-3 font-bold">Échéance</th>
                    <th className="px-4 py-3 font-bold">Responsable</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {situationsAArbitrer.map((situation) => {
                    const territory = state.territories.find((item) => item.id === situation.territoryId);
                    const tag = priorityToTag[situation.priority];
                    const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
                    const responsable = situation.responsibleId ? state.actors.find((item) => item.id === situation.responsibleId) : undefined;
                    return (
                      <tr key={situation.id} className="border-b border-[var(--etat-line)] last:border-b-0" style={{ borderLeftWidth: 3, borderLeftColor: glyphBorderColor[tag] }}>
                        <td className="px-4 py-3"><p className="font-semibold text-[var(--etat-navy-950)]">{situation.title}</p><p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{situation.nextStep}</p></td>
                        <td className="px-4 py-3 text-[var(--etat-stone-600)]">{territory?.name ?? situation.territoryId}</td>
                        <td className="px-4 py-3"><span className={`etat-tag ${tag === "critique" ? "etat-tag--critique" : "etat-tag--vigilance"}`}>{priorityLabels[situation.priority]}</span></td>
                        <td className="px-4 py-3 text-[var(--etat-stone-600)]">{stageLabel}</td>
                        <td className="px-4 py-3 text-[var(--etat-stone-600)]">{situation.dueAt ? new Date(situation.dueAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}</td>
                        <td className="px-4 py-3 text-[var(--etat-stone-600)]">{responsable?.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button className="etat-btn etat-btn-outline" style={{ minHeight: 32, padding: "5px 10px", fontSize: 12 }} onClick={() => setMissionDrawer({ key: `situation-${situation.id}`, territoryId: situation.territoryId, territoryLabel: territory?.name ?? situation.territoryId, raison: situation.title, action: situation.nextStep, glyphStatus: tag, suggestedObjective: "verification_vigilance" })}>Visite</button>
                            <button className="etat-btn etat-btn-primary" style={{ minHeight: 32, padding: "5px 10px", fontSize: 12 }} onClick={() => setSituationDrawer(situation)}>Arbitrer <ArrowRight size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile : cartes empilées (une table serait illisible sous
                480px) — même contenu que la table desktop. */}
            <div className="mt-5 space-y-3 md:hidden">
              {situationsAArbitrer.map((situation) => {
                const territory = state.territories.find((item) => item.id === situation.territoryId);
                const tag = priorityToTag[situation.priority];
                const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
                return (
                  <article key={situation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--etat-line)] p-4" style={{ borderLeftWidth: 4, borderLeftColor: glyphBorderColor[tag], backgroundColor: arbitrageFillColor[tag] }}>
                    <div className="flex items-center gap-3">
                      <TensionGlyph status={tag} size={30} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[var(--etat-navy-950)]">{territory?.name ?? situation.territoryId} · {situation.title}</p><span className={`etat-tag ${tag === "critique" ? "etat-tag--critique" : "etat-tag--vigilance"}`}>{priorityLabels[situation.priority]}</span></div>
                        <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{situation.nextStep}</p>
                        <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">Étape {stageLabel.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button className="etat-btn etat-btn-outline" style={{ minHeight: 36, padding: "6px 14px" }} onClick={() => setMissionDrawer({ key: `situation-${situation.id}`, territoryId: situation.territoryId, territoryLabel: territory?.name ?? situation.territoryId, raison: situation.title, action: situation.nextStep, glyphStatus: tag, suggestedObjective: "verification_vigilance" })}>Planifier une visite</button>
                      <button className="etat-btn etat-btn-primary" style={{ minHeight: 36, padding: "6px 14px" }} onClick={() => setSituationDrawer(situation)}>Arbitrer <ArrowRight size={15} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
        {visits.filter((item) => item.status === "planifiee").length > 0 && <p className="mt-4 text-xs text-[var(--etat-stone-600)]">{visits.filter((item) => item.status === "planifiee").length} visite(s) terrain déjà planifiée(s) par le ministère.</p>}
      </section>

      <section>
        <p className="etat-eyebrow">5 · Décisions et résultats récents</p>
        <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Décisions récentes.</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--etat-stone-600)]">{state.decisions.length} décision(s) enregistrée(s) au total — chaque arbitrage institutionnel reste tracé et consultable.</p>
        {recentDecisions.length === 0 ? (
          <p className="mt-5 text-sm text-[var(--etat-stone-600)]">Aucune décision enregistrée pour le moment.</p>
        ) : (
          <div className="relative mt-6 ml-5 border-l border-[var(--etat-line)] pl-7">
            {recentDecisions.map((decision, index) => {
              const situation = state.situations.find((item) => item.id === decision.situationId);
              const territory = situation ? state.territories.find((item) => item.id === situation.territoryId) : undefined;
              const decider = state.actors.find((item) => item.id === decision.decidedByActorId);
              // "Décision → acteur mobilisé → résultat" (mandat §5,
              // chapitre 5) : uniquement quand decision.coordinationId
              // existe et porte des engagements terminés avec un résultat
              // renseigné — pas de second acteur "proposé par / validé
              // par" fabriqué (arbitrage CEO 2026-08-17, le modèle n'a
              // qu'un décideur). Pour les décisions sans coordination
              // liée, seuls décision → décideur → justification restent
              // affichés, comme avant.
              const coordination = decision.coordinationId ? state.coordinationSpaces.find((item) => item.id === decision.coordinationId) : undefined;
              const completedCommitments = (coordination?.commitments ?? []).filter((item) => item.status === "terminee" && item.result);
              return (
                <div key={decision.id} className={index === recentDecisions.length - 1 ? "relative pb-1" : "relative border-b border-[var(--etat-line)] pb-6 mb-6"}>
                  <span className="absolute -left-[47px] top-0 grid size-10 place-items-center rounded-full" style={{ backgroundColor: "var(--etat-navy-600)" }}><DecisionIcon size={20} color="var(--etat-offwhite)" /></span>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{decisionTypeLabels[decision.type]}{situation ? ` · ${territory?.name ?? situation.territoryId}` : ""}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--etat-stone-600)]">{decision.rationale}</p>
                      <p className="mt-1.5 text-[11px] text-[var(--etat-stone-400)]">{new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}{decider ? ` · ${decider.name}` : ""}</p>
                      {completedCommitments.length > 0 && (
                        <div className="mt-2.5 space-y-1 border-t border-[var(--etat-line)] pt-2.5">
                          {completedCommitments.slice(0, 2).map((commitment) => {
                            const mobilizedActor = state.actors.find((item) => item.id === commitment.actorId);
                            return (
                              <p key={commitment.id} className="text-[11px] leading-4 text-[var(--etat-stone-600)]"><span className="font-bold text-[var(--etat-navy-950)]">Acteur mobilisé · </span>{mobilizedActor?.name ?? commitment.actorId} <span className="font-bold text-[var(--etat-navy-950)]">· Résultat · </span>{commitment.result}</p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {situation && <button className="etat-btn etat-btn-outline" style={{ minHeight: 32, padding: "5px 12px", fontSize: 12 }} onClick={() => setSituationDrawer(situation)}>Voir la situation <ArrowRight size={13} /></button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* InstitutionIllustration (P5, audit XXL Public) migre ici depuis
          l'ancien Hero (retiré au Lot B) — usage légitime au sens du
          mandat (§18, "couverture de rapport") plutôt que devenir un
          composant orphelin. */}
      <section className="etat-canvas-dark relative flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[28px] p-7 shadow-lg">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[32%] opacity-70 md:block" aria-hidden="true">
          <InstitutionIllustration />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--etat-navy-950) 0%, transparent 65%)" }} />
        </div>
        <div className="relative z-10">
          <p className="etat-eyebrow etat-eyebrow--on-dark">6 · Programmes &amp; rapport</p>
          <h2 className="etat-display mt-2 text-2xl not-italic">Un rapport d’impact prêt à partager.</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--etat-offwhite)]/65">Structuré par territoire, exportable, pensé pour vos propres échanges avec les bailleurs et programmes.</p>
        </div>
        <Link href="/app/etat/rapport" className="etat-btn etat-btn-primary relative z-10"><FileDown size={15} /> Ouvrir le rapport bailleurs</Link>
      </section>

      <Drawer open={!!territoryDrawer} onClose={() => setTerritoryDrawer(null)} eyebrow="Territoire" title={territoryDrawer?.name ?? ""}>
        {territoryDrawer && <TerritoryDetail territory={territoryDrawer} cases={cases.filter((item) => item.territoryId === territoryDrawer.id)} onOpenSituation={(situation) => { setTerritoryDrawer(null); setSituationDrawer(situation); }} />}
      </Drawer>
      {/* Panneau situation — correctif 2026-08-17 : "Arbitrer"/"Voir la
          situation"/"Ouvrir l'arbitrage"/"Entrer dans le dossier"
          pointaient tous vers /app/situations/[id] (groupe de routes
          (coordination)), dont la garde serveur redirige systématiquement
          le rôle institution vers /app/etat — retour silencieux, aucune
          erreur visible, CTA sans destination réelle pour ce rôle (bug
          signalé par le CEO, vérifié en conditions réelles, présent aux
          5 endroits ci-dessus). Corrigé en panneau inline plutôt qu'en
          nouvelle route : même pattern déjà correct pour "Voir le détail"
          (territoire) sur cette page — l'Institution n'a jamais quitté
          /app/etat pour explorer un territoire, pas de raison qu'elle le
          fasse pour une situation. Contenu volontairement en lecture
          (pas le poste de travail complet de SituationRoom.tsx, pensé
          pour le Coordinateur) — cohérent avec le rôle décisionnel de
          l'Institution. */}
      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""}>
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={signalDrawerOpen} onClose={() => setSignalDrawerOpen(false)} eyebrow="Vigilance" title="Signaler une situation">
        <SignalForm territories={state.territories} onDone={() => { setSignalDrawerOpen(false); void reload(); }} />
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => { setMissionDrawer(null); void reload(); }} />}
      </Drawer>
    </div>
  );
}

function severityRank(severity: VigilanceSeverity) {
  return { faible: 0, moyenne: 1, haute: 2, critique: 3 }[severity];
}

const situationPriorityRank: Record<Situation["priority"], number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };
const infraStatusColor: Record<"operationnelle" | "fragile" | "indisponible", string> = { operationnelle: "#1d8a5f", fragile: "var(--etat-ocre)", indisponible: "var(--etat-terracotta)" };
const infraStatusLabel: Record<"operationnelle" | "fragile" | "indisponible", string> = { operationnelle: "Opérationnelle", fragile: "Fragile", indisponible: "Indisponible" };

function TerritoryDetail({ territory, cases, onOpenSituation }: { territory: Territory; cases: VigilanceCase[]; onOpenSituation: (situation: Situation) => void }) {
  const { state } = useProduct();
  if (!state) return null;
  const sites = state.sites.filter((item) => item.territoryId === territory.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const acteurs = state.actors.filter((item) => item.territoryIds.includes(territory.id));
  const acteursParRole = acteurs.reduce<Record<string, number>>((acc, item) => { acc[item.role] = (acc[item.role] ?? 0) + 1; return acc; }, {});
  const prioritySituation = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];

  return (
    <div className="space-y-6">
      <StatusBadge status={territory.activity} />
      <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Localisation</p><p className="mt-1 text-sm text-[var(--etat-navy-950)]">{territory.region}</p></div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Acteurs actifs · {acteurs.length}</p>
        {acteurs.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucun acteur rattaché pour le moment.</p> : <div className="mt-1.5 flex flex-wrap gap-1.5">{Object.entries(acteursParRole).map(([role, count]) => <span key={role} className="etat-tag etat-tag--stable capitalize">{role.replaceAll("_", " ")} · {count}</span>)}</div>}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Infrastructures · {sites.length} site(s), {infrastructures.length} infrastructure(s)</p>
        {infrastructures.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucune infrastructure recensée.</p> : <div className="mt-1.5 space-y-1.5">{infrastructures.map((infra) => <div key={infra.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--etat-line)] bg-white px-3 py-2"><span className="text-xs font-medium capitalize text-[var(--etat-navy-950)]">{infra.type.replaceAll("_", " ")}</span><span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: infraStatusColor[infra.status] }}><span className="size-1.5 rounded-full" style={{ backgroundColor: infraStatusColor[infra.status] }} aria-hidden="true" />{infraStatusLabel[infra.status]}</span></div>)}</div>}
      </div>
      {prioritySituation && <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Situation prioritaire</p><div className="mt-2 rounded-lg border border-[var(--etat-line)] bg-white p-3"><p className="text-sm font-semibold text-[var(--etat-navy-950)]">{prioritySituation.title}</p><p className="mt-1 text-xs text-[var(--etat-stone-600)]">{prioritySituation.nextStep}</p>{prioritySituation.history.length > 0 && <div className="mt-3 space-y-1.5 border-t border-[var(--etat-line)] pt-3">{prioritySituation.history.slice(0, 2).map((entry) => <div key={entry.id} className="border-l-2 border-[var(--etat-line)] pl-2 text-[11px] leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{entry.label}</span> · {new Date(entry.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div>)}</div>}<button onClick={() => onOpenSituation(prioritySituation)} className="etat-btn etat-btn-outline mt-3 w-full justify-center">Entrer dans le dossier <ArrowRight size={15} /></button></div></div>}
      {cases.length > 0 && <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Signaux sur ce territoire</p><div className="mt-2 space-y-2">{cases.map((item) => <div key={item.id} className="rounded-lg bg-[var(--etat-offwhite)] p-3 text-xs text-[var(--etat-navy-950)]">{vigilanceCategoryLabels[item.category]} — {item.description}</div>)}</div></div>}
      {/* Repli honnête plutôt qu'un lien vers un 404 (mandat CEO
          2026-08-18) : ce territoire n'a pas de fiche publique
          équivalente à retrouver, contrairement à Joal (où un vrai
          mapping de slug existait) — le bloc reste visible, dans le
          même gabarit visuel que le lien actif, pour ne pas laisser un
          vide en bas du panneau, mais explicitement non cliquable et
          expliqué plutôt que masqué en silence. */}
      {territoriesWithoutPublicAtlas.has(territory.id) ? (
        <div className="etat-btn etat-btn-outline pointer-events-none w-full cursor-not-allowed justify-center opacity-50" aria-disabled="true">Pas encore de fiche publique pour ce territoire</div>
      ) : (
        <a href={`/atlas/${territoryPublicSlug[territory.id] ?? territory.id}`} target="_blank" rel="noreferrer" className="etat-btn etat-btn-outline w-full justify-center">Fiche territoire complète (site public) <ArrowUpRight size={15} /></a>
      )}
    </div>
  );
}

function SituationDetail({ situation, state, onPlanVisit }: { situation: Situation; state: NonNullable<ReturnType<typeof useProduct>["state"]>; onPlanVisit: () => void }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const tag = priorityToTag[situation.priority];
  const stageLabel = pipelineStages.find((stage) => stage.status === situation.status)?.label ?? situation.status;
  const responsable = situation.responsibleId ? state.actors.find((item) => item.id === situation.responsibleId) : undefined;
  const relatedDecisions = state.decisions
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`etat-tag ${tag === "critique" ? "etat-tag--critique" : tag === "vigilance" ? "etat-tag--vigilance" : "etat-tag--stable"}`}>{priorityLabels[situation.priority]}</span>
        <span className="text-xs text-[var(--etat-stone-600)]">{situation.reference} · {territory?.name ?? situation.territoryId}</span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Description</p>
        <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.description}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Étape actuelle · {stageLabel}</p>
        <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.nextStep}</p>
        {situation.waitingReason && <p className="mt-1 text-xs text-[var(--etat-stone-600)]">Motif d’attente : {situation.waitingReason}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Échéance</p>
          <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.dueAt ? new Date(situation.dueAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Non renseignée"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Responsable</p>
          <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{responsable?.name ?? "Non désigné"}</p>
        </div>
      </div>
      {(situation.result ?? situation.confirmation) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Résultat</p>
          {situation.result && <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{situation.result}</p>}
          {situation.confirmation && <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{situation.confirmation}</p>}
        </div>
      )}
      {situation.history.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Historique</p>
          <div className="mt-2 space-y-1.5 border-l border-[var(--etat-line)] pl-3">
            {situation.history.map((entry) => (
              <div key={entry.id} className="text-xs leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{entry.label}</span> · {new Date(entry.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</div>
            ))}
          </div>
        </div>
      )}
      {relatedDecisions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Décisions liées · {relatedDecisions.length}</p>
          <div className="mt-2 space-y-2">
            {relatedDecisions.map((decision) => (
              <div key={decision.id} className="rounded-lg border border-[var(--etat-line)] bg-white p-3">
                <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{decisionTypeLabels[decision.type]}</p>
                <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{decision.rationale}</p>
                <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">{new Date(decision.decidedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={onPlanVisit} className="etat-btn etat-btn-primary w-full justify-center">Planifier une visite <ArrowRight size={15} /></button>
    </div>
  );
}

function SignalForm({ territories, onDone }: { territories: Territory[]; onDone: () => void }) {
  const [category, setCategory] = useState<VigilanceCategory>("immigration_clandestine");
  const [territoryId, setTerritoryId] = useState("");
  const [severity, setSeverity] = useState<VigilanceSeverity>("moyenne");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/vigilance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, territoryId, severity, description }) });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error ?? "Impossible d’enregistrer ce signalement."); return; }
      onDone();
    } finally { setPending(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Catégorie<select value={category} onChange={(event) => setCategory(event.target.value as VigilanceCategory)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]">{Object.entries(vigilanceCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Territoire<select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]"><option value="">Sélectionner…</option>{territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}</select></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Gravité<select value={severity} onChange={(event) => setSeverity(event.target.value as VigilanceSeverity)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]">{Object.entries(vigilanceSeverityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Description<textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" placeholder="Ce qui a été observé, où et par qui." /></label>
      {error && <p className="text-xs font-semibold text-[var(--etat-terracotta)]">{error}</p>}
      <button disabled={pending} className="etat-btn etat-btn-primary w-full justify-center disabled:opacity-60">Signaler <Send size={15} /></button>
    </form>
  );
}

function MissionForm({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const [title, setTitle] = useState(`${fieldVisitObjectiveLabels[mission.suggestedObjective]} — ${mission.territoryLabel}`);
  const [plannedAt, setPlannedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/field-visits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, territoryId: mission.territoryId, objective: mission.suggestedObjective, plannedAt, notes: notes || undefined }) });
      const payload = await response.json();
      if (!response.ok) { setError(payload.error ?? "Impossible de planifier cette mission."); return; }
      onDone();
    } finally { setPending(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg bg-[var(--etat-offwhite)] p-3.5 text-xs leading-5 text-[var(--etat-navy-950)]"><strong>{mission.territoryLabel}</strong> — {mission.raison}</div>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Titre<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" /></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Date prévue<input required type="date" value={plannedAt} onChange={(event) => setPlannedAt(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" /></label>
      <label className="block text-xs font-semibold text-[var(--etat-navy-950)]">Notes (facultatif)<textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1.5 w-full rounded-md border border-[var(--etat-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--etat-navy-600)]" /></label>
      {error && <p className="text-xs font-semibold text-[var(--etat-terracotta)]">{error}</p>}
      <button disabled={pending} className="etat-btn etat-btn-primary w-full justify-center disabled:opacity-60">Planifier la mission <ArrowRight size={15} /></button>
    </form>
  );
}
