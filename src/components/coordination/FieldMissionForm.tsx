"use client";

// FieldMissionForm — LOT 3 (mandat "Terrain — observer, vérifier et
// fiabiliser la réalité", §4/§5/§7) : transforme une décision humaine
// explicite ("Organiser une vérification terrain") en Mission réelle
// (create_field_mission), jamais à l'ouverture du dossier. Les axes
// d'observation sont pré-remplis à partir des 6 axes du mandat (état des
// moteurs, fréquence/nature des pannes, disponibilité des pièces, accès
// aux réparateurs, pratiques d'entretien, autres facteurs) mais restent
// modifiables — ce sont des axes à vérifier, jamais des conclusions déjà
// écrites (mandat §4). Même discipline que ProgramOpportunityForm (LOT 2) :
// un seul geste humain explicite crée l'objet, rien d'automatique.
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { CollectiveNeed, Finding, ProductState } from "@/domain/types";

function linesToList(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

const DEFAULT_OBSERVATION_POINTS = [
  "État des moteurs",
  "Fréquence et nature des pannes",
  "Disponibilité des pièces",
  "Accès aux réparateurs",
  "Pratiques d'entretien",
  "Autres facteurs"
].join("\n");

export function FieldMissionForm({
  need,
  knowledgeGap,
  state,
  onDone,
  onCancel
}: {
  need: CollectiveNeed;
  knowledgeGap: Finding;
  state: ProductState;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { run } = useProduct();
  const territories = need.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
  const agents = state.actors.filter((item) => item.role === "operateur" && need.territoryIds.some((id) => item.territoryIds.includes(id)));

  const [title, setTitle] = useState(`Qualifier les causes — ${need.title}`);
  const [objective, setObjective] = useState(knowledgeGap.nextStep || "Comprendre la cause dominante avant de concevoir une intervention.");
  const [reason, setReason] = useState(knowledgeGap.statement);
  const [observationPoints, setObservationPoints] = useState(DEFAULT_OBSERVATION_POINTS);
  const [responsibleActorId, setResponsibleActorId] = useState(agents[0]?.id ?? "");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const points = linesToList(observationPoints);
    if (!title.trim() || !objective.trim() || !reason.trim()) { setError("Le titre, l'objectif et la raison de la mission sont obligatoires."); return; }
    if (points.length === 0) { setError("Indiquez au moins un axe d'observation."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "create_field_mission",
        title: title.trim(),
        objective: objective.trim(),
        territoryIds: need.territoryIds,
        reason: reason.trim(),
        responsibleActorId: responsibleActorId || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        observationPoints: points,
        knowledgeGapFindingId: knowledgeGap.id,
        collectiveNeedId: need.id
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Organiser une vérification terrain</p>
      <p className="text-xs leading-5 text-muted-foreground">Une mission terrain ne préjuge d’aucune conclusion — elle organise une vérification sur des axes précis, pas une enquête ouverte ni une intervention déjà décidée.</p>

      <div className="rounded-md border bg-muted p-3 text-xs text-muted-foreground">{territories.join(" · ")}</div>

      <label className="block text-xs font-semibold">
        Titre de la mission
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Objectif
        <textarea required rows={2} value={objective} onChange={(event) => setObjective(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Raison de cette mission — pourquoi maintenant
        <textarea required rows={2} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Axes d’observation — un par ligne, pas des conclusions
        <textarea required rows={6} value={observationPoints} onChange={(event) => setObservationPoints(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Responsable de la mission
        <select value={responsibleActorId} onChange={(event) => setResponsibleActorId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">À désigner</option>
          {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select>
      </label>
      <label className="block text-xs font-semibold">
        Échéance (facultatif)
        <input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Création…" : "Créer la mission de qualification"}</Button>
      </div>
    </form>
  );
}
