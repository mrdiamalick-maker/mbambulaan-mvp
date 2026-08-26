"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Clock, Compass, Factory, FileDown, Flag, ListChecks, Minus, Plus, Radio, Sailboat, Search, Send } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Drawer } from "@/components/etat/Drawer";
import { DecisionIcon, SituationIcon } from "@/components/etat/MotifIcons";
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
// utilisé sur cette page (remplacé) ; InstitutionIllustration avait
// migré du Hero (retiré) vers le bandeau rapport bailleurs (§18 du
// mandat) — retirée à son tour de ce bandeau (mandat "2 assets
// d'illustration réelle", 2026-08-23) au profit du fond photo réel,
// cf. commentaire sur place. Toujours utilisée telle quelle sur
// Login/Institution (CoordinationIllustration.tsx), non modifiée.
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

// viewBoxMinX/Y ne servaient qu'à territoryZoomStyle (mini-cartes du
// Chapitre 5 "Où concentrer l'attention", retiré du premier écran —
// mandat "Brief national", 2026-08-23) : la fonction elle-même est
// supprimée avec son seul appelant. viewBoxWidth/viewBoxHeight restent
// nécessaires ci-dessous (NATIONAL_ASPECT, caméra Atlas).
const [, , viewBoxWidth, viewBoxHeight] = coastlineViewBox.split(" ").map(Number);

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

// Zoom +/- (mandat "nouvelle DA Vue d'ensemble", faisabilité confirmée au
// Lot 0) : redimensionne une fenêtre viewBox autour de son propre centre
// — jamais autour d'une position territoriale recalculée séparément, pour
// rester exactement dans le même espace de coordonnées que
// cameraWindowFor. factor < 1 resserre (zoom avant), > 1 élargit (zoom
// arrière). Composé APRÈS cameraWindowFor, AVANT useAnimatedViewBox : le
// zoom s'anime par la même interpolation rAF, pas un second mécanisme.
function scaleViewBox(viewBox: string, factor: number): string {
  if (factor === 1) return viewBox;
  const [x, y, width, height] = viewBox.split(" ").map(Number);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const newWidth = width * factor;
  const newHeight = height * factor;
  return `${(cx - newWidth / 2).toFixed(1)} ${(cy - newHeight / 2).toFixed(1)} ${newWidth.toFixed(1)} ${newHeight.toFixed(1)}`;
}

// Interpolation JS (requestAnimationFrame), tranchée par le CEO le
// 2026-08-20 plutôt qu'un transform CSS (l'approche qu'utilisait alors
// territoryZoomStyle, depuis supprimé) : l'attribut SVG viewBox n'est pas fiablement
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
  // Zoom +/- (mandat "nouvelle DA Vue d'ensemble", faisabilité confirmée
  // au Lot 0) : facteur multiplicatif appliqué à la fenêtre de la caméra
  // (cameraWindowFor), pas un second système de cadrage — le zoom vient
  // resserrer/élargir autour du MÊME centre, dans le MÊME espace de
  // coordonnées, avant interpolation par useAnimatedViewBox (aucune
  // nouvelle géométrie, aucun nouveau moteur). 1 = fenêtre non modifiée.
  // Bornes : 0.4 (le plus resserré, évite un cadrage plus étroit que les
  // marqueurs eux-mêmes) à 2.2 (le plus large, dépasse légèrement la
  // fenêtre régionale par défaut sans jamais atteindre la vue nationale
  // complète — "Vue nationale" reste le seul moyen d'y revenir
  // explicitement, cohérent avec son propre bouton). Réinitialisé à 1 sur
  // tout changement de cible caméra (nouveau territoire ou national) :
  // le zoom est un réglage ponctuel de LA lecture en cours, pas un état
  // qui doit "suivre" d'un territoire à l'autre.
  const [zoomFactor, setZoomFactor] = useState(1);
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2.2;
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
  // prioritiesTrackRef/prioritiesIndex/prioriteTab (carrousel "Où
  // concentrer l'attention") supprimés avec le Chapitre 5, retiré du
  // premier écran — cf. commentaire de retrait explicite sur place.

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
  const cameraViewBox = useAnimatedViewBox(scaleViewBox(cameraWindowFor(cameraTargetId), zoomFactor));
  // Reset du zoom sur changement de cible caméra (hook, doit s'exécuter
  // inconditionnellement — placé ici, avant le garde-fou, pour la même
  // raison que useAnimatedViewBox juste au-dessus).
  useEffect(() => {
    setZoomFactor(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraTargetId]);

  if (!state) return null;

  const territoiresActifs = state.territories.length;

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
  const focusTripsEnMer = state.trips.filter((item) => focusVesselIds.has(item.vesselId) && item.status === "en_mer" && (periodFilter === "all" || item.departureAt.slice(0, 10) === periodFilter)).length;
  const focusInfrastructures = dominantTerritoryId ? state.infrastructures.filter((item) => item.territoryId === dominantTerritoryId) : [];
  const focusAvailableCapacity = focusInfrastructures.filter((item) => item.status === "operationnelle").length;
  // 3 indicateurs max (mandat "nouvelle DA Vue d'ensemble", conforme à la
  // maquette : Situations ouvertes / Capacités fragiles / 3e tuile) —
  // réduit du jeu de 5 tuiles du Lot 1. Programmes concernés (valeur
  // décisionnelle la plus faible des 5 : un simple comptage de contexte,
  // pas un signal d'action) cède sa place. Entre Débarquements documentés
  // et Sorties en mer en cours, Sorties en mer est retenue (arbitrage CEO
  // 2026-08-23 : "garde celle qui a le plus de valeur décisionnelle
  // immédiate") — un état opérationnel en cours parle plus directement à
  // "à décider aujourd'hui" qu'un comptage documentaire historique.
  // Conserve un vrai effet visible au filtre Période (seul autre
  // consommateur retiré, aucun autre élément de la page n'y réagit).
  const territoryKpis = dominantTerritoryId ? [
    { icon: SituationIcon, value: dominantOpenSituations.length, label: "Situations ouvertes" },
    { icon: Factory, value: dominantFragileInfra, label: "Capacités fragiles/indisponibles", caption: `${focusAvailableCapacity} disponible(s) sur ${focusInfrastructures.length}` },
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

  // Teasers "À arbitrer"/"Programmes à suivre" (mandat "Brief national",
  // §6 — mapping tranché par le CEO : "teaser de 3 + 'Voir tout'").
  // Situations : mêmes 3 premières que situationsAArbitrer, déjà triées
  // par urgence décroissante (situationPriorityRank) — pas un second tri
  // inventé pour ce teaser. Programmes : filteredProgrammes n'a pas
  // d'ordre de priorité propre (ordre d'insertion du jeu de données) —
  // dérive la même "prochaine échéance" que la carte complète plus bas
  // (situations liées les plus proches, cf. Chapitre 4) et trie dessus,
  // échéance la plus proche d'abord, programmes sans échéance documentée
  // repoussés en fin plutôt que triés arbitrairement en tête.
  const situationsTeaser = situationsAArbitrer.slice(0, 3);
  const programmesTeaser = [...filteredProgrammes]
    .map((programme) => {
      const nextDeadline = programme.situationIds
        .map((id) => state.situations.find((item) => item.id === id)?.dueAt)
        .filter((value): value is string => Boolean(value))
        .sort()[0];
      return { programme, nextDeadline };
    })
    .sort((a, b) => {
      if (!a.nextDeadline && !b.nextDeadline) return 0;
      if (!a.nextDeadline) return 1;
      if (!b.nextDeadline) return -1;
      return a.nextDeadline.localeCompare(b.nextDeadline);
    })
    .slice(0, 3);

  return (
    <div className="etat-scope bg-[var(--etat-offwhite)] p-5 pb-16 lg:p-8">
      {/* Correctif CEO (retour "la page ne ressemble toujours pas au
          concept") : bandeau doctrine ET nav d'ancrage retirés ensemble
          de ce premier écran — les deux constats du CEO tenaient à la
          même cause (contenu ajouté avant le titre, absent de la
          référence). Bandeau doctrine : son contenu reste disponible
          ailleurs sur le produit (bandeau d'accueil Public, mentions
          légales), rien n'est perdu en le retirant d'ici. Nav d'ancrage :
          le CEO est explicite sur l'ERREUR précise du lot précédent —
          "remplacer une sidebar verticale par une nav horizontale qui
          montre toujours les 6 mêmes destinations ne respecte que la
          lettre de la décision, pas son esprit". Retirée plutôt que
          réduite : n'importe quelle rangée de liens en avant-plan
          juste sous le header aurait reproduit le même problème visuel.
          Les sections restent atteignables par défilement et par "Voir
          tout" (teasers plus bas) ; /app/etat/rapport garde sa sidebar
          complète, seule surface où une navigation permanente a été
          explicitement validée. */}

      {/* Titre + filtres (mandat "Brief national", §2 : "~104px de haut",
          mesure directe du CEO sur la maquette, pas une estimation
          visuelle). Remplace la toolbar filtres seule : "Brief national"
          redevient le vrai H1 sémantique de la page — l'eyebrow "Atlas de
          supervision" dans la carte (ci-dessous) redescend en simple
          libellé (p), un seul H1 par page. Sous-titre : texte éditorial
          nouveau (mandat, pas une donnée) — aucune correspondance
          existante trouvée ailleurs dans le produit, écrit pour ce lot.
          Filtres Périmètre/Période inchangés (même mécanisme, même
          libellés) — repositionnés à droite de cette même bande plutôt
          que dans leur propre toolbar séparée, comme demandé. */}
      <div className="etat-panel mt-3 flex flex-wrap items-center justify-between gap-6 px-5 py-4">
        <div>
          <h1 className="etat-display text-3xl not-italic text-[var(--etat-navy-950)]">Brief national</h1>
          <p className="mt-1 text-sm text-[var(--etat-stone-600)]">Filière pêche artisanale — supervision au service de la décision.</p>
        </div>
        <div className="flex flex-wrap items-end gap-6">
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
      {/* Chapitre 1 — Atlas + brief territorial (mandat §5, Lot B ;
          recomposé Lot 1 correctif CEO 2026-08-22 ; recomposé une 2e fois
          "Brief national" 2026-08-23). Historique : le H1 pleine largeur
          d'origine avait été aplati en simple eyebrow dans la carte (Lot 1,
          la référence de l'époque ne montrait pas de gros titre) — la
          nouvelle référence en redemande un explicitement, "Brief national"
          plus haut (bande titre+filtres) en est désormais le vrai H1
          sémantique ; l'eyebrow "Atlas de supervision" dans la carte
          redescend en simple <p>, un seul H1 par page. */}
      <section id="terrain" className="scroll-mt-6">
        {/* grid-cols-1 explicite (Lot 1, correctif débordement mobile) :
            sans lui, la piste implicite d'une grille display:grid en
            dessous de lg n'a pas de minmax(0, 1fr) — le texte tronqué
            "Prochaine étape" (nouveau dans ce lot) laissait fuir sa
            largeur min-content non contrainte, poussant toute la piste
            (donc la carte ET le panneau) à ~393px sur un viewport à
            390px. Confirmé par script (git stash sur ce lot : aucun
            débordement avant, +23px après) avant d'écrire ce correctif. */}
        {/* lg:h-[390px] (mandat "Brief national", §3 : "~390px de haut",
            mesure directe du CEO — remplace le 520px du lot précédent,
            compression significative assumée). Le mécanisme qui exige
            cette hauteur PROPRE sur la ligne de grille (pas seulement
            lg:items-stretch) reste celui identifié le 2026-08-22 : un
            enfant lg:h-full imbriqué dans un item de grille sans hauteur
            à soi ne se résout pas de façon fiable, cf. historique gardé
            plus haut. overflow-y-auto sur l'aside (plus bas) reste le
            filet de sécurité si le nouveau contenu éditorial dépasse
            malgré tout cette hauteur plus contrainte qu'avant.
            Ratio 66/34 (mesure directe du CEO, remplace 62/38) : même
            mécanique de grille, proportion réajustée à la nouvelle
            mesure. */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:h-[390px] lg:grid-cols-[66fr_34fr]">
          {/* Fond Atlas — asset d'illustration réel (mandat "intégrer
              l'asset d'illustration réelle", 2026-08-23), remplace
              l'habillage CSS/SVG précédent (dégradés "eau" + motif de
              vagues en <pattern> + Compass/Sailboat/Fish décoratifs,
              ajoutés au Lot 1 faute d'illustration réelle disponible à
              l'époque). Le mandat est explicite : "sans le recréer en
              CSS/SVG et sans l'interpréter" — le fichier fourni intègre
              déjà sa propre boussole, ses barques et ses poissons
              aquarellés, reproduire ces mêmes motifs en Lucide par-dessus
              aurait doublé le geste et non plus servi de "richesse
              visuelle" (le rôle exact que ces icônes tenaient avant).
              CoastlineTerritoryMap.tsx n'est pas touché : le fond n'est
              qu'un habillage sous le SVG, jamais une couche géographique
              — path/territoryMapPositions restent la seule référence de
              positionnement (voir plus bas, viewBox inchangé).

              object-cover plein cadre, pas de recadrage manuel : le
              panneau garde son propre aspect-ratio (aspect-[4/5] →
              lg:h-full), l'image se contente de le remplir. next/image
              (fill) suit le patron déjà en place ailleurs sur le produit
              (HeroBackgroundImage.tsx) — optimisation automatique de
              Next.js en plus de la compression manuelle en amont
              (2,6 Mo PNG fourni → 114 Ko WebP, qualité 78, aucune perte
              visible constatée à la capture). alt="" : purement
              atmosphérique, aucune information non redondante avec le
              contenu (la carte elle-même porte déjà son propre
              role="img"/aria-label). */}
          <div className="etat-panel relative overflow-hidden">
            <Image
              src="/images/etat-atlas-ocean-background.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 62vw, 100vw"
              priority={false}
              className="pointer-events-none absolute inset-0 object-cover"
            />
            {/* Lisibilité (mandat point 6 : "priorité fonctionnelle,
                l'esthétique ne doit jamais nuire") : voile clair
                translucide entre la photo et le tracé/les libellés — le
                fond réel a des zones sombres (bas-gauche) et un ciel
                très clair (haut-droite) qui, seules, faisaient perdre du
                contraste aux libellés "vigilance" (ocre) une fois posés
                dessus (vérifié par capture avant/après ce voile). Blanc
                à faible opacité, pas une nouvelle teinte D9 — n'altère
                pas la lecture des couleurs du tracé/marqueurs, seulement
                leur contraste sur le fond. */}
            <div className="pointer-events-none absolute inset-0 bg-white/30" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3 px-4 pt-4">
              {/* Contraste (correctif CEO 2026-08-22) : etat-eyebrow--on-dark
                  seul (ocre sur fond eau clair par endroits) restait
                  quasi illisible à la capture — petite plaque bg-white/90
                  identique au traitement déjà utilisé pour le bouton
                  "Vue nationale" juste à côté, pas une nouvelle couleur.
                  Libellé "Atlas de supervision" (mandat "nouvelle DA Vue
                  d'ensemble") : reprend le titre de la maquette, remplace
                  "Lecture territoriale" — même élément, même rôle
                  sémantique (H1 de ce chapitre), texte aligné sur la
                  nouvelle référence. */}
              <p className="etat-eyebrow rounded-full bg-white/90 px-3 py-1.5">Atlas de supervision</p>
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

            {/* Légende "Niveau d'attention" (mandat "nouvelle DA Vue
                d'ensemble", Décision 2 : 3 catégories réelles, pas les 5
                de la maquette). Territory.activity n'a que "stable" |
                "vigilance" | "critique" (confirmé domain/types.ts) —
                "Élevé", "Normal" et "Non évalué" de la maquette n'ont
                aucune valeur correspondante dans le modèle et ne sont pas
                reproduits. Mêmes couleurs que glyphBorderColor/
                statusTagLabel, déjà utilisées ailleurs sur cette page
                (marqueurs de carte, carrousel) — pas une nouvelle
                palette pour cette légende.
                hidden lg:block (trouvé en vérifiant le rendu mobile réel,
                pas supposé sain par défaut) : sur le viewport compact
                (carte réduite à aspect-[4/5]), cette légende chevauchait
                géométriquement le marqueur "Rufisque-Bargny" et le
                rendait réellement inaccessible au clic (confirmé par
                locator.click() en échec, pas seulement visuellement) —
                pas un simple souci esthétique. Masquée sous lg, même
                discipline que la sidebar (EtatSidebar) qui suit le même
                point de rupture pour la même raison : un raffinement de
                supervision desktop, pas une régression fonctionnelle
                acceptée sur mobile où l'espace de la carte est déjà
                contraint. */}
            <div className="etat-panel absolute left-4 top-16 z-10 hidden bg-white/95 p-3 text-xs shadow-sm lg:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Niveau d’attention</p>
              <div className="mt-2 space-y-1.5">
                {(["critique", "vigilance", "stable"] as const).map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: glyphBorderColor[status] }} />
                    <span className="text-[var(--etat-navy-800)]">{statusTagLabel[status]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zoom +/- (mandat "nouvelle DA Vue d'ensemble", faisabilité
                confirmée au Lot 0) : agit sur zoomFactor, composé avec la
                fenêtre caméra existante via scaleViewBox() — même
                interpolation rAF que le reste de la caméra, aucun nouveau
                mécanisme d'animation. Bornes désactivent visuellement le
                bouton correspondant plutôt que de le laisser sans effet
                silencieux. */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
              <button
                aria-label="Zoom avant"
                disabled={zoomFactor <= ZOOM_MIN}
                onClick={() => setZoomFactor((value) => Math.max(ZOOM_MIN, +(value - 0.3).toFixed(2)))}
                className="etat-btn etat-btn-outline bg-white/95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ minHeight: 32, minWidth: 32, padding: 0 }}
              >
                <Plus size={15} />
              </button>
              <button
                aria-label="Zoom arrière"
                disabled={zoomFactor >= ZOOM_MAX}
                onClick={() => setZoomFactor((value) => Math.min(ZOOM_MAX, +(value + 0.3).toFixed(2)))}
                className="etat-btn etat-btn-outline bg-white/95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ minHeight: 32, minWidth: 32, padding: 0 }}
              >
                <Minus size={15} />
              </button>
            </div>

            {/* lg:min-h-[520px] retiré (correctif CEO, compression du lot
                précédent) : reliquat du gabarit 520px d'avant ce lot,
                incohérent avec la ligne de grille désormais fixée à
                lg:h-[390px] plus haut — sans effet visuel observé
                (overflow-hidden du conteneur .etat-panel absorbait déjà
                l'écart) mais trompeur à la lecture, nettoyé. */}
            <div className="relative aspect-[4/5] p-4 sm:aspect-[3/4] lg:aspect-auto lg:h-full">
              <CoastlineTerritoryMap
                territories={state.territories}
                selectedId={selectedTerritoryId ?? undefined}
                onSelect={(id) => { setSelectedTerritoryId(id); setCameraForcedNational(false); }}
                viewBox={cameraViewBox}
                landFillOpacity={0.18}
              />
            </div>
          </div>

          {/* overflow-y-auto (correctif CEO 2026-08-22, conservé) : filet de
              sécurité maintenant que la ligne a une hauteur fixe
              (lg:h-[390px], resserrée par ce lot) — si le contenu du
              panneau dépasse malgré tout cette hauteur plus contrainte
              qu'avant, il défile en interne au lieu de repousser la carte.

              Format éditorial (mandat "Brief national", §3, côté brief
              34%) : "nature de la situation, pourquoi elle mérite
              l'attention, points à considérer (2-3 max, réels), prochaine
              étape, deux CTA". Reformulation du contenu déjà réel de ce
              panneau (Lot 1/nouvelle DA), pas une nouvelle source de
              données — aucun champ Situation/CoordinationSpace inventé :
              - Nature : dominantPrioritySituation.title (déjà utilisé
                ailleurs, ex. le tiroir Situation) — rangée omise plutôt que
                remplie d'un texte fabriqué quand aucune situation
                prioritaire n'existe (territoire calme).
              - Pourquoi : panelDescription, réutilisé tel quel (déjà une
                phrase de justification dans les 4 branches dominant.kind,
                pas une reformulation).
              - À considérer : territoryKpis, MÊME tableau que le Lot
                précédent (3 entrées réelles : situations ouvertes /
                capacités fragiles/indisponibles / sorties en mer en
                cours), seulement rendu en lignes plutôt qu'en grille de
                tuiles — aucun 4e point ajouté pour coller au "2-3" de la
                maquette, le tableau réel en compte 3.
              - Prochaine étape : dominantPrioritySituation.nextStep,
                inchangé. */}
          <aside className="etat-panel flex flex-col overflow-y-auto p-6" style={{ borderLeftWidth: 4, borderLeftColor: panelBorderColor }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5" style={{ color: panelBorderColor }}>
                <TensionGlyph status={panelGlyphStatus} size={26} pulse={panelGlyphStatus !== "stable"} />
                <p className="text-[11px] font-bold uppercase tracking-widest">{panelEyebrow}</p>
              </div>
              {/* StatusBadge (mandat "nouvelle DA Vue d'ensemble") : réutilise
                  le composant déjà utilisé dans le carrousel "Où concentrer
                  l'attention" (arbitrage Lot 0 : pas un nouveau composant) —
                  qualification réelle à côté de l'eyebrow, comme la maquette. */}
              <StatusBadge status={panelGlyphStatus} />
            </div>
            <h2 className="etat-display mt-3 text-xl not-italic text-[var(--etat-navy-950)]">{panelHeading}</h2>
            {/* Zone (Territory.region, mandat "nouvelle DA Vue d'ensemble") :
                champ réel confirmé au Lot 0, absent jusqu'ici de CE panneau
                (déjà présent dans le tiroir Territoire). Affiché seulement
                pour une sélection explicite — dominant.kind "calme"/"signal"
                n'a pas de territoire unique à qualifier par une zone. */}
            {selectedTerritoryId && focusTerritory && <p className="mt-1 text-xs font-semibold text-[var(--etat-stone-400)]">{focusTerritory.region}</p>}
            {selectedTerritoryId && (
              <button onClick={() => { setSelectedTerritoryId(null); setCameraForcedNational(false); }} className="mt-2 self-start text-[11px] font-semibold text-[var(--etat-stone-400)] underline decoration-dotted underline-offset-2 hover:text-[var(--etat-stone-600)]">Revenir à la lecture par défaut</button>
            )}

            {dominantPrioritySituation && (
              <div className="mt-4 flex items-start gap-2.5 border-t border-[var(--etat-line)] pt-4">
                <Flag size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Nature de la situation</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--etat-navy-950)]">{dominantPrioritySituation.title}</p>
                </div>
              </div>
            )}

            <div className={`flex items-start gap-2.5 ${dominantPrioritySituation ? "mt-3" : "mt-4 border-t border-[var(--etat-line)] pt-4"}`}>
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Pourquoi cela mérite l’attention</p>
                <p className="mt-1 text-sm leading-6 text-[var(--etat-stone-600)]">{panelDescription}</p>
              </div>
            </div>

            {/* "À considérer aujourd'hui" (mandat) : mêmes 3 indicateurs
                réels que le Lot précédent (territoryKpis), en lignes
                plutôt qu'en tuiles — même discipline "2-3 max, réels", pas
                de 4e point ajouté pour remplir. */}
            {territoryKpis.length > 0 && (
              <div className="mt-3 flex items-start gap-2.5">
                <ListChecks size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">À considérer aujourd’hui</p>
                  <ul className="mt-1.5 space-y-1">
                    {territoryKpis.map((kpi) => (
                      <li key={kpi.label} className="flex items-baseline gap-1.5 text-sm text-[var(--etat-navy-950)]">
                        <span className="etat-display shrink-0 text-base not-italic font-semibold"><NumberTicker value={kpi.value} /></span>
                        <span className="min-w-0 break-words text-[var(--etat-stone-600)]">{kpi.label.toLowerCase()}{"caption" in kpi && kpi.caption ? ` · ${kpi.caption}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {dominantPrioritySituation && (
              <div className="mt-3 flex items-start gap-2.5 border-t border-[var(--etat-line)] pt-4">
                <Clock size={15} className="mt-0.5 shrink-0 text-[var(--etat-stone-400)]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--etat-stone-400)]">Prochaine étape</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--etat-navy-950)]">{dominantPrioritySituation.nextStep}</p>
                </div>
              </div>
            )}

            {/* Libellés et ordre du mandat ("nouvelle DA Vue d'ensemble",
                §4, conservé) : "Voir la situation" (outline) puis "Ouvrir
                le territoire" (primaire). #arbitrage-detail (mandat "Brief
                national") : la table complète "Situations à arbitrer" a
                changé d'ancre (destination secondaire, cf. section
                "À arbitrer" plus bas) — même destination finale, ancre
                renommée pour rester cohérente avec le nouveau plan de la
                page. */}
            <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
              {dominantPrioritySituation ? (
                <button onClick={() => setSituationDrawer(dominantPrioritySituation)} className="etat-btn etat-btn-outline justify-center">Voir la situation <ArrowRight size={15} /></button>
              ) : (
                <a href="#arbitrage-detail" className="etat-btn etat-btn-outline justify-center">Voir les situations à arbitrer <ArrowRight size={15} /></a>
              )}
              {focusTerritory && <button className="etat-btn etat-btn-primary justify-center" onClick={() => setTerritoryDrawer(focusTerritory)}>Ouvrir le territoire <ArrowRight size={15} /></button>}
            </div>
          </aside>
        </div>

        {/* Bande resserrée (mandat "Brief national", §4 : "~73-80px de
            haut, nettement plus fine que les ~105px annoncés" — mesure
            directe du CEO, contredit le chiffre de la maquette elle-même).
            py-5→py-3, text-xl→text-lg : mêmes 5 agrégats réels qu'avant
            (aucun retiré, aucun ajouté), juste un gabarit plus compact.
            Lien de fin repointé vers /app/etat/rapport (arbitrage CEO
            "Brief national") : #performance n'existe plus sur cette page
            (Chapitre 3 retiré) — /app/etat/rapport reste "la seule
            destination preuve pleinement construite aujourd'hui", même
            raisonnement que "Résultats et effets" dans "Ce qui est
            documenté" plus bas. */}
        <div className="etat-panel mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 divide-x divide-[var(--etat-line)] p-3">
          <div className="pl-0">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={situationsOuvertesTotal} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Situations ouvertes</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={territoiresActifs} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Territoires couverts</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={capacitesFragilesTotal} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Capacités fragiles</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]">{formatFcfa(financementEngageTotal)}</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Financement engagé</p>
          </div>
          <div className="pl-8">
            <p className="etat-display text-lg not-italic text-[var(--etat-navy-950)]"><NumberTicker value={programmesActifsTotal} /></p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--etat-stone-600)]">Programmes actifs</p>
          </div>
          <Link href="/app/etat/rapport" className="ml-auto flex shrink-0 items-center gap-1.5 pl-8 text-xs font-bold text-[var(--etat-navy-800)] hover:text-[var(--etat-navy-600)]">Voir le détail de la performance <ArrowRight size={13} /></Link>
        </div>
      </section>

      {/* 3 sections sous le fold (mandat "Brief national", §6, mapping
          tranché par le CEO — "À arbitrer"/"Programmes à suivre" en
          teaser de 3 réels + "Voir tout" vers le registre complet
          préservé plus bas ; "Ce qui est documenté" en 3 liens de
          navigation, sans donnée à calculer — la maquette elle-même
          n'affiche qu'un tiret "—" identique sur ses 3 lignes, pas un
          chiffre placeholder à reproduire). Pas de section id dédiée :
          rencontrée au passage en descendant la page, pas une cible de
          nav à part (cf. commentaire de la nav d'ancrage plus haut). */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="etat-panel p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="etat-eyebrow">À arbitrer</p>
            <a href="#arbitrage-detail" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--etat-navy-800)] hover:text-[var(--etat-navy-600)]">Voir tout <ArrowRight size={12} /></a>
          </div>
          <div className="mt-3 space-y-2.5">
            {situationsTeaser.length === 0 ? (
              <p className="text-sm text-[var(--etat-stone-600)]">Aucune situation critique ou de risque élevé en attente d’arbitrage.</p>
            ) : situationsTeaser.map((situation) => {
              const territory = state.territories.find((item) => item.id === situation.territoryId);
              const tag = priorityToTag[situation.priority];
              return (
                <div key={situation.id} className="flex items-start justify-between gap-2 border-t border-[var(--etat-line)] pt-2.5 first:border-t-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--etat-navy-950)]">{situation.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{territory?.name ?? situation.territoryId}</p>
                  </div>
                  <span className={`etat-tag shrink-0 ${tag === "critique" ? "etat-tag--critique" : "etat-tag--vigilance"}`}>{priorityLabels[situation.priority]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="etat-panel p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="etat-eyebrow">Programmes à suivre</p>
            <a href="#programmes-detail" className="flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--etat-navy-800)] hover:text-[var(--etat-navy-600)]">Voir tout <ArrowRight size={12} /></a>
          </div>
          <div className="mt-3 space-y-2.5">
            {programmesTeaser.length === 0 ? (
              <p className="text-sm text-[var(--etat-stone-600)]">Aucun programme ne correspond à ce filtre pour le moment.</p>
            ) : programmesTeaser.map(({ programme }) => (
              <div key={programme.id} className="flex items-start justify-between gap-2 border-t border-[var(--etat-line)] pt-2.5 first:border-t-0 first:pt-0">
                <p className="min-w-0 truncate text-sm font-semibold text-[var(--etat-navy-950)]">{programme.title}</p>
                <span className="etat-tag etat-tag--stable shrink-0">{initiativeStatusLabel[programme.status]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* "Ce qui est documenté" : 3 liens, aucune donnée calculée (cf.
            commentaire ci-dessus). "Décisions récentes" reste sur cette
            page (#redevabilite, chapitre non touché par ce lot) ;
            "Résultats et effets"/"Rapports et redevabilité" pointent vers
            /app/etat/rapport — même raisonnement que le lien de la bande
            de synthèse plus haut ("seule destination preuve pleinement
            construite aujourd'hui"). */}
        <div className="etat-panel p-5">
          <p className="etat-eyebrow">Ce qui est documenté</p>
          <div className="mt-3">
            <a href="#redevabilite" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] first:border-t-0 first:pt-0 hover:text-[var(--etat-navy-600)]">Décisions récentes <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></a>
            <Link href="/app/etat/rapport" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] hover:text-[var(--etat-navy-600)]">Résultats et effets <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
            <Link href="/app/etat/rapport" className="flex items-center justify-between gap-2 border-t border-[var(--etat-line)] py-2.5 text-sm font-semibold text-[var(--etat-navy-950)] hover:text-[var(--etat-navy-600)]">Rapports et redevabilité <ArrowRight size={13} className="shrink-0 text-[var(--etat-stone-400)]" /></Link>
          </div>
        </div>
      </div>

      {/* id renommé "arbitrage" → "arbitrage-detail" (mandat "Brief
          national") : ce chapitre devient une destination secondaire
          ("ils deviennent une destination secondaire plutôt que le
          premier écran", arbitrage CEO) — registre complet inchangé
          (table/filtres/recherche), atteint via "Voir tout" depuis le
          teaser "À arbitrer" plus haut, plutôt que rencontré en premier
          en descendant la page. */}
      <section id="arbitrage-detail" className="scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="etat-eyebrow">Situations à arbitrer — registre complet</p>
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

      {/* Chapitre 3 "Résultats de la coordination" retiré du premier écran
          (mandat "Brief national", arbitrage explicite CEO 2026-08-23 :
          "'Résultats et effets' dans 'Ce qui est documenté' pointe vers
          /app/etat/rapport pour l'instant — seule destination 'preuve'
          pleinement construite aujourd'hui. Une vraie page /app/etat/
          performance reste le bon endroit à terme, hors périmètre de ce
          lot."). Retrait explicite, pas silencieux : les 4 mesures (valeur
          coordonnée, situations clôturées avec résultat, acteurs
          impliqués, capacités disponibles) et la courbe/comparaison
          d'évolution de la valeur coordonnée ne sont plus rendues nulle
          part sur /app/etat — leur calcul n'est pas repris ici (dead code
          supprimé avec le JSX : totalValue/executedRatio/engagedValue/
          closedRatio/closedWithResult/involvedActors/availableCapacity/
          coordinatedValueTrendPoints/Path/buildTrendPath, tous confirmés
          sans autre usage sur cette page avant suppression). Le lien
          "Résultats et effets" pointe vers /app/etat/rapport, qui n'a PAS
          d'équivalent direct de ces 4 mesures précises aujourd'hui
          (vérifié — aucune "valeur coordonnée"/"situations clôturées avec
          résultat" sur cette page) : la destination "preuve" la plus
          proche disponible, pas un remplacement fonctionnel exact. C'est
          la vraie page /app/etat/performance, non construite, qui
          reprendrait cette logique — hors périmètre de ce lot. */}

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
          si aucune situation liée n'a de dueAt.

          id renommé "programmes" → "programmes-detail" (mandat "Brief
          national") : même raisonnement que arbitrage-detail plus haut —
          registre complet inchangé, devient une destination secondaire
          atteinte via "Voir tout" depuis le teaser "Programmes à suivre". */}
      <section id="programmes-detail" className="scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="etat-eyebrow">Programmes en cours — portefeuille complet</p>
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

      {/* Chapitre 5 "Où concentrer l'attention ?" (carrousel territorial)
          retiré du premier écran (mandat "Brief national", arbitrage
          explicite CEO 2026-08-23 : "Sa fonction trouvera sa place dans
          la future page dédiée /app/etat/territoires (déjà planifiée, en
          attente). Pas supprimé définitivement."). Retrait explicite, pas
          silencieux : prioritized/prioritizedCritique/prioritizedFragile/
          activePriorityList/prioriteTab/prioritiesIndex/prioritiesTrackRef/
          territoryZoomStyle ne sont plus utilisés nulle part sur cette
          page (confirmés sans autre usage avant suppression du JSX et de
          leur calcul) — territoriesAttention également, seule entrée
          consommée par prioritized. Rien n'est perdu ailleurs : les 18
          territoires restent tous cliquables sur la carte du Chapitre 1,
          exactement comme le notait déjà le commentaire d'origine de ce
          chapitre. */}

      {/* Lot État-G (mandat §3.9, livrable 6 de la gap analysis) :
          maintenu comme registre de redevabilité distinct — 13 des 17
          décisions (76%) ont déjà un engagement terminé avec résultat
          documenté, une vraie substance, pas un doublon vide avec
          Situations à arbitrer. Renommé pour le dire explicitement ;
          statut dérivé affiché sur chaque ligne (jamais masqué quand il
          n'y a pas encore de résultat — honnêteté du 24% restant).
          Préfixe numérique "6 ·" retiré (mandat "Brief national") :
          la séquence 1-7 d'origine a des trous depuis le retrait des
          Chapitres 3 et 5 — un "6" isolé après "Programmes en cours"
          (sans numéro) aurait été plus confus qu'utile. Même traitement
          que arbitrage-detail/programmes-detail plus haut. Section elle-
          même non touchée par ailleurs : "Décisions récentes" dans
          "Ce qui est documenté" y renvoie (#redevabilite, inchangé). */}
      <section id="redevabilite" className="scroll-mt-6">
        <p className="etat-eyebrow">Décisions exécutées &amp; résultats observés — registre complet</p>
        <h2 className="etat-display mt-2 text-2xl not-italic text-[var(--etat-navy-950)]">Décisions exécutées &amp; résultats observés.</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--etat-stone-600)]">{state.decisions.length} décision(s) enregistrée(s) au total — ce que la coordination a décidé, et ce que cela a produit. Chaque arbitrage institutionnel reste tracé et consultable.</p>
        {/* Chapitre enveloppé dans .etat-panel (Lot 3) : dernier chapitre
            de contenu encore posé directement sur le crème sans surface
            propre — même doctrine que Situations à arbitrer, Résultats de
            la coordination et Programmes (correctif 2026-08-18 puis Lot 2),
            appliquée ici pour fermer l'écart. Registre de redevabilité,
            contenu à fort enjeu institutionnel : mérite la même matérialité
            que les autres chapitres, pas moins. */}
        <div className="etat-panel mt-5 p-6 lg:p-7">
        {recentDecisions.length === 0 ? (
          <p className="text-sm text-[var(--etat-stone-600)]">Aucune décision enregistrée pour le moment.</p>
        ) : (
          <div className="relative ml-5 border-l border-[var(--etat-line)] pl-7">
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
        </div>
      </section>

      {/* Fond Passerelle — asset d'illustration réelle (mandat "intégrer
          2 assets d'illustration réelle", 2026-08-23), remplace
          InstitutionIllustration à CET emplacement précis. Le composant
          reste utilisé tel quel ailleurs (Login/Institution, P5 audit
          XXL Public) — non touché, non propagé, retiré seulement ici.
          Ce n'est pas un doublon du même type que Compass/Sailboat/Fish
          au fond Atlas (InstitutionIllustration est un diagramme
          abstrait tensions→réseau→décision, pas une icône littérale de
          pirogue/mouette/boussole) : il est retiré parce qu'IllustrationBase
          peint son propre rectangle de fond marine opaque sur toute sa
          zone (cf. CoordinationIllustration.tsx) — superposé à la vraie
          photo, il l'aurait partiellement masquée d'un aplat marine
          plutôt que de la laisser porter l'ambiance, l'inverse du but de
          ce lot. .etat-canvas-dark garde son dégradé CSS existant (texte,
          position: relative) : simplement recouvert par la photo, pas
          modifié — la classe est partagée avec /app/etat/rapport (bandeau
          hero, habillé séparément ci-dessous avec son propre fichier),
          la retoucher globalement aurait propagé ce fond aux deux
          emplacements avec la même image. */}
      <section className="etat-canvas-dark relative flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[28px] p-7 shadow-lg">
        <Image
          src="/images/etat-passerelle-performance-background.webp"
          alt=""
          fill
          sizes="100vw"
          priority={false}
          className="pointer-events-none absolute inset-0 object-cover"
        />
        {/* Voile (même discipline que le fond Atlas) : le texte se lit
            déjà sur la zone la plus sombre du fichier (marine, à gauche),
            mais un léger assombrissement supplémentaire sécurise le
            contraste du texte le plus fin (etat-offwhite/65) — vérifié
            par capture, pas présumé. */}
        <div className="pointer-events-none absolute inset-0 bg-[var(--etat-navy-950)]/25" aria-hidden="true" />
        <div className="relative z-10">
          <p className="etat-eyebrow etat-eyebrow--on-dark">Programmes &amp; rapport</p>
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
