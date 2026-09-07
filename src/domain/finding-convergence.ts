// P2.3-A — projection de convergence documentaire entre Findings.
//
// Cette lecture ne crée, ne confirme et ne promeut aucun objet métier. Elle
// rapproche seulement des constats déjà présents dans ProductState quand un
// lien structuré le justifie : référence explicite à un autre Finding, ou
// source métier strictement identique. Territoire, site, type et texte libre
// sont volontairement exclus des critères de rapprochement : ils décrivent
// un contexte, pas une preuve de relation entre deux constats.
import { resolveKnowledgeSourceRef } from "./knowledge-pipeline";
import type { Finding, KnowledgeSourceRef, ProductState, TrustLevel } from "./types";

export const FINDING_CONVERGENCE_DECISION_BOUNDARY =
  "Rapprochement documentaire à examiner ; ne constitue ni une décision, ni une certitude, ni une preuve de cause.";

const eligibleStatuses = new Set<Finding["status"]>(["proposed", "under_review", "confirmed"]);

// Sources suffisamment discriminantes pour relier deux Findings. Une même
// référence territory/site ne suffit jamais : elle réintroduirait exactement
// le faux positif « même lieu = même réalité » interdit par le mandat.
const discriminatingSourceTypes = new Set<KnowledgeSourceRef["objectType"]>([
  "signal",
  "situation",
  "service_request",
  "evidence",
  "infrastructure",
  "vessel",
  "fishing_trip",
  "landing",
  "capacity"
]);

const limitedTrustLevels = new Set<TrustLevel>(["declaree", "estimee", "contestee", "expiree"]);

export type FindingConvergenceReason =
  | {
      kind: "explicit_finding_lineage";
      findingId: string;
      referencedFindingId: string;
    }
  | {
      kind: "shared_source";
      sourceRef: KnowledgeSourceRef;
      findingIds: string[];
    };

export type FindingConvergenceUncertaintyReason =
  | "knowledge_gap"
  | "status_proposed"
  | "status_under_review"
  | "trust_declaree"
  | "trust_estimee"
  | "trust_contestee"
  | "trust_expiree";

export interface FindingConvergenceUncertainty {
  findingId: string;
  reasons: FindingConvergenceUncertaintyReason[];
}

export interface FindingConvergenceSource {
  ref: KnowledgeSourceRef;
  findingIds: string[];
  // Certains objets source portent un niveau de confiance (Signal,
  // Situation, Evidence, Infrastructure, Vessel, Landing), d'autres non.
  // L'absence reste donc undefined : aucun niveau n'est fabriqué.
  trust?: TrustLevel;
}

export interface FindingConvergenceGroup {
  id: string;
  findingIds: string[];
  findings: Finding[];
  territoryIds: string[];
  reasons: FindingConvergenceReason[];
  sources: FindingConvergenceSource[];
  uncertainties: FindingConvergenceUncertainty[];
  decisionBoundary: typeof FINDING_CONVERGENCE_DECISION_BOUNDARY;
}

export function knowledgeSourceRefKey(ref: KnowledgeSourceRef): string {
  return `${ref.objectType}:${ref.objectId}`;
}

function sourceTrust(state: ProductState, ref: KnowledgeSourceRef): TrustLevel | undefined {
  switch (ref.objectType) {
    case "signal":
      return state.signals.find((item) => item.id === ref.objectId)?.trust;
    case "situation":
      return state.situations.find((item) => item.id === ref.objectId)?.trust;
    case "evidence":
      return state.evidences.find((item) => item.id === ref.objectId)?.trust;
    case "infrastructure":
      return state.infrastructures.find((item) => item.id === ref.objectId)?.trust;
    case "vessel":
      return state.vessels.find((item) => item.id === ref.objectId)?.trust;
    case "landing":
      return state.landings.find((item) => item.id === ref.objectId)?.trust;
    case "finding":
      return state.findings.find((item) => item.id === ref.objectId)?.trust;
    case "service_request":
    case "fishing_trip":
    case "capacity":
    case "territory":
    case "site":
      return undefined;
  }
}

function canReachFinding(startId: string, targetId: string, adjacency: Map<string, string[]>): boolean {
  const pending = [startId];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const current = pending.pop()!;
    if (current === targetId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of adjacency.get(current) ?? []) {
      if (!visited.has(next)) pending.push(next);
    }
  }

  return false;
}

function reasonKey(reason: FindingConvergenceReason): string {
  if (reason.kind === "explicit_finding_lineage") {
    return `lineage:${reason.findingId}:${reason.referencedFindingId}`;
  }
  return `shared:${knowledgeSourceRefKey(reason.sourceRef)}:${reason.findingIds.join(",")}`;
}

function uncertaintyFor(finding: Finding): FindingConvergenceUncertainty | undefined {
  const reasons: FindingConvergenceUncertaintyReason[] = [];
  if (finding.type === "knowledge_gap") reasons.push("knowledge_gap");
  if (finding.status === "proposed") reasons.push("status_proposed");
  if (finding.status === "under_review") reasons.push("status_under_review");
  if (limitedTrustLevels.has(finding.trust)) reasons.push(`trust_${finding.trust}` as FindingConvergenceUncertaintyReason);
  return reasons.length > 0 ? { findingId: finding.id, reasons } : undefined;
}

/**
 * Calcule des groupes de Findings reliés par une preuve documentaire
 * structurée. Résultat stable pour un même ProductState : aucun Date.now,
 * hasard, score sémantique ou effet de bord.
 */
export function computeFindingConvergences(state: ProductState): FindingConvergenceGroup[] {
  const findings = state.findings
    .filter((finding) => eligibleStatuses.has(finding.status))
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
  const findingById = new Map(findings.map((finding) => [finding.id, finding]));

  // Graphe dirigé brut des références Finding → Finding. Il sert uniquement
  // à repérer les cycles avant de transformer un lien valide en relation non
  // orientée. Un cycle ne devient jamais une corroboration par lui-même.
  const directedFindingRefs = new Map<string, string[]>();
  for (const finding of findings) {
    const targets = finding.sourceRefs
      .filter((ref): ref is Extract<KnowledgeSourceRef, { objectType: "finding" }> => ref.objectType === "finding")
      .map((ref) => ref.objectId)
      .filter((targetId) => targetId !== finding.id && findingById.has(targetId))
      .filter((targetId, index, all) => all.indexOf(targetId) === index)
      .sort();
    directedFindingRefs.set(finding.id, targets);
  }

  const neighbours = new Map(findings.map((finding) => [finding.id, new Set<string>()]));
  const reasons: FindingConvergenceReason[] = [];

  const connect = (leftId: string, rightId: string) => {
    if (leftId === rightId) return;
    neighbours.get(leftId)?.add(rightId);
    neighbours.get(rightId)?.add(leftId);
  };

  for (const finding of findings) {
    for (const referencedFindingId of directedFindingRefs.get(finding.id) ?? []) {
      // Si la cible peut déjà revenir vers l'origine, cette référence fait
      // partie d'un cycle (A↔B ou plus long) : elle est ignorée comme motif
      // de convergence, sans récursion non bornée.
      if (canReachFinding(referencedFindingId, finding.id, directedFindingRefs)) continue;
      connect(finding.id, referencedFindingId);
      reasons.push({ kind: "explicit_finding_lineage", findingId: finding.id, referencedFindingId });
    }
  }

  const findingsBySource = new Map<string, { ref: KnowledgeSourceRef; findingIds: Set<string> }>();
  for (const finding of findings) {
    for (const ref of finding.sourceRefs) {
      if (!discriminatingSourceTypes.has(ref.objectType) || !resolveKnowledgeSourceRef(state, ref)) continue;
      const key = knowledgeSourceRefKey(ref);
      const entry = findingsBySource.get(key) ?? { ref, findingIds: new Set<string>() };
      entry.findingIds.add(finding.id);
      findingsBySource.set(key, entry);
    }
  }

  for (const { ref, findingIds: sourceFindingIds } of [...findingsBySource.values()].sort((a, b) => knowledgeSourceRefKey(a.ref).localeCompare(knowledgeSourceRefKey(b.ref)))) {
    const ids = [...sourceFindingIds].sort();
    if (ids.length < 2) continue;
    for (let index = 1; index < ids.length; index += 1) connect(ids[0], ids[index]);
    reasons.push({ kind: "shared_source", sourceRef: ref, findingIds: ids });
  }

  const visited = new Set<string>();
  const components: string[][] = [];
  for (const finding of findings) {
    if (visited.has(finding.id) || (neighbours.get(finding.id)?.size ?? 0) === 0) continue;
    const pending = [finding.id];
    const component: string[] = [];
    while (pending.length > 0) {
      const current = pending.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      component.push(current);
      const nextIds = [...(neighbours.get(current) ?? [])].sort().reverse();
      pending.push(...nextIds);
    }
    components.push(component.sort());
  }

  return components
    .map((findingIds) => {
      const memberSet = new Set(findingIds);
      const groupFindings = findingIds.map((id) => findingById.get(id)!).filter(Boolean);
      const groupReasons = reasons
        .filter((reason) =>
          reason.kind === "explicit_finding_lineage"
            ? memberSet.has(reason.findingId) && memberSet.has(reason.referencedFindingId)
            : reason.findingIds.every((id) => memberSet.has(id))
        )
        .filter((reason, index, all) => all.findIndex((candidate) => reasonKey(candidate) === reasonKey(reason)) === index)
        .sort((a, b) => reasonKey(a).localeCompare(reasonKey(b)));

      const sourcesByKey = new Map<string, FindingConvergenceSource>();
      for (const finding of groupFindings) {
        for (const ref of finding.sourceRefs) {
          if (ref.objectType === "finding" || !resolveKnowledgeSourceRef(state, ref)) continue;
          const key = knowledgeSourceRefKey(ref);
          const existing = sourcesByKey.get(key);
          if (existing) {
            if (!existing.findingIds.includes(finding.id)) existing.findingIds.push(finding.id);
          } else {
            sourcesByKey.set(key, { ref, findingIds: [finding.id], trust: sourceTrust(state, ref) });
          }
        }
      }

      const uncertainties = groupFindings
        .map(uncertaintyFor)
        .filter((item): item is FindingConvergenceUncertainty => Boolean(item));

      return {
        id: `finding-convergence:${findingIds.join("+")}`,
        findingIds,
        findings: groupFindings,
        territoryIds: [...new Set(groupFindings.flatMap((finding) => finding.territoryIds))].sort(),
        reasons: groupReasons,
        sources: [...sourcesByKey.values()]
          .map((source) => ({ ...source, findingIds: source.findingIds.sort() }))
          .sort((a, b) => knowledgeSourceRefKey(a.ref).localeCompare(knowledgeSourceRefKey(b.ref))),
        uncertainties,
        decisionBoundary: FINDING_CONVERGENCE_DECISION_BOUNDARY
      } satisfies FindingConvergenceGroup;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
