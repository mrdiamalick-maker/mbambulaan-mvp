// Pont Atlas ↔ domaine réel — PD.1, mandat "Product Dressing — Landing
// Intelligence / Maritime Operations Foundation". Fichier volontairement
// isolé dans v3-template/lib : c'est le SEUL endroit où le gabarit V3 gelé
// (§11 du mandat : "THE TEMPLATE MUST NOT BE REDESIGNED TO FIT REAL DATA")
// importe le domaine canonique Mbàmbulaan (src/domain, src/data/demo-state).
// Atlas.tsx ne connaît que les vues déjà formatées exportées ci-dessous —
// jamais ProductState ni un type du domaine directement — pour que le
// composant reste lisible comme le reste du template (mêmes conventions
// que lib/atlas.ts : des fonctions qui rendent une vue prête à afficher).
//
// Snapshot construit une seule fois au chargement du module (mandat §2 :
// "The current Demo World instances may remain demo data") — ce sont les
// mêmes données que le reste du Produit (createDemoState, déjà utilisé par
// l'application réelle), jamais une fixture parallèle inventée pour ce lot.
import { createDemoState } from "@/data/demo-state";
import type { Infrastructure } from "@/domain/types";
import {
  buildLandingDetail,
  buildTerritoryLandingActivity,
  recentLandingsForTerritory,
  type LandingDetailView,
  type SiteVolume,
  type TerritoryLandingActivity
} from "@/domain/territory-intelligence";
import type { RoleKey } from "../types";

// Ré-exporté : Atlas.tsx type son panneau de détail sur cette vue sans
// jamais importer le domaine directement (voir l'en-tête ci-dessus).
export type { LandingDetailView };

const DEMO_STATE = createDemoState();

// TERRITORY_ID_BY_NAME — les 18 territoires du gabarit V3 (data/territories.ts,
// noms éditoriaux affichés) et les 18 territoires du domaine réel
// (src/data/demo-state.ts, identifiants techniques) désignent aujourd'hui
// exactement le même littoral, un par un — vérifié nom par nom, jamais
// dérivé d'un slug générique : "Joal-Fadiouth" résout à l'identifiant réel
// "joal" (pas "joal-fadiouth"), qu'un slug automatique aurait manqué.
export const TERRITORY_ID_BY_NAME: Record<string, string> = {
  "Saint-Louis": "saint-louis",
  "Lompoul-sur-Mer": "lompoul",
  "Fass Boye": "fass-boye",
  Kayar: "kayar",
  Yoff: "yoff",
  Ouakam: "ouakam",
  Soumbédioune: "soumbedioune",
  Hann: "hann",
  "Rufisque-Bargny": "rufisque",
  Popenguine: "popenguine",
  Mbour: "mbour",
  "Joal-Fadiouth": "joal",
  Djiffer: "djiffer",
  Foundiougne: "foundiougne",
  Missirah: "missirah",
  Kafountine: "kafountine",
  Elinkine: "elinkine",
  "Cap Skirring": "cap-skirring"
};

const MONTHS_ABBR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

// formatCalendarDate — même style de date que le reste du gabarit ("29
// juil.", "18 avr.", cf. data/programmes.ts) — aucune nouvelle convention
// introduite pour ce lot.
export function formatCalendarDate(isoDate: string): string {
  const parts = isoDate.split("-").map(Number);
  const month = parts[1];
  const day = parts[2];
  return `${String(day).padStart(2, "0")} ${MONTHS_ABBR[month - 1] ?? isoDate}`;
}

export function formatKg(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} kg`;
}

const INFRA_TYPE_LABEL: Partial<Record<Infrastructure["type"], string>> = {
  fabrique_glace: "Glace",
  chambre_froide: "Chambre froide",
  balance: "Balance",
  transport: "Transport froid"
};

const INFRA_STATE_LABEL: Record<Infrastructure["status"], string> = {
  operationnelle: "opérationnelle",
  fragile: "fragile",
  indisponible: "indisponible"
};

// formatInfrastructureContext — contexte de co-localisation uniquement
// (mandat PD.1 §9 : "Do not claim causality" — "A landing volume near a
// fragile infrastructure may be contextual information, not proof of
// overload"). Une simple juxtaposition texte, jamais un score ni une
// interprétation ("en tension", "à risque"…) qui laisserait croire à un
// lien démontré entre le volume débarqué et l'état de l'infrastructure.
export function formatInfrastructureContext(infrastructures: Infrastructure[]): string | undefined {
  const relevant = infrastructures.filter((item) => item.type in INFRA_TYPE_LABEL);
  if (relevant.length === 0) return undefined;
  return relevant.map((item) => `${INFRA_TYPE_LABEL[item.type]} ${INFRA_STATE_LABEL[item.status]}`).join(" · ");
}

function buildSiteInfrastructureNote(siteId: string): string | undefined {
  return formatInfrastructureContext(DEMO_STATE.infrastructures.filter((item) => item.siteId === siteId));
}

export interface LandingRowView {
  id: string;
  siteName: string;
  vesselName: string;
  registration: string;
  dateLabel: string;
  hasDate: boolean;
  weightLabel: string;
  dominantSpeciesName: string;
  trust: LandingDetailView["landing"]["trust"];
  status: LandingDetailView["landing"]["status"];
}

// toRowView — jamais un champ fabriqué pour combler une référence
// manquante (mandat PD.1 §3/§10) : un véhicule ou une date introuvable
// reste un libellé d'absence explicite ("Pirogue non identifiée",
// "Attendu"), jamais une valeur plausible inventée à sa place.
function toRowView(view: LandingDetailView): LandingRowView {
  const { landing } = view;
  const at = landing.weighedAt ?? landing.arrivedAt;
  const dominant = [...view.catches].sort((left, right) => right.quantityKg - left.quantityKg)[0];
  return {
    id: landing.id,
    siteName: view.site?.name ?? landing.siteId,
    vesselName: view.vessel?.name ?? "Pirogue non identifiée",
    registration: view.vessel?.registration ?? "",
    dateLabel: at ? formatCalendarDate(at.slice(0, 10)) : "Attendu",
    hasDate: Boolean(at),
    weightLabel: formatKg(landing.totalWeightKg),
    dominantSpeciesName: dominant?.speciesName ?? "",
    trust: landing.trust,
    status: landing.status
  };
}

export interface SiteActivityRow extends SiteVolume {
  infrastructureNote?: string;
}

export interface TerritoryLandingView {
  activity: TerritoryLandingActivity;
  siteRows: SiteActivityRow[];
  recent: LandingRowView[];
  trendPoints: Array<{ dateLabel: string; landingCount: number; landedKg: number }>;
}

// getTerritoryLandingView — point d'entrée unique consommé par Atlas.tsx
// pour l'onglet "Activité de débarquement". Retourne undefined pour un
// nom de territoire sans correspondance réelle — aujourd'hui les 18
// territoires du gabarit résolvent tous, mais l'appelant ne doit jamais
// supposer une couverture universelle.
export function getTerritoryLandingView(name: string): TerritoryLandingView | undefined {
  const territoryId = TERRITORY_ID_BY_NAME[name];
  if (!territoryId) return undefined;
  const activity = buildTerritoryLandingActivity(DEMO_STATE, territoryId);
  const recentViews = recentLandingsForTerritory(DEMO_STATE, territoryId, 8);
  return {
    activity,
    siteRows: activity.volumeBySite.map((site) => ({ ...site, infrastructureNote: buildSiteInfrastructureNote(site.siteId) })),
    recent: recentViews.map(toRowView),
    trendPoints: activity.trend.map((point) => ({
      dateLabel: formatCalendarDate(point.date),
      landingCount: point.landingCount,
      landedKg: point.landedKg
    }))
  };
}

export function getLandingDetail(landingId: string): LandingDetailView | undefined {
  return buildLandingDetail(DEMO_STATE, landingId);
}

// atlasLandingDepthForRole — profondeur d'information permise par rôle
// (mandat PD.1 §13). Ministère ("aggregated territorial landing reading")
// et Direction de programme ("same territory context where relevant, no
// invented programme causality") reçoivent la lecture agrégée
// territoriale ; Coordination territoriale reçoit en plus le détail
// débarquement par débarquement ("richest permitted landing/site
// detail") — seul rôle dont le mandat opérationnel porte sur le
// site/la pirogue individuelle. Ne redessine pas le système de rôles
// (aucun RoleKey ajouté, aucun changement de navigation) : une seule
// fonction pure de profondeur d'affichage à l'intérieur d'un écran déjà
// commun aux trois rôles.
export type AtlasLandingDepth = "aggregated" | "detailed";

export function atlasLandingDepthForRole(role: RoleKey): AtlasLandingDepth {
  return role === "coordination" ? "detailed" : "aggregated";
}
