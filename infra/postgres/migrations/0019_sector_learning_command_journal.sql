BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.sector_learning_command_journal (
  sequence_id BIGSERIAL PRIMARY KEY,
  command_id TEXT NOT NULL UNIQUE,
  actor_identity_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  command_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sector_learning_command_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS sector_learning_command_journal_territory_sequence_idx
  ON mbambulaan.sector_learning_command_journal (territory_id, sequence_id);

CREATE INDEX IF NOT EXISTS sector_learning_command_journal_type_idx
  ON mbambulaan.sector_learning_command_journal (command_type);

COMMIT;
