import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { relationshipsForActor, relationshipsForOrganization, isAuthorizedRepresentative } from "../src/domain/actor-relationship";
import { buildOrganizationNetworkProfile, buildActorNetworkProfile } from "../src/domain/actor-network";
import { projectStateForSession } from "../src/server/access-projection";
import { canRole } from "../src/server/permissions";

const CORD = "act-coordinateur";

// P2.2-A — "Actor & Relationship Foundation". TERRAIN SIMULÉ / PROJETÉ
// (rappel du mandat) : ce modèle est une première hypothèse démontrable,
// pas une ontologie définitive de la filière.

// TEST A — relation "membre" créée et auditée.
test("TEST A — create_actor_relationship (membre) créée et auditée", () => {
  const state0 = createDemoState();
  const before = state0.audit.length;
  const state = applyCommand(state0, {
    type: "create_actor_relationship",
    actorId: CORD,
    subjectActorId: "act-capitaine",
    organizationId: "org-mareyeurs",
    kind: "membre"
  });
  const relationship = state.actorRelationships[0];
  assert.equal(relationship.actorId, "act-capitaine");
  assert.equal(relationship.organizationId, "org-mareyeurs");
  assert.equal(relationship.kind, "membre");
  assert.equal(relationship.verificationStatus, "declaree", "jamais un statut supérieur choisi à la création");
  assert.equal(relationship.createdByActorId, CORD);
  assert.equal(state.audit.length, before + 1);
  assert.equal(state.audit[0].objectType, "actor_relationship");
  assert.equal(state.audit[0].objectId, relationship.id);
});

// TEST B — relation "representant" distincte de "membre" (mandat §4 :
// jamais inférée d'une autre relation).
test("TEST B — representant distinct de membre, jamais inféré", () => {
  const state0 = createDemoState();
  const state = applyCommand(state0, {
    type: "create_actor_relationship",
    actorId: CORD,
    subjectActorId: "act-capitaine-dakar",
    organizationId: "org-mareyeurs",
    kind: "representant",
    note: "Porte-parole désigné"
  });
  const relationships = relationshipsForActor(state, "act-capitaine-dakar");
  assert.equal(relationships.length, 1);
  assert.equal(relationships[0].kind, "representant");
  assert.ok(!relationships.some((item) => item.kind === "membre"), "aucune relation « membre » ne doit être créée automatiquement");
  assert.ok(isAuthorizedRepresentative(state, "act-capitaine-dakar", "org-mareyeurs"));
  assert.ok(!isAuthorizedRepresentative(state, "act-capitaine", "org-mareyeurs"), "l'appartenance seule (Actor.organizationId) ne doit jamais suffire");
});

// TEST C — relation "relais" distincte.
test("TEST C — relation relais créée distinctement", () => {
  const state0 = createDemoState();
  const state = applyCommand(state0, {
    type: "create_actor_relationship",
    actorId: CORD,
    subjectActorId: "act-capitaine-sud",
    organizationId: "org-site",
    kind: "relais"
  });
  const relationships = relationshipsForOrganization(state, "org-site");
  assert.ok(relationships.some((item) => item.actorId === "act-capitaine-sud" && item.kind === "relais"));
});

// TEST D — doublon exact (même actorId + organizationId + kind) refusé.
test("TEST D — doublon exact refusé", () => {
  const state = createDemoState();
  assert.ok(state.actorRelationships.some((item) => item.actorId === "act-transform" && item.organizationId === "org-mareyeurs" && item.kind === "membre"), "fixture Demo World attendue");
  assert.throws(
    () => applyCommand(state, { type: "create_actor_relationship", actorId: CORD, subjectActorId: "act-transform", organizationId: "org-mareyeurs", kind: "membre" }),
    /existe déjà/
  );
});

// TEST E — Actor/Organization inexistants refusés (aucune relation
// orpheline, mandat §8).
test("TEST E — Actor/Organization inexistants refusés", () => {
  const state = createDemoState();
  assert.throws(() => applyCommand(state, { type: "create_actor_relationship", actorId: CORD, subjectActorId: "act-inconnu", organizationId: "org-mareyeurs", kind: "membre" }), /Acteur introuvable/);
  assert.throws(() => applyCommand(state, { type: "create_actor_relationship", actorId: CORD, subjectActorId: "act-capitaine", organizationId: "org-inconnue", kind: "membre" }), /Organisation introuvable/);
});

// TEST F — verification declaree → documentee → verifiee (mandat §9,
// même légalité pour ActorRelationship et Organization).
test("TEST F — vérification declaree → documentee → verifiee (relation ET organisation)", () => {
  let state = createDemoState();
  state = applyCommand(state, { type: "create_actor_relationship", actorId: CORD, subjectActorId: "act-capitaine", organizationId: "org-mareyeurs", kind: "membre" });
  const relationship = state.actorRelationships[0];

  state = applyCommand(state, { type: "update_actor_relationship_verification", actorId: CORD, actorRelationshipId: relationship.id, verificationStatus: "documentee" });
  let updated = state.actorRelationships.find((item) => item.id === relationship.id)!;
  assert.equal(updated.verificationStatus, "documentee");
  assert.equal(updated.reviewedByActorId, CORD);
  assert.ok(updated.reviewedAt);

  state = applyCommand(state, { type: "update_actor_relationship_verification", actorId: CORD, actorRelationshipId: relationship.id, verificationStatus: "verifiee" });
  updated = state.actorRelationships.find((item) => item.id === relationship.id)!;
  assert.equal(updated.verificationStatus, "verifiee");

  // Organization.verificationStatus — même légalité, jamais mutée avant ce
  // lot (audit P2.2 confirmé) : org-capitaines n'a jamais de
  // verificationStatus défini dans le Demo World, traité comme "declaree".
  const organizationId = "org-capitaines";
  assert.equal(state.organizations.find((item) => item.id === organizationId)?.verificationStatus, undefined);
  state = applyCommand(state, { type: "update_organization_verification", actorId: CORD, organizationId, verificationStatus: "documentee" });
  assert.equal(state.organizations.find((item) => item.id === organizationId)?.verificationStatus, "documentee");
  state = applyCommand(state, { type: "update_organization_verification", actorId: CORD, organizationId, verificationStatus: "verifiee" });
  assert.equal(state.organizations.find((item) => item.id === organizationId)?.verificationStatus, "verifiee");
});

// TEST G — transition illégale refusée (saut ou retour arrière), pour la
// relation ET pour l'organisation.
test("TEST G — transition de vérification illégale refusée", () => {
  let state = createDemoState();
  state = applyCommand(state, { type: "create_actor_relationship", actorId: CORD, subjectActorId: "act-capitaine", organizationId: "org-mareyeurs", kind: "membre" });
  const relationship = state.actorRelationships[0];

  // Saut declaree → verifiee.
  assert.throws(() => applyCommand(state, { type: "update_actor_relationship_verification", actorId: CORD, actorRelationshipId: relationship.id, verificationStatus: "verifiee" }), /Transition illégale/);

  // Retour arrière verifiee → documentee.
  state = applyCommand(state, { type: "update_actor_relationship_verification", actorId: CORD, actorRelationshipId: relationship.id, verificationStatus: "documentee" });
  state = applyCommand(state, { type: "update_actor_relationship_verification", actorId: CORD, actorRelationshipId: relationship.id, verificationStatus: "verifiee" });
  assert.throws(() => applyCommand(state, { type: "update_actor_relationship_verification", actorId: CORD, actorRelationshipId: relationship.id, verificationStatus: "documentee" }), /Transition illégale/);

  // Même légalité pour Organization : saut declaree → verifiee refusé.
  assert.throws(() => applyCommand(state, { type: "update_organization_verification", actorId: CORD, organizationId: "org-capitaines", verificationStatus: "verifiee" }), /Transition illégale/);
});

// TEST H — IncomingMessage.reportedByActorId préservé (Demo World, §19).
test("TEST H — IncomingMessage.reportedByActorId préservé (Demo World)", () => {
  const state = createDemoState();
  const message = state.incomingMessages.find((item) => item.id === "msg-poste-quai-1")!;
  assert.equal(message.reportedByActorId, "act-capitaine-saint");
  assert.ok(state.actors.some((item) => item.id === "act-capitaine-saint"), "le déclarant référencé doit résoudre vers un Actor réel");
});

// TEST I — Signal.reportedByActorId préservé après qualification (hérité
// du message, ou explicitement choisi par le coordinateur).
test("TEST I — Signal.reportedByActorId préservé après convert_message_to_signal", () => {
  const state0 = createDemoState();
  // Hérité du message (aucun override) :
  const state1 = applyCommand(state0, {
    type: "convert_message_to_signal",
    actorId: "act-operateur",
    messageId: "msg-poste-quai-1",
    territoryId: "saint-louis",
    category: "infrastructure",
    title: "Production de glace ralentie",
    description: "Ralentissement constaté au poste de quai."
  });
  const signal1 = state1.signals[0];
  assert.equal(signal1.reportedByActorId, "act-capitaine-saint");
  assert.equal(signal1.actorId, "act-operateur");

  // Override explicite par le coordinateur (mandat §12) : prioritaire sur
  // celui déjà porté par le message.
  const otherMessage = state0.incomingMessages.find((item) => item.id === "msg-whatsapp-1")!;
  assert.equal(otherMessage.reportedByActorId, undefined, "ce message ne porte aucun déclarant structuré au départ");
  const state2 = applyCommand(state0, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: otherMessage.id,
    territoryId: "kayar",
    category: "marche",
    title: "Prix élevé du thiof",
    description: "Plusieurs acheteurs simultanés signalés.",
    reportedByActorId: "act-mareyeur-nord"
  });
  assert.equal(state2.signals[0].reportedByActorId, "act-mareyeur-nord");
});

// TEST J — l'acteur qui qualifie (relais) reste distinct du déclarant réel
// (mandat "Relay vs Declarant").
test("TEST J — relay actorId ≠ declarant reportedByActorId", () => {
  const state = applyCommand(createDemoState(), {
    type: "convert_message_to_signal",
    actorId: "act-operateur",
    messageId: "msg-poste-quai-1",
    territoryId: "saint-louis",
    category: "infrastructure",
    title: "Production de glace ralentie",
    description: "Ralentissement constaté au poste de quai."
  });
  const signal = state.signals[0];
  assert.notEqual(signal.actorId, signal.reportedByActorId);
  assert.equal(signal.actorId, "act-operateur");
  assert.equal(signal.reportedByActorId, "act-capitaine-saint");
});

// TEST K — sourceRef P2.1 non régressée : la traçabilité inverse
// IncomingMessage ↔ Signal reste intacte, additive avec reportedByActorId.
test("TEST K — sourceRef P2.1 non régressée par l'ajout de reportedByActorId", () => {
  const state = applyCommand(createDemoState(), {
    type: "convert_message_to_signal",
    actorId: "act-operateur",
    messageId: "msg-poste-quai-1",
    territoryId: "saint-louis",
    category: "infrastructure",
    title: "Production de glace ralentie",
    description: "Ralentissement constaté au poste de quai."
  });
  const signal = state.signals[0];
  assert.deepEqual(signal.sourceRef, { objectType: "incoming_message", objectId: "msg-poste-quai-1" });
  const message = state.incomingMessages.find((item) => item.id === "msg-poste-quai-1")!;
  assert.equal(message.resultingSignalId, signal.id);
  assert.equal(message.status, "converti");
});

// TEST L — téléphone masqué pour un rôle non transverse hors organisation.
// Le Demo World partage volontairement un même numéro placeholder entre
// tous les Actors (donnée de démonstration, pas une vraie diversité de
// numéros) — la garantie "aucun chiffre masqué ne survit" se vérifie donc
// champ par champ (chaque Actor hors organisation a bien phone === ""),
// jamais par une recherche de sous-chaîne globale sur le JSON (qui
// resterait positive à cause du numéro partagé par l'Actor de la même
// organisation, légitimement visible).
test("TEST L — Actor.phone masqué pour tout Actor hors organisation, pour un rôle non autorisé", () => {
  const state = createDemoState();
  const viewerOrganizationId = state.actors.find((item) => item.id === "act-mareyeur")!.organizationId;
  const projected = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });

  const otherOrgActor = projected.actors.find((item) => item.id === "act-operateur");
  assert.ok(otherOrgActor, "l'Actor doit rester visible — seul le téléphone est masqué");
  assert.notEqual(state.actors.find((item) => item.id === "act-operateur")!.organizationId, viewerOrganizationId);
  assert.equal(otherOrgActor!.phone, "");

  for (const actor of projected.actors) {
    if (actor.organizationId !== viewerOrganizationId) {
      assert.equal(actor.phone, "", `${actor.id} appartient à une autre organisation — son téléphone doit être masqué`);
    }
  }
});

// TEST M — téléphone visible pour un rôle autorisé (transverse, ou même
// organisation).
test("TEST M — Actor.phone visible pour un rôle autorisé", () => {
  const state = createDemoState();
  // Rôle transverse (coordinateur) : voit tout, sans exception.
  const coordinateur = projectStateForSession(state, { actorId: "act-coordinateur", role: "coordinateur" });
  const realPhone = state.actors.find((item) => item.id === "act-operateur")!.phone;
  assert.equal(coordinateur.actors.find((item) => item.id === "act-operateur")!.phone, realPhone);

  // Même organisation : un mareyeur voit le téléphone d'un autre acteur de
  // sa propre organisation (org-mareyeurs).
  const mareyeur = projectStateForSession(state, { actorId: "act-mareyeur", role: "mareyeur" });
  const sameOrgPhone = state.actors.find((item) => item.id === "act-mareyeur-nord")!.phone;
  assert.equal(mareyeur.actors.find((item) => item.id === "act-mareyeur-nord")!.phone, sameOrgPhone);
});

// TEST N — PublicRequest/PublicContribution ne créent jamais d'Actor
// (mandat §16, identity resolution restant une dette future).
test("TEST N — les ponts Public ne créent aucun Actor", () => {
  for (const path of ["../src/domain/public-request-signal-bridge.ts", "../src/domain/public-contribution-signal-bridge.ts"]) {
    const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
    assert.ok(!source.includes("actors:"), `${path} ne doit jamais muter state.actors`);
    assert.ok(!/id:\s*"act-/.test(source), `${path} ne doit jamais fabriquer d'identifiant Actor`);
  }
});

// TEST O — le cycle de vie Initiative (P2.5-A) reste non régressé par ce
// lot (aucune modification d'initiative-lifecycle.ts).
test("TEST O — le cycle de vie du Programme (P2.5-A) reste non régressé", () => {
  const state0 = createDemoState();
  const fixture = state0.initiatives.find((item) => item.id === "init-petite-cote-xxl")!;
  assert.equal(fixture.status, "financee");
  const state = applyCommand(state0, { type: "update_initiative_status", actorId: CORD, initiativeId: fixture.id, status: "execution" });
  assert.equal(state.initiatives.find((item) => item.id === fixture.id)!.status, "execution");
  assert.equal(canRole("coordinateur", "update_initiative_status"), true);
});

// Non-régression des profils Réseau (LOT 7) — étendus, jamais réécrits :
// buildOrganizationNetworkProfile/buildActorNetworkProfile gardent leurs
// champs existants et exposent désormais `relationships`.
test("buildOrganizationNetworkProfile/buildActorNetworkProfile exposent relationships sans régression des champs existants", () => {
  const state = createDemoState();
  const orgProfile = buildOrganizationNetworkProfile(state, "org-mareyeurs")!;
  assert.ok(orgProfile.relationships.length >= 2, "les 2 fixtures Demo World (membre + representant) doivent apparaître");
  assert.ok(orgProfile.relationships.some(({ relationship, actor }) => relationship.kind === "membre" && actor?.id === "act-transform"));
  assert.ok(orgProfile.relationships.some(({ relationship, actor }) => relationship.kind === "representant" && actor?.id === "act-mareyeur-sud"));
  assert.ok(Array.isArray(orgProfile.members), "champ existant non régressé");

  const actorProfile = buildActorNetworkProfile(state, "act-operateur")!;
  assert.ok(actorProfile.relationships.some((item) => item.kind === "relais" && item.organizationId === "org-site"));
  assert.ok(Array.isArray(actorProfile.missions), "champ existant non régressé");
});
