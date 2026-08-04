"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type LoopActor = "capitaine" | "operateur" | "mareyeur" | "transformateur" | "prestataire";

export type LoopUpdate = {
  id: string;
  workId: string;
  actor: LoopActor;
  visibleTo: LoopActor[];
  action: string;
  detail: string;
  nextAction: Partial<Record<LoopActor, string>>;
  at: string;
};

type CoordinationLoopContextValue = {
  updates: LoopUpdate[];
  recordUpdate: (update: Omit<LoopUpdate, "id" | "at">) => void;
};

const STORAGE_KEY = "mbambulaan-coordination-loop-v2";
const CoordinationLoopContext = createContext<CoordinationLoopContextValue | null>(null);

function readUpdates(): LoopUpdate[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoopUpdate[]) : [];
  } catch {
    return [];
  }
}

export function CoordinationLoopProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<LoopUpdate[]>([]);

  useEffect(() => {
    setUpdates(readUpdates());
  }, []);

  const recordUpdate = useCallback((update: Omit<LoopUpdate, "id" | "at">) => {
    setUpdates((current) => {
      const next = [
        ...current,
        {
          ...update,
          id: crypto.randomUUID(),
          at: new Date().toISOString()
        }
      ].slice(-30);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // La démonstration reste utilisable en mémoire si le stockage navigateur est indisponible.
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ updates, recordUpdate }), [updates, recordUpdate]);

  return <CoordinationLoopContext.Provider value={value}>{children}</CoordinationLoopContext.Provider>;
}

export function useCoordinationLoop() {
  const value = useContext(CoordinationLoopContext);
  if (!value) throw new Error("CoordinationLoopProvider manquant.");
  return value;
}
