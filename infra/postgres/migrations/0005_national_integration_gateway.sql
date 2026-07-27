BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.integration_partners (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  partner_type text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox','production')),
  status text NOT NULL CHECK (status IN ('pending','active','suspended','revoked')),
  allowed_event_types text[] NOT NULL DEFAULT '{}',
  allowed_territory_ids text[] NOT NULL DEFAULT '{}',
  allowed_ip_hashes text[] NOT NULL DEFAULT '{}',
  signing_secret_version integer NOT NULL DEFAULT 1,
  requests_per_minute integer NOT NULL CHECK (requests_per_minute > 0),
  callback_url text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.integration_incoming_exchanges (
  id text PRIMARY KEY,
  partner_id text NOT NULL REFERENCES mbambulaan.integration_partners(id),
  event_type text NOT NULL,
  event_version integer NOT NULL,
  idempotency_key text NOT NULL,
  correlation_id text NOT NULL,
  territory_ids text[] NOT NULL,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  signature text NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL,
  status text NOT NULL,
  rejection_reason text,
  UNIQUE (partner_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS mbambulaan.integration_outgoing_exchanges (
  id text PRIMARY KEY,
  partner_id text NOT NULL REFERENCES mbambulaan.integration_partners(id),
  event_type text NOT NULL,
  event_version integer NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  correlation_id text NOT NULL,
  territory_ids text[] NOT NULL,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  signature text NOT NULL,
  status text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.integration_receipts (
  id text PRIMARY KEY,
  exchange_id text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('incoming','outgoing')),
  partner_id text NOT NULL REFERENCES mbambulaan.integration_partners(id),
  status text NOT NULL,
  provider_reference text,
  detail text,
  occurred_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.integration_quota_windows (
  partner_id text NOT NULL REFERENCES mbambulaan.integration_partners(id),
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (partner_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_integration_incoming_partner_event ON mbambulaan.integration_incoming_exchanges(partner_id, event_type, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_incoming_correlation ON mbambulaan.integration_incoming_exchanges(correlation_id);
CREATE INDEX IF NOT EXISTS idx_integration_outgoing_pending ON mbambulaan.integration_outgoing_exchanges(status, next_attempt_at) WHERE status IN ('pending','failed');
CREATE INDEX IF NOT EXISTS idx_integration_outgoing_partner ON mbambulaan.integration_outgoing_exchanges(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_receipts_exchange ON mbambulaan.integration_receipts(exchange_id, occurred_at DESC);

COMMIT;
