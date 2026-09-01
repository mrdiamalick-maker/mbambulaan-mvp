"use client";

// ProgramOpportunityDossier — LOT 2 (mandat "Vertical Slice Kayar", §11).
// Une opportunité de développement n'est jamais présentée comme un
// programme financé (mandat §12) : pas de budget, pas de partenaire, pas
// de bailleur ici — uniquement le problème, sa justification, ce qui reste
// à qualifier et plusieurs pistes d'intervention, jamais une seule
// solution "recommandée".
import { FormEvent, useState } from "react";
import { CheckCircle2, Compass } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import type { ProductState, ProgramOpportunity } from "@/domain/types";
import { fieldMissionStatusLabels, observationNatureLabels, programOpportunityMaturityLabels, programOpportunityStatusLabels } from "@/domain/types";
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
  const [constituting, setConstituting] = useState(false);
  const [qualifyFormOpen, setQualifyFormOpen] = useState(false);
  const territories = opportunity.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
  const evidence = opportunity.evidenceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  // LOT 3 (mandat §15) : l'opportunité accède aux nouvelles preuves
  // terrain sans duplication manuelle — même filtrage par
  // collectiveNeedId que CollectiveNeedDossier, aucune copie locale.
  const relatedMissions = state.fieldMissions.filter((item) => item.collectiveNeedId === opportunity.collectiveNeedId);

  if (constituting) {
    return <InitiativeForm programOpportunity={opportunity} state={state} onDone={onDone} onCancel={() => setConstituting(false)} />;
  }

  if (qualifyFormOpen) {
    return <QualifyOpportunityForm opportunity={opportunity} onCancel={() => setQualifyFormOpen(false)} />;
  }

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

      {relatedMissions.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nouveaux éléments terrain</p>
          <div className="mt-2 space-y-3">
            {relatedMissions.map((mission) => {
              const missionObservations = state.observations.filter((item) => item.missionId === mission.id);
              return (
                <div key={mission.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium leading-5">{mission.title}</p>
                    <Badge variant="outline">{fieldMissionStatusLabels[mission.status]}</Badge>
                  </div>
                  {missionObservations.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {missionObservations.map((observation) => (
                        <li key={observation.id} className="text-xs leading-5 text-muted-foreground">
                          <span className="font-semibold text-foreground">{observationNatureLabels[observation.nature]}</span> — {observation.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">Aucune observation enregistrée pour l’instant.</p>
                  )}
                </div>
              );
            })}
          </div>
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
          <Button variant="outline" className="w-full" onClick={() => setQualifyFormOpen(true)}><CheckCircle2 size={15} /> Qualifier l’opportunité</Button>
        </div>
      ) : (
        <p className="rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Cette opportunité n’est plus active ({programOpportunityStatusLabels[opportunity.status].toLowerCase()}).</p>
      )}
    </div>
  );
}

// QualifyOpportunityForm — micro-correctif Product Review (post-LOT 2,
// 2026-09-01, "qualification ProgramOpportunity : éviter le bouton
// administratif"). Qualifier n'est plus un simple bouton avec une note
// codée en dur ("Éléments disponibles jugés suffisants...") — c'est une
// décision documentée : la justification saisie ici EST la note envoyée à
// update_program_opportunity_status, jamais une phrase fixe. Ne bloque
// jamais la qualification au prétexte que knowledgeGaps est non vide
// (mandat : qualifier ≠ lever toutes les inconnues) — le champ "inconnues
// restantes" reste facultatif, sert seulement à documenter ce qui n'est
// plus bloquant vs ce qui reste à vérifier pendant la conception. Pas de
// nouvel objet métier : tout tient dans la note de la transition (mandat,
// "pas de nouvel objet métier nécessaire si note suffit").
function QualifyOpportunityForm({ opportunity, onCancel }: { opportunity: ProgramOpportunity; onCancel: () => void }) {
  const { run } = useProduct();
  const [justification, setJustification] = useState("");
  const [remainingUnknowns, setRemainingUnknowns] = useState(opportunity.knowledgeGaps.join("\n"));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!justification.trim()) { setError("La justification de la qualification est obligatoire — pourquoi les éléments disponibles sont-ils désormais suffisants pour passer en conception ?"); return; }
    setPending(true);
    try {
      const note = remainingUnknowns.trim()
        ? `${justification.trim()} — Inconnues restantes à traiter pendant la conception : ${remainingUnknowns.trim()}`
        : justification.trim();
      const ok = await run({ type: "update_program_opportunity_status", programOpportunityId: opportunity.id, status: "qualified", note });
      if (ok) onCancel();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qualifier l’opportunité</p>
      <p className="text-xs leading-5 text-muted-foreground">Qualifier ne signifie pas que toutes les inconnues sont levées ; cela signifie que les éléments disponibles sont jugés suffisants pour engager une phase de conception, avec les incertitudes restantes explicitement documentées.</p>

      <label className="block text-xs font-semibold">
        Justification de la qualification
        <textarea required rows={3} value={justification} onChange={(event) => setJustification(event.target.value)} placeholder="Pourquoi les éléments disponibles sont-ils désormais suffisants pour passer en conception ?" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Traitement des inconnues restantes (facultatif)
        <textarea rows={3} value={remainingUnknowns} onChange={(event) => setRemainingUnknowns(event.target.value)} placeholder="Ce qui reste à vérifier pendant la conception, ou ce qui n'est plus bloquant." className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Confirmation…" : "Confirmer la qualification"}</Button>
      </div>
    </form>
  );
}
