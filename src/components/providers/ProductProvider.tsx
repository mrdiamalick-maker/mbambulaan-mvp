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
}

const ProductContext = createContext<ProductContextValue | null>(null);
const DEMO_STORAGE_KEY = "mbambulaan-demo-state-v1";

function readDemoState(fallback: ProductState) {
  try {
    const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ProductState) : fallback;
  } catch {
    return fallback;
  }
}

function writeDemoState(state: ProductState) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The in-memory React state remains usable when browser storage is unavailable.
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
      const nextState =
        payload.persistence === "memoire_locale_demo"
          ? readDemoState(payload.state)
          : payload.state;
      setState(nextState);
      setRole(payload.session.role);
      setActorId(payload.session.actorId);
      setPersistence(payload.persistence);
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
      setState(payload.state);
      if (persistence === "memoire_locale_demo") writeDemoState(payload.state);
      return true;
    },
    [actorId, persistence, state]
  );

  const reset = useCallback(async () => {
    const response = await fetch("/api/demo/reset", { method: "POST" });
    const payload = await response.json();
    setState(payload.state);
    if (persistence === "memoire_locale_demo") writeDemoState(payload.state);
    setError("");
  }, [persistence]);

  const value = useMemo(
    () => ({ state, role, actorId, persistence, loading, error, run, reset, refresh }),
    [state, role, actorId, persistence, loading, error, run, reset, refresh]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const value = useContext(ProductContext);
  if (!value) throw new Error("ProductProvider manquant.");
  return value;
}
