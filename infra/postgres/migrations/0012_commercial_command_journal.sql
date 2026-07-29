BEGIN;

CREATE SCHEMA IF NOT EXISTS mbambulaan;

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_command_journal (
  sequence_id bigserial PRIMARY KEY,
  command_id text NOT NULL UNIQUE,
  actor_kind text NOT NULL CHECK (actor_kind IN ('seller','buyer','logistics','finance')),
  actor_identity_id text NOT NULL,
  organization_id text NOT NULL,
  territory_id text NOT NULL,
  command_type text NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_commercial_command_journal_order
  ON mbambulaan.commercial_command_journal(sequence_id ASC);
CREATE INDEX IF NOT EXISTS ix_commercial_command_journal_actor
  ON mbambulaan.commercial_command_journal(actor_identity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_commercial_command_journal_territory
  ON mbambulaan.commercial_command_journal(territory_id, occurred_at DESC);

INSERT INTO mbambulaan.schema_migrations(version, checksum_sha256, applied_by)
VALUES ('0012', '84b2a5d834daee2fff7eb5e31f44ba68eb860d86d2cf8e37606a26fa775cf23b', 'mbambulaan-migration-runner')
ON CONFLICT (version) DO NOTHING;

COMMIT;
