CREATE TABLE IF NOT EXISTS mbambulaan.runtime_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  tenant_id text NOT NULL,
  territory_id text NOT NULL,
  correlation_id text NOT NULL,
  causation_id text,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS mbambulaan.runtime_outbox (
  event_id text PRIMARY KEY REFERENCES mbambulaan.runtime_events(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending','processing','processed','failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  locked_by text,
  processed_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.runtime_audit_records (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES mbambulaan.runtime_events(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('accepted','processed','failed','ignored_duplicate')),
  occurred_at timestamptz NOT NULL,
  processed_at timestamptz,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.runtime_projection_checkpoints (
  projection_code text NOT NULL,
  tenant_id text NOT NULL,
  territory_id text NOT NULL,
  last_event_id text NOT NULL REFERENCES mbambulaan.runtime_events(id),
  last_occurred_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (projection_code, tenant_id, territory_id)
);

CREATE TABLE IF NOT EXISTS mbambulaan.runtime_worker_leases (
  worker_code text PRIMARY KEY,
  owner_id text NOT NULL,
  acquired_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  heartbeat_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_runtime_events_correlation
  ON mbambulaan.runtime_events(correlation_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_runtime_events_scope
  ON mbambulaan.runtime_events(tenant_id, territory_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_runtime_outbox_pending
  ON mbambulaan.runtime_outbox(status, available_at)
  WHERE status IN ('pending','failed');
CREATE INDEX IF NOT EXISTS idx_runtime_audit_event
  ON mbambulaan.runtime_audit_records(event_id, created_at);
