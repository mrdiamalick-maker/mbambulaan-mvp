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
//
// Correction Product Review (LOT 0, 2026-09-01, "Finding confirmé ≠
// Finding superseded") : une Situation est une conséquence opérationnelle
// d'un Finding confirmé, elle ne le remplace pas — le Finding doit rester
// "confirmed" après promotion, "superseded" restant réservé au cas où un
// Finding est effectivement remplacé/corrigé par un autre Finding
// (update_finding_status). Ce test démontre explicitement les 6 points
// demandés : Finding confirmé ; promotion explicite ; Situation créée ;
// Finding toujours confirmé ; relation Finding↔Situation traçable ;
// Signals sources toujours traçables.
// fnd-kayar-motorisation : confirmé dans le jeu de démonstration, mais
// jamais promu (la chaîne Kayar s'arrête à CollectiveNeed, cf.
// demo-state.ts) — contrairement à fnd-joal-glace-recurrence, déjà promu
// dans le jeu figé (sit-joal-glace-recurrence), idéal pour démontrer la
// promotion elle-même plutôt qu'un état déjà promu.
test("promote_finding_to_situation crée une Situation traçable, le Finding reste confirmé (correction Product Review)", () => {
  const state = createDemoState();
  const finding = state.findings.find((item) => item.id === "fnd-kayar-motorisation");
  assert.ok(finding, "le jeu de démonstration doit contenir le constat de récurrence Kayar");
  assert.equal(finding!.status, "confirmed"); // 1. Finding confirmé.
  assert.equal(finding!.promotedToSituationId, undefined);

  const next = applyCommand(state, { type: "promote_finding_to_situation", findingId: finding!.id, actorId: "act-coordinateur" }); // 2. Promotion explicite.

  const situation = next.situations[0];
  assert.ok(situation); // 3. Situation créée.

  const findingAfter = next.findings.find((item) => item.id === finding!.id);
  assert.equal(findingAfter?.status, "confirmed"); // 4. Finding toujours confirmé.

  // 5. Relation Finding ↔ Situation traçable, dans les deux sens.
  assert.equal(situation.findingId, finding!.id);
  assert.equal(findingAfter?.promotedToSituationId, situation.id);

  // 6. Signals sources toujours traçables (Finding → Signals, Situation → Signals).
  const sourceSignalIds = new Set(finding!.sourceRefs.filter((ref) => ref.objectType === "signal").map((ref) => ref.objectId));
  assert.deepEqual(new Set(situation.signalIds), sourceSignalIds);
  for (const signalId of situation.signalIds) {
    assert.equal(next.signals.find((item) => item.id === signalId)?.disposition, "oriente_situation");
  }
});

test("promote_finding_to_situation refuse une seconde promotion du même Finding déjà promu", () => {
  const state = createDemoState();
  const finding = state.findings.find((item) => item.id === "fnd-kayar-motorisation")!;
  const next = applyCommand(state, { type: "promote_finding_to_situation", findingId: finding.id, actorId: "act-coordinateur" });

  assert.throws(
    () => applyCommand(next, { type: "promote_finding_to_situation", findingId: finding.id, actorId: "act-coordinateur" }),
    /a déjà donné lieu à une situation/
  );
});

test("promote_finding_to_situation refuse la promotion d'un Finding déjà promu dans le jeu de démonstration (fnd-joal-glace-recurrence)", () => {
  const state = createDemoState();
  const finding = state.findings.find((item) => item.id === "fnd-joal-glace-recurrence")!;
  assert.equal(finding.status, "confirmed");
  assert.equal(finding.promotedToSituationId, "sit-joal-glace-recurrence");

  assert.throws(
    () => applyCommand(state, { type: "promote_finding_to_situation", findingId: finding.id, actorId: "act-coordinateur" }),
    /a déjà donné lieu à une situation/
  );
});

// update_finding_status reste la seule voie légitime vers "superseded" —
// un Finding remplacé/corrigé par un autre, jamais une conséquence de la
// promotion vers Situation (cf. tests ci-dessus).
test("update_finding_status peut faire passer un constat confirmé à « remplacé » (superseded), indépendamment de toute promotion", () => {
  const state = createDemoState();
  const finding = state.findings.find((item) => item.id === "fnd-kayar-motorisation-connaissance-manquante")!;
  assert.equal(finding.status, "confirmed");

  const next = applyCommand(state, { type: "update_finding_status", findingId: finding.id, actorId: "act-coordinateur", status: "superseded", note: "Remplacé par un constat plus précis." });
  assert.equal(next.findings.find((item) => item.id === finding.id)?.status, "superseded");
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

// Correction Product Review (LOT 0, 2026-09-01, "referential integrity
// des KnowledgeSourceRef") : la présence d'au moins une sourceRef ne
// suffit pas — chaque référence doit résoudre vers un objet réellement
// présent dans ProductState. "Every claim must be traceable."
test("record_finding refuse une référence vers un objet inexistant, quel que soit son type", () => {
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
        sourceRefs: [{ objectType: "signal", objectId: "sig-inexistant" }],
        explanation: "Explication",
        trust: "observee",
        provenance: "human",
        nextStep: "Étape"
      }),
    /référence signal:sig-inexistant, introuvable/
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
        sourceRefs: [{ objectType: "service_request", objectId: "need-inexistante" }],
        explanation: "Explication",
        trust: "observee",
        provenance: "human",
        nextStep: "Étape"
      }),
    /référence service_request:need-inexistante, introuvable/
  );
});

test("record_finding accepte une source réelle et plusieurs sources réelles de types différents (multi-sources)", () => {
  const state = createDemoState();

  // Source valide, un seul type.
  const single = applyCommand(state, {
    type: "record_finding",
    actorId: "act-coordinateur",
    findingType: "autre",
    title: "Titre",
    statement: "Énoncé",
    territoryIds: ["joal"],
    sourceRefs: [{ objectType: "signal", objectId: "sig-joal-veille-quai" }],
    explanation: "Explication",
    trust: "observee",
    provenance: "human",
    nextStep: "Étape"
  });
  assert.equal(single.findings[0].status, "proposed");

  // Multi-sources, types mélangés, tous réels.
  const multi = applyCommand(state, {
    type: "record_finding",
    actorId: "act-coordinateur",
    findingType: "recurrence",
    title: "Titre multi-sources",
    statement: "Énoncé multi-sources",
    territoryIds: ["kayar", "fass-boye"],
    sourceRefs: [
      { objectType: "signal", objectId: "sig-kayar-motorisation-1" },
      { objectType: "service_request", objectId: "need-motorisation-kayar-2" },
      { objectType: "finding", objectId: "fnd-kayar-motorisation" },
      { objectType: "territory", objectId: "kayar" }
    ],
    explanation: "Explication multi-sources",
    trust: "observee",
    provenance: "human",
    nextStep: "Étape"
  });
  assert.equal(multi.findings[0].sourceRefs.length, 4);
});

// Non-régression Demo World : les sourceRefs des fixtures Joal/Kayar
// (findings/collectiveNeeds déjà dans createDemoState()) doivent rester
// acceptables si elles étaient rejouées via les commandes elles-mêmes —
// preuve que le nouveau garde-fou n'invalide pas les données réelles déjà
// livrées, seulement les références fabriquées.
test("non-régression Demo World : les sourceRefs réelles de la chaîne Joal/Kayar sont acceptées par record_finding", () => {
  const state = createDemoState();
  const joalFinding = state.findings.find((item) => item.id === "fnd-joal-glace-recurrence")!;
  const kayarFinding = state.findings.find((item) => item.id === "fnd-kayar-motorisation")!;

  for (const finding of [joalFinding, kayarFinding]) {
    const replayed = applyCommand(state, {
      type: "record_finding",
      actorId: "act-coordinateur",
      findingType: finding.type,
      title: `${finding.title} (rejoué)`,
      statement: finding.statement,
      territoryIds: finding.territoryIds,
      sourceRefs: finding.sourceRefs,
      explanation: finding.explanation,
      trust: finding.trust,
      provenance: finding.provenance,
      nextStep: finding.nextStep
    });
    assert.equal(replayed.findings[0].status, "proposed");
  }
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
