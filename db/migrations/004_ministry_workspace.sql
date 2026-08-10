-- Espace Ministère : rencontres terrain et signalements de vigilance.
-- Isolé du store opérationnel (mbambulaan_tenant_state) — voir
-- src/server/ministry-repository.ts.
create table if not exists mbambulaan_field_visits (
  id text primary key,
  title text not null,
  territory_id text not null,
  territory_label text not null,
  objective text not null,
  planned_at timestamptz not null,
  notes text,
  status text not null default 'planifiee',
  created_by_actor_id text not null,
  created_by_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists mbambulaan_vigilance_cases (
  id text primary key,
  category text not null,
  territory_id text not null,
  territory_label text not null,
  severity text not null,
  description text not null,
  status text not null default 'signale',
  reported_by_actor_id text not null,
  reported_by_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
