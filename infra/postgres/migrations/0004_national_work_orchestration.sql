BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.escalation_policies (
  code text PRIMARY KEY,
  acknowledgement_minutes integer NOT NULL CHECK (acknowledgement_minutes > 0),
  resolution_minutes integer NOT NULL CHECK (resolution_minutes > 0),
  maximum_level integer NOT NULL CHECK (maximum_level >= 0),
  levels jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.work_items (
  id text PRIMARY KEY,
  work_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  territory_ids text[] NOT NULL,
  organization_id text,
  assigned_identity_id text,
  assigned_organization_id text,
  source_event_id text,
  source_entity_type text NOT NULL,
  source_entity_id text NOT NULL,
  due_at timestamptz NOT NULL,
  acknowledgement_due_at timestamptz,
  acknowledged_at timestamptz,
  completed_at timestamptz,
  blocked_reason text,
  escalation_level integer NOT NULL DEFAULT 0,
  escalation_policy_code text NOT NULL REFERENCES mbambulaan.escalation_policies(code),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.commitments (
  id text PRIMARY KEY,
  work_item_id text NOT NULL REFERENCES mbambulaan.work_items(id),
  committed_by_identity_id text,
  committed_by_organization_id text,
  commitment_text text NOT NULL,
  due_at timestamptz NOT NULL,
  status text NOT NULL,
  accepted_at timestamptz,
  fulfilled_at timestamptz,
  evidence_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.notification_preferences (
  identity_id text PRIMARY KEY,
  enabled_channels text[] NOT NULL,
  quiet_hours jsonb,
  critical_override boolean NOT NULL DEFAULT false,
  locale text NOT NULL DEFAULT 'fr',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.notification_messages (
  id text PRIMARY KEY,
  work_item_id text REFERENCES mbambulaan.work_items(id),
  recipient_identity_id text,
  recipient_organization_id text,
  channel text NOT NULL,
  template_code text NOT NULL,
  locale text NOT NULL,
  subject text,
  payload jsonb NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL,
  provider_message_id text,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.notification_delivery_receipts (
  id text PRIMARY KEY,
  notification_id text NOT NULL REFERENCES mbambulaan.notification_messages(id),
  provider_message_id text,
  status text NOT NULL,
  occurred_at timestamptz NOT NULL,
  raw_code text
);

CREATE INDEX IF NOT EXISTS work_items_due_idx ON mbambulaan.work_items (status, due_at);
CREATE INDEX IF NOT EXISTS work_items_ack_due_idx ON mbambulaan.work_items (status, acknowledgement_due_at);
CREATE INDEX IF NOT EXISTS work_items_territory_idx ON mbambulaan.work_items USING gin (territory_ids);
CREATE INDEX IF NOT EXISTS work_items_assignee_idx ON mbambulaan.work_items (assigned_identity_id, status);
CREATE INDEX IF NOT EXISTS notification_pending_idx ON mbambulaan.notification_messages (status, next_attempt_at);
CREATE INDEX IF NOT EXISTS notification_recipient_idx ON mbambulaan.notification_messages (recipient_identity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS commitments_due_idx ON mbambulaan.commitments (status, due_at);

COMMIT;
