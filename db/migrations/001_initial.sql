create table if not exists mbambulaan_tenant_state (
  tenant_id text primary key,
  revision integer not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists mbambulaan_command_log (
  idempotency_key text primary key,
  tenant_id text not null,
  command_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists mbambulaan_outbox (
  event_id text primary key,
  tenant_id text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- Le snapshot JSONB rend la première version déployable et réversible.
-- Les frontières de domaine dans le code préparent l'extraction progressive
-- vers des tables relationnelles sans modifier les contrats de commande.
