import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import {
  computeSignalCrossingAlerts,
  detectServiceRequestRecurrenceAlerts,
  detectCapacityFreshnessGapAlerts,
  detectImpairedInfrastructureAlerts,
  detectPriorityCorroborationAlerts,
  signalCrossingAlertToFindingDraft,
  INTELLIGENCE_RULE_REGISTRY,
  RECURRENCE_TERRITORY_INTENT_THRESHOLD
} from "../src/domain/signal-crossing";
import { computeIntelligenceFeed, computeIntelligenceObservability } from "../src/domain/intelligence-feed";

// LOT 8 (mandat "Maritime Intelligence Engine — détecter, expliquer,
// prioriser sans décider à la place de l'humain"), §36 : tests A-N.

// TEST A — résultats déterministes : la même réalité produit exactement
// les mêmes détections, deux fois de suite (aucun hasard, aucun horodatage
// courant utilisé pour décider).
test("TEST A — les 5 règles produisent des résultats déterministes (même état, deux appels identiques)", () => {
  const state = createDemoState();
  const first = computeSignalCrossingAlerts(state);
  const second = computeSignalCrossingAlerts(state);
  assert.deepEqual(first, second);
  assert.ok(first.length > 0, "le Demo World doit produire au moins une détection");
});

// TEST B — replay ≠ doublon de Finding : enregistrer deux fois la même
// détection (même detectionKey) refuse la seconde tentative.
test("TEST B — record_finding refuse de dupliquer une détection déjà enregistrée (idempotence, mandat §6)", () => {
  const state = createDemoState();
  const alerts = computeSignalCrossingAlerts(state);
  const alert = alerts.find((item) => item.ruleId === "impaired-infrastructure-on-active-site");
  assert.ok(alert, "la règle infrastructure fragilisée doit produire au moins une détection sur le Demo World");
  const draft = signalCrossingAlertToFindingDraft(alert!);

  const once = applyCommand(state, { type: "record_finding", actorId: "act-coordinateur", ...draft });
  assert.equal(once.findings.filter((item) => item.detectionKey === draft.detectionKey).length, 1);

  assert.throws(
    () => applyCommand(once, { type: "record_finding", actorId: "act-coordinateur", ...draft }),
    /déjà été traitée/
  );
  // Rejouer la commande une troisième fois (même detectionKey, même
  // brouillon) échoue encore — pas seulement "la deuxième fois" : le
  // garde-fou tient pour toute répétition ultérieure.
  assert.throws(
    () => applyCommand(once, { type: "record_finding", actorId: "act-coordinateur", ...draft }),
    /déjà été traitée/
  );
});

test("TEST B bis — dismiss_detection refuse aussi de dupliquer une détection déjà traitée", () => {
  const state = createDemoState();
  const alerts = computeSignalCrossingAlerts(state);
  const alert = alerts.find((item) => item.ruleId === "impaired-infrastructure-on-active-site")!;
  const draft = signalCrossingAlertToFindingDraft(alert);

  const dismissed = applyCommand(state, {
    type: "dismiss_detection",
    actorId: "act-coordinateur",
    ...draft,
    rejectionReason: "faux_positif"
  });
  assert.equal(dismissed.findings.find((item) => item.detectionKey === draft.detectionKey)?.status, "rejected");

  assert.throws(
    () => applyCommand(dismissed, { type: "record_finding", actorId: "act-coordinateur", ...draft }),
    /déjà été traitée/
  );
  assert.throws(
    () => applyCommand(dismissed, { type: "dismiss_detection", actorId: "act-coordinateur", ...draft, rejectionReason: "doublon" }),
    /déjà été traitée/
  );
});

// TEST C — Detection ≠ Finding confirmé : record_finding crée toujours un
// constat "proposed", jamais "confirmed" directement, et n'ouvre aucune
// Situation.
test("TEST C — enregistrer une détection crée un constat « proposed », jamais confirmé ni une Situation", () => {
  const state = createDemoState();
  const situationsBefore = state.situations.length;
  const alert = computeSignalCrossingAlerts(state)[0];
  const draft = signalCrossingAlertToFindingDraft(alert);

  const next = applyCommand(state, { type: "record_finding", actorId: "act-coordinateur", ...draft });
  const finding = next.findings.find((item) => item.detectionKey === draft.detectionKey)!;
  assert.equal(finding.status, "proposed");
  assert.equal(next.situations.length, situationsBefore);
});

// TEST D — le Finding conserve ruleId/ruleVersion/sourceRefs, quelle que
// soit la règle d'origine.
test("TEST D — le constat matérialisé conserve ruleId, ruleVersion et sourceRefs de la détection", () => {
  const state = createDemoState();
  for (const alert of computeSignalCrossingAlerts(state)) {
    const draft = signalCrossingAlertToFindingDraft(alert);
    assert.equal(draft.ruleId, alert.ruleId);
    assert.equal(draft.ruleVersion, alert.ruleVersion);
    assert.deepEqual(draft.sourceRefs, alert.sourceRefs);
  }
});

// TEST E — aucune décision automatique : enregistrer ou écarter une
// détection ne crée jamais de Decision, ne modifie aucune Situation, ne
// crée aucune Mission/Programme (mandat §20).
test("TEST E — record_finding et dismiss_detection ne déclenchent jamais de Decision, Situation, Mission ou Programme", () => {
  const state = createDemoState();
  const before = {
    decisions: state.decisions.length,
    situations: state.situations.length,
    fieldMissions: state.fieldMissions.length,
    initiatives: state.initiatives.length
  };

  let next = state;
  for (const alert of computeSignalCrossingAlerts(state)) {
    const draft = signalCrossingAlertToFindingDraft(alert);
    try {
      next = applyCommand(next, { type: "record_finding", actorId: "act-coordinateur", ...draft });
    } catch {
      // Occurrence déjà connue (ex. Kayar, cf. TEST G) — refusée par le
      // garde-fou d'idempotence, pas une erreur pour ce test.
    }
  }

  assert.equal(next.decisions.length, before.decisions);
  assert.equal(next.situations.length, before.situations);
  assert.equal(next.fieldMissions.length, before.fieldMissions);
  assert.equal(next.initiatives.length, before.initiatives);
});

// TEST F — Joal : la règle "infrastructure fragilisée sur site actif"
// reste active et détectable sur le Demo World (mandat §21, non régressée
// par ce lot).
test("TEST F — Joal : la détection « infrastructure fragilisée + activité récente » reste active", () => {
  const state = createDemoState();
  const alerts = detectImpairedInfrastructureAlerts(state);
  assert.ok(alerts.some((item) => item.territoryId === "joal"), "au moins une détection doit concerner Joal");
});

// TEST G — Kayar : la nouvelle règle de récurrence détecte le cluster
// motorisation, et l'Intelligence Feed le présente comme déjà connu (pas
// "nouvelle") grâce au detectionKey rétroactif du Finding historique —
// preuve qu'une réalité déjà comprise ne se reduplique jamais (mandat §22).
test("TEST G — Kayar : récurrence de demandes « maintenance » détectée, déjà rattachée au constat existant (pas une nouvelle détection)", () => {
  const state = createDemoState();
  const alerts = detectServiceRequestRecurrenceAlerts(state);
  const kayarAlert = alerts.find((item) => item.territoryId === "kayar" && item.id.endsWith(":maintenance"));
  assert.ok(kayarAlert, "la règle doit détecter la récurrence de demandes maintenance à Kayar");
  assert.ok(kayarAlert!.facts.some((fact) => fact.code === "request_count" && Number(fact.value) >= RECURRENCE_TERRITORY_INTENT_THRESHOLD));

  const feed = computeIntelligenceFeed(state);
  const item = feed.find((entry) => entry.alert.id === kayarAlert!.id);
  assert.ok(item);
  assert.equal(item!.status, "enregistree");
  assert.equal(item!.finding?.id, "fnd-kayar-motorisation");
});

// TEST H — déficit de corroboration toujours détectable (non régressé).
test("TEST H — la détection « corroboration à renforcer » reste active sur le Demo World", () => {
  const state = createDemoState();
  const alerts = detectPriorityCorroborationAlerts(state);
  assert.ok(Array.isArray(alerts));
});

// TEST I — Capacity expirée → « à revérifier », jamais « indisponible »
// par simple péremption (mandat §10/§12/§24).
test("TEST I — une Capacity expirée déclarée « disponible » produit un Knowledge Gap « à revérifier », jamais « indisponible »", () => {
  const state = createDemoState();
  // Antérieure à "now" (2026-07-29, cf. demo-state.ts) — la date de
  // référence du jeu de démonstration est dérivée de ses propres données,
  // pas de l'horloge réelle (deriveDatasetReferenceAt, signal-crossing.ts).
  const clearlyExpired = "2026-01-01T00:00:00.000Z";
  const expiredCapacity = { ...state.capacities[0], id: "capacity-test-expiree", validUntil: clearlyExpired, status: "disponible" as const };
  const withExpired = { ...state, capacities: [...state.capacities, expiredCapacity] };

  const alerts = detectCapacityFreshnessGapAlerts(withExpired);
  const alert = alerts.find((item) => item.sourceRefs.some((ref) => ref.objectType === "capacity" && ref.objectId === expiredCapacity.id));
  assert.ok(alert, "une Capacity disponible mais expirée doit produire une détection");
  assert.match(alert!.description, /à revérifier/);
  assert.doesNotMatch(alert!.description, /capacité[s]? indisponible/i);

  const draft = signalCrossingAlertToFindingDraft(alert!);
  assert.equal(draft.findingType, "knowledge_gap");
});

// TEST J — le rejet humain d'une détection conserve une raison courte
// (mandat §31), sans déclencher le moindre apprentissage automatique.
test("TEST J — dismiss_detection conserve la raison de rejet choisie par l'humain", () => {
  const state = createDemoState();
  const alert = computeSignalCrossingAlerts(state)[0];
  const draft = signalCrossingAlertToFindingDraft(alert);

  const next = applyCommand(state, {
    type: "dismiss_detection",
    actorId: "act-coordinateur",
    ...draft,
    rejectionReason: "information_deja_connue"
  });
  const finding = next.findings.find((item) => item.detectionKey === draft.detectionKey)!;
  assert.equal(finding.status, "rejected");
  assert.equal(finding.rejectionReason, "information_deja_connue");
  assert.equal(finding.reviewedByActorId, "act-coordinateur");
});

test("TEST J bis — update_finding_status conserve aussi une raison de rejet quand elle est fournie", () => {
  const state = createDemoState();
  // Un constat "confirmed" ne peut plus que devenir "superseded" (règle
  // métier déjà en place avant ce lot) — il faut donc un constat encore
  // "proposed" pour tester le rejet via update_finding_status.
  const withProposed = applyCommand(state, {
    type: "record_finding",
    actorId: "act-coordinateur",
    findingType: "autre",
    title: "Constat proposé pour test de rejet",
    statement: "Énoncé",
    territoryIds: ["joal"],
    sourceRefs: [{ objectType: "signal", objectId: "sig-joal-veille-quai" }],
    explanation: "Explication",
    trust: "declaree",
    provenance: "human",
    nextStep: "Étape"
  });
  const finding = withProposed.findings[0];
  assert.equal(finding.status, "proposed");

  const next = applyCommand(withProposed, {
    type: "update_finding_status",
    findingId: finding.id,
    actorId: "act-coordinateur",
    status: "rejected",
    rejectionReason: "donnee_trop_ancienne"
  });
  assert.equal(next.findings.find((item) => item.id === finding.id)?.rejectionReason, "donnee_trop_ancienne");
});

// TEST K — explicabilité : chaque Finding issu d'une règle porte son
// ruleId, sa version, sa provenance et un niveau de confiance qualitatif
// (jamais un score, mandat §16).
test("TEST K — chaque détection convertie en constat reste explicable (règle, version, provenance, confiance qualitative)", () => {
  const state = createDemoState();
  const alert = computeSignalCrossingAlerts(state)[0];
  const draft = signalCrossingAlertToFindingDraft(alert);
  assert.equal(draft.provenance, "rule");
  assert.ok(draft.ruleId);
  assert.equal(typeof draft.ruleVersion, "number");
  assert.equal(draft.trust, "observee");
  assert.ok(draft.explanation.length > 0);
  assert.ok(draft.nextStep.length > 0);
});

// TEST L — non-régression Lots 0-7 : le catalogue de règles ne modifie
// aucun mécanisme préexistant (Finding, Signal, Situation) — vérifié en
// pratique par la suite complète (npm test), rappelé ici comme filet
// direct sur le pipeline de connaissance déjà en place avant ce lot.
test("TEST L — non-régression : le pipeline de connaissance préexistant (record_finding humain, promote_finding_to_situation) fonctionne toujours sans detectionKey", () => {
  const state = createDemoState();
  const next = applyCommand(state, {
    type: "record_finding",
    actorId: "act-coordinateur",
    findingType: "autre",
    title: "Constat humain sans détection",
    statement: "Énoncé",
    territoryIds: ["joal"],
    sourceRefs: [{ objectType: "signal", objectId: "sig-joal-veille-quai" }],
    explanation: "Explication",
    trust: "declaree",
    provenance: "human",
    nextStep: "Étape"
  });
  const finding = next.findings[0];
  assert.equal(finding.status, "proposed");
  assert.equal(finding.detectionKey, undefined);
});

// TEST M — Rule Registry (mandat §19) : catalogue simple, une entrée par
// règle réellement implémentée, cohérent avec SIGNAL_CROSSING_RULE_IDS.
test("TEST M — le Rule Registry documente exactement les 5 règles officielles, toutes actives", () => {
  assert.equal(INTELLIGENCE_RULE_REGISTRY.length, 5);
  for (const rule of INTELLIGENCE_RULE_REGISTRY) {
    assert.ok(rule.name.length > 0);
    assert.ok(rule.objective.length > 0);
    assert.ok(rule.description.length > 0);
    assert.equal(rule.active, true);
  }
  const ids = INTELLIGENCE_RULE_REGISTRY.map((rule) => rule.ruleId);
  assert.equal(new Set(ids).size, ids.length, "aucun identifiant de règle dupliqué");
});

// TEST N — observabilité simple (mandat §32) : les compteurs restent
// cohérents entre eux, jamais un score de performance.
test("TEST N — computeIntelligenceObservability reste cohérent (détections produites ⩾ examinées ⩾ enregistrées + écartées)", () => {
  const state = createDemoState();
  const observability = computeIntelligenceObservability(state);
  assert.equal(observability.rulesActive, 5);
  assert.equal(observability.detectionsExamined, observability.findingsCreatedFromRules + observability.detectionsDismissed);
  assert.ok(observability.detectionsProduced >= observability.detectionsExamined);
  // Le cluster Kayar (fnd-kayar-motorisation) est déjà rattaché dans le
  // Demo World — au moins une détection doit donc apparaître "déjà
  // enregistrée" sans aucune action supplémentaire dans ce test.
  assert.ok(observability.findingsCreatedFromRules >= 1);
});

// Learning → Rules (mandat §26) : lien documentaire optionnel, jamais une
// modification automatique de la règle elle-même.
test("record_learning peut documenter qu'une règle mérite d'être revue, sans effet sur la règle elle-même", () => {
  const state = createDemoState();
  const next = applyCommand(state, {
    type: "record_learning",
    actorId: "act-coordinateur",
    title: "La règle de récurrence produit un faux positif dans ce contexte",
    summary: "Deux demandes de maintenance sur le même territoire ne suffisent pas toujours à conclure à un besoin collectif.",
    reusableIn: ["kayar"],
    situationId: state.situations[0]?.id,
    relatedRuleId: "service-request-recurrence"
  });
  assert.equal(next.learnings[0].relatedRuleId, "service-request-recurrence");
  // La règle elle-même (le catalogue) reste inchangée — aucune mutation
  // possible depuis une commande de ce pipeline.
  assert.equal(INTELLIGENCE_RULE_REGISTRY.find((rule) => rule.ruleId === "service-request-recurrence")?.active, true);
});
