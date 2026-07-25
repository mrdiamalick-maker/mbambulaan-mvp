"use client";

import {
  appendHistory,
  cloneInitialSituations,
  DEMO_STORAGE_KEY,
  type NewSituationInput,
  type Situation,
  type SituationHistory,
  type SituationStatus,
  validateSituation
} from "@/lib/coordination-demo";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Update = Omit<Partial<Situation>, "history"> & {
  history: Omit<SituationHistory, "id">;
};

type DemoContextValue = {
  situations: Situation[];
  hydrated: boolean;
  createSituation: (input: NewSituationInput) => string;
  updateSituation: (id: string, update: Update) => { ok: true } | { ok: false; message: string };
  getSituation: (id: string) => Situation | undefined;
  resetDemo: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

function safeReadStoredSituations(): Situation[] {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return cloneInitialSituations();
    const parsed = JSON.parse(raw) as Situation[];
    return Array.isArray(parsed) && parsed.length ? parsed : cloneInitialSituations();
  } catch {
    return cloneInitialSituations();
  }
}

export function CoordinationDemoProvider({ children }: { children: ReactNode }) {
  const [situations, setSituations] = useState<Situation[]>(cloneInitialSituations);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSituations(safeReadStoredSituations());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(situations));
  }, [hydrated, situations]);

  const createSituation = useCallback((input: NewSituationInput) => {
    const sequence = String(situations.length + 1).padStart(3, "0");
    const id = `MBA-2026-${sequence}`;
    const createdAt = `2026-07-24T08:${String(10 + situations.length).padStart(2, "0")}:00+00:00`;
    const created: Situation = {
      id,
      title: input.type,
      description: input.description,
      site: input.site,
      urgency: input.urgency,
      reportedAt: createdAt,
      reportedBy: input.reportedBy,
      reporterContact: input.reporterContact,
      concernedActors: ["Acteurs du site"],
      status: "Reçu",
      coordinator: "Awa Diop — Coordination locale",
      nextStep: "Comprendre la situation et vérifier les informations remontées",
      nextActor: "Awa Diop — Coordination locale",
      nextDue: "Sous 2 heures",
      history: [
        {
          id: `${id}-1`,
          at: createdAt.slice(11, 16),
          label: "Difficulté remontée",
          detail: input.attachmentName
            ? `La situation a été transmise avec le document « ${input.attachmentName} ».`
            : "La situation a été transmise sans document joint.",
          author: input.reportedBy,
          kind: "création"
        }
      ]
    };
    setSituations((current) => [created, ...current]);
    return id;
  }, [situations.length]);

  const updateSituation = useCallback((id: string, update: Update) => {
    const currentSituation = situations.find((situation) => situation.id === id);
    if (!currentSituation) return { ok: false as const, message: "Situation introuvable." };
    const { history, ...changes } = update;
    const next = appendHistory({ ...currentSituation, ...changes }, history);
    const validationErrors = validateSituation(next);
    if (validationErrors.length) return { ok: false as const, message: validationErrors[0] };
    setSituations((current) => current.map((situation) => (situation.id === id ? next : situation)));
    return { ok: true as const };
  }, [situations]);

  const resetDemo = useCallback(() => {
    const reset = cloneInitialSituations();
    setSituations(reset);
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(reset));
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      situations,
      hydrated,
      createSituation,
      updateSituation,
      getSituation: (id) => situations.find((item) => item.id === id),
      resetDemo
    }),
    [createSituation, hydrated, resetDemo, situations, updateSituation]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useCoordinationDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useCoordinationDemo doit être utilisé dans CoordinationDemoProvider");
  return context;
}

export function makeHistory(
  label: string,
  detail: string,
  author: string,
  kind: SituationHistory["kind"],
  at = new Intl.DateTimeFormat("fr-SN", { hour: "2-digit", minute: "2-digit" }).format(new Date())
): Omit<SituationHistory, "id"> {
  return { at, label, detail, author, kind };
}

export function statusUpdate(status: SituationStatus): Pick<Situation, "status"> {
  return { status };
}
