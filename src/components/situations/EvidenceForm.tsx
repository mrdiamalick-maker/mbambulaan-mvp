"use client";

// Formulaire de preuve — Lot 4, étape 4/4. Additif à record_result
// (SituationAction.tsx, texte libre hérité d'avant le Lot 1) : ne le
// remplace pas, voir D10 (PRODUCT_DECISION_LOG.md) — dette ouverte à
// trancher avant de considérer le modèle métier stabilisé.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import { evidenceTypeLabels, type Commitment, type EvidenceType } from "@/domain/types";

export function EvidenceForm({ situationId, commitments, onDone }: { situationId: string; commitments: Commitment[]; onDone: () => void }) {
  const { run } = useProduct();
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("confirmation");
  const [commitmentId, setCommitmentId] = useState("");
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const ok = await run({ type: "record_evidence", situationId, evidenceType, label, detail, commitmentId: commitmentId || undefined });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <label className="block text-xs font-semibold">
        Type de preuve
        <select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as EvidenceType)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(evidenceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {commitments.length > 0 && (
        <label className="block text-xs font-semibold">
          Engagement concerné (facultatif)
          <select value={commitmentId} onChange={(event) => setCommitmentId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Aucun — preuve générale de la situation</option>
            {commitments.map((commitment) => <option key={commitment.id} value={commitment.id}>{commitment.label}</option>)}
          </select>
        </label>
      )}
      <label className="block text-xs font-semibold">
        Libellé
        <input required value={label} onChange={(event) => setLabel(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex. Photo de la machine réparée" />
      </label>
      <label className="block text-xs font-semibold">
        Détail
        <textarea required rows={4} value={detail} onChange={(event) => setDetail(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ce que la preuve montre ou confirme, et par qui." />
      </label>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Enregistrement…" : "Enregistrer la preuve"}</Button>
    </form>
  );
}
