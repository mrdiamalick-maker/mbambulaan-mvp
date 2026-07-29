BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.notification_contact_point (
  contact_point_id TEXT PRIMARY KEY,
  actor_identity_id TEXT,
  organization_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient_reference TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, actor_identity_id, channel, recipient_reference)
);

CREATE INDEX IF NOT EXISTS notification_contact_point_lookup_idx
  ON mbambulaan.notification_contact_point (organization_id, actor_identity_id, territory_id, channel)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS mbambulaan.notification_delivery_attempt (
  attempt_id TEXT PRIMARY KEY,
  notification_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient_reference TEXT NOT NULL,
  provider_reference TEXT,
  status TEXT NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  prepared_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  failure_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_delivery_attempt_retry_idx
  ON mbambulaan.notification_delivery_attempt (status, next_retry_at)
  WHERE status = 'failed';

CREATE INDEX IF NOT EXISTS notification_delivery_attempt_notification_idx
  ON mbambulaan.notification_delivery_attempt (notification_id, attempt_number DESC);

COMMIT;
