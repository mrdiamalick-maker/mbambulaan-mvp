BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.operational_contract_command_journal (
  sequence_id BIGSERIAL PRIMARY KEY,
  command_id TEXT NOT NULL UNIQUE,
  actor_identity_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  command_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS operational_contract_journal_territory_sequence_idx
  ON mbambulaan.operational_contract_command_journal (territory_id, sequence_id);

COMMIT;
