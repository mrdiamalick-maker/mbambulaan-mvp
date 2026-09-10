// LOT V3.4 ("Atlas Operational Intelligence") — dérivations pures pour
// l'Atlas territorial, même esprit que domain/situation-overview.ts (V3.2)
// et domain/incoming-message.ts (V3.3) : uniquement des lectures depuis un
// ProductState déjà chargé, aucune commande, aucune donnée fabriquée, aucune
// IA. Consommé par les DEUX dossiers territoriaux existants (Espace État,
// Atlas professionnel Coordination) via components/territories/
// TerritoryDossierSections.tsx — mandat §16, "une seule réalité, différentes
// expériences" : ces helpers renforcent la convergence déjà réelle au niveau
// de la donnée (buildTerritoryIntelligence), jamais un second calcul propre
// à un seul des deux espaces.
import type { ProductState, Site } from "@/domain/types";

// --- Zones maritimes (mandat §10, "filtres avec un sens réel") ----------
//
// AUCUN champ structuré du domaine ne porte cette notion (Territory.region
// est administratif — Fatick/Thiès/Saint-Louis/Dakar/Ziguinchor/Louga — et
// ne correspond pas 1:1 aux 5 façades maritimes usuelles du littoral
// sénégalais : une région comme Thiès contient à la fois de la Petite-Côte
// et de la Grande-Côte). Cette table est donc une catégorisation de
// PRÉSENTATION, construite à la main à partir de la géographie côtière
// réelle et connue du Sénégal (positionnement nord/sud le long du
// littoral) — jamais une nouvelle donnée métier, jamais un découpage
// réglementaire. La frontière Cap-Vert/Petite-Côte autour de
// Rufisque-Bargny est approximative par nature (la presqu'île du Cap-Vert
// et sa baie sud se prolongent l'une dans l'autre) ; ce n'est qu'un
// regroupement d'affichage, documenté comme tel partout où il est montré.
export type MaritimeZone = "grande_cote" | "cap_vert" | "petite_cote" | "sine_saloum" | "casamance";

export const MARITIME_ZONE_LABEL: Record<MaritimeZone, string> = {
  grande_cote: "Grande-Côte",
  cap_vert: "Cap-Vert",
  petite_cote: "Petite-Côte",
  sine_saloum: "Sine-Saloum",
  casamance: "Casamance"
};

// Ordre nord → sud, utilisé pour l'affichage des puces de filtre (mandat
// §10) — jamais un ordre alphabétique qui casserait la lecture
// géographique.
export const MARITIME_ZONE_ORDER: MaritimeZone[] = ["grande_cote", "cap_vert", "petite_cote", "sine_saloum", "casamance"];

const TERRITORY_MARITIME_ZONE: Record<string, MaritimeZone> = {
  "saint-louis": "grande_cote",
  "lompoul": "grande_cote",
  "fass-boye": "grande_cote",
  "kayar": "grande_cote",
  "hann": "cap_vert",
  "soumbedioune": "cap_vert",
  "rufisque": "cap_vert",
  "yoff": "cap_vert",
  "ouakam": "cap_vert",
  "popenguine": "petite_cote",
  "mbour": "petite_cote",
  "joal": "petite_cote",
  "djiffer": "petite_cote",
  "foundiougne": "sine_saloum",
  "missirah": "sine_saloum",
  "kafountine": "casamance",
  "cap-skirring": "casamance",
  "elinkine": "casamance"
};

// resolveMaritimeZone — jamais un rattachement "par défaut" : un territoire
// absent de la table (dérive future du référentiel) reste `undefined`
// plutôt que de se voir attribuer une façade arbitraire.
export function resolveMaritimeZone(territoryId: string): MaritimeZone | undefined {
  return TERRITORY_MARITIME_ZONE[territoryId];
}

// --- Profondeur quai/site (mandat §6, "territory → landing site/quay →
// operational picture") ---------------------------------------------------
//
// Site est une entité RÉELLE du domaine (territoryId, type quai/marché/
// zone_peche, lat/lng propres) — buildTerritoryIntelligence l'expose déjà
// (identity.sites) mais aucun des deux dossiers ne le rend comme une
// section distincte à ce jour. L'Atlas professionnel calcule déjà une
// profondeur opérationnelle riche, mais UNIQUEMENT pour le quai
// (`quai-${territoryId}`, ProfessionalAtlasWorkspace.tsx) — les deux autres
// sites réels du territoire (marché, zone de pêche) n'ont aujourd'hui aucune
// lecture. Ce helper couvre les 3 sites réels d'un territoire avec la même
// discipline (agrégats directs sur Vessel/FishingTrip/Landing/
// Infrastructure, jamais un chiffre illustratif) — additif : ne remplace
// pas le calcul déjà existant côté quai dans ProfessionalAtlasWorkspace.
export interface SiteOperationalSummary {
  site: Site;
  vesselCount: number;
  activeTripCount: number;
  recentLandingCount: number;
  recentLandedKg: number;
  infrastructureCount: number;
  fragileInfrastructureCount: number;
}

export function territorySiteSummaries(state: ProductState, territoryId: string): SiteOperationalSummary[] {
  return state.sites
    .filter((site) => site.territoryId === territoryId)
    .map((site) => {
      const vessels = state.vessels.filter((vessel) => vessel.homeSiteId === site.id);
      const vesselIds = new Set(vessels.map((vessel) => vessel.id));
      const activeTripCount = state.trips.filter((trip) => vesselIds.has(trip.vesselId) && trip.status !== "debarquee").length;
      const landings = state.landings.filter((landing) => landing.siteId === site.id);
      const infrastructures = state.infrastructures.filter((infra) => infra.siteId === site.id);
      return {
        site,
        vesselCount: vessels.length,
        activeTripCount,
        recentLandingCount: landings.length,
        recentLandedKg: landings.reduce((sum, landing) => sum + landing.totalWeightKg, 0),
        infrastructureCount: infrastructures.length,
        fragileInfrastructureCount: infrastructures.filter((infra) => infra.status !== "operationnelle").length
      };
    })
    // Ordre stable et lisible : quai (le point opérationnel le plus dense)
    // d'abord, puis marché, puis zone de pêche.
    .sort((a, b) => (a.site.type === b.site.type ? 0 : a.site.type === "quai" ? -1 : b.site.type === "quai" ? 1 : a.site.type.localeCompare(b.site.type)));
}

export const siteTypeLabel: Record<Site["type"], string> = {
  quai: "Quai",
  marche: "Marché",
  zone_peche: "Zone de pêche"
};

// --- Tendance des débarquements (mandat §13, candidat légitime à la
// première utilisation réelle de TrendChart) ------------------------------
//
// Agrégation directe de Landing.totalWeightKg par jour, sur les sites
// réels du territoire — AUCUNE série fabriquée. Le jeu de démonstration
// contient une extension historique explicitement marquée comme simulée
// (src/data/demo-state.ts, "Historique simulé de démonstration…" dans
// Landing.weighingSource / FishingTrip.source) : plutôt que masquer ces
// points ou les fondre silencieusement dans une "vraie" série, chaque jour
// retourné porte son propre indicateur `simulated`, et l'appelant est
// responsable d'afficher la mention honnête (mandat §14) quand elle est
// vraie pour au moins un point — même discipline que ETAT_DEMO_SERIES_NOTICE
// ailleurs dans le Produit.
export interface LandingTrendPoint {
  /** Date ISO (jour) — clé d'agrégation, jamais un libellé fabriqué. */
  date: string;
  /** Libellé court jour/mois pour l'axe du graphique. */
  label: string;
  landedKg: number;
  tripCount: number;
  /** true si au moins un enregistrement de ce jour porte la mention
   *  "simulé" dans sa source déclarée. */
  simulated: boolean;
}

const SIMULATED_SOURCE_PATTERN = /simul/i;

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

// territoryLandingTrend — un point par jour où AU MOINS un débarquement
// réel est enregistré sur l'un des sites du territoire (jamais un jour
// vide interpolé à zéro, qui laisserait croire à une mesure continue que
// le jeu de données ne porte pas). Trié chronologiquement, plafonné aux
// `maxDays` jours les plus récents pour rester un aperçu de tendance, pas
// un registre exhaustif.
export function territoryLandingTrend(state: ProductState, territoryId: string, maxDays = 7): LandingTrendPoint[] {
  const siteIds = new Set(state.sites.filter((site) => site.territoryId === territoryId).map((site) => site.id));
  const byDay = new Map<string, { landedKg: number; tripCount: number; simulated: boolean }>();

  for (const landing of state.landings) {
    if (!siteIds.has(landing.siteId)) continue;
    const at = landing.weighedAt ?? landing.arrivedAt;
    if (!at) continue;
    const key = dayKey(at);
    const entry = byDay.get(key) ?? { landedKg: 0, tripCount: 0, simulated: false };
    entry.landedKg += landing.totalWeightKg;
    entry.simulated = entry.simulated || SIMULATED_SOURCE_PATTERN.test(landing.weighingSource);
    byDay.set(key, entry);
  }

  const vesselIds = new Set(state.vessels.filter((vessel) => siteIds.has(vessel.homeSiteId)).map((vessel) => vessel.id));
  for (const trip of state.trips) {
    if (!vesselIds.has(trip.vesselId)) continue;
    const at = trip.arrivedAt ?? trip.departureAt;
    const key = dayKey(at);
    const entry = byDay.get(key) ?? { landedKg: 0, tripCount: 0, simulated: false };
    entry.tripCount += 1;
    entry.simulated = entry.simulated || SIMULATED_SOURCE_PATTERN.test(trip.source);
    byDay.set(key, entry);
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxDays)
    .map(([date, entry]) => ({ date, label: formatter.format(new Date(date)), landedKg: Math.round(entry.landedKg), tripCount: entry.tripCount, simulated: entry.simulated }));
}

export const LANDING_TREND_SIMULATED_NOTICE = "Période de démonstration : certains jours affichés proviennent d’un historique simulé, pas d’une mesure continue en production.";
