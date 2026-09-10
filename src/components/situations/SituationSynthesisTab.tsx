import type { ProductState, Situation } from "@/domain/types";
import {
  findKnowledgeGapForSituation,
  resolveFindingForSituation,
  resolveSourceRefDisplay
} from "@/domain/situation-narrative";
import { situationKnownUnknown } from "@/domain/situation-overview";
import { KnowledgeState } from "@/components/foundations";
import { WhyMbambulaan } from "@/components/situations/SituationNarrative";
import { trustLabels } from "@/lib/status-tokens";

// LOT V3.2 (mandat "Situations & Progressive Detail", §4/§5/§9/§10) —
// premier onglet du détail progressif : répond en un seul écran à QUOI/
// OÙ/IMPORTANCE (déjà dans le hero, cf. SituationHero) puis ce que l'on
// SAIT / ce qui reste INCERTAIN — jamais une synthèse narrative fabriquée
// par situation (contrairement à la maquette V3, dont ces deux colonnes
// sont un texte d'illustration écrit à la main pour chaque fixture) :
// ici, une vraie partition des Signal.description réels selon leur
// TrustLevel (situationKnownUnknown, domain/situation-overview.ts).
//
// WhyMbambulaan (composant PARTAGÉ avec le drawer Situation de l'Espace
// État, réutilisé sans modification) porte "ce que le système constate"
// (Finding.statement/explanation) ET sa suggestion (Finding.nextStep,
// affichée par SituationActionsTab) — seulement quand un Finding réel est
// lié (situation.findingId), jamais forcé (mandat §10 : "do not force
// convergence into every Situation").
export function SituationSynthesisTab({ state, situation }: { state: ProductState; situation: Situation }) {
  const finding = resolveFindingForSituation(state, situation);
  const sourceElements = finding ? finding.sourceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is NonNullable<typeof item> => Boolean(item)) : [];
  const knowledgeGap = findKnowledgeGapForSituation(state, situation);
  const { known, unknown } = situationKnownUnknown(state, situation);

  return (
    <div className="space-y-6">
      <WhyMbambulaan finding={finding} sources={sourceElements} />

      {knowledgeGap && (
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--mb-hairline)" }}>
          <KnowledgeState level="a_verifier">{knowledgeGap.statement}</KnowledgeState>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#4e7b5a" }}>
            <span className="h-px w-4" style={{ background: "#4e7b5a" }} /> Ce que nous savons
          </p>
          {known.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucun élément confirmé par une source secondaire pour le moment.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {known.map((item) => (
                <li key={item.signalId} className="border-l-2 py-0.5 pl-3 text-sm leading-6" style={{ borderColor: "rgba(78,123,90,.32)" }}>
                  {item.text} <span className="text-xs text-muted-foreground">— {trustLabels[item.trust]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <span className="h-px w-4 bg-primary" /> Ce qui reste incertain
          </p>
          {unknown.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucune incertitude déclarative identifiée pour le moment.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {unknown.map((item) => (
                <li key={item.signalId} className="border-l-2 border-primary/30 py-0.5 pl-3 text-sm leading-6">
                  {item.text} <span className="text-xs text-muted-foreground">— {trustLabels[item.trust]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {situation.description && situation.description.trim() !== situation.title.trim() && (
        <div className="border-t pt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</p>
          <p className="mt-2 max-w-2xl text-sm leading-6">{situation.description}</p>
        </div>
      )}
    </div>
  );
}
