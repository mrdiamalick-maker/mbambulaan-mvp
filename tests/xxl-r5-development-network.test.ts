import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoState } from "../src/data/demo-state";
import { buildOrganizationNetworkProfile, describeCapacityAvailability } from "../src/domain/actor-network";
import { OrganizationProfileSheet } from "../src/components/organisation/OrganizationProfileSheet";
import { ProgramOpportunityDossier } from "../src/components/coordination/ProgramOpportunityDossier";

// CollectiveNeedDossier consomme useProduct() (transitions de statut,
// permissions) — pas rendable hors ProductProvider (état client complet,
// localStorage…) sans reconstruire tout le contexte produit. TEST A et
// TEST I vérifient donc sa source directement (même technique que TEST D
// ci-dessous), plutôt qu'un rendu qui exigerait un Provider hors de
// portée d'un test Node pur.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

// XXL-R5 — Programmes + Réseau (mandat CEO "Development & Network
// Premium"). §44 : tests A-J. Le Core (lifecycle CollectiveNeed →
// ProgramOpportunity → Program → Intervention → Result → Outcome →
// Impact → Learning, modèles Organization/Actor/Capacity/PartnerService/
// Infrastructure) reste gelé — non modifié cette session, déjà couvert
// par actor-network.test.ts/initiative.test.ts/program-opportunity.test.ts
// ("tous les tests Core verts", §44). Les tests ci-dessous portent sur ce
// que R5 a réellement changé : les deep-links territoire/organisation
// (OrganizationWorkspace, OrganizationProfileSheet, TerritoryTags), et le
// respect des distinctions honnêtes du domaine dans la présentation.
(globalThis as Record<string, unknown>).React = React;

// TEST A — CollectiveNeed ≠ ProgramOpportunity : les deux dossiers ne se
// confondent jamais visuellement — chacun porte un vocabulaire propre,
// jamais celui de l'autre.
test("TEST A — CollectiveNeedDossier et ProgramOpportunityDossier restent visuellement distincts", () => {
  const needSource = readSource("../src/components/coordination/CollectiveNeedDossier.tsx");
  assert.ok(!needSource.includes("Interventions envisageables"), "le dossier Besoin collectif ne doit jamais porter le vocabulaire Opportunité (« pistes à étudier »)");
  assert.ok(!needSource.includes("Indicateurs proposés"), "le dossier Besoin collectif ne doit jamais porter le vocabulaire Opportunité (indicateurs proposés)");
  const opportunitySource = readSource("../src/components/coordination/ProgramOpportunityDossier.tsx");
  assert.ok(!opportunitySource.includes("Qui est potentiellement concerné"), "le dossier Opportunité ne doit jamais porter le vocabulaire Besoin collectif");
});

// TEST B — ProgramOpportunity ≠ Program : jamais présentée comme un
// programme déjà financé (mandat §8/§12) — aucun montant budgétaire dans
// le dossier d'opportunité.
test("TEST B — ProgramOpportunityDossier ne présente jamais de budget ni de financement (pas encore un programme)", () => {
  const state = createDemoState();
  const opportunity = state.programOpportunities[0];
  if (!opportunity) return; // Le Demo World peut légitimement n'en contenir aucune au chargement (mandat LOT 2 §10).
  const html = renderToStaticMarkup(React.createElement(ProgramOpportunityDossier, { opportunity, state, onDone: () => {} }));
  assert.ok(!/F\s?CFA/i.test(html), "aucun montant budgétaire ne doit apparaître dans un dossier d'opportunité — ce n'est pas encore un programme financé");
});

// TEST C — lifecycle inchangé : CollectiveNeed/ProgramOpportunity/
// Initiative restent des objets distincts du Core, jamais fusionnés en un
// seul type de présentation.
test("TEST C — CollectiveNeed, ProgramOpportunity et Initiative restent des objets distincts", () => {
  const state = createDemoState();
  assert.ok(Array.isArray(state.collectiveNeeds));
  assert.ok(Array.isArray(state.programOpportunities));
  assert.ok(Array.isArray(state.initiatives));
  for (const need of state.collectiveNeeds) assert.ok(!("budgetFcfa" in need), "un CollectiveNeed ne doit jamais porter de champ budgétaire de Program");
  for (const initiative of state.initiatives) assert.ok(!("affectedPopulation" in initiative), "une Initiative ne doit jamais porter le champ affectedPopulation propre à CollectiveNeed");
});

// TEST D — Result ≠ Outcome ≠ Impact : trois sections distinctes restent
// visibles séparément dans le dossier Programme (grammaire R3 déjà
// appliquée, revérifiée après R5).
test("TEST D — le dossier Programme distingue Résultat, Changement et Impact", () => {
  // Vérification structurelle directement sur le fichier source plutôt
  // qu'un rendu complet (InitiativeCard exige un contexte ProductProvider
  // que ce test n'a pas besoin de reconstruire) : les trois libellés
  // doivent tous être présents, jamais fusionnés en une seule section.
  const sourcePath = fileURLToPath(new URL("../src/app/app/(coordination)/initiatives/page.tsx", import.meta.url));
  const source = readFileSync(sourcePath, "utf-8");
  assert.ok(source.includes("Ce qui a été réalisé"));
  assert.ok(source.includes("Ce qui a changé"));
  assert.ok(source.includes("Ce qui reste à mesurer"));
});

// TEST E — Capacity freshness intacte : describeCapacityAvailability
// classe toujours correctement une capacité valide.
test("TEST E — describeCapacityAvailability reconnaît une capacité valide", () => {
  const validCapacity = { id: "cap-1", infrastructureId: "infra-1", type: "glace" as const, availableQuantity: 10, unit: "t", validUntil: "2099-01-01T00:00:00.000Z", status: "disponible" as const };
  const result = describeCapacityAvailability(validCapacity, "2026-01-01T00:00:00.000Z");
  assert.equal(result.kind, "valide");
});

// TEST F — expired ≠ unavailable : une capacité expirée reste "à
// revérifier", jamais présentée comme indisponible (mandat §27).
test("TEST F — une capacité expirée est « à revérifier », jamais affirmée indisponible", () => {
  const expiredCapacity = { id: "cap-2", infrastructureId: "infra-1", type: "glace" as const, availableQuantity: 10, unit: "t", validUntil: "2020-01-01T00:00:00.000Z", status: "disponible" as const };
  const result = describeCapacityAvailability(expiredCapacity, "2026-01-01T00:00:00.000Z");
  assert.equal(result.kind, "aRevoir", "une capacité expirée doit rester « à revérifier », jamais un troisième état « indisponible » fabriqué");
});

// TEST G — PartnerService ≠ disponibilité temps réel : le rendu du
// profil Réseau ne prétend jamais à une disponibilité en direct.
test("TEST G — OrganizationProfileSheet n'affiche jamais une fausse disponibilité temps réel", () => {
  const state = createDemoState();
  const organizationWithServices = state.organizations.find((org) => state.partnerServices.some((service) => service.organizationId === org.id));
  assert.ok(organizationWithServices, "ce test suppose au moins une organisation avec un service documenté");
  const profile = buildOrganizationNetworkProfile(state, organizationWithServices!.id);
  assert.ok(profile);
  const html = renderToStaticMarkup(React.createElement(OrganizationProfileSheet, { profile: profile! }));
  assert.ok(html.includes("pas une disponibilité en temps réel"), "le rappel explicite doit rester visible");
  assert.ok(!/disponible maintenant|en direct/i.test(html), "aucune formulation de disponibilité en direct ne doit apparaître");
});

// TEST H — Organization territories honnêtes : chaque territoire du
// profil se retrace à au moins une des 4 sources réelles (membres,
// services, infrastructures, initiatives) — jamais un territoire
// fabriqué ou hérité d'ailleurs.
test("TEST H — les territoires d'un profil Organization se retracent tous à une source réelle", () => {
  const state = createDemoState();
  for (const organization of state.organizations) {
    const profile = buildOrganizationNetworkProfile(state, organization.id);
    if (!profile) continue;
    const traceableIds = new Set<string>([
      ...profile.members.flatMap((item) => item.territoryIds),
      ...profile.services.flatMap((item) => item.territoryIds),
      ...profile.infrastructures.map((item) => item.territoryId),
      ...profile.initiatives.flatMap((item) => item.territoryIds)
    ]);
    for (const territory of profile.territories) {
      assert.ok(traceableIds.has(territory.id), `${organization.name} : le territoire ${territory.name} n'est traçable à aucune des 4 sources réelles`);
    }
  }
});

// TEST I — liens Programme/Territoire réels : chaque dossier territorial
// de ce lot construit son lien Atlas à partir du vrai territoire affiché
// (`territory.id`), jamais un identifiant fabriqué ou une route figée.
test("TEST I — les dossiers Programmes construisent leurs liens Atlas à partir du vrai territoire, jamais d'un identifiant fabriqué", () => {
  const sources = [
    "../src/components/coordination/CollectiveNeedDossier.tsx",
    "../src/components/coordination/ProgramOpportunityDossier.tsx",
    "../src/app/app/(coordination)/initiatives/page.tsx"
  ].map(readSource);
  for (const source of sources) {
    assert.ok(source.includes("/app/atlas?territoire=${territory.id}"), "le lien Atlas doit être construit depuis territory.id, pas un texte figé");
  }
});

// TEST J — aucune relation Réseau inventée : OrganizationProfileSheet
// n'affiche que les initiatives réellement portées par un membre de
// l'organisation (profile.initiatives) — jamais une relation déduite.
test("TEST J — OrganizationProfileSheet n'affiche que les programmes réellement reliés, jamais inférés", () => {
  const state = createDemoState();
  const organizationWithInitiative = state.organizations.find((org) => {
    const profile = buildOrganizationNetworkProfile(state, org.id);
    return profile && profile.initiatives.length > 0;
  });
  assert.ok(organizationWithInitiative, "ce test suppose au moins une organisation reliée à un programme réel");
  const profile = buildOrganizationNetworkProfile(state, organizationWithInitiative!.id)!;
  const html = renderToStaticMarkup(React.createElement(OrganizationProfileSheet, { profile }));
  for (const initiative of profile.initiatives) {
    assert.ok(html.includes(`/app/initiatives#initiative-${initiative.id}`), `lien manquant vers le programme réellement relié ${initiative.title}`);
  }
  // Aucune Initiative hors profile.initiatives ne doit apparaître.
  const otherInitiatives = state.initiatives.filter((item) => !profile.initiatives.some((linked) => linked.id === item.id));
  for (const other of otherInitiatives) {
    assert.ok(!html.includes(`/app/initiatives#initiative-${other.id}`), `un programme non relié (${other.title}) ne doit jamais apparaître dans ce profil`);
  }
});
