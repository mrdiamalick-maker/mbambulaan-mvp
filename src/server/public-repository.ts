import "server-only";

import postgres from "postgres";
import type { PublicRequest, PublicRequestInput } from "@/domain/public/request";
import type { PublicContribution, PublicContributionInput } from "@/domain/public/contribution";
import { dispatch, getState } from "@/server/repository";
import { attemptPublicRequestSignalSync } from "@/domain/public-request-signal-bridge";
import { attemptPublicContributionSignalSync } from "@/domain/public-contribution-signal-bridge";

// Persistance des demandes et contributions publiques, volontairement isolée
// du store du Produit professionnel (src/server/repository.ts). Aucune table
// ni aucune dépendance n'est partagée : le Public doit pouvoir évoluer et
// être livré sans dépendre du recadrage futur du Produit.
//
// LOT 0.4 (mandat "aligner le Core métier avec le Blueprint V1") : cette
// isolation de persistance reste inchangée (la table mbambulaan_public_requests
// demeure la source de vérité pour le Public), mais chaque nouvelle
// PublicRequest alimente désormais aussi le Core sous forme d'un Signal
// entrant — cf. bridgePublicRequestSignal ci-dessous.
//
// Correction Product Review (LOT 0, 2026-09-01) : "toute demande reçue sur
// le site Public est un Signal entrant vers Mbàmbulaan" est une décision
// produit ferme, pas un best-effort qui peut silencieusement perdre la
// convergence. La tentative de pont reste immédiate et best-effort (un
// échec ne doit jamais faire perdre la PublicRequest elle-même, ni
// bloquer sa création), mais son résultat est désormais tracé sur la
// PublicRequest (coreSignalStatus/coreSignalId, cf. domain/public/request.ts)
// plutôt que jeté — "pending" reste détectable (getUnsyncedPublicRequests)
// et rejouable (syncPendingPublicRequestSignals), jusqu'à convergence
// réelle. Idempotent par construction : la clé de dispatch dérive de
// l'id de la PublicRequest, un rejeu ne peut jamais dupliquer le Signal.
// Pas de nouvelle table ni d'architecture de persistance : 2 colonnes
// ajoutées à la table existante, même discipline best-effort que
// bridgeVigilanceSignal (src/server/ministry-repository.ts) côté Ministry
// — hors périmètre de cette correction, explicitement.

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
      status text not null default 'recue',
      core_signal_status text not null default 'pending',
      core_signal_id text
    )
  `;
  // Correction Product Review (LOT 0, 2026-09-01) : ADD COLUMN IF NOT
  // EXISTS pour une table déjà déployée avant cette correction — le
  // "create table if not exists" ci-dessus ne touche pas une table
  // existante. Pas une migration générale, 2 colonnes additives.
  await db`alter table mbambulaan_public_requests add column if not exists core_signal_status text not null default 'pending'`;
  await db`alter table mbambulaan_public_requests add column if not exists core_signal_id text`;
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
      status text not null default 'identifie',
      core_signal_status text not null default 'pending',
      core_signal_id text
    )
  `;
  // LOT 6 (§13/§14, "fermer le follow-up laissé par LOT 0") : 2 colonnes
  // additives sur une table déjà déployée — même discipline que les 2
  // colonnes équivalentes de mbambulaan_public_requests ci-dessus.
  await db`alter table mbambulaan_public_contributions add column if not exists core_signal_status text not null default 'pending'`;
  await db`alter table mbambulaan_public_contributions add column if not exists core_signal_id text`;
  schemaEnsured = true;
}

function makeReference(prefix: "REQ" | "CTB") {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `MBA-${prefix}-${year}-${suffix}`;
}

// bridgePublicRequestSignal (LOT 0.4, mandat "Public Request → Core
// Signal") : tentative de pont — Signal seul (create_signal, découplé de
// Situation par LOT 0.1) — "PublicRequest → Signal ne doit PAS produire
// automatiquement une Situation. Elle entre dans le pipeline : Signal — à
// qualifier." Idempotence : la clé de dispatch est dérivée de l'id de la
// PublicRequest elle-même — un rejeu sur cette même requête (retry manuel
// ou syncPendingPublicRequestSignals ci-dessous) ne peut jamais produire
// un second Signal. Logique de résolution (canal, territoire) extraite
// dans src/domain/public-request-signal-bridge.ts, sans "server-only" —
// unitairement testable, contrairement à ce fichier.
//
// Ne lève jamais : l'appelant (persistPublicRequestSignalResult) décide
// quoi faire du résultat (synced si signalId présent, sinon reste
// "pending" — jamais un échec qui remonte jusqu'à createPublicRequest et
// ferait perdre la demande elle-même).
// Enveloppe fine autour de attemptPublicRequestSignalSync
// (src/domain/public-request-signal-bridge.ts, sans "server-only") : la
// logique de convergence elle-même (canal/territoire, clé d'idempotence,
// lecture du signal résultant) y est unitairement testée avec des
// doubles de getState/dispatch (tests/public-request-signal.test.ts) —
// ce fichier ne fait qu'y injecter les vraies getState/dispatch.
async function bridgePublicRequestSignal(request: PublicRequest): Promise<{ signalId?: string; notApplicable?: boolean }> {
  const result = await attemptPublicRequestSignalSync(request, { getState, dispatch });
  if (!result.signalId && !result.notApplicable) {
    console.warn(`bridgePublicRequestSignal: convergence Core non confirmée pour la PublicRequest ${request.id} — reste "pending", rejouable.`);
  }
  return result;
}

// persistPublicRequestSignalResult (Correction Product Review, LOT 0,
// 2026-09-01) : trace le résultat du pont sur la PublicRequest elle-même
// — "synced" + coreSignalId si un Signal a été confirmé créé, sinon reste
// "pending" (détectable, rejouable). Écrit dans le même store que
// createPublicRequest/markPublicRequestInStudy (mémoire ou Postgres selon
// l'environnement), jamais dans le store du Core.
// LOT 6 (§13) — troisième issue possible : `notApplicable` (demande non
// métier, jamais mise en file d'attente) s'écrit "not_applicable", jamais
// "pending" (qui resterait indéfiniment rejouée par
// syncPendingPublicRequestSignals sans jamais converger).
async function persistPublicRequestSignalResult(id: string, result: { signalId?: string; notApplicable?: boolean }): Promise<void> {
  if (!result.signalId && !result.notApplicable) return; // reste "pending" par défaut, rien à écrire.
  const db = database();
  if (!db) {
    const request = memoryRequests.find((item) => item.id === id);
    if (request) {
      if (result.signalId) {
        request.coreSignalStatus = "synced";
        request.coreSignalId = result.signalId;
      } else {
        request.coreSignalStatus = "not_applicable";
      }
    }
    return;
  }
  await ensureSchema();
  if (result.signalId) {
    await db`update mbambulaan_public_requests set core_signal_status = 'synced', core_signal_id = ${result.signalId} where id = ${id}`;
  } else {
    await db`update mbambulaan_public_requests set core_signal_status = 'not_applicable' where id = ${id}`;
  }
}

export async function createPublicRequest(input: PublicRequestInput): Promise<PublicRequest> {
  const request: PublicRequest = {
    ...input,
    id: crypto.randomUUID(),
    reference: makeReference("REQ"),
    status: "recue",
    createdAt: new Date().toISOString(),
    coreSignalStatus: "pending"
  };

  const db = database();
  if (!db) {
    memoryRequests.unshift(request);
    const result = await bridgePublicRequestSignal(request);
    await persistPublicRequestSignalResult(request.id, result);
    if (result.signalId) {
      request.coreSignalStatus = "synced";
      request.coreSignalId = result.signalId;
    } else if (result.notApplicable) {
      request.coreSignalStatus = "not_applicable";
    }
    return request;
  }

  await ensureSchema();
  await db`
    insert into mbambulaan_public_requests (
      id, reference, created_at, source, context, intent, category, territory,
      description, actor_type, organization, contact_name, phone, email,
      preferred_channel, consent, attachment_note, status, core_signal_status
    ) values (
      ${request.id}, ${request.reference}, ${request.createdAt}, ${request.source},
      ${request.context ? db.json(request.context as never) : null}, ${request.intent},
      ${request.category ?? null}, ${request.territory ?? null}, ${request.description},
      ${request.actorType}, ${request.organization ?? null}, ${request.contactName},
      ${request.phone}, ${request.email ?? null}, ${request.preferredChannel},
      ${request.consent}, ${request.attachmentNote ?? null}, ${request.status}, ${request.coreSignalStatus}
    )
  `;
  const result = await bridgePublicRequestSignal(request);
  await persistPublicRequestSignalResult(request.id, result);
  if (result.signalId) {
    request.coreSignalStatus = "synced";
    request.coreSignalId = result.signalId;
  } else if (result.notApplicable) {
    request.coreSignalStatus = "not_applicable";
  }
  return request;
}

// getUnsyncedPublicRequests / syncPendingPublicRequestSignals (Correction
// Product Review, LOT 0, 2026-09-01) : la partie "détectable/rejouable"
// du mécanisme — un échec temporaire du bridge au moment de la création
// (Core indisponible, etc.) laisse la PublicRequest "pending" plutôt que
// perdue ; ces deux fonctions permettent de la retrouver et de rejouer la
// convergence, idempotent (même clé de dispatch qu'à la création).
export async function getUnsyncedPublicRequests(): Promise<PublicRequest[]> {
  const db = database();
  if (!db) {
    return memoryRequests.filter((item) => item.coreSignalStatus === "pending");
  }
  await ensureSchema();
  const rows = await db<PublicRequest[]>`
    select
      id, reference, created_at as "createdAt", source, context, intent, category, territory,
      description, actor_type as "actorType", organization, contact_name as "contactName",
      phone, email, preferred_channel as "preferredChannel", consent,
      attachment_note as "attachmentNote", status,
      core_signal_status as "coreSignalStatus", core_signal_id as "coreSignalId"
    from mbambulaan_public_requests
    where core_signal_status = 'pending'
    order by created_at asc
  `;
  return rows;
}

export async function syncPendingPublicRequestSignals(): Promise<{ attempted: number; synced: number }> {
  const pending = await getUnsyncedPublicRequests();
  let synced = 0;
  for (const request of pending) {
    const result = await bridgePublicRequestSignal(request);
    if (result.signalId || result.notApplicable) {
      await persistPublicRequestSignalResult(request.id, result);
      if (result.signalId) synced += 1;
    }
  }
  return { attempted: pending.length, synced };
}

// bridgePublicContributionSignal (LOT 6, mandat "Public — Comprendre,
// trouver, contribuer", §13/§14) — même best-effort que
// bridgePublicRequestSignal : un échec ne fait jamais perdre la
// contribution elle-même, reste "pending" (rejouable manuellement si
// besoin — pas de sync automatique dédiée pour ce volume, cf. dette).
async function bridgePublicContributionSignal(contribution: PublicContribution): Promise<{ signalId?: string }> {
  const result = await attemptPublicContributionSignalSync(contribution, { dispatch });
  if (!result.signalId) {
    console.warn(`bridgePublicContributionSignal: convergence Core non confirmée pour la PublicContribution ${contribution.id} — reste "pending".`);
  }
  return result;
}

export async function createPublicContribution(input: PublicContributionInput): Promise<PublicContribution> {
  const contribution: PublicContribution = {
    ...input,
    id: crypto.randomUUID(),
    reference: makeReference("CTB"),
    status: "identifie",
    createdAt: new Date().toISOString(),
    coreSignalStatus: "pending"
  };

  const db = database();
  if (!db) {
    memoryContributions.unshift(contribution);
    const { signalId } = await bridgePublicContributionSignal(contribution);
    if (signalId) {
      contribution.coreSignalStatus = "synced";
      contribution.coreSignalId = signalId;
    }
    return contribution;
  }

  await ensureSchema();
  await db`
    insert into mbambulaan_public_contributions (
      id, reference, created_at, actor_type, services, territories, capacity,
      organization, contact_name, phone, email, website, notes, status, core_signal_status
    ) values (
      ${contribution.id}, ${contribution.reference}, ${contribution.createdAt},
      ${contribution.actorType}, ${contribution.services}, ${contribution.territories},
      ${contribution.capacity ?? null}, ${contribution.organization ?? null},
      ${contribution.contactName}, ${contribution.phone}, ${contribution.email ?? null},
      ${contribution.website ?? null}, ${contribution.notes ?? null}, ${contribution.status}, ${contribution.coreSignalStatus}
    )
  `;
  const { signalId } = await bridgePublicContributionSignal(contribution);
  if (signalId) {
    contribution.coreSignalStatus = "synced";
    contribution.coreSignalId = signalId;
    await db`update mbambulaan_public_contributions set core_signal_status = 'synced', core_signal_id = ${signalId} where id = ${contribution.id}`;
  }
  return contribution;
}

// Lecture des demandes publiques en attente — la seule qui existait avant
// ce pont était l'écriture (createPublicRequest) : aucune fonction de
// lecture n'existait nulle part dans le repo, la conséquence directe
// étant qu'une PublicRequest était écrite puis jamais relue par personne
// (constat vérifié, gap analysis du 2026-08-12). Lecture seule, jamais
// d'écriture depuis le Produit vers ce store en dehors des deux fonctions
// ci-dessous — le Produit lit le Public, il ne le pilote pas (A17).
// Auto-guérison (Correction Product Review, LOT 0, 2026-09-01) : chaque
// lecture des demandes en attente rejoue d'abord la convergence Core pour
// les demandes encore "pending" — point d'entrée déjà existant, lu à
// chaque ouverture de l'onglet "Demandes publiques" de
// CoordinationWorkspace.tsx, sans nouvelle route ni nouvelle UI. Best-
// effort (jamais bloquant : une erreur ici ne doit jamais empêcher
// d'afficher les demandes elles-mêmes).
export async function getPendingPublicRequests(): Promise<PublicRequest[]> {
  try {
    await syncPendingPublicRequestSignals();
  } catch (error) {
    console.warn("getPendingPublicRequests: échec de la synchronisation opportuniste", error);
  }

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
      attachment_note as "attachmentNote", status,
      core_signal_status as "coreSignalStatus", core_signal_id as "coreSignalId"
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
