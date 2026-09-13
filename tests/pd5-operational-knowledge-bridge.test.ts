// Tests PD.5 — "Product Dressing — Operational Knowledge Bridge /
// Maritime Objects → Findings → Situations → Real Actions". §18 (tests
// domaine) et §19 (vertical slice) du mandat.
//
// Portée : le runtime V3 (v3-template/lib/domain-runtime.ts) est un hook
// React côté client ("use client", fetch, next/headers indirectement via
// les routes /api/*) — non testable unitairement dans ce projet (pas de
// DOM/jsdom, cf. tests/p21b1-session-state-isolation.test.ts, "absent de
// ce projet par choix"). Ce fichier teste donc :
//   (a) la mécanique du runtime PAR LECTURE DE SOURCE (mêmes garanties
//       architecturales que TEST G/H, tests/xxl-r0-demo-integrity.test.ts —
//       un motif déjà établi dans ce dépôt) ;
//   (b) le chemin canonique réel que le runtime emprunte —
//       server/permissions.ts (assertCan, aucun "server-only") et
//       applyCommand (rules.ts) — avec les commandes exactement telles
//       que les ponts v3-template/lib/{flux,situations}-bridge.ts les
//       construisent, jamais une commande fabriquée à la main pour le
//       test ;
//   (c) la chaîne verticale maritime réelle construite dans
//       demo-state.ts (détection → constat proposé → confirmé →
//       situation → contexte maritime PD.4).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { detectCapacityFreshnessGapAlerts, detectImpairedInfrastructureAlerts, signalCrossingAlertToFindingDraft } from "../src/domain/signal-crossing";
import { resolveFindingConvergence, resolveMaritimeContext } from "../src/domain/situation-intelligence";
import { assertCan, canRole } from "../src/server/permissions";
import { buildConvertCommand, buildDismissCommand } from "../src/v3-template/lib/flux-bridge";
import { buildDecisionCommand, getSituationDetail } from "../src/v3-template/lib/situations-bridge";

const RUNTIME_SOURCE = readFileSync(new URL("../src/v3-template/lib/domain-runtime.ts", import.meta.url), "utf8");

// --- §18 (a) — architecture du runtime V3 --------------------------------

test("PD.5 §2/§3 — le runtime V3 lit/écrit exclusivement les 2 routes canoniques, jamais un état côté client", () => {
  assert.match(RUNTIME_SOURCE, /fetch\("\/api\/state"/, "le runtime doit lire l'état via GET /api/state");
  assert.match(RUNTIME_SOURCE, /fetch\("\/api\/actions"/, "le runtime doit exécuter les commandes via POST /api/actions");
  // Jamais un champ demoState dans le corps de la requête (P2.1-B.1 :
  // "les données envoyées par le client ne sont jamais une preuve
  // d'autorisation") — chaque commande doit passer par dispatch()/
  // getState() (server/repository.ts), la seule persistance réellement
  // canonique, jamais une mutation qui ne vivrait que dans le navigateur.
  // (Le mot "demoState" apparaît dans les commentaires du fichier pour
  // documenter précisément cette absence — on vérifie ici l'absence du
  // CHAMP littéral "demoState:", pas du mot dans la prose.)
  assert.doesNotMatch(RUNTIME_SOURCE, /demoState\s*:/, "le runtime ne doit jamais envoyer un champ demoState au serveur");
});

test("PD.5 §2 — le runtime V3 n'importe jamais l'architecture UI légataire (ProductProvider)", () => {
  // (Le nom "ProductProvider" apparaît dans les commentaires pour
  // documenter précisément cette exclusion — on vérifie ici l'absence
  // d'un IMPORT réel, pas du mot dans la prose.)
  assert.doesNotMatch(RUNTIME_SOURCE, /\bimport\b[^;]*ProductProvider/, "le runtime doit rester indépendant de src/components/providers/ProductProvider.tsx");
  assert.doesNotMatch(RUNTIME_SOURCE, /from\s+["'][^"']*ProductProvider["']/);
});

test("PD.5 §21/§6 — aucune nouvelle conception d'authentification : réutilise /api/auth/login existant avec le compte de démonstration déjà semé", () => {
  assert.match(RUNTIME_SOURCE, /\/api\/auth\/login/);
  assert.match(RUNTIME_SOURCE, /demo@mbambulaan\.sn/);
  // Le rôle AFFICHÉ de V3 (AppState.role) ne doit jamais transiter par ce
  // module — seul le rôle réel (Role, session serveur) compte pour
  // l'autorisation, jamais RoleKey (ministre/programme/coordination).
  assert.doesNotMatch(RUNTIME_SOURCE, /RoleKey/);
});

// --- §18 (b) — autorisation réelle de l'acteur choisi (coordinateur) ----

test("PD.5 §6 — l'acteur réel du runtime (coordinateur) est autorisé pour les 3 commandes rendues exécutables", () => {
  assert.ok(canRole("coordinateur", "convert_message_to_signal"));
  assert.ok(canRole("coordinateur", "dismiss_incoming_message"));
  assert.ok(canRole("coordinateur", "create_decision"));
});

test("PD.5 §6 — assertCan reste seul juge : un rôle non autorisé est refusé même avec une commande par ailleurs valide", () => {
  const state = createDemoState();
  const message = state.incomingMessages.find((m) => m.status === "nouveau")!;
  assert.throws(() =>
    assertCan("mareyeur", { type: "dismiss_incoming_message", actorId: "act-mareyeur", messageId: message.id, reason: "hors_perimetre" })
  );
});

// --- §18 (c) — les ponts V3 construisent des commandes canoniques réelles,
// jamais une exécution simulée / logique dupliquée -----------------------

test("PD.5 §4 — buildConvertCommand produit une commande convert_message_to_signal réelle, acceptée par applyCommand", () => {
  const state = createDemoState();
  const withTerritory = state.incomingMessages.find((m) => m.status === "nouveau" && m.territoryHint);
  assert.ok(withTerritory, "le Demo World doit contenir un message 'nouveau' avec un territoryHint résoluble");

  // Reconstruit le rowId (ordre receivedAt croissant, même tri que le pont).
  const sorted = [...state.incomingMessages].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
  const rowId = sorted.findIndex((m) => m.id === withTerritory!.id);
  assert.ok(rowId >= 0);

  const result = buildConvertCommand(state, rowId, "infrastructure");
  assert.ok("command" in result, `attendu une commande, reçu une erreur : ${"error" in result ? result.error : ""}`);
  if (!("command" in result)) return;
  assert.equal(result.command.type, "convert_message_to_signal");
  assertCan("coordinateur", { ...result.command, actorId: "act-coordinateur" });

  const before = state.signals.length;
  const next = applyCommand(state, { ...result.command, actorId: "act-coordinateur" });
  assert.equal(next.signals.length, before + 1);
  const updated = next.incomingMessages.find((m) => m.id === withTerritory!.id)!;
  assert.equal(updated.status, "converti");
});

test("PD.5 §4 — buildDismissCommand produit une commande dismiss_incoming_message réelle, avec un motif humain explicite", () => {
  const state = createDemoState();
  const message = state.incomingMessages.find((m) => m.status === "nouveau")!;
  const sorted = [...state.incomingMessages].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
  const rowId = sorted.findIndex((m) => m.id === message.id);

  const result = buildDismissCommand(state, rowId, "doublon");
  assert.ok("command" in result);
  if (!("command" in result)) return;
  assert.equal(result.command.type, "dismiss_incoming_message");
  assert.equal((result.command as { reason: string }).reason, "doublon");

  const next = applyCommand(state, { ...result.command, actorId: "act-coordinateur" });
  const updated = next.incomingMessages.find((m) => m.id === message.id)!;
  assert.equal(updated.status, "ecarte");
});

test("PD.5 §4 — buildConvertCommand refuse honnêtement quand aucun territoire ne résout, jamais une commande fabriquée", () => {
  const state = createDemoState();
  const withoutTerritory = { ...state.incomingMessages[0], id: "msg-test-sans-territoire", territoryHint: "Lieu imaginaire", status: "nouveau" as const };
  const patched = { ...state, incomingMessages: [withoutTerritory, ...state.incomingMessages] };
  const result = buildConvertCommand(patched, 0, "infrastructure");
  assert.ok("error" in result);
});

test("PD.5 §4 — buildDecisionCommand refuse une justification vide, jamais déduite (create_decision réel sinon)", () => {
  const state = createDemoState();
  const situation = state.situations[0];
  const empty = buildDecisionCommand(state, situation.id, "ouvrir_coordination", "   ");
  assert.ok("error" in empty);

  const filled = buildDecisionCommand(state, situation.id, "ouvrir_coordination", "Contexte vérifié avec le relais territorial.");
  assert.ok("command" in filled);
  if (!("command" in filled)) return;
  assertCan("coordinateur", { ...filled.command, actorId: "act-coordinateur" });
  const before = state.decisions.length;
  const next = applyCommand(state, { ...filled.command, actorId: "act-coordinateur" });
  assert.equal(next.decisions.length, before + 1);
});

// --- §19 — vertical slice maritime réelle (pattern B, §11) ---------------

test("PD.5 §11/§19 — vertical slice maritime réelle : détection → constat proposé → confirmé (humain) → situation → contexte maritime", () => {
  const state = createDemoState();

  const finding = state.findings.find((f) => f.ruleId === "impaired-infrastructure-on-active-site");
  assert.ok(finding, "le Demo World doit porter un constat matérialisé depuis la règle déterministe réelle");
  assert.equal(finding!.provenance, "rule");
  assert.equal(finding!.status, "confirmed", "DETECTION ≠ FINDING CONFIRMED : la confirmation reste une étape humaine explicite, pas automatique");
  assert.ok(finding!.reviewedByActorId, "la confirmation doit être attribuée à un acteur réel");
  assert.ok(finding!.promotedToSituationId, "SITUATION reste une promotion explicite distincte de la confirmation");

  // Traçabilité réelle : les sourceRefs citent des objets maritimes
  // réels, jamais réduits à territoryId seul (mandat §8).
  const objectTypes = new Set(finding!.sourceRefs.map((ref) => ref.objectType));
  assert.ok(objectTypes.has("infrastructure") || objectTypes.has("landing") || objectTypes.has("site") || objectTypes.has("capacity"));
  assert.ok(!(objectTypes.size === 1 && objectTypes.has("territory")), "l'évidence ne doit jamais être réduite au seul territoryId");

  const situation = state.situations.find((s) => s.id === finding!.promotedToSituationId)!;
  assert.ok(situation);
  assert.equal(situation.findingId, finding!.id);

  // PD.4 : le bloc existant s'active automatiquement, jamais redessiné.
  const maritime = resolveMaritimeContext(state, situation);
  assert.ok(maritime.length > 0, "resolveMaritimeContext (PD.4, inchangé) doit s'activer pour cette Situation réelle");

  const detail = state.situations
    .map((_, i) => getSituationDetail(i, state))
    .find((d) => d?.realId === situation.id);
  assert.ok(detail, "le pont v3-template doit exposer cette Situation");
  assert.ok(detail!.maritimeContext.length > 0, "le bloc « Contexte maritime » de PD.4 doit être non vide pour cette Situation dans la vue V3");
});

test("PD.5 §10 — aucune promotion automatique : un constat encore proposé ne peut pas être orienté vers une Situation", () => {
  const state = createDemoState();
  const alerts = detectImpairedInfrastructureAlerts(state);
  const freeAlert = alerts.find((a) => !state.findings.some((f) => f.detectionKey === a.id));
  assert.ok(freeAlert, "il doit rester au moins une détection encore libre pour ce test");
  const draft = signalCrossingAlertToFindingDraft(freeAlert!);
  const proposed = applyCommand(state, { type: "record_finding", actorId: "act-coordinateur", ...draft });
  const proposedFinding = proposed.findings.find((f) => f.detectionKey === draft.detectionKey)!;
  assert.equal(proposedFinding.status, "proposed");

  assert.throws(
    () => applyCommand(proposed, { type: "promote_finding_to_situation", actorId: "act-coordinateur", findingId: proposedFinding.id }),
    /confirmé/
  );
});

test("PD.5 §13 — convergence documentaire : réutilise P2.3-A tel quel, jamais forcée artificiellement pour la démonstration", () => {
  const state = createDemoState();
  const finding = state.findings.find((f) => f.ruleId === "impaired-infrastructure-on-active-site")!;
  const situation = state.situations.find((s) => s.id === finding.promotedToSituationId)!;
  // Constat honnête : cette Situation ne participe à aucune convergence
  // fabriquée pour l'occasion — le mécanisme reste réel et générique,
  // il s'active seulement si une convergence existe réellement (cf.
  // situation-intelligence.test.ts, "s'active pour une Situation dont le
  // Finding participe réellement à un groupe").
  const convergence = resolveFindingConvergence(state, situation);
  assert.equal(convergence, undefined);
});

test("PD.5 §14 — la fraîcheur de capacité (PD.3) reste un knowledge_gap, jamais une preuve d'indisponibilité, après ce lot", () => {
  const state = createDemoState();
  const alert = detectCapacityFreshnessGapAlerts(state)[0];
  assert.ok(alert, "le Demo World doit toujours produire au moins une détection de fraîcheur de capacité");
  const draft = signalCrossingAlertToFindingDraft(alert);
  assert.equal(draft.findingType, "knowledge_gap");
  assert.doesNotMatch(draft.statement, /capacité[s]? indisponible/i);
  assert.match(draft.statement, /à revérifier/);
});

test("PD.5 §16 — aucun Situation.siteId n'a été ajouté : la traçabilité passe par Finding/sourceRefs, pas par une nouvelle relation de localisation", () => {
  const state = createDemoState();
  for (const situation of state.situations) {
    assert.equal(Object.prototype.hasOwnProperty.call(situation, "siteId"), false, `${situation.id} ne doit pas porter siteId`);
    assert.equal(Object.prototype.hasOwnProperty.call(situation, "landingId"), false, `${situation.id} ne doit pas porter landingId`);
  }
});

test("PD.5 §19 — non-régression : la chaîne verticale maritime reste déterministe entre deux appels de createDemoState()", () => {
  const first = createDemoState();
  const second = createDemoState();
  assert.deepEqual(first, second);
});
