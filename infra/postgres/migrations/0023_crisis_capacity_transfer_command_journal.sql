BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.crisis_capacity_transfer_command_journal (
  sequence_id BIGSERIAL PRIMARY KEY,
  command_id TEXT NOT NULL UNIQUE,
  actor_identity_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  command_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crisis_capacity_transfer_journal_territory_sequence_idx
  ON mbambulaan.crisis_capacity_transfer_command_journal (territory_id, sequence_id);

COMMIT;
