"use client";

// Formulaire de décision — Lot 4, étape 3/4. Première écriture réelle
// sur create_decision hors Lot 1 : jusqu'ici la commande existait et
// était testée, mais seule sa lecture était consommée (Institution,
// Lot 2, "Décisions récentes"). Un coordinateur peut désormais trancher
// directement depuis la Situation Room.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import { decisionTypeLabels, type DecisionType } from "@/domain/types";

export function DecisionForm({ situationId, coordinationId, onDone }: { situationId: string; coordinationId?: string; onDone: () => void }) {
  const { run } = useProduct();
  const [decisionType, setDecisionType] = useState<DecisionType>("ouvrir_coordination");
  const [rationale, setRationale] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const ok = await run({ type: "create_decision", situationId, decisionType, rationale, coordinationId });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <label className="block text-xs font-semibold">
        Type de décision
        <select value={decisionType} onChange={(event) => setDecisionType(event.target.value as DecisionType)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(decisionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Motif
        <textarea required rows={4} value={rationale} onChange={(event) => setRationale(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ce qui justifie ce choix, pour que quiconque relise la situation plus tard comprenne le raisonnement." />
      </label>
      <p className="text-xs text-muted-foreground">La décision est tracée avec son auteur, sa date et son motif — elle rejoint l’historique de la situation.</p>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Enregistrement…" : "Enregistrer la décision"}</Button>
    </form>
  );
}
