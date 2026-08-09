create table if not exists security_identities (
  id text primary key,
  external_subject text unique,
  phone_number_hash text,
  email_hash text,
  identity_type text not null check (identity_type in ('person','service_account')),
  verification_level text not null,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists organization_memberships (
  id text primary key,
  identity_id text not null references security_identities(id),
  organization_id text not null,
  territory_ids text[] not null default '{}',
  status text not null,
  valid_from timestamptz not null,
  valid_until timestamptz,
  created_at timestamptz not null
);
create index if not exists organization_memberships_identity_idx on organization_memberships(identity_id, status);

create table if not exists permission_grants (
  id text primary key,
  identity_id text not null references security_identities(id),
  organization_id text,
  role_code text not null,
  permission_codes text[] not null default '{}',
  territory_ids text[] not null default '{}',
  scope_type text not null,
  scope_id text,
  valid_from timestamptz not null,
  valid_until timestamptz,
  status text not null,
  granted_by_identity_id text not null references security_identities(id)
);
create index if not exists permission_grants_identity_scope_idx on permission_grants(identity_id, status, scope_type);
create index if not exists permission_grants_territories_gin_idx on permission_grants using gin(territory_ids);
create index if not exists permission_grants_permissions_gin_idx on permission_grants using gin(permission_codes);

create table if not exists security_delegations (
  id text primary key,
  delegator_identity_id text not null references security_identities(id),
  delegate_identity_id text not null references security_identities(id),
  permission_codes text[] not null default '{}',
  territory_ids text[] not null default '{}',
  scope_type text not null,
  scope_id text,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  maximum_amount_xof numeric(20,2),
  allowed_action_types text[] not null default '{}',
  requires_dual_approval boolean not null default false,
  status text not null,
  evidence_ids text[] not null default '{}'
);
create index if not exists security_delegations_delegate_idx on security_delegations(delegate_identity_id, status, valid_until);

create table if not exists security_sessions (
  id text primary key,
  identity_id text not null references security_identities(id),
  token_hash text not null unique,
  authentication_level text not null,
  factors text[] not null default '{}',
  organization_id text,
  selected_territory_ids text[] not null default '{}',
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null,
  revoked_at timestamptz,
  status text not null,
  device_id_hash text,
  ip_address_hash text
);
create index if not exists security_sessions_identity_idx on security_sessions(identity_id, status, expires_at);

create table if not exists security_audit_events (
  id text primary key,
  identity_id text,
  session_id text,
  event_type text not null,
  action_type text,
  resource_type text,
  resource_id text,
  territory_ids text[] not null default '{}',
  reasons text[] not null default '{}',
  correlation_id text,
  occurred_at timestamptz not null
);
create index if not exists security_audit_events_identity_time_idx on security_audit_events(identity_id, occurred_at desc);
create index if not exists security_audit_events_correlation_idx on security_audit_events(correlation_id);
