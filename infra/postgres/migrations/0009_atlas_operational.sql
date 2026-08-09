CREATE TABLE IF NOT EXISTS mbambulaan.atlas_workspaces (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  client_segment text NOT NULL,
  territory_ids text[] NOT NULL DEFAULT '{}',
  decision_domains text[] NOT NULL DEFAULT '{}',
  capability_codes text[] NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('draft','active','suspended','archived')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_questions (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES mbambulaan.atlas_workspaces(id),
  asked_by_actor_id text NOT NULL,
  asked_at timestamptz NOT NULL,
  question text NOT NULL,
  decision_domain text NOT NULL,
  territory_ids text[] NOT NULL DEFAULT '{}',
  horizon text NOT NULL,
  objective text,
  correlation_id text,
  status text NOT NULL DEFAULT 'answered' CHECK (status IN ('queued','processing','answered','failed')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_evidence (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES mbambulaan.atlas_workspaces(id),
  question_id text REFERENCES mbambulaan.atlas_questions(id),
  source_type text NOT NULL,
  source_entity_id text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  observed_at timestamptz,
  reliability_score double precision NOT NULL CHECK (reliability_score BETWEEN 0 AND 100),
  freshness_score double precision NOT NULL CHECK (freshness_score BETWEEN 0 AND 100),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_insights (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES mbambulaan.atlas_workspaces(id),
  question_id text REFERENCES mbambulaan.atlas_questions(id),
  decision_domain text NOT NULL,
  title text NOT NULL,
  statement text NOT NULL,
  implication text NOT NULL,
  evidence_ids text[] NOT NULL DEFAULT '{}',
  confidence_score double precision NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  urgency text NOT NULL CHECK (urgency IN ('low','medium','high','critical')),
  generated_at timestamptz NOT NULL,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_scenarios (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES mbambulaan.atlas_workspaces(id),
  name text NOT NULL,
  decision_domain text NOT NULL,
  baseline_snapshot_id text,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions text[] NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('draft','evaluated','selected','rejected')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_scenario_evaluations (
  scenario_id text PRIMARY KEY REFERENCES mbambulaan.atlas_scenarios(id),
  value_creation_score double precision NOT NULL,
  resilience_score double precision NOT NULL,
  coordination_score double precision NOT NULL,
  financial_sustainability_score double precision NOT NULL,
  implementation_risk_score double precision NOT NULL,
  estimated_cost_xof bigint NOT NULL DEFAULT 0,
  expected_benefits text[] NOT NULL DEFAULT '{}',
  risks text[] NOT NULL DEFAULT '{}',
  recommendation text NOT NULL CHECK (recommendation IN ('execute','pilot','revise','reject')),
  evaluated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_briefings (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES mbambulaan.atlas_workspaces(id),
  generated_at timestamptz NOT NULL,
  title text NOT NULL,
  executive_summary text NOT NULL,
  priority_signal_ids text[] NOT NULL DEFAULT '{}',
  priority_insight_ids text[] NOT NULL DEFAULT '{}',
  selected_scenario_ids text[] NOT NULL DEFAULT '{}',
  recommended_decisions text[] NOT NULL DEFAULT '{}',
  next_review_at timestamptz,
  published_at timestamptz,
  published_by_actor_id text
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_knowledge_nodes (
  id text PRIMARY KEY,
  kind text NOT NULL,
  source_entity_id text NOT NULL,
  label text NOT NULL,
  territory_ids text[] NOT NULL DEFAULT '{}',
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_score double precision NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  observed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, source_entity_id)
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_knowledge_edges (
  id text PRIMARY KEY,
  from_node_id text NOT NULL REFERENCES mbambulaan.atlas_knowledge_nodes(id),
  to_node_id text NOT NULL REFERENCES mbambulaan.atlas_knowledge_nodes(id),
  relation text NOT NULL,
  weight double precision NOT NULL CHECK (weight BETWEEN 0 AND 100),
  evidence_ids text[] NOT NULL DEFAULT '{}',
  valid_from timestamptz,
  valid_until timestamptz
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_causal_paths (
  id text PRIMARY KEY,
  decision_domain text NOT NULL,
  node_ids text[] NOT NULL,
  edge_ids text[] NOT NULL,
  explanation text NOT NULL,
  confidence_score double precision NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbambulaan.atlas_decision_actions (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES mbambulaan.atlas_workspaces(id),
  scenario_id text REFERENCES mbambulaan.atlas_scenarios(id),
  briefing_id text REFERENCES mbambulaan.atlas_briefings(id),
  action_type text NOT NULL,
  target_entity_ids text[] NOT NULL DEFAULT '{}',
  assigned_actor_id text,
  assigned_organization_id text,
  territory_ids text[] NOT NULL DEFAULT '{}',
  due_at timestamptz,
  status text NOT NULL CHECK (status IN ('proposed','approved','dispatched','in_progress','completed','cancelled','failed')),
  runtime_event_id text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_atlas_questions_workspace_time ON mbambulaan.atlas_questions(workspace_id, asked_at DESC);
CREATE INDEX IF NOT EXISTS idx_atlas_evidence_question ON mbambulaan.atlas_evidence(question_id, reliability_score DESC);
CREATE INDEX IF NOT EXISTS idx_atlas_insights_workspace_urgency ON mbambulaan.atlas_insights(workspace_id, urgency, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_atlas_scenarios_workspace_status ON mbambulaan.atlas_scenarios(workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_atlas_nodes_territories ON mbambulaan.atlas_knowledge_nodes USING gin(territory_ids);
CREATE INDEX IF NOT EXISTS idx_atlas_edges_from_to ON mbambulaan.atlas_knowledge_edges(from_node_id, to_node_id);
CREATE INDEX IF NOT EXISTS idx_atlas_actions_status_due ON mbambulaan.atlas_decision_actions(status, due_at);
