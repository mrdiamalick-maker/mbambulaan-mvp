import type { OperationalContractCommand, OperationalObligation } from "./operational-contract-runtime";

export type ContractBusinessEvent =
  | { type: "commercial_delivery_confirmed"; eventId: string; obligationId: string; actorId: string; deliveredQuantityKg: number; deliveryNoteDocumentIds: string[]; confirmedAt: string }
  | { type: "payment_transfer_confirmed"; eventId: string; obligationId: string; actorId: string; amountXof: number; transferReferenceDocumentIds: string[]; confirmedAt: string }
  | { type: "crisis_response_completed"; eventId: string; obligationId: string; actorId: string; restoredCapacity: number; recoveryReportDocumentIds: string[]; completedAt: string }
  | { type: "regulatory_report_submitted"; eventId: string; obligationId: string; actorId: string; reportDocumentIds: string[]; submittedAt: string };

export class ContractBusinessEventProjector {
  project(input: { event: ContractBusinessEvent; obligation: OperationalObligation }): { commandId: string; command: OperationalContractCommand } {
    const event = input.event;
    if (event.obligationId !== input.obligation.id) throw new Error("L'événement métier ne correspond pas à l'obligation contractuelle.");
    if (event.type === "commercial_delivery_confirmed") {
      if (!event.deliveryNoteDocumentIds.length) throw new Error("Le bon de livraison ou la confirmation du site destinataire est obligatoire.");
      return this.execution(event.eventId, input.obligation.id, event.actorId, event.deliveredQuantityKg, event.deliveryNoteDocumentIds, "Livraison commerciale confirmée.", event.confirmedAt);
    }
    if (event.type === "payment_transfer_confirmed") {
      if (!event.transferReferenceDocumentIds.length) throw new Error("La référence de virement ou le relevé de paiement est obligatoire.");
      return this.execution(event.eventId, input.obligation.id, event.actorId, event.amountXof, event.transferReferenceDocumentIds, "Paiement contractuel confirmé.", event.confirmedAt);
    }
    if (event.type === "crisis_response_completed") {
      if (!event.recoveryReportDocumentIds.length) throw new Error("Le compte rendu de reprise ou le constat de capacité restaurée est obligatoire.");
      return this.execution(event.eventId, input.obligation.id, event.actorId, event.restoredCapacity, event.recoveryReportDocumentIds, "Engagement de reprise après crise exécuté.", event.completedAt);
    }
    if (!event.reportDocumentIds.length) throw new Error("Le rapport réglementaire signé est obligatoire.");
    return this.execution(event.eventId, input.obligation.id, event.actorId, undefined, event.reportDocumentIds, "Rapport réglementaire transmis.", event.submittedAt);
  }

  private execution(eventId: string, obligationId: string, actorId: string, measuredValue: number | undefined, documentIds: string[], comment: string, recordedAt: string) {
    return {
      commandId: `contract-event-${eventId}`,
      command: {
        type: "record_execution" as const,
        record: {
          id: `execution-${eventId}`,
          obligationId,
          recordedByActorId: actorId,
          measuredValue,
          completionDocumentIds: [...documentIds],
          comment,
          recordedAt,
          outcome: "fulfilled" as const,
        },
      },
    };
  }
}
