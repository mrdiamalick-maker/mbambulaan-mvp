BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.national_coordination_signal (
  signal_id TEXT PRIMARY KEY,
  correlation_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  territory_ids JSONB NOT NULL,
  organization_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  value_xof BIGINT,
  quantity_kg NUMERIC(18,3),
  occurred_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS national_coordination_signal_correlation_idx
  ON mbambulaan.national_coordination_signal (correlation_id, occurred_at ASC);

CREATE INDEX IF NOT EXISTS national_coordination_signal_open_idx
  ON mbambulaan.national_coordination_signal (status, severity, occurred_at DESC)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS national_coordination_signal_territories_gin_idx
  ON mbambulaan.national_coordination_signal USING GIN (territory_ids);

COMMIT;
