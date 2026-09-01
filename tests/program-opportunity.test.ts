import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { findingsReferencedBy, resolveFindings, resolveSourceRefDisplay } from "../src/domain/situation-narrative";

// LOT 2 (mandat "Vertical Slice Kayar — du besoin dispersé à l'opportunité
// de programme de développement") — tests fonctionnels obligatoires A-K
// (§24 du mandat).

// TEST A — Source of Truth : l'UI Besoins collectifs consomme
// state.collectiveNeeds, elle ne recrée pas de groupes métier à partir des
// ServiceRequests. CollectiveNeedsPanel (seuil "≥ 2 demandes → Programme")
// est supprimé ; garde structurelle contre sa réapparition, dans le même
// esprit que le test de migration SQL de data-integrity.test.ts (lecture
// directe du fichier source).
test("TEST A — l'ancien algorithme « ≥ 2 demandes similaires → Programme » n'existe plus dans le code de la page Programmes", () => {
  const pageSource = readFileSync(new URL("../src/app/app/(coordination)/initiatives/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(pageSource, /GROUP_THRESHOLD/, "le seuil de regroupement legacy ne doit plus exister");
  assert.doesNotMatch(pageSource, /byIntent/i, "aucun regroupement de ServiceRequest par intention ne doit être reconstruit côté page");
  assert.match(pageSource, /state\.collectiveNeeds/, "la page doit lire directement state.collectiveNeeds (le Core reste seul responsable)");
});

// TEST B — Traceability : Kayar CollectiveNeed → Finding → Signals +
// ServiceRequests, sans IDs bruts affichables (résolution via les mêmes
// helpers génériques que Joal, LOT 1).
test("TEST B — cn-kayar-motorisation remonte à son Finding puis à ses Signals et ServiceRequests réels", () => {
  const state = createDemoState();
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  assert.ok(need);

  const findings = findingsReferencedBy(state, need.sourceRefs);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].id, "fnd-kayar-motorisation");

  const resolvedSources = need.sourceRefs.map((ref) => resolveSourceRefDisplay(state, ref));
  assert.ok(resolvedSources.every((item) => Boolean(item)), "chaque sourceRef doit résoudre vers un objet réel affichable");
  assert.ok(resolvedSources.some((item) => item!.ref.objectType === "signal"));
  assert.ok(resolvedSources.some((item) => item!.ref.objectType === "service_request"));
});

// TEST C — Knowledge Gap : le Knowledge Gap Kayar est réellement relié au
// Finding et visible (CollectiveNeed.knowledgeGapFindingIds, résolu via
// resolveFindings — même helper générique que le dossier).
test("TEST C — le Knowledge Gap de cn-kayar-motorisation est réellement relié et lisible", () => {
  const state = createDemoState();
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  const gaps = resolveFindings(state, need.knowledgeGapFindingIds);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].id, "fnd-kayar-motorisation-connaissance-manquante");
  assert.equal(gaps[0].type, "knowledge_gap");
  assert.match(gaps[0].statement, /cause dominante/i);
});

// TEST D — No automatic ProgramOpportunity : le Demo World ne contient
// aucune ProgramOpportunity au chargement (mandat §10).
test("TEST D — aucune ProgramOpportunity n'est créée automatiquement au chargement du Demo World", () => {
  const state = createDemoState();
  assert.equal(state.programOpportunities.length, 0);
});

// TEST E — Explicit creation : une action humaine (create_program_opportunity)
// crée une vraie ProgramOpportunity dans le ProductState, et fait passer le
// CollectiveNeed source à "converted" (traçabilité de la conversion).
test("TEST E — create_program_opportunity crée réellement l'opportunité et convertit le besoin source", () => {
  const state = createDemoState();
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  assert.equal(need.status, "qualified");

  const next = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: need.title,
    justification: "Justification de test.",
    territoryIds: need.territoryIds,
    potentialBeneficiaries: need.affectedPopulation,
    evidenceRefs: need.sourceRefs,
    hypotheses: need.hypotheses,
    knowledgeGaps: need.knowledgeGaps,
    possibleInterventions: ["Maintenance préventive", "Formation à l'entretien"],
    desiredOutcomes: ["Réduire les immobilisations"],
    possibleIndicators: [],
    maturity: "moyenne"
  });

  assert.equal(next.programOpportunities.length, 1);
  const opportunity = next.programOpportunities[0];
  assert.equal(opportunity.collectiveNeedId, need.id);
  assert.equal(opportunity.status, "detected");
  assert.equal(next.collectiveNeeds.find((item) => item.id === need.id)?.status, "converted", "le besoin source doit tracer sa conversion");
});

// TEST F — No automatic Program : créer une ProgramOpportunity ne crée
// aucune Initiative automatiquement.
test("TEST F — create_program_opportunity ne crée jamais d'Initiative automatiquement", () => {
  const state = createDemoState();
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  const initiativesBefore = state.initiatives.length;

  const next = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: need.title,
    justification: "Justification de test.",
    territoryIds: need.territoryIds,
    potentialBeneficiaries: need.affectedPopulation,
    evidenceRefs: need.sourceRefs,
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Maintenance préventive", "Formation à l'entretien"],
    desiredOutcomes: ["Réduire les immobilisations"],
    possibleIndicators: [],
    maturity: "moyenne"
  });

  assert.equal(next.initiatives.length, initiativesBefore);
});

// TEST G / H — Program conversion (action humaine explicite) → Initiative
// en cadrage, budget absent autorisé.
test("TEST G/H — create_initiative depuis une ProgramOpportunity qualifiée crée un programme en cadrage, budget absent autorisé", () => {
  const state = createDemoState();
  const initiativesBefore = state.initiatives.length;
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  const afterOpportunity = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: need.title,
    justification: "Justification de test.",
    territoryIds: need.territoryIds,
    potentialBeneficiaries: need.affectedPopulation,
    evidenceRefs: need.sourceRefs,
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Maintenance préventive", "Formation à l'entretien"],
    desiredOutcomes: ["Réduire les immobilisations"],
    possibleIndicators: [],
    maturity: "moyenne"
  });
  const opportunity = afterOpportunity.programOpportunities[0];

  // Qualifiée directement pour ce test (create_program_opportunity la crée
  // "detected" — un statut réel du cycle de vie, cf. update_program_opportunity_status).
  const qualified = applyCommand(afterOpportunity, { type: "update_program_opportunity_status", programOpportunityId: opportunity.id, actorId: "act-coordinateur", status: "qualified" });

  const withProgram = applyCommand(qualified, {
    type: "create_initiative",
    actorId: "act-coordinateur",
    title: "Programme de fiabilisation de la motorisation — Kayar/Fass Boye",
    objective: "Réduire les immobilisations liées aux pannes moteur récurrentes.",
    programOpportunityId: opportunity.id
  });

  assert.equal(withProgram.initiatives.length, initiativesBefore + 1);
  const initiative = withProgram.initiatives[0];
  assert.equal(initiative.status, "cadrage");
  assert.equal(initiative.budgetStatus, "a_estimer", "budget absent autorisé — le Core retombe sur « à estimer »");
  assert.equal(initiative.budgetFcfa, undefined);
  assert.equal(initiative.programOpportunityId, opportunity.id);
  assert.deepEqual(initiative.territoryIds, opportunity.territoryIds);
});

// TEST I — Requests : les ServiceRequests d'origine restent ouvertes après
// la création du programme (aucune couverture automatique).
test("TEST I — les ServiceRequests sources de Kayar restent ouvertes après la création du programme", () => {
  const state = createDemoState();
  const requestIds = ["need-motorisation-kayar-1", "need-motorisation-kayar-2", "need-motorisation-fass-boye"];
  requestIds.forEach((requestId) => assert.equal(state.serviceRequests.find((item) => item.id === requestId)?.status, "ouvert"));

  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  const afterOpportunity = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: need.title,
    justification: "Justification de test.",
    territoryIds: need.territoryIds,
    potentialBeneficiaries: need.affectedPopulation,
    evidenceRefs: need.sourceRefs,
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Maintenance préventive", "Formation à l'entretien"],
    desiredOutcomes: ["Réduire les immobilisations"],
    possibleIndicators: [],
    maturity: "moyenne"
  });
  const qualified = applyCommand(afterOpportunity, { type: "update_program_opportunity_status", programOpportunityId: afterOpportunity.programOpportunities[0].id, actorId: "act-coordinateur", status: "qualified" });
  const withProgram = applyCommand(qualified, {
    type: "create_initiative",
    actorId: "act-coordinateur",
    title: "Programme de test",
    objective: "Objectif de test.",
    programOpportunityId: qualified.programOpportunities[0].id
  });

  requestIds.forEach((requestId) => assert.equal(withProgram.serviceRequests.find((item) => item.id === requestId)?.status, "ouvert", `${requestId} doit rester ouverte tant qu'aucune intervention n'y répond`));
});

// TEST J — Economic Opportunity : l'Opportunity de matching lot ↔
// ServiceRequest continue de fonctionner sans collision sémantique avec
// ProgramOpportunity — deux tableaux distincts, deux commandes distinctes.
test("TEST J — Opportunity (matching économique) et ProgramOpportunity restent deux objets distincts sans collision", () => {
  const state = createDemoState();
  assert.notEqual(state.opportunities, state.programOpportunities);
  const economicOpportunity = state.opportunities.find((item) => item.status === "detectee" || item.status === "proposee");
  assert.ok(economicOpportunity, "le jeu de démonstration doit conserver au moins une Opportunity économique exploitable");

  const next = applyCommand(state, { type: "accept_opportunity", actorId: "act-mareyeur", opportunityId: economicOpportunity!.id });
  assert.equal(next.opportunities.find((item) => item.id === economicOpportunity!.id)?.status, "engagee");
  // accept_opportunity ne doit toucher ni collectiveNeeds ni programOpportunities.
  assert.deepEqual(next.programOpportunities, state.programOpportunities);
  assert.deepEqual(next.collectiveNeeds, state.collectiveNeeds);
});

// Audit Product Review §26 — le Demo World Kayar ne doit plus affirmer de
// propriété que le modèle ne démontre pas ("indépendants", "recoupés",
// "concordants", "représentatif", "majorité").
test("le Finding et le CollectiveNeed Kayar ne surinterprètent plus leurs sources", () => {
  const state = createDemoState();
  const finding = state.findings.find((item) => item.id === "fnd-kayar-motorisation")!;
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  const overclaimPattern = /indépendant|recoup|concordant|représentatif|majorité/i;

  assert.doesNotMatch(finding.explanation, overclaimPattern);
  assert.doesNotMatch(finding.reviewNote ?? "", overclaimPattern);
  need.history.forEach((entry) => assert.doesNotMatch(entry.detail, overclaimPattern, `history "${entry.label}" ne doit pas surinterpréter les sources`));
});

// TEST K — Non-régression Joal : LOT 1 reste fonctionnel (relecture directe
// de la Situation Joal, inchangée par ce lot — aucune ligne du bloc Joal de
// demo-state.ts n'a été touchée).
test("TEST K — la Situation Joal (LOT 1) reste intacte", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence");
  assert.ok(situation);
  assert.equal(situation!.findingId, "fnd-joal-glace-recurrence");
  assert.equal(situation!.coordinationId, "coord-joal-recurrence");
  assert.equal(state.decisions.filter((item) => item.situationId === situation!.id).length, 1);
});

// Micro-correctif Product Review (post-LOT 2, 2026-09-01, "qualification
// ProgramOpportunity : éviter le bouton administratif") — la note envoyée
// à update_program_opportunity_status doit provenir d'une justification
// humaine réelle, jamais d'une phrase codée en dur.
function createKayarOpportunity(state: ReturnType<typeof createDemoState>) {
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  return applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: need.title,
    justification: "Justification de test.",
    territoryIds: need.territoryIds,
    potentialBeneficiaries: need.affectedPopulation,
    evidenceRefs: need.sourceRefs,
    hypotheses: [],
    knowledgeGaps: ["Cause dominante non établie (usure, carburant, pièces, pratique d'entretien)"],
    possibleInterventions: ["Maintenance préventive", "Formation à l'entretien"],
    desiredOutcomes: ["Réduire les immobilisations"],
    possibleIndicators: [],
    maturity: "moyenne"
  });
}

// Test 3 (mini-correctif) — l'ancienne phrase codée en dur n'existe plus
// dans le composant du dossier, le formulaire de qualification exige un
// champ non vide.
test("aucune note de qualification codée en dur ne subsiste dans ProgramOpportunityDossier — un formulaire de justification existe", () => {
  const source = readFileSync(new URL("../src/components/coordination/ProgramOpportunityDossier.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /Éléments disponibles jugés suffisants pour envisager la conception d.un programme\./, "la phrase générique codée en dur ne doit plus être envoyée telle quelle comme note");
  assert.match(source, /Justification de la qualification/, "un champ de justification humaine doit exister dans le formulaire");
  assert.match(source, /required rows=\{3\} value=\{justification\}/, "le champ de justification doit être obligatoire (required)");
});

// Test 5 — la justification saisie est réellement enregistrée dans la
// transition (history), pas perdue ni remplacée par un texte générique.
test("update_program_opportunity_status vers « qualified » enregistre la justification humaine réelle dans l'historique", () => {
  const state = createDemoState();
  const afterOpportunity = createKayarOpportunity(state);
  const opportunity = afterOpportunity.programOpportunities[0];
  const justification = "Les 2 signaux et les 3 demandes de service convergent suffisamment pour engager une phase de conception, même si la cause dominante reste à confirmer.";

  const qualified = applyCommand(afterOpportunity, {
    type: "update_program_opportunity_status",
    programOpportunityId: opportunity.id,
    actorId: "act-coordinateur",
    status: "qualified",
    note: justification
  });

  const updated = qualified.programOpportunities.find((item) => item.id === opportunity.id)!;
  assert.equal(updated.status, "qualified");
  assert.equal(updated.history[0].detail, justification, "la note de la transition doit être la justification humaine réelle, pas un libellé de statut générique");
});

// Test 6 — les Knowledge Gaps restent visibles après qualification tant
// qu'ils n'ont pas été réellement levés (qualifier ne les efface pas).
test("les Knowledge Gaps d'une ProgramOpportunity restent visibles après qualification", () => {
  const state = createDemoState();
  const afterOpportunity = createKayarOpportunity(state);
  const opportunity = afterOpportunity.programOpportunities[0];
  assert.ok(opportunity.knowledgeGaps.length > 0);

  const qualified = applyCommand(afterOpportunity, {
    type: "update_program_opportunity_status",
    programOpportunityId: opportunity.id,
    actorId: "act-coordinateur",
    status: "qualified",
    note: "Justification de test pour la qualification."
  });

  const updated = qualified.programOpportunities.find((item) => item.id === opportunity.id)!;
  assert.deepEqual(updated.knowledgeGaps, opportunity.knowledgeGaps, "qualifier ne doit jamais effacer les inconnues documentées — seule une conception réelle pourrait les lever");
});
