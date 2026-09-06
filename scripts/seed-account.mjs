#!/usr/bin/env node
// Crée ou met à jour un compte d'accès Produit (mbambulaan_accounts) dans la
// base réelle (DATABASE_URL). Autonome : ne dépend pas de src/ pour rester
// exécutable même hors du build Next.js.
//
// Usage :
//   DATABASE_URL=postgres://... node scripts/seed-account.mjs \
//     --email=ministere@mbambulaan.sn --password="…" --role=institution \
//     --name="Cabinet du Ministre" [--actor-id=act-ministere] [--organization-id=org-ministere]
//
// Rôles valides : administrateur, coordinateur, institution, operateur,
// capitaine, mareyeur, transformateur, prestataire, gestionnaire_organisation,
// partenaire.

import postgres from "postgres";
import { randomBytes, scrypt, randomUUID } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const N = 16384, r = 8, p = 1, KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

function parseArgs() {
  const args = {};
  for (const raw of process.argv.slice(2)) {
    const match = raw.match(/^--([\w-]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

const VALID_ROLES = [
  "administrateur", "coordinateur", "institution", "operateur", "capitaine",
  "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "partenaire"
];

async function main() {
  const args = parseArgs();
  const email = args.email?.trim().toLowerCase();
  const password = args.password;
  const role = args.role;
  const fullName = args.name ?? email;
  const actorId = args["actor-id"] ?? `act-${randomUUID().slice(0, 8)}`;
  const organizationId = args["organization-id"] ?? null;

  if (!email || !password || !role) {
    console.error("Usage : node scripts/seed-account.mjs --email=... --password=... --role=... --name=\"...\"");
    process.exit(1);
  }
  if (!VALID_ROLES.includes(role)) {
    console.error(`Rôle invalide « ${role} ». Valeurs possibles : ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Le mot de passe doit contenir au moins 10 caractères.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL manquant : ce script écrit uniquement dans la base réelle.");
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    ssl: process.env.NODE_ENV === "production" ? "require" : false
  });

  await sql`
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

  const passwordHash = await hashPassword(password);
  const id = randomUUID();

  await sql`
    insert into mbambulaan_accounts (id, email, password_hash, role, actor_id, organization_id, full_name)
    values (${id}, ${email}, ${passwordHash}, ${role}, ${actorId}, ${organizationId}, ${fullName})
    on conflict (email) do update set
      password_hash = excluded.password_hash,
      role = excluded.role,
      actor_id = excluded.actor_id,
      organization_id = excluded.organization_id,
      full_name = excluded.full_name,
      status = 'active',
      failed_attempts = 0,
      locked_until = null
  `;

  console.log(`Compte prêt : ${email} (rôle ${role}, actorId ${actorId}).`);
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
