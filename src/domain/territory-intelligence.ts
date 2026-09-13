// Territory Intelligence — LOT 5 (mandat "Atlas & Territoire : voir la
// réalité territoriale comme un système"). Moteur pur/testable qui
// projette un territoryId sur l'ensemble du Core : identité, activité,
// ce qui se passe, ce qui émerge, ce que nous ne savons pas, ce que le
// terrain vérifie, ce qui est en cours, ce qui a été réalisé, ce qui
// change, ce que nous apprenons (mandat §5). Aucun nouvel objet
// TerritoryTwin/AtlasObject/TerritorialInsight — cette fonction ne stocke
// rien, elle calcule à partir de ProductState à chaque appel (mandat §35).
//
// Discipline commune (mandat §6) : ne jamais réduire la relation
// territoriale à `object.territoryId === territoryId`. Un objet
// multi-territorial (CollectiveNeed, ProgramOpportunity, FieldMission,
// Initiative, Result, Outcome) doit apparaître sur CHACUN de ses
// territoires (TEST B) ; un Learning hérite le territoire de sa source
// réelle (Situation/Initiative/Outcome/FieldMission), jamais déduit
// autrement.
import type {
  Actor,
  Capacity,
  CollectiveNeed,
  CoordinationSpace,
  Finding,
  FieldMission,
  FishingTrip,
  Infrastructure,
  Initiative,
  Landing,
  Learning,
  Observation,
  Organization,
  PartnerService,
  ProductState,
  ProgramOpportunity,
  Result,
  Outcome,
  ServiceRequest,
  Signal,
  Site,
  Situation,
  Species,
  Territory,
  Vessel
} from "./types";
// PD.3 (mandat "Site & Infrastructure Intelligence", §6/§8) — réutilise
// délibérément deux moteurs déjà écrits plutôt que d'en refaire des
// équivalents : describeCapacityAvailability (LOT 7, "déclarée disponible"
// ≠ "disponible maintenant") et les détections déterministes de
// signal-crossing.ts (infrastructure fragilisée sur site actif, fraîcheur
// de capacité). "Domain engine decides. UI explains." (mandat §8) — cette
// projection ne recalcule aucune des deux règles, elle les appelle et les
// filtre au périmètre du site.
import { describeCapacityAvailability, type CapacityAvailability } from "./actor-network";
import { detectCapacityFreshnessGapAlerts, detectImpairedInfrastructureAlerts, type SignalCrossingAlert } from "./signal-crossing";

// Statuts "en cours" pour ProgramOpportunity (mandat §12, "développement"
// distinct de la coordination et du terrain) — mêmes valeurs que
// ProgramOpportunityDossier.tsx (QUALIFIABLE/CONVERTIBLE), pas un nouveau
// seuil inventé pour ce lot.
const OPEN_PROGRAM_OPPORTUNITY_STATUSES = new Set<ProgramOpportunity["status"]>(["detected", "qualifying", "qualified", "designing"]);

// resolveLearningTerritoryIds — un Learning n'a pas de territoryIds
// propre : il hérite de sa source réelle (mandat §6). Au plus une source
// est renseignée en pratique (record_learning l'exige), mais rien
// n'empêche structurellement d'en cumuler plusieurs — on les réunit
// toutes plutôt que de n'en retenir arbitrairement qu'une.
export function resolveLearningTerritoryIds(state: ProductState, learning: Learning): string[] {
  const ids = new Set<string>();
  if (learning.situationId) {
    const situation = state.situations.find((item) => item.id === learning.situationId);
    if (situation) ids.add(situation.territoryId);
  }
  if (learning.initiativeId) {
    const initiative = state.initiatives.find((item) => item.id === learning.initiativeId);
    initiative?.territoryIds.forEach((id) => ids.add(id));
  }
  if (learning.outcomeId) {
    const outcome = state.outcomes.find((item) => item.id === learning.outcomeId);
    outcome?.territoryIds.forEach((id) => ids.add(id));
  }
  if (learning.fieldMissionId) {
    const mission = state.fieldMissions.find((item) => item.id === learning.fieldMissionId);
    mission?.territoryIds.forEach((id) => ids.add(id));
  }
  return [...ids];
}

// resolveCoordinationTerritoryIds — une CoordinationSpace n'a pas de
// territoryIds propre non plus : elle hérite de sa Situation quand elle
// en a une (le cas courant). Sans situationId (coordination née d'une
// Opportunity de matching lot↔demande), aucun territoire n'est déduit —
// pas de lien fabriqué.
function resolveCoordinationTerritoryIds(state: ProductState, coordination: CoordinationSpace): string[] {
  if (!coordination.situationId) return [];
  const situation = state.situations.find((item) => item.id === coordination.situationId);
  return situation ? [situation.territoryId] : [];
}

export interface TerritoryIdentity {
  sites: Site[];
  actors: Actor[];
  organizations: Organization[];
  infrastructures: Infrastructure[];
}

export interface TerritoryActivity {
  landings: Landing[];
  landedKg: number;
  speciesCount: number;
}

export interface TerritoryIntelligence {
  territory: Territory;
  identity: TerritoryIdentity;
  activity: TerritoryActivity;
  // "Ce qui se passe" (§5/§10) — Signals/Findings/Situations réellement
  // reliés, jamais 3 listes techniques présentées telles quelles côté UI
  // (la présentation en dossiers/sujets reste la responsabilité du
  // composant, pas de cette projection).
  signals: Signal[];
  findings: Finding[];
  situations: Situation[];
  // "Ce qui émerge" (§5/§10).
  serviceRequests: ServiceRequest[];
  collectiveNeeds: CollectiveNeed[];
  // "Ce que nous ne savons pas" (§5/§11) — sous-ensemble de `findings`
  // (type === "knowledge_gap"), exposé séparément pour ne pas obliger
  // chaque consommateur à refiltrer.
  knowledgeGaps: Finding[];
  // "Ce que le terrain vérifie" (§5/§6, LOT 3).
  fieldMissions: FieldMission[];
  observations: Observation[];
  // "Ce qui est en cours" (§5/§12) — 3 natures distinctes, jamais
  // fusionnées sous un même "Projets" (mandat §12).
  coordinations: CoordinationSpace[];
  initiatives: Initiative[];
  programOpportunities: ProgramOpportunity[];
  // "Ce qui a été réalisé" / "Ce qui change" / "Ce que nous apprenons"
  // (§5/§13/§14, LOT 4).
  results: Result[];
  outcomes: Outcome[];
  learnings: Learning[];
  // "Qui peut agir ?" (LOT 7, mandat "Actor & Trust Network", §17/§29) —
  // capacités du Network potentiellement mobilisables sur ce territoire.
  // Jamais une recommandation automatique ni un fournisseur présélectionné
  // — la décision de mobiliser reste humaine (Situation Room, dossier
  // territorial). Pas de duplication : ce sont les mêmes PartnerService
  // que ceux lus par buildOrganizationNetworkProfile (actor-network.ts).
  networkCapacities: PartnerService[];
}

// buildTerritoryIntelligence — point d'entrée unique (mandat §6). Réutilisé
// tel quel par l'Atlas professionnel et l'Espace État (mandat §26, "une
// seule réalité, différentes expériences") ; réutilisable ultérieurement
// par l'Atlas public avec un filtrage des données autorisées (mandat §25,
// non fait dans ce lot).
export function buildTerritoryIntelligence(state: ProductState, territoryId: string): TerritoryIntelligence | undefined {
  const territory = state.territories.find((item) => item.id === territoryId);
  if (!territory) return undefined;

  const sites = state.sites.filter((item) => item.territoryId === territoryId);
  const siteIds = new Set(sites.map((item) => item.id));
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territoryId);
  const actors = state.actors.filter((item) => item.territoryIds.includes(territoryId));
  const organizationIds = new Set(actors.map((item) => item.organizationId));
  const organizations = state.organizations.filter((item) => organizationIds.has(item.id));

  const landings = state.landings.filter((item) => siteIds.has(item.siteId));
  const landedKg = landings.reduce((sum, item) => sum + item.totalWeightKg, 0);
  const speciesCount = new Set(landings.flatMap((item) => item.catches).map((item) => item.speciesId)).size;

  const signals = state.signals.filter((item) => item.territoryId === territoryId);
  const findings = state.findings.filter((item) => item.territoryIds.includes(territoryId));
  const situations = state.situations.filter((item) => item.territoryId === territoryId);

  const serviceRequests = state.serviceRequests.filter((item) => item.territoryId === territoryId);
  const collectiveNeeds = state.collectiveNeeds.filter((item) => item.territoryIds.includes(territoryId));
  const knowledgeGaps = findings.filter((item) => item.type === "knowledge_gap");

  const fieldMissions = state.fieldMissions.filter((item) => item.territoryIds.includes(territoryId));
  const observations = state.observations.filter((item) => item.territoryId === territoryId);

  const coordinations = state.coordinationSpaces.filter((item) => resolveCoordinationTerritoryIds(state, item).includes(territoryId));
  const initiatives = state.initiatives.filter((item) => item.territoryIds.includes(territoryId));
  const programOpportunities = state.programOpportunities.filter((item) => item.territoryIds.includes(territoryId) && OPEN_PROGRAM_OPPORTUNITY_STATUSES.has(item.status));

  const results = state.results.filter((item) => item.territoryIds.includes(territoryId));
  const outcomes = state.outcomes.filter((item) => item.territoryIds.includes(territoryId));
  const learnings = state.learnings.filter((item) => resolveLearningTerritoryIds(state, item).includes(territoryId));
  const networkCapacities = state.partnerServices.filter((item) => item.territoryIds.includes(territoryId));

  return {
    territory,
    identity: { sites, actors, organizations, infrastructures },
    activity: { landings, landedKg, speciesCount },
    signals,
    findings,
    situations,
    serviceRequests,
    collectiveNeeds,
    knowledgeGaps,
    fieldMissions,
    observations,
    coordinations,
    initiatives,
    programOpportunities,
    results,
    outcomes,
    learnings,
    networkCapacities
  };
}

// hasSufficientKnowledge (mandat §30/§K, "un territoire sans information
// suffisante n'est jamais déclaré stable") — un simple constat de volume
// de données réellement présentes, jamais un score. Un territoire peut
// honnêtement avoir peu de connaissance disponible (mandat §29) ; ce
// helper ne fait qu'exposer ce fait pour que l'UI l'affiche explicitement
// plutôt que de laisser un silence se lire comme une stabilité.
export function hasSufficientKnowledge(intelligence: TerritoryIntelligence): boolean {
  return (
    intelligence.signals.length > 0 ||
    intelligence.findings.length > 0 ||
    intelligence.situations.length > 0 ||
    intelligence.collectiveNeeds.length > 0 ||
    intelligence.fieldMissions.length > 0 ||
    intelligence.results.length > 0
  );
}

// --- Lecture "current" (micro-correctif final LOT 5) ------------------
//
// buildTerritoryIntelligence() reste la projection complète — l'histoire
// territoriale (Situation réglée, Mission réalisée, Finding rejeté,
// CollectiveNeed converti…) doit rester consultable dans le dossier. Ce
// qui suit est une sous-projection PURE, dérivée de TerritoryIntelligence
// sans jamais retoucher ses tableaux : uniquement destinée aux surfaces
// explicitement intitulées "Aujourd'hui" / "ce qui compte maintenant"
// (lens Atlas, résumé "Aujourd'hui à [territoire]", résumés carte), pour
// qu'elles ne présentent jamais comme actif un objet terminé, rejeté ou
// remplacé.
const CURRENT_FIELD_MISSION_STATUSES = new Set<FieldMission["status"]>(["a_preparer", "planifiee", "en_cours"]);
const CURRENT_COLLECTIVE_NEED_STATUSES = new Set<CollectiveNeed["status"]>(["emerging", "qualifying", "qualified", "monitored"]);
const STALE_FINDING_STATUSES = new Set<Finding["status"]>(["rejected", "superseded"]);

export interface TerritoryCurrentView {
  situations: Situation[];
  findings: Finding[];
  knowledgeGaps: Finding[];
  fieldMissions: FieldMission[];
  collectiveNeeds: CollectiveNeed[];
  // La logique des statuts "ouverts" de ProgramOpportunity est déjà
  // appliquée dans buildTerritoryIntelligence (OPEN_PROGRAM_OPPORTUNITY_
  // STATUSES) — reprise telle quelle, pas de second filtre concurrent.
  programOpportunities: ProgramOpportunity[];
}

export function currentTerritoryView(intelligence: TerritoryIntelligence): TerritoryCurrentView {
  const situations = intelligence.situations.filter((item) => item.status !== "reglee");
  const findings = intelligence.findings.filter((item) => !STALE_FINDING_STATUSES.has(item.status));
  const knowledgeGaps = findings.filter((item) => item.type === "knowledge_gap");
  const fieldMissions = intelligence.fieldMissions.filter((item) => CURRENT_FIELD_MISSION_STATUSES.has(item.status));
  const collectiveNeeds = intelligence.collectiveNeeds.filter((item) => CURRENT_COLLECTIVE_NEED_STATUSES.has(item.status));
  return { situations, findings, knowledgeGaps, fieldMissions, collectiveNeeds, programOpportunities: intelligence.programOpportunities };
}

// --- Landing intelligence (PD.1, mandat "Product Dressing — Landing
// Intelligence / Maritime Operations Foundation") ---------------------
//
// Extension de ce fichier plutôt qu'un moteur parallèle (mandat §4 :
// "Extend existing territory intelligence rather than creating a
// parallel engine where appropriate") — buildTerritoryIntelligence()
// expose déjà `activity.landings`/`landedKg`/`speciesCount` ; ce qui
// suit ajoute les projections déterministes que le mandat PD.1 demande
// (comptage, répartition par espèce/site, activité des pirogues,
// tendance) sans toucher aux champs existants ni à leur définition.
// Toujours calculé à la volée depuis ProductState (même discipline que
// buildTerritoryIntelligence, mandat §35) : aucun nouvel objet stocké.
//
// Discipline "ne rien inventer" (mandat PD.1 §3/§10) : chaque valeur
// résolue ci-dessous vient d'un champ réel de ProductState ou d'une
// agrégation pure sur des champs réels ; quand une référence ne résout
// à rien (véhicule/site/capitaine inconnu), le champ correspondant reste
// `undefined` plutôt que fabriqué.

export interface LandingCatchLineView {
  speciesId: string;
  // Nom résolu depuis Species.nameFr (PD.2, "Species Referential V1" —
  // remplace Species.name comme champ de référence pour tout code
  // nouveau, mandat §3/§5). Repli sur l'identifiant technique si
  // l'espèce n'est pas résolue (jamais un nom inventé).
  speciesName: string;
  // scientificName/localName (PD.2, mandat §9 : "primary display:
  // French/reference name ; secondary/contextual: local name and/or
  // scientific name") — absents si le référentiel ne les connaît pas
  // pour cette espèce, jamais fabriqués. localName ne reprend que le
  // PREMIER alias connu (mandat §5 : une liste peut exister, mais
  // l'affichage discret d'un panneau de détail n'en montre qu'un —
  // jamais une énumération complète qui alourdirait la lecture).
  speciesScientificName?: string;
  speciesLocalName?: string;
  quantityKg: number;
  quality: Landing["catches"][number]["quality"];
  productForm: Landing["catches"][number]["productForm"];
}

export interface LandingDetailView {
  landing: Landing;
  site?: Site;
  territory?: Territory;
  trip?: FishingTrip;
  vessel?: Vessel;
  captain?: Actor;
  catches: LandingCatchLineView[];
  // Infrastructures du même site (glace, chambre froide, balance,
  // transport) — contexte de co-localisation uniquement (mandat PD.1
  // §9 : "Do not claim causality"), jamais une preuve de saturation.
  infrastructures: Infrastructure[];
}

// buildLandingDetail — projection complète d'un Landing pour un panneau
// de détail (mandat PD.1 §3/§6). Retourne undefined si l'identifiant ne
// résout à aucun Landing réel — jamais un objet partiel fabriqué.
export function buildLandingDetail(state: ProductState, landingId: string): LandingDetailView | undefined {
  const landing = state.landings.find((item) => item.id === landingId);
  if (!landing) return undefined;

  const site = state.sites.find((item) => item.id === landing.siteId);
  const territory = site ? state.territories.find((item) => item.id === site.territoryId) : undefined;
  const trip = state.trips.find((item) => item.id === landing.tripId);
  const vessel = trip ? state.vessels.find((item) => item.id === trip.vesselId) : undefined;
  const captain = trip ? state.actors.find((item) => item.id === trip.captainId) : undefined;
  const speciesById = new Map(state.species.map((item): [string, Species] => [item.id, item]));
  const infrastructures = site ? state.infrastructures.filter((item) => item.siteId === site.id) : [];

  const catches: LandingCatchLineView[] = landing.catches.map((catchLine) => {
    const catchSpecies = speciesById.get(catchLine.speciesId);
    return {
      speciesId: catchLine.speciesId,
      speciesName: catchSpecies?.nameFr ?? catchLine.speciesId,
      speciesScientificName: catchSpecies?.scientificName,
      speciesLocalName: catchSpecies?.localNames[0],
      quantityKg: catchLine.quantityKg,
      quality: catchLine.quality,
      productForm: catchLine.productForm
    };
  });

  return { landing, site, territory, trip, vessel, captain, catches, infrastructures };
}

// recentLandingsForTerritory — les débarquements d'un territoire, du plus
// récent au plus ancien (mandat PD.1 §5, bloc "recent landings"). La date
// de tri est `weighedAt ?? arrivedAt` (la meilleure date réellement
// connue d'un débarquement) ; un Landing encore "attendu" (aucune des
// deux) n'a pas de date réelle et est classé après les autres plutôt que
// de se voir attribuer une date fabriquée — trié par id pour rester
// stable entre deux appels.
export function recentLandingsForTerritory(state: ProductState, territoryId: string, limit = 8): LandingDetailView[] {
  const siteIds = new Set(state.sites.filter((item) => item.territoryId === territoryId).map((item) => item.id));
  const landings = state.landings.filter((item) => siteIds.has(item.siteId));
  return sortLandingsByRecency(landings).slice(0, limit).map((item) => buildLandingDetail(state, item.id)!);
}

// recentLandingsForSite (PD.3, mandat §11 : "Territory → sites → site
// detail → recent landing activity", "these are two views over the SAME
// domain") — même tri, même fonction de détail que
// recentLandingsForTerritory ci-dessus, simplement filtré à un seul site
// plutôt qu'à tous les sites d'un territoire. Aucun second moteur de tri.
export function recentLandingsForSite(state: ProductState, siteId: string, limit = 8): LandingDetailView[] {
  const landings = state.landings.filter((item) => item.siteId === siteId);
  return sortLandingsByRecency(landings).slice(0, limit).map((item) => buildLandingDetail(state, item.id)!);
}

function sortLandingsByRecency(landings: Landing[]): Landing[] {
  return [...landings].sort((left, right) => {
    const leftAt = left.weighedAt ?? left.arrivedAt;
    const rightAt = right.weighedAt ?? right.arrivedAt;
    if (leftAt && rightAt) return rightAt.localeCompare(leftAt);
    if (leftAt) return -1;
    if (rightAt) return 1;
    return left.id.localeCompare(right.id);
  });
}

export interface SpeciesVolume {
  speciesId: string;
  speciesName: string;
  landedKg: number;
  landingCount: number;
}

export interface SiteVolume {
  siteId: string;
  siteName: string;
  siteType: Site["type"];
  landedKg: number;
  landingCount: number;
}

export interface VesselActivitySummary {
  vesselId: string;
  vesselName: string;
  registration: string;
  homeSiteId: string;
  tripCount: number;
  landingCount: number;
  landedKg: number;
}

export interface LandingTrendPoint {
  // Jour calendaire (YYYY-MM-DD) dérivé de weighedAt, à défaut arrivedAt
  // — mandat PD.1 §4 : "landing trend over available dates", jamais une
  // période fabriquée (semaine/mois) que les données ne couvrent pas
  // réellement. Un Landing sans l'une ou l'autre date (encore "attendu")
  // ne produit aucun point de tendance.
  date: string;
  landingCount: number;
  landedKg: number;
}

// LandingActivitySummary (PD.3, mandat §4/§11 : "these are two views over
// the SAME domain. Do not create duplicate data engines.") — le socle
// commun aux deux échelles d'agrégation (territoire, site) : tout ce qui
// ne dépend pas de "combien de sites différents ce périmètre contient"
// (volumeBySite n'a de sens qu'à l'échelle du territoire, cf.
// TerritoryLandingActivity ci-dessous).
export interface LandingActivitySummary {
  landingCount: number;
  totalLandedKg: number;
  volumeBySpecies: SpeciesVolume[]; // trié décroissant par landedKg
  dominantSpecies?: SpeciesVolume;
  vesselActivity: VesselActivitySummary[]; // trié décroissant par landedKg
  trend: LandingTrendPoint[]; // trié chronologiquement croissant
}

export interface TerritoryLandingActivity extends LandingActivitySummary {
  volumeBySite: SiteVolume[]; // trié décroissant par landedKg
}

function landingDate(landing: Landing): string | undefined {
  const at = landing.weighedAt ?? landing.arrivedAt;
  return at ? at.slice(0, 10) : undefined;
}

// aggregateLandingActivity — moteur unique des agrégations landing (PD.1
// §4, étendu PD.3 §11) : reçoit déjà la liste des Landing du périmètre
// (territoire entier ou un seul site) et produit exactement les mêmes
// projections des deux côtés. Somme sur TOUS les Landing reçus, quel que
// soit leur statut — même discipline que `landedKg`/`speciesCount` déjà
// exposés par buildTerritoryIntelligence plus haut (mandat PD.1 §6 : ne
// pas introduire un second jugement de filtrage concurrent) ; c'est
// Landing.trust/status, affiché tel quel à côté de chaque valeur, qui
// porte la fiabilité — jamais un filtrage silencieux qui laisserait
// croire à une couverture différente de celle des données.
function aggregateLandingActivity(state: ProductState, landings: Landing[]): LandingActivitySummary {
  const speciesById = new Map(state.species.map((item): [string, Species] => [item.id, item]));
  const tripById = new Map(state.trips.map((item): [string, FishingTrip] => [item.id, item]));
  const vesselById = new Map(state.vessels.map((item): [string, Vessel] => [item.id, item]));

  const landingCount = landings.length;
  const totalLandedKg = landings.reduce((sum, item) => sum + item.totalWeightKg, 0);

  const speciesAgg = new Map<string, { landedKg: number; landingIds: Set<string> }>();
  for (const landing of landings) {
    for (const catchLine of landing.catches) {
      const entry = speciesAgg.get(catchLine.speciesId) ?? { landedKg: 0, landingIds: new Set<string>() };
      entry.landedKg += catchLine.quantityKg;
      entry.landingIds.add(landing.id);
      speciesAgg.set(catchLine.speciesId, entry);
    }
  }
  const volumeBySpecies: SpeciesVolume[] = [...speciesAgg.entries()]
    .map(([speciesId, agg]) => ({
      speciesId,
      speciesName: speciesById.get(speciesId)?.nameFr ?? speciesId,
      landedKg: agg.landedKg,
      landingCount: agg.landingIds.size
    }))
    .sort((left, right) => right.landedKg - left.landedKg);
  const dominantSpecies = volumeBySpecies[0];

  const vesselAgg = new Map<string, { tripIds: Set<string>; landingCount: number; landedKg: number }>();
  for (const landing of landings) {
    const trip = tripById.get(landing.tripId);
    if (!trip) continue;
    const entry = vesselAgg.get(trip.vesselId) ?? { tripIds: new Set<string>(), landingCount: 0, landedKg: 0 };
    entry.tripIds.add(trip.id);
    entry.landingCount += 1;
    entry.landedKg += landing.totalWeightKg;
    vesselAgg.set(trip.vesselId, entry);
  }
  const vesselActivity: VesselActivitySummary[] = [...vesselAgg.entries()]
    .map(([vesselId, agg]) => {
      const vessel = vesselById.get(vesselId);
      return {
        vesselId,
        vesselName: vessel?.name ?? vesselId,
        registration: vessel?.registration ?? "",
        homeSiteId: vessel?.homeSiteId ?? "",
        tripCount: agg.tripIds.size,
        landingCount: agg.landingCount,
        landedKg: agg.landedKg
      };
    })
    .sort((left, right) => right.landedKg - left.landedKg);

  const trendAgg = new Map<string, { landingCount: number; landedKg: number }>();
  for (const landing of landings) {
    const date = landingDate(landing);
    if (!date) continue;
    const entry = trendAgg.get(date) ?? { landingCount: 0, landedKg: 0 };
    entry.landingCount += 1;
    entry.landedKg += landing.totalWeightKg;
    trendAgg.set(date, entry);
  }
  const trend: LandingTrendPoint[] = [...trendAgg.entries()]
    .map(([date, agg]) => ({ date, landingCount: agg.landingCount, landedKg: agg.landedKg }))
    .sort((left, right) => left.date.localeCompare(right.date));

  return { landingCount, totalLandedKg, volumeBySpecies, dominantSpecies, vesselActivity, trend };
}

// buildTerritoryLandingActivity — les sept projections déterministes
// demandées par le mandat PD.1 (§4).
export function buildTerritoryLandingActivity(state: ProductState, territoryId: string): TerritoryLandingActivity {
  const sites = state.sites.filter((item) => item.territoryId === territoryId);
  const siteById = new Map(sites.map((item): [string, Site] => [item.id, item]));
  const landings = state.landings.filter((item) => siteById.has(item.siteId));

  const siteAgg = new Map<string, { landedKg: number; landingCount: number }>();
  for (const landing of landings) {
    const entry = siteAgg.get(landing.siteId) ?? { landedKg: 0, landingCount: 0 };
    entry.landedKg += landing.totalWeightKg;
    entry.landingCount += 1;
    siteAgg.set(landing.siteId, entry);
  }
  const volumeBySite: SiteVolume[] = [...siteAgg.entries()]
    .map(([siteId, agg]) => {
      const site = siteById.get(siteId);
      return {
        siteId,
        siteName: site?.name ?? siteId,
        siteType: site?.type ?? "quai",
        landedKg: agg.landedKg,
        landingCount: agg.landingCount
      };
    })
    .sort((left, right) => right.landedKg - left.landedKg);

  return { ...aggregateLandingActivity(state, landings), volumeBySite };
}

// buildSiteLandingActivity (PD.3, mandat §11) — même moteur, filtré à un
// seul site plutôt qu'à tous les sites d'un territoire. Pas de
// volumeBySite ici : à l'échelle d'un seul site, cette répartition serait
// toujours un tableau à une seule entrée (le site lui-même) — un champ
// sans valeur informative que l'appelant n'a pas besoin de recevoir.
export function buildSiteLandingActivity(state: ProductState, siteId: string): LandingActivitySummary {
  const landings = state.landings.filter((item) => item.siteId === siteId);
  return aggregateLandingActivity(state, landings);
}

// --- Site Intelligence (PD.3, mandat "Product Dressing — Site &
// Infrastructure Intelligence") --------------------------------------
//
// But du lot (§1) : répondre à "quelle capacité existe sur ce site pour
// traiter cette activité ?" en connectant Landing Activity (PD.1) au Site
// et à son Infrastructure/Capacity réelles. Lecture seule, jamais
// persistée (§4 : "Read model only") — recalculée à chaque appel comme
// buildTerritoryIntelligence/buildLandingDetail.
//
// Discipline "pas de fausse saturation" (mandat §7) : cette projection ne
// compare JAMAIS un volume débarqué à une capacité déclarée pour en tirer
// une conclusion ("saturé", "en surcharge", "insuffisant") — chaque
// nombre reste affiché à côté de l'autre, jamais combiné en un ratio ou
// une alerte inventée ici. La seule alerte présente (`attention`
// ci-dessous) est celle que le moteur de règles déterministe
// (signal-crossing.ts) a déjà lui-même décidé de lever.

// SiteInfrastructureView — une Infrastructure du site, avec la Capacity
// réelle qui lui est reliée quand elle existe (mandat §6 : "distinguish
// theoretical capacity / available capacity / last known validity /
// infrastructure status — do not flatten these concepts"). `capacity`
// reste absent si aucun enregistrement de Capacity ne référence cette
// Infrastructure (mandat §16 : état honnête plutôt qu'inventé).
export interface SiteInfrastructureView {
  infrastructure: Infrastructure;
  organization?: Organization;
  capacity?: Capacity;
  // availability — TOUJOURS calculée par describeCapacityAvailability
  // (actor-network.ts, LOT 7), jamais réinterprétée ici : "valide"
  // (disponible ET fraîche), "aRevoir" (expirée ou non disponible),
  // "inconnue" (aucune Capacity reliée). Ni un score, ni une couleur de
  // saturation.
  availability: CapacityAvailability;
}

export interface SiteIntelligence {
  site: Site;
  territory?: Territory;
  // Activité de débarquement à ce site précis — même moteur que
  // buildTerritoryLandingActivity (mandat §11), pas un second calcul.
  activity: LandingActivitySummary;
  recentLandings: LandingDetailView[];
  infrastructures: SiteInfrastructureView[];
  // attention (mandat §8/§10, "CURRENT ATTENTION") — détections
  // déterministes RÉELLEMENT levées par signal-crossing.ts pour ce site
  // précis (infrastructure fragilisée sur site actif, fraîcheur de
  // capacité) : jamais recalculées ici, seulement filtrées à ce site. Ce
  // sont des détections du moteur de règles, pas des Finding enregistrés
  // par un humain — distinction gardée honnête côté affichage (mandat
  // §8 : "Domain engine decides. UI explains.").
  attention: SignalCrossingAlert[];
  // territorySituations (mandat §10) — les Situation réellement ouvertes
  // du TERRITOIRE (Situation n'a pas de siteId dans le domaine actuel,
  // cf. rapport PD.0 : lien territoire uniquement, jamais fabriqué au
  // niveau site). Exposé à part, jamais confondu avec `attention`
  // ci-dessus qui est, elle, réellement scopée au site.
  territorySituations: Situation[];
}

// buildSiteIntelligence — point d'entrée unique de ce lot. Retourne
// undefined si l'identifiant ne résout à aucun Site réel (mandat §16 :
// état honnête, jamais un objet partiel fabriqué).
export function buildSiteIntelligence(state: ProductState, siteId: string): SiteIntelligence | undefined {
  const site = state.sites.find((item) => item.id === siteId);
  if (!site) return undefined;

  const territory = state.territories.find((item) => item.id === site.territoryId);
  const activity = buildSiteLandingActivity(state, siteId);
  const recentLandings = recentLandingsForSite(state, siteId, 8);

  const siteInfrastructures = state.infrastructures.filter((item) => item.siteId === siteId);
  const capacityByInfrastructureId = new Map(state.capacities.map((item): [string, Capacity] => [item.infrastructureId, item]));
  const infrastructures: SiteInfrastructureView[] = siteInfrastructures.map((infrastructure) => {
    const capacity = capacityByInfrastructureId.get(infrastructure.id);
    const organization = state.organizations.find((item) => item.id === infrastructure.organizationId);
    return { infrastructure, organization, capacity, availability: describeCapacityAvailability(capacity) };
  });

  const infrastructureIds = new Set(siteInfrastructures.map((item) => item.id));
  const attention = [...detectImpairedInfrastructureAlerts(state), ...detectCapacityFreshnessGapAlerts(state)].filter((alert) =>
    alert.sourceRefs.some(
      (ref) => (ref.objectType === "site" && ref.objectId === siteId) || (ref.objectType === "infrastructure" && infrastructureIds.has(ref.objectId))
    )
  );

  const territorySituations = territory
    ? state.situations.filter((situation) => situation.territoryId === territory.id && situation.status !== "reglee")
    : [];

  return { site, territory, activity, recentLandings, infrastructures, attention, territorySituations };
}
