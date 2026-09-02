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
  CollectiveNeed,
  CoordinationSpace,
  Finding,
  FieldMission,
  Infrastructure,
  Initiative,
  Landing,
  Learning,
  Observation,
  Organization,
  ProductState,
  ProgramOpportunity,
  Result,
  Outcome,
  ServiceRequest,
  Signal,
  Site,
  Situation,
  Territory
} from "./types";

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
    learnings
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
