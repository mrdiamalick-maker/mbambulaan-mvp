import { describe, expect, it } from "vitest";
import { EndToEndNationalCapacityInvestmentPlanningCapability } from "./end-to-end-national-capacity-investment-planning-capability";

const capability = () => new EndToEndNationalCapacityInvestmentPlanningCapability();

function buildProject(id: string, gapId: string, territoryId: string, capitalCost: number, platformRevenue: number) {
  return {
    id,
    projectCode: `PROJ-${id}`,
    title: `Projet ${id}`,
    territoryIds: [territoryId],
    categories: ["cold_storage" as const],
    gapIds: [gapId],
    sponsorActorId: "actor:ministry",
    implementingActorIds: ["actor:operator"],
    beneficiaryActorIds: ["actor:cooperative"],
    estimatedCapitalCostXof: capitalCost,
    estimatedAnnualOperatingCostXof: capitalCost * 0.08,
    requestedPublicFundingXof: capitalCost * 0.5,
    requestedPrivateFundingXof: capitalCost * 0.3,
    requestedGrantFundingXof: capitalCost * 0.2,
    committedFundingXof: 0,
    expectedAdditionalCapacity: 100,
    capacityUnit: "tonnes",
    expectedAnnualVolumeSupportedKg: 1_500_000,
    expectedAnnualWasteAvoidedKg: 250_000,
    expectedAnnualValueProtectedXof: 600_000_000,
    expectedJobsCreated: 30,
    expectedJobsProtected: 180,
    expectedPlatformRevenueXof: platformRevenue,
    expectedResourcePressureChangePercent: -4,
    status: "identified" as const,
    priorityScore: 0,
    strategicRationale: ["Réduire les pertes post-capture", "Sécuriser les débouchés"],
    blockers: [],
    evidenceIds: [`evidence:${id}`],
    plannedStartAt: "2027-03-01T00:00:00.000Z",
    plannedOperationalAt: "2028-01-01T00:00:00.000Z",
  };
}

describe("EndToEndNationalCapacityInvestmentPlanningCapability", () => {
  it("priorise, finance, exécute et mesure un investissement national", () => {
    const engine = capability();
    engine.openPlan({
      id: "plan:2027-2030",
      planCode: "PNCI-2027-2030",
      countryId: "country:sn",
      territoryIds: ["territory:joal", "territory:mbour", "territory:saint-louis"],
      periodStart: "2027-01-01T00:00:00.000Z",
      periodEnd: "2030-12-31T23:59:59.000Z",
      totalBudgetCeilingXof: 1_200_000_000,
      createdAt: "2027-01-02T00:00:00.000Z",
    });

    engine.registerBaseline({
      planId: "plan:2027-2030",
      baseline: {
        id: "baseline:joal:cold",
        territoryId: "territory:joal",
        category: "cold_storage",
        installedCapacity: 120,
        usableCapacity: 70,
        requiredCapacity: 200,
        unit: "tonnes",
        utilizationPercent: 95,
        reliabilityPercent: 62,
        averageServiceCostXof: 18_000,
        evidenceIds: ["evidence:baseline:joal"],
        measuredAt: "2027-01-10T00:00:00.000Z",
      },
    });

    engine.detectGap({
      planId: "plan:2027-2030",
      gap: {
        id: "gap:joal:cold",
        territoryId: "territory:joal",
        category: "cold_storage",
        gapQuantity: 125,
        unit: "tonnes",
        severity: "critical",
        affectedActorCount: 850,
        affectedVolumeKg: 4_800_000,
        valueAtRiskXof: 1_100_000_000,
        jobsAtRisk: 620,
        expectedDemandGrowthPercent: 18,
        climateRiskScore: 74,
        resourcePressureScore: 66,
        evidenceIds: ["evidence:gap:joal"],
        detectedAt: "2027-01-12T00:00:00.000Z",
      },
    });

    const project = engine.proposeProject({
      planId: "plan:2027-2030",
      project: buildProject("cold-hub-joal", "gap:joal:cold", "territory:joal", 900_000_000, 45_000_000),
      proposedAt: "2027-01-20T00:00:00.000Z",
    });
    expect(project.priorityScore).toBeGreaterThan(70);

    const portfolio = engine.prioritizePortfolio({ planId: "plan:2027-2030", prioritizedAt: "2027-02-01T00:00:00.000Z" });
    expect(portfolio[0].status).toBe("prioritized");

    engine.registerFundingCommitment({
      planId: "plan:2027-2030",
      commitment: {
        id: "funding:state",
        projectId: "cold-hub-joal",
        funderActorId: "actor:ministry",
        fundingType: "public_budget",
        amountXof: 450_000_000,
        disbursedAmountXof: 250_000_000,
        conditions: ["Audit trimestriel"],
        status: "partially_disbursed",
        evidenceIds: ["evidence:funding:state"],
        committedAt: "2027-02-10T00:00:00.000Z",
      },
    });
    engine.registerFundingCommitment({
      planId: "plan:2027-2030",
      commitment: {
        id: "funding:private",
        projectId: "cold-hub-joal",
        funderActorId: "actor:investor",
        fundingType: "private_equity",
        amountXof: 270_000_000,
        disbursedAmountXof: 270_000_000,
        conditions: ["Gouvernance conjointe"],
        status: "disbursed",
        evidenceIds: ["evidence:funding:private"],
        committedAt: "2027-02-12T00:00:00.000Z",
      },
    });
    const approved = engine.registerFundingCommitment({
      planId: "plan:2027-2030",
      commitment: {
        id: "funding:grant",
        projectId: "cold-hub-joal",
        funderActorId: "actor:donor",
        fundingType: "grant",
        amountXof: 180_000_000,
        disbursedAmountXof: 180_000_000,
        conditions: ["Mesure d'impact annuelle"],
        status: "disbursed",
        evidenceIds: ["evidence:funding:grant"],
        committedAt: "2027-02-15T00:00:00.000Z",
      },
    });
    expect(approved.status).toBe("approved");

    engine.registerMilestone({
      planId: "plan:2027-2030",
      milestone: {
        id: "milestone:handover",
        projectId: "cold-hub-joal",
        milestoneType: "operational_handover",
        label: "Mise en service du hub froid",
        ownerActorId: "actor:operator",
        plannedAt: "2028-01-01T00:00:00.000Z",
        status: "planned",
        budgetConsumedXof: 0,
        evidenceIds: [],
      },
      registeredAt: "2027-03-01T00:00:00.000Z",
    });

    engine.completeMilestone({
      planId: "plan:2027-2030",
      milestoneId: "milestone:handover",
      completedAt: "2027-12-15T00:00:00.000Z",
      budgetConsumedXof: 870_000_000,
      evidenceIds: ["evidence:handover"],
    });

    engine.recordOutcome({
      planId: "plan:2027-2030",
      outcome: {
        id: "outcome:cold-hub-joal",
        projectId: "cold-hub-joal",
        measuredAt: "2028-12-31T00:00:00.000Z",
        operationalCapacityAdded: 110,
        capacityUnit: "tonnes",
        annualizedVolumeSupportedKg: 1_420_000,
        annualizedWasteAvoidedKg: 235_000,
        annualizedValueProtectedXof: 560_000_000,
        jobsCreated: 27,
        jobsProtected: 165,
        platformRevenueXof: 39_000_000,
        beneficiaryActorCount: 780,
        serviceCostChangePercent: -12,
        reliabilityChangePercent: 29,
        resourcePressureChangePercent: -3.5,
        confidenceScore: 86,
        evidenceIds: ["evidence:outcome:cold-hub"],
      },
    });

    const center = engine.getNationalInvestmentCommandCenter({
      planId: "plan:2027-2030",
      generatedAt: "2029-01-15T00:00:00.000Z",
    });
    expect(center.operationalProjectCount).toBe(1);
    expect(center.annualizedValueProtectedXof).toBe(560_000_000);
    expect(center.platformRevenueXof).toBe(39_000_000);
    expect(center.jobsCreated).toBe(27);
    expect(center.fundingCoveragePercent).toBe(100);
  });

  it("arbitre plusieurs projets sous plafond budgétaire", () => {
    const engine = capability();
    engine.openPlan({
      id: "plan:portfolio",
      planCode: "PORTFOLIO-TEST",
      countryId: "country:sn",
      territoryIds: ["territory:a", "territory:b"],
      periodStart: "2027-01-01T00:00:00.000Z",
      periodEnd: "2029-12-31T00:00:00.000Z",
      totalBudgetCeilingXof: 600_000_000,
      createdAt: "2027-01-01T00:00:00.000Z",
    });

    for (const [territoryId, suffix] of [["territory:a", "a"], ["territory:b", "b"]] as const) {
      engine.registerBaseline({
        planId: "plan:portfolio",
        baseline: {
          id: `baseline:${suffix}`,
          territoryId,
          category: "cold_storage",
          installedCapacity: 50,
          usableCapacity: 40,
          requiredCapacity: 120,
          unit: "tonnes",
          utilizationPercent: 95,
          reliabilityPercent: 60,
          evidenceIds: [`evidence:baseline:${suffix}`],
          measuredAt: "2027-01-02T00:00:00.000Z",
        },
      });
      engine.detectGap({
        planId: "plan:portfolio",
        gap: {
          id: `gap:${suffix}`,
          territoryId,
          category: "cold_storage",
          gapQuantity: 80,
          unit: "tonnes",
          severity: suffix === "a" ? "critical" : "medium",
          affectedActorCount: suffix === "a" ? 500 : 100,
          affectedVolumeKg: suffix === "a" ? 2_000_000 : 500_000,
          valueAtRiskXof: suffix === "a" ? 700_000_000 : 100_000_000,
          jobsAtRisk: suffix === "a" ? 300 : 40,
          expectedDemandGrowthPercent: 10,
          climateRiskScore: suffix === "a" ? 80 : 30,
          resourcePressureScore: suffix === "a" ? 70 : 25,
          evidenceIds: [`evidence:gap:${suffix}`],
          detectedAt: "2027-01-03T00:00:00.000Z",
        },
      });
    }

    engine.proposeProject({ planId: "plan:portfolio", project: buildProject("a", "gap:a", "territory:a", 500_000_000, 30_000_000), proposedAt: "2027-01-05T00:00:00.000Z" });
    engine.proposeProject({ planId: "plan:portfolio", project: buildProject("b", "gap:b", "territory:b", 400_000_000, 5_000_000), proposedAt: "2027-01-05T00:00:00.000Z" });

    const portfolio = engine.prioritizePortfolio({ planId: "plan:portfolio", prioritizedAt: "2027-01-10T00:00:00.000Z" });
    expect(portfolio.find((project) => project.id === "a")?.status).toBe("prioritized");
    expect(portfolio.find((project) => project.id === "b")?.blockers).toContain("Projet hors enveloppe budgétaire prioritaire.");
  });

  it("refuse un déficit incohérent et un projet surfinancé", () => {
    const engine = capability();
    engine.openPlan({
      id: "plan:negative",
      planCode: "NEGATIVE",
      countryId: "country:sn",
      territoryIds: ["territory:x"],
      periodStart: "2027-01-01T00:00:00.000Z",
      periodEnd: "2028-12-31T00:00:00.000Z",
      totalBudgetCeilingXof: 100_000_000,
      createdAt: "2027-01-01T00:00:00.000Z",
    });
    engine.registerBaseline({
      planId: "plan:negative",
      baseline: {
        id: "baseline:x",
        territoryId: "territory:x",
        category: "cold_storage",
        installedCapacity: 100,
        usableCapacity: 90,
        requiredCapacity: 100,
        unit: "tonnes",
        utilizationPercent: 80,
        reliabilityPercent: 90,
        evidenceIds: ["evidence:baseline:x"],
        measuredAt: "2027-01-02T00:00:00.000Z",
      },
    });
    expect(() => engine.detectGap({
      planId: "plan:negative",
      gap: {
        id: "gap:x",
        territoryId: "territory:x",
        category: "cold_storage",
        gapQuantity: 50,
        unit: "tonnes",
        severity: "high",
        affectedActorCount: 10,
        affectedVolumeKg: 10_000,
        valueAtRiskXof: 5_000_000,
        jobsAtRisk: 5,
        expectedDemandGrowthPercent: 2,
        climateRiskScore: 20,
        resourcePressureScore: 20,
        evidenceIds: ["evidence:gap:x"],
        detectedAt: "2027-01-03T00:00:00.000Z",
      },
    })).toThrow("n'est pas cohérent");
  });
});
