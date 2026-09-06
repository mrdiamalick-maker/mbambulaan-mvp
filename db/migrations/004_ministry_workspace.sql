-- Espace Ministère : rencontres terrain et signalements de vigilance.
-- Table dédiée (vocabulaire et cycle de vie propres au ministère), mais
-- depuis le Lot 1 (D2) chaque création est aussi répercutée dans le modèle
-- unifié — voir src/server/ministry-repository.ts (bridgeVigilanceSignal,
-- bridgeFieldCommitment) : signal_id/situation_id et commitment_id/
-- coordination_id référencent mbambulaan_tenant_state.payload, pas des
-- clés étrangères SQL (le state opérationnel reste un blob JSONB).
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
  created_at timestamptz not null default now(),
  commitment_id text,
  coordination_id text
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
  updated_at timestamptz not null default now(),
  signal_id text,
  situation_id text
);

-- Lot 0 (refondation) : ajout de tenant_id pour préparer le multi-tenant réel
-- sans migration lourde ultérieure. Lot 1 (D2) : ajout des colonnes de
-- rattachement au modèle unifié. Pas d'effet sur les tables déjà créées par
-- ensureSchema() avant ces évolutions — ajouter en migration manuelle si une
-- base existante doit être alignée :
-- alter table mbambulaan_field_visits add column if not exists tenant_id text not null default 'tenant-demo';
-- alter table mbambulaan_vigilance_cases add column if not exists tenant_id text not null default 'tenant-demo';
-- alter table mbambulaan_field_visits add column if not exists commitment_id text;
-- alter table mbambulaan_field_visits add column if not exists coordination_id text;
-- alter table mbambulaan_vigilance_cases add column if not exists signal_id text;
-- alter table mbambulaan_vigilance_cases add column if not exists situation_id text;
