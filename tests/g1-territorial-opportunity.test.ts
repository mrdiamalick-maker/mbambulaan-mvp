import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { applyDemoProgramOpportunities, createJoalCoproductsOpportunityCommand, createKayarConnectivityOpportunityCommand } from "../src/data/demo-program-opportunities";
import { getOpportunities, getOpportunityDetail } from "../src/v3-template/lib/opportunity-bridge";

// G1 — mandat "Territory → Situation → Opportunity → Arbitration →
// Initiative/Result" : ProgramOpportunity évolue pour couvrir cette
// chaîne (collectiveNeedId optionnel, origine directe Territory/Site/
// Situation, lien réel vers une Decision d'arbitrage), sans dupliquer ni
// remplacer le moteur existant (CollectiveNeed → ProgramOpportunity →
// Initiative, LOT 0.3).

test("une ProgramOpportunity peut naître directement d'un Territory, sans CollectiveNeed ni Situation fabriquée", () => {
  const state = createDemoState();
  const next = applyCommand(state, createJoalCoproductsOpportunityCommand("act-coordinateur"));

  assert.equal(next.programOpportunities.length, 1);
  const opportunity = next.programOpportunities[0];
  assert.equal(opportunity.collectiveNeedId, undefined, "aucun CollectiveNeed ne doit être fabriqué pour satisfaire une relation absente");
  assert.equal(opportunity.situationIds, undefined, "aucune Situation ne doit être fabriquée pour satisfaire une relation absente");
  assert.deepEqual(opportunity.territoryIds, ["joal"]);
  assert.deepEqual(opportunity.siteIds, ["quai-joal"]);
  assert.equal(opportunity.status, "detected");
  // Le CollectiveNeed existant (motorisation, sujet différent) ne doit
  // jamais être touché par une création qui ne le cite pas.
  assert.deepEqual(next.collectiveNeeds, state.collectiveNeeds);
});

test("establishedFacts est optionnel sur la commande (défaut []) mais toujours présent sur l'objet stocké", () => {
  const state = createDemoState();
  const next = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    territoryIds: ["joal"],
    problem: "Problème de test, sans establishedFacts fourni.",
    justification: "Justification de test.",
    potentialBeneficiaries: "Bénéficiaires de test.",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: [],
    desiredOutcomes: ["Résultat recherché de test"],
    possibleIndicators: [],
    maturity: "faible"
  });
  assert.deepEqual(next.programOpportunities[0].establishedFacts, []);
});

test("siteIds/situationIds/involvedActorIds doivent résoudre vers des objets réels, jamais un id inventé", () => {
  const state = createDemoState();
  const baseCommand = {
    type: "create_program_opportunity" as const,
    actorId: "act-coordinateur",
    territoryIds: ["joal"],
    problem: "Problème de test.",
    justification: "Justification de test.",
    potentialBeneficiaries: "Bénéficiaires de test.",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: [],
    desiredOutcomes: ["Résultat recherché de test"],
    possibleIndicators: [],
    maturity: "faible" as const
  };

  assert.throws(() => applyCommand(state, { ...baseCommand, siteIds: ["site-inexistant"] }));
  assert.throws(() => applyCommand(state, { ...baseCommand, situationIds: ["sit-inexistante"] }));
  assert.throws(() => applyCommand(state, { ...baseCommand, involvedActorIds: ["act-inexistant"] }));

  const ok = applyCommand(state, { ...baseCommand, siteIds: ["quai-joal"], involvedActorIds: ["act-gestionnaire"] });
  assert.deepEqual(ok.programOpportunities[0].siteIds, ["quai-joal"]);
  assert.deepEqual(ok.programOpportunities[0].involvedActorIds, ["act-gestionnaire"]);
});

test("le chemin historique (qualified → create_initiative direct) reste intact, sans arbitrage obligatoire", () => {
  const state = createDemoState();
  const initiativesBefore = state.initiatives.length;
  const created = applyCommand(state, createJoalCoproductsOpportunityCommand("act-coordinateur"));
  const opportunity = created.programOpportunities[0];
  const qualified = applyCommand(created, { type: "update_program_opportunity_status", programOpportunityId: opportunity.id, actorId: "act-coordinateur", status: "qualified" });

  const withProgram = applyCommand(qualified, {
    type: "create_initiative",
    actorId: "act-coordinateur",
    title: "Programme de test (voie historique)",
    objective: "Objectif de test.",
    programOpportunityId: opportunity.id
  });
  assert.equal(withProgram.initiatives.length, initiativesBefore + 1);
  assert.equal(withProgram.initiatives[0].programOpportunityId, opportunity.id);
});

test("arbitrate_program_opportunity exige le statut « pending_arbitration »", () => {
  const state = createDemoState();
  const created = applyCommand(state, createJoalCoproductsOpportunityCommand("act-coordinateur"));
  const opportunity = created.programOpportunities[0];
  assert.equal(opportunity.status, "detected");

  assert.throws(() =>
    applyCommand(created, { type: "arbitrate_program_opportunity", programOpportunityId: opportunity.id, actorId: "act-ministre", outcome: "retenir", rationale: "Test." })
  );
});

test("arbitrate_program_opportunity « retenir » crée une Decision réelle et fait passer l'opportunité à « designing »", () => {
  const state = createDemoState();
  const created = applyCommand(state, createJoalCoproductsOpportunityCommand("act-coordinateur"));
  const opportunity = created.programOpportunities[0];
  const pending = applyCommand(created, { type: "update_program_opportunity_status", programOpportunityId: opportunity.id, actorId: "act-coordinateur", status: "pending_arbitration" });

  const decisionsBefore = pending.decisions.length;
  const arbitrated = applyCommand(pending, {
    type: "arbitrate_program_opportunity",
    programOpportunityId: opportunity.id,
    actorId: "act-ministre",
    outcome: "retenir",
    rationale: "Les éléments établis justifient d'instruire plus avant."
  });

  assert.equal(arbitrated.decisions.length, decisionsBefore + 1);
  const decision = arbitrated.decisions[0];
  assert.equal(decision.programOpportunityId, opportunity.id);
  assert.equal(decision.situationId, undefined, "une Decision ancrée sur une opportunité ne doit jamais porter de situationId");
  assert.equal(decision.type, "constituer_programme");

  const updated = arbitrated.programOpportunities.find((item) => item.id === opportunity.id)!;
  assert.equal(updated.status, "designing");
  assert.equal(updated.decisionId, decision.id);

  // Une Decision ancrée sur une opportunité ne doit jamais se présenter
  // comme une décision de Situation : aucun filtre par situationId ne
  // doit jamais la retrouver.
  assert.equal(arbitrated.decisions.filter((item) => item.situationId === undefined).length >= 1, true);
  for (const situation of arbitrated.situations) {
    assert.ok(!arbitrated.decisions.some((item) => item.id === decision.id && item.situationId === situation.id));
  }
});

test("arbitrate_program_opportunity « ecarter » crée une Decision réelle et fait passer l'opportunité à « rejected »", () => {
  const state = createDemoState();
  const created = applyCommand(state, createKayarConnectivityOpportunityCommand("act-coordinateur"));
  const opportunity = created.programOpportunities[0];
  const pending = applyCommand(created, { type: "update_program_opportunity_status", programOpportunityId: opportunity.id, actorId: "act-coordinateur", status: "pending_arbitration" });

  const arbitrated = applyCommand(pending, {
    type: "arbitrate_program_opportunity",
    programOpportunityId: opportunity.id,
    actorId: "act-ministre",
    outcome: "ecarter",
    rationale: "Trop d'inconnues à ce stade, instruction non poursuivie."
  });

  const decision = arbitrated.decisions[0];
  assert.equal(decision.type, "cloturer_sans_action");
  const updated = arbitrated.programOpportunities.find((item) => item.id === opportunity.id)!;
  assert.equal(updated.status, "rejected");
  assert.equal(updated.decisionId, decision.id);
});

test("une opportunité retenue (designing) après arbitrage reste convertible en Initiative, avec la même relation que la voie historique", () => {
  const state = createDemoState();
  const initiativesBefore = state.initiatives.length;
  const created = applyCommand(state, createJoalCoproductsOpportunityCommand("act-coordinateur"));
  const opportunity = created.programOpportunities[0];
  const pending = applyCommand(created, { type: "update_program_opportunity_status", programOpportunityId: opportunity.id, actorId: "act-coordinateur", status: "pending_arbitration" });
  const retained = applyCommand(pending, { type: "arbitrate_program_opportunity", programOpportunityId: opportunity.id, actorId: "act-ministre", outcome: "retenir", rationale: "Retenue après instruction." });

  const withProgram = applyCommand(retained, {
    type: "create_initiative",
    actorId: "act-coordinateur",
    title: "Programme de valorisation des coproduits — Joal",
    objective: "Qualifier puis structurer la valorisation des coproduits de poisson à Joal.",
    programOpportunityId: opportunity.id
  });

  assert.equal(withProgram.initiatives.length, initiativesBefore + 1);
  assert.equal(withProgram.initiatives[0].programOpportunityId, opportunity.id);
  assert.equal(withProgram.programOpportunities.find((item) => item.id === opportunity.id)?.status, "converted_to_program");
});

test("le Demo World ne contient toujours aucune ProgramOpportunity au chargement (non-régression)", () => {
  const state = createDemoState();
  assert.equal(state.programOpportunities.length, 0);
});

test("les trois opportunités de démonstration (Joal, Kayar, Mbour) s'appliquent sans Situation ni CollectiveNeed fabriqué hors de ce que le domaine permet honnêtement", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");

  // G2.1 (mandat "Vision territoriale" §4) ajoute Mbour à Joal/Kayar (G1).
  assert.equal(withDemo.programOpportunities.length, 3);
  const joal = withDemo.programOpportunities.find((item) => item.territoryIds.includes("joal") && !item.territoryIds.includes("mbour"))!;
  const kayar = withDemo.programOpportunities.find((item) => item.territoryIds.includes("kayar"))!;
  const mbour = withDemo.programOpportunities.find((item) => item.territoryIds.includes("mbour"))!;
  assert.ok(joal);
  assert.ok(kayar);
  assert.ok(mbour);

  for (const opportunity of [joal, kayar]) {
    assert.equal(opportunity.collectiveNeedId, undefined);
    assert.equal(opportunity.situationIds, undefined);
    assert.equal(opportunity.status, "detected");
    assert.ok(opportunity.knowledgeGaps.length > 0, "les inconnues (volumes/rentabilité/faisabilité) doivent rester explicitement documentées comme à qualifier");
    assert.ok(opportunity.potentialValueHypothesis, "la valeur potentielle doit être présente, explicitement nommée comme hypothèse");
  }

  // Mbour (G2.1) : contrairement à Joal/Kayar, un lien réel vers une
  // Situation existe honnêtement (sit-mbour porte exactement ce sujet) —
  // ni fabriqué, ni omis par excès de prudence.
  assert.equal(mbour.collectiveNeedId, undefined);
  assert.deepEqual(mbour.situationIds, ["sit-mbour"]);
  assert.equal(mbour.status, "qualifying", "Mbour s'appuie déjà sur une Situation documentée — instruction engagée, pas seulement repérée");

  // Mbàmbulaan n'est jamais présenté comme opérateur télécom/fournisseur
  // de connectivité satellite lui-même (mandat G1, contrainte explicite)
  // — une affirmation positive de ce rôle ne doit jamais apparaître,
  // alors que la disclaimer explicite ("n'est pas un opérateur...") est
  // attendue et ne doit donc pas faire échouer ce test.
  const kayarText = [kayar.problem, kayar.justification, ...kayar.knowledgeGaps, ...kayar.possibleInterventions].join(" ");
  assert.doesNotMatch(kayarText, /Mbàmbulaan (est|sera|devient) .{0,25}opérateur (télécom|satellite)/i);
  assert.match(kayarText, /n'est pas un opérateur (télécom|satellite)/i, "le cadrage doit explicitement écarter le rôle d'opérateur technique");
});

test("getOpportunities/getOpportunityDetail (bridge) résolvent les relations sans jamais fabriquer de donnée", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");

  const rows = getOpportunities(withDemo);
  assert.equal(rows.length, 3);
  assert.ok(rows.every((row) => !row.hasDecision), "aucune décision n'a encore été prise pour ces opportunités");

  // Mbour (G2.1) cite aussi "Joal-Fadiouth" dans territoryNames — on
  // isole ici précisément l'opportunité Joal elle-même par son propos.
  const joalRow = rows.find((row) => row.problem.includes("écailles"))!;
  assert.ok(joalRow);
  const detail = getOpportunityDetail(joalRow.id, withDemo)!;
  assert.ok(detail);
  assert.deepEqual(detail.siteNames, ["Quai de Joal-Fadiouth"]);
  assert.deepEqual(detail.involvedActorNames, ["Cheikh Bâ"]);
  assert.equal(detail.decision, undefined);
  assert.equal(detail.initiativeId, undefined);

  // Après arbitrage réel, le pont doit refléter la Decision canonique —
  // jamais une étiquette déduite du seul statut.
  const pending = applyCommand(withDemo, { type: "update_program_opportunity_status", programOpportunityId: joalRow.id, actorId: "act-coordinateur", status: "pending_arbitration" });
  const arbitrated = applyCommand(pending, { type: "arbitrate_program_opportunity", programOpportunityId: joalRow.id, actorId: "act-ministre", outcome: "retenir", rationale: "Retenue après instruction." });
  const detailAfter = getOpportunityDetail(joalRow.id, arbitrated)!;
  assert.ok(detailAfter.decision);
  assert.equal(detailAfter.decision!.label, "Constituer un programme");
});
