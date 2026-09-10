import type { ProductState, Situation } from "@/domain/types";

// LOT V3.2 (mandat §4/§7) — Chronologie réelle : situation.history tel
// quel (HistoryEntry[], domain/types.ts), jamais un évènement inventé
// pour peupler la maquette. Rendu vertical (date/glyphe/texte) inspiré de
// Claude Design V3, mais sur la vraie donnée — pas de glyphe de confiance
// par entrée (History n'en porte pas ; en inventer un serait présenter
// une confiance qui n'existe pas dans le modèle).
//
// HistoryEntry.actor est TOUJOURS un identifiant technique brut
// (data/demo-state.ts : "act-operateur", "act-relais-djiffer"…), jamais un
// nom lisible — résolu ici vers le vrai Actor plutôt qu'affiché tel quel
// (trouvé en QA visuelle réelle : l'ancien rendu de SituationRoom.tsx
// n'affichait jamais ce champ, seulement label/detail — la même
// discipline que resolveSourceRefDisplay, "jamais un identifiant
// technique brut", s'applique donc ici aussi). Repli honnête si l'acteur
// n'existe plus dans le référentiel.
export function SituationChronologyTab({ state, situation }: { state: ProductState; situation: Situation }) {
  if (situation.history.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun évènement consigné pour cette situation pour le moment.</p>;
  }
  return (
    <ol className="space-y-0">
      {situation.history.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-4 pb-5">
          <span className="w-24 shrink-0 pt-0.5 text-right font-mono text-[11px] text-muted-foreground">
            {new Date(entry.at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </span>
          <span className="relative flex shrink-0 flex-col items-center">
            <span className="mt-1 size-2 rounded-full bg-primary" aria-hidden="true" />
            {index < situation.history.length - 1 && <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm leading-6">{entry.label}</p>
            {entry.detail && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{entry.detail}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground/70">{state.actors.find((item) => item.id === entry.actor)?.name ?? "Système"}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
