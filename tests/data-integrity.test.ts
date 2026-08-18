import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createDemoState } from "../src/data/demo-state";
import { validateSituation } from "../src/domain/rules";

test("le tenant de démonstration relie les objets sans référence orpheline", () => {
  const state = createDemoState();
  const territoryIds = new Set(state.territories.map((item) => item.id));
  const actorIds = new Set(state.actors.map((item) => item.id));
  const organizationIds = new Set(state.organizations.map((item) => item.id));
  const siteIds = new Set(state.sites.map((item) => item.id));
  const vesselIds = new Set(state.vessels.map((item) => item.id));
  const tripIds = new Set(state.trips.map((item) => item.id));
  const landingIds = new Set(state.landings.map((item) => item.id));
  const speciesIds = new Set(state.species.map((item) => item.id));
  const situationIds = new Set(state.situations.map((item) => item.id));
  for (const situation of state.situations) {
    assert.ok(territoryIds.has(situation.territoryId));
    if (situation.responsibleId) assert.ok(actorIds.has(situation.responsibleId));
    validateSituation(situation);
    if (situation.coordinationId) assert.ok(state.coordinationSpaces.some((space) => space.id === situation.coordinationId));
  }
  for (const decision of state.decisions) {
    assert.ok(situationIds.has(decision.situationId));
    assert.ok(actorIds.has(decision.decidedByActorId));
    if (decision.coordinationId) assert.ok(state.coordinationSpaces.some((space) => space.id === decision.coordinationId));
  }
  for (const evidence of state.evidences) {
    assert.ok(situationIds.has(evidence.situationId));
    assert.ok(actorIds.has(evidence.recordedByActorId));
    if (evidence.commitmentId) {
      assert.ok(
        state.coordinationSpaces.some((space) => space.commitments.some((commitment) => commitment.id === evidence.commitmentId))
      );
    }
  }
  for (const communication of state.communications) {
    assert.equal(communication.simulated, true);
    assert.ok(actorIds.has(communication.actorId));
    if (communication.situationId) assert.ok(situationIds.has(communication.situationId));
    if (communication.commitmentId) {
      assert.ok(
        state.coordinationSpaces.some((space) => space.commitments.some((commitment) => commitment.id === communication.commitmentId))
      );
    }
  }
  for (const request of state.serviceRequests) {
    assert.ok(territoryIds.has(request.territoryId));
    assert.ok(speciesIds.has(request.speciesId));
    assert.ok(actorIds.has(request.actorId));
  }
  for (const initiative of state.initiatives) {
    initiative.territoryIds.forEach((id) => assert.ok(territoryIds.has(id)));
    initiative.funding.forEach((fund) => assert.ok(actorIds.has(fund.partnerId)));
  }
  state.actors.forEach((item) => assert.ok(organizationIds.has(item.organizationId)));
  state.vessels.forEach((item) => {
    assert.ok(siteIds.has(item.homeSiteId));
    assert.ok(actorIds.has(item.captainId));
  });
  state.trips.forEach((item) => assert.ok(vesselIds.has(item.vesselId)));
  state.landings.forEach((item) => {
    assert.ok(tripIds.has(item.tripId));
    assert.ok(siteIds.has(item.siteId));
    item.catches.forEach((line) => assert.ok(speciesIds.has(line.speciesId)));
  });
  state.lots.forEach((item) => {
    assert.ok(landingIds.has(item.landingId));
    assert.ok(speciesIds.has(item.speciesId));
  });
  state.opportunities.forEach((item) => {
    assert.ok(state.lots.some((lot) => lot.id === item.lotId));
    assert.ok(state.serviceRequests.some((request) => request.id === item.serviceRequestId));
    assert.ok(item.reasons.length > 0);
  });
  state.plans.forEach((plan) => {
    assert.ok(plan.capabilities.length > 0);
    assert.ok(plan.value.length > 0);
  });
});

test("le jeu national couvre les territoires et les moteurs métier de la démonstration premium", () => {
  const state = createDemoState();
  assert.ok(state.territories.length >= 18);
  assert.ok(new Set(state.territories.map((item) => item.region)).size >= 5);
  assert.ok(state.vessels.length >= 60);
  assert.ok(state.landings.length >= 60);
  assert.ok(state.lots.length >= 75);
  assert.ok(state.situations.length >= 28);
  assert.ok(state.coordinationSpaces.length >= 24);
  assert.ok(state.serviceRequests.length >= 40);
  assert.ok(state.opportunities.length >= 20);
  assert.ok(state.communityPosts.length >= 24);
  assert.ok(state.initiatives.length >= 8);
  assert.ok(state.reports.length >= 8);
  for (const territory of state.territories) {
    assert.ok(state.sites.some((site) => site.territoryId === territory.id && site.type === "quai"));
    assert.ok(state.infrastructures.some((infrastructure) => infrastructure.territoryId === territory.id));
    assert.ok(state.situations.some((situation) => situation.territoryId === territory.id));
  }
});

test("la migration contient le stockage tenant et l'idempotence des commandes", () => {
  const sql = readFileSync(new URL("../db/migrations/001_initial.sql", import.meta.url), "utf8");
  assert.match(sql, /mbambulaan_tenant_state/);
  assert.match(sql, /mbambulaan_command_log/);
  assert.match(sql, /mbambulaan_outbox/);
  assert.match(sql, /idempotency_key text primary key/);
});
