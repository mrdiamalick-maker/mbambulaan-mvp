import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { projectStateForSession } from "../src/server/access-projection";
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
  CollectiveNeed,
  Learning,
  Observation,
  Organization,
  Outcome,
  ProductState,
  ProgramOpportunity,
  Result,
  ServiceRequest,
  Situation
} from "../src/domain/types";

// P2.1-A.1 — "Cascading Data Access Hardening". Vérifie qu'une Situation
// masquée par projectStateForSession (P2.1-A) ne peut plus être
// reconstituée à travers ses objets dépendants (Decision, Evidence,
// Communication, CoordinationSpace/Commitment, FieldMission →
// Observation, Result → Outcome → ImpactEvidence, Finding, Learning),
// tout en préservant les objets légitimement partagés (Initiative avec
// une autre situation visible, CoordinationSpace d'accept_opportunity
// sans lien Situation, Finding non promu, référentiels globaux).

function makeCascadeFixture() {
  const base = createDemoState();

  const orgA: Organization = { id: "org-cascade-a", name: "Organisation A (cascade)", type: "entreprise" };
  const orgB: Organization = { id: "org-cascade-b", name: "Organisation B (cascade)", type: "entreprise" };
  const viewerA: Actor = { id: "act-cascade-viewer-a", name: "Lecteur A", role: "mareyeur", organizationId: orgA.id, territoryIds: ["joal"], phone: "770000010", verified: true };
  const responsibleB: Actor = { id: "act-cascade-responsible-b", name: "Responsable B", role: "operateur", organizationId: orgB.id, territoryIds: ["joal"], phone: "770000011", verified: true };

  // La situation privée d'org B — jamais visible pour le lecteur A.
  const hiddenSituation: Situation = {
    id: "sit-cascade-hidden", reference: "MBA-SIT-CASCADEH", signalIds: [], territoryId: "joal",
    title: "SECRET-CASCADE — dossier confidentiel org B", description: "Contenu jamais révélable au lecteur A.",
    status: "coordination", priority: "critique", trust: "declaree", visibility: "organisation",
    responsibleId: responsibleB.id, nextStep: "Suivre", history: []
  };
  // Situation publique de contrôle — doit rester visible, et tout objet
  // qui s'y rattache légitimement aussi (groupe témoin, mandat §12).
  const visibleSituation: Situation = {
    id: "sit-cascade-visible", reference: "MBA-SIT-CASCADEV", signalIds: [], territoryId: "joal",
    title: "Situation publique de contrôle", description: "Doit rester visible.",
    status: "coordination", priority: "moyenne", trust: "declaree", visibility: "publique",
    responsibleId: responsibleB.id, nextStep: "Suivre", history: []
  };

  // --- Objets dépendants de la situation MASQUÉE (doivent disparaître) ---
  const hiddenDecision: Decision = {
    id: "dec-cascade-hidden", situationId: hiddenSituation.id, type: "informer",
    rationale: "SECRET-CASCADE — justification confidentielle", decidedByActorId: responsibleB.id, decidedAt: new Date().toISOString()
  };
  const hiddenCoordination: CoordinationSpace = {
    id: "coord-cascade-hidden", situationId: hiddenSituation.id, opportunityId: undefined,
    title: "SECRET-CASCADE — coordination privée", participantIds: [responsibleB.id], objective: "Objectif confidentiel",
    decision: "Décision confidentielle", commitments: [{ id: "eng-cascade-hidden", actorId: responsibleB.id, label: "SECRET-CASCADE — engagement", dueAt: new Date().toISOString(), status: "a_faire" }],
    risks: [], nextReviewAt: new Date().toISOString()
  };
  const hiddenEvidenceDirect: Evidence = {
    id: "ev-cascade-hidden-direct", situationId: hiddenSituation.id, type: "confirmation",
    label: "SECRET-CASCADE — preuve directe", detail: "Détail confidentiel", recordedByActorId: responsibleB.id, recordedAt: new Date().toISOString(), trust: "declaree"
  };
  const hiddenCommunicationDirect: Communication = {
    id: "com-cascade-hidden-direct", channel: "telephone", status: "envoye", actorId: responsibleB.id, situationId: hiddenSituation.id,
    subject: "SECRET-CASCADE — objet", body: "SECRET-CASCADE — contenu", simulated: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  // Communication reliée UNIQUEMENT via commitmentId (aucun situationId
  // propre) — doit disparaître via le CoordinationSpace masqué, pas via
  // une règle directe sur Situation (mandat §6/§10).
  const hiddenCommunicationViaCommitment: Communication = {
    id: "com-cascade-hidden-commitment", channel: "whatsapp", status: "envoye", actorId: responsibleB.id, commitmentId: "eng-cascade-hidden",
    subject: "SECRET-CASCADE — via engagement", body: "SECRET-CASCADE — contenu via engagement", simulated: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  const hiddenMission: FieldMission = {
    id: "mission-cascade-hidden", title: "SECRET-CASCADE — mission", objective: "Vérifier discrètement", territoryIds: ["joal"],
    reason: "SECRET-CASCADE — raison", status: "realisee", signalCategory: "securite", observationPoints: ["axe 1"],
    situationId: hiddenSituation.id, createdAt: new Date().toISOString(), createdByActorId: responsibleB.id, history: []
  };
  const hiddenObservation: Observation = {
    id: "obsv-cascade-hidden", missionId: hiddenMission.id, territoryId: "joal", authorActorId: responsibleB.id,
    createdAt: new Date().toISOString(), content: "SECRET-CASCADE — constat terrain", nature: "confirme", trust: "declaree", signalId: "obs-cascade-signal-unused"
  };
  const hiddenEvidenceViaMission: Evidence = {
    id: "ev-cascade-hidden-mission", missionId: hiddenMission.id, observationId: hiddenObservation.id, type: "photo",
    label: "SECRET-CASCADE — preuve mission", detail: "Détail confidentiel mission", recordedByActorId: responsibleB.id, recordedAt: new Date().toISOString(), trust: "declaree"
  };
  const hiddenResult: Result = {
    id: "result-cascade-hidden", title: "SECRET-CASCADE — résultat", description: "Description confidentielle",
    sourceRef: { objectType: "situation", objectId: hiddenSituation.id }, territoryIds: ["joal"],
    recordedAt: new Date().toISOString(), recordedByActorId: responsibleB.id, evidenceRefs: [], trust: "declaree"
  };
  const hiddenOutcome: Outcome = {
    id: "outcome-cascade-hidden", title: "SECRET-CASCADE — changement observé", statement: "Changement confidentiel",
    territoryIds: ["joal"], sourceResultIds: [hiddenResult.id], observedAt: new Date().toISOString(), evidenceRefs: [],
    trust: "declaree", attribution: "directe", attributionJustification: "Justification confidentielle", createdByActorId: responsibleB.id, createdAt: new Date().toISOString()
  };
  const hiddenImpact: ImpactEvidence = {
    id: "impact-cascade-hidden", title: "SECRET-CASCADE — impact", statement: "Effet confidentiel", outcomeId: hiddenOutcome.id,
    territoryIds: ["joal"], attribution: "directe", attributionJustification: "Justification confidentielle", status: "documente",
    evidenceRefs: [], createdByActorId: responsibleB.id, createdAt: new Date().toISOString()
  };
  const hiddenFinding: Finding = {
    id: "finding-cascade-hidden", type: "recurrence", title: "SECRET-CASCADE — constat", statement: "SECRET-CASCADE — affirmation confidentielle",
    territoryIds: ["joal"], sourceRefs: [], explanation: "Explication confidentielle", trust: "declaree", status: "confirmed",
    provenance: "human", nextStep: "Suivre", createdAt: new Date().toISOString(), promotedToSituationId: hiddenSituation.id
  };
  const hiddenLearning: Learning = {
    id: "learn-cascade-hidden", situationId: hiddenSituation.id, title: "SECRET-CASCADE — apprentissage", summary: "Résumé confidentiel", reusableIn: []
  };

  // Finding citant la situation masquée comme UNE de plusieurs sources
  // (fan non exclusif) : le Finding lui-même reste (connaissance
  // indépendante, mandat §8), seule l'entrée sourceRefs pointant vers la
  // situation masquée doit disparaître.
  const citingFinding: Finding = {
    id: "finding-cascade-citing", type: "corroboration_gap", title: "Constat public citant plusieurs sources",
    statement: "Affirmation publique, indépendante du contenu de la situation masquée.", territoryIds: ["joal"],
    sourceRefs: [{ objectType: "situation", objectId: hiddenSituation.id }, { objectType: "signal", objectId: "obs-glace" }],
    explanation: "Explication publique.", trust: "declaree", status: "confirmed", provenance: "human", nextStep: "Suivre", createdAt: new Date().toISOString()
  };
  const citingCollectiveNeed: CollectiveNeed = {
    id: "need-cascade-citing", title: "Besoin collectif public", territoryIds: ["joal"], affectedPopulation: "Filière locale",
    sourceRefs: [{ objectType: "situation", objectId: hiddenSituation.id }], consequences: [], hypotheses: [], knowledgeGaps: [],
    status: "emerging", createdAt: new Date().toISOString(), history: []
  };
  const citingProgramOpportunity: ProgramOpportunity = {
    id: "prog-cascade-citing", collectiveNeedId: citingCollectiveNeed.id, problem: "Problème public", justification: "Justification publique",
    territoryIds: ["joal"], potentialBeneficiaries: "Filière locale", evidenceRefs: [{ objectType: "situation", objectId: hiddenSituation.id }],
    hypotheses: [], knowledgeGaps: [], possibleInterventions: [], desiredOutcomes: [], possibleIndicators: [], maturity: "faible",
    status: "detected", createdAt: new Date().toISOString(), history: []
  };

  // --- Groupe témoin : objets légitimement partagés (ne doivent PAS disparaître) ---
  const visibleDecision: Decision = {
    id: "dec-cascade-visible", situationId: visibleSituation.id, type: "informer", rationale: "Décision publique",
    decidedByActorId: responsibleB.id, decidedAt: new Date().toISOString()
  };
  // CoordinationSpace né d'un accept_opportunity : opportunityId seul,
  // aucun lien Situation (mandat §2, exemple explicite) — doit rester.
  const opportunityCoordination: CoordinationSpace = {
    id: "coord-cascade-opportunity", opportunityId: "opp-cascade-unrelated", title: "Mise en relation qualifiée",
    participantIds: [viewerA.id], objective: "Orienter un lot", decision: "Conditions acceptées",
    commitments: [{ id: "eng-cascade-opportunity", actorId: viewerA.id, label: "Organiser la collecte", dueAt: new Date().toISOString(), status: "a_faire" }],
    risks: [], nextReviewAt: new Date().toISOString()
  };
  // FieldMission Knowledge Gap pur : aucun situationId (mandat §1, "ne
  // pas supposer que tous doivent être filtrés") — doit rester.
  const knowledgeGapMission: FieldMission = {
    id: "mission-cascade-knowledge-gap", title: "Mission Knowledge Gap", objective: "Vérifier un knowledge gap", territoryIds: ["joal"],
    reason: "Knowledge gap identifié", status: "planifiee", signalCategory: "production", observationPoints: ["axe 1"],
    knowledgeGapFindingId: "finding-cascade-citing", createdAt: new Date().toISOString(), createdByActorId: viewerA.id, history: []
  };
  const serviceRequestUnrelated: ServiceRequest = {
    id: "sr-cascade-unrelated", reference: "MBA-SR-CASCADE", channel: "web", actorId: viewerA.id, territoryId: "joal",
    speciesId: "sardinelle", quantityKg: 100, quality: "A", intent: "achat", status: "ouvert", priority: "moyenne",
    createdAt: new Date().toISOString(), source: "Espace public"
  };
  // Initiative reliée à la fois à la situation masquée ET à la situation
  // visible (fan non exclusif, mandat §2/§10) : doit rester, mais son
  // situationIds ne doit plus jamais citer la situation masquée.
  const sharedInitiative: Initiative = {
    id: "init-cascade-shared", title: "Programme partagé", territoryIds: ["joal"], situationIds: [hiddenSituation.id, visibleSituation.id],
    objective: "Objectif public", status: "execution", ownerId: responsibleB.id, budgetStatus: "a_estimer", funding: [], indicators: []
  };

  const state: ProductState = {
    ...base,
    organizations: [...base.organizations, orgA, orgB],
    actors: [...base.actors, viewerA, responsibleB],
    situations: [hiddenSituation, visibleSituation],
    decisions: [hiddenDecision, visibleDecision],
    coordinationSpaces: [hiddenCoordination, opportunityCoordination],
    evidences: [hiddenEvidenceDirect, hiddenEvidenceViaMission],
    communications: [hiddenCommunicationDirect, hiddenCommunicationViaCommitment],
    fieldMissions: [hiddenMission, knowledgeGapMission],
    observations: [hiddenObservation],
    results: [hiddenResult],
    outcomes: [hiddenOutcome],
    impactEvidences: [hiddenImpact],
    findings: [hiddenFinding, citingFinding],
    learnings: [hiddenLearning],
    collectiveNeeds: [citingCollectiveNeed],
    programOpportunities: [citingProgramOpportunity],
    initiatives: [sharedInitiative],
    serviceRequests: [serviceRequestUnrelated]
  };

  return {
    state, viewerA, responsibleB, orgA, orgB, hiddenSituation, visibleSituation,
    hiddenDecision, hiddenCoordination, hiddenEvidenceDirect, hiddenEvidenceViaMission,
    hiddenCommunicationDirect, hiddenCommunicationViaCommitment, hiddenMission, hiddenObservation,
    hiddenResult, hiddenOutcome, hiddenImpact, hiddenFinding, hiddenLearning,
    citingFinding, citingCollectiveNeed, citingProgramOpportunity,
    visibleDecision, opportunityCoordination, knowledgeGapMission, serviceRequestUnrelated, sharedInitiative
  };
}

// TEST A — org-A ne voit pas la Situation privée org-B (déjà couvert par
// P2.1-A, reconfirmé ici comme point de départ du graphe).
test("TEST A — org-A ne voit pas la Situation privée org-B", () => {
  const { state, viewerA, hiddenSituation } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(!projected.situations.some((item) => item.id === hiddenSituation.id));
});

// TEST B — Decision de cette Situation invisible pour org-A.
test("TEST B — org-A ne voit pas la Decision de la Situation masquée", () => {
  const { state, viewerA, hiddenDecision, visibleDecision } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(!projected.decisions.some((item) => item.id === hiddenDecision.id));
  assert.ok(projected.decisions.some((item) => item.id === visibleDecision.id), "la décision de la situation publique doit rester");
});

// TEST C — Evidence de cette Situation invisible, y compris via la
// chaîne FieldMission → Observation.
test("TEST C — org-A ne voit pas l'Evidence de la Situation masquée (directe et via mission)", () => {
  const { state, viewerA, hiddenEvidenceDirect, hiddenEvidenceViaMission } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(!projected.evidences.some((item) => item.id === hiddenEvidenceDirect.id));
  assert.ok(!projected.evidences.some((item) => item.id === hiddenEvidenceViaMission.id));
});

// TEST D — Communication de cette Situation invisible, directe ET via un
// commitmentId dont le CoordinationSpace parent est masqué.
test("TEST D — org-A ne voit pas la Communication de la Situation masquée (directe et via commitment)", () => {
  const { state, viewerA, hiddenCommunicationDirect, hiddenCommunicationViaCommitment } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(!projected.communications.some((item) => item.id === hiddenCommunicationDirect.id));
  assert.ok(!projected.communications.some((item) => item.id === hiddenCommunicationViaCommitment.id));
});

// TEST E — CoordinationSpace/Commitment privé lié invisible ; FieldMission/
// Observation de la mission liée à la Situation masquée invisibles aussi.
test("TEST E — org-A ne voit pas le CoordinationSpace/Commitment ni la FieldMission/Observation liés", () => {
  const { state, viewerA, hiddenCoordination, hiddenMission, hiddenObservation } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(!projected.coordinationSpaces.some((item) => item.id === hiddenCoordination.id));
  assert.ok(!projected.fieldMissions.some((item) => item.id === hiddenMission.id));
  assert.ok(!projected.observations.some((item) => item.id === hiddenObservation.id));
});

// Chaîne Result → Outcome → ImpactEvidence (mandat §7) — aucun des trois
// ne doit permettre de reconstituer la Situation masquée.
test("Result → Outcome → ImpactEvidence : la chaîne complète disparaît pour org-A", () => {
  const { state, viewerA, hiddenResult, hiddenOutcome, hiddenImpact } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(!projected.results.some((item) => item.id === hiddenResult.id));
  assert.ok(!projected.outcomes.some((item) => item.id === hiddenOutcome.id));
  assert.ok(!projected.impactEvidences.some((item) => item.id === hiddenImpact.id));
});

// Finding/Learning liés exclusivement à la Situation masquée disparaissent.
test("Finding.promotedToSituationId et Learning.situationId masqués disparaissent", () => {
  const { state, viewerA, hiddenFinding, hiddenLearning } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(!projected.findings.some((item) => item.id === hiddenFinding.id));
  assert.ok(!projected.learnings.some((item) => item.id === hiddenLearning.id));
});

// TEST F — un objet global partagé (Actor/Organization/Territory) reste
// visible même s'il est impliqué dans une Situation privée.
test("TEST F — Actor/Organization/Territory globaux restent visibles malgré leur implication dans la Situation masquée", () => {
  const { state, viewerA, responsibleB, orgB } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(projected.actors.some((item) => item.id === responsibleB.id), "le responsable de la situation masquée reste un référentiel Actor global");
  assert.ok(projected.organizations.some((item) => item.id === orgB.id), "l'organisation B reste un référentiel global");
  assert.ok(projected.territories.some((item) => item.id === "joal"));
});

// Groupe témoin — objets légitimement partagés qui ne doivent jamais
// disparaître à cause d'une relation FAN non exclusive.
test("Groupe témoin — CoordinationSpace d'accept_opportunity, FieldMission Knowledge Gap, ServiceRequest et Finding non promu restent visibles", () => {
  const { state, viewerA, opportunityCoordination, knowledgeGapMission, serviceRequestUnrelated, citingFinding } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  assert.ok(projected.coordinationSpaces.some((item) => item.id === opportunityCoordination.id));
  assert.ok(projected.fieldMissions.some((item) => item.id === knowledgeGapMission.id));
  assert.ok(projected.serviceRequests.some((item) => item.id === serviceRequestUnrelated.id));
  assert.ok(projected.findings.some((item) => item.id === citingFinding.id), "un Finding non promu reste une connaissance indépendante (mandat §8)");
});

// TEST H — reference integrity : Initiative partagée entre situation
// masquée et situation visible reste présente, mais son situationIds ne
// cite plus jamais l'id masqué (référence retirée proprement, §10).
test("TEST H — reference integrity : Initiative partagée survit, l'id de la Situation masquée est retiré de situationIds", () => {
  const { state, viewerA, sharedInitiative, hiddenSituation, visibleSituation } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  const initiative = projected.initiatives.find((item) => item.id === sharedInitiative.id);
  assert.ok(initiative, "l'Initiative doit rester (au moins une situation liée reste visible)");
  assert.ok(!initiative!.situationIds.includes(hiddenSituation.id));
  assert.ok(initiative!.situationIds.includes(visibleSituation.id));
});

// Reference integrity — Finding/CollectiveNeed/ProgramOpportunity citant
// la situation masquée dans un fan de sourceRefs : l'objet reste, l'id
// masqué disparaît de sourceRefs/evidenceRefs.
test("Reference integrity — sourceRefs/evidenceRefs citant la Situation masquée sont nettoyés, l'objet reste", () => {
  const { state, viewerA, citingFinding, citingCollectiveNeed, citingProgramOpportunity, hiddenSituation } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });

  const finding = projected.findings.find((item) => item.id === citingFinding.id)!;
  assert.ok(!finding.sourceRefs.some((ref) => ref.objectType === "situation" && ref.objectId === hiddenSituation.id));
  assert.ok(finding.sourceRefs.some((ref) => ref.objectType === "signal"), "les autres sources légitimes restent");

  const need = projected.collectiveNeeds.find((item) => item.id === citingCollectiveNeed.id)!;
  assert.ok(!need.sourceRefs.some((ref) => ref.objectType === "situation" && ref.objectId === hiddenSituation.id));

  const program = projected.programOpportunities.find((item) => item.id === citingProgramOpportunity.id)!;
  assert.ok(!program.evidenceRefs.some((ref) => ref.objectType === "situation" && ref.objectId === hiddenSituation.id));
});

// TEST G — rôles transverses conservent l'état complet attendu (aucune
// régression de la cascade sur le comportement déjà garanti par P2.1-A).
test("TEST G — un rôle transverse (coordinateur) conserve l'intégralité de la cascade", () => {
  const { state } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: "act-coordinateur", role: "coordinateur" });
  assert.equal(projected.situations.length, state.situations.length);
  assert.equal(projected.decisions.length, state.decisions.length);
  assert.equal(projected.evidences.length, state.evidences.length);
  assert.equal(projected.communications.length, state.communications.length);
  assert.equal(projected.coordinationSpaces.length, state.coordinationSpaces.length);
  assert.equal(projected.fieldMissions.length, state.fieldMissions.length);
  assert.equal(projected.observations.length, state.observations.length);
  assert.equal(projected.results.length, state.results.length);
  assert.equal(projected.outcomes.length, state.outcomes.length);
  assert.equal(projected.impactEvidences.length, state.impactEvidences.length);
  assert.equal(projected.findings.length, state.findings.length);
  assert.equal(projected.learnings.length, state.learnings.length);
  assert.equal(projected.initiatives.length, state.initiatives.length);
  // Et aucune référence n'est nettoyée pour un rôle transverse — l'état
  // renvoyé est littéralement le même objet (early return), pas une copie.
  assert.equal(projected, state);
});

// TEST H (référence orpheline) — aucun objet visible ne pointe vers un
// objet supprimé après projection : tous les ids référencés par les
// objets survivants existent bien dans les tableaux survivants
// correspondants.
test("TEST — aucune référence orpheline créée par la projection", () => {
  const { state, viewerA } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });

  const situationIds = new Set(projected.situations.map((item) => item.id));
  const resultIds = new Set(projected.results.map((item) => item.id));
  const outcomeIds = new Set(projected.outcomes.map((item) => item.id));
  const commitmentIds = new Set(projected.coordinationSpaces.flatMap((space) => space.commitments.map((c) => c.id)));
  const fieldMissionIds = new Set(projected.fieldMissions.map((item) => item.id));

  for (const decision of projected.decisions) assert.ok(situationIds.has(decision.situationId), `Decision ${decision.id} orpheline`);
  for (const space of projected.coordinationSpaces) if (space.situationId) assert.ok(situationIds.has(space.situationId), `CoordinationSpace ${space.id} orphelin`);
  for (const evidence of projected.evidences) {
    if (evidence.situationId) assert.ok(situationIds.has(evidence.situationId), `Evidence ${evidence.id} orpheline (situation)`);
    if (evidence.commitmentId) assert.ok(commitmentIds.has(evidence.commitmentId), `Evidence ${evidence.id} orpheline (commitment)`);
  }
  for (const communication of projected.communications) {
    if (communication.situationId) assert.ok(situationIds.has(communication.situationId), `Communication ${communication.id} orpheline (situation)`);
    if (communication.commitmentId) assert.ok(commitmentIds.has(communication.commitmentId), `Communication ${communication.id} orpheline (commitment)`);
  }
  for (const mission of projected.fieldMissions) if (mission.situationId) assert.ok(situationIds.has(mission.situationId), `FieldMission ${mission.id} orpheline`);
  for (const observation of projected.observations) assert.ok(fieldMissionIds.has(observation.missionId), `Observation ${observation.id} orpheline`);
  for (const outcome of projected.outcomes) for (const rId of outcome.sourceResultIds) assert.ok(resultIds.has(rId), `Outcome ${outcome.id} référence un Result orphelin`);
  for (const impact of projected.impactEvidences) assert.ok(outcomeIds.has(impact.outcomeId), `ImpactEvidence ${impact.id} orpheline`);
  for (const finding of projected.findings) if (finding.promotedToSituationId) assert.ok(situationIds.has(finding.promotedToSituationId), `Finding ${finding.id} orphelin`);
  for (const learning of projected.learnings) if (learning.situationId) assert.ok(situationIds.has(learning.situationId), `Learning ${learning.id} orphelin`);
  for (const initiative of projected.initiatives) for (const sId of initiative.situationIds) assert.ok(situationIds.has(sId), `Initiative ${initiative.id} référence une situation orpheline`);
});

// TEST I — serialization test : aucun id ni texte sensible des objets
// masqués n'apparaît nulle part dans la réponse projetée complète.
test("TEST I — sérialisation complète : aucun id ni texte SECRET-CASCADE n'apparaît pour org-A", () => {
  const { state, viewerA } = makeCascadeFixture();
  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });
  const serialized = JSON.stringify(projected);

  assert.ok(!serialized.includes("SECRET-CASCADE"), "aucun texte des objets masqués ne doit apparaître, quelle que soit sa forme");
  const hiddenIds = [
    "sit-cascade-hidden", "dec-cascade-hidden", "coord-cascade-hidden", "eng-cascade-hidden",
    "ev-cascade-hidden-direct", "ev-cascade-hidden-mission", "com-cascade-hidden-direct", "com-cascade-hidden-commitment",
    "mission-cascade-hidden", "obsv-cascade-hidden", "result-cascade-hidden", "outcome-cascade-hidden",
    "impact-cascade-hidden", "finding-cascade-hidden", "learn-cascade-hidden"
  ];
  for (const hiddenId of hiddenIds) assert.ok(!serialized.includes(hiddenId), `l'id ${hiddenId} ne doit apparaître nulle part dans la réponse projetée`);
});

// TEST J — vrai GET /api/state : couvert en live (serveur de
// développement réel, comptes de démo) pour coordinateur + institution +
// un rôle organisationnel (mareyeur) — cf. rapport de lot pour le détail
// de la vérification réseau, reproduite ici sur Demo World réel pour
// documenter le changement d'état mesuré (mandat §12 : ne pas ajouter de
// fixture uniquement pour remplir le test quand le Demo World suffit).
test("TEST J (Demo World réel) — la cascade ne retire aucun objet non lié à Situation pour un rôle narrow", () => {
  const state = createDemoState();
  const mareyeur = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });
  const coordinateur = projectStateForSession(state, { actorId: "act-coordinateur", role: "coordinateur" });

  assert.equal(coordinateur, state, "rôle transverse : early return, aucune copie");
  assert.equal(mareyeur.situations.length, 0, "aucune situation Demo World n'est portée par un responsable de l'organisation du mareyeur (déjà établi en P2.1-A)");
  // Les objets sans relation Situation dans le Demo World (ServiceRequest,
  // Signal, Opportunity...) ne doivent jamais être affectés par la
  // cascade — seule la relation réelle au graphe compte.
  assert.equal(mareyeur.serviceRequests.length, state.serviceRequests.length);
  assert.equal(mareyeur.signals.length, state.signals.length);
  assert.equal(mareyeur.opportunities.length, state.opportunities.length);
});
