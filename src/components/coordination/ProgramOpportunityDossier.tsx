"use client";

// ProgramOpportunityDossier — LOT 2 (mandat "Vertical Slice Kayar", §11).
// Une opportunité de développement n'est jamais présentée comme un
// programme financé (mandat §12) : pas de budget, pas de partenaire, pas
// de bailleur ici — uniquement le problème, sa justification, ce qui reste
// à qualifier et plusieurs pistes d'intervention, jamais une seule
// solution "recommandée".
import { useState } from "react";
import { CheckCircle2, Compass } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import type { ProductState, ProgramOpportunity } from "@/domain/types";
import { programOpportunityMaturityLabels, programOpportunityStatusLabels } from "@/domain/types";
import { resolveSourceRefDisplay } from "@/domain/situation-narrative";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InitiativeForm } from "@/components/coordination/InitiativeForm";

const statusBadgeVariant: Record<ProgramOpportunity["status"], "marine" | "amber" | "success" | "outline"> = {
  detected: "marine",
  qualifying: "marine",
  qualified: "amber",
  designing: "amber",
  converted_to_program: "success",
  rejected: "outline",
  paused: "outline"
};

const CONVERTIBLE_STATUSES = new Set<ProgramOpportunity["status"]>(["qualified", "designing"]);
// Statuts depuis lesquels l'opportunité peut encore être qualifiée
// (mandat §13 : la conversion en Programme exige une opportunité déjà
// qualifiée — un contrôle explicite doit donc exister pour l'y amener,
// pas seulement la commande Core). "rejected"/"paused"/"converted_to_program"
// sont volontairement exclus : les faire réévoluer ici rouvrirait un cycle
// de vie que ce lot ne couvre pas.
const QUALIFIABLE_STATUSES = new Set<ProgramOpportunity["status"]>(["detected", "qualifying"]);

export function ProgramOpportunityDossier({ opportunity, state, onDone }: { opportunity: ProgramOpportunity; state: ProductState; onDone: () => void }) {
  const { run } = useProduct();
  const [constituting, setConstituting] = useState(false);
  const [qualifying, setQualifying] = useState(false);
  const territories = opportunity.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
  const evidence = opportunity.evidenceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (constituting) {
    return <InitiativeForm programOpportunity={opportunity} state={state} onDone={onDone} onCancel={() => setConstituting(false)} />;
  }

  const qualify = async () => {
    setQualifying(true);
    try {
      await run({ type: "update_program_opportunity_status", programOpportunityId: opportunity.id, status: "qualified", note: "Éléments disponibles jugés suffisants pour envisager la conception d’un programme." });
    } finally {
      setQualifying(false);
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center gap-2">
        <Badge variant={statusBadgeVariant[opportunity.status]}>{programOpportunityStatusLabels[opportunity.status]}</Badge>
        <Badge variant="outline">Maturité {programOpportunityMaturityLabels[opportunity.maturity].toLowerCase()}</Badge>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Problème</p>
        <p className="mt-1.5 text-sm leading-6">{opportunity.problem}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Justification</p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{opportunity.justification}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Territoires</p>
          <p className="mt-1.5 text-sm">{territories.join(" · ")}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bénéficiaires potentiels</p>
          <p className="mt-1.5 text-sm">{opportunity.potentialBeneficiaries}</p>
        </div>
      </div>

      {evidence.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preuves et éléments disponibles</p>
          <ul className="mt-1.5 space-y-1">
            {evidence.map((item) => (
              <li key={`${item.ref.objectType}-${item.ref.objectId}`} className="text-xs leading-4">
                <span className="font-semibold">{item.label}</span>{item.detail ? <span className="text-muted-foreground"> — {item.detail}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {opportunity.knowledgeGaps.length > 0 && (
        <div className="rounded-lg border border-dashed p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ce qui reste à qualifier</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm italic leading-5 text-muted-foreground">
            {opportunity.knowledgeGaps.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      <div>
        {/* "pistes à étudier" (mandat §11) — jamais "solution recommandée" :
            libellé porté par le titre de la section elle-même, pas
            seulement dans un texte annexe. */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interventions envisageables — pistes à étudier</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-5">
          {opportunity.possibleInterventions.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Résultats recherchés</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-5">
          {opportunity.desiredOutcomes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Indicateurs proposés</p>
        {opportunity.possibleIndicators.length > 0 ? (
          <ul className="mt-1.5 space-y-1 text-sm">
            {opportunity.possibleIndicators.map((item) => <li key={item.label}>{item.label} ({item.unit})</li>)}
          </ul>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground">À définir lors de la conception du programme.</p>
        )}
      </div>

      {CONVERTIBLE_STATUSES.has(opportunity.status) ? (
        <Button className="w-full" onClick={() => setConstituting(true)}><Compass size={15} /> Constituer un programme</Button>
      ) : opportunity.status === "converted_to_program" ? (
        <p className="rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Cette opportunité a déjà été constituée en programme.</p>
      ) : QUALIFIABLE_STATUSES.has(opportunity.status) ? (
        <div className="space-y-2">
          <p className="rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Cette opportunité doit être qualifiée avant de pouvoir devenir un programme.</p>
          <Button variant="outline" className="w-full" disabled={qualifying} onClick={qualify}><CheckCircle2 size={15} /> {qualifying ? "Qualification…" : "Marquer comme qualifiée"}</Button>
        </div>
      ) : (
        <p className="rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Cette opportunité n’est plus active ({programOpportunityStatusLabels[opportunity.status].toLowerCase()}).</p>
      )}
    </div>
  );
}
