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

INSERT INTO mbambulaan.schema_migrations (version, description)
VALUES ('0017', 'Commercial settlement adjustments and corrective accounting journal')
ON CONFLICT (version) DO NOTHING;

COMMIT;
