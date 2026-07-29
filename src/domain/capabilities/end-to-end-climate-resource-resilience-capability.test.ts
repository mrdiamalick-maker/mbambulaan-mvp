import assert from "node:assert/strict";
import test from "node:test";
import { EndToEndClimateResourceResilienceCapability } from "./end-to-end-climate-resource-resilience-capability";

const capability = () => new EndToEndClimateResourceResilienceCapability();

test("coordonne une alerte mer dangereuse, une fermeture et la protection économique des acteurs", () => {
  const service = capability();
  service.openCase({
    id: "resilience:2027:petite-cote",
    caseCode: "RES-2027-PC",
    countryId: "country:sn",
    territoryIds: ["territory:joal", "territory:mbour"],
    createdAt: "2027-01-01T08:00:00Z",
  });

  service.registerSignal({
    caseId: "resilience:2027:petite-cote",
    signal: {
      id: "signal:storm:001",
      territoryId: "territory:joal",
      riskType: "storm",
      severity: "critical",
      probabilityPercent: 92,
      confidencePercent: 88,
      validFrom: "2027-06-10T00:00:00Z",
      validUntil: "2027-06-13T00:00:00Z",
      sourceActorId: "actor:weather-service",
      sourceReferenceIds: ["forecast:marine:001"],
      evidenceIds: ["evidence:forecast:001"],
      expectedEffects: ["Sorties en mer dangereuses", "Risque de perte de captures et d'équipements"],
    },
  });

  service.assessResourcePressure({
    caseId: "resilience:2027:petite-cote",
    assessment: {
      id: "pressure:sardinella:001",
      territoryId: "territory:joal",
      speciesCode: "species:sardinella",
      stockStatus: "overfished",
      fishingEffortIndex: 84,
      catchPerUnitEffortChangePercent: -22,
      juvenileCatchPercent: 18,
      illegalFishingRiskScore: 61,
      ecosystemImpactScore: 72,
      assessedAt: "2027-06-09T12:00:00Z",
      evidenceIds: ["evidence:stock-assessment:001"],
    },
  });

  service.decideMeasure({
    caseId: "resilience:2027:petite-cote",
    decidedAt: "2027-06-09T15:00:00Z",
    measure: {
      id: "measure:closure:001",
      measureType: "seasonal_closure",
      territoryIds: ["territory:joal"],
      speciesCodes: ["species:sardinella"],
      decidedByActorId: "actor:ministry",
      validFrom: "2027-06-10T00:00:00Z",
      validUntil: "2027-06-20T00:00:00Z",
      allowedGearCodes: [],
      rationale: ["Protéger les pêcheurs pendant la tempête", "Réduire la pression sur la sardinelle"],
      status: "active",
      evidenceIds: ["evidence:ministerial-order:001"],
    },
  });

  service.planAdaptationAction({
    caseId: "resilience:2027:petite-cote",
    plannedAt: "2027-06-09T16:00:00Z",
    action: {
      id: "action:safe-harbor:001",
      actionType: "activate_safe_harbor",
      territoryIds: ["territory:joal"],
      ownerActorId: "actor:territorial-authority",
      beneficiaryActorIds: ["actor:cooperative:joal"],
      relatedSignalIds: ["signal:storm:001"],
      relatedMeasureIds: ["measure:closure:001"],
      plannedStartAt: "2027-06-09T18:00:00Z",
      plannedEndAt: "2027-06-14T18:00:00Z",
      budgetXof: 18_000_000,
      expectedProtectedValueXof: 145_000_000,
      expectedProtectedJobs: 430,
      expectedAvoidedLossKg: 52_000,
      status: "active",
      evidenceIds: ["evidence:action-plan:001"],
    },
  });

  service.decideFishingActivity({
    caseId: "resilience:2027:petite-cote",
    decision: {
      id: "decision:campaign-delay:001",
      campaignId: "campaign:joal:2027:06",
      territoryId: "territory:joal",
      speciesCode: "species:sardinella",
      decision: "prohibited",
      reasons: ["Alerte météo critique", "Fermeture saisonnière active"],
      conditions: ["Reprise après levée de l'alerte et réévaluation du stock"],
      relatedSignalIds: ["signal:storm:001"],
      relatedMeasureIds: ["measure:closure:001"],
      decidedByActorId: "actor:territorial-authority",
      validFrom: "2027-06-10T00:00:00Z",
      validUntil: "2027-06-13T00:00:00Z",
      evidenceIds: ["evidence:decision:001"],
    },
  });

  service.deliverSupport({
    caseId: "resilience:2027:petite-cote",
    deliveredAt: "2027-06-11T12:00:00Z",
    support: {
      id: "support:cash:001",
      supportType: "cash_transfer",
      beneficiaryActorId: "actor:cooperative:joal",
      territoryId: "territory:joal",
      amountXof: 35_000_000,
      relatedActionId: "action:safe-harbor:001",
      status: "approved",
      evidenceIds: ["evidence:payment:001"],
    },
  });

  service.completeAction({
    caseId: "resilience:2027:petite-cote",
    actionId: "action:safe-harbor:001",
    completedAt: "2027-06-14T18:00:00Z",
    evidenceIds: ["evidence:completion:001"],
  });

  service.recordOutcome({
    caseId: "resilience:2027:petite-cote",
    outcome: {
      id: "outcome:001",
      measuredAt: "2027-07-31T18:00:00Z",
      avoidedLossKg: 48_000,
      protectedValueXof: 132_000_000,
      protectedJobs: 405,
      supportedActorCount: 276,
      fishingEffortChangePercent: -18,
      juvenileCatchChangePercent: -6,
      stockPressureChangePercent: -9,
      ecosystemRestoredHectares: 12,
      platformRevenueXof: 8_500_000,
      confidencePercent: 82,
      evidenceIds: ["evidence:impact:001"],
    },
  });

  const center = service.getResilienceCommandCenter({
    caseId: "resilience:2027:petite-cote",
    generatedAt: "2027-07-31T20:00:00Z",
  });

  assert.equal(center.status, "stable");
  assert.equal(center.protectedValueXof, 132_000_000);
  assert.equal(center.protectedJobs, 405);
  assert.equal(center.deliveredSupportXof, 35_000_000);
  assert.equal(center.platformRevenueXof, 8_500_000);
});

test("refuse d'autoriser la pêche sous alerte critique ou fermeture active", () => {
  const service = capability();
  service.openCase({
    id: "resilience:block",
    caseCode: "RES-BLOCK",
    countryId: "country:sn",
    territoryIds: ["territory:saint-louis"],
    createdAt: "2027-01-01T00:00:00Z",
  });
  service.registerSignal({
    caseId: "resilience:block",
    signal: {
      id: "signal:critical",
      territoryId: "territory:saint-louis",
      riskType: "rough_sea",
      severity: "critical",
      probabilityPercent: 95,
      confidencePercent: 90,
      validFrom: "2027-08-01T00:00:00Z",
      validUntil: "2027-08-03T00:00:00Z",
      sourceReferenceIds: [],
      evidenceIds: ["evidence:signal"],
      expectedEffects: [],
    },
  });
  service.decideMeasure({
    caseId: "resilience:block",
    decidedAt: "2027-07-31T12:00:00Z",
    measure: {
      id: "measure:area-close",
      measureType: "area_closure",
      territoryIds: ["territory:saint-louis"],
      speciesCodes: [],
      decidedByActorId: "actor:ministry",
      validFrom: "2027-08-01T00:00:00Z",
      validUntil: "2027-08-03T00:00:00Z",
      allowedGearCodes: [],
      rationale: ["Sécurité"],
      status: "active",
      evidenceIds: ["evidence:closure"],
    },
  });

  assert.throws(() => service.decideFishingActivity({
    caseId: "resilience:block",
    decision: {
      id: "decision:forbidden",
      territoryId: "territory:saint-louis",
      decision: "authorized",
      reasons: [],
      conditions: [],
      relatedSignalIds: ["signal:critical"],
      relatedMeasureIds: ["measure:area-close"],
      decidedByActorId: "actor:authority",
      validFrom: "2027-08-01T08:00:00Z",
      evidenceIds: ["evidence:bad-decision"],
    },
  }), /ne peut pas être autorisée/);
});
