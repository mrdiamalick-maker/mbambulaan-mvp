"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// LOT V3.1 (Scope D) — primitives d'interaction MINIMALES, fondation pour
// les lots à venir plutôt qu'un design system complet (mandat, explicite).
// Chacune enveloppe une primitive shadcn/ui déjà présente dans le dépôt
// mais jusqu'ici jamais consommée hors de src/components/ui lui-même
// (tooltip.tsx n'était utilisé que par sidebar.tsx pour ses libellés en
// mode replié) : l'objectif de ce lot est de rendre ces primitives
// consommables ailleurs de façon cohérente, pas de les réinventer.

// InfoTooltip — habillage minimal de src/components/ui/tooltip.tsx (Radix
// Tooltip : positionnement, clavier, délai déjà gérés). Usage prévu : un
// texte d'aide court accroché à une métrique/un contrôle, jamais un
// contenu qui devrait être un DetailSurface.
export function InfoTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label={label} className="inline-flex size-4 items-center justify-center rounded-full border border-current text-[10px] font-semibold leading-none text-muted-foreground">?</button>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// SegmentedControl — contrôle de période/filtre à options mutuellement
// exclusives (ex. "Vue carte / Registre / Indicateurs clés / Comparaison"
// déjà affiché en onglets faits main sur /app/etat/territoires — cette
// primitive existe pour que le PROCHAIN contrôle de ce type n'ait plus à
// réinventer son propre balisage). role="tablist" réel, navigation clavier
// gérée nativement par le focus des <button> — pas de piège au clavier.
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  "aria-label": string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex items-center gap-1 rounded-md border bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={`rounded-sm px-2.5 py-1 text-xs font-medium transition ${option.value === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type StatusTone = "neutral" | "success" | "warning" | "critical";

const toneStyle: Record<StatusTone, React.CSSProperties> = {
  neutral: {},
  success: { borderColor: "var(--mb-success, #4e7b5a)", color: "var(--mb-success, #4e7b5a)" },
  warning: { borderColor: "var(--etat-ocre, #d89a4a)", color: "var(--etat-ocre, #d89a4a)" },
  critical: { borderColor: "var(--etat-critique, #c8452b)", color: "var(--etat-critique, #c8452b)" }
};

// StatusChip — habillage minimal de src/components/ui/badge.tsx (déjà
// utilisé partout) avec un vocabulaire de ton RÉDUIT à 4 valeurs
// sémantiques réelles, jamais une nouvelle échelle de statut : mappe vers
// les couleurs déjà verrouillées ailleurs dans le Produit (--mb-success,
// --etat-ocre, --etat-critique), jamais une teinte choisie au hasard pour
// cette seule primitive.
export function StatusChip({ tone = "neutral", children }: { tone?: StatusTone; children: React.ReactNode }) {
  return (
    <Badge variant="outline" className="gap-1.5" style={toneStyle[tone]}>
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: "currentColor" }} />
      {children}
    </Badge>
  );
}
