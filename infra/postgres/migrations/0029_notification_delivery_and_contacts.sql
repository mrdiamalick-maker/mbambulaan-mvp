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
  ON