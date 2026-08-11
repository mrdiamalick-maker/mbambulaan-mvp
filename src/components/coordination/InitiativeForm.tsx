"use client";

// Formulaire de programme — Lot 5, étape 4/4. Première écriture réelle sur
// create_initiative : promeut une grappe de ServiceRequest déjà groupées
// par CollectiveNeedsPanel (même intention, seuil ≥ 2 demandes distinctes)
// en programme réel. Les demandes concernées ne sont pas re-choisies ici
// — le regroupement vient du panneau, ce formulaire ne fait que nommer et
// budgéter le programme qui en naît.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { ProductState, ServiceRequest } from "@/domain/types";

export function InitiativeForm({
  requests,
  state,
  onDone
}: {
  requests: ServiceRequest[];
  state: ProductState;
  onDone: () => void;
}) {
  const { run } = useProduct();
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [budgetFcfa, setBudgetFcfa] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const budget = Number(budgetFcfa);
    if (!Number.isFinite(budget) || budget <= 0) return;
    setPending(true);
    try {
      const ok = await run({
        type: "create_initiative",
        title,
        objective,
        budgetFcfa: budget,
        serviceRequestIds: requests.map((request) => request.id)
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <div className="rounded-md border bg-muted p-3">
        <p className="text-xs font-semibold text-muted-foreground">Demandes regroupées ({requests.length})</p>
        <ul className="mt-2 space-y-1.5">
          {requests.map((request) => (
            <li key={request.id} className="text-xs">
              <span className="font-semibold">{state.territories.find((item) => item.id === request.territoryId)?.name ?? request.territoryId}</span>
              {" · "}
              <span className="text-muted-foreground">{state.actors.find((item) => item.id === request.actorId)?.name ?? request.actorId} — {request.reference}</span>
            </li>
          ))}
        </ul>
      </div>
      <label className="block text-xs font-semibold">
        Titre du programme
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex. Programme de formation à la manipulation post-capture" />
      </label>
      <label className="block text-xs font-semibold">
        Objectif
        <textarea required rows={3} value={objective} onChange={(event) => setObjective(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ce que le programme doit changer pour les territoires concernés." />
      </label>
      <label className="block text-xs font-semibold">
        Budget indicatif (FCFA)
        <input required type="number" min={1} step={1} value={budgetFcfa} onChange={(event) => setBudgetFcfa(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex. 12000000" />
      </label>
      <p className="text-xs text-muted-foreground">Le programme démarre en cadrage, sans financement confirmé — l’instruction financière se construit ensuite. Les demandes regroupées passent « couvertes ».</p>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Création…" : "Créer le programme"}</Button>
    </form>
  );
}
