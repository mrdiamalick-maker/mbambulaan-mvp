export type OperationalDocumentType =
  | "signed_contract"
  | "mandate_decision"
  | "delegation_letter"
  | "delivery_note"
  | "destination_confirmation"
  | "transfer_reference"
  | "bank_statement"
  | "inspection_report"
  | "meeting_minutes"
  | "recovery_report"
  | "incident_record"
  | "corrective_action_plan"
  | "institutional_decision"
  | "regulatory_reference"
  | "other";

export interface OperationalDocument {
  id: string;
  documentType: OperationalDocumentType;
  title: string;
  issuingOrganizationId: string;
  issuedByActorId: string;
  territoryIds: string[];
  relatedEntityType: "actor" | "contract" | "obligation" | "commercial_order" | "payment" | "crisis" | "incident" | "governance_decision" | "other";
  relatedEntityId: string;
  externalReference?: string;
  storageReference: string;
  checksumSha256: string;
  issuedAt: string;
  validFrom?: string;
  validUntil?: string;
  confidentiality: "public" | "ecosystem" | "restricted" | "confidential";
  status: "registered" | "verified" | "superseded" | "revoked" | "expired";
  supersedesDocumentId?: string;
  registeredAt: string;
  registeredByActorId: string;
}

export interface DocumentVerification {
  id: string;
  documentId: string;
  verifiedByActorId: string;
  verificationMethod: "issuer_confirmation" | "registry_lookup" | "counterparty_confirmation" | "field_check" | "technical_integrity";
  verificationDocumentIds: string[];
  conclusion: "valid" | "invalid" | "inconclusive";
  comment: string;
  verifiedAt: string;
}

export interface DecisionRecord {
  id: string;
  decisionType: "approve" | "reject" | "activate" | "suspend" | "restrict" | "renew" | "waive" | "close" | "escalate";
  subjectType: "actor" | "contract" | "obligation" | "payment" | "commercial_order" | "crisis" | "incident" | "other";
  subjectId: string;
  decidedByActorIds: string[];
  organizationId: string;
  territoryIds: string[];
  reason: string;
  decisionDocumentIds: string[];
  effectiveAt: string;
  expiresAt?: string;
  status: "effective" | "expired" | "superseded" | "revoked";
  recordedAt: string;
}

export type OperationalDocumentCommand =
  | { type: "register_document"; document: OperationalDocument }
  | { type: "verify_document"; verification: DocumentVerification }
  | { type: "supersede_document"; documentId: string; replacementDocumentId: string }
  | { type: "revoke_document"; documentId: string; reason: string; decisionDocumentId: string }
  | { type: "record_decision"; decision: DecisionRecord };

export class OperationalDocumentRegistry {
  private readonly documents: OperationalDocument[] = [];
  private readonly verifications: DocumentVerification[] = [];
  private readonly decisions: DecisionRecord[] = [];
  private readonly processed = new Map<string, unknown>();

  execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: OperationalDocumentCommand }) {
    const previous = this.processed.get(input.commandId);
    if (previous) return structuredClone(previous);
    const command = input.command;
    let result: unknown;

    if (command.type === "register_document") {
      const document = command.document;
      this.ensureUnique(document.id, this.documents, "document");
      if (!document.title.trim() || !document.storageReference.trim()) throw new Error("Le titre et la référence de stockage sont obligatoires.");
      if (!/^[a-f0-9]{64}$/i.test(document.checksumSha256)) throw new Error("L'empreinte SHA-256 du document est invalide.");
      if (!document.territoryIds.length) throw new Error("Le document doit être rattaché à au moins un territoire.");
      if (input.activeTerritoryId !== "territory-national" && !document.territoryIds.every((territoryId) => territoryId === input.activeTerritoryId)) throw new Error("Le territoire actif ne permet pas d'enregistrer ce document.");
      if (document.validUntil && document.validFrom && document.validUntil <= document.validFrom) throw new Error("La période de validité du document est invalide.");
      this.documents.push(structuredClone(document));
      result = document;
    } else if (command.type === "verify_document") {
      const verification = command.verification;
      this.ensureUnique(verification.id, this.verifications, "vérification");
      const document = this.requireDocument(verification.documentId);
      if (!verification.comment.trim()) throw new Error("Le commentaire de vérification est obligatoire.");
      if (verification.verificationMethod !== "technical_integrity" && !verification.verificationDocumentIds.length) throw new Error("La vérification doit être appuyée par un document de confirmation.");
      this.verifications.push(structuredClone(verification));
      if (verification.conclusion === "valid") document.status = "verified";
      if (verification.conclusion === "invalid") document.status = "revoked";
      result = verification;
    } else if (command.type === "supersede_document") {
      const document = this.requireDocument(command.documentId);
      const replacement = this.requireDocument(command.replacementDocumentId);
      if (replacement.id === document.id) throw new Error("Un document ne peut pas se remplacer lui-même.");
      if (replacement.relatedEntityId !== document.relatedEntityId || replacement.relatedEntityType !== document.relatedEntityType) throw new Error("Le document de remplacement doit concerner le même objet métier.");
      document.status = "superseded";
      replacement.supersedesDocumentId = document.id;
      result = replacement;
    } else if (command.type === "revoke_document") {
      const document = this.requireDocument(command.documentId);
      if (!command.reason.trim() || !command.decisionDocumentId.trim()) throw new Error("La révocation doit être motivée et reliée à une décision signée.");
      document.status = "revoked";
      result = document;
    } else {
      const decision = command.decision;
      this.ensureUnique(decision.id, this.decisions, "décision");
      if (!decision.reason.trim() || !decision.decisionDocumentIds.length) throw new Error("La décision doit être motivée et appuyée par un document signé.");
      for (const documentId of decision.decisionDocumentIds) {
        const document = this.requireDocument(documentId);
        if (!["registered", "verified"].includes(document.status)) throw new Error(`Le document de décision ${documentId} n'est pas utilisable.`);
      }
      if (!decision.decidedByActorIds.length) throw new Error("Au moins un décideur doit être identifié.");
      if (decision.expiresAt && decision.expiresAt <= decision.effectiveAt) throw new Error("La période d'effet de la décision est invalide.");
      this.decisions.push(structuredClone(decision));
      result = decision;
    }

    const response = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processed.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot(at = new Date().toISOString()) {
    for (const document of this.documents) {
      if (document.validUntil && document.validUntil < at && ["registered", "verified"].includes(document.status)) document.status = "expired";
    }
    for (const decision of this.decisions) {
      if (decision.expiresAt && decision.expiresAt < at && decision.status === "effective") decision.status = "expired";
    }
    return structuredClone({
      documents: this.documents,
      verifications: this.verifications,
      decisions: this.decisions,
      metrics: {
        registeredDocumentCount: this.documents.length,
        verifiedDocumentCount: this.documents.filter((item) => item.status === "verified").length,
        revokedDocumentCount: this.documents.filter((item) => item.status === "revoked").length,
        expiringDocumentCount: this.documents.filter((item) => item.validUntil && Date.parse(item.validUntil) >= Date.parse(at) && Date.parse(item.validUntil) <= Date.parse(at) + 30 * 86_400_000).length,
        effectiveDecisionCount: this.decisions.filter((item) => item.status === "effective").length,
      },
    });
  }

  private ensureUnique<T extends { id: string }>(id: string, items: T[], label: string) {
    if (items.some((item) => item.id === id)) throw new Error(`${label} déjà existant : ${id}.`);
  }

  private requireDocument(id: string) {
    const document = this.documents.find((item) => item.id === id);
    if (!document) throw new Error(`Document introuvable : ${id}.`);
    return document;
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbOperationalDocumentRegistry?: OperationalDocumentRegistry };
export function getOperationalDocumentRegistry() {
  globalRuntime.__mbOperationalDocumentRegistry ??= new OperationalDocumentRegistry();
  return globalRuntime.__mbOperationalDocumentRegistry;
}
