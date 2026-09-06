import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { canRole } from "../src/server/permissions";

// V1 RELEASE HARDENING — lever les blockers de la V1 Coherence Review
// sans introduire de nouvelle capability. Ce fichier ne re-teste pas ce
// que finding.test.ts / collective-need.test.ts / data-integrity.test.ts
// / workday.test.ts couvrent déjà (garde-fous de promote_finding_to_situation
// B/C/D, transition interdite F, unicité des Commitment.id H, déterminisme
// de Workday I) — seulement le terrain réellement nouveau : éligibilité
// pour l'UI (A), transition CollectiveNeed autorisée bout-en-bout (E), et
// la garantie qu'une transition de statut ne crée jamais automatiquement
// de ProgramOpportunity (G).

// TEST A — la même règle d'éligibilité que l'UI (IntelligenceFeed.tsx :
// finding.status === "confirmed" && !finding.promotedToSituationId)
// s'accorde avec ce que le domaine autorise réellement, et le rôle
// nécessaire pour agir est bien celui gardé par permissions.ts — jamais
// un rôle non autorisé.
test("TEST A — un Finding confirmé et non promu est éligible à l'ouverture d'une Situation, uniquement pour un rôle autorisé", () => {
  const state = createDemoState();
  const eligible = state.findings.find((item) => item.status === "confirmed" && !item.promotedToSituationId);
  assert.ok(eligible, "le Demo World doit contenir au moins un constat confirmé non encore promu (fnd-kayar-motorisation)");

  // Le geste réussit réellement pour un rôle autorisé (coordinateur).
  assert.equal(canRole("coordinateur", "promote_finding_to_situation"), true);
  const next = applyCommand(state, { type: "promote_finding_to_situation", findingId: eligible!.id, actorId: "act-coordinateur" });
  assert.ok(next.findings.find((item) => item.id === eligible!.id)?.promotedToSituationId);

  // Rôles sans mandat de coordination (mareyeur, transformateur,
  // prestataire, capitaine) : jamais autorisés — le CTA ne doit jamais
  // s'afficher pour eux (IntelligenceFeed.tsx : canPromote = canRole(role,
  // "promote_finding_to_situation")).
  for (const role of ["mareyeur", "transformateur", "prestataire", "capitaine"] as const) {
    assert.equal(canRole(role, "promote_finding_to_situation"), false, `${role} ne doit pas pouvoir ouvrir une Situation depuis un constat`);
  }
});

// TEST E — une transition humaine autorisée (emerging → qualifying →
// qualified) est réellement accessible et honnête : les Knowledge Gaps
// ne sont jamais fermés par cette seule transition.
test("TEST E — un besoin collectif progresse honnêtement de « émergent » à « qualifié », sans fermer ses Knowledge Gaps", () => {
  let state = createDemoState();
  state = applyCommand(state, {
    type: "create_collective_need",
    actorId: "act-coordinateur",
    title: "Besoin collectif de test — progression",
    territoryIds: ["kayar"],
    affectedPopulation: "Capitaines de test",
    sourceRefs: [{ objectType: "service_request", objectId: "need-motorisation-kayar-1" }],
    consequences: [],
    hypotheses: [],
    knowledgeGaps: ["Cause dominante non établie"]
  });
  const need = state.collectiveNeeds[0];
  assert.equal(need.status, "emerging");

  state = applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "qualifying" });
  assert.equal(state.collectiveNeeds[0].status, "qualifying");
  assert.deepEqual(state.collectiveNeeds[0].knowledgeGaps, ["Cause dominante non établie"], "les Knowledge Gaps restent visibles après la transition");

  state = applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "qualified" });
  assert.equal(state.collectiveNeeds[0].status, "qualified");
  assert.deepEqual(state.collectiveNeeds[0].knowledgeGaps, ["Cause dominante non établie"], "les Knowledge Gaps ne sont jamais fermés automatiquement par une transition de statut");

  // Un besoin « monitored » peut honnêtement reprendre sa qualification
  // si de nouveaux éléments le justifient (CollectiveNeedDossier.tsx).
  state = applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "monitored" });
  assert.equal(state.collectiveNeeds[0].status, "monitored");
  state = applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "qualifying" });
  assert.equal(state.collectiveNeeds[0].status, "qualifying");
});

// TEST G — qualifier un besoin collectif (update_collective_need_status)
// n'est jamais la même décision que créer une ProgramOpportunity
// (create_program_opportunity) : la transition de statut, seule, ne crée
// jamais de ProgramOpportunity automatiquement.
test("TEST G — qualifier un besoin collectif ne crée jamais automatiquement de ProgramOpportunity", () => {
  const state = createDemoState();
  const opportunitiesBefore = state.programOpportunities.length;
  const need = state.collectiveNeeds.find((item) => item.status === "qualifying" || item.status === "emerging");
  // Le Demo World ne contient qu'un CollectiveNeed pré-scripté (déjà
  // "qualified") — on en construit un pour exercer la transition
  // "qualifying → qualified" réellement, comme dans TEST E, plutôt que de
  // dépendre d'un besoin "emerging"/"qualifying" déjà présent en fixture.
  let next = state;
  if (!need) {
    next = applyCommand(next, {
      type: "create_collective_need",
      actorId: "act-coordinateur",
      title: "Besoin collectif de test — G",
      territoryIds: ["kayar"],
      affectedPopulation: "Population de test",
      sourceRefs: [{ objectType: "service_request", objectId: "need-motorisation-kayar-1" }],
      consequences: [],
      hypotheses: [],
      knowledgeGaps: []
    });
    next = applyCommand(next, { type: "update_collective_need_status", collectiveNeedId: next.collectiveNeeds[0].id, actorId: "act-coordinateur", status: "qualifying" });
  }
  const target = need ?? next.collectiveNeeds[0];
  next = applyCommand(next, { type: "update_collective_need_status", collectiveNeedId: target.id, actorId: "act-coordinateur", status: "qualified" });

  assert.equal(next.collectiveNeeds.find((item) => item.id === target.id)?.status, "qualified");
  assert.equal(next.programOpportunities.length, opportunitiesBefore, "update_collective_need_status ne doit créer aucune ProgramOpportunity");
});
