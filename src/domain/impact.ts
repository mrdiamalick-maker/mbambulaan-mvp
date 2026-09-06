// Impact & Learning — Result → Outcome → Impact → Learning (LOT 4, mandat
// "de l'action à la valeur démontrable"). Fichier dédié, même discipline
// de séparation que knowledge-pipeline.ts / field-mission.ts : un domaine
// fonctionnel distinct de la machine à états de Situation.
//
// Discipline commune rappelée une fois ici plutôt que répétée à chaque
// fonction :
// - aucune promotion automatique. Un Result ne devient jamais un Outcome
//   tout seul (mandat §2, TEST B) ; un Outcome ne crée jamais
//   d'ImpactEvidence (mandat §2/§13, TEST F) ; un Learning n'est jamais
//   généré par le système (mandat §14, TEST H).
// - jamais transformer une corrélation en causalité (mandat §3) :
//   attribution toujours explicite, jamais déduite.
// - Situation.result/confirmation restent inchangés (mandat §7) — le
//   Result canonique produit par record_result est câblé directement
//   dans rules.ts (même handler que la machine à états de Situation),
//   pas ici.
import type { Command, Evidence, EvidenceType, ImpactEvidence, Initiative, KnowledgeSourceRef, Learning, Outcome, ProductState, Result, Situation, TrustLevel } from "./types";
import { id, timestamp, withAudit } from "./rules";
import { resolveKnowledgeSourceRef } from "./knowledge-pipeline";

function createEvidenceFromInput(
  input: { evidenceType: EvidenceType; label: string; detail: string } | undefined,
  actorId: string,
  trust: TrustLevel,
  refs: { resultId?: string; outcomeId?: string; impactId?: string }
): Evidence | undefined {
  if (!input) return undefined;
  if (!input.label.trim() || !input.detail.trim()) throw new Error("Une preuve jointe doit avoir un libellé et un détail.");
  return {
    id: id("ev"),
    type: input.evidenceType,
    label: input.label.trim(),
    detail: input.detail.trim(),
    recordedByActorId: actorId,
    recordedAt: timestamp(),
    trust,
    ...refs
  };
}

// create_result — Result canonique manuel (mandat §6/§7). Utilisé pour
// les sources qui ne passent pas par record_result (Initiative,
// vertical slice Programme) — record_result (Situation) produit son
// propre Result directement dans rules.ts.
function applyCreateResult(state: ProductState, command: Extract<Command, { type: "create_result" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre du résultat est obligatoire.");
  if (!command.description.trim()) throw new Error("La description de ce qui a été réalisé est obligatoire.");

  let territoryIds: string[];
  let sourceObject: Situation | Initiative | undefined;
  if (command.sourceRef.objectType === "situation") {
    sourceObject = state.situations.find((item) => item.id === command.sourceRef.objectId);
    if (!sourceObject) throw new Error("La situation source est introuvable.");
    territoryIds = [sourceObject.territoryId];
  } else {
    sourceObject = state.initiatives.find((item) => item.id === command.sourceRef.objectId);
    if (!sourceObject) throw new Error("Le programme source est introuvable.");
    territoryIds = sourceObject.territoryIds;
  }

  const result: Result = {
    id: id("result"),
    title: command.title.trim(),
    description: command.description.trim(),
    sourceRef: command.sourceRef,
    territoryIds,
    recordedAt: timestamp(),
    recordedByActorId: command.actorId,
    evidenceRefs: [],
    trust: command.trust
  };

  const evidence = createEvidenceFromInput(command.evidence, command.actorId, command.trust, { resultId: result.id });
  if (evidence) result.evidenceRefs = [evidence.id];

  const next: ProductState = {
    ...state,
    results: [result, ...state.results],
    evidences: evidence ? [evidence, ...state.evidences] : state.evidences
  };
  return withAudit(next, command.actorId, "result", result.id, command.type, result.title);
}

// record_outcome (mandat §6/§11/§12, TEST C/D/E) — le changement
// opérationnel observé, jamais confondu avec l'indicateur qui le mesure
// (mandat §8 : "current ≠ Outcome automatiquement").
function applyRecordOutcome(state: ProductState, command: Extract<Command, { type: "record_outcome" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre du changement observé est obligatoire.");
  if (!command.statement.trim()) throw new Error("La description du changement observé est obligatoire.");
  if (command.sourceResultIds.length === 0) throw new Error("Un changement observé doit s'appuyer sur au moins un résultat réel.");
  // Garde-fou d'exécution (TEST D) au-delà du typage : l'attribution ne
  // doit jamais rester implicite, même si un appelant contournait le
  // typage (ex. dispatch depuis une source moins strictement typée).
  if (!command.attribution) throw new Error("Le niveau d'attribution est obligatoire.");

  const sourceResults = command.sourceResultIds.map((resultId) => {
    const result = state.results.find((item) => item.id === resultId);
    if (!result) throw new Error(`Résultat source introuvable : ${resultId}.`);
    return result;
  });

  // Attribution directe exige une justification (TEST E) — jamais
  // implicite. Les 2 autres niveaux restent recommandés (limits) sans
  // être forcés : "corrélation / non établie" n'a par définition rien à
  // justifier de plus que le constat lui-même.
  if (command.attribution === "directe" && !command.attributionJustification?.trim()) {
    throw new Error("Une attribution directe exige une justification.");
  }

  const territoryIds = Array.from(new Set(sourceResults.flatMap((item) => item.territoryIds)));

  const outcome: Outcome = {
    id: id("outcome"),
    title: command.title.trim(),
    statement: command.statement.trim(),
    territoryIds,
    sourceResultIds: command.sourceResultIds,
    baseline: command.baseline?.trim() || undefined,
    observedAt: command.observedAt ?? timestamp(),
    evidenceRefs: [],
    trust: command.trust,
    attribution: command.attribution,
    attributionJustification: command.attributionJustification?.trim() || undefined,
    limits: command.limits?.trim() || undefined,
    createdByActorId: command.actorId,
    createdAt: timestamp()
  };

  const evidence = createEvidenceFromInput(command.evidence, command.actorId, command.trust, { outcomeId: outcome.id });
  if (evidence) outcome.evidenceRefs = [evidence.id];

  const next: ProductState = {
    ...state,
    outcomes: [outcome, ...state.outcomes],
    evidences: evidence ? [evidence, ...state.evidences] : state.evidences
  };
  return withAudit(next, command.actorId, "outcome", outcome.id, command.type, outcome.title);
}

// record_impact (mandat §6/§13, TEST F/G) — toujours une commande
// explicite distincte, jamais un effet de bord de record_outcome.
// status "a_mesurer" est un état honnête à part entière.
function applyRecordImpact(state: ProductState, command: Extract<Command, { type: "record_impact" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre de l'impact est obligatoire.");
  if (!command.statement.trim()) throw new Error("L'énoncé de l'effet revendiqué/observé est obligatoire.");
  const outcome = state.outcomes.find((item) => item.id === command.outcomeId);
  if (!outcome) throw new Error("Le changement observé source est introuvable.");
  // Micro-correctif Product (post-LOT 4, "attribution directe doit être
  // justifiée") : même garde-fou que record_outcome — un impact plus
  // large exige un niveau de preuve élevé, jamais implicite.
  if (command.attribution === "directe" && !command.attributionJustification?.trim()) {
    throw new Error("Une attribution directe exige une justification.");
  }

  const impact: ImpactEvidence = {
    id: id("impact"),
    title: command.title.trim(),
    statement: command.statement.trim(),
    outcomeId: outcome.id,
    territoryIds: outcome.territoryIds,
    attribution: command.attribution,
    attributionJustification: command.attributionJustification?.trim() || undefined,
    status: command.status,
    evidenceRefs: [],
    period: command.period?.trim() || undefined,
    limits: command.limits?.trim() || undefined,
    simulated: command.simulated ?? false,
    createdByActorId: command.actorId,
    createdAt: timestamp()
  };

  const evidence = createEvidenceFromInput(command.evidence, command.actorId, "estimee", { impactId: impact.id });
  if (evidence) impact.evidenceRefs = [evidence.id];

  const next: ProductState = {
    ...state,
    impactEvidences: [impact, ...state.impactEvidences],
    evidences: evidence ? [evidence, ...state.evidences] : state.evidences
  };
  return withAudit(next, command.actorId, "impact_evidence", impact.id, command.type, impact.title);
}

// record_learning (mandat §14/§15, TEST H/I) — toujours un geste humain
// explicite, jamais généré par le système. Au moins une source réelle
// exigée (l'un des 4 champs de traçabilité, résolu, ou une sourceRefs
// non vide et résolue) : un Learning ne flotte jamais sans origine.
function applyRecordLearning(state: ProductState, command: Extract<Command, { type: "record_learning" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre de l'apprentissage est obligatoire.");
  if (!command.summary.trim()) throw new Error("Le résumé de l'apprentissage est obligatoire.");

  if (command.situationId && !state.situations.some((item) => item.id === command.situationId)) {
    throw new Error("La situation source est introuvable.");
  }
  if (command.initiativeId && !state.initiatives.some((item) => item.id === command.initiativeId)) {
    throw new Error("Le programme source est introuvable.");
  }
  if (command.outcomeId && !state.outcomes.some((item) => item.id === command.outcomeId)) {
    throw new Error("Le changement observé source est introuvable.");
  }
  if (command.fieldMissionId && !state.fieldMissions.some((item) => item.id === command.fieldMissionId)) {
    throw new Error("La mission terrain source est introuvable.");
  }
  const sourceRefs = command.sourceRefs ?? [];
  for (const ref of sourceRefs) {
    if (!resolveKnowledgeSourceRef(state, ref)) {
      throw new Error(`Un apprentissage référence ${ref.objectType}:${ref.objectId}, introuvable.`);
    }
  }
  const hasSource = Boolean(command.situationId || command.initiativeId || command.outcomeId || command.fieldMissionId || sourceRefs.length > 0);
  if (!hasSource) throw new Error("Un apprentissage doit toujours pouvoir être rattaché à une source réelle.");

  const learning: Learning = {
    id: id("learn"),
    situationId: command.situationId,
    initiativeId: command.initiativeId,
    outcomeId: command.outcomeId,
    fieldMissionId: command.fieldMissionId,
    title: command.title.trim(),
    summary: command.summary.trim(),
    context: command.context?.trim() || undefined,
    reusableIn: command.reusableIn,
    sourceRefs: sourceRefs.length > 0 ? sourceRefs : undefined,
    createdByActorId: command.actorId,
    createdAt: timestamp(),
    status: command.status ?? ("propose" as const),
    relatedRuleId: command.relatedRuleId
  };

  const next: ProductState = { ...state, learnings: [learning, ...state.learnings] };
  return withAudit(next, command.actorId, "learning", learning.id, command.type, learning.title);
}

export function applyImpactCommand(
  state: ProductState,
  command: Extract<Command, { type: "create_result" | "record_outcome" | "record_impact" | "record_learning" }>
): ProductState {
  switch (command.type) {
    case "create_result":
      return applyCreateResult(state, command);
    case "record_outcome":
      return applyRecordOutcome(state, command);
    case "record_impact":
      return applyRecordImpact(state, command);
    case "record_learning":
      return applyRecordLearning(state, command);
  }
}

// KnowledgeSourceRef non utilisé directement ici mais réexporté pour les
// consommateurs qui typent leurs propres helpers autour de ce pipeline
// (tests inclus) — même convention que Signal dans knowledge-pipeline.ts.
export type { KnowledgeSourceRef };
