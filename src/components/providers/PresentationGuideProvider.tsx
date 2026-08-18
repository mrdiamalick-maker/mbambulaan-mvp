"use client";

// État du mode présentation guidée — volontairement séparé de
// ProductProvider (ne touche à aucune donnée métier, seulement à la
// position dans le fil rouge). Persisté en sessionStorage pour survivre
// à une navigation qui remonterait ce provider (traversée entre les
// coquilles Institution/Coordination/Terrain, chacune sa propre entrée
// technique — D9).
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { presentationSteps } from "@/lib/presentation-guide";

interface PresentationGuideValue {
  active: boolean;
  stepIndex: number;
  start: () => void;
  exit: () => void;
  next: () => void;
  previous: () => void;
}

const PresentationGuideContext = createContext<PresentationGuideValue | null>(null);
const STORAGE_KEY = "mbambulaan_presentation_guide";

export function PresentationGuideProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { active: boolean; stepIndex: number };
      setActive(parsed.active);
      setStepIndex(parsed.stepIndex);
    } catch {
      // Session corrompue ou ancien format : on repart d'un mode inactif.
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ active, stepIndex }));
  }, [active, stepIndex]);

  const value = useMemo<PresentationGuideValue>(() => ({
    active,
    stepIndex,
    start: () => {
      setStepIndex(0);
      setActive(true);
    },
    exit: () => setActive(false),
    next: () => setStepIndex((index) => Math.min(index + 1, presentationSteps.length - 1)),
    previous: () => setStepIndex((index) => Math.max(index - 1, 0))
  }), [active, stepIndex]);

  return <PresentationGuideContext.Provider value={value}>{children}</PresentationGuideContext.Provider>;
}

export function usePresentationGuide() {
  const value = useContext(PresentationGuideContext);
  if (!value) throw new Error("PresentationGuideProvider manquant.");
  return value;
}
