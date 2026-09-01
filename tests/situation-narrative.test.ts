import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { decisionTypeLabels } from "../src/domain/types";
import {
  buildValueTrail,
  collectSituationSignals,
  describeFindingTrust,
  findFocusSituation,
  findKnowledgeGapForSituation,
  relatedDecisionsForSituation,
  resolveFindingForSituation,
  resolveSourceRefDisplay
} from "../src/domain/situation-narrative";

// LOT 1 (mandat "Vertical Slice Joal") — TEST A : Situation Joal → Finding →
// Signals → KnowledgeSourceRefs valides, bout en bout.
test("TEST A — la Situation Joal remonte à son Finding, ses Signals et des sourceRefs qui résolvent réellement", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence");
  assert.ok(situation);

  const finding = resolveFindingForSituation(state, situation!);
  assert.ok(finding, "la Situation Joal doit résoudre à un Finding réel");
  assert.equal(finding!.id, "fnd-joal-glace-recurrence");
  assert.equal(finding!.status, "confirmed");

  const signals = collectSituationSignals(state, situation!);
  assert.ok(signals.length >= 2, "au moins les 2 signaux sourcés par le Finding");
  signals.forEach((signal) => assert.equal(signal.territoryId, "joal"));

  assert.ok(finding!.sourceRefs.length > 0);
  finding!.sourceRefs.forEach((ref) => {
    const resolved = resolveSourceRefDisplay(state, ref);
    assert.ok(resolved, `${ref.objectType}:${ref.objectId} doit résoudre vers un objet réel`);
    assert.ok(resolved!.label.length > 0);
  });
});

// TEST B — une Situation ne suppose pas 1 Signal = 1 Situation : le dossier
// Joal doit exposer plusieurs Signals, pas seulement le premier.
test("TEST B — collectSituationSignals expose plusieurs Signals pour le dossier Joal", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  const signals = collectSituationSignals(state, situation);
  assert.ok(signals.length >= 2, "le dossier doit exposer au moins 2 signaux, pas uniquement le premier");
  assert.equal(new Set(signals.map((item) => item.id)).size, signals.length, "aucun doublon");
});

// TEST C — le texte de la signature « pourquoi Mbàmbulaan vous le signale »
// doit être entièrement dérivable du Finding réel, jamais un texte
// décoratif indépendant, et le niveau de confiance ne doit jamais afficher
// un score composite (doctrine anti-score).
test("TEST C — la signature « pourquoi » est entièrement dérivée du Finding réel, sans score composite", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  const finding = resolveFindingForSituation(state, situation)!;

  // Les 2 textes affichés ("ce que Mbàmbulaan a compris" / "pourquoi")
  // sont des lectures directes des champs du Finding, pas une reformulation.
  assert.equal(finding.statement, situation.description, "la description de la Situation reprend le statement du Finding, aucune divergence de récit");
  assert.ok(finding.explanation.length > 0);

  const trustText = describeFindingTrust(finding);
  assert.match(trustText, /^Observé —/);
  assert.doesNotMatch(trustText, /%/, "jamais de score composite en pourcentage");
  assert.doesNotMatch(trustText, /\d\/\d/, "jamais de score composite en fraction");
});

// TEST D — ni record_finding ni promote_finding_to_situation ne créent de
// Decision automatiquement : la recommandation reste distincte de la
// décision, qui exige un acte humain explicite (create_decision, hors
// périmètre testé ici puisqu'aucune commande de ce type n'existe côté
// promotion — seule promote_finding_to_situation crée une Situation).
test("TEST D — record_finding et promote_finding_to_situation ne créent jamais de Decision", () => {
  const state = createDemoState();
  const decisionsBefore = state.decisions.length;

  const signal = state.signals.find((item) => item.disposition === "nouveau")!;
  const afterRecord = applyCommand(state, {
    type: "record_finding",
    actorId: "act-coordinateur",
    findingType: "recurrence",
    title: "Constat de test TEST D",
    statement: "Énoncé de test.",
    territoryIds: [signal.territoryId!],
    sourceRefs: [{ objectType: "signal", objectId: signal.id }],
    explanation: "Explication de test.",
    trust: "observee",
    provenance: "human",
    nextStep: "Prochaine étape de test."
  });
  assert.equal(afterRecord.decisions.length, decisionsBefore, "record_finding ne doit créer aucune Decision");

  const confirmedUnpromoted = afterRecord.findings.find((item) => item.id === afterRecord.findings[0].id)!;
  const afterConfirm = applyCommand(afterRecord, { type: "update_finding_status", findingId: confirmedUnpromoted.id, actorId: "act-coordinateur", status: "confirmed" });
  const afterPromote = applyCommand(afterConfirm, { type: "promote_finding_to_situation", findingId: confirmedUnpromoted.id, actorId: "act-coordinateur" });
  assert.equal(afterPromote.decisions.length, decisionsBefore, "promote_finding_to_situation ne doit créer aucune Decision — seule une Situation en résulte");
});

// TEST E — le dossier Joal (Décision, Coordination, Engagements) référence
// des objets Core réellement reliés entre eux, pas des données parallèles.
test("TEST E — Décision, Coordination et Engagements du dossier Joal sont réellement reliés entre eux", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;

  const decisions = relatedDecisionsForSituation(state, situation);
  assert.equal(decisions.length, 1);
  assert.equal(decisions[0].coordinationId, situation.coordinationId);

  const coordination = state.coordinationSpaces.find((item) => item.id === situation.coordinationId);
  assert.ok(coordination);
  assert.equal(coordination!.situationId, situation.id);
  assert.ok(coordination!.commitments.length > 0);
  coordination!.commitments.forEach((commitment) => {
    assert.ok(state.actors.some((actor) => actor.id === commitment.actorId), `l'acteur ${commitment.actorId} de l'engagement doit exister réellement`);
  });
});

// TEST F — chaque étape affichée du Value Trail possède une vraie source ;
// une étape non encore atteinte (Résultat) reste honnêtement "à confirmer",
// jamais un impact fabriqué (§14 du mandat).
test("TEST F — buildValueTrail s'appuie sur de vrais objets et n'invente jamais de résultat", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  const trail = buildValueTrail(state, situation);
  assert.equal(trail.map((step) => step.key).join(","), "signal,comprehension,decision,action,resultat");

  const signalStep = trail.find((step) => step.key === "signal")!;
  assert.equal(signalStep.proven, true);

  const decisionStep = trail.find((step) => step.key === "decision")!;
  assert.equal(decisionStep.proven, true);
  assert.match(decisionStep.detail, new RegExp(decisionTypeLabels.ouvrir_coordination));

  const actionStep = trail.find((step) => step.key === "action")!;
  assert.equal(actionStep.proven, true);

  const resultStep = trail.find((step) => step.key === "resultat")!;
  assert.equal(resultStep.proven, false, "aucun résultat n'a encore été constaté pour ce dossier — ne doit jamais être présenté comme prouvé");
  assert.match(resultStep.detail, /à confirmer/i);
  assert.equal(situation.result, undefined, "non-fabrication : le Résultat ne doit pas exister tant qu'il n'est pas réellement constaté");
});

// TEST G — la lecture institutionnelle (findFocusSituation) et l'Atlas
// (territoire critique unique) racontent la même réalité : Joal, via la
// même Situation, sans branche `if joal` — la préférence pour une situation
// explicable (adossée à un Finding) est une règle générique.
test("TEST G — findFocusSituation retrouve la même Situation Joal, aussi bien scopée au territoire qu'au niveau national", () => {
  const state = createDemoState();
  const joalScoped = findFocusSituation(state, "joal");
  assert.equal(joalScoped?.id, "sit-joal-glace-recurrence");

  const dominant = state.territories.find((item) => item.activity === "critique");
  assert.equal(dominant?.id, "joal", "Joal doit rester l'unique territoire critique du jeu de démonstration");

  const national = findFocusSituation(state);
  assert.equal(national?.id, "sit-joal-glace-recurrence", "seule Situation explicable (adossée à un Finding) du jeu de démonstration");
});

// Non-régression légère : Kayar n'a aucune Situation (la chaîne s'arrête à
// CollectiveNeed, cf. LOT 0) — findKnowledgeGapForSituation ne doit pas
// planter pour un territoire sans Situation associée, et ne doit rien
// fabriquer pour Joal, qui n'a aucun Finding "knowledge_gap".
test("findKnowledgeGapForSituation reste honnête : aucun angle mort fabriqué pour Joal", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence")!;
  assert.equal(findKnowledgeGapForSituation(state, situation), undefined);
});
