"use client";

// LearningForm — LOT 4 (mandat §14). Toujours un geste humain explicite :
// "Enregistrer un apprentissage" n'est jamais proposé pré-rempli avec une
// conclusion déjà écrite. Rattaché à exactement la source qui a motivé
// l'appel (situationId/initiativeId/outcomeId/fieldMissionId) — le
// composant parent choisit laquelle, ce formulaire ne les mélange pas.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { LearningStatus } from "@/domain/types";

export function LearningForm({
  situationId,
  initiativeId,
  outcomeId,
  fieldMissionId,
  onDone,
  onCancel
}: {
  situationId?: string;
  initiativeId?: string;
  outcomeId?: string;
  fieldMissionId?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { run } = useProduct();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [context, setContext] = useState("");
  const [reusableIn, setReusableIn] = useState("");
  const [status, setStatus] = useState<LearningStatus>("propose");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!title.trim() || !summary.trim()) { setError("Le titre et le résumé de l'apprentissage sont obligatoires."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "record_learning",
        title: title.trim(),
        summary: summary.trim(),
        context: context.trim() || undefined,
        reusableIn: reusableIn.split(",").map((item) => item.trim()).filter(Boolean),
        situationId,
        initiativeId,
        outcomeId,
        fieldMissionId,
        status
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que nous apprenons</p>
      <p className="text-xs leading-5 text-muted-foreground">Que devons-nous faire différemment ou réutiliser ailleurs ?</p>

      <label className="block text-xs font-semibold">
        Titre
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Apprentissage
        <textarea required rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Contexte (facultatif)
        <textarea rows={2} value={context} onChange={(event) => setContext(event.target.value)} placeholder="Dans quel cadre cet apprentissage a-t-il été identifié ?" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Réutilisable où — territoires séparés par une virgule (facultatif)
        <input value={reusableIn} onChange={(event) => setReusableIn(event.target.value)} placeholder="Ex. mbour, kayar" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Statut
        <select value={status} onChange={(event) => setStatus(event.target.value as LearningStatus)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="propose">Proposé</option>
          <option value="valide">Validé</option>
        </select>
      </label>

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Enregistrement…" : "Enregistrer l'apprentissage"}</Button>
      </div>
    </form>
  );
}
