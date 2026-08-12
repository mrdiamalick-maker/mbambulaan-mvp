import "server-only";

import postgres from "postgres";
import type { PublicRequest, PublicRequestInput } from "@/domain/public/request";
import type { PublicContribution, PublicContributionInput } from "@/domain/public/contribution";

// Persistance des demandes et contributions publiques, volontairement isolée
// du store du Produit professionnel (src/server/repository.ts). Aucune table
// ni aucune dépendance n'est partagée : le Public doit pouvoir évoluer et
// être livré sans dépendre du recadrage futur du Produit.

declare global {
  var mbambulaanPublicRequests: PublicRequest[] | undefined;
  var mbambulaanPublicContributions: PublicContribution[] | undefined;
}

const memoryRequests = globalThis.mbambulaanPublicRequests ?? [];
globalThis.mbambulaanPublicRequests = memoryRequests;

const memoryContributions = globalThis.mbambulaanPublicContributions ?? [];
globalThis.mbambulaanPublicContributions = memoryContributions;

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
    )
  `;
  await db`
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
    )
  `;
  schemaEnsured = true;
}

function makeReference(prefix: "REQ" | "CTB") {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `MBA-${prefix}-${year}-${suffix}`;
}

export async function createPublicRequest(input: PublicRequestInput): Promise<PublicRequest> {
  const request: PublicRequest = {
    ...input,
    id: crypto.randomUUID(),
    reference: makeReference("REQ"),
    status: "recue",
    createdAt: new Date().toISOString()
  };

  const db = database();
  if (!db) {
    memoryRequests.unshift(request);
    return request;
  }

  await ensureSchema();
  await db`
    insert into mbambulaan_public_requests (
      id, reference, created_at, source, context, intent, category, territory,
      description, actor_type, organization, contact_name, phone, email,
      preferred_channel, consent, attachment_note, status
    ) values (
      ${request.id}, ${request.reference}, ${request.createdAt}, ${request.source},
      ${request.context ? db.json(request.context as never) : null}, ${request.intent},
      ${request.category ?? null}, ${request.territory ?? null}, ${request.description},
      ${request.actorType}, ${request.organization ?? null}, ${request.contactName},
      ${request.phone}, ${request.email ?? null}, ${request.preferredChannel},
      ${request.consent}, ${request.attachmentNote ?? null}, ${request.status}
    )
  `;
  return request;
}

export async function createPublicContribution(input: PublicContributionInput): Promise<PublicContribution> {
  const contribution: PublicContribution = {
    ...input,
    id: crypto.randomUUID(),
    reference: makeReference("CTB"),
    status: "identifie",
    createdAt: new Date().toISOString()
  };

  const db = database();
  if (!db) {
    memoryContributions.unshift(contribution);
    return contribution;
  }

  await ensureSchema();
  await db`
    insert into mbambulaan_public_contributions (
      id, reference, created_at, actor_type, services, territories, capacity,
      organization, contact_name, phone, email, website, notes, status
    ) values (
      ${contribution.id}, ${contribution.reference}, ${contribution.createdAt},
      ${contribution.actorType}, ${contribution.services}, ${contribution.territories},
      ${contribution.capacity ?? null}, ${contribution.organization ?? null},
      ${contribution.contactName}, ${contribution.phone}, ${contribution.email ?? null},
      ${contribution.website ?? null}, ${contribution.notes ?? null}, ${contribution.status}
    )
  `;
  return contribution;
}

// Lecture des demandes publiques en attente — la seule qui existait avant
// ce pont était l'écriture (createPublicRequest) : aucune fonction de
// lecture n'existait nulle part dans le repo, la conséquence directe
// étant qu'une PublicRequest était écrite puis jamais relue par personne
// (constat vérifié, gap analysis du 2026-08-12). Lecture seule, jamais
// d'écriture depuis le Produit vers ce store en dehors des deux fonctions
// ci-dessous — le Produit lit le Public, il ne le pilote pas (A17).
export async function getPendingPublicRequests(): Promise<PublicRequest[]> {
  const db = database();
  if (!db) {
    return memoryRequests.filter((item) => item.status === "recue");
  }

  await ensureSchema();
  const rows = await db<PublicRequest[]>`
    select
      id, reference, created_at as "createdAt", source, context, intent, category, territory,
      description, actor_type as "actorType", organization, contact_name as "contactName",
      phone, email, preferred_channel as "preferredChannel", consent,
      attachment_note as "attachmentNote", status
    from mbambulaan_public_requests
    where status = 'recue'
    order by created_at desc
  `;
  return rows;
}

// Transition de statut déclenchée par la conversion en ServiceRequest côté
// Produit (CoordinationWorkspace.tsx) — réutilise le cycle de statut déjà
// modélisé pour PublicRequest (request.ts : recue → en_etude → ...) plutôt
// que d'ajouter un nouveau champ de liaison : une fois "en_etude", la
// demande sort naturellement de getPendingPublicRequests() ci-dessus, pas
// de risque de conversion en double.
export async function markPublicRequestInStudy(id: string): Promise<void> {
  const db = database();
  if (!db) {
    const request = memoryRequests.find((item) => item.id === id);
    if (request) request.status = "en_etude";
    return;
  }

  await ensureSchema();
  await db`update mbambulaan_public_requests set status = 'en_etude' where id = ${id}`;
}

export function publicPersistenceMode() {
  return process.env.DATABASE_URL ? "postgresql" : "memoire_locale_demo";
}
