BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.required_document_rule (
  rule_id TEXT PRIMARY KEY,
  related_entity_type TEXT NOT NULL,
  related_entity_id TEXT NOT NULL,
  required_document_types JSONB NOT NULL,
  responsible_organization_id TEXT NOT NULL,
  responsible_actor_id TEXT,
  territory_id TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS required_document_rule_entity_idx
  ON mbambulaan.required_document_rule (related_entity_type, related_entity_id);

CREATE INDEX IF NOT EXISTS required_document_rule_territory_due_idx
  ON mbambulaan.required_document_rule (territory_id, due_at)
  WHERE status = 'active';

COMMIT;
