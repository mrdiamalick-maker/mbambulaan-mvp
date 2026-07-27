CREATE TABLE IF NOT EXISTS mbambulaan.health_signals (
  id text PRIMARY KEY,
  component text NOT NULL,
  territory_id text,
  status text NOT NULL CHECK (status IN ('healthy','degraded','unavailable')),
  latency_ms integer,
  detail text,
  dependency_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  checked_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.metric_points (
  id text PRIMARY KEY,
  metric_name text NOT NULL,
  value double precision NOT NULL,
  unit text NOT NULL,
  territory_id text,
  labels jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.trace_spans (
  id text PRIMARY KEY,
  trace_id text NOT NULL,
  parent_span_id text,
  operation text NOT NULL,
  component text NOT NULL,
  territory_id text,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('ok','error')),
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS mbambulaan.service_level_objectives (
  code text PRIMARY KEY,
  service_name text NOT NULL,
  territory_id text,
  objective_type text NOT NULL,
  target double precision NOT NULL,
  measurement_window_minutes integer NOT NULL,
  error_budget_percent double precision NOT NULL,
  status text NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS mbambulaan.slo_evaluations (
  id text PRIMARY KEY,
  slo_code text NOT NULL REFERENCES mbambulaan.service_level_objectives(code),
  territory_id text,
  measured_value double precision NOT NULL,
  target double precision NOT NULL,
  compliant boolean NOT NULL,
  error_budget_consumed_percent double precision NOT NULL,
  window_started_at timestamptz NOT NULL,
  window_ended_at timestamptz NOT NULL,
  evaluated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.operational_incidents (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL,
  service_name text NOT NULL,
  territory_ids text[] NOT NULL DEFAULT '{}',
  detected_at timestamptz NOT NULL,
  acknowledged_at timestamptz,
  mitigated_at timestamptz,
  resolved_at timestamptz,
  commander_identity_id text,
  runbook_code text NOT NULL,
  correlation_ids text[] NOT NULL DEFAULT '{}',
  impact text NOT NULL,
  root_cause text,
  corrective_actions jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS mbambulaan.backup_executions (
  id text PRIMARY KEY,
  backup_type text NOT NULL,
  database_name text NOT NULL,
  region_code text NOT NULL,
  storage_location text NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  size_bytes bigint,
  checksum text,
  restore_tested_at timestamptz,
  retention_until timestamptz NOT NULL,
  error text
);

CREATE TABLE IF NOT EXISTS mbambulaan.offline_mutations (
  id text PRIMARY KEY,
  device_id text NOT NULL,
  identity_id text NOT NULL,
  territory_id text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  command_type text NOT NULL,
  client_sequence bigint NOT NULL,
  base_version bigint,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  captured_at timestamptz NOT NULL,
  received_at timestamptz,
  status text NOT NULL,
  conflict_reason text,
  retry_count integer NOT NULL DEFAULT 0,
  UNIQUE (device_id, client_sequence)
);

CREATE INDEX IF NOT EXISTS idx_health_signals_component_time ON mbambulaan.health_signals(component, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_metric_points_metric_time ON mbambulaan.metric_points(metric_name, territory_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_trace_spans_trace ON mbambulaan.trace_spans(trace_id, started_at);
CREATE INDEX IF NOT EXISTS idx_incidents_status_severity ON mbambulaan.operational_incidents(status, severity, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_status_time ON mbambulaan.backup_executions(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_mutations_pending ON mbambulaan.offline_mutations(status, received_at) WHERE status IN ('pending','conflict');
