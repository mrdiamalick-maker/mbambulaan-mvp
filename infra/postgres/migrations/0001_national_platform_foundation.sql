BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS mbambulaan;

CREATE TABLE IF NOT EXISTS mbambulaan.territories (
  id text PRIMARY KEY,
  country_id text NOT NULL,
  parent_territory_id text REFERENCES mbambulaan.territories(id),
  code text NOT NULL,
  name text NOT NULL,
  territory_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_id, code)
);

CREATE TABLE IF NOT EXISTS mbambulaan.organizations (
  id text PRIMARY KEY,
  organization_type text NOT NULL,
  canonical_name text NOT NULL,
  registration_number text,
  tax_identifier text,
  home_territory_id text REFERENCES mbambulaan.territories(id),
  status text NOT NULL DEFAULT 'active',
  verification_level text NOT NULL DEFAULT 'unverified',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (organization_type, registration_number),
  UNIQUE NULLS NOT DISTINCT (tax_identifier)
);

CREATE TABLE IF NOT EXISTS mbambulaan.actors (
  id text PRIMARY KEY,
  actor_type text NOT NULL,
  display_name text NOT NULL,
  phone_e164 text,
  email text,
  national_id_hash text,
  home_territory_id text REFERENCES mbambulaan.territories(id),
  primary_organization_id text REFERENCES mbambulaan.organizations(id),
  status text NOT NULL DEFAULT 'active',
  verification_level text NOT NULL DEFAULT 'unverified',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (phone_e164),
  UNIQUE NULLS NOT DISTINCT (email),
  UNIQUE NULLS NOT DISTINCT (national_id_hash)
);

CREATE TABLE IF NOT EXISTS mbambulaan.aggregate_records (
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  territory_id text REFERENCES mbambulaan.territories(id),
  organization_id text REFERENCES mbambulaan.organizations(id),
  version bigint NOT NULL DEFAULT 1,
  status text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  deleted_at timestamptz,
  PRIMARY KEY (aggregate_type, aggregate_id),
  CHECK (version > 0)
);

CREATE INDEX IF NOT EXISTS idx_aggregate_records_territory
  ON mbambulaan.aggregate_records (territory_id, aggregate_type, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_aggregate_records_organization
  ON mbambulaan.aggregate_records (organization_id, aggregate_type, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_aggregate_records_payload_gin
  ON mbambulaan.aggregate_records USING gin (payload jsonb_path_ops);

CREATE TABLE IF NOT EXISTS mbambulaan.command_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL,
  command_id text NOT NULL,
  command_type text NOT NULL,
  actor_id text NOT NULL REFERENCES mbambulaan.actors(id),
  organization_id text REFERENCES mbambulaan.organizations(id),
  territory_ids text[] NOT NULL DEFAULT '{}',
  correlation_id text NOT NULL,
  causation_id text,
  request_hash text NOT NULL,
  status text NOT NULL,
  response_payload jsonb,
  error_code text,
  error_message text,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (idempotency_key),
  UNIQUE (command_id)
);

CREATE INDEX IF NOT EXISTS idx_command_executions_correlation
  ON mbambulaan.command_executions (correlation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS mbambulaan.domain_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  aggregate_version bigint NOT NULL,
  actor_id text NOT NULL REFERENCES mbambulaan.actors(id),
  organization_id text REFERENCES mbambulaan.organizations(id),
  territory_ids text[] NOT NULL DEFAULT '{}',
  correlation_id text NOT NULL,
  causation_id text NOT NULL,
  schema_version integer NOT NULL DEFAULT 1,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aggregate_type, aggregate_id, aggregate_version)
);

CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate
  ON mbambulaan.domain_events (aggregate_type, aggregate_id, aggregate_version);
CREATE INDEX IF NOT EXISTS idx_domain_events_correlation
  ON mbambulaan.domain_events (correlation_id, occurred_at);

CREATE TABLE IF NOT EXISTS mbambulaan.outbox_messages (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES mbambulaan.domain_events(id) ON DELETE CASCADE,
  topic text NOT NULL,
  partition_key text NOT NULL,
  payload jsonb NOT NULL,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  locked_by text,
  published_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (attempt_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_outbox_dispatch
  ON mbambulaan.outbox_messages (status, next_attempt_at, created_at)
  WHERE status IN ('pending', 'failed');

CREATE TABLE IF NOT EXISTS mbambulaan.audit_entries (
  id text PRIMARY KEY,
  actor_id text NOT NULL REFERENCES mbambulaan.actors(id),
  organization_id text REFERENCES mbambulaan.organizations(id),
  territory_ids text[] NOT NULL DEFAULT '{}',
  command_id text NOT NULL,
  command_type text NOT NULL,
  decision text NOT NULL,
  summary text NOT NULL,
  correlation_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entries_actor
  ON mbambulaan.audit_entries (actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entries_correlation
  ON mbambulaan.audit_entries (correlation_id, occurred_at);

CREATE TABLE IF NOT EXISTS mbambulaan.documents (
  id text PRIMARY KEY,
  owner_actor_id text REFERENCES mbambulaan.actors(id),
  organization_id text REFERENCES mbambulaan.organizations(id),
  territory_id text REFERENCES mbambulaan.territories(id),
  document_type text NOT NULL,
  storage_provider text NOT NULL,
  storage_key text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NOT NULL,
  checksum_sha256 text NOT NULL,
  classification text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (storage_provider, storage_key),
  CHECK (byte_size >= 0)
);

CREATE TABLE IF NOT EXISTS mbambulaan.aggregate_documents (
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  document_id text NOT NULL REFERENCES mbambulaan.documents(id),
  relation_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (aggregate_type, aggregate_id, document_id, relation_type)
);

CREATE TABLE IF NOT EXISTS mbambulaan.schema_migrations (
  version text PRIMARY KEY,
  checksum_sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by text NOT NULL
);

CREATE OR REPLACE FUNCTION mbambulaan.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS territories_set_updated_at ON mbambulaan.territories;
CREATE TRIGGER territories_set_updated_at
BEFORE UPDATE ON mbambulaan.territories
FOR EACH ROW EXECUTE FUNCTION mbambulaan.set_updated_at();

DROP TRIGGER IF EXISTS organizations_set_updated_at ON mbambulaan.organizations;
CREATE TRIGGER organizations_set_updated_at
BEFORE UPDATE ON mbambulaan.organizations
FOR EACH ROW EXECUTE FUNCTION mbambulaan.set_updated_at();

DROP TRIGGER IF EXISTS actors_set_updated_at ON mbambulaan.actors;
CREATE TRIGGER actors_set_updated_at
BEFORE UPDATE ON mbambulaan.actors
FOR EACH ROW EXECUTE FUNCTION mbambulaan.set_updated_at();

COMMIT;
