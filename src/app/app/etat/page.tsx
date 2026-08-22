"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Compass, Factory, FileDown, Fish, Radio, Sailboat, Search, Send, ShieldCheck, Users } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { InstitutionIllustration } from "@/components/public/CoordinationIllustration";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Drawer } from "@/components/etat/Drawer";
import { DecisionIcon, ResultatIcon, SituationIcon } from "@/components/etat/MotifIcons";
import { CoastlineTerritoryMap } from "@/components/territories/CoastlineTerritoryMap";
import { coastlineViewBox, territoryMapPositions } from "@/domain/territory-map-positions";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { decisionTypeLabels, type Initiative, type Situation, type Territory } from "@/domain/types";
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

// Caméra Atlas (Lot 1, Refonte Premium XXL Espace État, mandat CEO
// 2026-08-21, faisabilité confirmée dans le dispatch du 2026-08-20) :
// "Vue nationale" = coastlineViewBox inchangé ; un territoire sélectionné
// = une fenêtre resserrée autour de sa position calibrée, dans le même
// espace de coordonnées — territoryMapPositions et coastlinePath ne sont
// jamais recalculés ni retouchés, seule la fenêtre de lecture change.
//
// REGIONAL_WINDOW_HALF_HEIGHT calibré par script sur les 18 positions
// réelles (écarts nord-sud entre voisins : 32 à 115 unités, cf. gap
// analysis) : une demi-hauteur de 200 (fenêtre de 400 unités) inclut,
// pour chaque territoire testé, 3 à 9 voisins immédiats selon la densité
// locale — jamais un territoire isolé seul dans le cadre, jamais non plus
// un cadrage si large qu'il ne se distingue plus de la vue nationale.
// La largeur de fenêtre conserve le ratio du viewBox national (704/1122)
// pour rester cohérente avec le conteneur existant (aspect-[4/5] puis
// aspect-auto en desktop) — pas un nouveau ratio inventé.
const NATIONAL_ASPECT = viewBoxWidth / viewBoxHeight;
const REGIONAL_WINDOW_HALF_HEIGHT = 200;
function cameraWindowFor(territoryId: string | null): string {
  if (!territoryId) return coastlineViewBox;
  const position = territoryMapPositions[territoryId];
  if (!position) return coastlineViewBox;
  const [x, y] = position;
  const height = REGIONAL_WINDOW_HALF_HEIGHT * 2;
  const width = height * NATIONAL_ASPECT;
  return `${(x - width / 2).toFixed(1)} ${(y - height / 2).toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`;
}

// Interpolation JS (requestAnimationFrame), tranchée par le CEO le
// 2026-08-20 plutôt que le transform CSS déjà utilisé par
// territoryZoomStyle : l'attribut SVG viewBox n'est pas fiablement
// animable par une transition CSS pure sur tous les navigateurs. Grain
// simple (easing ease-out cubic), ~420ms — "transition courte, calme,
// premium" (mandat §6). Aucune dépendance nouvelle : interpolation
// manuelle des 4 nombres du viewBox, arrondie pour un rendu stable.
function useAnimatedViewBox(target: string, durationMs = 420): string {
  const [current, setCurrent] = useState(target);
  const frameRef = useRef<number | null>(null);
  useEffect(() => {
    const from = current.split(" ").map(Number);
    const to = target.split(" ").map(Number);
    if (from.every((value, index) => value === to[index])) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const interpolated = from.map((value, index) => value + (to[index] - value) * eased);
      setCurrent(interpolated.map((value) => value.toFixed(1)).join(" "));
      if (elapsed < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return current;
}

function StatusBadge({ status }: { status: "stable" | "vigilance" | "critique" }) {
  return <span className={`etat-tag ${statusTagClass[status]}`}>{statusTagLabel[status]}</span>;
}

function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

// Lot État-E — mêmes libellés que /app/app/(coordination)/initiatives/page.tsx
// et /app/etat/rapport (page interne + rapport, non modifiés) pour ne pas
// introduire un 3e vocabulaire de statut de financement.
const fundingStatusLabel: Record<"a_mobiliser" | "en_instruction" | "confirme", string> = { a_mobiliser: "À mobiliser", en_instruction: "En instruction", confirme: "Confirmé" };
const fundingTagClass: Record<"a_mobiliser" | "en_instruction" | "confirme", string> = { a_mobiliser: "etat-tag--stable", en_instruction: "etat-tag--vigilance", confirme: "etat-tag--reel" };

// Baseline → actuel → cible : même formule générique que /app/etat/rapport
// (Lot B), correcte aussi pour les indicateurs à réduire (cible < baseline).
function indicatorProgress(indicator: { baseline: number; target: number; current: number }) {
  const span = indicator.target - indicator.baseline;
  if (span === 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((indicator.current - indicator.baseline) / span) * 100)));
}

// Ligne/aire d'évolution — même technique que la courbe Pilotage
// (PilotageWorkspace.tsx, arbitrage CEO 2026-08-18, "Option 1") : grain
// jour, aucun point interpolé. N'est appelée que pour ≥2 points — en
// dessous, le repli textuel (cf. JSX) est honnête sur le manque
// d'historique plutôt que de forcer un tracé.
function buildTrendPath(values: number[], width: number, height: number, padding: number) {
  const maxValue = Math.max(...values, 1);
  const stepX = (width - padding * 2) / (values.length - 1);
  const scaleY = (value: number) => height - padding - (value / maxValue) * (height - padding * 2);
  const coords: [number, number][] = values.map((value, index) => [padding + index * stepX, scaleY(value)]);
  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${(height - padding).toFixed(1)} L${coords[0][0].toFixed(1)},${(height - padding).toFixed(1)} Z`;
  return { line, area, coords };
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
  // Lot État-A (mandat CEO 2026-08-20, §3.2/§3.3) : état distinct de
  // territoryDrawer — un clic sur l'Atlas sélectionne un territoire pour
  // peupler "À décider aujourd'hui" sans ouvrir immédiatement le tiroir.
  // territoryDrawer reste réservé à l'ouverture explicite via le CTA
  // "Voir le territoire".
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  // Correctif (CEO 2026-08-22) : la caméra par défaut cadre désormais sur
  // le territoire dominant (Joal, par ex.), pas la vue nationale — donc
  // "Vue nationale" ne peut plus se contenter de faire
  // setSelectedTerritoryId(null) (déjà null par défaut, sans effet sur la
  // caméra qui retomberait aussitôt sur le dominant). Ce drapeau distinct
  // force explicitement le national tant que l'utilisateur n'a pas
  // sélectionné un territoire précis (clic carte ou Périmètre) — remis à
  // false dès qu'une sélection explicite est faite, pour ne pas bloquer
  // la caméra sur le national après un choix réel.
  const [cameraForcedNational, setCameraForcedNational] = useState(false);
  // Lot État-B (mandat §3.1, §4.2) : filtre Période réel, restreint aux
  // dates calendaires réellement présentes dans les landings (seule
  // donnée temporelle avec une vraie dispersion sur cette page — les
  // décisions de démonstration partagent toutes le même decidedAt,
  // cf. commentaire plus bas, donc pas de filtre Période fabriqué dessus).
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  // Lot État-E (mandat §3.8) : filtre statut/phase propre aux programmes
  // — le filtre territoire, lui, réutilise selectedTerritoryId (même
  // Périmètre que le reste de la page, cf. Lot État-B).
  const [programmeStatusFilter, setProgrammeStatusFilter] = useState<Initiative["status"] | "all">("all");
  // Lot État-F (mandat §3.7) : filtre urgence propre à Situations à
  // arbitrer — le filtre territoire réutilise, ici aussi, le Périmètre
  // partagé (selectedTerritoryId).
  const [urgenceFilter, setUrgenceFilter] = useState<"all" | "critique" | "haute">("all");
  // Recherche libre (Lot 2, Refonte Premium XXL, arbitrage CEO Lot 0) :
  // filtre texte réel sur Situations à arbitrer, en complément du filtre
  // Urgence et du Périmètre partagé — pas un champ décoratif.
  const [arbitrageSearch, setArbitrageSearch] = useState("");
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);
  const [signalDrawerOpen, setSignalDrawerOpen] = useState(false);
  // Lot État-D (mandat §3.6) : carrousel homogène remplace le duo
  // "3 cards riches + liste appauvrie" — même grammaire de card pour
  // toutes les priorités, plus de second gabarit dégradé.
  const prioritiesTrackRef = useRef<HTMLDivElement>(null);
  const [prioritiesIndex, setPrioritiesIndex] = useState(0);

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

  // Correctif (CEO 2026-08-22) : la caméra doit cadrer sur le territoire
  // dominant dès le chargement, pas seulement après un clic explicite —
  // "carte et panneau doivent déjà raconter la même chose au premier
  // coup d'œil". Même expression que dominantTerritoryId plus bas
  // (réutilisée telle quelle, cf. const dominantTerritoryId), calculée
  // ici — avant le garde-fou `if (!state) return null` — parce que
  // useAnimatedViewBox est un hook et doit s'exécuter inconditionnellement
  // à chaque rendu ; dominant (déjà un memo) suffit à la déterminer sans
  // avoir besoin de state après le garde-fou.
  const cameraTargetId = cameraForcedNational ? null : (selectedTerritoryId ?? (dominant.kind === "territoire" ? dominant.territory.id : dominant.kind === "signal" ? dominant.case.territoryId : null));
  const cameraViewBox = useAnimatedViewBox(cameraWindowFor(cameraTargetId));

  if (!state) return null;

  const territoiresActifs = state.territories.length;
  const territoiresAttention = state.territories.filter((item) => item.activity !== "stable");

  // Synthèse nationale (Lot 1, Refonte Premium XXL, mandat §9) : bande
  // fine à 5 chiffres, remplace l'ancien triptyque "Territoires suivis /
  // En vigilance / En critique" (redondant avec la lecture par couleur
  // déjà disponible sur la carte) par les 5 agrégats explicitement
  // composés dans la référence — chacun recalculé ici sur le jeu de
  // données réel, aucun repris de la maquette (vérifié par script sur
  // createDemoState() : la maquette affichait 36/9/27,4M/18 — les 4
  // valeurs réelles diffèrent, seul "18 territoires" coïncide). "Financement
  // engagé" = somme des Funding confirmés + en instruction sur l'ensemble
  // des programmes (pas la "valeur coordonnée" du Chapitre 2, qui mesure
  // autre chose — un lot pêché, pas un financement de programme).
  const situationsOuvertesTotal = state.situations.filter((item) => item.status !== "reglee").length;
  const capacitesFragilesTotal = state.infrastructures.filter((item) => item.status !== "operationnelle").length;
  const financementEngageTotal = state.initiatives.reduce((sum, item) => sum + item.funding.filter((fund) => fund.status === "confirme" || fund.status === "en_instruction").reduce((fundSum, fund) => fundSum + fund.amountFcfa, 0), 0);
  const programmesActifsTotal = state.initiatives.filter((item) => item.status !== "terminee").length;

  // Chapitre 1 — décision prioritaire unique : bulles réellement dérivables
  // du territoire/dossier dominant, pas les libellés illustratifs de la
  // référence (aucun champ "sorties de pêche concernées"/"tonnage
  // impacté"/"risque de pertes" n'existe dans le modèle — non fabriqués).
  //
  // Lot État-A : selectedTerritoryId (clic Atlas explicite) prend le pas
  // sur le calcul dominant réseau — dès qu'un territoire est sélectionné,
  // tout le panneau (situations, capacités, KPI) se recalcule pour lui,
  // sans changer le calcul par défaut (dominant) quand rien n'est
  // sélectionné.
  const dominantTerritoryId = cameraTargetId ?? undefined;
  const focusTerritory = dominantTerritoryId ? state.territories.find((item) => item.id === dominantTerritoryId) : undefined;
  const dominantOpenSituations = dominantTerritoryId ? state.situations.filter((item) => item.territoryId === dominantTerritoryId && item.status !== "reglee") : [];
  const dominantFragileInfra = dominantTerritoryId ? state.infrastructures.filter((item) => item.territoryId === dominantTerritoryId && item.status !== "operationnelle").length : 0;
  const dominantPrioritySituation = [...dominantOpenSituations].sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];

  // Titre adaptatif du panneau quand un territoire est sélectionné
  // explicitement (mandat §3.3) : "À décider aujourd'hui" seulement
  // quand une décision est réellement attendue (situation ouverte
  // critique/haute), sinon un wording honnête selon le statut réel —
  // jamais une urgence fabriquée pour un territoire calme.
  const selectedPanelTitle = !selectedTerritoryId || !focusTerritory ? undefined :
    dominantPrioritySituation && (dominantPrioritySituation.priority === "critique" || dominantPrioritySituation.priority === "haute")
      ? "À décider aujourd’hui"
      : dominantOpenSituations.length > 0 || focusTerritory.activity === "vigilance"
        ? "À surveiller"
        : "Lecture du territoire";

  // KPI territoriaux du copilote (Lot 1, Refonte Premium XXL, mandat §8) —
  // tous directement dérivés du modèle, aucune dérivation de confiance
  // fabriquée en 7e chiffre. Recalculés à chaque changement de
  // dominantTerritoryId (sélection Atlas ou calcul dominant par défaut).
  //
  // Recomposition (Lot 1) : le mandat nomme explicitement en premier
  // "situations ouvertes, capacités fragiles, programmes concernés" —
  // ces 3 n'étaient pas dans la grille de tuiles jusqu'ici (situations
  // ouvertes/capacités fragiles vivaient en texte séparé juste au-dessus,
  // en double avec la tuile "Capacités fragiles/indisponibles" ; aucune
  // tuile "programmes concernés" n'existait). Débarquements/Sorties en
  // mer sont conservés : seule donnée que le filtre Période affecte
  // réellement (cf. légende du filtre) — les retirer aurait rendu ce
  // filtre inopérant. Sites/Immatriculations/Acteurs retirés de CETTE
  // grille (doctrine "jamais pour remplir l'espace", §8) — restent
  // consultables dans la fiche Territoire complète ("Voir le territoire").
  const focusSites = dominantTerritoryId ? state.sites.filter((item) => item.territoryId === dominantTerritoryId) : [];
  const focusSiteIds = new Set(focusSites.map((item) => item.id));
  const focusVessels = state.vessels.filter((item) => focusSiteIds.has(item.homeSiteId));
  const focusVesselIds = new Set(focusVessels.map((item) => item.id));
  const focusLandings = state.landings.filter((item) => focusSiteIds.has(item.siteId) && (periodFilter === "all" || (item.weighedAt ?? item.arrivedAt ?? "").slice(0, 10) === periodFilter));
  const focusTripsEnMer = state.trips.filter((item) => focusVesselIds.has(item.vesselId) && item.status === "en_mer" && (periodFilter === "all" || item.departureAt.slice(0, 10) === periodFilter)).length;
  const focusInfrastructures = dominantTerritoryId ? state.infrastructures.filter((item) => item.territoryId === dominantTerritoryId) : [];
  const focusAvailableCapacity = focusInfrastructures.filter((item) => item.status === "operationnelle").length;
  const focusProgrammes = dominantTerritoryId ? state.initiatives.filter((item) => item.territoryIds.includes(dominantTerritoryId)).length : 0;
  const territoryKpis = dominantTerritoryId ? [
    { icon: SituationIcon, value: dominantOpenSituations.length, label: "Situations ouvertes" },
    { icon: Factory, value: dominantFragileInfra, label: "Capacités fragiles/indisponibles", caption: `${focusAvailableCapacity} disponible(s) sur ${focusInfrastructures.length}` },
    { icon: Users, value: focusProgrammes, label: "Programmes concernés" },
    { icon: Fish, value: focusLandings.length, label: "Débarquements documentés" },
    { icon: Sailboat, value: focusTripsEnMer, label: "Sorties en mer en cours" }
  ] : [];

  // Rendu du panneau : sélection Atlas explicite prioritaire sur le
  // calcul dominant réseau (cf. commentaire dominantTerritoryId).
  const panelGlyphStatus = selectedTerritoryId && focusTerritory ? focusTerritory.activity : dominant.glyphStatus;
  const panelBorderColor = selectedTerritoryId && focusTerritory ? glyphBorderColor[focusTerritory.activity] : (dominant.kind === "calme" ? "var(--etat-navy-600)" : "var(--etat-terracotta)");
  const panelEyebrow = selectedPanelTitle ?? (dominant.kind === "calme" ? "Situation calme" : "À décider aujourd’hui");
  const panelHeading = selectedTerritoryId && focusTerritory
    ? selectedPanelTitle === "À décider aujourd’hui"
      ? `${focusTerritory.name} — une décision est attendue`
      : selectedPanelTitle === "À surveiller"
        ? `${focusTerritory.name} — à surveiller`
        : `Lecture de ${focusTerritory.name}`
    : dominant.kind === "signal" ? `${vigilanceCategoryLabels[dominant.case.category]} à ${dominant.case.territoryLabel}`
    : dominant.kind === "territoire" ? `${dominant.territory.name} concentre l’attention du réseau`
    : "Aucune tension prioritaire signalée";
  const panelDescription = selectedTerritoryId && focusTerritory
    ? (dominantPrioritySituation?.description ?? (focusTerritory.activity === "stable" ? "Aucune situation ouverte prioritaire sur ce territoire pour le moment." : "Territoire sélectionné sur la carte — voir le détail pour comprendre ce qui s’y joue."))
    : dominant.kind === "signal" ? dominant.case.description
    : dominant.kind === "territoire" ? "Territoire classé en activité critique — voir le détail pour comprendre ce qui s’y joue."
    : "Le réseau reste sous surveillance continue ; les territoires actifs restent consultables sur la carte.";

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

  const totalValue = executedValue + engagedValue;
  const executedRatio = totalValue > 0 ? Math.round((executedValue / totalValue) * 100) : 0;
  // Évolution de la valeur coordonnée (maquette validée, arbitrage CEO
  // 2026-08-18) — même méthode que la courbe Pilotage (mandat CEO
  // 2026-08-18, "Option 1") : grain jour, un point par date réellement
  // pesée. Opportunity ne porte aucun horodatage propre (cf.
  // domain/types.ts) ; le seul chemin honnête vers une date réelle est
  // lot → landing.weighedAt/arrivedAt — la même donnée déjà utilisée par
  // la courbe Pilotage, pas une nouvelle source inventée pour cette page.
  const coordinatedValueByDate = new Map<string, number>();
  for (const opportunity of state.opportunities) {
    if (opportunity.status !== "executee" && opportunity.status !== "engagee") continue;
    const lot = state.lots.find((item) => item.id === opportunity.lotId);
    if (!lot) continue;
    const landing = state.landings.find((item) => item.id === lot.landingId);
    const timestamp = landing?.weighedAt ?? landing?.arrivedAt;
    if (!timestamp) continue;
    const species = state.species.find((item) => item.id === lot.speciesId);
    const value = lot.quantityKg * (species?.indicativePriceFcfaKg ?? 0);
    const date = timestamp.slice(0, 10);
    coordinatedValueByDate.set(date, (coordinatedValueByDate.get(date) ?? 0) + value);
  }
  const coordinatedValueTrendPoints = [...coordinatedValueByDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
  // Seuil relevé à 3 points (Lot 2, gap analysis Lot 0 — écart confirmé
  // "fiable à 100%" par le CEO) : une ligne reliant exactement 2 points
  // dessine une pente qui n'existe pas réellement — 2 dates ne racontent
  // pas une évolution, seulement une différence entre deux instants. Le
  // mandat est explicite (§5) : "si aucune vraie série temporelle
  // n'existe, ne pas simuler une courbe [...] préférer une comparaison
  // réelle entre périodes disponibles". Exactement 2 points → comparaison
  // directe ci-dessous (pas de tracé), pas une fausse tendance graphique.
  const coordinatedValueTrendPath = coordinatedValueTrendPoints.length >= 3 ? buildTrendPath(coordinatedValueTrendPoints.map((point) => point.value), 640, 180, 20) : null;
  // Lot État-B — Périmètre réel (mandat §3.1) : réutilise selectedTerritoryId
  // (même état que le clic Atlas, Lot État-A) plutôt qu'un second
  // mécanisme de sélection parallèle — un seul territoire "actif" pour
  // toute la page, quelle que soit son origine (carte ou sélecteur).
  // Recherche libre (Lot 2, arbitrage CEO Lot 0) : sur titre, prochaine
  // étape et nom du territoire — les seuls champs texte réellement lisibles
  // par un décideur sur cette ligne, pas d'index caché ni de champ interne.
  const arbitrageSearchNormalized = arbitrageSearch.trim().toLowerCase();
  const situationsAArbitrer = state.situations
    .filter((item) =>
      item.status !== "reglee" &&
      (urgenceFilter === "all" ? (item.priority === "critique" || item.priority === "haute") : item.priority === urgenceFilter) &&
      (!selectedTerritoryId || item.territoryId === selectedTerritoryId) &&
      (arbitrageSearchNormalized === "" || [
        item.title,
        item.nextStep,
        state.territories.find((territory) => territory.id === item.territoryId)?.name ?? ""
      ].some((field) => field.toLowerCase().includes(arbitrageSearchNormalized)))
    )
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority]);
  const recentDecisions = [...state.decisions]
    .filter((item) => {
      if (!selectedTerritoryId) return true;
      const linkedSituation = state.situations.find((situation) => situation.id === item.situationId);
      return linkedSituation?.territoryId === selectedTerritoryId;
    })
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
    .slice(0, 5);
  // Dates calendaires réelles disponibles pour le filtre Période — dérivées
  // des landings (seule donnée avec une vraie dispersion temporelle ici).
  const landingDates = [...new Set(state.landings.map((item) => (item.weighedAt ?? item.arrivedAt ?? "").slice(0, 10)).filter(Boolean))].sort();

  // Lot État-E (mandat §3.8) — portefeuille de programmes filtrable :
  // toutes les initiatives (plus de limite à 2), filtrées par le
  // Périmètre partagé (selectedTerritoryId) et par statut/phase.
  const filteredProgrammes = state.initiatives.filter((item) =>
    (!selectedTerritoryId || item.territoryIds.includes(selectedTerritoryId)) &&
    (programmeStatusFilter === "all" || item.status === programmeStatusFilter)
  );

  return (
    <div className="etat-scope bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
      {/* Correctif 2 (CEO 2026-08-22) : la mesure directe du CEO a montré
          qu'au-delà du bandeau doctrine/eyebrow/toolbar déjà resserrés
          individuellement (correctif 1), l'espace CUMULÉ avant la carte
          restait excessif — trois interstices de 64px (space-y-16 du
          conteneur racine, appliqué uniformément à tous ses enfants
          directs, y compris entre doctrine/nav/toolbar) ajoutaient à eux
          seuls 192px. space-y-16 retiré du conteneur racine ; ce trio
          (doctrine/nav/toolbar) forme désormais son propre groupe à
          espacement resserré (space-y-2), et les chapitres eux-mêmes
          (#terrain et suivants) sont regroupés dans un second conteneur
          qui reprend exactement le même space-y-16 qu'avant — seul
          l'espacement AVANT la carte change, le rythme entre chapitres
          reste identique à ce qui était déjà validé. */}
      <div className="space-y-2">
        {/* Correctif (CEO 2026-08-22) : ce bandeau de doctrine consommait
            ~70px de hauteur (icône + paragraphe deux lignes, bordure
            pleine largeur) avant même la nav, absent de la référence —
            retiré purement, pas seulement raccourci : la maquette ne le
            montre à aucun endroit de ce premier viewport, et son contenu
            (portée institutionnelle "qualifie et signale, ne décide pas")
            reste disponible ailleurs sur le produit (bandeau d'accueil,
            mentions). Réduit ici à une seule ligne fine, sans bordure
            pleine largeur ni icône séparée — garde le rappel de portée
            sans le coût vertical. */}
        <p className="flex items-center gap-1.5 text-xs text-[var(--etat-stone-600)]">
          <ShieldCheck size={13} className="shrink-0 text-[var(--etat-navy-600)]" />
          Mbàmbulaan qualifie et signale les situations remontées du terrain — la décision relève des autorités compétentes.
        </p>

        {/* Lot État-B (mandat §3.1) : navigation d'ancrage propre à l'Espace
            État — confirmée comme telle par le CEO (pas un rail permanent
            façon AppSidebar/AppShell, cohérent avec A14/D9). Simple ligne de
            liens horizontale, défilante sur mobile, pas de position sticky
            (le CEO n'a pas demandé un rail persistant au scroll).
            Ordre des liens (Lot 2, Refonte Premium XXL) : reprend désormais
            l'ordre physique réel des chapitres sur la page — Arbitrages et
            Performance & impact permutés pour suivre le nouvel ordre
            Lecture territoriale → Situations à arbitrer → Résultats de la
            coordination → Programmes → Où concentrer l'attention → Rapports
            & redevabilité (arbitrage CEO, Lot 0). Territoires reste après
            Programmes pour l'instant — son propre déplacement est prévu au
            Lot 3, pas encore fait ici. */}
        <nav className="-mx-1 flex gap-1 overflow-x-auto border-b border-[var(--etat-line)] pb-3 text-sm">
          {[
            { href: "#terrain", label: "Vue d’ensemble" },
            { href: "#arbitrage", label: "Arbitrages" },
            { href: "#performance", label: "Performance & impact" },
            { href: "#programmes", label: "Programmes" },
            { href: "#territoires", label: "Territoires" },
            { href: "#redevabilite", label: "Rapports & redevabilité" }
          ].map((item) => (
            <a key={item.href} href={item.href} className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-[var(--etat-navy-800)] transition hover:bg-[var(--etat-offwhite)]">{item.label}</a>
          ))}
        </nav>

        {/* Filtres Périmètre/Période réellement fonctionnels (mandat §3.1,
            §8, arbitrage CEO 2026-08-20 levant la réserve "lecture seule"
            du 18/08). Périmètre réutilise selectedTerritoryId (Lot État-A) :
            un seul mécanisme de sélection de territoire pour toute la
            page, que l'origine soit la carte ou ce sélecteur. Période
            restreinte aux dates calendaires réellement présentes dans les
            landings (seule donnée avec une vraie dispersion temporelle
            ici) — pas de filtre fabriqué sur les décisions, qui partagent
            toutes le même decidedAt dans ce jeu de démonstration.
            Toolbar blanche compacte (Lot 1, Refonte Premium XXL, mandat
            §2) : les filtres flottaient jusqu'ici directement sur le
            crème, comme la nav juste au-dessus — désormais une surface
            blanche distincte, cohérente avec la doctrine crème/blanc déjà
            appliquée ailleurs sur cette page (chapitres en .etat-panel). */}
        {/* Toolbar resserrée davantage (correctif CEO 2026-08-22, py-1.5
            au correctif 2 du même jour) : padding réduit (py-3→py-2→py-1.5,
            gap-8→gap-6) et texte d'aide du filtre Période retiré de sa
            propre ligne visible — reporté en `title` (info-bulle native au
            survol), l'information reste disponible sans consommer de
            hauteur en permanence. */}
        <div className="etat-panel flex flex-wrap items-center gap-6 px-5 py-1.5">
        <label className="block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Périmètre</p>
          <select
            value={selectedTerritoryId ?? ""}
            onChange={(event) => { setSelectedTerritoryId(event.target.value || null); setCameraForcedNational(!event.target.value); }}
            className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
          >
            <option value="">Sénégal entier</option>
            {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
              <option key={territory.id} value={territory.id}>{territory.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Période</p>
          <select
            value={periodFilter}
            onChange={(event) => setPeriodFilter(event.target.value)}
            title="S’applique aux débarquements et sorties en mer du panneau territorial."
            className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
          >
            <option value="all">Toutes les dates disponibles</option>
            {landingDates.map((date) => (
              <option key={date} value={date}>{new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</option>
            ))}
          </select>
        </label>
        </div>
      </div>

      {/* Groupe des chapitres (correctif 2) : reprend exactement le
          space-y-16 qui régissait auparavant tout le conteneur racine —
          seul l'espacement AVANT ce groupe change (mt-4 au lieu des 64px
          de space-y-16 hérités du bandeau/nav/toolbar), le rythme entre
          #terrain et les chapitres suivants reste identique à avant. */}
      <div className="mt-4 space-y-16">
      {/* Chapitre 1 — Lecture territoriale (mandat §5, Lot B ; recomposé
          Lot 1, correctif CEO 2026-08-22). L'ancien bloc d'en-tête pleine
          largeur (eyebrow + H1 serif + sous-titre, ~90px avant la carte)
          n'existe pas dans la référence, où "LECTURE TERRITORIALE" est
          un simple eyebrow discret intégré à l'intérieur de la carte —
          repris ici tel quel : le H1 (rôle sémantique conservé, reste le
          titre principal de la page) devient ce même eyebrow compact,
          affiché en tête de la carte plutôt qu'au-dessus dans un bloc
          séparé. Le sous-titre descriptif est retiré de ce viewport
          (absent de la référence) — le geste "cliquer un point" reste
          auto-évident via les marqueurs eux-mêmes et le bouton Vue
          nationale. */}
      <section id="terrain" className="scroll-mt-6">
        {/* grid-cols-1 explicite (Lot 1, correctif débordement mobile) :
            sans lui, la piste implicite d'une grille display:grid en
            dessous de lg n'a pas de minmax(0, 1fr) — le texte tronqué
            "Prochaine étape" (nouveau dans ce lot) laissait fuir sa
            largeur min-content non contrainte, poussant toute la piste
            (donc la carte ET le panneau) à ~393px sur un viewport à
            390px. Confirmé par script (git stash sur ce lot : aucun
            débordement avant, +23px après) avant d'écrire ce correctif. */}
        {/* lg:h-[520px] explicite (correctif CEO 2026-08-22, ajusté au
            correctif 2 du même jour) : remplace lg:items-stretch seul.
            Cause identifiée par mesure DOM directe (958px sur le seul
            bloc CTA de l'aside, panneau total 1428px) : un enfant
            lg:h-full imbriqué dans un item de grille sans hauteur PROPRE
            (seulement stretch) ne resout pas de façon fiable — la piste
            de grille grandissait pour englober le contenu au lieu de le
            contraindre. Une hauteur fixe sur la ligne elle-même donne
            enfin à lg:h-full (sur le conteneur de la carte) une base de
            résolution définie. 520px plutôt que 560px (correctif 2) :
            toujours dans la fourchette "~520-560px" du mandat (§4), donc
            aucun nouvel écart au mandat — la borne basse déjà approuvée
            est simplement celle retenue, pour que la bande de synthèse
            nationale juste en dessous reste visible sans scroll à
            1440×900 (mesure CEO : elle dépassait de 40px). */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:h-[520px] lg:grid-cols-[1.3fr_.7fr]">
          {/* Richesse visuelle de la carte (maquette validée, arbitrage
              CEO 2026-08-18, corrigé le même jour après vérification par
              capture réelle) : texture/boussole/icônes décoratives
              ajoutées ICI, en habillage autour du composant partagé —
              CoastlineTerritoryMap.tsx lui-même n'est pas touché, pour ne
              pas propager cet habillage à /app/pilotage qui réutilise le
              même composant et dont la composition est déjà close et
              validée. Aucune nouvelle géométrie : coastlinePath et
              territoryMapPositions inchangés.

              Correctif "pas de bleu" (2026-08-18) : la règle "palette D9
              verrouillée, pas de bleu" encadre l'habillage produit
              (cartes, boutons, badges, signalétique) pour éviter
              l'esthétique SaaS générique — elle ne s'applique pas à un
              contenu illustratif représentant un phénomène naturel réel.
              La mer est bleue ; la peindre autrement la rendait
              illisible (vérifié par capture, pas seulement décrit). Bleu
              marine désaturé ici (--etat-water-*, propre à cet
              habillage, pas un nouveau token D9 réutilisé ailleurs) —
              cohérent avec l'esprit sobre de la page, mais se lit
              clairement comme de l'eau. Icônes agrandies et assombries
              pour avoir une vraie présence visuelle, plus un geste
              symbolique à peine perceptible dans un coin. */}
          <div className="etat-panel relative overflow-hidden" style={{ "--etat-water-deep": "#2c4f63", "--etat-water-mid": "#4c7691", "--etat-water-light": "#89aec2" } as React.CSSProperties}>
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle at 15% 8%, var(--etat-water-light), transparent 42%), radial-gradient(circle at 88% 82%, var(--etat-water-mid), transparent 48%), linear-gradient(165deg, var(--etat-water-light) 0%, var(--etat-water-mid) 55%, var(--etat-water-deep) 100%)", opacity: 0.5 }}
              aria-hidden="true"
            />
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
              <pattern id="etat-map-waves" width="52" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q13 2 26 10 T52 10" fill="none" stroke="var(--etat-water-deep)" strokeWidth="1.6" />
                <path d="M0 16 Q13 8 26 16 T52 16" fill="none" stroke="var(--etat-water-mid)" strokeWidth="1.2" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#etat-map-waves)" />
            </svg>
            <Compass size={64} strokeWidth={1.4} className="pointer-events-none absolute bottom-5 left-5 text-[var(--etat-water-deep)] opacity-70" aria-hidden="true" />
            <Sailboat size={44} strokeWidth={1.6} className="pointer-events-none absolute right-12 top-10 text-[var(--etat-water-deep)] opacity-70" aria-hidden="true" />
            <Fish size={30} strokeWidth={1.6} className="pointer-events-none absolute bottom-28 right-10 text-[var(--etat-water-deep)] opacity-60" aria-hidden="true" />
            <Fish size={22} strokeWidth={1.6} className="pointer-events-none absolute right-24 top-1/3 rotate-[20deg] text-[var(--etat-water-deep)] opacity-50" aria-hidden="true" />
            <Fish size={18} strokeWidth={1.6} className="pointer-events-none absolute left-10 top-1/4 -rotate-[15deg] text-[var(--etat-water-deep)] opacity-40" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3 px-4 pt-4">
              {/* Contraste (correctif CEO 2026-08-22) : etat-eyebrow--on-dark
                  seul (ocre sur fond eau clair par endroits) restait
                  quasi illisible à la capture — petite plaque bg-white/90
                  identique au traitement déjà utilisé pour le bouton
                  "Vue nationale" juste à côté, pas une nouvelle couleur. */}
              <h1 className="etat-eyebrow rounded-full bg-white/90 px-3 py-1.5">Lecture territoriale</h1>
              {/* Caméra Atlas (Lot 1, correctif CEO 2026-08-22) : contrôle de
                  retour explicite, visible dès qu'un cadrage régional est
                  actif — y compris par défaut au chargement (territoire
                  dominant), pas seulement après un clic. Condition sur
                  cameraTargetId (pas selectedTerritoryId) : la caméra peut
                  être resserrée sans sélection explicite (calcul dominant),
                  il faut quand même pouvoir en sortir. */}
              {cameraTargetId && (
                <button onClick={() => { setSelectedTerritoryId(null); setCameraForcedNational(true); }} className="etat-btn etat-btn-outline shrink-0 bg-white/90 text-xs"><Compass size={13} /> Vue nationale</button>
              )}
            </div>
            <div className="relative aspect-[4/5] p-4 sm:aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-[520px]">
              <CoastlineTerritoryMap
                territories={state.territories}
                selectedId={selectedTerritoryId ?? undefined}
                onSelect={(id) => { setSelectedTerritoryId(id); setCameraForcedNational(false); }}
                viewBox={cameraViewBox}
              />
            </div>
          </div>

          {/* overflow-y-auto (correctif CEO 2026-08-22) : filet de sécurité
              maintenant que la ligne a une hauteur fixe (lg:h-[520px]) —
              si le contenu du panneau (situation longue, 5 tuiles KPI)
              dépasse malgré tout cette hauteur, il défile en interne au
              lieu de repousser la carte, plutôt que de reproduire le
              même bug avec un autre déclencheur. */}
          <aside className="etat-panel flex flex-col overflow-y-auto p-6" style={{ borderLeftWidth: 4, borderLeftColor: panelBorderColor }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5" style={{ color: panelBorderColor }}>
                <TensionGlyph status={panelGlyphStatus} size={26} pulse={panelGlyphStatus !== "stable"} />
                <p className="text-[11px] font-bold uppercase tracking-widest">{panelEyebrow}</p>
              </div>
              {selectedTerritoryId && (
                <button onClick={() => { setSelectedTerritoryId(null); setCameraForcedNational(false); }} className="text-[11px] font-semibold text-[var(--etat-stone-400)] underline decoration-dotted underline-offset-2 hover:text-[var(--etat-stone-600)]">Revenir à la lecture par défaut</button>
              )}
            </div>
            <h2 className="etat-display mt-3 text-xl not-italic text-[var(--etat-navy-950)]">{panelHeading}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--etat-stone-600)]">{panelDescription}</p>

            {/* Lot 1 (Refonte Premium XXL, mandat §8) : les mentions texte
                "situations ouvertes"/"capacités fragiles" qui vivaient ici
                en double avec la grille de tuiles ci-dessous sont retirées
                — une seule source d'affichage par chiffre. "Prochaine
                étape" reste, seule affirmation qui n'est pas déjà un
                chiffre, avec son propre libellé (mandat : "Prochaine
                étape" comme rangée distincte). */}
            {dominantPrioritySituation && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--etat-line)] pt-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Prochaine étape</p>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--etat-navy-950)]">{dominantPrioritySituation.nextStep}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-[var(--etat-stone-400)]" />
              </div>
            )}

            {/* 6 KPI territoriaux réels (mandat §3.3) — compacts, icône +
                valeur + libellé, recalculés à chaque changement de
                territoire en focus (sélection Atlas ou calcul dominant). */}
            {territoryKpis.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--etat-line)] pt-4 sm:grid-cols-3">
                {territoryKpis.map((kpi) => (
                  <div key={kpi.label}>
                    <kpi.icon size={15} color="var(--etat-stone-600)" />
                    <p className="etat-display mt-1 text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={kpi.value} /></p>
                    <p className="text-[10px] font-bold uppercase tracking-wide leading-tight text-[var(--etat-stone-600)]">{kpi.label}</p>
                    {"caption" in kpi && kpi.caption && <p className="mt-0.5 text-[10px] text-[var(--etat-stone-400)]">{kpi.caption}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
              {focusTerritory && <button className="etat-btn etat-btn-outline justify-center" onClick={() => setTerritoryDrawer(focusTerritory)}>Voir le territoire <ArrowRight size={15} /></button>}
              {dominantPrioritySituation ? (
                <button onClick={() => setSituationDrawer(dominantPrioritySituation)} className="etat-btn etat-btn-primary justify-center">Voir la situation <ArrowRight size={15} /></button>
              ) : (
                <a href="#arbitrage" className="etat-btn etat-btn-outline justify-center">Voir les situations à arbitrer <ArrowRight size={15} /></a>
              )}
            </div>
          </aside>
        </div>

        {/* mt-5 (correctif 2, était mt-6) : marge de sécurité supplémentaire
            sous la carte (520px) pour que cette bande reste visible sans
            scroll à 1440×900 — pas seulement tangente au pixel près. */}
        <div className="etat-panel mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 divide-x divide-[var(--etat-line)] p-5">
          <div className="pl-0">
            <p className="etat-display text-xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={situationsOuvertesTotal} /></p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Situations ouvertes</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={territoiresActifs} /></p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Territoires couverts</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={capacitesFragilesTotal} /></p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Capacités fragiles</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-xl not-italic text-[var(--etat-navy-950)]">{formatFcfa(financementEngageTotal)}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Financement engagé</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-xl not-italic text-[var(--etat-navy-950)]"><NumberTicker value={programmesActifsTotal} /></p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Programmes actifs</p>
          </div>
          <a href="#performance" className="ml-auto flex shrink-0 items-center gap-1.5 pl-8 text-xs font-bold text-[var(--etat-navy-800)] hover:text-[var(--etat-navy-600)]">Voir le détail de la performance <ArrowRight size={13} /></a>
        </div>
      </section>

      <section id="arbitrage" className="scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="etat-eyebrow">2 · Situations à arbitrer</p>
            <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Situations critiques à arbitrer.</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--etat-stone-600)]">{situationsAArbitrer.length} situation(s) {urgenceFilter === "all" ? "de risque élevé ou critique" : urgenceFilter === "critique" ? "critiques" : "de risque élevé"} attendent une décision, sur {state.situations.filter((item) => item.status !== "reglee" && (!selectedTerritoryId || item.territoryId === selectedTerritoryId)).length} dossier(s) ouverts{selectedTerritoryId ? ` · ${focusTerritory?.name ?? selectedTerritoryId}` : ""}.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {/* Recherche libre (Lot 2, arbitrage CEO Lot 0) : "il faut la
                conserver et la rendre plus dynamique" — filtre texte réel,
                pas décoratif, cf. situationsAArbitrer ci-dessus. */}
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Recherche</p>
              <div className="relative mt-1">
                <Search size={14} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--etat-stone-400)]" />
                <input
                  type="search"
                  value={arbitrageSearch}
                  onChange={(event) => setArbitrageSearch(event.target.value)}
                  placeholder="Titre, étape, territoire…"
                  className="w-44 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-7 pr-2 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
                />
              </div>
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Urgence</p>
              <select
                value={urgenceFilter}
                onChange={(event) => setUrgenceFilter(event.target.value as "all" | "critique" | "haute")}
                className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
              >
                <option value="all">Critique + élevé</option>
                <option value="critique">Critique seulement</option>
                <option value="haute">Élevé seulement</option>
              </select>
            </label>
            <button className="etat-btn etat-btn-outline" onClick={() => setSignalDrawerOpen(true)}><Radio size={15} /> Signaler une situation</button>
          </div>
        </div>
        {/* Chapitre enveloppé dans .etat-panel (correctif 2026-08-18,
            vérification par capture) — même doctrine crème/blanc que
            Résultats de la coordination (cf. commentaire équivalent
            plus loin). */}
        <div className="etat-panel mt-5 p-6 lg:p-7">
        {situationsAArbitrer.length === 0 ? (
          <p className="text-sm text-[var(--etat-stone-600)]">{arbitrageSearchNormalized ? `Aucune situation ne correspond à « ${arbitrageSearch} » avec ces filtres.` : "Aucune situation de risque élevé ou critique en attente d’arbitrage pour le moment."}</p>
        ) : (
          <>
            {/* Desktop : table — la vraie surface décisionnelle (mandat
                §5, chapitre 4), même grammaire dual desktop/table + mobile
                cartes déjà établie dans OpportunitiesExplorer.tsx (P4,
                audit XXL Public) plutôt qu'un nouveau patron inventé.
                Échéance/Responsable = Situation.dueAt/responsibleId
                (champs réels, optionnels — "—" si non renseignés, jamais
                fabriqués). Bordure/arrondi propres retirés (redondants,
                désormais imbriqués dans .etat-panel). */}
            <div className="hidden overflow-x-auto md:block">
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
        </div>
        {visits.filter((item) => item.status === "planifiee").length > 0 && <p className="mt-4 text-xs text-[var(--etat-stone-600)]">{visits.filter((item) => item.status === "planifiee").length} visite(s) terrain déjà planifiée(s) par le ministère.</p>}
      </section>

      <section id="performance" className="scroll-mt-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="etat-eyebrow">3 · Résultats de la coordination</p>
          <span className="etat-tag etat-tag--demo whitespace-normal text-left">Mode démonstration · données non opérationnelles</span>
        </div>
        <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Ce que la coordination a produit, en un coup d’œil.</h2>

        {/* Chapitre enveloppé dans .etat-panel (correctif 2026-08-18,
            vérification par capture) : le Chapitre 1 était déjà une
            surface blanche sur fond crème, les Chapitres 2 et 4
            flottaient directement sur le crème avec de simples filets —
            même doctrine crème/blanc déjà posée ailleurs (Public,
            Produit), appliquée ici de façon incomplète jusqu'ici. Ne
            change rien à la doctrine "chiffres inline" (§17) : les
            chiffres restent inline, seul le conteneur du chapitre
            redevient une surface blanche. */}
        <div className="etat-panel mt-6 p-6 lg:p-7">
          {/* §17 du mandat : un chiffre important vit directement sur la
              page, pas dans des cartes complètes à fond plein. 4 mesures
              maximum, toutes réellement dérivées (cf. commentaire des
              constantes ci-dessus pour le détail et ce qui a été écarté). */}
          <div className="grid gap-8 border-b border-[var(--etat-line)] pb-6 sm:grid-cols-2 lg:grid-cols-4">
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

          {/* Évolution de la valeur coordonnée (maquette validée,
              arbitrage CEO 2026-08-18 ; seuil du graphe relevé au Lot 2,
              cf. commentaire sur coordinatedValueTrendPath ci-dessus) :
              même méthode que la courbe Pilotage — grain jour, un point
              par date réellement disponible, repli honnête sinon. La
              valeur coordonnée (executedValue/engagedValue) n'a pas
              d'horodatage propre (Opportunity n'en porte aucun) : on la
              fait remonter à un horodatage réel via lot →
              landing.weighedAt/arrivedAt, seule donnée temporelle fiable
              de la chaîne. Vérifié en exécutant createDemoState() avant
              de construire quoi que ce soit : seules 2 dates sur les 5
              désormais disponibles portent une valeur coordonnée (9 des
              24 opportunités sont exécutées/engagées) — comparaison
              directe pour ce cas à 2 points (ci-dessous), jamais une
              courbe forcée pour ressembler à la maquette. */}
          <div className="mt-8 border-b border-[var(--etat-line)] pb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Évolution de la valeur coordonnée</p>
            {coordinatedValueTrendPath ? (
              <div className="mt-4">
                <svg viewBox="0 0 640 180" preserveAspectRatio="none" className="h-36 w-full" role="img" aria-label="Évolution de la valeur coordonnée dans le temps">
                  <path d={coordinatedValueTrendPath.area} fill="var(--etat-terracotta)" fillOpacity="0.08" />
                  <path d={coordinatedValueTrendPath.line} fill="none" stroke="var(--etat-terracotta)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {coordinatedValueTrendPath.coords.map(([x, y], index) => <circle key={coordinatedValueTrendPoints[index].date} cx={x} cy={y} r="4.5" fill="var(--etat-terracotta)" stroke="#fff" strokeWidth="2" />)}
                </svg>
                <div className="mt-2 flex justify-between text-xs">
                  {coordinatedValueTrendPoints.map((point) => (
                    <div key={point.date} className="text-center">
                      <p className="font-bold text-[var(--etat-navy-950)]">{formatFcfa(point.value)}</p>
                      <p className="text-[var(--etat-stone-400)]">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(point.date))}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[11px] text-[var(--etat-stone-400)]">Grain jour, dérivé des pesées réelles reliées à chaque opportunité (weighedAt, ou arrivedAt à défaut) — aucun jour interpolé. {coordinatedValueTrendPoints.length} dates portent une valeur coordonnée pour l’instant.</p>
              </div>
            ) : coordinatedValueTrendPoints.length === 2 ? (
              /* Comparaison directe entre les 2 seules dates disponibles —
                 pas de tracé reliant les points, pour ne pas suggérer une
                 tendance continue à partir de 2 instants (mandat §5, Lot 0). */
              (() => {
                const [first, second] = coordinatedValueTrendPoints;
                const delta = second.value - first.value;
                const deltaPct = first.value > 0 ? Math.round((delta / first.value) * 100) : null;
                return (
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div>
                      <p className="font-bold text-[var(--etat-navy-950)]">{formatFcfa(first.value)}</p>
                      <p className="text-xs text-[var(--etat-stone-400)]">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(first.date))}</p>
                    </div>
                    {/* Vert réservé au "résultat confirmé" (mandat §2) : la
                        hausse entre les 2 seules dates documentées est un
                        résultat positif explicite, pas une tendance
                        supposée — même vert que etat-tag--reel (#1e6b3d),
                        pas un nouveau token créé pour l'occasion. */}
                    <div className="flex flex-col items-center" style={{ color: delta >= 0 ? "#1e6b3d" : "var(--etat-terracotta)" }}>
                      <ArrowRight size={16} />
                      {deltaPct !== null && <span className="text-xs font-bold">{delta >= 0 ? "+" : ""}{deltaPct}%</span>}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--etat-navy-950)]">{formatFcfa(second.value)}</p>
                      <p className="text-xs text-[var(--etat-stone-400)]">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(second.date))}</p>
                    </div>
                    <p className="ml-auto max-w-[14rem] text-[11px] text-[var(--etat-stone-400)]">Comparaison entre les 2 seules dates documentées — pas assez de points pour une courbe d’évolution.</p>
                  </div>
                );
              })()
            ) : (
              <p className="mt-3 text-sm text-[var(--etat-stone-600)]">Historique insuffisant pour tracer une évolution : moins de deux jours documentés portent une valeur coordonnée pour le moment.</p>
            )}
          </div>

        </div>
      </section>

      {/* Chapitre 4 — Programmes en cours (mandat §3.8, Lot État-E ;
          repositionné au Lot 2 de la Refonte Premium XXL, cf. commentaire
          de réordonnancement en tête du composant). Remplace le sous-bloc
          "Évolution des programmes en cours" (2 initiatives, 1 indicateur
          chacune) par un vrai portefeuille filtrable : les 9 initiatives,
          filtre territoire (Périmètre partagé, cf. Lot État-B) + statut/
          phase, et pour chacune : territoires, responsable, budget/
          financement (mêmes libellés prudents que /app/etat/rapport,
          jamais "financement sécurisé"), progression baseline→actuel→
          cible, prochaine échéance dérivée honnêtement des situations
          liées (Initiative.situationIds) — aucun champ d'échéance propre
          au programme n'existe dans le modèle, donc pas de date fabriquée
          si aucune situation liée n'a de dueAt. */}
      <section id="programmes" className="scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="etat-eyebrow">4 · Programmes en cours</p>
            <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Portefeuille de programmes.</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--etat-stone-600)]">{filteredProgrammes.length} programme(s){selectedTerritoryId ? ` · ${focusTerritory?.name ?? selectedTerritoryId}` : ""}{programmeStatusFilter !== "all" ? ` · ${initiativeStatusLabel[programmeStatusFilter]}` : ""} sur {state.initiatives.length} au total.</p>
          </div>
          <label className="block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Statut</p>
            <select
              value={programmeStatusFilter}
              onChange={(event) => setProgrammeStatusFilter(event.target.value as Initiative["status"] | "all")}
              className="mt-1 rounded-md border border-[var(--etat-line)] bg-white py-1 pl-0 pr-6 text-sm font-semibold text-[var(--etat-navy-950)] outline-none focus:border-[var(--etat-navy-600)]"
            >
              <option value="all">Tous les statuts</option>
              {(["cadrage", "financee", "execution", "terminee"] as const).map((status) => (
                <option key={status} value={status}>{initiativeStatusLabel[status]}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="etat-panel mt-5 p-6 lg:p-7">
          {filteredProgrammes.length === 0 ? (
            <p className="text-sm text-[var(--etat-stone-600)]">Aucun programme ne correspond à ce filtre pour le moment.</p>
          ) : (
            <div className="space-y-5">
              {filteredProgrammes.map((programme) => {
                const owner = state.actors.find((item) => item.id === programme.ownerId);
                const territoryNames = programme.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
                const confirmed = programme.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
                const totalFunding = programme.funding.reduce((sum, item) => sum + item.amountFcfa, 0);
                const linkedDueDates = programme.situationIds
                  .map((id) => state.situations.find((item) => item.id === id)?.dueAt)
                  .filter((value): value is string => Boolean(value))
                  .sort();
                const nextDeadline = linkedDueDates[0];
                // Progression globale (Lot 2, arbitrage CEO Lot 0) : moyenne
                // des indicateurs disponibles — la seule règle honnête pour
                // résumer en un chiffre un programme à 1, 2 ou 3 indicateurs
                // de nature différente (aucune pondération n'est documentée
                // dans le modèle). Repli explicite "Aucun indicateur suivi"
                // pour les programmes sans indicateur (cadrage), jamais 0%
                // ni un chiffre inventé qui laisserait croire à une mesure.
                const indicatorsAvgProgress = programme.indicators.length > 0
                  ? Math.round(programme.indicators.reduce((sum, indicator) => sum + indicatorProgress(indicator), 0) / programme.indicators.length)
                  : null;
                return (
                  <div key={programme.id} className="etat-panel--warm p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[var(--etat-navy-950)]">{programme.title}</p>
                        <p className="mt-1 text-xs text-[var(--etat-stone-600)]">{programme.objective}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">{territoryNames.map((name) => <span key={name} className="etat-tag etat-tag--stable">{name}</span>)}</div>
                      </div>
                      <span className="etat-tag etat-tag--stable shrink-0">{initiativeStatusLabel[programme.status]}</span>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-[var(--etat-line)] pt-4 sm:grid-cols-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Responsable</p>
                        <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{owner?.name ?? "Non désigné"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Budget / financement</p>
                        <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{programme.budgetFcfa !== undefined ? formatFcfa(programme.budgetFcfa) : "Budget à estimer"}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--etat-stone-600)]">{formatFcfa(confirmed)} confirmés{totalFunding > 0 ? ` sur ${formatFcfa(totalFunding)} identifiés` : ""}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Prochaine échéance</p>
                        <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{nextDeadline ? new Date(nextDeadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Aucune échéance documentée"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Progression</p>
                        <p className="mt-1 text-xs font-semibold text-[var(--etat-navy-950)]">{indicatorsAvgProgress !== null ? `${indicatorsAvgProgress}% en moyenne` : "Aucun indicateur suivi"}</p>
                        {indicatorsAvgProgress !== null && <p className="mt-0.5 text-[11px] text-[var(--etat-stone-600)]">{programme.indicators.length} indicateur{programme.indicators.length > 1 ? "s" : ""}</p>}
                      </div>
                    </div>

                    {programme.indicators.length > 0 && (
                      <div className="mt-4 space-y-3 border-t border-[var(--etat-line)] pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--etat-stone-400)]">Progression baseline → actuel → cible</p>
                        {programme.indicators.map((indicator) => (
                          <div key={indicator.label}>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
                              <span className="font-semibold text-[var(--etat-navy-800)]">{indicator.label}</span>
                              <span className="text-[var(--etat-stone-600)]">{indicator.baseline}{indicator.unit} → {indicator.current}{indicator.unit} → {indicator.target}{indicator.unit}</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--etat-line)]"><div className="h-full rounded-full bg-[var(--etat-terracotta)]" style={{ width: `${indicatorProgress(indicator)}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {programme.funding.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--etat-line)] pt-4">
                        {programme.funding.map((fund) => {
                          const partner = state.actors.find((item) => item.id === fund.partnerId);
                          return <span key={fund.id} className={`etat-tag ${fundingTagClass[fund.status]}`}>{partner?.name ?? fund.partnerId} · {fundingStatusLabel[fund.status]}</span>;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Chapitre 5 — Où concentrer l'attention ? (mandat §5, Lot C).
          Remplace l'ancienne liste plate "Explorer tous les territoires" —
          browse des territoires stables toujours possible via la carte du
          Chapitre 1 (tous les 18 y sont cliquables), donc rien n'est perdu
          en retirant cette liste ici. */}
      {prioritized.length > 0 && (
        <section id="territoires" className="scroll-mt-6">
          <p className="etat-eyebrow">5 · Où concentrer l’attention ?</p>
          <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">{prioritized.length} territoire(s) prioritaire(s) sur {territoiresActifs} suivis par le réseau.</h2>

          {/* Carrousel homogène (mandat §3.6) : toutes les priorités
              partagent la même grammaire de card (mini-carte incluse),
              plus de duo "3 cards riches + liste appauvrie". Navigation
              fléchée + pagination discrète (points), scroll-snap pour
              un défilement propre au doigt sur mobile. */}
          <div className="relative mt-6">
            <div
              ref={prioritiesTrackRef}
              onScroll={(event) => {
                const el = event.currentTarget;
                const maxScroll = el.scrollWidth - el.clientWidth;
                const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
                setPrioritiesIndex(Math.round(ratio * (prioritized.length - 1)));
              }}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {prioritized.map((entry, index) => (
                <article key={entry.territory.id} className="etat-panel flex w-[270px] shrink-0 snap-start flex-col p-5" style={{ borderTopWidth: 3, borderTopColor: glyphBorderColor[entry.territory.activity] }}>
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
                  <div className="mt-4 flex flex-col gap-2">
                    <button onClick={() => setTerritoryDrawer(entry.territory)} className="etat-btn etat-btn-outline justify-center">Voir le détail <ArrowRight size={15} /></button>
                    {entry.prioritySituation && <button onClick={() => setSituationDrawer(entry.prioritySituation!)} className="etat-btn etat-btn-primary justify-center">Voir la situation <ArrowRight size={15} /></button>}
                  </div>
                </article>
              ))}
            </div>

            {prioritized.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex gap-1.5" aria-hidden="true">
                  {prioritized.map((entry, index) => (
                    <span key={entry.territory.id} className="h-1.5 w-1.5 rounded-full transition" style={{ backgroundColor: index === prioritiesIndex ? "var(--etat-terracotta)" : "var(--etat-line)" }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button aria-label="Priorités précédentes" onClick={() => prioritiesTrackRef.current?.scrollBy({ left: -prioritiesTrackRef.current.clientWidth * 0.9, behavior: "smooth" })} className="etat-btn etat-btn-outline" style={{ minHeight: 36, padding: "6px 10px" }}><ArrowLeft size={15} /></button>
                  <button aria-label="Priorités suivantes" onClick={() => prioritiesTrackRef.current?.scrollBy({ left: prioritiesTrackRef.current.clientWidth * 0.9, behavior: "smooth" })} className="etat-btn etat-btn-outline" style={{ minHeight: 36, padding: "6px 10px" }}><ArrowRight size={15} /></button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lot État-G (mandat §3.9, livrable 6 de la gap analysis) :
          maintenu comme registre de redevabilité distinct — 13 des 17
          décisions (76%) ont déjà un engagement terminé avec résultat
          documenté, une vraie substance, pas un doublon vide avec
          Situations à arbitrer. Renommé pour le dire explicitement ;
          statut dérivé affiché sur chaque ligne (jamais masqué quand il
          n'y a pas encore de résultat — honnêteté du 24% restant). */}
      <section id="redevabilite" className="scroll-mt-6">
        <p className="etat-eyebrow">6 · Décisions exécutées &amp; résultats observés</p>
        <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Décisions exécutées &amp; résultats observés.</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--etat-stone-600)]">{state.decisions.length} décision(s) enregistrée(s) au total — ce que la coordination a décidé, et ce que cela a produit. Chaque arbitrage institutionnel reste tracé et consultable.</p>
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{decisionTypeLabels[decision.type]}{situation ? ` · ${territory?.name ?? situation.territoryId}` : ""}</p>
                        <span className={`etat-tag ${completedCommitments.length > 0 ? "etat-tag--reel" : "etat-tag--stable"}`}>{completedCommitments.length > 0 ? "Résultat documenté" : "En cours"}</span>
                      </div>
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
          <p className="etat-eyebrow etat-eyebrow--on-dark">7 · Programmes &amp; rapport</p>
          <h2 className="etat-display mt-2 text-2xl not-italic">Un rapport d’impact prêt à partager.</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--etat-offwhite)]/65">Structuré par territoire, exportable, pensé pour vos propres échanges avec les bailleurs et programmes.</p>
        </div>
        <Link href="/app/etat/rapport" className="etat-btn etat-btn-primary relative z-10"><FileDown size={15} /> Ouvrir le rapport bailleurs</Link>
      </section>
      </div>

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
// Lot État-C — mêmes libellés que /app/app/(coordination)/initiatives/page.tsx
// (page interne, non modifiée) pour ne pas introduire un 2e vocabulaire
// de statut de programme.
const initiativeStatusLabel: Record<Initiative["status"], string> = { cadrage: "Cadrage", financee: "Financée", execution: "Exécution", terminee: "Terminée" };
const commitmentStatusLabel: Record<"a_faire" | "en_cours" | "bloquee" | "terminee", string> = { a_faire: "À faire", en_cours: "En cours", bloquee: "Bloqué", terminee: "Terminé" };

function TerritoryDetail({ territory, cases, onOpenSituation }: { territory: Territory; cases: VigilanceCase[]; onOpenSituation: (situation: Situation) => void }) {
  const { state } = useProduct();
  if (!state) return null;
  const sites = state.sites.filter((item) => item.territoryId === territory.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const acteurs = state.actors.filter((item) => item.territoryIds.includes(territory.id));
  const acteursParRole = acteurs.reduce<Record<string, number>>((acc, item) => { acc[item.role] = (acc[item.role] ?? 0) + 1; return acc; }, {});
  const prioritySituation = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee").sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority])[0];
  // Lot État-C (mandat §3.4) : deux ajouts additifs, données déjà
  // présentes dans le modèle mais jusqu'ici non lues par cette fiche —
  // débarquements/flux documentés (via les sites du territoire) et
  // programmes actifs (Initiative.territoryIds).
  const siteIds = new Set(sites.map((item) => item.id));
  const landings = state.landings.filter((item) => siteIds.has(item.siteId));
  const programmes = state.initiatives.filter((item) => item.territoryIds.includes(territory.id));

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
      {/* Lot État-C : débarquements/flux documentés + programmes actifs —
          données déjà présentes dans le modèle (landings via les sites
          du territoire, Initiative.territoryIds), non lues jusqu'ici par
          cette fiche. Ajout additif, aucune régression sur le reste. */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Débarquements documentés · {landings.length}</p>
        {landings.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucun débarquement documenté pour le moment.</p> : <p className="mt-1.5 text-xs text-[var(--etat-stone-600)]">{landings.filter((item) => item.status === "lots_crees").length} déjà valorisé(s) en lot(s), sur {landings.length} au total.</p>}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Programmes actifs · {programmes.length}</p>
        {programmes.length === 0 ? <p className="mt-1.5 text-xs text-[var(--etat-stone-400)]">Aucun programme actif sur ce territoire pour le moment.</p> : <div className="mt-1.5 space-y-1.5">{programmes.map((programme) => <div key={programme.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--etat-line)] bg-white px-3 py-2"><span className="text-xs font-medium text-[var(--etat-navy-950)]">{programme.title}</span><span className="etat-tag etat-tag--stable shrink-0">{initiativeStatusLabel[programme.status]}</span></div>)}</div>}
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
  // Lot État-C (mandat §3.4, "quelles capacités ou coordinations sont
  // déjà engagées") : situation.coordinationId existe déjà dans le
  // modèle et n'était affiché nulle part sur cette fiche.
  const coordination = situation.coordinationId ? state.coordinationSpaces.find((item) => item.id === situation.coordinationId) : undefined;

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
      {coordination && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--etat-stone-600)]">Coordination et engagements déjà en cours</p>
          <div className="mt-2 rounded-lg border border-[var(--etat-line)] bg-white p-3">
            <p className="text-sm font-semibold text-[var(--etat-navy-950)]">{coordination.title}</p>
            {coordination.commitments.length === 0 ? (
              <p className="mt-1 text-xs text-[var(--etat-stone-400)]">Aucun engagement enregistré pour le moment.</p>
            ) : (
              <div className="mt-2 space-y-1.5 border-t border-[var(--etat-line)] pt-2">
                {coordination.commitments.map((commitment) => {
                  const actor = state.actors.find((item) => item.id === commitment.actorId);
                  return <p key={commitment.id} className="text-xs leading-4 text-[var(--etat-stone-600)]"><span className="font-semibold text-[var(--etat-navy-950)]">{actor?.name ?? commitment.actorId}</span> — {commitment.label} <span className="text-[var(--etat-stone-400)]">({commitmentStatusLabel[commitment.status]})</span></p>;
                })}
              </div>
            )}
          </div>
        </div>
      )}
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
