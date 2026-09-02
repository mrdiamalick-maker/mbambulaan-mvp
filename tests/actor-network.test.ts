import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { buildActorNetworkProfile, buildOrganizationNetworkProfile } from "../src/domain/actor-network";

// LOT 7 (mandat "Actor & Trust Network — rendre l'écosystème mobilisable")
// — tests obligatoires A-J (§40 du mandat) couverts au niveau domaine.
// K/L sont couverts par territory-intelligence.test.ts (extension
// partnerServices) ; M/N sont des audits UI documentés dans le retour de
// lot ; O est couvert par la suite complète (`npm test`).

// TEST A — Actor/Organization profiles sont des projections du Core,
// jamais un stockage séparé : deux appels successifs sur le même state
// renvoient un contenu équivalent, aucun état interne.
test("TEST A — buildActorNetworkProfile/buildOrganizationNetworkProfile sont des projections pures", () => {
  const state = createDemoState();
  const first = buildActorNetworkProfile(state, "act-coordinateur");
  const second = buildActorNetworkProfile(state, "act-coordinateur");
  assert.deepEqual(first, second);

  const orgFirst = buildOrganizationNetworkProfile(state, "org-froid");
  const orgSecond = buildOrganizationNetworkProfile(state, "org-froid");
  assert.deepEqual(orgFirst, orgSecond);

  assert.equal(buildActorNetworkProfile(state, "acteur-inexistant"), undefined);
  assert.equal(buildOrganizationNetworkProfile(state, "org-inexistante"), undefined);
});

// TEST B — aucun score Trust : vérification structurelle du fichier
// source (même discipline que TEST L de territory-intelligence.test.ts).
test("TEST B — aucun score Trust dans actor-network.ts", () => {
  const source = readFileSync(new URL("../src/domain/actor-network.ts", import.meta.url), "utf8");
  const codeOnly = source.split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
  assert.doesNotMatch(codeOnly, /\bscore\b/i, "aucun score Trust (acteur ou organisation) ne doit être calculé");
});

test("TEST B — identityLevel reste un niveau explicable à 2 valeurs, jamais une note", () => {
  const state = createDemoState();
  const verifiedActor = state.actors.find((item) => item.verified)!;
  const unverifiedActor = state.actors.find((item) => !item.verified) ?? state.actors[0];
  const verifiedProfile = buildActorNetworkProfile(state, verifiedActor.id)!;
  assert.equal(verifiedProfile.identityLevel, "verifiee");
  const unverifiedProfile = buildActorNetworkProfile({ ...state, actors: state.actors.map((item) => item.id === unverifiedActor.id ? { ...item, verified: false } : item) }, unverifiedActor.id)!;
  assert.equal(unverifiedProfile.identityLevel, "declaree");
});

function baseSignal(state: ReturnType<typeof createDemoState>) {
  return applyCommand(state, {
    type: "create_signal",
    actorId: "act-espace-public",
    title: "Capacité proposée — transporteur (espace public)",
    description: "Transport réfrigéré, 2 véhicules — territoires déclarés : Petite-Côte, national",
    channel: "espace_public"
  });
}

// TEST C — une PublicContribution (ici simulée par le Signal qu'elle
// produit) ne crée jamais de PartnerService automatiquement : seul
// create_signal a été dispatché, aucun PartnerService ne doit exister.
test("TEST C — la seule existence d'un Signal issu d'une contribution ne crée aucun PartnerService", () => {
  const state = createDemoState();
  const withSignal = baseSignal(state);
  assert.equal(withSignal.partnerServices.length, state.partnerServices.length);
});

// TEST D — qualification humaine peut rattacher à une organisation
// existante.
test("TEST D — qualify_signal_as_network_capacity rattache une contribution à une organisation existante", () => {
  const state = createDemoState();
  const withSignal = baseSignal(state);
  const signal = withSignal.signals[0];
  const servicesBefore = withSignal.partnerServices.length;

  const qualified = applyCommand(withSignal, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal.id,
    organizationId: "org-froid",
    service: { name: "Transport réfrigéré Petite-Côte", category: "logistique", territoryIds: ["joal"], activationConditions: "Volume à confirmer avec le coordinateur." }
  });

  assert.equal(qualified.partnerServices.length, servicesBefore + 1);
  const service = qualified.partnerServices.at(-1)!;
  assert.equal(service.organizationId, "org-froid");
  assert.equal(qualified.organizations.length, state.organizations.length, "aucune organisation supplémentaire créée quand on rattache à une existante");
  const qualifiedSignal = qualified.signals.find((item) => item.id === signal.id)!;
  assert.equal(qualifiedSignal.disposition, "qualifie");
});

// TEST E — qualification humaine peut créer une organisation candidate.
test("TEST E — qualify_signal_as_network_capacity crée une organisation candidate quand nécessaire", () => {
  const state = createDemoState();
  const withSignal = baseSignal(state);
  const signal = withSignal.signals[0];
  const orgsBefore = withSignal.organizations.length;

  const qualified = applyCommand(withSignal, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal.id,
    newOrganization: { name: "Transports Ndiaye SARL", type: "entreprise" },
    service: { name: "Transport réfrigéré Petite-Côte", category: "logistique", territoryIds: ["joal"], activationConditions: "Diagnostic du parc à confirmer." }
  });

  assert.equal(qualified.organizations.length, orgsBefore + 1);
  const organization = qualified.organizations.at(-1)!;
  assert.equal(organization.name, "Transports Ndiaye SARL");
  assert.equal(organization.verificationStatus, "declaree", "une organisation candidate n'est jamais créée « vérifiée »");
  const service = qualified.partnerServices.at(-1)!;
  assert.equal(service.organizationId, organization.id);
});

test("qualify_signal_as_network_capacity refuse à la fois organizationId et newOrganization", () => {
  const state = createDemoState();
  const withSignal = baseSignal(state);
  const signal = withSignal.signals[0];
  assert.throws(() => applyCommand(withSignal, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal.id,
    organizationId: "org-froid",
    newOrganization: { name: "Autre", type: "entreprise" },
    service: { name: "X", category: "logistique", territoryIds: ["joal"], activationConditions: "Y" }
  }));
});

test("qualify_signal_as_network_capacity refuse l'absence des deux options", () => {
  const state = createDemoState();
  const withSignal = baseSignal(state);
  const signal = withSignal.signals[0];
  assert.throws(() => applyCommand(withSignal, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal.id,
    service: { name: "X", category: "logistique", territoryIds: ["joal"], activationConditions: "Y" }
  }));
});

// TEST F — PartnerService conserve la provenance (sourceRef → Signal).
test("TEST F — le PartnerService créé conserve sa provenance vers le Signal source", () => {
  const state = createDemoState();
  const withSignal = baseSignal(state);
  const signal = withSignal.signals[0];

  const qualified = applyCommand(withSignal, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal.id,
    organizationId: "org-froid",
    service: { name: "Transport réfrigéré Petite-Côte", category: "logistique", territoryIds: ["joal"], activationConditions: "À confirmer." }
  });

  const service = qualified.partnerServices.at(-1)!;
  assert.deepEqual(service.sourceRef, { objectType: "signal", objectId: signal.id });
  assert.ok(service.updatedAt);
});

// TEST G — capacité connue ≠ disponibilité temps réel : un service
// qualifié démarre toujours au statut le plus prudent ("reference"),
// jamais "a_activer" (qui suggérerait une disponibilité immédiate) ni
// "qualifie" (qui suggérerait une vérification déjà faite).
test("TEST G — une capacité issue d'une qualification ne prétend jamais être immédiatement disponible", () => {
  const state = createDemoState();
  const withSignal = baseSignal(state);
  const signal = withSignal.signals[0];

  const qualified = applyCommand(withSignal, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal.id,
    organizationId: "org-froid",
    service: { name: "Transport réfrigéré Petite-Côte", category: "logistique", territoryIds: ["joal"], activationConditions: "À confirmer." }
  });

  const service = qualified.partnerServices.at(-1)!;
  assert.equal(service.status, "reference");
  assert.equal(service.trust, "declaree");
});

// TEST H — NetworkStatus libre/adherent n'influence jamais le Trust
// calculé (identityLevel, service.trust) : deux organisations de
// networkStatus différent produisent le même type de résultat pour un
// geste équivalent.
test("TEST H — networkStatus libre/adherent n'influence jamais le Trust", () => {
  const state = createDemoState();
  const libre = state.organizations.find((item) => item.networkStatus === "libre" || item.networkStatus === undefined)!;
  const adherent = { ...libre, id: "org-test-adherent", networkStatus: "adherent" as const };
  const withAdherent = { ...state, organizations: [...state.organizations, adherent] };

  const withSignal = baseSignal(withAdherent);
  const signal = withSignal.signals[0];

  const qualifiedLibre = applyCommand(withSignal, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal.id,
    organizationId: libre.id,
    service: { name: "Service test libre", category: "logistique", territoryIds: ["joal"], activationConditions: "X" }
  });
  const serviceLibre = qualifiedLibre.partnerServices.at(-1)!;

  const withSignal2 = baseSignal(withAdherent);
  const signal2 = withSignal2.signals[0];
  const qualifiedAdherent = applyCommand(withSignal2, {
    type: "qualify_signal_as_network_capacity",
    actorId: "act-coordinateur",
    signalId: signal2.id,
    organizationId: adherent.id,
    service: { name: "Service test adhérent", category: "logistique", territoryIds: ["joal"], activationConditions: "X" }
  });
  const serviceAdherent = qualifiedAdherent.partnerServices.at(-1)!;

  assert.equal(serviceLibre.trust, serviceAdherent.trust, "même trust quel que soit networkStatus");
  assert.equal(serviceLibre.status, serviceAdherent.status, "même statut quel que soit networkStatus");
});

// TEST I — NetworkStatus n'influence pas le ranking/la sélection dans les
// projections : buildOrganizationNetworkProfile ne trie ni ne filtre par
// networkStatus (vérification structurelle : le champ n'apparaît nulle
// part dans la logique du fichier, hors définition de type importée).
test("TEST I — networkStatus n'apparaît dans aucune logique de tri/filtre de actor-network.ts", () => {
  const source = readFileSync(new URL("../src/domain/actor-network.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /networkStatus/, "networkStatus ne doit jamais conditionner une projection ou un classement du Network");
});

// TEST J — capacités propres et réseau restent distinctes : le profil
// d'une organisation n'expose que SES services (jamais ceux d'une autre
// organisation, contrairement au bug audité dans OrganizationWorkspace).
test("TEST J — buildOrganizationNetworkProfile.services ne contient que les services de cette organisation", () => {
  const state = createDemoState();
  const profile = buildOrganizationNetworkProfile(state, "org-froid")!;
  profile.services.forEach((service) => assert.equal(service.organizationId, "org-froid"));
  // Sanity : le Demo World contient bien des PartnerService d'autres
  // organisations, pour que ce test ait un sens (pas un ensemble vide
  // par accident).
  assert.ok(state.partnerServices.some((item) => item.organizationId !== "org-froid"));
});

// Non-régression : le Demo World reste cohérent (act-coordinateur, tous
// les acteurs) après l'ajout de la projection Network.
test("non-régression — chaque acteur du Demo World produit un profil Network valide", () => {
  const state = createDemoState();
  for (const actor of state.actors) {
    const profile = buildActorNetworkProfile(state, actor.id);
    assert.ok(profile, `profil attendu pour ${actor.id}`);
  }
  for (const organization of state.organizations) {
    const profile = buildOrganizationNetworkProfile(state, organization.id);
    assert.ok(profile, `profil attendu pour ${organization.id}`);
  }
});
