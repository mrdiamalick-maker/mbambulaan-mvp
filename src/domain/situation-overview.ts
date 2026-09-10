// LOT V3.2 (mandat "Situations & Progressive Detail") — dérivations pures
// pour la VUE D'ENSEMBLE de /app/situations (funnel, ancienneté,
// statistiques, partition connu/incertain), dans le même esprit que
// src/domain/situation-narrative.ts (LOT 1/2) : uniquement des lectures
// depuis un ProductState déjà chargé, aucune commande, aucun texte
// fabriqué. Réutilise collectSituationSignals/resolveFindingForSituation
// (situation-narrative.ts) plutôt que de dupliquer leur logique.
import type { ProductState, Signal, Situation, TrustLevel } from "@/domain/types";
import { collectSituationSignals } from "@/domain/situation-narrative";

function isOpen(situation: Situation): boolean {
  return situation.status !== "reglee";
}

// situationAgeDays/situationAgeLabel — même formule exacte que
// situationAge (src/app/app/etat/arbitrages/page.tsx), reprise ici pour
// être partagée par la vue Coordination sans dupliquer une 3e fois cette
// petite fonction pure ni créer une dépendance page → page. Référencée
// contre l'horloge MÉTIER du jeu de données (deriveDatasetReferenceAt,
// appelée par le composant), jamais Date.now() (mandat P2.DESIGN-1B.2,
// "crédibilité temporelle du Demo World").
export function situationAgeDays(situation: Situation, referenceAtMs: number): number | null {
  const first = situation.history[0]?.at;
  if (!first) return null;
  return Math.floor((referenceAtMs - new Date(first).getTime()) / 86_400_000);
}

export function situationAgeLabel(situation: Situation, referenceAtMs: number): string {
  const days = situationAgeDays(situation, referenceAtMs);
  if (days === null) return "Date d'ouverture inconnue";
  if (days <= 0) return "aujourd’hui";
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
}

export interface SituationStats {
  open: number;
  critical: number;
  toQualify: number;
  closedWithEvidence: number;
  total: number;
}

// situationStats — 4 compteurs réels (mandat §2, "stats").
// closedWithEvidence : une situation réglée est comptée seulement si au
// moins une Evidence de première classe lui est rattachée (jamais le
// simple champ texte situation.result — même discipline de fond que D10,
// PRODUCT_DECISION_LOG.md, "record_result crée aussi une Evidence").
export function situationStats(state: ProductState): SituationStats {
  const { situations, evidences } = state;
  const closedWithEvidence = situations.filter(
    (item) => item.status === "reglee" && evidences.some((evidence) => evidence.situationId === item.id)
  ).length;
  return {
    open: situations.filter(isOpen).length,
    critical: situations.filter((item) => isOpen(item) && item.priority === "critique").length,
    toQualify: situations.filter((item) => item.status === "recue" || item.status === "qualification").length,
    closedWithEvidence,
    total: situations.length
  };
}

export interface SituationFunnelStep {
  key: "signaux" | "qualifies" | "situations" | "closes";
  label: string;
  value: number;
  ratio: number;
}

// situationFunnel — De l'information reçue à la preuve (mandat §2). Les 4
// paliers reprennent des ensembles réels et déjà définis ailleurs dans le
// Produit : Signal.disposition !== "nouveau" pour "qualifiés" (même
// vocabulaire que signalDispositionLabels, domain/types.ts), Situation
// pour "situations suivies", closedWithEvidence (ci-dessus) pour le
// dernier palier. Aucun taux de conversion agrégé en un score composite —
// chaque palier reste un décompte réel et sa proportion du premier palier.
export function situationFunnel(state: ProductState): SituationFunnelStep[] {
  const receivedSignals = state.signals.length;
  const qualifiedSignals = state.signals.filter((item) => item.disposition !== "nouveau").length;
  const trackedSituations = state.situations.length;
  const closedWithEvidence = situationStats(state).closedWithEvidence;
  const base = Math.max(1, receivedSignals);

  const steps: Array<[SituationFunnelStep["key"], string, number]> = [
    ["signaux", "Signaux reçus", receivedSignals],
    ["qualifies", "Signaux qualifiés", qualifiedSignals],
    ["situations", "Situations suivies", trackedSituations],
    ["closes", "Closes avec preuve", closedWithEvidence]
  ];
  return steps.map(([key, label, value]) => ({ key, label, value, ratio: value / base }));
}

export interface SituationAgingBucket {
  key: string;
  label: string;
  count: number;
}

const AGING_BUCKETS: Array<{ key: string; label: string; max: number }> = [
  { key: "48h", label: "< 48 h", max: 2 },
  { key: "7j", label: "2–7 j", max: 7 },
  { key: "3sem", label: "1–3 sem.", max: 21 },
  { key: "6sem", label: "3–6 sem.", max: 42 },
  { key: "plus", label: "> 6 sem.", max: Infinity }
];

// situationAging — distribution des situations OUVERTES par ancienneté
// (mandat §2, "aging where represented") : une situation qui vieillit
// sans preuve est un risque réel, jamais un graphique décoratif. Bornes
// identiques à la référence V3 (Claude Design), appliquées à de vrais
// écarts en jours (situationAgeDays ci-dessus), jamais à des données
// fabriquées.
export function situationAging(state: ProductState, referenceAtMs: number): SituationAgingBucket[] {
  const open = state.situations.filter(isOpen);
  const counts = AGING_BUCKETS.map((bucket) => ({ key: bucket.key, label: bucket.label, count: 0 }));
  for (const situation of open) {
    const days = situationAgeDays(situation, referenceAtMs);
    if (days === null) continue;
    // Bornes cumulatives et non chevauchantes : le premier seuil que
    // `days` ne dépasse pas encore détermine le panier.
    const bucketIndex = AGING_BUCKETS.findIndex((bucket) => days < bucket.max);
    counts[bucketIndex < 0 ? AGING_BUCKETS.length - 1 : bucketIndex].count += 1;
  }
  return counts;
}

export interface KnownUnknownItem {
  text: string;
  trust: TrustLevel;
  signalId: string;
}

const CONFIRMED_TRUST_TIERS: TrustLevel[] = ["verifiee", "documentee", "consolidee", "officielle"];

// situationKnownUnknown — partition RÉELLE des signaux d'une situation en
// deux colonnes (mandat §5, "preserve the existing trust semantics
// exactly... do not aggregate trust into a fake score") : jamais une
// synthèse narrative fabriquée par situation (contrairement à la maquette
// V3, dont known/unknown sont un texte d'illustration écrit à la main
// pour chaque fixture) — ici, deux vrais ensembles de Signal.description
// selon leur TrustLevel réel. "Connu" = niveau de confiance confirmé par
// une source secondaire ou une autorité (vérifiée/documentée/consolidée/
// officielle) ; "Incertain" = tout le reste (déclarée/rapprochée/estimée/
// contestée/expirée) — jamais élevé au rang de fait vérifié sans trace,
// même discipline que describeFindingTrust (situation-narrative.ts).
export function situationKnownUnknown(state: ProductState, situation: Situation): { known: KnownUnknownItem[]; unknown: KnownUnknownItem[] } {
  const signals = collectSituationSignals(state, situation);
  const known: KnownUnknownItem[] = [];
  const unknown: KnownUnknownItem[] = [];
  for (const signal of signals) {
    const item: KnownUnknownItem = { text: signal.description || signal.title, trust: signal.trust, signalId: signal.id };
    (CONFIRMED_TRUST_TIERS.includes(signal.trust) ? known : unknown).push(item);
  }
  return { known, unknown };
}

// situationTerritoryReach — 4 compteurs réels pour les tuiles "portée" du
// panneau de détail (mandat §2/§12, jamais les libellés fabriqués au cas
// par cas de la maquette V3 — "organisations de mareyeurs" etc. n'ont pas
// d'équivalent générique pour TOUTE situation sans supposer un type
// d'acteur qu'elle ne concerne pas forcément).
export function situationTerritoryReach(state: ProductState, situation: Situation) {
  const territoryActors = state.actors.filter((actor) => actor.territoryIds.includes(situation.territoryId));
  const territoryProgrammes = state.initiatives.filter((item) => item.territoryIds.includes(situation.territoryId));
  const signals = collectSituationSignals(state, situation);
  const evidences = state.evidences.filter((item) => item.situationId === situation.id);
  return {
    signals: signals.length,
    actors: territoryActors.length,
    programmes: territoryProgrammes.length,
    evidences: evidences.length
  };
}

export function firstSignalFor(state: ProductState, situation: Situation): Signal | undefined {
  return collectSituationSignals(state, situation)[0];
}
