BEGIN;

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_operational_decisions (
  id text PRIMARY KEY,
  scenario_id text NOT NULL REFERENCES mbambulaan.atlas_scenarios(id),
  workspace_id text NOT NULL REFERENCES mbambulaan.atlas_workspaces(id),
  approved_by_actor_id text NOT NULL,
  territory_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('approved','in_execution','completed')),
  approved_at timestamptz NOT NULL,
  completed_at timestamptz,
  work_item_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_operational_results (
  id text PRIMARY KEY,
  decision_id text NOT NULL UNIQUE REFERENCES mbambulaan.atlas_operational_decisions(id),
  scenario_id text NOT NULL REFERENCES mbambulaan.atlas_scenarios(id),
  territory_id text NOT NULL,
  completed_work_items integer NOT NULL CHECK (completed_work_items >= 0),
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text NOT NULL,
  observed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_atlas_operational_decisions_status
  ON mbambulaan.atlas_operational_decisions(status, territory_id, approved_at);

CREATE INDEX IF NOT EXISTS ix_atlas_operational_results_scenario
  ON mbambulaan.atlas_operational_results(scenario_id, observed_at);

COMMIT;
