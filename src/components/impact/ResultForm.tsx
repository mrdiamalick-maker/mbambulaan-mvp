"use client";

// ResultForm — LOT 4 (mandat "de l'action à la valeur démontrable", §6/§7).
// create_result : geste explicite pour les sources qui ne passent pas par
// record_result (Initiative — vertical slice Programme). Situation garde
// son geste existant (record_result, SituationAction.tsx) — ce formulaire
// ne le duplique pas, il couvre le cas non couvert.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { EvidenceType, TrustLevel } from "@/domain/types";
import { evidenceTypeLabels } from "@/domain/types";

const trustOptions: { value: TrustLevel; label: string }[] = [
  { value: "declaree", label: "Déclaré" },
  { value: "observee", label: "Observé" },
  { value: "documentee", label: "Documenté" },
  { value: "verifiee", label: "Vérifié" },
  { value: "officielle", label: "Officiel" }
];

export function ResultForm({ initiativeId, onDone, onCancel }: { initiativeId: string; onDone: () => void; onCancel: () => void }) {
  const { run } = useProduct();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trust, setTrust] = useState<TrustLevel>("documentee");
  const [attachEvidence, setAttachEvidence] = useState(false);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("document");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!title.trim() || !description.trim()) { setError("Le titre et la description de ce qui a été réalisé sont obligatoires."); return; }
    if (attachEvidence && (!evidenceLabel.trim() || !evidenceDetail.trim())) { setError("Une preuve jointe doit préciser un libellé et un détail."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "create_result",
        title: title.trim(),
        description: description.trim(),
        sourceRef: { objectType: "initiative", objectId: initiativeId },
        trust,
        evidence: attachEvidence ? { evidenceType, label: evidenceLabel.trim(), detail: evidenceDetail.trim() } : undefined
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a été réalisé</p>
      <p className="text-xs leading-5 text-muted-foreground">Un fait constatable — ce qui a effectivement été produit ou réalisé, pas encore ce que cela a changé.</p>

      <label className="block text-xs font-semibold">
        Titre
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Description — ce qui a été fait
        <textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Niveau de confiance
        <select value={trust} onChange={(event) => setTrust(event.target.value as TrustLevel)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {trustOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs font-semibold">
        <input type="checkbox" checked={attachEvidence} onChange={(event) => setAttachEvidence(event.target.checked)} />
        Joindre une preuve
      </label>
      {attachEvidence && (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          <select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as EvidenceType)} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {Object.entries(evidenceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input value={evidenceLabel} onChange={(event) => setEvidenceLabel(event.target.value)} placeholder="Libellé de la preuve" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <textarea rows={2} value={evidenceDetail} onChange={(event) => setEvidenceDetail(event.target.value)} placeholder="Détail — ce que la preuve montre" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      )}

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Enregistrement…" : "Enregistrer le résultat"}</Button>
      </div>
    </form>
  );
}
