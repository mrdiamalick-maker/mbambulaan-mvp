import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import type { Actor, Command, Organization, ProductState, Situation } from "../src/domain/types";
import { attemptPublicRequestSignalSync } from "../src/domain/public-request-signal-bridge";
import { attemptPublicContributionSignalSync } from "../src/domain/public-contribution-signal-bridge";
import { projectStateForSession, TRANSVERSE_READ_ROLES } from "../src/server/access-projection";

// P2.1-A — "Intake Traceability & Data Access Foundation". Fondation A
// (source ↔ Signal) et Fondation B (projection de lecture serveur),
// testées ici séparément puis dans leur composition avec le vrai Demo
// World. Même discipline de test que le reste du domaine :
// applyCommand/projectStateForSession restent des fonctions pures,
// aucune dépendance "server-only" (repository.ts, session.ts) requise.

// Fake Core (getState/dispatch) — même mécanisme que
// tests/public-request-signal.test.ts (Set de clés déjà rejouées +
// applyCommand), réutilisé ici pour tester la traçabilité bidirectionnelle
// des deux ponts Public sans dépendre de "server-only".
function makeFakeCore(initial: ProductState) {
  let state = initial;
  const usedKeys = new Set<string>();
  return {
    getState: async () => state,
    dispatch: async (command: Command, idempotencyKey: string) => {
      if (!usedKeys.has(idempotencyKey)) {
        usedKeys.add(idempotencyKey);
        state = applyCommand(state, command);
      }
      return state;
    },
    getCurrentState: () => state
  };
}

// TEST A — create_signal sans sourceRef (saisie directe, rôle terrain/
// coordination) : repli "direct", jamais un sourceRef fabriqué.
test("TEST A — create_signal sans sourceRef produit un Signal { objectType: 'direct' }", () => {
  const state = createDemoState();
  const next = applyCommand(state, {
    type: "create_signal",
    actorId: "act-operateur",
    territoryId: "joal",
    title: "Signal saisi directement",
    description: "Observation terrain sans intake préalable.",
    channel: "poste_quai"
  });
  assert.deepEqual(next.signals[0].sourceRef, { objectType: "direct" });
});

// TEST B — create_signal avec sourceRef explicite (comme les ponts
// Public) : transmis tel quel sur le Signal produit.
test("TEST B — create_signal avec sourceRef explicite le reporte fidèlement sur le Signal", () => {
  const state = createDemoState();
  const next = applyCommand(state, {
    type: "create_signal",
    actorId: "act-espace-public",
    title: "sourcing — demande de l'espace public",
    description: "Recherche de volumes.",
    channel: "espace_public",
    sourceRef: { objectType: "public_request", objectId: "pr-abc" }
  });
  assert.deepEqual(next.signals[0].sourceRef, { objectType: "public_request", objectId: "pr-abc" });
});

// TEST C — convert_message_to_signal : traçabilité structurée dans les
// DEUX sens — Signal.sourceRef pointe vers le message, et le message
// converti pointe en retour vers le Signal produit (resultingSignalId/
// convertedAt/convertedByActorId), sans aucun texte libre.
test("TEST C — convert_message_to_signal établit une traçabilité bidirectionnelle structurée", () => {
  const state = createDemoState();
  const message = state.incomingMessages.find((item) => item.status === "nouveau");
  assert.ok(message, "le Demo World doit fournir au moins un message non converti pour ce test");

  const next = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message!.id,
    territoryId: "joal",
    category: "production",
    title: "Message converti",
    description: "Conversion d'un message entrant en Signal."
  });

  const signal = next.signals[0];
  assert.deepEqual(signal.sourceRef, { objectType: "incoming_message", objectId: message!.id });

  const converted = next.incomingMessages.find((item) => item.id === message!.id)!;
  assert.equal(converted.status, "converti");
  assert.equal(converted.resultingSignalId, signal.id);
  assert.equal(converted.convertedByActorId, "act-coordinateur");
  assert.ok(converted.convertedAt);
});

// TEST D — Idempotence (mandat : "convertir deux fois → exactement un
// Signal"), en réutilisant le mécanisme déjà existant (message.status ===
// "converti" → rejeté), pas un nouveau garde-fou.
test("TEST D — convertir deux fois le même message ne produit jamais un second Signal", () => {
  const state = createDemoState();
  const message = state.incomingMessages.find((item) => item.status === "nouveau")!;
  const signalsBefore = state.signals.length;

  const command: Extract<Command, { type: "convert_message_to_signal" }> = {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message.id,
    territoryId: "joal",
    category: "production",
    title: "Message converti",
    description: "Première conversion."
  };
  const once = applyCommand(state, command);
  assert.equal(once.signals.length, signalsBefore + 1);

  assert.throws(() => applyCommand(once, command), /déjà été converti/);
  assert.equal(once.signals.length, signalsBefore + 1, "aucun second Signal, même après une tentative rejouée");
});

// TEST E — attemptPublicRequestSignalSync : traçabilité bidirectionnelle
// complète — PublicRequest.coreSignalId (déjà existant) ET
// Signal.sourceRef (nouveau) pointent l'un vers l'autre.
test("TEST E — le pont PublicRequest trace la source sur le Signal produit, dans les deux sens", async () => {
  const core = makeFakeCore(createDemoState());
  const request = {
    id: "pr-traceability-1",
    territory: "Joal-Fadiouth",
    source: "web" as const,
    intent: "sourcing" as const,
    description: "Recherche de volumes de sardinelle.",
    createdAt: new Date().toISOString()
  };

  const { signalId } = await attemptPublicRequestSignalSync(request, core);
  assert.ok(signalId);
  const signal = core.getCurrentState().signals.find((item) => item.id === signalId);
  assert.deepEqual(signal?.sourceRef, { objectType: "public_request", objectId: request.id });
});

// TEST F — même traçabilité pour le pont PublicContribution.
test("TEST F — le pont PublicContribution trace la source sur le Signal produit", async () => {
  const core = makeFakeCore(createDemoState());
  const contribution = {
    id: "ctb-traceability-1",
    actorType: "transformateur" as const,
    services: "Transformation de sardinelle fumée.",
    territories: "Joal, Mbour",
    createdAt: new Date().toISOString()
  };

  const { signalId } = await attemptPublicContributionSignalSync(contribution, core);
  assert.ok(signalId);
  const signal = core.getCurrentState().signals.find((item) => item.id === signalId);
  assert.deepEqual(signal?.sourceRef, { objectType: "public_contribution", objectId: contribution.id });
});

// TEST G — Journal d'audit : aucun second système d'événements introduit.
// La conversion d'un message continue de produire EXACTEMENT une entrée
// AuditEntry (withAudit, réutilisé tel quel) — la traçabilité structurelle
// ajoutée par ce lot vit sur Signal/IncomingMessage eux-mêmes, jamais
// dans un journal parallèle.
test("TEST G — la traçabilité ajoutée ne crée aucune entrée d'audit supplémentaire", () => {
  const state = createDemoState();
  const message = state.incomingMessages.find((item) => item.status === "nouveau")!;
  const auditBefore = state.audit.length;

  const next = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message.id,
    territoryId: "joal",
    category: "production",
    title: "Message converti",
    description: "Conversion."
  });

  assert.equal(next.audit.length, auditBefore + 1, "exactement une entrée d'audit, même mécanisme withAudit qu'avant ce lot");
  assert.equal(next.audit[0].objectType, "signal");
});

// --- Fondation B — projectStateForSession -----------------------------

// Fixture de contrôle : deux organisations, deux acteurs "narrow-role"
// (jamais transverses), trois situations couvrant chaque palier de
// Visibility plus le cas "non assigné".
function makeAccessFixture() {
  const base = createDemoState();
  const orgA: Organization = { id: "org-a-test", name: "Organisation A (test)", type: "entreprise" };
  const orgB: Organization = { id: "org-b-test", name: "Organisation B (test)", type: "entreprise" };
  const orgPartner: Organization = { id: "org-partner-test", name: "Organisation partenaire (test)", type: "partenaire" };

  const actorA: Actor = { id: "act-a-test", name: "Acteur A", role: "mareyeur", organizationId: orgA.id, territoryIds: ["joal"], phone: "770000001", verified: true };
  const actorB: Actor = { id: "act-b-test", name: "Acteur B", role: "mareyeur", organizationId: orgB.id, territoryIds: ["joal"], phone: "770000002", verified: true };
  const actorPartner: Actor = { id: "act-partner-narrow-test", name: "Acteur partenaire", role: "mareyeur", organizationId: orgPartner.id, territoryIds: ["joal"], phone: "770000003", verified: true };
  const actorResponsibleA: Actor = { id: "act-responsible-a-test", name: "Responsable A", role: "operateur", organizationId: orgA.id, territoryIds: ["joal"], phone: "770000004", verified: true };

  const situationOrgA: Situation = {
    id: "sit-org-a-test", reference: "MBA-SIT-TESTA", signalIds: [], territoryId: "joal",
    title: "Situation privée org A", description: "Visible seulement par org A.", status: "coordination",
    priority: "moyenne", trust: "declaree", visibility: "organisation", responsibleId: actorResponsibleA.id,
    nextStep: "Suivre", history: []
  };
  const situationPartenaires: Situation = {
    id: "sit-partenaires-test", reference: "MBA-SIT-TESTP", signalIds: [], territoryId: "joal",
    title: "Situation partenaires org A", description: "Visible par org A et les partenaires.", status: "coordination",
    priority: "moyenne", trust: "declaree", visibility: "partenaires", responsibleId: actorResponsibleA.id,
    nextStep: "Suivre", history: []
  };
  const situationPublique: Situation = {
    id: "sit-publique-test", reference: "MBA-SIT-TESTPU", signalIds: [], territoryId: "joal",
    title: "Situation publique", description: "Visible par tous.", status: "coordination",
    priority: "moyenne", trust: "declaree", visibility: "publique", responsibleId: actorResponsibleA.id,
    nextStep: "Suivre", history: []
  };
  const situationNonAssignee: Situation = {
    id: "sit-non-assignee-test", reference: "MBA-SIT-TESTNA", signalIds: [], territoryId: "joal",
    title: "Situation non assignée", description: "Aucun responsable résolu.", status: "recue",
    priority: "moyenne", trust: "declaree", visibility: "partenaires", responsibleId: undefined,
    nextStep: "Qualifier", history: []
  };

  const state: ProductState = {
    ...base,
    organizations: [...base.organizations, orgA, orgB, orgPartner],
    actors: [...base.actors, actorA, actorB, actorPartner, actorResponsibleA],
    situations: [situationOrgA, situationPartenaires, situationPublique, situationNonAssignee]
  };

  return { state, actorA, actorB, actorPartner, situationOrgA, situationPartenaires, situationPublique, situationNonAssignee };
}

// TEST H — rôles transverses (RELAY_ROLES) : état non filtré, comportement
// inchangé par rapport à avant ce lot.
test("TEST H — un rôle transverse (coordinateur) reçoit toutes les situations sans filtrage", () => {
  const { state } = makeAccessFixture();
  const projected = projectStateForSession(state, { actorId: "act-coordinateur", role: "coordinateur" });
  assert.equal(projected.situations.length, state.situations.length);
});

// TEST I — "institution" est transverse bien que hors RELAY_ROLES
// (rôle de lecture, pas de relais d'écriture).
test("TEST I — institution reste transverse en lecture bien que hors RELAY_ROLES (écriture)", () => {
  assert.ok(TRANSVERSE_READ_ROLES.includes("institution"));
  const { state } = makeAccessFixture();
  const projected = projectStateForSession(state, { actorId: "act-institution", role: "institution" });
  assert.equal(projected.situations.length, state.situations.length);
});

// TEST J — visibility "organisation" : visible seulement pour la même
// organisation que le responsable, invisible pour une autre.
test("TEST J — visibility organisation : visible pour la même organisation, invisible pour une autre", () => {
  const { state, actorA, actorB, situationOrgA } = makeAccessFixture();
  const projectedA = projectStateForSession(state, { actorId: actorA.id, role: actorA.role });
  const projectedB = projectStateForSession(state, { actorId: actorB.id, role: actorB.role });
  assert.ok(projectedA.situations.some((item) => item.id === situationOrgA.id), "org A doit voir sa propre situation");
  assert.ok(!projectedB.situations.some((item) => item.id === situationOrgA.id), "org B ne doit jamais voir la situation privée d'org A");
});

// TEST K — visibility "partenaires" : visible pour la même organisation,
// ET pour le rôle/l'organisation "partenaire" structurellement typée,
// jamais pour une organisation tierce non partenaire.
test("TEST K — visibility partenaires : élargie aux partenaires structurels, jamais par extrapolation", () => {
  const { state, actorA, actorB, actorPartner, situationPartenaires } = makeAccessFixture();
  const projectedA = projectStateForSession(state, { actorId: actorA.id, role: actorA.role });
  const projectedPartner = projectStateForSession(state, { actorId: actorPartner.id, role: actorPartner.role });
  const projectedB = projectStateForSession(state, { actorId: actorB.id, role: actorB.role });
  assert.ok(projectedA.situations.some((item) => item.id === situationPartenaires.id));
  assert.ok(projectedPartner.situations.some((item) => item.id === situationPartenaires.id), "une organisation typée 'partenaire' doit voir une situation 'partenaires'");
  assert.ok(!projectedB.situations.some((item) => item.id === situationPartenaires.id), "org B (ni responsable, ni partenaire) ne doit pas la voir");
});

// TEST L — FAIL CLOSED : une situation non assignée reste invisible pour
// un rôle non transverse quel que soit son organisation ; "publique"
// reste visible pour tous, y compris une organisation tierce.
test("TEST L — fail closed sur l'absence de responsable ; publique reste visible pour tous", () => {
  const { state, actorB, situationNonAssignee, situationPublique } = makeAccessFixture();
  const projectedB = projectStateForSession(state, { actorId: actorB.id, role: actorB.role });
  assert.ok(!projectedB.situations.some((item) => item.id === situationNonAssignee.id), "aucune organisation connue → invisible, jamais 'visible par défaut'");
  assert.ok(projectedB.situations.some((item) => item.id === situationPublique.id), "publique reste visible même pour une organisation tierce");
});

// TEST §19 — Négatif de sécurité obligatoire : la réponse projetée pour
// une session org-A ne doit contenir AUCUN objet privé d'org-B, vérifié
// au niveau de la réponse complète (sérialisation), pas seulement d'un
// champ isolé — même discipline que la vérification live prévue sur le
// vrai GET /api/state (cf. rapport de lot).
test("TEST §19 (négatif de sécurité) — la réponse projetée pour org-A ne contient aucun objet privé d'org-B", () => {
  const orgA: Organization = { id: "org-secnegA", name: "Org A", type: "entreprise" };
  const orgB: Organization = { id: "org-secnegB", name: "Org B", type: "entreprise" };
  const responsibleB: Actor = { id: "act-responsible-b-secneg", name: "Responsable B", role: "operateur", organizationId: orgB.id, territoryIds: ["joal"], phone: "770000005", verified: true };
  const viewerA: Actor = { id: "act-viewer-a-secneg", name: "Lecteur A", role: "mareyeur", organizationId: orgA.id, territoryIds: ["joal"], phone: "770000006", verified: true };

  const privateSituationB: Situation = {
    id: "sit-secret-org-b", reference: "MBA-SIT-SECRETB", signalIds: [], territoryId: "joal",
    title: "SECRET-ORG-B — dossier confidentiel", description: "Ne doit jamais atteindre une session org-A.",
    status: "coordination", priority: "critique", trust: "declaree", visibility: "organisation",
    responsibleId: responsibleB.id, nextStep: "Suivre", history: []
  };

  const base = createDemoState();
  const state: ProductState = {
    ...base,
    organizations: [...base.organizations, orgA, orgB],
    actors: [...base.actors, responsibleB, viewerA],
    situations: [privateSituationB]
  };

  const projected = projectStateForSession(state, { actorId: viewerA.id, role: viewerA.role });

  // Vérification au niveau de la réponse entière (comme le corps JSON
  // réel de GET /api/state), pas seulement d'un tableau isolé.
  const serialized = JSON.stringify(projected);
  assert.ok(!serialized.includes("sit-secret-org-b"), "l'id de la situation privée d'org B ne doit apparaître nulle part dans la réponse projetée");
  assert.ok(!serialized.includes("SECRET-ORG-B"), "le contenu de la situation privée d'org B ne doit apparaître nulle part dans la réponse projetée");
  assert.equal(projected.situations.length, 0);
});

// TEST supplémentaire — Demo World réel : le changement d'état visible
// introduit par ce lot est explicite et mesuré, pas seulement démontré
// sur une fixture synthétique (mandat : "tout changement d'état visible
// doit être intentionnel, documenté et testé").
test("Demo World — un rôle transverse garde l'état complet, un rôle narrow perd les situations hors de son organisation", () => {
  const state = createDemoState();
  const totalSituations = state.situations.length;
  assert.ok(totalSituations > 0);

  const coordinateur = projectStateForSession(state, { actorId: "act-coordinateur", role: "coordinateur" });
  assert.equal(coordinateur.situations.length, totalSituations, "coordinateur (transverse) : comportement inchangé");

  const mareyeur = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });
  assert.equal(mareyeur.situations.length, 0, "mareyeur (org-mareyeurs) : aucune situation Demo World n'est portée par un responsable de son organisation — changement d'état intentionnel de ce lot");

  const partenaire = projectStateForSession(state, { actorId: "act-partenaire", role: "partenaire" });
  // act-partenaire (org-partner, Organization.type "partenaire") voit les
  // situations "partenaires" — la quasi-totalité du Demo World, qui a
  // délibérément été semé sur ce palier plutôt que "organisation".
  assert.ok(partenaire.situations.length > 0 && partenaire.situations.length <= totalSituations);
});
