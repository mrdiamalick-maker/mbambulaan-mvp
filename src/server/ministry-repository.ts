import "server-only";

import postgres from "postgres";
import { fieldVisitObjectiveLabels, type FieldVisit, type FieldVisitInput, type FieldVisitStatus } from "@/domain/ministry/field-visit";
import { vigilanceCategoryLabels, type VigilanceCase, type VigilanceCaseInput, type VigilanceStatus } from "@/domain/ministry/vigilance";
import { dispatch } from "@/server/repository";

// Persistance de l'espace Ministère (rencontres terrain, vigilance) : le
// vocabulaire et le cycle de vie restent propres au ministère (statuts,
// catégories, gravité — pas de forçage dans la machine à états de
// Situation). Depuis le Lot 1 (D2), chaque création est aussi répercutée
// dans le modèle unifié (Signal/Situation pour la vigilance, Commitment
// pour une mission terrain) via bridgeVigilanceSignal/bridgeFieldCommitment
// ci-dessous — ce n'est donc plus un silo déconnecté du reste du Produit,
// même si son propre enregistrement (table dédiée) est conservé comme
// source de vérité pour l'écran Espace État.

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
    )
  `;
  await db`
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
    )
  `;
  schemaEnsured = true;
}

// D2 — un cas de vigilance devient un Signal/Situation (catégorie sécurité)
// dans le modèle unifié. Best-effort : si le bridge échoue (ex. base
// indisponible), le signalement ministère reste créé — sa table dédiée
// reste la source de vérité pour l'écran Espace État, le lien vers le
// modèle unifié est un enrichissement, pas une dépendance bloquante.
async function bridgeVigilanceSignal(input: VigilanceCaseInput): Promise<{ signalId?: string; situationId?: string }> {
  try {
    const next = await dispatch(
      // LOT 0.1 : create_signal ne crée plus qu'un Signal — ce bridge
      // exprime réellement l'intention d'ouvrir un dossier tout de suite
      // (signal_id/situation_id sont tous deux persistés côté table
      // vigilance ci-dessous), wrapper legacy documenté (mandat §5)
      // plutôt que découplé silencieusement.
      {
        type: "report_signal_and_open_situation",
        actorId: input.reportedByActorId,
        territoryId: input.territoryId,
        title: `Vigilance — ${vigilanceCategoryLabels[input.category]}`,
        description: input.description,
        channel: "telephone"
      },
      crypto.randomUUID()
    );
    const situation = next.situations[0];
    return { signalId: situation.signalIds[0], situationId: situation.id };
  } catch (error) {
    console.warn("bridgeVigilanceSignal: échec de la répercussion dans le modèle unifié", error);
    return {};
  }
}

// D2 — une mission terrain devient un Commitment réel, porté par une
// coordination dédiée du modèle unifié. Même logique best-effort que
// bridgeVigilanceSignal ci-dessus.
async function bridgeFieldCommitment(input: FieldVisitInput): Promise<{ commitmentId?: string; coordinationId?: string }> {
  try {
    const next = await dispatch(
      {
        type: "plan_field_commitment",
        actorId: input.createdByActorId,
        territoryId: input.territoryId,
        title: input.title,
        objective: fieldVisitObjectiveLabels[input.objective],
        dueAt: input.plannedAt,
        notes: input.notes
      },
      crypto.randomUUID()
    );
    const coordination = next.coordinationSpaces[0];
    return { coordinationId: coordination.id, commitmentId: coordination.commitments[0]?.id };
  } catch (error) {
    console.warn("bridgeFieldCommitment: échec de la répercussion dans le modèle unifié", error);
    return {};
  }
}

export async function createFieldVisit(input: FieldVisitInput): Promise<FieldVisit> {
  const bridge = await bridgeFieldCommitment(input);
  const visit: FieldVisit = {
    ...input,
    tenantId: input.tenantId ?? "tenant-demo",
    id: crypto.randomUUID(),
    status: "planifiee",
    createdAt: new Date().toISOString(),
    commitmentId: bridge.commitmentId,
    coordinationId: bridge.coordinationId
  };
  const db = database();
  if (!db) {
    memoryVisits.unshift(visit);
    return visit;
  }
  await ensureSchema();
  await db`
    insert into mbambulaan_field_visits (
      id, tenant_id, title, territory_id, territory_label, objective, planned_at, notes, status, created_by_actor_id, created_by_name, created_at, commitment_id, coordination_id
    ) values (
      ${visit.id}, ${visit.tenantId ?? "tenant-demo"}, ${visit.title}, ${visit.territoryId}, ${visit.territoryLabel}, ${visit.objective}, ${visit.plannedAt},
      ${visit.notes ?? null}, ${visit.status}, ${visit.createdByActorId}, ${visit.createdByName}, ${visit.createdAt}, ${visit.commitmentId ?? null}, ${visit.coordinationId ?? null}
    )
  `;
  return visit;
}

export async function listFieldVisits(): Promise<FieldVisit[]> {
  const db = database();
  if (!db) return [...memoryVisits].sort((a, b) => a.plannedAt.localeCompare(b.plannedAt));
  await ensureSchema();
  const rows = await db<Array<{
    id: string; tenant_id: string; title: string; territory_id: string; territory_label: string; objective: FieldVisit["objective"];
    planned_at: string; notes: string | null; status: FieldVisitStatus; created_by_actor_id: string; created_by_name: string; created_at: string;
    commitment_id: string | null; coordination_id: string | null;
  }>>`select * from mbambulaan_field_visits order by planned_at asc`;
  return rows.map((row) => ({
    id: row.id, tenantId: row.tenant_id, title: row.title, territoryId: row.territory_id, territoryLabel: row.territory_label,
    objective: row.objective, plannedAt: row.planned_at, notes: row.notes ?? undefined, status: row.status,
    createdByActorId: row.created_by_actor_id, createdByName: row.created_by_name, createdAt: row.created_at,
    commitmentId: row.commitment_id ?? undefined, coordinationId: row.coordination_id ?? undefined
  }));
}

export async function createVigilanceCase(input: VigilanceCaseInput): Promise<VigilanceCase> {
  const now = new Date().toISOString();
  const bridge = await bridgeVigilanceSignal(input);
  const item: VigilanceCase = {
    ...input,
    tenantId: input.tenantId ?? "tenant-demo",
    id: crypto.randomUUID(),
    status: "signale",
    createdAt: now,
    updatedAt: now,
    signalId: bridge.signalId,
    situationId: bridge.situationId
  };
  const db = database();
  if (!db) {
    memoryVigilance.unshift(item);
    return item;
  }
  await ensureSchema();
  await db`
    insert into mbambulaan_vigilance_cases (
      id, tenant_id, category, territory_id, territory_label, severity, description, status,
      reported_by_actor_id, reported_by_name, created_at, updated_at, signal_id, situation_id
    ) values (
      ${item.id}, ${item.tenantId ?? "tenant-demo"}, ${item.category}, ${item.territoryId}, ${item.territoryLabel}, ${item.severity}, ${item.description},
      ${item.status}, ${item.reportedByActorId}, ${item.reportedByName}, ${item.createdAt}, ${item.updatedAt}, ${item.signalId ?? null}, ${item.situationId ?? null}
    )
  `;
  return item;
}

export async function listVigilanceCases(): Promise<VigilanceCase[]> {
  const db = database();
  if (!db) return [...memoryVigilance].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  await ensureSchema();
  const rows = await db<Array<{
    id: string; tenant_id: string; category: VigilanceCase["category"]; territory_id: string; territory_label: string;
    severity: VigilanceCase["severity"]; description: string; status: VigilanceStatus;
    reported_by_actor_id: string; reported_by_name: string; created_at: string; updated_at: string;
    signal_id: string | null; situation_id: string | null;
  }>>`select * from mbambulaan_vigilance_cases order by created_at desc`;
  return rows.map((row) => ({
    id: row.id, tenantId: row.tenant_id, category: row.category, territoryId: row.territory_id, territoryLabel: row.territory_label,
    severity: row.severity, description: row.description, status: row.status,
    reportedByActorId: row.reported_by_actor_id, reportedByName: row.reported_by_name,
    createdAt: row.created_at, updatedAt: row.updated_at,
    signalId: row.signal_id ?? undefined, situationId: row.situation_id ?? undefined
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
