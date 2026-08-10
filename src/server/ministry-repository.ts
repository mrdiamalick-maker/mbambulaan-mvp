import "server-only";

import postgres from "postgres";
import type { FieldVisit, FieldVisitInput, FieldVisitStatus } from "@/domain/ministry/field-visit";
import type { VigilanceCase, VigilanceCaseInput, VigilanceStatus } from "@/domain/ministry/vigilance";

// Persistance de l'espace Ministère (rencontres terrain, vigilance),
// isolée du store opérationnel (situations/pirogues/lots) : ce ne sont pas
// des processus de la filière mais l'activité propre du ministère.

declare global {
  var mbambulaanFieldVisits: FieldVisit[] | undefined;
  var mbambulaanVigilanceCases: VigilanceCase[] | undefined;
}

const memoryVisits = globalThis.mbambulaanFieldVisits ?? [];
globalThis.mbambulaanFieldVisits = memoryVisits;

const memoryVigilance = globalThis.mbambulaanVigilanceCases ?? [];
globalThis.mbambulaanVigilanceCases = memoryVigilance;

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
    )
  `;
  await db`
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
    )
  `;
  schemaEnsured = true;
}

export async function createFieldVisit(input: FieldVisitInput): Promise<FieldVisit> {
  const visit: FieldVisit = { ...input, id: crypto.randomUUID(), status: "planifiee", createdAt: new Date().toISOString() };
  const db = database();
  if (!db) {
    memoryVisits.unshift(visit);
    return visit;
  }
  await ensureSchema();
  await db`
    insert into mbambulaan_field_visits (
      id, title, territory_id, territory_label, objective, planned_at, notes, status, created_by_actor_id, created_by_name, created_at
    ) values (
      ${visit.id}, ${visit.title}, ${visit.territoryId}, ${visit.territoryLabel}, ${visit.objective}, ${visit.plannedAt},
      ${visit.notes ?? null}, ${visit.status}, ${visit.createdByActorId}, ${visit.createdByName}, ${visit.createdAt}
    )
  `;
  return visit;
}

export async function listFieldVisits(): Promise<FieldVisit[]> {
  const db = database();
  if (!db) return [...memoryVisits].sort((a, b) => a.plannedAt.localeCompare(b.plannedAt));
  await ensureSchema();
  const rows = await db<Array<{
    id: string; title: string; territory_id: string; territory_label: string; objective: FieldVisit["objective"];
    planned_at: string; notes: string | null; status: FieldVisitStatus; created_by_actor_id: string; created_by_name: string; created_at: string;
  }>>`select * from mbambulaan_field_visits order by planned_at asc`;
  return rows.map((row) => ({
    id: row.id, title: row.title, territoryId: row.territory_id, territoryLabel: row.territory_label,
    objective: row.objective, plannedAt: row.planned_at, notes: row.notes ?? undefined, status: row.status,
    createdByActorId: row.created_by_actor_id, createdByName: row.created_by_name, createdAt: row.created_at
  }));
}

export async function createVigilanceCase(input: VigilanceCaseInput): Promise<VigilanceCase> {
  const now = new Date().toISOString();
  const item: VigilanceCase = { ...input, id: crypto.randomUUID(), status: "signale", createdAt: now, updatedAt: now };
  const db = database();
  if (!db) {
    memoryVigilance.unshift(item);
    return item;
  }
  await ensureSchema();
  await db`
    insert into mbambulaan_vigilance_cases (
      id, category, territory_id, territory_label, severity, description, status,
      reported_by_actor_id, reported_by_name, created_at, updated_at
    ) values (
      ${item.id}, ${item.category}, ${item.territoryId}, ${item.territoryLabel}, ${item.severity}, ${item.description},
      ${item.status}, ${item.reportedByActorId}, ${item.reportedByName}, ${item.createdAt}, ${item.updatedAt}
    )
  `;
  return item;
}

export async function listVigilanceCases(): Promise<VigilanceCase[]> {
  const db = database();
  if (!db) return [...memoryVigilance].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  await ensureSchema();
  const rows = await db<Array<{
    id: string; category: VigilanceCase["category"]; territory_id: string; territory_label: string;
    severity: VigilanceCase["severity"]; description: string; status: VigilanceStatus;
    reported_by_actor_id: string; reported_by_name: string; created_at: string; updated_at: string;
  }>>`select * from mbambulaan_vigilance_cases order by created_at desc`;
  return rows.map((row) => ({
    id: row.id, category: row.category, territoryId: row.territory_id, territoryLabel: row.territory_label,
    severity: row.severity, description: row.description, status: row.status,
    reportedByActorId: row.reported_by_actor_id, reportedByName: row.reported_by_name,
    createdAt: row.created_at, updatedAt: row.updated_at
  }));
}

export async function updateVigilanceStatus(id: string, status: VigilanceStatus): Promise<void> {
  const db = database();
  if (!db) {
    const item = memoryVigilance.find((entry) => entry.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
    }
    return;
  }
  await ensureSchema();
  await db`update mbambulaan_vigilance_cases set status = ${status}, updated_at = now() where id = ${id}`;
}

export function ministryPersistenceMode() {
  return process.env.DATABASE_URL ? "postgresql" : "memoire_locale_demo";
}
