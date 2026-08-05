import "server-only";

import postgres from "postgres";
import { createDemoState } from "@/data/demo-state";
import type { MbambulaanEvent } from "@/domain/events";
import type { Command, ProductState } from "@/domain/types";
import { applyCommand } from "@/domain/rules";
import { applyEvent } from "@/runtime/event-engine";

declare global {
  var mbambulaanState: ProductState | undefined;
  var mbambulaanCommands: Set<string> | undefined;
  var mbambulaanEvents: Set<string> | undefined;
}

const memoryCommands = globalThis.mbambulaanCommands ?? new Set<string>();
globalThis.mbambulaanCommands = memoryCommands;

const memoryEvents = globalThis.mbambulaanEvents ?? new Set<string>();
globalThis.mbambulaanEvents = memoryEvents;

let sql: ReturnType<typeof postgres> | undefined;

function database() {
  if (!process.env.DATABASE_URL) return undefined;
  sql ??= postgres(process.env.DATABASE_URL, {
    max: 4,
    ssl: process.env.NODE_ENV === "production" ? "require" : false
  });
  return sql;
}

async function ensureSchema() {
  const db = database();
  if (!db) return;
  await db`
    create table if not exists mbambulaan_tenant_state (
      tenant_id text primary key,
      revision integer not null,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
  await db`
    create table if not exists mbambulaan_command_log (
      idempotency_key text primary key,
      tenant_id text not null,
      command_type text not null,
      created_at timestamptz not null default now()
    )
  `;
  await db`
    create table if not exists mbambulaan_outbox (
      event_id text primary key,
      tenant_id text not null,
      event_type text not null,
      payload jsonb not null,
      created_at timestamptz not null default now(),
      published_at timestamptz
    )
  `;
}

export async function getState(): Promise<ProductState> {
  const db = database();
  if (!db) {
    globalThis.mbambulaanState ??= createDemoState();
    return structuredClone(globalThis.mbambulaanState);
  }

  await ensureSchema();
  const rows = await db<{ payload: ProductState }[]>`
    select payload from mbambulaan_tenant_state where tenant_id = 'tenant-demo'
  `;
  if (rows[0]) return rows[0].payload;

  const initial = createDemoState();
  const payload = JSON.parse(JSON.stringify(initial)) as never;
  await db`
    insert into mbambulaan_tenant_state (tenant_id, revision, payload)
    values (${initial.tenant.id}, ${initial.revision}, ${db.json(payload)})
  `;
  return initial;
}

async function saveState(state: ProductState) {
  const db = database();
  if (!db) {
    globalThis.mbambulaanState = structuredClone(state);
    return;
  }
  const payload = JSON.parse(JSON.stringify(state)) as never;
  await db`
    insert into mbambulaan_tenant_state (tenant_id, revision, payload, updated_at)
    values (${state.tenant.id}, ${state.revision}, ${db.json(payload)}, now())
    on conflict (tenant_id) do update
      set revision = excluded.revision, payload = excluded.payload, updated_at = now()
  `;
}

async function writeOutbox(eventId: string, eventType: string, payload: unknown) {
  const db = database();
  if (!db) return;
  const eventPayload = JSON.parse(JSON.stringify(payload)) as never;
  await db`
    insert into mbambulaan_outbox (event_id, tenant_id, event_type, payload)
    values (${eventId}, 'tenant-demo', ${eventType}, ${db.json(eventPayload)})
    on conflict do nothing
  `;
}

export async function dispatch(command: Command, idempotencyKey: string) {
  const db = database();
  if (db) {
    await ensureSchema();
    const inserted = await db`
      insert into mbambulaan_command_log (idempotency_key, tenant_id, command_type)
      values (${idempotencyKey}, 'tenant-demo', ${command.type})
      on conflict do nothing
      returning idempotency_key
    `;
    if (!inserted.length) return getState();
    await writeOutbox(crypto.randomUUID(), `command.${command.type}`, command);
  } else {
    if (memoryCommands.has(idempotencyKey)) return getState();
    memoryCommands.add(idempotencyKey);
  }

  if (command.type === "reset_demo") {
    const initial = createDemoState();
    await saveState(initial);
    return initial;
  }
  const next = applyCommand(await getState(), command);
  await saveState(next);
  return next;
}

export async function dispatchEvent(event: MbambulaanEvent) {
  const db = database();
  const idempotencyKey = `event:${event.id}`;

  if (db) {
    await ensureSchema();
    const inserted = await db`
      insert into mbambulaan_command_log (idempotency_key, tenant_id, command_type)
      values (${idempotencyKey}, 'tenant-demo', ${`event.${event.type}`})
      on conflict do nothing
      returning idempotency_key
    `;
    if (!inserted.length) return getState();
    await writeOutbox(event.id, `event.${event.type}`, event);
  } else {
    if (memoryEvents.has(idempotencyKey)) return getState();
    memoryEvents.add(idempotencyKey);
  }

  const next = applyEvent(await getState(), event);
  await saveState(next);
  return next;
}

export function persistenceMode() {
  return process.env.DATABASE_URL ? "postgresql" : "memoire_locale_demo";
}
