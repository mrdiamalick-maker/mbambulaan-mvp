BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.ecosystem_business_event (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  actor_identity_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  territory_ids JSONB NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ecosystem_business_event_correlation_idx
  ON mbambulaan.ecosystem_business_event (correlation_id, occurred_at);

CREATE INDEX IF NOT EXISTS ecosystem_business_event_entity_idx
  ON mbambulaan.ecosystem_business_event (entity_type, entity_id, occurred_at);

CREATE TABLE IF NOT EXISTS mbambulaan.ecosystem_business_event_delivery (
  event_id TEXT NOT NULL REFERENCES mbambulaan.ecosystem_business_event(event_id) ON DELETE CASCADE,
  handler_name TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  processed_at TIMESTAMPTZ NOT NULL,
  next_retry_at TIMESTAMPTZ,
  error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, handler_name)
);

CREATE INDEX IF NOT EXISTS ecosystem_business_event_delivery_retry_idx
  ON mbambulaan.ecosystem_business_event_delivery (status, next_retry_at)
  WHERE status = 'failed';

COMMIT;
