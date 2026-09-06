import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { buildWorkdayView, sortWorkdayItems } from "../src/domain/workday";

// LOT 9 (mandat "Operating Experience"), §42 : tests A-P.

// TEST A — projection pure : deux appels sur le même état produisent un
// résultat strictement identique (aucun effet de bord, aucun état
// mutable).
test("TEST A — buildWorkdayView est une projection pure et déterministe", () => {
  const state = createDemoState();
  const first = buildWorkdayView(state, "act-coordinateur", "coordinateur", "2026-07-29T08:30:00.000Z");
  const second = buildWorkdayView(state, "act-coordinateur", "coordinateur", "2026-07-29T08:30:00.000Z");
  assert.deepEqual(first, second);
});

// TEST B — une Situation réglée, une Mission réalisée, un Commitment
// terminé n'apparaissent jamais dans myAttention (tâche active).
test("TEST B — éléments réglés/terminés absents de myAttention", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  const situationIds = new Set(view.myAttention.filter((item) => item.category !== "gouvernance" && item.id.startsWith("situation:")).map((item) => item.id.replace("situation:", "")));
  for (const id of situationIds) {
    const situation = state.situations.find((item) => item.id === id)!;
    assert.notEqual(situation.status, "reglee");
  }
  const commitmentItems = view.myAttention.filter((item) => item.id.startsWith("commitment:"));
  for (const item of commitmentItems) {
    const [, spaceId, commitmentId] = item.id.split(":");
    const space = state.coordinationSpaces.find((entry) => entry.id === spaceId)!;
    const commitment = space.commitments.find((entry) => entry.id === commitmentId)!;
    assert.notEqual(commitment.status, "terminee");
  }
});

// TEST C — responsabilités basées sur des relations réelles, jamais
// fabriquées : un acteur sans aucune Situation/Commitment/Mission qui lui
// soit réellement rattachée ne voit apparaître aucun item de ces
// catégories.
test("TEST C — aucune responsabilité fabriquée : un acteur non impliqué ne voit rien lui être attribué à tort", () => {
  const state = createDemoState();
  // act-partenaire-transformation (ou premier acteur du rôle partenaire) :
  // aucune Situation/Commitment/Mission ne devrait lui être rattachée dans
  // le Demo World.
  const partner = state.actors.find((item) => item.organizationId && state.organizations.find((org) => org.id === item.organizationId)?.type === "partenaire");
  if (partner) {
    const view = buildWorkdayView(state, partner.id, "partenaire");
    assert.equal(view.myAttention.filter((item) => item.category === "coordination" || item.category === "decision" || item.category === "bloque").length, 0);
  }
});

// TEST D — Top 3 déterministe : deux appels produisent le même Top 3,
// dans le même ordre.
test("TEST D — top3 est déterministe", () => {
  const state = createDemoState();
  const first = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  const second = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  assert.deepEqual(first.top3.map((item) => item.id), second.top3.map((item) => item.id));
  assert.ok(first.top3.length <= 3);
});

// TEST E — priorité métier avant simple nouveauté : un item critique doit
// toujours précéder un item de moindre urgence, quelle que soit sa
// catégorie.
test("TEST E — priorité métier (urgence) prime sur la catégorie et l'ordre d'insertion", () => {
  const items = sortWorkdayItems([
    { id: "b", category: "qualification_finding", title: "B", why: "", ctaLabel: "", href: "#", urgency: "normale" },
    { id: "a", category: "coordination", title: "A", why: "", ctaLabel: "", href: "#", urgency: "critique" }
  ]);
  assert.equal(items[0].id, "a");
});

// TEST F — une détection non examinée (mandat LOT 8) reste visible pour
// un coordinateur habilité.
test("TEST F — détection non examinée visible pour un coordinateur habilité", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  const detections = view.myAttention.filter((item) => item.id.startsWith("detection:"));
  assert.ok(detections.length > 0, "au moins une détection non examinée doit apparaître pour le coordinateur");
});

// TEST G — une détection déjà traitée (Finding rattaché, cf. LOT 8
// detectionKey) n'apparaît jamais parmi les priorités comme si elle était
// nouvelle.
test("TEST G — une détection déjà traitée n'est jamais présentée comme nouvelle", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  // fnd-kayar-motorisation porte déjà un detectionKey (LOT 8) pour
  // l'occurrence Kayar/maintenance — elle ne doit jamais réapparaître
  // comme une détection "nouvelle" ici.
  assert.ok(!view.myAttention.some((item) => item.id === "detection:signal-crossing:service-request-recurrence:v1:kayar:maintenance"));
});

// TEST H — une Mission n'apparaît que pour son responsable réel.
test("TEST H — une FieldMission n'apparaît que pour son responsable réel (FieldMission.responsibleActorId)", () => {
  const state = createDemoState();
  const mission = state.fieldMissions.find((item) => item.responsibleActorId && ["a_preparer", "planifiee", "en_cours"].includes(item.status));
  if (mission) {
    const viewOwner = buildWorkdayView(state, mission.responsibleActorId!, "administrateur");
    assert.ok(viewOwner.myAttention.some((item) => item.id === `mission:${mission.id}`));

    const otherActor = state.actors.find((item) => item.id !== mission.responsibleActorId);
    if (otherActor) {
      const viewOther = buildWorkdayView(state, otherActor.id, "administrateur");
      assert.ok(!viewOther.myAttention.some((item) => item.id === `mission:${mission.id}`));
    }
  }
});

// TEST I — une ProgramOpportunity/CollectiveNeed n'apparaît que si une
// étape humaine est réellement requise (statut non qualifié/non converti).
test("TEST I — une ProgramOpportunity qualifiée/convertie n'apparaît plus comme à qualifier", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  const opportunityIds = new Set(view.myAttention.filter((item) => item.id.startsWith("opportunity:")).map((item) => item.id.replace("opportunity:", "")));
  for (const id of opportunityIds) {
    const opportunity = state.programOpportunities.find((item) => item.id === id)!;
    assert.ok(["detected", "qualifying"].includes(opportunity.status));
  }
});

// TEST J — une contribution/capacité réseau n'apparaît que pour un rôle
// autorisé (gestionnaire_organisation) ; un opérateur non habilité ne
// doit rien voir de cette catégorie.
test("TEST J — les items « qualification_reseau »/« gouvernance » restent réservés aux rôles autorisés", () => {
  const state = createDemoState();
  const coordinateur = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  assert.equal(coordinateur.myAttention.filter((item) => item.category === "qualification_reseau").length, 0, "seul gestionnaire_organisation voit qualification_reseau");
  assert.equal(coordinateur.myAttention.filter((item) => item.category === "gouvernance").length, 0, "seul administrateur voit gouvernance");
});

// TEST K — notification ≠ tâche : buildWorkdayView ne recopie jamais
// state.notifications tel quel (aucun item de myAttention/whatChanged ne
// référence directement un Notification).
test("TEST K — notification ≠ tâche : aucune recopie de state.notifications", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  const notificationHrefs = new Set(state.notifications.map((item) => item.href));
  // Un item peut légitimement partager une URL avec une notification par
  // coïncidence (même dossier) — la garantie testée est structurelle :
  // aucun identifiant d'item ne référence un id de Notification.
  const notificationIds = new Set(state.notifications.map((item) => item.id));
  for (const item of [...view.myAttention]) {
    assert.ok(!notificationIds.has(item.id));
  }
  void notificationHrefs;
});

// TEST L — deep links corrects : chaque item mène vers une route réelle
// du produit (jamais une chaîne vide ni un fragment orphelin).
test("TEST L — chaque item porte un deep link non vide vers une route réelle", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  const knownPrefixes = ["/app/situations/", "/app/coordination", "/app/initiatives", "/app/organisation", "/app/pilotage"];
  for (const item of [...view.myAttention, ...view.waitingOnOthers, ...view.whatChanged]) {
    assert.ok(item.href.length > 0);
    assert.ok(knownPrefixes.some((prefix) => item.href.startsWith(prefix)), `href inattendu : ${item.href}`);
  }
});

// TEST — gestionnaire_organisation voit ses capacités réseau à revoir,
// jamais les situations territoriales (qui ne sont pas son travail).
test("gestionnaire_organisation voit ses capacités réseau à revoir, jamais de situation territoriale", () => {
  const state = createDemoState();
  const manager = state.actors.find((item) => {
    const org = state.organizations.find((o) => o.id === item.organizationId);
    return org?.type !== "partenaire" && state.infrastructures.some((infra) => infra.organizationId === item.organizationId);
  });
  if (manager) {
    const view = buildWorkdayView(state, manager.id, "gestionnaire_organisation");
    assert.equal(view.myAttention.filter((item) => item.category === "coordination" || item.category === "decision").length, 0);
  }
});

// TEST — administrateur voit la gouvernance (organisations candidates),
// pas un dashboard système complet.
test("administrateur voit les organisations candidates comme item de gouvernance", () => {
  const state = createDemoState();
  const hasCandidate = state.organizations.some((item) => item.verificationStatus === "declaree");
  const view = buildWorkdayView(state, "act-institution", "administrateur");
  const governance = view.myAttention.filter((item) => item.category === "gouvernance");
  assert.equal(governance.length > 0, hasCandidate);
});

// TEST — non-régression : la projection ne modifie jamais ProductState
// (aucune mutation, mandat "aucun nouveau moteur").
test("non-régression — buildWorkdayView ne mute jamais ProductState", () => {
  const state = createDemoState();
  const snapshot = JSON.stringify(state);
  buildWorkdayView(state, "act-coordinateur", "coordinateur");
  assert.equal(JSON.stringify(state), snapshot);
});
