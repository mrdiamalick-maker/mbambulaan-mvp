import type { OperationalDocument, OperationalDocumentType } from "./operational-document-registry";

export type DocumentSourceEvent =
  | { type: "commercial_delivery_confirmed"; entityId: string; organizationId: string; actorId: string; territoryIds: string[]; occurredAt: string; deliveryNoteReference?: string; destinationConfirmationReference?: string; checksumSha256: string }
  | { type: "finance_transfer_confirmed"; entityId: string; organizationId: string; actorId: string; territoryIds: string[]; occurredAt: string; transferReference: string; checksumSha256: string }
  | { type: "crisis_recovery_recorded"; entityId: string; organizationId: string; actorId: string; territoryIds: string[]; occurredAt: string; recoveryReportReference: string; checksumSha256: string }
  | { type: "contract_signed"; entityId: string; organizationId: string; actorId: string; territoryIds: string[]; occurredAt: string; signedContractReference: string; checksumSha256: string }
  | { type: "actor_mandate_activated"; entityId: string; organizationId: string; actorId: string; territoryIds: string[]; occurredAt: string; mandateDecisionReference: string; checksumSha256: string };

export class OperationalDocumentProjector {
  project(event: DocumentSourceEvent): OperationalDocument[] {
    switch (event.type) {
      case "commercial_delivery_confirmed": {
        const documents: OperationalDocument[] = [];
        if (event.deliveryNoteReference) documents.push(this.document(event, "delivery_note", "commercial_order", event.deliveryNoteReference, "Bon de livraison"));
        if (event.destinationConfirmationReference) documents.push(this.document(event, "destination_confirmation", "commercial_order", event.destinationConfirmationReference, "Confirmation du site destinataire"));
        return documents;
      }
      case "finance_transfer_confirmed":
        return [this.document(event, "transfer_reference", "payment", event.transferReference, "Référence de virement")];
      case "crisis_recovery_recorded":
        return [this.document(event, "recovery_report", "crisis", event.recoveryReportReference, "Compte rendu de reprise")];
      case "contract_signed":
        return [this.document(event, "signed_contract", "contract", event.signedContractReference, "Contrat signé")];
      case "actor_mandate_activated":
        return [this.document(event, "mandate_decision", "actor", event.mandateDecisionReference, "Décision de mandat")];
    }
  }

  private document(
    event: DocumentSourceEvent,
    documentType: OperationalDocumentType,
    relatedEntityType: OperationalDocument["relatedEntityType"],
    storageReference: string,
    title: string,
  ): OperationalDocument {
    return {
      id: `${documentType}-${event.entityId}-${event.occurredAt}`,
      documentType,
      title,
      issuingOrganizationId: event.organizationId,
      issuedByActorId: event.actorId,
      territoryIds: [...event.territoryIds],
      relatedEntityType,
      relatedEntityId: event.entityId,
      externalReference: storageReference,
      storageReference,
      checksumSha256: event.checksumSha256,
      issuedAt: event.occurredAt,
      confidentiality: documentType === "transfer_reference" ? "restricted" : "ecosystem",
      status: "registered",
      registeredAt: event.occurredAt,
      registeredByActorId: event.actorId,
    };
  }
}
