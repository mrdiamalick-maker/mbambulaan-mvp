import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import type { Command, Role } from "../src/domain/types";
import { canRole } from "../src/server/permissions";
import { projectStateForSession } from "../src/server/access-projection";
import { buildWorkdayView } from "../src/domain/workday";

// P2.1-B — "Qualification Workspace". Fondation A (P2.1-A) et sa cascade
// (P2.1-A.1) restent inchangées ; ce lot construit la première expérience
// opérationnelle par-dessus, sans jamais fabriquer de connaissance
// automatique (Finding/Situation/CollectiveNeed/ProgramOpportunity).

const ALL_ROLES: Role[] = [
  "administrateur",
  "operateur",
  "capitaine",
  "mareyeur",
  "transformateur",
  "prestataire",
  "gestionnaire_organisation",
  "coordinateur",
  "institution",
  "partenaire"
];
const QUALIFY_ROLES: Role[] = ["administrateur", "coordinateur", "operateur"];

// TEST A/B — gating serveur de la matière brute (§2/§26.A/§26.B) : READ ≠
// QUALIFY (§1) — seuls les rôles qui peuvent réellement convertir une
// remontée la reçoivent dans la réponse projetée.
test("TEST A/B — seuls les rôles autorisés à qualifier reçoivent state.incomingMessages", () => {
  const state = createDemoState();
  assert.ok(state.incomingMessages.length > 0, "le Demo World doit porter au moins un message entrant pour ce test");

  for (const role of ALL_ROLES) {
    const actorId = state.actors.find((item) => item.role === role)?.id ?? "act-inconnu";
    const projected = projectStateForSession(state, { actorId, role });
    const allowed = QUALIFY_ROLES.includes(role);
    assert.equal(canRole(role, "convert_message_to_signal"), allowed, `canRole doit rester la seule source de vérité pour ${role}`);
    if (allowed) {
      assert.equal(projected.incomingMessages.length, state.incomingMessages.length, `${role} doit recevoir les remontées brutes`);
    } else {
      assert.equal(projected.incomingMessages.length, 0, `${role} ne doit recevoir AUCUNE remontée brute`);
      // Négatif de sérialisation (même discipline que P2.1-A/A.1, §11.I) —
      // aucun contenu de message entrant ne doit apparaître nulle part
      // dans la réponse projetée pour un rôle non autorisé.
      const serialized = JSON.stringify(projected);
      for (const message of state.incomingMessages) {
        assert.ok(!serialized.includes(message.body), `${role} : le corps d'un message entrant ne doit apparaître nulle part`);
      }
    }
  }
});

function pickUnconvertedMessageId(state: ReturnType<typeof createDemoState>) {
  const message = state.incomingMessages.find((item) => item.status === "nouveau");
  assert.ok(message, "le Demo World doit fournir au moins un message non converti pour ce test");
  return message!;
}

// TEST C — la source originale (message.body) n'est jamais réécrite par
// la qualification (mandat §8 : "Original ≠ Interprétation").
test("TEST C — le corps original du message reste inchangé après qualification", () => {
  const state = createDemoState();
  const message = pickUnconvertedMessageId(state);
  const originalBody = message.body;

  const next = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message.id,
    territoryId: "joal",
    category: "production",
    title: "Titre structuré par le coordinateur",
    description: "Description structurée, potentiellement différente du corps original."
  });

  const converted = next.incomingMessages.find((item) => item.id === message.id)!;
  assert.equal(converted.body, originalBody, "le corps original ne doit jamais être réécrit");
});

// TEST D — la qualification crée EXACTEMENT un Signal.
test("TEST D — qualifier une remontée crée exactement un Signal", () => {
  const state = createDemoState();
  const message = pickUnconvertedMessageId(state);
  const signalsBefore = state.signals.length;

  const next = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message.id,
    territoryId: "joal",
    category: "production",
    title: "Signal qualifié",
    description: "Description qualifiée."
  });

  assert.equal(next.signals.length, signalsBefore + 1);
});

// TEST E — traçabilité inverse intacte (garantie P2.1-A, réutilisée telle
// quelle par ce lot, mandat §11) — ET aucune Situation automatique
// (convert_message_to_signal seul, plus jamais _and_situation dans ce
// parcours).
test("TEST E — traçabilité bidirectionnelle intacte, aucune Situation créée", () => {
  const state = createDemoState();
  const message = pickUnconvertedMessageId(state);
  const situationsBefore = state.situations.length;

  const next = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message.id,
    territoryId: "joal",
    category: "production",
    title: "Signal qualifié",
    description: "Description qualifiée."
  });

  const signal = next.signals[0];
  assert.deepEqual(signal.sourceRef, { objectType: "incoming_message", objectId: message.id });
  const converted = next.incomingMessages.find((item) => item.id === message.id)!;
  assert.equal(converted.resultingSignalId, signal.id);
  assert.equal(converted.convertedByActorId, "act-coordinateur");
  assert.ok(converted.convertedAt);
  assert.equal(next.situations.length, situationsBefore, "aucune Situation automatique");
});

// TEST F — idempotence : une seconde qualification est impossible.
test("TEST F — une remontée déjà qualifiée ne peut pas l'être une seconde fois", () => {
  const state = createDemoState();
  const message = pickUnconvertedMessageId(state);
  const command: Extract<Command, { type: "convert_message_to_signal" }> = {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message.id,
    territoryId: "joal",
    category: "production",
    title: "Signal qualifié",
    description: "Description qualifiée."
  };
  const once = applyCommand(state, command);
  const signalsAfterFirst = once.signals.length;
  assert.throws(() => applyCommand(once, command), /déjà été converti/);
  assert.equal(once.signals.length, signalsAfterFirst, "aucun second Signal, même après une tentative rejouée");
});

// TEST G — l'écartement humain ne crée jamais de Signal.
test("TEST G — écarter une remontée ne crée aucun Signal", () => {
  const state = createDemoState();
  const message = pickUnconvertedMessageId(state);
  const signalsBefore = state.signals.length;

  const next = applyCommand(state, {
    type: "dismiss_incoming_message",
    actorId: "act-coordinateur",
    messageId: message.id,
    reason: "hors_perimetre"
  });

  assert.equal(next.signals.length, signalsBefore);
  const dismissed = next.incomingMessages.find((item) => item.id === message.id)!;
  assert.equal(dismissed.status, "ecarte");
  assert.equal(dismissed.dismissedReason, "hors_perimetre");
  assert.equal(dismissed.dismissedByActorId, "act-coordinateur");
  assert.ok(dismissed.dismissedAt);
});

// TEST H — doublon humain : aucun matching automatique, référence
// structurelle optionnelle vers un Signal réel uniquement.
test("TEST H — écarter comme doublon référence un Signal réel sans jamais créer de nouveau Signal", () => {
  const state = createDemoState();
  const message = pickUnconvertedMessageId(state);
  const existingSignalId = state.signals[0].id;
  const signalsBefore = state.signals.length;

  const next = applyCommand(state, {
    type: "dismiss_incoming_message",
    actorId: "act-coordinateur",
    messageId: message.id,
    reason: "doublon",
    duplicateOfSignalId: existingSignalId,
    note: "Déjà couvert par un signal existant."
  });

  assert.equal(next.signals.length, signalsBefore);
  const dismissed = next.incomingMessages.find((item) => item.id === message.id)!;
  assert.equal(dismissed.duplicateOfSignalId, existingSignalId);
  assert.equal(dismissed.dismissedNote, "Déjà couvert par un signal existant.");

  // Référence structurelle validée, jamais acceptée telle quelle.
  assert.throws(
    () =>
      applyCommand(state, {
        type: "dismiss_incoming_message",
        actorId: "act-coordinateur",
        messageId: message.id,
        reason: "doublon",
        duplicateOfSignalId: "obs-inexistant"
      }),
    /introuvable/
  );
});

// TEST I — le territoire ne résout jamais que vers un Territory réel.
test("TEST I — la qualification exige un territoire réel ; l'écartement n'en exige aucun", () => {
  const state = createDemoState();
  const message = pickUnconvertedMessageId(state);

  assert.throws(
    () =>
      applyCommand(state, {
        type: "convert_message_to_signal",
        actorId: "act-coordinateur",
        messageId: message.id,
        territoryId: "territoire-inexistant",
        category: "production",
        title: "Signal qualifié",
        description: "Description qualifiée."
      }),
    /Territoire inconnu/
  );

  // dismiss_incoming_message n'exige aucun territoire — écarter une
  // remontée n'est jamais une résolution territoriale.
  const next = applyCommand(state, { type: "dismiss_incoming_message", actorId: "act-coordinateur", messageId: message.id, reason: "autre" });
  assert.equal(next.incomingMessages.find((item) => item.id === message.id)!.status, "ecarte");
});

// TEST J — Finding/Situation/CollectiveNeed/ProgramOpportunity restent
// inchangés après qualification ET après écartement (mandat §12/§13 :
// aucune création automatique).
test("TEST J — aucune connaissance fabriquée automatiquement, qualification comme écartement", () => {
  const state = createDemoState();
  const [messageA, messageB] = state.incomingMessages.filter((item) => item.status === "nouveau");
  assert.ok(messageA && messageB, "le Demo World doit fournir au moins deux messages non convertis pour ce test");

  const counts = (s: typeof state) => ({
    situations: s.situations.length,
    findings: s.findings.length,
    collectiveNeeds: s.collectiveNeeds.length,
    programOpportunities: s.programOpportunities.length
  });
  const before = counts(state);

  const afterConvert = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: messageA.id,
    territoryId: "joal",
    category: "production",
    title: "Signal qualifié",
    description: "Description qualifiée."
  });
  assert.deepEqual(counts(afterConvert), before);

  const afterDismiss = applyCommand(afterConvert, { type: "dismiss_incoming_message", actorId: "act-coordinateur", messageId: messageB.id, reason: "information_insuffisante" });
  assert.deepEqual(counts(afterDismiss), before);
});

// TEST K — audit actor/date/action présent pour les deux gestes.
test("TEST K — la qualification et l'écartement produisent chacun une entrée d'audit actor/date/action", () => {
  const state = createDemoState();
  const [messageA, messageB] = state.incomingMessages.filter((item) => item.status === "nouveau");
  const auditBefore = state.audit.length;

  const afterConvert = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: messageA.id,
    territoryId: "joal",
    category: "production",
    title: "Signal qualifié",
    description: "Description qualifiée."
  });
  assert.equal(afterConvert.audit.length, auditBefore + 1);
  assert.equal(afterConvert.audit[0].actorId, "act-coordinateur");
  assert.equal(afterConvert.audit[0].objectType, "signal");
  assert.ok(afterConvert.audit[0].at);

  const afterDismiss = applyCommand(afterConvert, { type: "dismiss_incoming_message", actorId: "act-operateur", messageId: messageB.id, reason: "doublon", note: "Note de contexte." });
  assert.equal(afterDismiss.audit.length, auditBefore + 2);
  assert.equal(afterDismiss.audit[0].actorId, "act-operateur");
  assert.equal(afterDismiss.audit[0].objectType, "incoming_message");
  assert.equal(afterDismiss.audit[0].action, "dismiss_incoming_message");
  assert.ok(afterDismiss.audit[0].at);
  assert.ok(afterDismiss.audit[0].detail.includes("Doublon"));
});

// TEST L (non-régression source) — le composant réutilise bien le
// vocabulaire du mandat (§4) et n'affiche plus la coupure Situation
// automatique (grep du code source, même discipline que le reste de
// l'engagement pour un composant qui dépend de ProductProvider et ne
// peut pas être rendu isolément).
test("TEST L — CoordinationWorkspace.tsx : vocabulaire P2.1-B et gating rôle présents, plus de conversion couplée à une Situation", () => {
  const source = readFileSync(fileURLToPath(new URL("../src/components/ecosystem/CoordinationWorkspace.tsx", import.meta.url)), "utf8");
  assert.ok(source.includes("Qualifier comme signal"));
  assert.ok(source.includes("Source originale"));
  assert.ok(source.includes("Ce que nous comprenons"));
  assert.ok(source.includes("canQualifyIntake"));
  assert.ok(source.includes('type: "convert_message_to_signal"') && !source.includes('type: "convert_message_to_signal_and_situation"'), "le composeur de qualification ne doit plus dispatcher le wrapper legacy Signal+Situation");
  assert.ok(source.includes("dismiss_incoming_message"));
});

// TEST M — les ponts PublicRequest/PublicContribution → Signal (P2.1-A)
// ne sont pas régressés par ce lot : aucune référence au wrapper
// Signal+Situation, sourceRef toujours présent.
test("TEST M — les ponts Public restent non régressés (aucun wrapper Signal+Situation, sourceRef intact)", () => {
  const bridgeFiles = [
    fileURLToPath(new URL("../src/domain/public-request-signal-bridge.ts", import.meta.url)),
    fileURLToPath(new URL("../src/domain/public-contribution-signal-bridge.ts", import.meta.url))
  ];
  for (const path of bridgeFiles) {
    const source = readFileSync(path, "utf8");
    assert.ok(!source.includes("_and_situation"), `${path} ne doit jamais créer de Situation automatique`);
    assert.ok(source.includes("sourceRef:"), `${path} doit toujours tracer sa source (P2.1-A)`);
  }
});

// --- Aujourd'hui (§19) --------------------------------------------------

test("Aujourd'hui — l'item agrégé 'à qualifier' n'apparaît que pour les rôles habilités, jamais critique/vigilance", () => {
  const state = createDemoState();
  for (const role of QUALIFY_ROLES) {
    const actorId = state.actors.find((item) => item.role === role)?.id ?? "act-inconnu";
    const view = buildWorkdayView(state, actorId, role);
    const item = view.myAttention.find((entry) => entry.id === "intake:pending");
    assert.ok(item, `${role} doit voir l'item agrégé (Demo World porte des remontées non converties)`);
    assert.equal(item!.urgency, "normale", "jamais de criticité fabriquée pour une remontée brute (mandat §5)");
    assert.equal(item!.category, "qualification_intake");
  }

  for (const role of ALL_ROLES.filter((item) => !QUALIFY_ROLES.includes(item))) {
    const actorId = state.actors.find((item) => item.role === role)?.id ?? "act-inconnu";
    const view = buildWorkdayView(state, actorId, role);
    assert.ok(!view.myAttention.some((entry) => entry.id === "intake:pending"), `${role} ne doit jamais voir l'item de qualification intake`);
  }
});

test("Aujourd'hui — aucun item 'à qualifier' quand la file est vide", () => {
  const state = createDemoState();
  const withoutPending = {
    ...state,
    incomingMessages: state.incomingMessages.map((item) => (item.status === "nouveau" ? { ...item, status: "converti" as const } : item))
  };
  const view = buildWorkdayView(withoutPending, "act-coordinateur", "coordinateur");
  assert.ok(!view.myAttention.some((entry) => entry.id === "intake:pending"));
});
