"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CommandInput, ProductState, Role } from "@/domain/types";

interface ProductContextValue {
  state: ProductState | null;
  role: Role;
  actorId: string;
  persistence: string;
  loading: boolean;
  error: string;
  run: (command: CommandInput) => Promise<boolean>;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const ProductContext = createContext<ProductContextValue | null>(null);
export const DEMO_STORAGE_KEY = "mbambulaan-demo-state-v1";

// P2.1-B.1 (mandat "Session-State Isolation") — root cause tracé §3 du
// mandat : en persistance memoire_locale_demo (aucun DATABASE_URL),
// POST /api/actions calcule à partir du demoState envoyé par CE
// composant et ne mute jamais l'état global serveur (cf. commentaire sur
// POST /api/actions) — la seule vraie persistance "entre deux
// chargements de page" pour ce mode est donc ce localStorage. Avant ce
// lot, il était stocké sous une clé fixe, jamais rattachée à une
// identité : une session A (ex. coordinateur, état complet) pouvait
// laisser un ProductState en localStorage qu'une session B (ex.
// mareyeur/institution) réhydratait tel quel au chargement suivant,
// AVANT même que le filtrage serveur (projectStateForSession,
// GET /api/state) n'ait eu l'occasion de s'appliquer — SESSION A STATE
// pouvait fuiter dans SESSION B STATE sur le même navigateur.
//
// Correctif retenu (mandat §5, option A+B minimale — jamais une
// nouvelle architecture de persistance) :
//   A. namespacé par identité — le blob stocké porte désormais la paire
//      (actorId, role) de la session qui l'a écrit ; au chargement, si
//      la session courante (payload.session, TOUJOURS server-authoritative
//      — mandat §4) ne correspond pas à cette identité, le blob est
//      traité comme étranger et jamais utilisé : le state du serveur
//      fraîchement filtré (payload.state) devient la seule source,
//      et le cache est immédiatement ré-ancré sur la nouvelle identité.
//   B. purge explicite à la déconnexion (logout ci-dessous) — défense en
//      profondeur : même si (A) rend déjà un résidu inoffensif au
//      prochain login, la donnée ne doit pas non plus rester à portée
//      d'une inspection directe de localStorage entre-temps.
// Aucune notion de session store séparée, aucun chiffrement, aucune
// migration de schéma ProductState — un seul champ supplémentaire dans
// l'enveloppe stockée.
export interface StoredDemoState {
  sessionKey: string;
  state: ProductState;
}

// Exportées (avec DEMO_STORAGE_KEY ci-dessus) pour être unitairement
// testées sans monter de composant React — ces 4 fonctions ne touchent
// `window.localStorage` qu'à l'appel, jamais au chargement du module,
// donc testables via un stub `globalThis.window` minimal (cf.
// tests/p21b1-session-state-isolation.test.ts) plutôt que par lecture de
// source seule.
export function sessionKeyFor(actorId: string, role: Role): string {
  return `${actorId}:${role}`;
}

// readDemoState — ne retourne le blob stocké QUE s'il porte la même
// identité (actorId+role) que la session courante ; sinon (absent,
// illisible, OU identité différente — y compris une injection hostile
// directe dans localStorage, mandat §7) retombe sur `fallback`, qui est
// toujours payload.state : le ProductState que le serveur vient de
// calculer et de filtrer pour CETTE session. Un localStorage étranger ou
// falsifié ne peut donc jamais réintroduire un objet que le serveur a
// déjà exclu — il est simplement ignoré, jamais fusionné ni "réparé".
export function readDemoState(sessionKey: string, fallback: ProductState): ProductState {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredDemoState>;
    if (parsed.sessionKey !== sessionKey || !parsed.state) return fallback;
    return parsed.state;
  } catch {
    return fallback;
  }
}

export function writeDemoState(sessionKey: string, state: ProductState) {
  try {
    const payload: StoredDemoState = { sessionKey, state };
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // The in-memory React state remains usable when browser storage is unavailable.
  }
}

export function clearDemoState() {
  try {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // Rien à nettoyer si le storage est indisponible.
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProductState | null>(null);
  const [role, setRole] = useState<Role>("coordinateur");
  const [actorId, setActorId] = useState("act-coordinateur");
  const [persistence, setPersistence] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = `/connexion?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!response.ok) throw new Error("Impossible de charger l'espace de travail.");
      const payload = await response.json();
      // sessionKey dérivé de payload.session, jamais de l'état React
      // précédent (potentiellement celui d'une identité différente encore
      // affichée pendant ce refresh) — server authority (mandat §4).
      const sessionKey = sessionKeyFor(payload.session.actorId, payload.session.role);
      const nextState =
        payload.persistence === "memoire_locale_demo"
          ? readDemoState(sessionKey, payload.state)
          : payload.state;
      setState(nextState);
      setRole(payload.session.role);
      setActorId(payload.session.actorId);
      setPersistence(payload.persistence);
      // Ré-ancre immédiatement le cache sur cette identité — y compris
      // quand le blob précédent était déjà valide : garantit qu'un futur
      // changement de session sera détecté au prochain refresh, jamais
      // seulement "corrigé une fois puis oublié".
      if (payload.persistence === "memoire_locale_demo") writeDemoState(sessionKey, nextState);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = useCallback(
    async (command: CommandInput) => {
      setError("");
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          ...command,
          actorId,
          demoState: persistence === "memoire_locale_demo" ? state : undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Action impossible.");
        return false;
      }
      // La réponse est désormais reprojetée côté serveur avant d'être
      // renvoyée (P2.1-B.1, POST /api/actions) : ce qui est écrit ici en
      // localStorage est donc déjà borné par la session courante, quel
      // qu'ait été le contenu de demoState envoyé.
      setState(payload.state);
      if (persistence === "memoire_locale_demo") writeDemoState(sessionKeyFor(actorId, role), payload.state);
      return true;
    },
    [actorId, persistence, role, state]
  );

  const reset = useCallback(async () => {
    const response = await fetch("/api/demo/reset", { method: "POST" });
    const payload = await response.json();
    setState(payload.state);
    if (persistence === "memoire_locale_demo") writeDemoState(sessionKeyFor(actorId, role), payload.state);
    setError("");
  }, [actorId, persistence, role]);

  // logout — centralise ce que les 3 shells (Produit, État, Terrain)
  // faisaient chacun séparément (fetch + redirection), pour que la purge
  // localStorage (mandat §5 option B) vive à un seul endroit plutôt que
  // d'être répétée — et risquer d'être oubliée — dans chaque shell.
  const logout = useCallback(async () => {
    clearDemoState();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }, []);

  const value = useMemo(
    () => ({ state, role, actorId, persistence, loading, error, run, reset, refresh, logout }),
    [state, role, actorId, persistence, loading, error, run, reset, refresh, logout]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const value = useContext(ProductContext);
  if (!value) throw new Error("ProductProvider manquant.");
  return value;
}
