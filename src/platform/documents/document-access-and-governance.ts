import type { DecisionRecord, OperationalDocument } from "./operational-document-registry";

export interface DocumentAccessContext {
  actorId: string;
  organizationId: string;
  territoryIds: string[];
  permissions: string[];
}

export class DocumentAccessAndGovernance {
  canRead(document: OperationalDocument, context: DocumentAccessContext) {
    const territoryAllowed = document.territoryIds.includes("territory-national")
      || context.territoryIds.includes("territory-national")
      || document.territoryIds.some((territoryId) => context.territoryIds.includes(territoryId));
    if (!territoryAllowed) return { allowed: false as const, reason: "territory_denied" };
    if (document.confidentiality === "public") return { allowed: true as const, reason: "public" };
    if (document.confidentiality === "ecosystem") {
      return context.permissions.some((permission) => permission.endsWith(".read") || permission === "admin.manage")
        ? { allowed: true as const, reason: "ecosystem_member" }
        : { allowed: false as const, reason: "permission_missing" };
    }
    if (document.confidentiality === "restricted") {
      const relatedOrganization = document.issuingOrganizationId === context.organizationId;
      const privileged = context.permissions.includes("government.read") || context.permissions.includes("finance.read") || context.permissions.includes("admin.manage");
      return relatedOrganization || privileged
        ? { allowed: true as const, reason: relatedOrganization ? "issuing_organization" : "privileged_role" }
        : { allowed: false as const, reason: "restricted_document" };
    }
    const confidentialAllowed = context.permissions.includes("admin.manage")
      || (context.permissions.includes("government.write") && document.issuingOrganizationId === context.organizationId);
    return confidentialAllowed
      ? { allowed: true as const, reason: "confidential_authority" }
      : { allowed: false as const, reason: "confidential_document" };
  }

  governanceView(input: { documents: OperationalDocument[]; decisions: DecisionRecord[]; at: string }) {
    const now = Date.parse(input.at);
    const inThirtyDays = now + 30 * 86_400_000;
    const activeDocuments = input.documents.filter((item) => ["registered", "verified"].includes(item.status));
    const expiringDocuments = activeDocuments
      .filter((item) => item.validUntil)
      .filter((item) => Date.parse(item.validUntil!) >= now && Date.parse(item.validUntil!) <= inThirtyDays);
    const unverifiedDocuments = input.documents.filter((item) => item.status === "registered");
    const unusableDocuments = input.documents.filter((item) => ["revoked", "expired", "superseded"].includes(item.status));
    const decisionsWithUnusableDocument = input.decisions.filter((decision) =>
      decision.status === "effective"
      && decision.decisionDocumentIds.some((documentId) => unusableDocuments.some((document) => document.id === documentId))
    );
    return {
      expiringDocuments,
      unverifiedDocuments,
      unusableDocuments,
      decisionsWithUnusableDocument,
      metrics: {
        expiringDocumentCount: expiringDocuments.length,
        unverifiedDocumentCount: unverifiedDocuments.length,
        unusableDocumentCount: unusableDocuments.length,
        decisionIntegrityAlertCount: decisionsWithUnusableDocument.length,
      },
    };
  }
}
