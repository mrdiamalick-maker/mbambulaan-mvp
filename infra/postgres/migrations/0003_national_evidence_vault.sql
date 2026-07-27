BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.evidence_documents (
  id text PRIMARY KEY,
  logical_document_id text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  file_name text NOT NULL,
  media_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  sha256 char(64) NOT NULL,
  storage_bucket text NOT NULL,
  storage_key text NOT NULL UNIQUE,
  classification text NOT NULL CHECK (classification IN ('public','internal','confidential','restricted')),
  status text NOT NULL CHECK (status IN ('upload_pending','quarantined','available','rejected','archived','deleted')),
  malware_status text NOT NULL CHECK (malware_status IN ('pending','clean','infected','error')),
  territory_ids text[] NOT NULL DEFAULT '{}',
  organization_id text,
  uploaded_by_identity_id text NOT NULL,
  uploaded_at timestamptz NOT NULL,
  retention_until timestamptz,
  legal_hold boolean NOT NULL DEFAULT false,
  supersedes_document_id text REFERENCES mbambulaan.evidence_documents(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (logical_document_id, version)
);

CREATE TABLE IF NOT EXISTS mbambulaan.evidence_document_subjects (
  document_id text NOT NULL REFERENCES mbambulaan.evidence_documents(id) ON DELETE CASCADE,
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  PRIMARY KEY (document_id, subject_type, subject_id)
);

CREATE TABLE IF NOT EXISTS mbambulaan.evidence_access_receipts (
  id text PRIMARY KEY,
  document_id text NOT NULL REFERENCES mbambulaan.evidence_documents(id),
  identity_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('view','download','share','archive','delete','validate')),
  purpose text NOT NULL,
  correlation_id text,
  occurred_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_documents_logical_version ON mbambulaan.evidence_documents(logical_document_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_documents_status ON mbambulaan.evidence_documents(status, malware_status);
CREATE INDEX IF NOT EXISTS idx_evidence_documents_territories ON mbambulaan.evidence_documents USING gin(territory_ids);
CREATE INDEX IF NOT EXISTS idx_evidence_documents_organization ON mbambulaan.evidence_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_evidence_subject_lookup ON mbambulaan.evidence_document_subjects(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_evidence_receipts_document_time ON mbambulaan.evidence_access_receipts(document_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_receipts_identity_time ON mbambulaan.evidence_access_receipts(identity_id, occurred_at DESC);

COMMIT;
