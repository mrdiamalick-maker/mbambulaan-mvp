"use client";

// InitiativeForm — LOT 2 (mandat "Vertical Slice Kayar", §13) : réécrit
// pour n'accepter que la conversion explicite d'une ProgramOpportunity
// qualifiée en Programme (create_initiative, voie programOpportunityId).
// L'ancienne voie "regrouper des ServiceRequest par intention" (seuil ≥ 2)
// est retirée de l'UI avec CollectiveNeedsPanel — le Core continue de
// l'accepter techniquement (serviceRequestIds), mais l'expérience ne doit
// plus l'exposer (mandat §4/§14/§15 : "2 demandes similaires → Programme"
// n'est plus le chemin proposé). Budget non obligatoire (§13) :
// budgetStatus retombe sur "a_estimer" côté Core si aucun montant n'est
// saisi ici.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { ProductState, ProgramOpportunity } from "@/domain/types";

export function InitiativeForm({
  programOpportunity,
  state,
  onDone,
  onCancel
}: {
  programOpportunity: ProgramOpportunity;
  state: ProductState;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { run } = useProduct();
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState(programOpportunity.desiredOutcomes.join(" ; "));
  const [budgetFcfa, setBudgetFcfa] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const territories = programOpportunity.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const budget = budgetFcfa.trim() ? Number(budgetFcfa) : undefined;
    if (budget !== undefined && (!Number.isFinite(budget) || budget <= 0)) { setError("Le budget, s'il est renseigné, doit être un montant positif."); return; }
    setPending(true);
    try {
      const ok = await run({
        type: "create_initiative",
        title,
        objective,
        budgetFcfa: budget,
        budgetStatus: budget !== undefined ? "estime" : "a_estimer",
        programOpportunityId: programOpportunity.id
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Constituer un programme</p>
      <div className="rounded-md border bg-muted p-3">
        <p className="text-xs font-semibold text-muted-foreground">Depuis l’opportunité de développement</p>
        <p className="mt-1 text-sm font-semibold">{programOpportunity.problem}</p>
        <p className="mt-1 text-xs text-muted-foreground">{territories.join(" · ")}</p>
      </div>
      <label className="block text-xs font-semibold">
        Titre du programme
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex. Programme de fiabilisation de la motorisation — Kayar/Fass Boye" />
      </label>
      <label className="block text-xs font-semibold">
        Objectif
        <textarea required rows={3} value={objective} onChange={(event) => setObjective(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Budget indicatif (FCFA) — facultatif
        <input type="number" min={1} step={1} value={budgetFcfa} onChange={(event) => setBudgetFcfa(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Laisser vide si le budget reste à estimer" />
      </label>
      <p className="text-xs text-muted-foreground">Le programme démarre en cadrage. Sans montant saisi, le budget reste explicitement « à estimer » — l’instruction financière se construit ensuite, à part de ce cadrage.</p>
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Création…" : "Créer le programme"}</Button>
      </div>
    </form>
  );
}
