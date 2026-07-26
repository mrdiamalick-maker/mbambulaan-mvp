import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export type DocumentKind =
  | "identity"
  | "membership"
  | "vessel"
  | "landing"
  | "weighing"
  | "lot"
  | "service"
  | "commitment"
  | "incident"
  | "program"
  | "financing"
  | "insurance"
  | "public_decision"
  | "consent"
  | "other";

export type DocumentStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "verified"
  | "rejected"
  | "expired"
  | "revoked"
  | "archived";

export interface DocumentRecord {
  id: EntityId;
  kind: DocumentKind;
  title: string;
  status: DocumentStatus;
  ownerActorId: EntityId;
  ownerActorKind: MvpActorKind;
  organizationId?: EntityId;
  territoryId?: EntityId;
  subjectId?: EntityId;
  parentDocumentId?: EntityId;
  version: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
  checksum: string;
  storageKey: string;
  metadata: Record<string, unknown>;
  tags: string[];
  issuedAt?: ISODateTime;
  validFrom?: ISODateTime;
  validUntil?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  archivedAt?: ISODateTime;
}

export interface VerificationRule {
  code: string;
  documentKinds: DocumentKind[];
  requiredVerifierKinds: MvpActorKind[];
  minimumVerifications: number;
  expiryRequired: boolean;
  requiredMetadataKeys: string[];
  blocking: boolean;
}

export interface VerificationRecord {
  id: EntityId;
  documentId: EntityId;
  ruleCode: string;
  verifierActorId: EntityId;
  verifierActorKind: MvpActorKind;
  decision: "verified" | "rejected" | "needs_changes";
  reason?: string;
  verifiedAt: ISODateTime;
}

export interface ConsentGrant {
  id: EntityId;
  subjectActorId: EntityId;
  subjectActorKind: MvpActorKind;
  granteeActorId: EntityId;
  granteeActorKind: MvpActorKind;
  purposeCode: string;
  resourceScopes: string[];
  fieldScopes: string[];
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  status: "active" | "revoked" | "expired";
  grantedAt: ISODateTime;
  revokedAt?: ISODateTime;
  revocationReason?: string;
}

export interface SignatureRequest {
  id: EntityId;
  documentId: EntityId;
  requestedByActorId: EntityId;
  requestedByActorKind: MvpActorKind;
  signerActorId: EntityId;
  signerActorKind: MvpActorKind;
  purpose: string;
  status: "pending" | "signed" | "declined" | "expired";
  requestedAt: ISODateTime;
  expiresAt?: ISODateTime;
  signedAt?: ISODateTime;
  signatureHash?: string;
}

export interface EvidenceBundle {
  id: EntityId;
  code: string;
  title: string;
  subjectId: EntityId;
  territoryId?: EntityId;
  documentIds: EntityId[];
  requiredDocumentKinds: DocumentKind[];
  status: "incomplete" | "ready" | "verified" | "rejected" | "archived";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

const verificationRules: VerificationRule[] = [
  {
    code: "identity_verification",
    documentKinds: ["identity"],
    requiredVerifierKinds: ["cooperative", "public_agency"],
    minimumVerifications: 1,
    expiryRequired: true,
    requiredMetadataKeys: ["document_number", "holder_name"],
    blocking: true,
  },
  {
    code: "membership_verification",
    documentKinds: ["membership"],
    requiredVerifierKinds: ["cooperative"],
    minimumVerifications: 1,
    expiryRequired: false,
    requiredMetadataKeys: ["organization_id", "membership_status"],
    blocking: true,
  },
  {
    code: "vessel_document_verification",
    documentKinds: ["vessel"],
    requiredVerifierKinds: ["cooperative", "public_agency"],
    minimumVerifications: 1,
    expiryRequired: false,
    requiredMetadataKeys: ["vessel_id", "registration_reference"],
    blocking: true,
  },
  {
    code: "weighing_evidence_verification",
    documentKinds: ["weighing"],
    requiredVerifierKinds: ["landing_site", "cooperative"],
    minimumVerifications: 1,
    expiryRequired: false,
    requiredMetadataKeys: ["weighing_id", "net_weight", "species"],
    blocking: true,
  },
  {
    code: "service_evidence_verification",
    documentKinds: ["service"],
    requiredVerifierKinds: ["landing_site", "cooperative", "buyer"],
    minimumVerifications: 1,
    expiryRequired: false,
    requiredMetadataKeys: ["service_execution_id", "completed_at"],
    blocking: true,
  },
  {
    code: "financing_evidence_verification",
    documentKinds: ["financing", "identity", "membership", "commitment"],
    requiredVerifierKinds: ["financial_institution"],
    minimumVerifications: 1,
    expiryRequired: false,
    requiredMetadataKeys: [],
    blocking: true,
  },
  {
    code: "insurance_evidence_verification",
    documentKinds: ["insurance", "identity", "vessel", "incident"],
    requiredVerifierKinds: ["insurer"],
    minimumVerifications: 1,
    expiryRequired: false,
    requiredMetadataKeys: [],
    blocking: true,
  },
];

export class DocumentAndEvidenceEngine {
  private readonly documents = new Map<EntityId, DocumentRecord>();
  private readonly verifications: VerificationRecord[] = [];
  private readonly consents = new Map<EntityId, ConsentGrant>();
  private readonly signatures = new Map<EntityId, SignatureRequest>();
  private readonly bundles = new Map<EntityId, EvidenceBundle>();

  createDocument(input: Omit<DocumentRecord, "status" | "version" | "updatedAt"> & { status?: DocumentStatus }) {
    if (this.documents.has(input.id)) throw new Error(`Le document ${input.id} existe déjà.`);
    if (!input.checksum) throw new Error("Une empreinte de document est obligatoire.");
    if (input.sizeBytes <= 0) throw new Error("La taille du document doit être positive.");

    const record: DocumentRecord = {
      ...input,
      status: input.status ?? "draft",
      version: 1,
      updatedAt: input.createdAt,
    };
    this.documents.set(record.id, structuredClone(record));
    return structuredClone(record);
  }

  createNewVersion(input: {
    existingDocumentId: EntityId;
    newDocumentId: EntityId;
    filename: string;
    contentType: string;
    sizeBytes: number;
    checksum: string;
    storageKey: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
    createdAt: ISODateTime;
  }) {
    const existing = this.requireDocument(input.existingDocumentId);
    if (this.documents.has(input.newDocumentId)) throw new Error(`Le document ${input.newDocumentId} existe déjà.`);

    const next: DocumentRecord = {
      ...existing,
      id: input.newDocumentId,
      parentDocumentId: existing.id,
      version: existing.version + 1,
      filename: input.filename,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      checksum: input.checksum,
      storageKey: input.storageKey,
      metadata: { ...existing.metadata, ...(input.metadata ?? {}) },
      tags: [...new Set([...(existing.tags ?? []), ...(input.tags ?? [])])],
      status: "draft",
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      archivedAt: undefined,
    };
    existing.status = "archived";
    existing.archivedAt = input.createdAt;
    existing.updatedAt = input.createdAt;
    this.documents.set(existing.id, existing);
    this.documents.set(next.id, next);
    return structuredClone(next);
  }

  submitDocument(documentId: EntityId, at: ISODateTime) {
    const document = this.requireDocument(documentId);
    if (!["draft", "rejected"].includes(document.status)) {
      throw new Error(`Le document ${documentId} ne peut pas être soumis depuis ${document.status}.`);
    }
    document.status = "submitted";
    document.updatedAt = at;
    this.documents.set(document.id, document);
    return structuredClone(document);
  }

  recordVerification(input: VerificationRecord) {
    const document = this.requireDocument(input.documentId);
    const rule = this.requireRule(input.ruleCode);
    if (!rule.documentKinds.includes(document.kind)) {
      throw new Error(`La règle ${rule.code} ne s'applique pas au type ${document.kind}.`);
    }
    if (!rule.requiredVerifierKinds.includes(input.verifierActorKind)) {
      throw new Error("Ce type d'acteur ne peut pas vérifier ce document.");
    }

    const missingMetadata = rule.requiredMetadataKeys.filter(
      (key) => document.metadata[key] === undefined || document.metadata[key] === null || document.metadata[key] === "",
    );
    if (missingMetadata.length > 0) {
      throw new Error(`Métadonnées manquantes : ${missingMetadata.join(", ")}.`);
    }
    if (rule.expiryRequired && !document.validUntil) {
      throw new Error("Une date de fin de validité est obligatoire.");
    }

    const existingIndex = this.verifications.findIndex(
      (record) =>
        record.documentId === input.documentId &&
        record.ruleCode === input.ruleCode &&
        record.verifierActorId === input.verifierActorId,
    );
    if (existingIndex >= 0) this.verifications[existingIndex] = structuredClone(input);
    else this.verifications.push(structuredClone(input));

    document.status = input.decision === "verified" ? "under_review" : input.decision === "rejected" ? "rejected" : "draft";
    document.updatedAt = input.verifiedAt;
    this.recomputeDocumentStatus(document.id, input.verifiedAt);
    return this.getDocument(document.id);
  }

  grantConsent(input: ConsentGrant) {
    if (this.consents.has(input.id)) throw new Error(`Le consentement ${input.id} existe déjà.`);
    if (input.resourceScopes.length === 0) throw new Error("Un consentement doit couvrir au moins une ressource.");
    if (input.subjectActorId === input.granteeActorId) throw new Error("Le bénéficiaire du consentement doit être distinct du sujet.");
    this.consents.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  revokeConsent(input: { consentId: EntityId; revokedAt: ISODateTime; reason: string }) {
    const consent = this.requireConsent(input.consentId);
    consent.status = "revoked";
    consent.revokedAt = input.revokedAt;
    consent.revocationReason = input.reason;
    this.consents.set(consent.id, consent);
    return structuredClone(consent);
  }

  hasValidConsent(input: {
    subjectActorId: EntityId;
    granteeActorId: EntityId;
    purposeCode: string;
    resourceScope: string;
    fieldScope?: string;
    at: ISODateTime;
  }) {
    return [...this.consents.values()].some((consent) => {
      if (consent.status !== "active") return false;
      if (consent.subjectActorId !== input.subjectActorId) return false;
      if (consent.granteeActorId !== input.granteeActorId) return false;
      if (consent.purposeCode !== input.purposeCode) return false;
      if (!consent.resourceScopes.includes(input.resourceScope)) return false;
      if (input.fieldScope && consent.fieldScopes.length > 0 && !consent.fieldScopes.includes(input.fieldScope)) return false;
      if (consent.validFrom > input.at) return false;
      if (consent.validUntil && consent.validUntil < input.at) return false;
      return true;
    });
  }

  requestSignature(input: SignatureRequest) {
    if (this.signatures.has(input.id)) throw new Error(`La demande de signature ${input.id} existe déjà.`);
    this.requireDocument(input.documentId);
    this.signatures.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  signDocument(input: {
    signatureRequestId: EntityId;
    signerActorId: EntityId;
    signerActorKind: MvpActorKind;
    signatureHash: string;
    signedAt: ISODateTime;
  }) {
    const request = this.requireSignature(input.signatureRequestId);
    if (request.status !== "pending") throw new Error("Cette demande de signature n'est plus active.");
    if (request.signerActorId !== input.signerActorId || request.signerActorKind !== input.signerActorKind) {
      throw new Error("Le signataire ne correspond pas à la demande.");
    }
    if (request.expiresAt && request.expiresAt < input.signedAt) {
      request.status = "expired";
      this.signatures.set(request.id, request);
      throw new Error("La demande de signature a expiré.");
    }
    request.status = "signed";
    request.signatureHash = input.signatureHash;
    request.signedAt = input.signedAt;
    this.signatures.set(request.id, request);
    return structuredClone(request);
  }

  createEvidenceBundle(input: EvidenceBundle) {
    if (this.bundles.has(input.id)) throw new Error(`Le dossier de preuves ${input.id} existe déjà.`);
    for (const documentId of input.documentIds) this.requireDocument(documentId);
    const bundle = structuredClone(input);
    bundle.status = this.computeBundleStatus(bundle);
    this.bundles.set(bundle.id, bundle);
    return structuredClone(bundle);
  }

  addDocumentToBundle(input: { bundleId: EntityId; documentId: EntityId; at: ISODateTime }) {
    const bundle = this.requireBundle(input.bundleId);
    this.requireDocument(input.documentId);
    if (!bundle.documentIds.includes(input.documentId)) bundle.documentIds.push(input.documentId);
    bundle.updatedAt = input.at;
    bundle.status = this.computeBundleStatus(bundle);
    this.bundles.set(bundle.id, bundle);
    return structuredClone(bundle);
  }

  getDocument(documentId: EntityId) {
    return structuredClone(this.requireDocument(documentId));
  }

  listDocuments(filters?: {
    ownerActorId?: EntityId;
    kind?: DocumentKind;
    status?: DocumentStatus;
    subjectId?: EntityId;
  }) {
    return [...this.documents.values()]
      .filter((item) => !filters?.ownerActorId || item.ownerActorId === filters.ownerActorId)
      .filter((item) => !filters?.kind || item.kind === filters.kind)
      .filter((item) => !filters?.status || item.status === filters.status)
      .filter((item) => !filters?.subjectId || item.subjectId === filters.subjectId)
      .map((item) => structuredClone(item));
  }

  getBundle(bundleId: EntityId) {
    return structuredClone(this.requireBundle(bundleId));
  }

  snapshot() {
    return {
      rules: structuredClone(verificationRules),
      documents: this.listDocuments(),
      verifications: this.verifications.map((item) => structuredClone(item)),
      consents: [...this.consents.values()].map((item) => structuredClone(item)),
      signatures: [...this.signatures.values()].map((item) => structuredClone(item)),
      bundles: [...this.bundles.values()].map((item) => structuredClone(item)),
    };
  }

  private recomputeDocumentStatus(documentId: EntityId, at: ISODateTime) {
    const document = this.requireDocument(documentId);
    const applicableRules = verificationRules.filter((rule) => rule.documentKinds.includes(document.kind));
    if (document.validUntil && document.validUntil < at) {
      document.status = "expired";
      document.updatedAt = at;
      this.documents.set(document.id, document);
      return;
    }

    const hasBlockingRejection = applicableRules
      .filter((rule) => rule.blocking)
      .some((rule) =>
        this.verifications.some(
          (record) => record.documentId === document.id && record.ruleCode === rule.code && record.decision === "rejected",
        ),
      );
    if (hasBlockingRejection) {
      document.status = "rejected";
      document.updatedAt = at;
      this.documents.set(document.id, document);
      return;
    }

    const allBlockingSatisfied = applicableRules
      .filter((rule) => rule.blocking)
      .every((rule) => {
        const count = this.verifications.filter(
          (record) => record.documentId === document.id && record.ruleCode === rule.code && record.decision === "verified",
        ).length;
        return count >= rule.minimumVerifications;
      });

    document.status = allBlockingSatisfied ? "verified" : "under_review";
    document.updatedAt = at;
    this.documents.set(document.id, document);
  }

  private computeBundleStatus(bundle: EvidenceBundle): EvidenceBundle["status"] {
    const documents = bundle.documentIds.map((id) => this.requireDocument(id));
    const presentKinds = new Set(documents.map((item) => item.kind));
    const missingKind = bundle.requiredDocumentKinds.some((kind) => !presentKinds.has(kind));
    if (missingKind) return "incomplete";
    if (documents.some((item) => item.status === "rejected")) return "rejected";
    if (documents.every((item) => item.status === "verified")) return "verified";
    return "ready";
  }

  private requireDocument(id: EntityId) {
    const document = this.documents.get(id);
    if (!document) throw new Error(`Document introuvable : ${id}.`);
    return document;
  }

  private requireRule(code: string) {
    const rule = verificationRules.find((item) => item.code === code);
    if (!rule) throw new Error(`Règle de vérification introuvable : ${code}.`);
    return rule;
  }

  private requireConsent(id: EntityId) {
    const consent = this.consents.get(id);
    if (!consent) throw new Error(`Consentement introuvable : ${id}.`);
    return consent;
  }

  private requireSignature(id: EntityId) {
    const request = this.signatures.get(id);
    if (!request) throw new Error(`Demande de signature introuvable : ${id}.`);
    return request;
  }

  private requireBundle(id: EntityId) {
    const bundle = this.bundles.get(id);
    if (!bundle) throw new Error(`Dossier de preuves introuvable : ${id}.`);
    return bundle;
  }
}

export function getDocumentVerificationRules() {
  return structuredClone(verificationRules);
}

export function validateDocumentAndEvidenceCatalog() {
  const errors: string[] = [];
  for (const rule of verificationRules) {
    if (rule.documentKinds.length === 0) errors.push(`${rule.code}: aucun type de document couvert.`);
    if (rule.requiredVerifierKinds.length === 0) errors.push(`${rule.code}: aucun type de vérificateur.`);
    if (rule.minimumVerifications < 1) errors.push(`${rule.code}: minimum de vérifications invalide.`);
  }
  return {
    valid: errors.length === 0,
    errors,
    summary: {
      ruleCount: verificationRules.length,
      coveredKinds: [...new Set(verificationRules.flatMap((item) => item.documentKinds))],
      verifierKinds: [...new Set(verificationRules.flatMap((item) => item.requiredVerifierKinds))],
    },
  };
}
