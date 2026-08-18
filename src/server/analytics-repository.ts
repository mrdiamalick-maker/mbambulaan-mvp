import "server-only";

import postgres from "postgres";
import type { PublicAnalyticsInput } from "@/domain/public/analytics";

// Persistance des événements analytics Public, isolée du store du Produit
// professionnel et des tables de demandes/contributions. Un enregistrement
// simple, jamais nominatif.

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
    create table if not exists mbambulaan_public_events (
      id text primary key,
      created_at timestamptz not null default now(),
      event text not null,
      path text,
      properties jsonb
    )
  `;
  await db`create index if not exists mbambulaan_public_events_event_idx on mbambulaan_public_events (event, created_at desc)`;
  schemaEnsured = true;
}

export async function recordPublicEvent(input: PublicAnalyticsInput) {
  const db = database();
  // En l'absence de base (mode démonstration locale), on se contente de
  // journaliser : la mesure des parcours n'est pas critique au fonctionnement.
  if (!db) {
    if (process.env.NODE_ENV !== "production") console.debug("[analytics]", input.event, input.path, input.properties);
    return;
  }
  await ensureSchema();
  await db`
    insert into mbambulaan_public_events (id, event, path, properties)
    values (${crypto.randomUUID()}, ${input.event}, ${input.path ?? null}, ${input.properties ? db.json(input.properties as never) : null})
  `;
}
