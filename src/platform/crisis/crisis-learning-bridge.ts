import type { CrisisRecoveryResult } from "./ecosystem-crisis-response-runtime";
import type { InterterritorialTransfer } from "./interterritorial-capacity-coordination";
import type { SectorBusinessEvent } from "@/platform/knowledge/sector-learning-ingestion";

export function crisisRecoveryToKnowledgeEvent(input: {
  result: CrisisRecoveryResult;
  actorId: string;
  crisisTitle: string;
  crisisType: string;
  effectiveActions: string[];
  causalFactors: string[];
}): SectorBusinessEvent {
  if (!input.result.resultDocumentIds.length) throw new Error("Le résultat de reprise doit comporter un relevé terrain avant capitalisation.");
  return {
    id: `crisis-learning:${input.result.id}`,
    eventType: "crisis_recovery_result_recorded",
    aggregateId: input.result.crisisId,
    territoryId: input.result.territoryId,
    actorId: input.actorId,
    occurredAt: input.result.measuredAt,
    evidenceIds: input.result.resultDocumentIds,
    confidenceScore: 82,
    payload: {
      title: `Enseignement de reprise — ${input.crisisTitle}`,
      summary: `${input.result.actorsProtectedCount} acteurs protégés, ${input.result.volumeSavedKg} kg sauvés et ${input.result.valueProtectedXof} FCFA de valeur protégée. Actions efficaces : ${input.effectiveActions.join(", ")}. Facteurs identifiés : ${input.causalFactors.join(", ")}.`,
      crisisType: input.crisisType,
      actorsProtectedCount: input.result.actorsProtectedCount,
      volumeSavedKg: input.result.volumeSavedKg,
      valueProtectedXof: input.result.valueProtectedXof,
      jobsProtectedCount: input.result.jobsProtectedCount,
      responseTimeHours: input.result.responseTimeHours,
      continuityScoreAfter: input.result.continuityScoreAfter,
      lessons: input.result.lessons.join(" | "),
    },
  };
}

export function receivedTransferToKnowledgeEvent(input: {
  transfer: InterterritorialTransfer;
  actorId: string;
  capacityType: string;
  sourceOrganizationName: string;
  destinationSiteName: string;
}): SectorBusinessEvent {
  if (input.transfer.status !== "received" || !input.transfer.receivedAt) throw new Error("Seul un transfert reçu peut être capitalisé.");
  if (!input.transfer.receptionDocumentIds.length) throw new Error("La confirmation de réception est obligatoire avant capitalisation.");
  return {
    id: `capacity-learning:${input.transfer.id}`,
    eventType: "interterritorial_capacity_transfer_received",
    aggregateId: input.transfer.crisisId,
    territoryId: input.transfer.destinationTerritoryId,
    actorId: input.actorId,
    occurredAt: input.transfer.receivedAt,
    evidenceIds: input.transfer.receptionDocumentIds,
    confidenceScore: 88,
    payload: {
      title: `Capacité reçue de ${input.sourceOrganizationName}`,
      summary: `${input.transfer.quantity} ${input.transfer.unit} de ${input.capacityType} ont été transférés de ${input.transfer.sourceTerritoryId} vers ${input.destinationSiteName}, sous la responsabilité de ${input.transfer.responsibleActorId}.`,
      sourceTerritoryId: input.transfer.sourceTerritoryId,
      destinationTerritoryId: input.transfer.destinationTerritoryId,
      quantity: input.transfer.quantity,
      unit: input.transfer.unit,
      authorizedBudgetXof: input.transfer.authorizedBudgetXof,
    },
  };
}
