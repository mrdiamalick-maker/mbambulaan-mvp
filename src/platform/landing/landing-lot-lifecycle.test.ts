import test from "node:test";
import assert from "node:assert/strict";
import { LandingLotLifecycle } from "./landing-lot-lifecycle";

function createLifecycle() {
  const lifecycle = new LandingLotLifecycle();
  lifecycle.registerExpectedReturn({
    id: "return-01",
    vesselId: "vessel-01",
    expectedLandingSiteId: "site-01",
    territoryId: "territory-dakar",
    expectedAt: "2026-07-28T08:00:00.000Z",
    expectedWeightKg: 1_000,
    status: "announced",
  });
  lifecycle.confirmLanding({
    id: "landing-01",
    expectedReturnId: "return-01",
    vesselId: "vessel-01",
    landingSiteId: "site-01",
    territoryId: "territory-dakar",
    landedAt: "2026-07-28T09:00:00.000Z",
    confirmedByActorId: "agent-01",
  });
  return lifecycle;
}

test("un retour annulé ne peut pas produire un débarquement", () => {
  const lifecycle = new LandingLotLifecycle();
  lifecycle.registerExpectedReturn({
    id: "return-cancelled",
    vesselId: "vessel-01",
    expectedLandingSiteId: "site-01",
    territoryId: "territory-dakar",
    expectedAt: "2026-07-28T08:00:00.000Z",
    status: "cancelled",
  });
  assert.throws(() => lifecycle.confirmLanding({
    id: "landing-cancelled",
    expectedReturnId: "return-cancelled",
    vesselId: "vessel-01",
    landingSiteId: "site-01",
    territoryId: "territory-dakar",
    landedAt: "2026-07-28T09:00:00.000Z",
    confirmedByActorId: "agent-01",
  }), /retour annulé/);
});

test("la pesée de référence privilégie la preuve vérifiée et exclut la contestation", () => {
  const lifecycle = createLifecycle();
  lifecycle.registerWeighing({
    id: "weighing-estimated",
    landingId: "landing-01",
    totalWeightKg: 950,
    method: "estimated",
    recordedByActorId: "weigher-01",
    recordedAt: "2026-07-28T09:10:00.000Z",
  });
  lifecycle.registerWeighing({
    id: "weighing-digital",
    landingId: "landing-01",
    totalWeightKg: 980,
    method: "digital_scale",
    recordedByActorId: "weigher-01",
    recordedAt: "2026-07-28T09:20:00.000Z",
  });
  lifecycle.verifyWeighing("weighing-digital", "verifier-01");
  assert.equal(lifecycle.selectReferenceWeighing("landing-01")?.id, "weighing-digital");
  lifecycle.disputeWeighing("weighing-digital", "cooperative-01", "Écart avec la pesée contradictoire.");
  assert.equal(lifecycle.selectReferenceWeighing("landing-01")?.id, "weighing-estimated");
});

test("la somme des lots ne peut pas dépasser la pesée de référence", () => {
  const lifecycle = createLifecycle();
  lifecycle.registerWeighing({
    id: "weighing-01",
    landingId: "landing-01",
    totalWeightKg: 1_000,
    method: "digital_scale",
    recordedByActorId: "weigher-01",
    recordedAt: "2026-07-28T09:10:00.000Z",
  });
  lifecycle.createLot({
    id: "lot-01",
    landingId: "landing-01",
    speciesCode: "thiof",
    weightKg: 700,
    qualityGrade: "premium",
    conservationStatus: "iced",
    createdByActorId: "lot-manager-01",
    createdAt: "2026-07-28T09:30:00.000Z",
  });
  assert.throws(() => lifecycle.createLot({
    id: "lot-02",
    landingId: "landing-01",
    speciesCode: "thiof",
    weightKg: 400,
    qualityGrade: "standard",
    conservationStatus: "iced",
    createdByActorId: "lot-manager-01",
    createdAt: "2026-07-28T09:31:00.000Z",
  }), /dépasserait la pesée/);
});

test("un lot à risque est orienté vers la transformation avant la perte", () => {
  const lifecycle = createLifecycle();
  lifecycle.registerWeighing({
    id: "weighing-01",
    landingId: "landing-01",
    totalWeightKg: 1_000,
    method: "digital_scale",
    recordedByActorId: "weigher-01",
    recordedAt: "2026-07-28T09:10:00.000Z",
  });
  lifecycle.createLot({
    id: "lot-risk",
    landingId: "landing-01",
    speciesCode: "sardinelle",
    weightKg: 300,
    qualityGrade: "processing",
    conservationStatus: "at_risk",
    createdByActorId: "lot-manager-01",
    createdAt: "2026-07-28T09:30:00.000Z",
  });
  const decision = lifecycle.decideDestination("lot-risk", {
    coldStorageAvailable: false,
    processingAvailable: true,
    communityProgramAvailable: true,
  });
  assert.equal(decision.recommendedDestination, "processing");
  assert.equal(decision.sustainabilitySignals.length > 0, true);
});

test("une absence de capacité peut déclencher une valorisation communautaire encadrée", () => {
  const lifecycle = createLifecycle();
  lifecycle.registerWeighing({
    id: "weighing-01",
    landingId: "landing-01",
    totalWeightKg: 1_000,
    method: "mechanical_scale",
    recordedByActorId: "weigher-01",
    recordedAt: "2026-07-28T09:10:00.000Z",
  });
  lifecycle.createLot({
    id: "lot-community",
    landingId: "landing-01",
    speciesCode: "sardinelle",
    weightKg: 250,
    qualityGrade: "processing",
    conservationStatus: "fresh",
    createdByActorId: "lot-manager-01",
    createdAt: "2026-07-28T09:30:00.000Z",
  });
  const decision = lifecycle.decideDestination("lot-community", {
    coldStorageAvailable: false,
    processingAvailable: false,
    communityProgramAvailable: true,
  });
  assert.equal(decision.recommendedDestination, "community_program");
  assert.equal(decision.requiresHumanValidation, true);
  assert.equal(decision.communityValueSignals.length > 0, true);
});

test("un écart significatif demande une réévaluation des services", () => {
  const lifecycle = createLifecycle();
  lifecycle.registerWeighing({
    id: "weighing-01",
    landingId: "landing-01",
    totalWeightKg: 700,
    method: "digital_scale",
    recordedByActorId: "weigher-01",
    recordedAt: "2026-07-28T09:10:00.000Z",
  });
  const decision = lifecycle.reconcileLanding("landing-01", {
    weightVariancePercent: 10,
    arrivalDelayMinutes: 30,
  });
  assert.equal(decision.significantWeightVariance, true);
  assert.equal(decision.significantArrivalDelay, true);
  assert.equal(decision.serviceNeedsReassessmentRequired, true);
});
