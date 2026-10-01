"use client";

// domain-runtime — PD.5, mandat "Operational Knowledge Bridge", §2/§3/§6.
//
// Le plus petit pont possible entre /private-v3 (gabarit gelé, pure
// présentation) et le moteur canonique du domaine Mbàmbulaan
// (applyCommand, server/repository.ts) — exposé par les 2 SEULES routes
// HTTP qui constituent la frontière réelle de mutation/lecture
// (GET /api/state, POST /api/actions ; audit d'architecture PD.5 §2).
// N'importe PAS ProductProvider (src/components/providers/ProductProvider.tsx)
// — cette architecture appartient à /app, une UI légataire distincte que
// le mandat interdit explicitement d'importer — mais réutilise le MÊME
// mécanisme sous-jacent (mêmes deux routes, même en-tête Idempotency-Key)
// puisque c'est la seule couche canonique existante. Contrairement à
// ProductProvider, ce hook n'envoie JAMAIS `demoState` au client : chaque
// commande passe par dispatch()/getState() (server/repository.ts), qui
// persiste réellement côté serveur (globalThis.mbambulaanState ou
// Postgres selon DATABASE_URL) — jamais une mutation qui ne vivrait que
// dans le state React du navigateur.
//
// Établissement de l'acteur réel (mandat §6, "a visual demo role must
// NOT silently become security authorization" / §21, "no new
// authentication design") — /private-v3 n'a et ne doit pas avoir de flux
// de connexion propre. Ce module réutilise le point d'entrée
// /api/auth/login déjà existant, avec le compte de démonstration
// "coordinateur" déjà semé par server/accounts-repository.ts
// (ensureDemoAccount — actif uniquement en mode démonstration,
// process.env.NODE_ENV !== "production" ou DEMO_MODE === "true", jamais
// en production réelle : la même porte de sécurité que le reste du
// produit, pas une nouvelle). C'est le seul rôle réel couvrant les 3
// commandes nécessaires à ce lot (convert_message_to_signal,
// dismiss_incoming_message, create_decision — cf. server/permissions.ts,
// "coordinateur" → all). Le rôle AFFICHÉ de V3 (AppState.role :
// ministre/programme/coordination, state.ts, gabarit gelé) reste un
// choix de présentation strictement dissocié de cet acteur réel — jamais
// transmis au serveur, jamais utilisé pour décider une autorisation :
// assertCan (server/permissions.ts) reste seul juge, côté serveur,
// à partir de la session réelle établie ici.
import { useCallback, useEffect, useRef, useState } from "react";
import type { CommandInput, ProductState, Role } from "@/domain/types";

const DEMO_ACTOR_EMAIL = "demo@mbambulaan.sn";
// Repli documenté de server/accounts-repository.ts (ensureDemoAccount) —
// jamais un secret inventé pour ce lot : le même mot de passe par défaut
// que le serveur sème lui-même quand DEMO_ACCOUNT_PASSWORD n'est pas
// défini. Si un déploiement définit DEMO_ACCOUNT_PASSWORD explicitement,
// cette connexion automatique échoue proprement (état "error" ci-dessous)
// plutôt que de deviner un secret réel — jamais un affaiblissement de
// l'authentification réelle.
const DEMO_ACTOR_PASSWORD = "demo-mbambulaan-2026";

export interface DomainRuntimeState {
  state: ProductState | null;
  loading: boolean;
  error: string | null;
  actorId: string | null;
  role: Role | null;
}

export interface DomainRuntime extends DomainRuntimeState {
  // dispatch — exécute une commande RÉELLE via POST /api/actions
  // (assertCan côté serveur, actorId toujours dérivé de la session
  // serveur, jamais du client — cf. app/api/actions/route.ts). Renvoie
  // le ProductState canonique déjà reprojeté par projectStateForSession,
  // que ce hook adopte tel quel : aucune donnée envoyée par le client
  // n'est jamais utilisée comme preuve d'autorisation ni comme état de
  // départ (P2.1-B.1, respecté par construction en ne fournissant jamais
  // demoState).
  dispatch: (command: CommandInput) => Promise<void>;
  refresh: () => Promise<void>;
}

async function fetchState(): Promise<{ state: ProductState; actorId: string; role: Role } | null> {
  const res = await fetch("/api/state", { credentials: "include", cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Lecture de l'état impossible (${res.status}).`);
  const body = (await res.json()) as { state: ProductState; session: { actorId: string; role: Role } };
  return { state: body.state, actorId: body.session.actorId, role: body.session.role };
}

async function establishDemoSession(): Promise<boolean> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: DEMO_ACTOR_EMAIL, password: DEMO_ACTOR_PASSWORD })
  });
  return res.ok;
}

export function useDomainRuntime(): DomainRuntime {
  const [status, setStatus] = useState<DomainRuntimeState>({ state: null, loading: true, error: null, actorId: null, role: null });
  const idempotencySeq = useRef(0);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setStatus((previous) => ({ ...previous, loading: true, error: null }));
    try {
      let result = await fetchState();
      if (!result) {
        const ok = await establishDemoSession();
        if (!ok) {
          if (mounted.current) {
            setStatus({ state: null, loading: false, error: "Impossible d'établir une session de démonstration réelle (compte non disponible).", actorId: null, role: null });
          }
          return;
        }
        result = await fetchState();
      }
      if (!result) {
        if (mounted.current) {
          setStatus({ state: null, loading: false, error: "Session établie mais lecture de l'état impossible.", actorId: null, role: null });
        }
        return;
      }
      if (mounted.current) {
        setStatus({ state: result.state, loading: false, error: null, actorId: result.actorId, role: result.role });
      }
    } catch (err) {
      if (mounted.current) {
        setStatus({ state: null, loading: false, error: err instanceof Error ? err.message : "Erreur inconnue.", actorId: null, role: null });
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const dispatch = useCallback(async (command: CommandInput) => {
    idempotencySeq.current += 1;
    const idempotencyKey = `v3-${command.type}-${Date.now()}-${idempotencySeq.current}`;
    const res = await fetch("/api/actions", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "Idempotency-Key": idempotencyKey },
      // Jamais de champ demoState — cf. en-tête de ce fichier : la
      // commande passe systématiquement par dispatch()/getState()
      // (server/repository.ts), la seule persistance réellement
      // canonique.
      body: JSON.stringify(command)
    });
    const body = (await res.json()) as { state?: ProductState; error?: string };
    if (!res.ok || !body.state) {
      throw new Error(body.error ?? "Action refusée.");
    }
    if (mounted.current) {
      setStatus((previous) => ({ ...previous, state: body.state! }));
    }
  }, []);

  return { ...status, dispatch, refresh: load };
}
