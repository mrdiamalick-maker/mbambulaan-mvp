import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";

export type DocumentStatus = "upload_pending" | "quarantined" | "available" | "rejected" | "archived" | "deleted";
export type MalwareStatus = "pending" | "clean" | "infected" | "error";
export type EvidenceClassification = "public" | "internal" | "confidential" | "restricted";

export interface DocumentSubject {
  subjectType: "actor" | "organization" | "vessel" | "campaign" | "landing" | "lot" | "order" | "delivery" | "payment" | "contract" | "incident" | "program" | "audit";
  subjectId: EntityId;
}

export interface EvidenceDocument {
  id: EntityId;
  logicalDocumentId: EntityId;
  version: number;
  fileName: string;
  mediaType: string;
  sizeBytes: number;
  sha256: string;
  storageBucket: string;
  storageKey: string;
  classification: EvidenceClassification;
  status: DocumentStatus;
  malwareStatus: MalwareStatus;
  territoryIds: EntityId[];
  organizationId?: EntityId;
  subjects: DocumentSubject[];
  uploadedByIdentityId: EntityId;
  uploadedAt: ISODateTime;
  retentionUntil?: ISODateTime;
  legalHold: boolean;
  supersedesDocumentId?: EntityId;
  metadata: Record<string, string>;
}

export interface DocumentAccessGrant {
  identityId: EntityId;
  permissionCodes: string[];
  territoryIds: EntityId[];
  organizationId?: EntityId;
  strongAuthentication: boolean;
}

export interface DocumentAccessReceipt {
  id: EntityId;
  documentId: EntityId;
  identityId: EntityId;
  action: "view" | "download" | "share" | "archive" | "delete" | "validate";
  purpose: string;
  correlationId?: EntityId;
  occurredAt: ISODateTime;
}

export interface UploadIntent {
  documentId: EntityId;
  uploadUrl: string;
  expiresAt: ISODateTime;
  requiredHeaders: Record<string, string>;
}

export interface DownloadIntent {
  documentId: EntityId;
  downloadUrl: string;
  expiresAt: ISODateTime;
}

export interface ObjectStorage {
  createUploadUrl(input: { bucket: string; key: string; mediaType: string; sizeBytes: number; sha256: string; expiresInSeconds: number }): Promise<string>;
  createDownloadUrl(input: { bucket: string; key: string; expiresInSeconds: number }): Promise<string>;
  exists(input: { bucket: string; key: string }): Promise<boolean>;
  delete(input: { bucket: string; key: string }): Promise<void>;
}

export interface MalwareScanner { scan(input: { bucket: string; key: string; sha256: string }): Promise<"clean" | "infected">; }
export interface DocumentRepository {
  get(documentId: EntityId): Promise<EvidenceDocument | undefined>;
  listVersions(logicalDocumentId: EntityId): Promise<EvidenceDocument[]>;
  save(document: EvidenceDocument): Promise<void>;
  appendReceipt(receipt: DocumentAccessReceipt): Promise<void>;
}
export interface VaultClock { now(): ISODateTime; }
export interface VaultIds { next(prefix: string): EntityId; }

export class NationalEvidenceVault {
  constructor(
    private readonly repository: DocumentRepository,
    private readonly storage: ObjectStorage,
    private readonly scanner: MalwareScanner,
    private readonly clock: VaultClock,
    private readonly ids: VaultIds,
  ) {}

  async prepareUpload(input: {
    logicalDocumentId?: EntityId;
    fileName: string;
    mediaType: string;
    sizeBytes: number;
    sha256: string;
    classification: EvidenceClassification;
    territoryIds: EntityId[];
    organizationId?: EntityId;
    subjects: DocumentSubject[];
    uploadedByIdentityId: EntityId;
    retentionUntil?: ISODateTime;
    metadata?: Record<string, string>;
  }): Promise<UploadIntent> {
    this.validateUpload(input);
    const logicalDocumentId = input.logicalDocumentId ?? this.ids.next("logical-document");
    const versions = await this.repository.listVersions(logicalDocumentId);
    const previous = versions.sort((a, b) => b.version - a.version)[0];
    const documentId = this.ids.next("document");
    const storageKey = `${input.territoryIds[0] ?? "national"}/${logicalDocumentId}/v${(previous?.version ?? 0) + 1}/${documentId}`;
    const document: EvidenceDocument = {
      id: documentId,
      logicalDocumentId,
      version: (previous?.version ?? 0) + 1,
      fileName: input.fileName,
      mediaType: input.mediaType,
      sizeBytes: input.sizeBytes,
      sha256: input.sha256.toLowerCase(),
      storageBucket: "mbambulaan-evidence",
      storageKey,
      classification: input.classification,
      status: "upload_pending",
      malwareStatus: "pending",
      territoryIds: [...new Set(input.territoryIds)],
      organizationId: input.organizationId,
      subjects: structuredClone(input.subjects),
      uploadedByIdentityId: input.uploadedByIdentityId,
      uploadedAt: this.clock.now(),
      retentionUntil: input.retentionUntil,
      legalHold: false,
      supersedesDocumentId: previous?.id,
      metadata: structuredClone(input.metadata ?? {}),
    };
    await this.repository.save(document);
    const uploadUrl = await this.storage.createUploadUrl({
      bucket: document.storageBucket,
      key: document.storageKey,
      mediaType: document.mediaType,
      sizeBytes: document.sizeBytes,
      sha256: document.sha256,
      expiresInSeconds: 900,
    });
    return {
      documentId,
      uploadUrl,
      expiresAt: new Date(Date.parse(this.clock.now()) + 900_000).toISOString() as ISODateTime,
      requiredHeaders: { "content-type": document.mediaType, "x-content-sha256": document.sha256 },
    };
  }

  async finalizeUpload(documentId: EntityId) {
    const document = await this.requireDocument(documentId);
    if (document.status !== "upload_pending") throw new Error("Le document n'attend pas de téléversement.");
    if (!(await this.storage.exists({ bucket: document.storageBucket, key: document.storageKey }))) throw new Error("Le fichier téléversé est introuvable.");
    document.status = "quarantined";
    await this.repository.save(document);
    try {
      const result = await this.scanner.scan({ bucket: document.storageBucket, key: document.storageKey, sha256: document.sha256 });
      document.malwareStatus = result;
      document.status = result === "clean" ? "available" : "rejected";
      await this.repository.save(document);
      return structuredClone(document);
    } catch (error) {
      document.malwareStatus = "error";
      document.status = "quarantined";
      await this.repository.save(document);
      throw error;
    }
  }

  async createDownload(input: { documentId: EntityId; access: DocumentAccessGrant; purpose: string; correlationId?: EntityId }): Promise<DownloadIntent> {
    const document = await this.requireDocument(input.documentId);
    this.assertAccess(document, input.access, "documents.read");
    if (document.status !== "available" || document.malwareStatus !== "clean") throw new Error("Le document n'est pas disponible au téléchargement.");
    const expiresInSeconds = document.classification === "restricted" ? 120 : 600;
    const downloadUrl = await this.storage.createDownloadUrl({ bucket: document.storageBucket, key: document.storageKey, expiresInSeconds });
    await this.receipt(document.id, input.access.identityId, "download", input.purpose, input.correlationId);
    return { documentId: document.id, downloadUrl, expiresAt: new Date(Date.parse(this.clock.now()) + expiresInSeconds * 1000).toISOString() as ISODateTime };
  }

  async archive(input: { documentId: EntityId; access: DocumentAccessGrant; purpose: string }) {
    const document = await this.requireDocument(input.documentId);
    this.assertAccess(document, input.access, "documents.archive");
    document.status = "archived";
    await this.repository.save(document);
    await this.receipt(document.id, input.access.identityId, "archive", input.purpose);
    return structuredClone(document);
  }

  async delete(input: { documentId: EntityId; access: DocumentAccessGrant; purpose: string }) {
    const document = await this.requireDocument(input.documentId);
    this.assertAccess(document, input.access, "documents.delete");
    if (document.legalHold) throw new Error("Le document est sous conservation légale.");
    if (document.retentionUntil && Date.parse(document.retentionUntil) > Date.parse(this.clock.now())) throw new Error("La durée de conservation n'est pas échue.");
    await this.storage.delete({ bucket: document.storageBucket, key: document.storageKey });
    document.status = "deleted";
    await this.repository.save(document);
    await this.receipt(document.id, input.access.identityId, "delete", input.purpose);
    return structuredClone(document);
  }

  private validateUpload(input: { fileName: string; mediaType: string; sizeBytes: number; sha256: string; subjects: DocumentSubject[] }) {
    if (!input.fileName.trim()) throw new Error("Le nom de fichier est obligatoire.");
    if (!/^[a-f0-9]{64}$/i.test(input.sha256)) throw new Error("Le hash SHA-256 est invalide.");
    if (input.sizeBytes <= 0 || input.sizeBytes > 100 * 1024 * 1024) throw new Error("La taille doit être comprise entre 1 octet et 100 Mo.");
    if (!input.subjects.length) throw new Error("Le document doit être rattaché à au moins un objet métier.");
    const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);
    if (!allowed.has(input.mediaType)) throw new Error("Le type de fichier n'est pas autorisé.");
  }

  private assertAccess(document: EvidenceDocument, access: DocumentAccessGrant, permission: string) {
    if (!access.permissionCodes.includes(permission)) throw new Error(`La permission ${permission} est requise.`);
    if (document.classification === "restricted" && !access.strongAuthentication) throw new Error("Une authentification forte est requise.");
    if (document.organizationId && access.organizationId && document.organizationId !== access.organizationId) throw new Error("Le document appartient à une autre organisation.");
    if (document.territoryIds.length && document.territoryIds.some((id) => !access.territoryIds.includes(id))) throw new Error("Le document est hors du périmètre territorial.");
  }

  private async requireDocument(id: EntityId) {
    const document = await this.repository.get(id);
    if (!document) throw new Error("Document introuvable.");
    return document;
  }

  private async receipt(documentId: EntityId, identityId: EntityId, action: DocumentAccessReceipt["action"], purpose: string, correlationId?: EntityId) {
    if (!purpose.trim()) throw new Error("Le motif d'accès est obligatoire.");
    await this.repository.appendReceipt({ id: this.ids.next("document-receipt"), documentId, identityId, action, purpose, correlationId, occurredAt: this.clock.now() });
  }
}

export class InMemoryDocumentRepository implements DocumentRepository {
  readonly documents = new Map<EntityId, EvidenceDocument>();
  readonly receipts: DocumentAccessReceipt[] = [];
  async get(documentId: EntityId) { const item = this.documents.get(documentId); return item ? structuredClone(item) : undefined; }
  async listVersions(logicalDocumentId: EntityId) { return structuredClone([...this.documents.values()].filter((item) => item.logicalDocumentId === logicalDocumentId)); }
  async save(document: EvidenceDocument) { this.documents.set(document.id, structuredClone(document)); }
  async appendReceipt(receipt: DocumentAccessReceipt) { this.receipts.push(structuredClone(receipt)); }
}
