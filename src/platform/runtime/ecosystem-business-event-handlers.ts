import { getDocumentEventIngestionService } from "@/platform/documents/document-event-ingestion-service";
import { getPersistentUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/persistent-unified-work-orchestration-runtime";
import { getUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/unified-work-orchestration-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import type { EcosystemBusinessEventHandler } from "./ecosystem-business-event-bus";
import { getNationalCoordinationSignalProjection } from "./national-coordination-signal-projection";
import { getPersistentNationalCoordinationSignalService } from "./persistent-national-coordination-signal-service";

export function buildDefaultBusinessEventHandlers(): EcosystemBusinessEventHandler[] {
  return [
    {
      name: "documents-projector",
      eventTypes: [
        "commerce.delivery.confirmed",
        "finance.payment.confirmed",
        "contracts.contract.registered",
        "identity.mandate.activated",
        "crisis.recovery.recorded",
      ],
      async handle(event) {
        if (event.type === "commerce.delivery.confirmed") {
          await getDocumentEventIngestionService().ingest({
            type: "commercial_delivery_confirmed",
            entityId: event.entityId,
            organizationId: event.organizationId,
            actorId: event.actorId,
            territoryIds: event.territoryIds,
            occurredAt: event.occurredAt,
            deliveryNoteReference: event.payload.deliveryNoteReference ? String(event.payload.deliveryNoteReference) : undefined,
            destinationConfirmationReference: event.payload.destinationConfirmationReference ? String(event.payload.destinationConfirmationReference) : undefined,
            checksumSha256: String(event.payload.checksumSha256 ?? event.id),
          });
          return;
        }
        if (event.type === "finance.payment.confirmed") {
          await getDocumentEventIngestionService().ingest({
            type: "finance_transfer_confirmed",
            entityId: event.entityId,
            organizationId: event.organizationId,
            actorId: event.actorId,
            territoryIds: event.territoryIds,
            occurredAt: event.occurredAt,
            transferReference: String(event.payload.transferReference),
            checksumSha256: String(event.payload.checksumSha256 ?? event.id),
          });
          return;
        }
        if (event.type === "contracts.contract.registered") {
          await getDocumentEventIngestionService().ingest({
            type: "contract_signed",
            entityId: event.entityId,
            organizationId: event.organizationId,
            actorId: event.actorId,
            territoryIds: event.territoryIds,
            occurredAt: event.occurredAt,
            signedContractReference: String(event.payload.signedContractReference),
            checksumSha256: String(event.payload.checksumSha256 ?? event.id),
          });
          return;
        }
        if (event.type === "identity.mandate.activated") {
          await getDocumentEventIngestionService().ingest({
            type: "actor_mandate_activated",
            entityId: event.entityId,
            organizationId: event.organizationId,
            actorId: event.actorId,
            territoryIds: event.territoryIds,
            occurredAt: event.occurredAt,
            mandateDecisionReference: String(event.payload.mandateDecisionReference),
            checksumSha256: String(event.payload.checksumSha256 ?? event.id),
          });
          return;
        }
        await getDocumentEventIngestionService().ingest({
          type: "crisis_recovery_recorded",
          entityId: event.entityId,
          organizationId: event.organizationId,
          actorId: event.actorId,
          territoryIds: event.territoryIds,
          occurredAt: event.occurredAt,
          recoveryReportReference: String(event.payload.recoveryReportReference),
          checksumSha256: String(event.payload.checksumSha256 ?? event.id),
        });
      },
    },
    {
      name: "coordination-work-projector",
      eventTypes: ["documents.requirement.missing", "coordination.notification.failed"],
      async handle(event) {
        const command = {
          type: "register_work" as const,
          workItem: {
            id: `work-${event.type}-${event.entityId}`,
            sourceCapability: event.type === "documents.requirement.missing" ? "documents" as const : "system" as const,
            workType: event.type,
            title: String(event.payload.title ?? "Action de coordination requise"),
            instructions: String(event.payload.instructions ?? "Traiter l'événement et documenter la résolution."),
            priority: (event.payload.priority === "critical" || event.payload.priority === "high" ? event.payload.priority : "normal") as "normal" | "high" | "critical",
            organizationId: String(event.payload.responsibleOrganizationId ?? event.organizationId),
            actorId: event.payload.responsibleActorId ? String(event.payload.responsibleActorId) : undefined,
            territoryId: event.territoryIds[0],
            relatedEntityType: event.entityType,
            relatedEntityId: event.entityId,
            dueAt: String(event.payload.dueAt ?? event.occurredAt),
            notificationChannels: ["in_app" as const],
            status: "open" as const,
            createdAt: event.occurredAt,
          },
        };
        const commandId = `project-${event.id}`;
        if (hasRuntimeDatabase()) {
          await getPersistentUnifiedWorkOrchestrationRuntime().execute({
            commandId,
            actorId: event.actorId,
            activeTerritoryId: event.territoryIds[0],
            command,
            occurredAt: event.occurredAt,
          });
        } else {
          getUnifiedWorkOrchestrationRuntime().execute({ commandId, command });
        }
      },
    },
    {
      name: "national-coordination-signal-projector",
      eventTypes: [
        "commerce.incident.reported",
        "finance.adjustment.approved",
        "contracts.obligation.breached",
        "governance.decision.recorded",
        "crisis.situation.reported",
        "documents.requirement.missing",
        "coordination.notification.failed",
      ],
      async handle(event) {
        if (hasRuntimeDatabase()) await getPersistentNationalCoordinationSignalService().project(event);
        else getNationalCoordinationSignalProjection().project(event);
      },
    },
  ];
}
