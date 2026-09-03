// projectStateForSession — P2.1-A, mandat "Intake Traceability & Data
// Access Foundation", Fondation B. Jusqu'ici GET /api/state (route.ts)
// renvoyait l'intégralité du ProductState à toute session authentifiée,
// quel que soit son rôle : Visibility (domain/types.ts) existe sur
// Situation depuis le pipeline de connaissance (LOT 0.2) mais n'était
// JAMAIS lue nulle part côté serveur — écrite à la création
// (knowledge-pipeline.ts), jamais appliquée à la lecture (audit P2.1-A,
// domaine gap "Data Access"). Cette fonction est désormais le seul point
// de filtrage serveur avant l'envoi au client (cf. app/api/state/route.ts).
//
// Volontairement PAS un moteur ABAC/RBAC générique (mandat §16, exclu
// explicitement) : une projection pure et dédiée, qui ne connaît qu'un
// seul objet — Situation, seul type de ProductState portant Visibility
// aujourd'hui (confirmé par grep exhaustif lors de l'audit P2.1-A) —
// réutilisant les concepts déjà existants (Role, Actor.organizationId,
// RELAY_ROLES de ./permissions) plutôt que d'inventer un nouveau modèle
// de permission de lecture. Étendre à d'autres objets (Signal, Finding,
// CollectiveNeed...) reste un futur lot explicite, jamais une
// extrapolation silencieuse ici — cf. "Dette laissée" dans le rapport de
// lot.
//
// Pas de "server-only" ici (contrairement à ./session, ./permissions n'en
// porte pas non plus) : fonction pure, testable directement via
// `node --test`, comme le reste du domaine — cf.
// tests/p21a-intake-traceability.test.ts.
//
// Doctrine — FAIL CLOSED (mandat §17) : "ne jamais considérer 'nous ne
// savons pas' comme 'tout le monde peut voir'". Une situation sans
// responsable résolu, ou dont l'organisation du responsable ne peut pas
// être déterminée, reste invisible aux rôles non transverses — sauf
// visibility === "publique", seul palier qui ne dépend d'aucune
// résolution d'organisation. Jamais l'inverse : une incertitude ne se
// résout jamais vers "visible".
import { RELAY_ROLES } from "./permissions";
import type {
  Actor,
  Communication,
  CoordinationSpace,
  Decision,
  Evidence,
  FieldMission,
  Finding,
  ImpactEvidence,
  Initiative,
  KnowledgeSourceRef,
  Learning,
  Observation,
  Organization,
  Outcome,
  ProductState,
  Result,
  Role,
  Situation
} from "@/domain/types";

// Rôles transverses (coordination, État, contrôle, arbitrage) : gardent
// la lecture complète déjà en vigueur avant ce lot. Réutilise RELAY_ROLES
// (poste de quai, coordination, supervision, déjà défini pour l'écriture
// "pour le compte de" — server/permissions.ts) plutôt que d'inventer une
// seconde catégorisation de rôles pour la lecture ; ajoute "institution"
// (Espace État — jamais un rôle de relais d'action, mais toujours un
// rôle de lecture transverse légitime, cf. EtatSidebar/InstitutionShell).
// Mandat §16 : ne jamais retirer un rôle de coordination/État/contrôle/
// arbitrage légitime de cette liste sans arbitrage explicite.
export const TRANSVERSE_READ_ROLES: Role[] = [...RELAY_ROLES, "institution"];

// Sous-ensemble de Session (server/session.ts) — délibérément un type
// local plutôt qu'un import de ./session : ce fichier reste ainsi
// indépendant de "next/headers" et testable sans aucune dépendance
// serveur, un objet Session réel (superset structurel) le satisfait sans
// conversion.
export interface ProjectionSession {
  actorId: string;
  role: Role;
}

function resolveOrganizationId(actors: Actor[], actorId: string | undefined): string | undefined {
  if (!actorId) return undefined;
  return actors.find((item) => item.id === actorId)?.organizationId;
}

// isSituationVisible — une règle par palier de Visibility, chacune
// fail-closed : l'absence d'information résout toujours vers "non
// visible", jamais vers "visible".
function isSituationVisible(
  situation: Situation,
  actors: Actor[],
  viewer: { organizationId: string | undefined; organization: Organization | undefined; role: Role }
): boolean {
  if (situation.visibility === "publique") return true;

  const responsibleOrganizationId = resolveOrganizationId(actors, situation.responsibleId);
  // Situation pas encore assignée (responsibleId absent) : aucune
  // organisation propriétaire connue → fail closed pour les deux paliers
  // restreints, quel que soit le rôle du lecteur.
  if (!responsibleOrganizationId) return false;

  if (responsibleOrganizationId === viewer.organizationId) return true;

  if (situation.visibility === "partenaires") {
    // "partenaires" reste plus large qu'"organisation", mais sans lien
    // structuré Situation ↔ organisation partenaire dans le modèle
    // aujourd'hui (audit P2.1-A) : seule extension défendable en restant
    // fail-closed — le rôle "partenaire" lui-même, et les organisations
    // déjà typées "partenaire" dans le modèle (Organization.type,
    // domain/types.ts), jamais une extrapolation par nom, territoire ou
    // proximité métier.
    if (viewer.role === "partenaire") return true;
    if (viewer.organization?.type === "partenaire") return true;
  }

  return false;
}

// ---------------------------------------------------------------------
// P2.1-A.1 — CASCADING DATA ACCESS HARDENING
// ---------------------------------------------------------------------
// Audit relationnel (avant toute modification) : quels objets de
// ProductState référencent une Situation, directement ou indirectement,
// et de quelle nature est cette relation.
//
//   Objet              Relation                              Catégorie
//   ------------------ ------------------------------------- ---------
//   Decision           situationId (obligatoire)              A directe, exclusive
//   Evidence           situationId? (un seul champ d'origine  A directe (si présente)
//                       à la fois en pratique parmi
//                       situationId/commitmentId/missionId/
//                       observationId/resultId/outcomeId/
//                       impactId)
//   CoordinationSpace   situationId? (ou opportunityId,        A directe (si présente),
//                       jamais les deux à la fois en           sinon C (accept_opportunity
//                       pratique)                              n'a aucun lien Situation)
//   Commitment          embarqué dans CoordinationSpace.       — pas un objet de premier
//                       commitments — aucun tableau            niveau : cascade avec son
//                       ProductState séparé                    CoordinationSpace parent
//   Communication       situationId? ET/OU commitmentId?       A directe, ou B via le
//                       (les deux peuvent coexister,           commitment d'un
//                       rules.ts confirmé)                     CoordinationSpace
//   FieldMission        situationId? (un knowledgeGapFindingId/A directe (si présente),
//                       findingId/collectiveNeedId indépendant sinon C (mission Knowledge
//                       reste possible sans Situation)          Gap pure)
//   Observation         missionId (obligatoire) — aucun        B via FieldMission.situationId
//                       situationId propre
//   Result              sourceRef.objectType "situation" |     A directe (si situation),
//                       "initiative" — exclusif, un seul        sinon C (source Initiative,
//                       des deux                                indépendante)
//   Outcome             sourceResultIds[] (fan, ≥1 exigé)      B via Result.sourceRef,
//                                                               jamais exclusif (peut
//                                                               cumuler des Result situation
//                                                               + initiative)
//   ImpactEvidence      outcomeId (obligatoire, exclusif)      B via Outcome
//   Finding             promotedToSituationId? (exclusif,      B directe mais optionnelle —
//                       1 Finding → au plus 1 Situation) ;      un Finding non promu reste
//                       sourceRefs[] peut aussi CITER une       une connaissance indépendante
//                       Situation parmi plusieurs sources       (mandat §8)
//   Learning            situationId? (une des 4 origines       A directe (si présente) ;
//                       possibles, non exclusives entre         sourceRefs[] peut aussi
//                       elles) ; sourceRefs[] peut citer         citer une Situation
//   Initiative          situationIds[] (fan, plusieurs          B non exclusive — un
//                       situations possibles, jamais la         Programme reste légitime
//                       seule raison d'exister de               même si l'une de ses
//                       l'Initiative)                           situations est masquée
//   CollectiveNeed      sourceRefs[] peut citer une Situation   B non exclusive (fan)
//   ProgramOpportunity  evidenceRefs[] peut citer une Situation B non exclusive (fan)
//   Signal              AUCUN champ ne référence Situation      C — seule Situation
//                       (seul le sens inverse existe :          connaît ses Signals
//                       Situation.signalIds)                    (documenté §14, non filtré)
//   ServiceRequest      aucune relation à Situation             C
//   Capacity/Opportunity aucune relation à Situation            C
//   Actor/Organization/ référentiels globaux, jamais propriété  C (préservés, mandat §9)
//   Territory           exclusive d'une Situation
//
// Principe de projection retenu (mandat §2/§3) : un objet dont la seule
// relation certaine et exclusive à une Situation masquée disparaît
// entièrement (son contenu — rationale/label/detail/subject/statement —
// documente très probablement cette Situation spécifiquement). Un objet
// dont la relation est un FAN (plusieurs sources possibles, dont
// certaines indépendantes de la Situation masquée) n'est jamais
// supprimé : seule la référence dangling est retirée (mandat §10,
// option 2), jamais l'objet entier — cf. Initiative.situationIds,
// Outcome.sourceResultIds, Finding/CollectiveNeed/ProgramOpportunity/
// Learning.sourceRefs.

// Retire d'un tableau de KnowledgeSourceRef toute entrée qui cite
// spécifiquement une Situation masquée — la seule action possible sur un
// fan de sources non exclusif (mandat §10 : "retirer proprement la
// référence si elle est optionnelle et que cela ne fabrique pas une
// nouvelle vérité") : l'objet qui la porte (Finding, CollectiveNeed,
// ProgramOpportunity, Learning) reste, ses autres sources restent, seul
// l'id de la Situation masquée cesse d'apparaître dans la réponse.
function stripHiddenSituationRefs(refs: KnowledgeSourceRef[], hiddenSituationIds: Set<string>): KnowledgeSourceRef[] {
  return refs.filter((ref) => !(ref.objectType === "situation" && hiddenSituationIds.has(ref.objectId)));
}

function projectDecisions(decisions: Decision[], visibleSituationIds: Set<string>): Decision[] {
  return decisions.filter((item) => visibleSituationIds.has(item.situationId));
}

// projectCoordinationSpaces — filtre les espaces réellement rattachés à
// une Situation masquée (situationId présent et non visible) ; laisse
// intacts ceux nés d'un accept_opportunity (opportunityId seul, aucun
// lien Situation — mandat §2, exemple explicite "ne pas supprimer un
// objet légitimement partagé"). Retourne aussi l'ensemble des ids de
// Commitment survivants (embarqués, jamais un tableau ProductState
// séparé) pour que Communication puisse s'en servir plus bas.
function projectCoordinationSpaces(
  spaces: CoordinationSpace[],
  visibleSituationIds: Set<string>
): { spaces: CoordinationSpace[]; survivingCommitmentIds: Set<string> } {
  const survivors = spaces.filter((item) => !item.situationId || visibleSituationIds.has(item.situationId));
  const survivingCommitmentIds = new Set(survivors.flatMap((space) => space.commitments.map((commitment) => commitment.id)));
  return { spaces: survivors, survivingCommitmentIds };
}

function projectFieldMissions(missions: FieldMission[], visibleSituationIds: Set<string>): { missions: FieldMission[]; survivingIds: Set<string> } {
  const survivors = missions.filter((item) => !item.situationId || visibleSituationIds.has(item.situationId));
  return { missions: survivors, survivingIds: new Set(survivors.map((item) => item.id)) };
}

function projectObservations(observations: Observation[], survivingFieldMissionIds: Set<string>): { observations: Observation[]; survivingIds: Set<string> } {
  const survivors = observations.filter((item) => survivingFieldMissionIds.has(item.missionId));
  return { observations: survivors, survivingIds: new Set(survivors.map((item) => item.id)) };
}

function projectResults(results: Result[], visibleSituationIds: Set<string>): { results: Result[]; survivingIds: Set<string> } {
  const survivors = results.filter((item) => item.sourceRef.objectType !== "situation" || visibleSituationIds.has(item.sourceRef.objectId));
  return { results: survivors, survivingIds: new Set(survivors.map((item) => item.id)) };
}

// projectOutcomes — Outcome exige toujours ≥1 Result source (invariant
// du domaine, mandat §7 "Result → Outcome → ImpactEvidence" à ne jamais
// laisser reconstituer une Situation masquée) : les ids de Result
// masqués sont retirés de sourceResultIds (référence dangling, §10) ;
// si plus aucun Result visible ne subsiste, l'Outcome entier disparaît —
// ce n'est plus seulement une question de confidentialité mais le même
// invariant qui empêchait déjà un Outcome sans source à la création.
function projectOutcomes(outcomes: Outcome[], survivingResultIds: Set<string>): { outcomes: Outcome[]; survivingIds: Set<string> } {
  const survivors: Outcome[] = [];
  for (const outcome of outcomes) {
    const sourceResultIds = outcome.sourceResultIds.filter((id) => survivingResultIds.has(id));
    if (sourceResultIds.length === 0) continue;
    survivors.push(sourceResultIds.length === outcome.sourceResultIds.length ? outcome : { ...outcome, sourceResultIds });
  }
  return { outcomes: survivors, survivingIds: new Set(survivors.map((item) => item.id)) };
}

function projectImpactEvidences(impacts: ImpactEvidence[], survivingOutcomeIds: Set<string>): ImpactEvidence[] {
  return impacts.filter((item) => survivingOutcomeIds.has(item.outcomeId));
}

// projectEvidences — une Evidence ne porte jamais plus d'une origine à
// la fois en pratique (situationId/commitmentId/missionId/
// observationId/resultId/outcomeId/impactId — cf. types.ts), sauf le
// couple missionId+observationId d'une observation terrain (les deux
// désignent la même mission, jamais contradictoires) : chaque champ
// présent doit pointer vers un objet survivant, sinon l'Evidence
// disparaît (son label/detail documentent very probablement l'origine
// masquée).
function projectEvidences(
  evidences: Evidence[],
  ctx: {
    visibleSituationIds: Set<string>;
    survivingCommitmentIds: Set<string>;
    survivingFieldMissionIds: Set<string>;
    survivingObservationIds: Set<string>;
    survivingResultIds: Set<string>;
    survivingOutcomeIds: Set<string>;
    survivingImpactIds: Set<string>;
  }
): Evidence[] {
  return evidences.filter((item) => {
    if (item.situationId && !ctx.visibleSituationIds.has(item.situationId)) return false;
    if (item.commitmentId && !ctx.survivingCommitmentIds.has(item.commitmentId)) return false;
    if (item.missionId && !ctx.survivingFieldMissionIds.has(item.missionId)) return false;
    if (item.observationId && !ctx.survivingObservationIds.has(item.observationId)) return false;
    if (item.resultId && !ctx.survivingResultIds.has(item.resultId)) return false;
    if (item.outcomeId && !ctx.survivingOutcomeIds.has(item.outcomeId)) return false;
    if (item.impactId && !ctx.survivingImpactIds.has(item.impactId)) return false;
    return true;
  });
}

// projectCommunications — contenu-bearing (subject/body) comme Decision/
// Evidence : filtrée entièrement plutôt qu'un champ retiré (mandat §6 :
// "un engagement privé ne doit pas révéler le problème/l'acteur/le
// texte/l'échéance").
function projectCommunications(communications: Communication[], visibleSituationIds: Set<string>, survivingCommitmentIds: Set<string>): Communication[] {
  return communications.filter((item) => {
    if (item.situationId && !visibleSituationIds.has(item.situationId)) return false;
    if (item.commitmentId && !survivingCommitmentIds.has(item.commitmentId)) return false;
    return true;
  });
}

// projectFindings — promotedToSituationId est la seule relation
// EXCLUSIVE et CERTAINE de Finding vers Situation (mandat §8) : un
// Finding promu vers une Situation masquée en a très probablement le
// même titre/statement (promote_finding_to_situation les copie,
// knowledge-pipeline.ts) — filtré entièrement. Un Finding non promu
// reste une connaissance indépendante, jamais masqué par supposition
// (mandat §8, explicite). sourceRefs[] (citation non exclusive) est
// nettoyé sur les survivants — mandat §10/§11.I.
function projectFindings(findings: Finding[], visibleSituationIds: Set<string>, hiddenSituationIds: Set<string>): Finding[] {
  return findings
    .filter((item) => !item.promotedToSituationId || visibleSituationIds.has(item.promotedToSituationId))
    .map((item) => (item.sourceRefs.some((ref) => ref.objectType === "situation") ? { ...item, sourceRefs: stripHiddenSituationRefs(item.sourceRefs, hiddenSituationIds) } : item));
}

// projectLearnings — situationId est une origine directe et
// content-bearing (title/summary/context) — même traitement que
// Decision/Evidence/Communication, filtré entièrement si masqué.
// sourceRefs[] (citation, non exclusive) nettoyé sur les survivants.
function projectLearnings(learnings: Learning[], visibleSituationIds: Set<string>, hiddenSituationIds: Set<string>): Learning[] {
  return learnings
    .filter((item) => !item.situationId || visibleSituationIds.has(item.situationId))
    .map((item) => (item.sourceRefs?.some((ref) => ref.objectType === "situation") ? { ...item, sourceRefs: stripHiddenSituationRefs(item.sourceRefs, hiddenSituationIds) } : item));
}

// projectInitiatives — situationIds est un fan non exclusif (mandat §2 :
// "ne pas supprimer un objet légitimement partagé simplement parce qu'il
// participe aussi à une Situation masquée") : l'Initiative (le Programme)
// reste toujours, seuls les ids de Situation masqués sont retirés du
// tableau (référence dangling, §10) — jamais un id de Situation masquée
// exposé dans la réponse.
function projectInitiatives(initiatives: Initiative[], hiddenSituationIds: Set<string>): Initiative[] {
  if (hiddenSituationIds.size === 0) return initiatives;
  return initiatives.map((item) => {
    if (!item.situationIds.some((id) => hiddenSituationIds.has(id))) return item;
    return { ...item, situationIds: item.situationIds.filter((id) => !hiddenSituationIds.has(id)) };
  });
}

// projectStateForSession — point d'entrée unique. Rôles transverses :
// état complet, comportement inchangé (§7 du mandat P2.1-A initial,
// reconfirmé ici). Autres rôles : state.situations filtré comme avant
// (P2.1-A), PUIS chaque objet dépendant projeté à partir du vrai graphe
// relationnel ci-dessus — jamais un moteur ABAC/RBAC générique, jamais
// une extrapolation au-delà des relations réellement présentes dans le
// modèle. ServiceRequest/Capacity/Opportunity/Signal/CollectiveNeed
// (hors sourceRefs)/ProgramOpportunity (hors evidenceRefs)/
// Actors/Organizations/Territories restent non filtrés — catégorie C ou
// fan non exclusif, documenté ci-dessus, pas un oubli.
export function projectStateForSession(state: ProductState, session: ProjectionSession): ProductState {
  if (TRANSVERSE_READ_ROLES.includes(session.role)) return state;

  const viewerOrganizationId = resolveOrganizationId(state.actors, session.actorId);
  const viewerOrganization = state.organizations.find((item) => item.id === viewerOrganizationId);
  const viewer = { organizationId: viewerOrganizationId, organization: viewerOrganization, role: session.role };

  const situations = state.situations.filter((situation) => isSituationVisible(situation, state.actors, viewer));
  const visibleSituationIds = new Set(situations.map((item) => item.id));
  const hiddenSituationIds = new Set(state.situations.filter((item) => !visibleSituationIds.has(item.id)).map((item) => item.id));

  const decisions = projectDecisions(state.decisions, visibleSituationIds);
  const { spaces: coordinationSpaces, survivingCommitmentIds } = projectCoordinationSpaces(state.coordinationSpaces, visibleSituationIds);
  const { missions: fieldMissions, survivingIds: survivingFieldMissionIds } = projectFieldMissions(state.fieldMissions, visibleSituationIds);
  const { observations, survivingIds: survivingObservationIds } = projectObservations(state.observations, survivingFieldMissionIds);
  const { results, survivingIds: survivingResultIds } = projectResults(state.results, visibleSituationIds);
  const { outcomes, survivingIds: survivingOutcomeIds } = projectOutcomes(state.outcomes, survivingResultIds);
  const impactEvidences = projectImpactEvidences(state.impactEvidences, survivingOutcomeIds);
  const survivingImpactIds = new Set(impactEvidences.map((item) => item.id));
  const evidences = projectEvidences(state.evidences, {
    visibleSituationIds,
    survivingCommitmentIds,
    survivingFieldMissionIds,
    survivingObservationIds,
    survivingResultIds,
    survivingOutcomeIds,
    survivingImpactIds
  });
  const communications = projectCommunications(state.communications, visibleSituationIds, survivingCommitmentIds);
  const findings = projectFindings(state.findings, visibleSituationIds, hiddenSituationIds);
  const learnings = projectLearnings(state.learnings, visibleSituationIds, hiddenSituationIds);
  const initiatives = projectInitiatives(state.initiatives, hiddenSituationIds);
  const collectiveNeeds = hiddenSituationIds.size === 0
    ? state.collectiveNeeds
    : state.collectiveNeeds.map((item) =>
        item.sourceRefs.some((ref) => ref.objectType === "situation") ? { ...item, sourceRefs: stripHiddenSituationRefs(item.sourceRefs, hiddenSituationIds) } : item
      );
  const programOpportunities = hiddenSituationIds.size === 0
    ? state.programOpportunities
    : state.programOpportunities.map((item) =>
        item.evidenceRefs.some((ref) => ref.objectType === "situation") ? { ...item, evidenceRefs: stripHiddenSituationRefs(item.evidenceRefs, hiddenSituationIds) } : item
      );

  return {
    ...state,
    situations,
    decisions,
    coordinationSpaces,
    fieldMissions,
    observations,
    results,
    outcomes,
    impactEvidences,
    evidences,
    communications,
    findings,
    learnings,
    initiatives,
    collectiveNeeds,
    programOpportunities
  };
}
