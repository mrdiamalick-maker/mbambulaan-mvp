"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type LoopUpdate = {
  id: string;
  workId: string;
  actor: "capitaine" | "operateur" | "mareyeur" | "transformateur" | "prestataire";
  action: string;
  detail: string;
  at: string;
};

type CoordinationLoopContextValue = {
  updates: LoopUpdate[];
  recordUpdate: (update: Omit<LoopUpdate, "id" | "at">) => void;
};

const STORAGE_KEY = "mbambulaan-coordination-loop-v1";
const CoordinationLoopContext = createContext<CoordinationLoopContextValue | null>(null);

const messagingAnswers = new Set([
  "Moins d’1 heure",
  "1 à 2 heures",
  "Plus tard",
  "Place au quai",
  "Glace",
  "Manutention",
  "Rien",
  "Oui",
  "Non",
  "À confirmer",
  "Non, il faut vérifier",
  "420 kg",
  "Corriger le poids",
  "Oui, je suis intéressée",
  "Non merci",
  "Montrez-moi une autre proposition",
  "Réserver ce lot",
  "Organiser l’enlèvement",
  "Comparer avant de décider",
  "Moins de 100 kg",
  "100 à 300 kg",
  "Plus de 300 kg",
  "Oui, tout est prêt",
  "Aujourd’hui",
  "Demain",
  "Cette semaine",
  "Chambre froide",
  "Transport",
  "Appelez-moi"
]);

function readUpdates(): LoopUpdate[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoopUpdate[]) : [];
  } catch {
    return [];
  }
}

function actorFromLocation(): LoopUpdate["actor"] {
  const actor = new URLSearchParams(window.location.search).get("acteur");
  if (actor === "operateur" || actor === "mareyeur" || actor === "transformateur" || actor === "prestataire") return actor;
  return "capitaine";
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

  useEffect(() => {
    function captureMessagingAnswer(event: MouseEvent) {
      if (window.location.pathname !== "/terrain/whatsapp") return;
      const button = (event.target as HTMLElement | null)?.closest("button");
      const answer = button?.textContent?.trim();
      if (!answer || !messagingAnswers.has(answer)) return;

      const actor = actorFromLocation();
      const actorLabel = actor === "operateur" ? "Agent de quai" : actor === "transformateur" ? "Transformatrice" : actor.charAt(0).toUpperCase() + actor.slice(1);
      recordUpdate({
        workId: "RET-2026-0814",
        actor,
        action: `${actorLabel} : ${answer}`,
        detail: "Cette réponse est enregistrée une seule fois et devient visible dans les espaces professionnels concernés."
      });
    }

    document.addEventListener("click", captureMessagingAnswer);
    return () => document.removeEventListener("click", captureMessagingAnswer);
  }, [recordUpdate]);

  const value = useMemo(() => ({ updates, recordUpdate }), [updates, recordUpdate]);

  return <CoordinationLoopContext.Provider value={value}>{children}</CoordinationLoopContext.Provider>;
}

export function useCoordinationLoop() {
  const value = useContext(CoordinationLoopContext);
  if (!value) throw new Error("CoordinationLoopProvider manquant.");
  return value;
}
