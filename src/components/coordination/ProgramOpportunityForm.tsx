"use client";

// ProgramOpportunityForm — LOT 2 (mandat "Vertical Slice Kayar", §10/§11) :
// transforme un besoin collectif qualifié en opportunité de développement
// réelle (create_program_opportunity), uniquement sur action humaine
// explicite — jamais à l'ouverture du dossier (mandat §10, TEST D). Les
// champs déjà connus (problème, justification, bénéficiaires potentiels,
// hypothèses, connaissance manquante) sont pré-remplis depuis le besoin
// collectif et son Constat Mbàmbulaan pour éviter une ressaisie, mais
// restent modifiables — "examiner" implique un vrai regard humain, pas une
// simple confirmation. territoryIds/evidenceRefs reprennent tels quels les
// données déjà réelles du besoin (aucune raison de les re-choisir).
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import type { CollectiveNeed, ProductState, ProgramOpportunityMaturity } from "@/domain/types";
import { programOpportunityMaturityLabels } from "@/domain/types";
import { findingsReferencedBy, resolveFindings } from "@/domain/situation-narrative";

function linesToList(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function ProgramOpportunityForm({ need, state, onDone, onCancel }: { need: CollectiveNeed; state: ProductState; onDone: () => void; onCancel: () => void }) {
  const { run } = useProduct();
  const explainingFinding = findingsReferencedBy(state, need.sourceRefs)[0];
  const knowledgeGapFindings = resolveFindings(state, need.knowledgeGapFindingIds);
  const territories = need.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);

  const [problem, setProblem] = useState(explainingFinding?.statement ?? need.title);
  const [justification, setJustification] = useState(explainingFinding?.explanation ?? "");
  const [potentialBeneficiaries, setPotentialBeneficiaries] = useState(need.affectedPopulation);
  const [hypotheses, setHypotheses] = useState(need.hypotheses.join("\n"));
  const [knowledgeGaps, setKnowledgeGaps] = useState(
    knowledgeGapFindings.length > 0 ? knowledgeGapFindings.map((item) => item.statement).join("\n") : need.knowledgeGaps.join("\n")
  );
  const [possibleInterventions, setPossibleInterventions] = useState("");
  const [desiredOutcomes, setDesiredOutcomes] = useState("");
  const [maturity, setMaturity] = useState<ProgramOpportunityMaturity | "">("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const interventions = linesToList(possibleInterventions);
    const outcomes = linesToList(desiredOutcomes);
    // Garde-fou produit (mandat §1/§11 : "le but est précisément de montrer
    // que Mbàmbulaan sait éviter" le raccourci "un problème → une solution
    // déjà choisie") — au moins 2 pistes distinctes, jamais une seule
    // solution présentée d'emblée comme la bonne. Rien d'équivalent côté
    // Core (create_program_opportunity n'impose pas de minimum) : garde
    // volontairement posée ici, au niveau du geste humain qu'est "examiner
    // une opportunité", pas une règle métier générale.
    if (interventions.length < 2) { setError("Indiquez au moins deux pistes d'intervention distinctes — ne pas présenter une solution unique déjà décidée."); return; }
    if (outcomes.length < 1) { setError("Indiquez au moins un résultat recherché."); return; }
    if (!maturity) { setError("Choisissez un niveau de maturité."); return; }
    if (!problem.trim() || !justification.trim() || !potentialBeneficiaries.trim()) { setError("Le problème, la justification et les bénéficiaires potentiels sont obligatoires."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "create_program_opportunity",
        collectiveNeedId: need.id,
        problem: problem.trim(),
        justification: justification.trim(),
        territoryIds: need.territoryIds,
        potentialBeneficiaries: potentialBeneficiaries.trim(),
        evidenceRefs: need.sourceRefs,
        hypotheses: linesToList(hypotheses),
        knowledgeGaps: linesToList(knowledgeGaps),
        possibleInterventions: interventions,
        desiredOutcomes: outcomes,
        possibleIndicators: [],
        maturity
      });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Examiner comme opportunité de développement</p>
      <p className="text-xs leading-5 text-muted-foreground">Une opportunité de développement n’est ni un programme financé, ni une solution déjà choisie — elle documente le problème, ce qui reste à vérifier, et plusieurs pistes à étudier.</p>

      <div className="rounded-md border bg-muted p-3 text-xs text-muted-foreground">{territories.join(" · ")}</div>

      <label className="block text-xs font-semibold">
        Problème
        <textarea required rows={2} value={problem} onChange={(event) => setProblem(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Justification — pourquoi une intervention structurée
        <textarea required rows={2} value={justification} onChange={(event) => setJustification(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Bénéficiaires potentiels
        <input required value={potentialBeneficiaries} onChange={(event) => setPotentialBeneficiaries(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Hypothèses (une par ligne, facultatif)
        <textarea rows={2} value={hypotheses} onChange={(event) => setHypotheses(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Ce qui reste à qualifier (une ligne par angle mort, facultatif)
        <textarea rows={2} value={knowledgeGaps} onChange={(event) => setKnowledgeGaps(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Interventions envisageables — pistes à étudier, une par ligne (au moins 2)
        <textarea required rows={3} value={possibleInterventions} onChange={(event) => setPossibleInterventions(event.target.value)} placeholder={"Ex. maintenance préventive\nEx. formation à l'entretien\nEx. accès facilité aux pièces"} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Résultats recherchés — une ligne par résultat
        <textarea required rows={2} value={desiredOutcomes} onChange={(event) => setDesiredOutcomes(event.target.value)} placeholder={"Ex. réduire les immobilisations\nEx. améliorer l'accès à la maintenance"} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <label className="block text-xs font-semibold">
        Maturité de l’opportunité
        <select required value={maturity} onChange={(event) => setMaturity(event.target.value as ProgramOpportunityMaturity)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Sélectionner…</option>
          {Object.entries(programOpportunityMaturityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <p className="text-[11px] text-muted-foreground">Indicateurs proposés : à définir lors de la conception du programme.</p>

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={pending} className="flex-1">{pending ? "Création…" : "Ouvrir l'opportunité"}</Button>
      </div>
    </form>
  );
}
