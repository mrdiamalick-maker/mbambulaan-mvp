import assert from "node:assert/strict";
import test from "node:test";
import { EndToEndPublicProgramPolicyImpactCapability } from "./end-to-end-public-program-policy-impact-capability";

const at = (value: string) => value as never;

test("pilote un programme public de réduction des pertes et d'inclusion économique", () => {
  const capability = new EndToEndPublicProgramPolicyImpactCapability();
  capability.openProgram({
    id: "program:pertes-2027",
    programCode: "MPEM-PERTES-2027",
    title: "Réduction des pertes post-capture et inclusion des femmes transformatrices",
    ministryActorId: "actor:ministry",
    countryId: "country:sn",
    territoryIds: ["territory:joal", "territory:mbour", "territory:dakar"],
    periodStart: at("2027-01-01T00:00:00Z"),
    periodEnd: at("2027-12-31T23:59:59Z"),
    totalBudgetCeilingXof: 1_200_000_000,
    platformContractId: "contract:public-program-platform",
    createdAt: at("2026-11-01T09:00:00Z"),
  });

  capability.defineObjective({
    caseId: "program:pertes-2027",
    objective: { id: "objective:waste", objectiveType: "waste_reduction", label: "Réduire les pertes", baselineValue: 18, targetValue: 10, unit: "percent", targetAt: at("2027-12-31T00:00:00Z"), weightPercent: 60, evidenceIds: ["evidence:baseline-waste"] },
    definedAt: at("2026-11-02T09:00:00Z"),
  });
  capability.defineObjective({
    caseId: "program:pertes-2027",
    objective: { id: "objective:women-income", objectiveType: "women_empowerment", label: "Augmenter le revenu des femmes", baselineValue: 100, targetValue: 130, unit: "index", targetAt: at("2027-12-31T00:00:00Z"), weightPercent: 40, evidenceIds: ["evidence:baseline-income"] },
    definedAt: at("2026-11-02T10:00:00Z"),
  });

  capability.addIntervention({
    caseId: "program:pertes-2027",
    intervention: {
      id: "intervention:cold-and-market",
      interventionType: "infrastructure_support",
      title: "Froid partagé et accès au marché",
      territoryIds: ["territory:joal", "territory:mbour"],
      capabilityIds: ["capability:cold-storage", "capability:market-access"],
      deliveryActorIds: ["actor:mbambulaan", "actor:agency"],
      beneficiarySegmentCodes: ["women-processors", "artisanal-fishers"],
      plannedBeneficiaryCount: 2_000,
      plannedBudgetXof: 900_000_000,
      startAt: at("2027-01-15T00:00:00Z"),
      endAt: at("2027-12-15T00:00:00Z"),
      status: "ready",
      dependencyIds: [],
      evidenceIds: ["evidence:intervention-design"],
    },
    addedAt: at("2026-11-05T09:00:00Z"),
  });

  capability.registerBeneficiary({
    caseId: "program:pertes-2027",
    beneficiary: {
      id: "beneficiary:coop-women-joal",
      actorId: "actor:coop-women-joal",
      organizationId: "org:coop-women-joal",
      segmentCode: "women-processors",
      territoryId: "territory:joal",
      eligibilityStatus: "eligible",
      eligibilityReasons: ["Activité de transformation vérifiée", "Forte exposition aux pertes"],
      vulnerabilityScore: 82,
      womenLed: true,
      youthLed: false,
      registeredAt: at("2026-12-01T09:00:00Z"),
      evidenceIds: ["evidence:eligibility-joal"],
    },
  });

  capability.addBudgetLine({
    caseId: "program:pertes-2027",
    budgetLine: {
      id: "budget:delivery",
      interventionId: "intervention:cold-and-market",
      category: "infrastructure",
      allocatedAmountXof: 900_000_000,
      committedAmountXof: 900_000_000,
      disbursedAmountXof: 700_000_000,
      spentAmountXof: 620_000_000,
      fundingSourceActorId: "actor:ministry",
      status: "partially_disbursed",
      evidenceIds: ["evidence:budget-commitment"],
    },
    addedAt: at("2026-12-10T09:00:00Z"),
  });

  capability.approveProgram({
    caseId: "program:pertes-2027",
    decision: {
      id: "decision:approve",
      decisionType: "approve_program",
      rationale: "Programme prioritaire pour la sécurité alimentaire et les revenus côtiers.",
      decidedByActorId: "actor:ministry",
      affectedInterventionIds: ["intervention:cold-and-market"],
      affectedTerritoryIds: ["territory:joal", "territory:mbour"],
      expectedImpact: ["Réduction des pertes", "Hausse des revenus"],
      evidenceIds: ["evidence:ministerial-decision"],
      decidedAt: at("2026-12-15T09:00:00Z"),
    },
  });
  capability.launchProgram({ caseId: "program:pertes-2027", launchedAt: at("2027-01-15T09:00:00Z") });

  capability.recordDelivery({
    caseId: "program:pertes-2027",
    delivery: {
      id: "delivery:joal-cold-access",
      interventionId: "intervention:cold-and-market",
      beneficiaryId: "beneficiary:coop-women-joal",
      deliveredByActorId: "actor:mbambulaan",
      deliveryType: "cold-storage-access-package",
      quantity: 1,
      unit: "package",
      monetaryValueXof: 12_000_000,
      deliveredAt: at("2027-04-10T09:00:00Z"),
      acceptedAt: at("2027-04-12T09:00:00Z"),
      status: "accepted",
      sourceReferenceIds: ["contract:public-program-platform"],
      evidenceIds: ["evidence:delivery-accepted"],
    },
  });

  capability.recordMeasurement({ caseId: "program:pertes-2027", measurement: { id: "measurement:waste", objectiveId: "objective:waste", territoryId: "territory:joal", measuredValue: 11, unit: "percent", periodStart: at("2027-01-01T00:00:00Z"), periodEnd: at("2027-09-30T23:59:59Z"), measuredAt: at("2027-10-10T09:00:00Z"), confidenceScore: 88, methodology: "Comparaison des volumes débarqués, vendus et perdus.", evidenceIds: ["evidence:waste-measurement"] } });
  capability.recordMeasurement({ caseId: "program:pertes-2027", measurement: { id: "measurement:income", objectiveId: "objective:women-income", territoryId: "territory:joal", beneficiarySegmentCode: "women-processors", measuredValue: 124, unit: "index", periodStart: at("2027-01-01T00:00:00Z"), periodEnd: at("2027-09-30T23:59:59Z"), measuredAt: at("2027-10-10T10:00:00Z"), confidenceScore: 82, methodology: "Panel de bénéficiaires et données de transactions.", evidenceIds: ["evidence:income-measurement"] } });

  const evaluation = capability.evaluateImpact({
    caseId: "program:pertes-2027",
    evaluation: {
      id: "evaluation:2027-q3",
      evaluatedAt: at("2027-10-20T09:00:00Z"),
      evaluatorActorId: "actor:independent-evaluator",
      valueCreatedAndProtectedXof: 1_850_000_000,
      platformRevenueXof: 72_000_000,
      attributionConfidencePercent: 78,
      unintendedEffects: ["Demande de froid supérieure aux prévisions"],
      recommendations: ["Étendre à Dakar", "Renforcer les quotas réservés aux femmes"],
      status: "validated",
      evidenceIds: ["evidence:impact-evaluation"],
    },
  });

  assert.equal(evaluation.objectiveAchievementPercent, 88.25);
  assert.equal(evaluation.budgetExecutionPercent, 68.89);
  assert.equal(evaluation.beneficiaryCoveragePercent, 100);
  assert.equal(evaluation.costPerBeneficiaryXof, 620_000_000);

  const commandCenter = capability.getPublicProgramCommandCenter({ caseId: "program:pertes-2027", generatedAt: at("2027-10-21T09:00:00Z") });
  assert.equal(commandCenter.servedBeneficiaryCount, 1);
  assert.equal(commandCenter.womenLedServedCount, 1);
  assert.equal(commandCenter.latestPlatformRevenueXof, 72_000_000);
});

test("bloque les incohérences budgétaires et les bénéficiaires non éligibles", () => {
  const capability = new EndToEndPublicProgramPolicyImpactCapability();
  capability.openProgram({ id: "program:test", programCode: "TEST", title: "Test", ministryActorId: "actor:ministry", countryId: "country:sn", territoryIds: ["territory:joal"], periodStart: at("2027-01-01T00:00:00Z"), periodEnd: at("2027-12-31T00:00:00Z"), totalBudgetCeilingXof: 100_000_000, createdAt: at("2026-12-01T00:00:00Z") });
  capability.addIntervention({ caseId: "program:test", intervention: { id: "intervention:test", interventionType: "training", title: "Formation", territoryIds: ["territory:joal"], capabilityIds: [], deliveryActorIds: ["actor:trainer"], beneficiarySegmentCodes: ["fishers"], plannedBeneficiaryCount: 10, plannedBudgetXof: 50_000_000, startAt: at("2027-01-01T00:00:00Z"), endAt: at("2027-06-01T00:00:00Z"), status: "active", dependencyIds: [], evidenceIds: ["evidence:design"] }, addedAt: at("2026-12-02T00:00:00Z") });
  assert.throws(() => capability.addBudgetLine({ caseId: "program:test", budgetLine: { id: "budget:bad", interventionId: "intervention:test", category: "training", allocatedAmountXof: 90_000_000, committedAmountXof: 95_000_000, disbursedAmountXof: 0, spentAmountXof: 0, fundingSourceActorId: "actor:ministry", status: "allocated", evidenceIds: ["evidence:budget"] }, addedAt: at("2026-12-03T00:00:00Z") }), /chaîne budgétaire/i);
  capability.registerBeneficiary({ caseId: "program:test", beneficiary: { id: "beneficiary:ineligible", actorId: "actor:ineligible", segmentCode: "fishers", territoryId: "territory:joal", eligibilityStatus: "ineligible", eligibilityReasons: ["Licence expirée"], vulnerabilityScore: 20, womenLed: false, youthLed: false, registeredAt: at("2026-12-04T00:00:00Z"), evidenceIds: ["evidence:eligibility"] } });
  assert.throws(() => capability.recordDelivery({ caseId: "program:test", delivery: { id: "delivery:bad", interventionId: "intervention:test", beneficiaryId: "beneficiary:ineligible", deliveredByActorId: "actor:trainer", deliveryType: "training", quantity: 1, unit: "session", monetaryValueXof: 100_000, deliveredAt: at("2027-02-01T00:00:00Z"), status: "delivered", sourceReferenceIds: [], evidenceIds: ["evidence:delivery"] } }), /programme et l'intervention doivent être actifs|bénéficiaire n'est pas éligible/i);
});
