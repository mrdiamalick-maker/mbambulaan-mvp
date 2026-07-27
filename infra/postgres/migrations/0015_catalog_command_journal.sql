BEGIN;

CREATE SCHEMA IF NOT EXISTS mbambulaan;

CREATE TABLE IF NOT EXISTS mbambulaan.catalog_command_journal (
  sequence_id bigserial PRIMARY KEY,
  command_id text NOT NULL UNIQUE,
  actor_identity_id text NOT NULL,
  organization_id text NOT NULL,
  territory_id text NOT NULL,
  command_type text NOT NULL,
  command_payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_catalog_command_journal_sequence
  ON mbambulaan.catalog_command_journal(sequence_id);
CREATE INDEX IF NOT EXISTS ix_catalog_command_journal_organization
  ON mbambulaan.catalog_command_journal(organization_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS mbambulaan.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO mbambulaan.schema_migrations(version)
VALUES ('0015')
ON CONFLICT (version) DO NOTHING;

COMMIT;
