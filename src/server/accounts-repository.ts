import "server-only";

import postgres from "postgres";
import type { Role } from "@/domain/types";
import { hashPassword, verifyPassword } from "@/server/password";

// Comptes d'accès Produit — isolé du store métier (src/server/repository.ts)
// et du store Public (src/server/public-repository.ts), pour les mêmes
// raisons : un pool dédié, aucune table partagée.

export interface Account {
  id: string;
  tenantId: string;
  email: string;
  role: Role;
  actorId: string;
  organizationId: string | null;
  fullName: string;
  status: "active" | "suspendu";
  createdAt: string;
  lastLoginAt: string | null;
}

interface StoredAccount extends Account {
  passwordHash: string;
  failedAttempts: number;
  lockedUntil: string | null;
}

declare global {
  var mbambulaanAccounts: StoredAccount[] | undefined;
}

const memoryAccounts = globalThis.mbambulaanAccounts ?? [];
globalThis.mbambulaanAccounts = memoryAccounts;

let sql: ReturnType<typeof postgres> | undefined;

function database() {
  if (!process.env.DATABASE_URL) return undefined;
  sql ??= postgres(process.env.DATABASE_URL, {
    max: 2,
    ssl: process.env.NODE_ENV === "production" ? "require" : false
  });
  return sql;
}

let schemaEnsured = false;
async function ensureSchema() {
  const db = database();
  if (!db || schemaEnsured) return;
  await db`
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
    )
  `;
  schemaEnsured = true;
}

function toAccount(row: StoredAccount): Account {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    role: row.role,
    actorId: row.actorId,
    organizationId: row.organizationId,
    fullName: row.fullName,
    status: row.status,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt
  };
}

const MAX_ATTEMPTS = 8;
const LOCK_MINUTES = 15;

export async function createAccount(input: {
  email: string;
  password: string;
  role: Role;
  actorId: string;
  fullName: string;
  organizationId?: string;
  tenantId?: string;
}): Promise<Account> {
  const passwordHash = await hashPassword(input.password);
  const account: StoredAccount = {
    id: crypto.randomUUID(),
    tenantId: input.tenantId ?? "tenant-demo",
    email: input.email.trim().toLowerCase(),
    role: input.role,
    actorId: input.actorId,
    organizationId: input.organizationId ?? null,
    fullName: input.fullName,
    status: "active",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    passwordHash,
    failedAttempts: 0,
    lockedUntil: null
  };

  const db = database();
  if (!db) {
    memoryAccounts.push(account);
    return toAccount(account);
  }

  await ensureSchema();
  await db`
    insert into mbambulaan_accounts (
      id, tenant_id, email, password_hash, role, actor_id, organization_id, full_name, status, created_at
    ) values (
      ${account.id}, ${account.tenantId}, ${account.email}, ${account.passwordHash}, ${account.role},
      ${account.actorId}, ${account.organizationId}, ${account.fullName}, ${account.status}, ${account.createdAt}
    )
  `;
  return toAccount(account);
}

// En l'absence de base réelle (dev local, environnement de démonstration
// explicitement activé), on amorce un unique compte connu plutôt que de
// laisser l'espace Produit inaccessible. Ce compte n'existe jamais dès
// qu'une vraie base (DATABASE_URL) est configurée — voir `database()`.
function demoModeAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true";
}

let demoSeeded = false;
async function ensureDemoAccount() {
  if (database() || demoSeeded || !demoModeAllowed()) return;
  demoSeeded = true;
  const password = process.env.DEMO_ACCOUNT_PASSWORD ?? "demo-mbambulaan-2026";
  const passwordHash = await hashPassword(password);
  memoryAccounts.push(
    {
      id: "acc-demo-coordinateur",
      tenantId: "tenant-demo",
      email: "demo@mbambulaan.sn",
      role: "coordinateur",
      actorId: "act-coordinateur",
      organizationId: null,
      fullName: "Compte de démonstration",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      passwordHash,
      failedAttempts: 0,
      lockedUntil: null
    },
    {
      id: "acc-demo-ministere",
      tenantId: "tenant-demo",
      email: "ministere@mbambulaan.sn",
      role: "institution",
      actorId: "act-institution",
      organizationId: null,
      fullName: "Compte de démonstration — Ministère",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      passwordHash,
      failedAttempts: 0,
      lockedUntil: null
    }
  );
}

async function findStoredByEmail(email: string): Promise<StoredAccount | null> {
  const normalized = email.trim().toLowerCase();
  const db = database();
  if (!db) {
    await ensureDemoAccount();
    return memoryAccounts.find((account) => account.email === normalized) ?? null;
  }
  await ensureSchema();
  const rows = await db<Array<{
    id: string; tenant_id: string; email: string; password_hash: string; role: Role; actor_id: string;
    organization_id: string | null; full_name: string; status: "active" | "suspendu"; created_at: string;
    last_login_at: string | null; failed_attempts: number; locked_until: string | null;
  }>>`select * from mbambulaan_accounts where email = ${normalized} limit 1`;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id, tenantId: row.tenant_id, email: row.email, passwordHash: row.password_hash, role: row.role,
    actorId: row.actor_id, organizationId: row.organization_id, fullName: row.full_name, status: row.status,
    createdAt: row.created_at, lastLoginAt: row.last_login_at, failedAttempts: row.failed_attempts,
    lockedUntil: row.locked_until
  };
}

async function persist(account: StoredAccount) {
  const db = database();
  if (!db) {
    const index = memoryAccounts.findIndex((item) => item.id === account.id);
    if (index >= 0) memoryAccounts[index] = account;
    return;
  }
  await db`
    update mbambulaan_accounts set
      failed_attempts = ${account.failedAttempts},
      locked_until = ${account.lockedUntil},
      last_login_at = ${account.lastLoginAt}
    where id = ${account.id}
  `;
}

export type LoginFailure = "identifiants_invalides" | "compte_suspendu" | "compte_verrouille";

export async function verifyLogin(email: string, password: string): Promise<{ account: Account } | { error: LoginFailure }> {
  const stored = await findStoredByEmail(email);
  if (!stored) {
    // On exécute quand même un hachage pour ne pas révéler par le temps de
    // réponse qu'un compte n'existe pas.
    await verifyPassword(password, "scrypt:16384:8:1:00:00");
    return { error: "identifiants_invalides" };
  }

  if (stored.status === "suspendu") return { error: "compte_suspendu" };
  if (stored.lockedUntil && new Date(stored.lockedUntil).getTime() > Date.now()) {
    return { error: "compte_verrouille" };
  }

  const valid = await verifyPassword(password, stored.passwordHash);
  if (!valid) {
    stored.failedAttempts += 1;
    if (stored.failedAttempts >= MAX_ATTEMPTS) {
      stored.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
      stored.failedAttempts = 0;
    }
    await persist(stored);
    return { error: "identifiants_invalides" };
  }

  stored.failedAttempts = 0;
  stored.lockedUntil = null;
  stored.lastLoginAt = new Date().toISOString();
  await persist(stored);
  return { account: toAccount(stored) };
}

export async function listAccounts(tenantId = "tenant-demo"): Promise<Account[]> {
  const db = database();
  if (!db) {
    return memoryAccounts.filter((account) => account.tenantId === tenantId).map(toAccount);
  }
  await ensureSchema();
  const rows = await db<Array<{
    id: string; tenant_id: string; email: string; role: Role; actor_id: string; organization_id: string | null;
    full_name: string; status: "active" | "suspendu"; created_at: string; last_login_at: string | null;
  }>>`select id, tenant_id, email, role, actor_id, organization_id, full_name, status, created_at, last_login_at
      from mbambulaan_accounts where tenant_id = ${tenantId} order by created_at desc`;
  return rows.map((row) => ({
    id: row.id, tenantId: row.tenant_id, email: row.email, role: row.role, actorId: row.actor_id,
    organizationId: row.organization_id, fullName: row.full_name, status: row.status,
    createdAt: row.created_at, lastLoginAt: row.last_login_at
  }));
}

export async function setAccountStatus(id: string, status: Account["status"]): Promise<void> {
  const db = database();
  if (!db) {
    const account = memoryAccounts.find((item) => item.id === id);
    if (account) account.status = status;
    return;
  }
  await ensureSchema();
  await db`update mbambulaan_accounts set status = ${status} where id = ${id}`;
}

export function accountsPersistenceMode() {
  return process.env.DATABASE_URL ? "postgresql" : "memoire_locale_demo";
}
