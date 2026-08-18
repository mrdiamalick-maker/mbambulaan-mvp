-- Comptes d'accès à l'espace Produit (app.mbambulaan.sn).
-- Remplace l'ancien bypass de démonstration (/api/demo/session, OTP à code
-- fixe) par une authentification réelle e-mail + mot de passe.
create table if not exists mbambulaan_accounts (
  id text primary key,
  tenant_id text not null default 'tenant-demo',
  email text not null unique,
  password_hash text not null,
  role text not null,
  actor_id text not null,
  organization_id text,
  full_name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  failed_attempts integer not null default 0,
  locked_until timestamptz
);

create index if not exists mbambulaan_accounts_tenant_idx on mbambulaan_accounts (tenant_id);
