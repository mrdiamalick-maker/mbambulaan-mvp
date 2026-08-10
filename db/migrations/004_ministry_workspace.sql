-- Espace Ministère : rencontres terrain et signalements de vigilance.
-- Isolé du store opérationnel (mbambulaan_tenant_state) — voir
-- src/server/ministry-repository.ts.
create table if not exists mbambulaan_field_visits (
  id text primary key,
  tenant_id text not null default 'tenant-demo',
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
  tenant_id text not null default 'tenant-demo',
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

-- Lot 0 (refondation) : ajout de tenant_id pour préparer le multi-tenant réel
-- sans migration lourde ultérieure. Pas d'effet sur les tables déjà créées
-- par ensureSchema() avant cette évolution — ajouter en migration manuelle
-- si une base existante doit être alignée :
-- alter table mbambulaan_field_visits add column if not exists tenant_id text not null default 'tenant-demo';
-- alter table mbambulaan_vigilance_cases add column if not exists tenant_id text not null default 'tenant-demo';
