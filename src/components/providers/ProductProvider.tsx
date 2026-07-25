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
  changeRole: (role: Role) => Promise<void>;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ProductContext = createContext<ProductContextValue | null>(null);

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
      if (!response.ok) throw new Error("Impossible de charger l'espace de travail.");
      const payload = await response.json();
      setState(payload.state);
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
        body: JSON.stringify({ ...command, actorId })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Action impossible.");
        return false;
      }
      setState(payload.state);
      return true;
    },
    [actorId]
  );

  const changeRole = useCallback(async (nextRole: Role) => {
    await fetch("/api/demo/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole })
    });
    await refresh();
  }, [refresh]);

  const reset = useCallback(async () => {
    const response = await fetch("/api/demo/reset", { method: "POST" });
    const payload = await response.json();
    setState(payload.state);
    setError("");
  }, []);

  const value = useMemo(
    () => ({ state, role, actorId, persistence, loading, error, run, changeRole, reset, refresh }),
    [state, role, actorId, persistence, loading, error, run, changeRole, reset, refresh]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const value = useContext(ProductContext);
  if (!value) throw new Error("ProductProvider manquant.");
  return value;
}
