import type { DecisionRecord, OperationalDocument, OperationalDocumentType } from "./operational-document-registry";
import { DocumentAccessAndGovernance } from "./document-access-and-governance";

export interface RequiredDocumentRule {
  id: string;
  relatedEntityType: OperationalDocument["relatedEntityType"];
  relatedEntityId: string;
  requiredDocumentTypes: OperationalDocumentType[];
  responsibleOrganizationId: string;
  responsibleActorId?: string;
  territoryId: string;
  dueAt: string;
  reason: string;
}

export interface DocumentWorkItem {
  id: string;
  workType: "provide_document" | "verify_document" | "renew_document" | "review_decision_integrity";
  priority: "normal" | "high" | "critical";
  organizationId: string;
  actorId?: string;
  territoryId: string;
  relatedEntityType: OperationalDocument["relatedEntityType"] | "governance_decision";
  relatedEntityId: string;
  documentId?: string;
  requiredDocumentType?: OperationalDocumentType;
  dueAt: string;
  title: string;
  instructions: string;
  status: "open";
}

export class DocumentWorkQueueProjector {
  project(input: {
    documents: OperationalDocument[];
    decisions: DecisionRecord[];
    requiredDocumentRules: RequiredDocumentRule[];
    at: string;
  }): DocumentWorkItem[] {
    const workItems: DocumentWorkItem[] = [];
    const governance = new DocumentAccessAndGovernance().governanceView({
      documents: input.documents,
      decisions: input.decisions,
      at: input.at,
    });

    for (const rule of input.requiredDocumentRules) {
      for (const documentType of rule.requiredDocumentTypes) {
        const existing = input.documents.some((document) =>
          document.relatedEntityType === rule.relatedEntityType
          && document.relatedEntityId === rule.relatedEntityId
          && document.documentType === documentType
          && ["registered", "verified"].includes(document.status),
        );
        if (existing) continue;
        workItems.push({
          id: `document-missing-${rule.id}-${documentType}`,
          workType: "provide_document",
          priority: Date.parse(rule.dueAt) < Date.parse(input.at) ? "critical" : "high",
          organizationId: rule.responsibleOrganizationId,
          actorId: rule.responsibleActorId,
          territoryId: rule.territoryId,
          relatedEntityType: rule.relatedEntityType,
          relatedEntityId: rule.relatedEntityId,
          requiredDocumentType: documentType,
          dueAt: rule.dueAt,
          title: `Document requis : ${documentType}`,
          instructions: rule.reason,
          status: "open",
        });
      }
    }

    for (const document of governance.unverifiedDocuments) {
      workItems.push({
        id: `document-verify-${document.id}`,
        workType: "verify_document",
        priority: document.confidentiality === "confidential" ? "critical" : "high",
        organizationId: document.issuingOrganizationId,
        territoryId: document.territoryIds[0] ?? "territory-national",
        relatedEntityType: document.relatedEntityType,
        relatedEntityId: document.relatedEntityId,
        documentId: document.id,
        dueAt: new Date(Date.parse(document.registeredAt) + 3 * 86_400_000).toISOString(),
        title: `Vérifier ${document.title}`,
        instructions: "Confirmer l'émetteur, la référence et l'intégrité du document.",
        status: "open",
      });
    }

    for (const document of governance.expiringDocuments) {
      workItems.push({
        id: `document-renew-${document.id}`,
        workType: "renew_document",
        priority: Date.parse(document.validUntil!) - Date.parse(input.at) <= 7 * 86_400_000 ? "critical" : "high",
        organizationId: document.issuingOrganizationId,
        territoryId: document.territoryIds[0] ?? "territory-national",
        relatedEntityType: document.relatedEntityType,
        relatedEntityId: document.relatedEntityId,
        documentId: document.id,
        dueAt: document.validUntil!,
        title: `Renouveler ${document.title}`,
        instructions: "Obtenir et enregistrer le document renouvelé avant son expiration.",
        status: "open",
      });
    }

    for (const decision of governance.decisionsWithUnusableDocument) {
      workItems.push({
        id: `decision-integrity-${decision.id}`,
        workType: "review_decision_integrity",
        priority: "critical",
        organizationId: decision.organizationId,
        territoryId: decision.territoryIds[0] ?? "territory-national",
        relatedEntityType: "governance_decision",
        relatedEntityId: decision.id,
        dueAt: input.at,
        title: `Réexaminer la décision ${decision.id}`,
        instructions: "Un document support de cette décision est révoqué, expiré ou remplacé. Confirmer, remplacer ou retirer la décision.",
        status: "open",
      });
    }

    return workItems.sort((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt));
  }
}
