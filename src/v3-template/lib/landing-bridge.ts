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
import { DEMO_STATE } from "./demo-state";
import type { Infrastructure } from "@/domain/types";
import {
  buildLandingDetail,
  buildSiteIntelligence,
  buildTerritoryLandingActivity,
  recentLandingsForTerritory,
  type LandingDetailView,
  type SiteInfrastructureView,
  type SiteVolume,
  type TerritoryLandingActivity
} from "@/domain/territory-intelligence";
import { priorityLabels, priorityToTag, glyphBorderColor, trustLabels } from "@/lib/status-tokens";
import type { RoleKey } from "../types";

// Ré-exporté : Atlas.tsx type son panneau de détail sur cette vue sans
// jamais importer le domaine directement (voir l'en-tête ci-dessus).
export type { LandingDetailView };

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

// INFRA_TYPE_LABEL — couvre les 7 valeurs déclarées par Infrastructure["type"]
// (mandat PD.3 §5 : "audit the actual infrastructure taxonomy before
// coding"). Seules "fabrique_glace"/"chambre_froide"/"balance"/"transport"
// sont réellement instanciées dans le Demo World actuel (vérifié,
// aucune "quai"/"marche"/"transformation" au niveau Infrastructure —
// Site.type porte "quai"/"marche" séparément) ; les trois autres libellés
// sont conservés ici pour rester honnête si le référentiel les
// instancie un jour, jamais pour laisser un type non traduit.
const INFRA_TYPE_LABEL: Record<Infrastructure["type"], string> = {
  fabrique_glace: "Glace",
  chambre_froide: "Chambre froide",
  balance: "Balance",
  transport: "Transport froid",
  transformation: "Transformation",
  quai: "Quai",
  marche: "Marché"
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
  if (infrastructures.length === 0) return undefined;
  return infrastructures.map((item) => `${INFRA_TYPE_LABEL[item.type]} ${INFRA_STATE_LABEL[item.status]}`).join(" · ");
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

// Réutilisée telle quelle par le détail de site (PD.3, mandat §14 :
// "Coordination territoriale: richest operational Site detail... where
// permitted") — même profondeur de rôle, pas une seconde règle.
export function atlasLandingDepthForRole(role: RoleKey): AtlasLandingDepth {
  return role === "coordination" ? "detailed" : "aggregated";
}

// --- Site Intelligence (PD.3) -----------------------------------------
//
// Couleurs de statut d'infrastructure — reprises verbatim de la palette
// déjà utilisée pour la carte/les jauges de l'Atlas (theme.ts : LV.stable/
// vigilance/critique), jamais une nouvelle échelle : "opérationnelle" =
// vert déjà utilisé pour une capacité froide OK ailleurs dans ce même
// écran, "fragile"/"indisponible" = les deux teintes d'alerte déjà
// utilisées par la carte pour vigilance/critique.
const INFRA_STATUS_COLOR: Record<Infrastructure["status"], string> = {
  operationnelle: "#4E7B5A",
  fragile: "#E0A455",
  indisponible: "#E05A3C"
};

export interface SiteInfrastructureRowView {
  name: string;
  typeLabel: string;
  statusLabel: string;
  statusColor: string;
  organizationName?: string;
  // capacityText (mandat §7 : formes autorisées explicitement données par
  // le mandat, "X kg available cold capacity declared") — juxtaposition
  // factuelle théorique/disponible, jamais un ratio ni un pourcentage
  // calculé à partir des deux.
  capacityText: string;
  availabilityLabel: string;
  availabilityFresh: boolean;
  trustLabel: string;
  updatedAtLabel: string;
}

// formatSiteInfrastructureRow — même doctrine de fraîcheur que
// describeCapacityAvailability (actor-network.ts, réutilisée par
// buildSiteIntelligence) et même formulation que OrganizationProfileSheet.tsx
// (§A2, déjà en production) : jamais un pourcentage de confiance inventé,
// une Capacity expirée reste "à revérifier", jamais requalifiée
// "indisponible" par la seule péremption.
export function formatSiteInfrastructureRow(view: SiteInfrastructureView): SiteInfrastructureRowView {
  const { infrastructure, organization, capacity, availability } = view;
  const capacityText = capacity
    ? `${capacity.availableQuantity} ${capacity.unit} disponibles déclarés sur ${infrastructure.theoreticalCapacity} ${infrastructure.unit} théoriques`
    : `${infrastructure.availableCapacity} ${infrastructure.unit} disponibles sur ${infrastructure.theoreticalCapacity} ${infrastructure.unit} théoriques`;

  let availabilityLabel: string;
  let availabilityFresh = false;
  if (availability.kind === "valide") {
    availabilityLabel = `Disponibilité vérifiée jusqu’au ${formatCalendarDate(availability.capacity.validUntil.slice(0, 10))}.`;
    availabilityFresh = true;
  } else if (availability.kind === "aRevoir") {
    availabilityLabel = `À revérifier avant toute mobilisation (dernière validité connue : ${formatCalendarDate(availability.capacity.validUntil.slice(0, 10))}).`;
  } else {
    availabilityLabel = "Aucune capacité datée déclarée pour cette infrastructure.";
  }

  return {
    name: infrastructure.name,
    typeLabel: INFRA_TYPE_LABEL[infrastructure.type],
    statusLabel: INFRA_STATE_LABEL[infrastructure.status],
    statusColor: INFRA_STATUS_COLOR[infrastructure.status],
    organizationName: organization?.name,
    capacityText,
    availabilityLabel,
    availabilityFresh,
    trustLabel: trustLabels[infrastructure.trust],
    updatedAtLabel: formatCalendarDate(infrastructure.updatedAt.slice(0, 10))
  };
}

export interface SiteAttentionRow {
  id: string;
  title: string;
  description: string;
  level: "critique" | "vigilance";
  color: string;
}

export interface SiteSituationRow {
  id: string;
  title: string;
  meta: string;
  borderColor: string;
}

export interface SiteIntelligenceView {
  siteId: string;
  siteName: string;
  siteTypeLabel: string;
  territoryName?: string;
  activityHeadline: string;
  topSpecies: Array<{ speciesId: string; speciesName: string; weightLabel: string }>;
  infrastructures: SiteInfrastructureRowView[];
  recent: LandingRowView[];
  attention: SiteAttentionRow[];
  // territorySituations (mandat §10) — situations RÉELLES et ouvertes du
  // territoire de ce site ; Situation n'a pas de siteId dans le domaine
  // actuel (cf. rapport PD.0), donc explicitement présenté comme un
  // contexte de territoire, jamais comme spécifique à ce site précis.
  territorySituations: SiteSituationRow[];
}

const SITE_TYPE_LABEL: Record<string, string> = { quai: "Quai", marche: "Marché", zone_peche: "Zone de pêche" };

// getSiteIntelligenceView — point d'entrée unique consommé par le panneau
// de détail de site de l'Atlas (PD.3 §10). Retourne undefined si
// l'identifiant ne résout à aucun Site réel.
export function getSiteIntelligenceView(siteId: string): SiteIntelligenceView | undefined {
  const intelligence = buildSiteIntelligence(DEMO_STATE, siteId);
  if (!intelligence) return undefined;
  const { site, territory, activity, recentLandings, infrastructures, attention, territorySituations } = intelligence;

  return {
    siteId: site.id,
    siteName: site.name,
    siteTypeLabel: SITE_TYPE_LABEL[site.type] ?? site.type,
    territoryName: territory?.name,
    activityHeadline: `${activity.landingCount} débarquement${activity.landingCount > 1 ? "s" : ""} · ${formatKg(activity.totalLandedKg)}`,
    topSpecies: activity.volumeBySpecies.slice(0, 3).map((sp) => ({ speciesId: sp.speciesId, speciesName: sp.speciesName, weightLabel: formatKg(sp.landedKg) })),
    infrastructures: infrastructures.map(formatSiteInfrastructureRow),
    recent: recentLandings.map(toRowView),
    attention: attention.map((alert) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      level: alert.attentionLevel,
      color: alert.attentionLevel === "critique" ? "#E05A3C" : "#E0A455"
    })),
    territorySituations: territorySituations.map((situation) => ({
      id: situation.id,
      title: situation.title,
      meta: `${priorityLabels[situation.priority]} · ${trustLabels[situation.trust]}`,
      borderColor: glyphBorderColor[priorityToTag[situation.priority]]
    }))
  };
}
