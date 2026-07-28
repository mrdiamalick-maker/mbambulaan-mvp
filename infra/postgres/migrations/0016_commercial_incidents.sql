BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.commercial_incident_journal (
  sequence_id BIGSERIAL PRIMARY KEY,
  command_id TEXT NOT NULL UNIQUE,
  incident_id TEXT NOT NULL,
  command_type TEXT NOT NULL CHECK (command_type IN ('open','assess','resolve')),
  actor_identity_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_incident_journal_incident
  ON mbambulaan.commercial_incident_journal (incident_id, sequence_id);
CREATE INDEX IF NOT EXISTS idx_commercial_incident_journal_territory
  ON mbambulaan.commercial_incident_journal (territory_id, sequence_id);

INSERT INTO mbambulaan.schema_migrations(version, checksum_sha256, applied_by)
VALUES ('0016', 'd5153a8e6fa6caad01f67479b366b5d9f3b6350e594dd3f8776d4edb7a2a889c', 'mbambulaan-migration-runner')
ON CONFLICT (version) DO NOTHING;

COMMIT;
