import type { EntityId } from "../../domain/infrastructures/types";
import type { SqlExecutor } from "../persistence/postgres-platform-adapters";
import type { DocumentAccessReceipt, DocumentRepository, DocumentSubject, EvidenceDocument } from "./national-evidence-vault";

export class PostgresDocumentRepository implements DocumentRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async get(documentId: EntityId): Promise<EvidenceDocument | undefined> {
    const result = await this.executor().query<any>(
      `SELECT d.*, COALESCE(jsonb_agg(jsonb_build_object('subjectType', s.subject_type, 'subjectId', s.subject_id)) FILTER (WHERE s.document_id IS NOT NULL), '[]'::jsonb) subjects
       FROM mbambulaan.evidence_documents d
       LEFT JOIN mbambulaan.evidence_document_subjects s ON s.document_id = d.id
       WHERE d.id = $1
       GROUP BY d.id`,
      [documentId],
    );
    return result.rows[0] ? this.map(result.rows[0]) : undefined;
  }

  async listVersions(logicalDocumentId: EntityId): Promise<EvidenceDocument[]> {
    const result = await this.executor().query<any>(
      `SELECT d.*, COALESCE(jsonb_agg(jsonb_build_object('subjectType', s.subject_type, 'subjectId', s.subject_id)) FILTER (WHERE s.document_id IS NOT NULL), '[]'::jsonb) subjects
       FROM mbambulaan.evidence_documents d
       LEFT JOIN mbambulaan.evidence_document_subjects s ON s.document_id = d.id
       WHERE d.logical_document_id = $1
       GROUP BY d.id
       ORDER BY d.version`,
      [logicalDocumentId],
    );
    return result.rows.map((row) => this.map(row));
  }

  async save(document: EvidenceDocument): Promise<void> {
    await this.executor().query(
      `INSERT INTO mbambulaan.evidence_documents
       (id, logical_document_id, version, file_name, media_type, size_bytes, sha256, storage_bucket, storage_key,
        classification, status, malware_status, territory_ids, organization_id, uploaded_by_identity_id, uploaded_at,
        retention_until, legal_hold, supersedes_document_id, metadata, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,now())
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         malware_status = EXCLUDED.malware_status,
         retention_until = EXCLUDED.retention_until,
         legal_hold = EXCLUDED.legal_hold,
         metadata = EXCLUDED.metadata,
         updated_at = now()`,
      [document.id, document.logicalDocumentId, document.version, document.fileName, document.mediaType, document.sizeBytes,
       document.sha256, document.storageBucket, document.storageKey, document.classification, document.status,
       document.malwareStatus, document.territoryIds, document.organizationId ?? null, document.uploadedByIdentityId,
       document.uploadedAt, document.retentionUntil ?? null, document.legalHold, document.supersedesDocumentId ?? null,
       JSON.stringify(document.metadata)],
    );
    await this.executor().query(`DELETE FROM mbambulaan.evidence_document_subjects WHERE document_id = $1`, [document.id]);
    for (const subject of document.subjects) {
      await this.executor().query(
        `INSERT INTO mbambulaan.evidence_document_subjects(document_id, subject_type, subject_id) VALUES ($1,$2,$3)`,
        [document.id, subject.subjectType, subject.subjectId],
      );
    }
  }

  async appendReceipt(receipt: DocumentAccessReceipt): Promise<void> {
    await this.executor().query(
      `INSERT INTO mbambulaan.evidence_access_receipts(id, document_id, identity_id, action, purpose, correlation_id, occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [receipt.id, receipt.documentId, receipt.identityId, receipt.action, receipt.purpose, receipt.correlationId ?? null, receipt.occurredAt],
    );
  }

  private map(row: any): EvidenceDocument {
    return {
      id: row.id,
      logicalDocumentId: row.logical_document_id,
      version: Number(row.version),
      fileName: row.file_name,
      mediaType: row.media_type,
      sizeBytes: Number(row.size_bytes),
      sha256: row.sha256,
      storageBucket: row.storage_bucket,
      storageKey: row.storage_key,
      classification: row.classification,
      status: row.status,
      malwareStatus: row.malware_status,
      territoryIds: row.territory_ids ?? [],
      organizationId: row.organization_id ?? undefined,
      subjects: (row.subjects ?? []) as DocumentSubject[],
      uploadedByIdentityId: row.uploaded_by_identity_id,
      uploadedAt: row.uploaded_at,
      retentionUntil: row.retention_until ?? undefined,
      legalHold: row.legal_hold,
      supersedesDocumentId: row.supersedes_document_id ?? undefined,
      metadata: row.metadata ?? {},
    };
  }
}
