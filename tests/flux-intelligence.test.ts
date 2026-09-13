// Tests PD.4 — "Product Dressing — Situations & Flux Real Domain
// Integration", volet Flux. Portent sur src/domain/flux-intelligence.ts
// et src/v3-template/lib/flux-bridge.ts (§20 du mandat : "IncomingMessage
// projection; conversion to Signal; dismissal; real actions only").
import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import {
  CONVERT_TO_SIGNAL_EFFECT,
  DISMISS_EFFECT,
  fluxAgeHours,
  fluxMatchedFacts,
  fluxMissingFacts,
  fluxStage,
  fluxStageCounts,
  resolveReporterActor,
  resolveTerritoryHint
} from "../src/domain/flux-intelligence";
import { buildFluxStages, FLUX_ROWS, getFluxDetail } from "../src/v3-template/lib/flux-bridge";

const state = createDemoState();

test("projection IncomingMessage : les 4 messages réels du Demo World sont tous exposés", () => {
  assert.equal(state.incomingMessages.length, 4);
  assert.equal(FLUX_ROWS.length, 4);
  for (const row of FLUX_ROWS) {
    assert.ok(state.incomingMessages.some((m) => m.id === row.realId));
  }
});

test("résolution de territoire : les 4 territoryHint réels résolvent tous vers un Territory réel", () => {
  for (const message of state.incomingMessages) {
    const territory = resolveTerritoryHint(state, message);
    assert.ok(territory, `territoryHint "${message.territoryHint}" doit résoudre pour ${message.id}`);
  }
  const unresolvable = { ...state.incomingMessages[0], territoryHint: "Lieu imaginaire" };
  assert.equal(resolveTerritoryHint(state, unresolvable), undefined);
  const absent = { ...state.incomingMessages[0], territoryHint: undefined };
  assert.equal(resolveTerritoryHint(state, absent), undefined);
});

test("résolution du déclarant : reportedByActorId résout vers un Actor réel quand renseigné, honnêtement absent sinon", () => {
  const withActor = state.incomingMessages.find((m) => m.reportedByActorId);
  assert.ok(withActor, "au moins un message réel doit avoir un reportedByActorId");
  assert.ok(resolveReporterActor(state, withActor!));

  const withoutActor = state.incomingMessages.find((m) => !m.reportedByActorId);
  assert.ok(withoutActor);
  assert.equal(resolveReporterActor(state, withoutActor!), undefined);
});

test("faits rattachés/manquants : uniquement des faits réellement résolus, jamais une extraction de texte libre", () => {
  for (const message of state.incomingMessages) {
    const matched = fluxMatchedFacts(state, message);
    const missing = fluxMissingFacts(state, message);
    const territory = resolveTerritoryHint(state, message);
    const reporter = resolveReporterActor(state, message);
    assert.equal(matched.some((f) => f.label === "Territoire"), Boolean(territory));
    assert.equal(matched.some((f) => f.label === "Déclarant"), Boolean(reporter));
    assert.equal(missing.length + matched.length >= 1, true);
  }
});

test("regroupement de palier honnête : 'à qualifier' couvre exactement les messages 'nouveau' (aucun palier fabriqué)", () => {
  for (const message of state.incomingMessages) {
    assert.equal(fluxStage(message), message.status === "nouveau" ? "a_qualifier" : message.status === "converti" ? "qualifie" : "ecarte");
  }
  const counts = fluxStageCounts(state);
  assert.equal(counts.a_qualifier, state.incomingMessages.filter((m) => m.status === "nouveau").length);
  assert.equal(counts.qualifie + counts.ecarte, state.incomingMessages.length - counts.a_qualifier);
});

test("conversion en signal : la commande réelle convert_message_to_signal transforme un message 'nouveau' en Signal traçable", () => {
  // Exercice direct de la commande réelle (rules.ts) plutôt qu'une
  // simulation locale — vérifie que le pipeline que Flux décrit est
  // authentique.
  const message = state.incomingMessages.find((m) => m.status === "nouveau")!;
  const territory = resolveTerritoryHint(state, message)!;
  const before = state.signals.length;

  const next = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message.id,
    territoryId: territory.id,
    category: "marche",
    title: "Test de conversion",
    description: "Description de test"
  });

  assert.equal(next.signals.length, before + 1);
  const newSignal = next.signals[0];
  assert.equal(newSignal.sourceRef?.objectType, "incoming_message");
  assert.equal((newSignal.sourceRef as { objectId: string }).objectId, message.id);
  const updatedMessage = next.incomingMessages.find((m: { id: string }) => m.id === message.id)!;
  assert.equal(updatedMessage.status, "converti");
  assert.equal(updatedMessage.resultingSignalId, newSignal.id);
});

test("écartement : la commande réelle dismiss_incoming_message marque le message écarté, jamais supprimé", () => {
  const message = state.incomingMessages.find((m) => m.status === "nouveau")!;
  const next = applyCommand(state, {
    type: "dismiss_incoming_message",
    actorId: "act-coordinateur",
    messageId: message.id,
    reason: "hors_perimetre"
  });
  const updated = next.incomingMessages.find((m: { id: string }) => m.id === message.id)!;
  assert.equal(updated.status, "ecarte");
  assert.equal(next.incomingMessages.length, state.incomingMessages.length);
});

test("actions réelles uniquement : un message 'nouveau' n'expose que les 2 commandes réelles, jamais une action fictive du gabarit", () => {
  const rowId = FLUX_ROWS.findIndex((r) => r.status === "nouveau");
  assert.ok(rowId >= 0);
  const detail = getFluxDetail(rowId)!;
  assert.equal(detail.actions.length, 2);
  assert.deepEqual(detail.actions.map((a) => a.kind).sort(), ["convert", "dismiss"]);
  assert.ok(detail.actions.find((a) => a.kind === "convert")!.effect === CONVERT_TO_SIGNAL_EFFECT);
  assert.ok(detail.actions.find((a) => a.kind === "dismiss")!.effect === DISMISS_EFFECT);
  // PD.5 — ces deux commandes sont désormais réellement exécutables
  // depuis /private-v3 (lib/domain-runtime.ts) : le texte décrit l'effet
  // réel, ce n'est plus un aperçu non exécuté.
  for (const action of detail.actions) assert.match(action.effect, /convert_message_to_signal|dismiss_incoming_message/);
});

test("empty/incomplete : un identifiant de ligne inconnu ne produit aucun objet partiel", () => {
  assert.equal(getFluxDetail(9999), undefined);
});

test("âge en heures : dérivé uniquement de receivedAt et d'une date de référence réelle, jamais Date.now()", () => {
  const message = state.incomingMessages[0];
  const hours = fluxAgeHours(message.receivedAt, message);
  assert.equal(hours, 0);
  const oneDayLater = new Date(new Date(message.receivedAt).getTime() + 26 * 60 * 60 * 1000).toISOString();
  assert.equal(fluxAgeHours(oneDayLater, message), 26);
});

test("paliers de Flux : 3 paliers réels seulement (mandat §1, pas de 4e palier fabriqué)", () => {
  const stages = buildFluxStages();
  assert.equal(stages.length, 3);
  assert.deepEqual(stages.map((s) => s.key), ["a_qualifier", "qualifie", "ecarte"]);
});
