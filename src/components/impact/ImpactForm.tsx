"use client";

// ImpactForm — LOT 4 (mandat §6/§13). Jamais obligatoire : "Impact à
// mesurer" reste, dans la plupart des scénarios V1, l'état honnête à
// laisser tel quel (ne rien créer). Ce formulaire sert quand un
// coordinateur veut explicitement documenter — même pour dire
// honnêtement "à mesurer" avec sa justification — plutôt que laisser un
// silence ambigu.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { AttributionLevel, EvidenceType, ImpactStatus, Outcome } from "@/domain/types";
import { attributionLevelLabels, evidenceTypeLabels, impactStatusLabels } from "@/domain/types";

export function ImpactForm({ outcome, onDone, onCancel }: { outcome: Outcome; onDone: () => void; onCancel: () => void }) {
  const { run } = useProduct();
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [status, setStatus] = useState<ImpactStatus>("a_mesurer");
  const [attribution, setAttribution] = useState<AttributionLevel>(outcome.attribution);
  const [attributionJustification, setAttributionJustification] = useState("");
  const [period, setPeriod] = useState("");
  const [limits, setLimits] = useState("");
  const [attachEvidence, setAttachEvidence] = useState(false);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("mesure");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!title.trim() || !statement.trim()) { setError("Le titre et l'énoncé de l'effet sont obligatoires — même pour dire qu'il reste à mesurer."); return; }
    if (attribution === "directe" && !attributionJustification.trim()) { setError("Une attribution directe exige une justification."); return; }
    if (attachEvidence && (!evidenceLabel.trim() || !evidenceDetail.trim())) { setError("Une preuve jointe doit préciser un libellé et un détail."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "record_impact",
        title: title.trim(),
        statement: statement.trim(),
        outcomeId: outcome.id,
        attribution,
        attributionJustification: attributionJustification.trim() || undefined,
        status,
        period: period.trim() || undefined,
        limits: limits.trim() || undefined,
        evidence: attachEvidence ? { evidenceType, label: evidenceLabel.trim(), detail: evidenceDetail.trim() } : undefined
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Impact</p>
      <p className="text-xs leading-5 text-muted-foreground">Un effet plus large ou durable — « à mesurer » est un état honnête, pas un échec à masquer. Ne jamais extrapoler un changement local en effet national.</p>

      <label className="block text-xs font-semibold">
        Titre
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Effet revendiqué ou observé
        <textarea required rows={3} value={statement} onChange={(event) => setStatement(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Statut
        <select value={status} onChange={(event) => setStatus(event.target.value as ImpactStatus)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(impactStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Lien avec l’intervention (attribution)
        <select value={attribution} onChange={(event) => setAttribution(event.target.value as AttributionLevel)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(attributionLevelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {attribution === "directe" && (
        <label className="block text-xs font-semibold">
          Pourquoi reliez-vous cet impact directement à l’intervention ?
          <textarea required rows={2} value={attributionJustification} onChange={(event) => setAttributionJustification(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <span className="mt-1 block text-[11px] font-normal text-muted-foreground">Un impact plus large ou durable exige un niveau de preuve élevé — plus élevé que pour un simple changement observé.</span>
        </label>
      )}
      <label className="block text-xs font-semibold">
        Période concernée (facultatif)
        <input value={period} onChange={(event) => setPeriod(event.target.value)} placeholder="Ex. Premier trimestre 2026" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Limites (facultatif)
        <textarea rows={2} value={limits} onChange={(event) => setLimits(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
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
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Enregistrement…" : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
