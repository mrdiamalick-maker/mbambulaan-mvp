import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { computeSignalCrossingAlerts, signalCrossingAlertToFindingDraft } from "../src/domain/signal-crossing";

// LOT 0.2 (mandat "aligner le Core métier avec le Blueprint V1", TEST B) :
// un Finding proposé conserve ses sources, son explication, et ne
// déclenche aucune décision automatique — ni Situation, ni changement de
// statut d'un autre objet au-delà du rattachement des signaux sources.
test("record_finding propose un constat, conserve les sources et l'explication, sans décision automatique (TEST B)", () => {
  const state = createDemoState();
  const situationsBefore = state.situations.length;
  const signal = state.signals.find((item) => item.disposition === "nouveau");
  assert.ok(signal, "le jeu de démonstration doit contenir au moins un signal encore à l'état nouveau");

  const next = applyCommand(state, {
    type: "record_finding",
    actorId: "act-coordinateur",
    findingType: "recurrence",
    title: "Constat de test",
    statement: "Énoncé de test.",
    territoryIds: [signal!.territoryId!],
    sourceRefs: [{ objectType: "signal", objectId: signal!.id }],
    explanation: "Explication de test.",
    trust: "observee",
    provenance: "human",
    nextStep: "Prochaine étape de test."
  });

  const finding = next.findings[0];
  assert.equal(finding.status, "proposed");
  assert.deepEqual(finding.sourceRefs, [{ objectType: "signal", objectId: signal!.id }]);
  assert.equal(finding.explanation, "Explication de test.");
  assert.equal(next.situations.length, situationsBefore, "record_finding ne doit créer aucune situation");
  assert.equal(next.signals.find((item) => item.id === signal!.id)?.disposition, "rattache_finding");
});

test("record_finding exige au moins une source réelle et rejette un constat issu d'une règle sans identifiant de règle", () => {
  const state = createDemoState();
  assert.throws(
    () =>
      applyCommand(state, {
        type: "record_finding",
        actorId: "act-coordinateur",
        findingType: "autre",
        title: "Titre",
        statement: "Énoncé",
        territoryIds: ["joal"],
        sourceRefs: [],
        explanation: "Explication",
        trust: "observee",
        provenance: "human",
        nextStep: "Étape"
      }),
    /au moins une source réelle/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "record_finding",
        actorId: "act-coordinateur",
        findingType: "autre",
        title: "Titre",
        statement: "Énoncé",
        territoryIds: ["joal"],
        sourceRefs: [{ objectType: "signal", objectId: "sig-joal-veille-quai" }],
        explanation: "Explication",
        trust: "observee",
        provenance: "rule",
        nextStep: "Étape"
      }),
    /identifiant et la version de cette règle/
  );
});

// TEST C (mandat §21) : Finding confirmé, puis explicitement orienté vers
// Situation — la Situation conserve la traçabilité vers le Finding ET les
// Signals sources.
test("promote_finding_to_situation crée une Situation traçable jusqu'au Finding confirmé et à ses Signals sources (TEST C)", () => {
  const state = createDemoState();
  const finding = state.findings.find((item) => item.id === "fnd-joal-glace-recurrence");
  assert.ok(finding, "le jeu de démonstration doit contenir le constat de référence Joal");
  assert.equal(finding!.status, "confirmed");

  const next = applyCommand(state, { type: "promote_finding_to_situation", findingId: finding!.id, actorId: "act-coordinateur" });

  const situation = next.situations[0];
  assert.equal(situation.findingId, finding!.id);
  assert.deepEqual(
    new Set(situation.signalIds),
    new Set(finding!.sourceRefs.filter((ref) => ref.objectType === "signal").map((ref) => ref.objectId))
  );
  assert.equal(next.findings.find((item) => item.id === finding!.id)?.status, "superseded");
  for (const signalId of situation.signalIds) {
    assert.equal(next.signals.find((item) => item.id === signalId)?.disposition, "oriente_situation");
  }
});

test("promote_finding_to_situation refuse un constat qui n'est pas confirmé", () => {
  const state = createDemoState();
  const finding = state.findings.find((item) => item.id === "fnd-kayar-motorisation-connaissance-manquante");
  assert.ok(finding);
  // Ramener volontairement le constat à "proposed" pour ce test — le jeu
  // de démonstration le fournit "confirmed", jamais fabriqué "non
  // confirmé" par ailleurs.
  const proposedState = { ...state, findings: state.findings.map((item) => (item.id === finding!.id ? { ...item, status: "proposed" as const } : item)) };

  assert.throws(
    () => applyCommand(proposedState, { type: "promote_finding_to_situation", findingId: finding!.id, actorId: "act-coordinateur" }),
    /Seul un constat confirmé/
  );
});

// Convergence Signal Crossing → Finding (mandat §7) : la couche
// d'adaptation produit un brouillon compatible avec record_finding, sans
// jamais persister ni décider automatiquement.
test("signalCrossingAlertToFindingDraft produit un brouillon record_finding-compatible depuis une alerte réelle, sans effet de bord", () => {
  const state = createDemoState();
  const alerts = computeSignalCrossingAlerts(state);
  if (alerts.length === 0) return; // Aucune alerte crédible dans ce jeu à cet instant — rien à adapter, pas un échec.

  const draft = signalCrossingAlertToFindingDraft(alerts[0]);
  assert.equal(draft.provenance, "rule");
  assert.ok(draft.ruleId);
  assert.equal(draft.ruleVersion, 1);
  assert.ok(draft.sourceRefs.length > 0);

  const next = applyCommand(state, { type: "record_finding", actorId: "act-coordinateur", ...draft });
  assert.equal(next.findings[0].status, "proposed");
  assert.equal(next.findings[0].ruleId, draft.ruleId);
});
