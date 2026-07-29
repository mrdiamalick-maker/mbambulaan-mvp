import { describe, expect, it } from "@/test/vitest-compat";
import { InterterritorialCapacityCoordination } from "./interterritorial-capacity-coordination";

const need = {
  id: "need-cold-1",
  crisisId: "crisis-1",
  territoryId: "territory-dakar",
  needType: "cold_storage" as const,
  requiredQuantity: 8_000,
  availableQuantity: 1_000,
  mobilizedQuantity: 0,
  unit: "kg",
  priority: "critical" as const,
  latestRequiredAt: "2026-07-28T18:00:00.000Z",
  status: "identified" as const,
  supportingDocumentIds: ["capacity-gap-dakar"],
};

describe("InterterritorialCapacityCoordination", () => {
  it("selectionne, transfere et confirme une capacite interterritoriale", () => {
    const coordination = new InterterritorialCapacityCoordination();
    coordination.registerOffer({
      id: "offer-thies-1",
      crisisId: "crisis-1",
      sourceTerritoryId: "territory-thies",
      capacityType: "cold_storage",
      availableQuantity: 7_000,
      unit: "kg",
      ownerActorId: "actor-cold-thies",
      ownerOrganizationId: "org-cold-thies",
      earliestDepartureAt: "2026-07-28T14:00:00.000Z",
      estimatedArrivalAt: "2026-07-28T16:00:00.000Z",
      estimatedTransferCostXof: 850_000,
      conditions: ["retour sous 48 heures"],
      availabilityDocumentIds: ["availability-note-thies"],
      status: "available",
    });

    const selected = coordination.selectBestOffer({ crisisId: "crisis-1", need, maximumBudgetXof: 1_000_000 });
    expect(selected.id).toBe("offer-thies-1");

    coordination.planTransfer({
      id: "transfer-1",
      crisisId: "crisis-1",
      needId: need.id,
      capacityOfferId: selected.id,
      sourceTerritoryId: selected.sourceTerritoryId,
      destinationTerritoryId: need.territoryId,
      responsibleActorId: selected.ownerActorId,
      quantity: 7_000,
      unit: "kg",
      authorizedBudgetXof: 900_000,
      departureDocumentIds: [],
      receptionDocumentIds: [],
      status: "planned",
      plannedAt: "2026-07-28T13:00:00.000Z",
    });
    coordination.confirmDeparture({ transferId: "transfer-1", departureDocumentIds: ["loading-note-1"], departedAt: "2026-07-28T14:10:00.000Z" });
    const received = coordination.confirmReception({ transferId: "transfer-1", receptionDocumentIds: ["signed-reception-dakar"], receivedAt: "2026-07-28T16:05:00.000Z", commandId: "mobilize-cold-storage" });

    expect(received.transfer.status).toBe("received");
    expect(received.crisisCommand.command.type).toBe("mobilize_need");
    expect(coordination.snapshot().metrics.deliveredQuantity).toBe(7_000);
  });

  it("refuse un transfert dont le budget ne couvre pas le cout", () => {
    const coordination = new InterterritorialCapacityCoordination();
    coordination.registerOffer({
      id: "offer-1", crisisId: "crisis-1", sourceTerritoryId: "territory-thies", capacityType: "cold_storage", availableQuantity: 5_000, unit: "kg",
      ownerActorId: "actor-1", ownerOrganizationId: "org-1", earliestDepartureAt: "2026-07-28T14:00:00.000Z", estimatedArrivalAt: "2026-07-28T16:00:00.000Z",
      estimatedTransferCostXof: 800_000, conditions: [], availabilityDocumentIds: ["note"], status: "available",
    });
    expect(() => coordination.planTransfer({
      id: "transfer-1", crisisId: "crisis-1", needId: need.id, capacityOfferId: "offer-1", sourceTerritoryId: "territory-thies", destinationTerritoryId: "territory-dakar",
      responsibleActorId: "actor-1", quantity: 4_000, unit: "kg", authorizedBudgetXof: 500_000, departureDocumentIds: [], receptionDocumentIds: [], status: "planned", plannedAt: "2026-07-28T13:00:00.000Z",
    })).toThrow("budget autorisé");
  });
});
