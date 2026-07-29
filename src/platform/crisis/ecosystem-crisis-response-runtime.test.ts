import { describe, expect, it } from "@/test/vitest-compat";
import { EcosystemCrisisResponseRuntime } from "./ecosystem-crisis-response-runtime";

describe("EcosystemCrisisResponseRuntime", () => {
  it("coordonne une rupture de froid sur deux territoires jusqu a la reprise", () => {
    const runtime = new EcosystemCrisisResponseRuntime();
    const at = "2026-07-28T08:00:00.000Z";

    runtime.execute({ commandId: "crisis", actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "report_crisis", crisis: {
      id: "crisis-1", title: "Rupture de froid multi-sites", type: "cold_chain_breakdown", territoryIds: ["territory-dakar", "territory-thies"], severity: "critical",
      description: "Deux chambres froides indisponibles après panne électrique.", reportedByActorId: "coordinator", reportedAt: at,
      situationDocumentIds: ["site-report-dakar", "site-report-thies"], status: "reported",
    } } });

    for (const territoryId of ["territory-dakar", "territory-thies"]) {
      runtime.execute({ commandId: `impact-${territoryId}`, actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "assess_territory_impact", impact: {
        id: `impact-${territoryId}`, crisisId: "crisis-1", territoryId, affectedActorCount: 120, exposedVolumeKg: 8_000, exposedValueXof: 24_000_000,
        jobsAtRisk: 45, continuityScore: 30, urgentNeeds: ["cold_storage", "transport"], localContactActorId: `contact-${territoryId}`,
        situationDocumentIds: [`assessment-${territoryId}`], assessedAt: at,
      } } });
    }

    runtime.execute({ commandId: "qualify", actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "qualify_crisis", crisisId: "crisis-1" } });
    runtime.execute({ commandId: "cell", actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "activate_response_cell", cell: {
      id: "cell-1", crisisId: "crisis-1", nationalCoordinatorActorId: "coordinator", territorialCoordinatorActorIds: ["dakar-lead", "thies-lead"],
      technicalContactActorIds: ["cold-expert"], logisticsContactActorIds: ["transport-lead"], publicDecisionMakerActorIds: ["ministry-decision"],
      partnerOrganizationIds: ["cold-provider", "transport-provider"], responsibilitiesNoteId: "signed-response-note", activatedAt: at, status: "active",
    } } });

    runtime.execute({ commandId: "need", actorId: "dakar-lead", activeTerritoryId: "territory-national", command: { type: "register_priority_need", need: {
      id: "need-cold", crisisId: "crisis-1", territoryId: "territory-dakar", needType: "cold_storage", requiredQuantity: 10_000,
      availableQuantity: 2_000, mobilizedQuantity: 0, unit: "kg", priority: "critical", latestRequiredAt: "2026-07-28T12:00:00.000Z",
      status: "identified", supportingDocumentIds: ["capacity-sheet"],
    } } });
    runtime.execute({ commandId: "decision", actorId: "ministry-decision", activeTerritoryId: "territory-national", command: { type: "record_decision", decision: {
      id: "decision-1", crisisId: "crisis-1", territoryIds: ["territory-dakar", "territory-thies"], decisionType: "move_capacity",
      decidedByActorId: "ministry-decision", reason: "Éviter la perte des captures", conditions: ["priorité aux lots à risque"], authorizedBudgetXof: 5_000_000,
      decisionDocumentIds: ["signed-decision"], decidedAt: at,
    } } });
    runtime.execute({ commandId: "commitment", actorId: "transport-lead", activeTerritoryId: "territory-national", command: { type: "record_commitment", commitment: {
      id: "commitment-1", crisisId: "crisis-1", decisionId: "decision-1", ownerActorId: "transport-lead", partnerActorIds: ["cold-provider"],
      territoryIds: ["territory-dakar", "territory-thies"], actionDescription: "Transférer les lots vers une chambre froide disponible", relatedNeedIds: ["need-cold"],
      committedQuantity: 8_000, committedUnit: "kg", committedBudgetXof: 3_500_000, dueAt: "2026-07-28T14:00:00.000Z",
      status: "committed", completionDocumentIds: [],
    } } });
    runtime.execute({ commandId: "mobilize", actorId: "transport-lead", activeTerritoryId: "territory-national", command: { type: "mobilize_need", needId: "need-cold", quantity: 8_000, supportingDocumentIds: ["transport-note", "cold-room-receipt"] } });
    runtime.execute({ commandId: "fulfill", actorId: "transport-lead", activeTerritoryId: "territory-national", command: { type: "update_commitment", commitmentId: "commitment-1", status: "fulfilled", progressNote: "Lots transférés et réceptionnés", completionDocumentIds: ["signed-reception"], completedAt: "2026-07-28T13:00:00.000Z" } });
    runtime.execute({ commandId: "result", actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "record_recovery_result", result: {
      id: "result-1", crisisId: "crisis-1", territoryId: "territory-dakar", commitmentId: "commitment-1", actorsProtectedCount: 200,
      volumeSavedKg: 7_600, valueProtectedXof: 22_800_000, jobsProtectedCount: 80, continuityScoreAfter: 82, responseTimeHours: 5,
      lossAvoidedKg: 7_600, resultDocumentIds: ["recovery-report"], lessons: ["Pré-réserver une capacité de secours"], measuredAt: "2026-07-28T15:00:00.000Z",
    } } });
    runtime.execute({ commandId: "close", actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "advance_crisis", crisisId: "crisis-1", status: "closed" } });

    const snapshot = runtime.snapshot();
    expect(snapshot.metrics.priorityNeedCoveragePercent).toBe(100);
    expect(snapshot.metrics.volumeSavedKg).toBe(7_600);
    expect(snapshot.metrics.valueProtectedXof).toBe(22_800_000);
    expect(snapshot.crises[0].status).toBe("closed");
  });

  it("refuse de cloturer une crise avec un engagement encore ouvert", () => {
    const runtime = new EcosystemCrisisResponseRuntime();
    runtime.execute({ commandId: "crisis", actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "report_crisis", crisis: {
      id: "crisis", title: "Rupture de transport", type: "transport_disruption", territoryIds: ["territory-dakar"], severity: "high",
      description: "Transport indisponible", reportedByActorId: "coordinator", reportedAt: "2026-07-28T00:00:00.000Z", situationDocumentIds: ["report"], status: "reported",
    } } });
    expect(() => runtime.execute({ commandId: "close", actorId: "coordinator", activeTerritoryId: "territory-national", command: { type: "advance_crisis", crisisId: "crisis", status: "closed" } })).toThrow("résultat de reprise");
  });
});
