-- Objets d'engagement du Public Mbàmbulaan (demandes et contributions réseau).
-- Isolés du store du Produit professionnel (mbambulaan_tenant_state) : aucune
-- dépendance croisée, aucun couplage avec le recadrage futur du Produit.

create table if not exists mbambulaan_public_requests (
  id text primary key,
  reference text not null,
  created_at timestamptz not null default now(),
  source text not null,
  context jsonb,
  intent text not null,
  category text,
  territory text,
  description text not null,
  actor_type text not null,
  organization text,
  contact_name text not null,
  phone text not null,
  email text,
  preferred_channel text not null,
  consent boolean not null default false,
  attachment_note text,
  status text not null default 'recue'
);

create index if not exists mbambulaan_public_requests_created_at_idx
  on mbambulaan_public_requests (created_at desc);

create table if not exists mbambulaan_public_contributions (
  id text primary key,
  reference text not null,
  created_at timestamptz not null default now(),
  actor_type text not null,
  services text not null,
  territories text not null,
  capacity text,
  organization text,
  contact_name text not null,
  phone text not null,
  email text,
  website text,
  notes text,
  status text not null default 'identifie'
);

create index if not exists mbambulaan_public_contributions_created_at_idx
  on mbambulaan_public_contributions (created_at desc);
