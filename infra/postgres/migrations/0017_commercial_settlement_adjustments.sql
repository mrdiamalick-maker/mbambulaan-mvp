BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_settlement_adjustment_journal (
  sequence_id BIGSERIAL PRIMARY KEY,
  command_id TEXT NOT NULL UNIQUE,
  adjustment_id TEXT NOT NULL,
  command_type TEXT NOT NULL CHECK (command_type IN ('request','approve','execute','cancel')),
  actor_identity_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlement_adjustment_journal_adjustment
  ON mbambulaan.commercial_settlement_adjustment_journal (adjustment_id, sequence_id);

CREATE INDEX IF NOT EXISTS idx_settlement_adjustment_journal_order
  ON mbambulaan.commercial_settlement_adjustment_journal ((payload ->> 'orderId'), sequence_id);

INSERT INTO mbambulaan.schema_migrations(version, checksum_sha256, applied_by)
VALUES ('0017', '1ca028f07214879e7a13ac5fddab2db2f66149572a62e814e97e7ad4ba286f4c', 'mbambulaan-migration-runner')
ON CONFLICT (version) DO NOTHING;

COMMIT;
