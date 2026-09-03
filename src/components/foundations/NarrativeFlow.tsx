import type { ReactNode } from "react";

export interface NarrativeFlowStep {
  id: string;
  label: string;
  content: ReactNode;
  /** "done" | "current" | "pending" — jamais fabriqué : reflète l'état réel connu, "pending" si rien n'est encore survenu. */
  state?: "done" | "current" | "pending";
}

// XXL-R1, primitive 8/9 (§18.8) — Réalité → compréhension → action →
// résultat, sans BPMN. Rythme vertical continu (filet + point), pas une
// boîte numérotée par étape — corrige directement le défaut identifié par
// l'audit sur "De la réalité à la valeur" (fiche Situation, 8 cases
// empilées lisibles comme une checklist plutôt qu'un récit).
export function NarrativeFlow({ steps }: { steps: NarrativeFlowStep[] }) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const state = step.state ?? "done";
        const color = state === "pending" ? "var(--mb-stone-300)" : state === "current" ? "var(--mb-terracotta-600)" : "var(--mb-navy-600)";
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-3 pb-5 pl-1 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-[3.5px] top-4 w-px"
                style={{ bottom: "-4px", background: "var(--mb-hairline-soft)" }}
              />
            )}
            <span
              className="relative mt-1.5 size-2 shrink-0 rounded-full"
              style={{ background: state === "pending" ? "transparent" : color, border: state === "pending" ? `1.5px solid ${color}` : undefined }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="mb-evidence" style={{ color }}>{step.label}</p>
              <div className="mb-body mt-0.5 text-[13.5px]" style={state === "pending" ? { color: "var(--mb-stone-400)" } : undefined}>{step.content}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
