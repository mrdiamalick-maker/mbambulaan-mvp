BEGIN;

CREATE SCHEMA IF NOT EXISTS mbambulaan;
SET search_path TO mbambulaan, public;

CREATE TABLE IF NOT EXISTS national_reference_records (
  id text PRIMARY KEY,
  reference_type text NOT NULL,
  code text NOT NULL,
  canonical_label text NOT NULL,
  alternate_labels jsonb NOT NULL DEFAULT '[]'::jsonb,
  parent_id text NULL REFERENCES national_reference_records(id),
  territory_id text NULL REFERENCES territories(id),
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL CHECK (status IN ('draft', 'active', 'deprecated', 'retired')),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_national_reference_code_scope
  ON national_reference_records(reference_type, code, COALESCE(territory_id, 'national'))
  WHERE status <> 'retired';

CREATE INDEX IF NOT EXISTS ix_national_reference_type_status
  ON national_reference_records(reference_type, status);

CREATE INDEX IF NOT EXISTS ix_national_reference_parent
  ON national_reference_records(parent_id)
  WHERE parent_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS reference_change_requests (
  id text PRIMARY KEY,
  reference_type text NOT NULL,
  reference_id text NULL REFERENCES national_reference_records(id),
  requested_by_identity_id text NOT NULL,
  approved_by_identity_id text NULL,
  reason text NOT NULL,
  proposed_record jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'applied', 'cancelled')),
  submitted_at timestamptz NULL,
  decided_at timestamptz NULL,
  applied_at timestamptz NULL,
  rejection_reason text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (approved_by_identity_id IS NULL OR approved_by_identity_id <> requested_by_identity_id)
);

CREATE INDEX IF NOT EXISTS ix_reference_change_status
  ON reference_change_requests(status, created_at);

CREATE TABLE IF NOT EXISTS data_quality_rules (
  code text PRIMARY KEY,
  entity_type text NOT NULL,
  field_path text NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'blocking')),
  territory_id text NULL REFERENCES territories(id),
  rule_expression jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_quality_issues (
  id text PRIMARY KEY,
  rule_code text NOT NULL REFERENCES data_quality_rules(code),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  field_path text NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'blocking')),
  message text NOT NULL,
  territory_id text NULL REFERENCES territories(id),
  detected_at timestamptz NOT NULL,
  resolved_at timestamptz NULL,
  resolution_note text NULL
);

CREATE INDEX IF NOT EXISTS ix_data_quality_open_issues
  ON data_quality_issues(entity_type, entity_id, severity)
  WHERE resolved_at IS NULL;

CREATE TABLE IF NOT EXISTS duplicate_candidates (
  id text PRIMARY KEY,
  entity_type text NOT NULL,
  left_entity_id text NOT NULL,
  right_entity_id text NOT NULL,
  score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  matched_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL CHECK (status IN ('open', 'confirmed_duplicate', 'not_duplicate', 'merged')),
  detected_at timestamptz NOT NULL,
  reviewed_at timestamptz NULL,
  reviewed_by_identity_id text NULL,
  CHECK (left_entity_id <> right_entity_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_duplicate_candidate_pair
  ON duplicate_candidates(
    entity_type,
    LEAST(left_entity_id, right_entity_id),
    GREATEST(left_entity_id, right_entity_id)
  )
  WHERE status = 'open';

INSERT INTO schema_migrations(version, checksum_sha256, applied_by)
VALUES ('0007', 'f15cea39f11dc0371cfb9a4b7b1c38d5c636feb72d70e2759b0e505905ee9d01', 'mbambulaan-migration-runner')
ON CONFLICT (version) DO NOTHING;

COMMIT;
