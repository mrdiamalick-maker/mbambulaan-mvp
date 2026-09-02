"use client";

// OutcomeForm — LOT 4 (mandat §6/§11/§12). Documente le changement
// observé après un Result réel — jamais ouvert au chargement du dossier,
// toujours une décision humaine explicite. Formulaire volontairement
// court (mandat §11, "ne pas demander 30 champs") : changement observé,
// baseline, attribution + justification, limites, preuve facultative.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { AttributionLevel, EvidenceType, Result, TrustLevel } from "@/domain/types";
import { attributionLevelLabels, evidenceTypeLabels } from "@/domain/types";

const trustOptions: { value: TrustLevel; label: string }[] = [
  { value: "declaree", label: "Déclaré" },
  { value: "observee", label: "Observé" },
  { value: "documentee", label: "Documenté" },
  { value: "verifiee", label: "Vérifié" },
  { value: "estimee", label: "Estimé" }
];

export function OutcomeForm({ results, onDone, onCancel }: { results: Result[]; onDone: () => void; onCancel: () => void }) {
  const { run } = useProduct();
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>(results.length === 1 ? [results[0].id] : []);
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [baseline, setBaseline] = useState("");
  const [trust, setTrust] = useState<TrustLevel>("observee");
  const [attribution, setAttribution] = useState<AttributionLevel | "">("");
  const [attributionJustification, setAttributionJustification] = useState("");
  const [limits, setLimits] = useState("");
  const [attachEvidence, setAttachEvidence] = useState(false);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("mesure");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const toggleResult = (id: string) => {
    setSelectedResultIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (selectedResultIds.length === 0) { setError("Sélectionnez au moins un résultat réel à l'origine de ce changement."); return; }
    if (!title.trim() || !statement.trim()) { setError("Le titre et la description du changement observé sont obligatoires."); return; }
    if (!attribution) { setError("Le niveau d'attribution est obligatoire."); return; }
    if (attribution === "directe" && !attributionJustification.trim()) { setError("Une attribution directe exige une justification."); return; }
    if (attachEvidence && (!evidenceLabel.trim() || !evidenceDetail.trim())) { setError("Une preuve jointe doit préciser un libellé et un détail."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "record_outcome",
        title: title.trim(),
        statement: statement.trim(),
        sourceResultIds: selectedResultIds,
        baseline: baseline.trim() || undefined,
        trust,
        attribution,
        attributionJustification: attributionJustification.trim() || undefined,
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
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a changé</p>
      <p className="text-xs leading-5 text-muted-foreground">Une activité réalisée n’est pas un changement en soi — décrivez ce qui a réellement évolué, et dans quelle mesure Mbàmbulaan peut se l’attribuer.</p>

      <div>
        <p className="text-xs font-semibold">Résultat(s) source(s)</p>
        <div className="mt-1.5 space-y-1.5">
          {results.map((result) => (
            <label key={result.id} className="flex items-start gap-2 rounded-md border p-2 text-xs">
              <input type="checkbox" className="mt-0.5" checked={selectedResultIds.includes(result.id)} onChange={() => toggleResult(result.id)} />
              <span>
                <span className="block font-semibold">{result.title}</span>
                <span className="block text-muted-foreground">{result.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <label className="block text-xs font-semibold">
        Titre du changement observé
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Ce qui a changé
        <textarea required rows={3} value={statement} onChange={(event) => setStatement(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Baseline / élément de comparaison (facultatif)
        <textarea rows={2} value={baseline} onChange={(event) => setBaseline(event.target.value)} placeholder="Valeur d'indicateur, observation avant intervention, état initial documenté — ou laisser vide si absente." className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <span className="mt-1 block text-[11px] font-normal text-muted-foreground">Laissé vide : affiché comme « Baseline insuffisante pour mesurer précisément l’évolution », jamais fabriqué.</span>
      </label>
      <label className="block text-xs font-semibold">
        Niveau de confiance
        <select value={trust} onChange={(event) => setTrust(event.target.value as TrustLevel)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {trustOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <label className="block text-xs font-semibold">
        Lien avec l’intervention (attribution)
        <select required value={attribution} onChange={(event) => setAttribution(event.target.value as AttributionLevel)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Sélectionner…</option>
          {Object.entries(attributionLevelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {attribution === "directe" && (
        <label className="block text-xs font-semibold">
          Justification de l’attribution directe
          <textarea required rows={2} value={attributionJustification} onChange={(event) => setAttributionJustification(event.target.value)} placeholder="Pourquoi le lien causal est-il suffisamment documenté ?" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      )}
      <label className="block text-xs font-semibold">
        Limites / autres facteurs (facultatif, recommandé si attribution partielle ou non établie)
        <textarea rows={2} value={limits} onChange={(event) => setLimits(event.target.value)} placeholder="Ex. d'autres facteurs saisonniers ou externes pourraient aussi expliquer ce changement." className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
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
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Enregistrement…" : "Documenter le changement"}</Button>
      </div>
    </form>
  );
}
