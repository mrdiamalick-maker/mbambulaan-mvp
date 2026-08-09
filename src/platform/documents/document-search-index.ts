import type { DecisionRecord, OperationalDocument } from "./operational-document-registry";

export interface DocumentSearchQuery {
  actorId?: string;
  organizationId?: string;
  territoryId?: string;
  relatedEntityType?: OperationalDocument["relatedEntityType"];
  relatedEntityId?: string;
  documentTypes?: OperationalDocument["documentType"][];
  statuses?: OperationalDocument["status"][];
  text?: string;
}

export class DocumentSearchIndex {
  search(input: { documents: OperationalDocument[]; decisions: DecisionRecord[]; query: DocumentSearchQuery }) {
    const normalizedText = input.query.text?.trim().toLocaleLowerCase("fr-FR");
    const documents = input.documents.filter((document) => {
      if (input.query.actorId && ![document.issuedByActorId, document.registeredByActorId].includes(input.query.actorId)) return false;
      if (input.query.organizationId && document.issuingOrganizationId !== input.query.organizationId) return false;
      if (input.query.territoryId && !document.territoryIds.includes("territory-national") && !document.territoryIds.includes(input.query.territoryId)) return false;
      if (input.query.relatedEntityType && document.relatedEntityType !== input.query.relatedEntityType) return false;
      if (input.query.relatedEntityId && document.relatedEntityId !== input.query.relatedEntityId) return false;
      if (input.query.documentTypes?.length && !input.query.documentTypes.includes(document.documentType)) return false;
      if (input.query.statuses?.length && !input.query.statuses.includes(document.status)) return false;
      if (normalizedText) {
        const haystack = [document.title, document.externalReference, document.relatedEntityId, document.documentType].filter(Boolean).join(" ").toLocaleLowerCase("fr-FR");
        if (!haystack.includes(normalizedText)) return false;
      }
      return true;
    });

    const documentIds = new Set(documents.map((document) => document.id));
    const decisions = input.decisions.filter((decision) =>
      decision.decisionDocumentIds.some((documentId) => documentIds.has(documentId))
      || (input.query.relatedEntityId && decision.subjectId === input.query.relatedEntityId),
    );

    return structuredClone({ documents, decisions, total: documents.length });
  }
}
