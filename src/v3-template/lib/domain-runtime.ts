"use client";

// domain-runtime — PD.5, mandat "Operational Knowledge Bridge", §2/§3/§6.
//
// Le plus petit pont possible entre /etat (gabarit V3, pure
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
// NOT silently become security authorization") — depuis que V3 devient
// l'Espace État canonique, ce module consomme exclusivement la session
// ouverte par /connexion. Il ne crée plus silencieusement une session de
// démonstration « coordinateur » et ne remplace donc jamais le mandat
// institutionnel authentifié. Le rôle AFFICHÉ de V3 (AppState.role :
// ministre/programme/coordination, state.ts, gabarit gelé) reste un
// choix de présentation strictement dissocié de cet acteur réel — jamais
// transmis au serveur, jamais utilisé pour décider une autorisation :
// assertCan (server/permissions.ts) reste seul juge, côté serveur,
// à partir de la session réelle établie ici.
import { useCallback, useEffect, useRef, useState } from "react";
import type { CommandInput, ProductState, Role } from "@/domain/types";

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

export function useDomainRuntime(): DomainRuntime {
  const [status, setStatus] = useState<DomainRuntimeState>({ state: null, loading: true, error: null, actorId: null, role: null });
  const idempotencySeq = useRef(0);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setStatus((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const result = await fetchState();
      if (!result) {
        if (mounted.current) {
          setStatus({ state: null, loading: false, error: "Session absente ou expirée.", actorId: null, role: null });
        }
        if (typeof window !== "undefined") window.location.assign("/connexion?next=/etat");
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
