// Pont Arbitrages ↔ domaine réel (G2.2, mandat "Simplification des vues").
// L'écran doit répondre à une seule question : "qu'est-ce qui nécessite une
// décision ?" — jamais afficher comme "à décider" un objet déjà décidé.
//
// Deux sources réelles, fusionnées en une seule liste, sans créer une
// deuxième logique d'arbitrage :
// 1. data/arbitrages.ts (ARB) — fixtures situation-anchorées, EXCLUES dès
//    qu'une Decision réelle existe déjà pour leur situationId (même filtre
//    que territory-fiche-bridge.ts : findLatestDecisionForSituation).
// 2. ProgramOpportunity au statut "pending_arbitration" (opportunity-
//    bridge.ts, moteur canonique G1) — jamais une seconde notion
//    d'arbitrage : le CTA de décision dispatchera la commande canonique
//    arbitrate_program_opportunity (rules.ts), exactement comme le flux
//    situation-anchoré dispatche déjà create_decision.
import { DEMO_STATE } from "./demo-state";
import type { DecisionType, ProductState } from "@/domain/types";
import { ARB, type Arbitrage } from "../data/arbitrages";
import { findLatestDecisionForSituation } from "./situations-bridge";
import { getOpportunityDetail } from "./opportunity-bridge";

export interface ArbitrageOptionView {
  label: string;
  cost: string;
  pro: string;
  con: string;
  // decisionType — présent uniquement pour les options situation-anchorées
  // (create_decision en a besoin) ; absent côté opportunity, où le CTA
  // dispatche directement outcome "retenir"/"ecarter" (arbitrate_program_opportunity).
  decisionType?: DecisionType;
}

export interface ArbitrageItemView {
  kind: "situation" | "opportunity";
  // key — identifiant stable d'affichage (clé React), distinct de arbIndex.
  key: string;
  title: string;
  dueLabel: string;
  urgencyLabel: string;
  dueColor: string;
  metaLabel: string;
  territoryId?: string;
  territoryLabel: string;
  decider: string;
  context: string;
  known: string[];
  unknown: string[];
  inaction: string;
  options: ArbitrageOptionView[];
  // arbIndex — index réel dans ARB (jamais une position dans la liste
  // affichée/filtrée) : seul identifiant stable pour document-bridge.ts
  // (decisionDocument lit ARB[arbitrageIndex] directement). Absent pour
  // les items opportunity-anchorés (pas encore de générateur documentaire
  // pour ce type — capacité non construite dans ce lot, jamais simulée).
  arbIndex?: number;
  situationId?: string;
  opportunityId?: string;
}

// Décideur institutionnel — même libellé que la convention déjà posée par
// les fixtures ARB (data/arbitrages.ts) : le niveau qui tranche, jamais un
// nom de personne fabriqué. Réutilisé tel quel pour les opportunités
// pending_arbitration : même doctrine de rôles (data/roles.ts), pas une
// seconde convention inventée pour ce lot.
const DECIDER_LABEL = "Ministère, sur préparation de la Coordination territoriale";

function situationTerritory(state: ProductState, situationId?: string): { id?: string; label: string } {
  if (!situationId) return { id: undefined, label: "Portefeuille" };
  const situation = state.situations.find((item) => item.id === situationId);
  if (!situation) return { id: undefined, label: "Portefeuille" };
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  return { id: situation.territoryId, label: territory?.name ?? situation.territoryId };
}

function arbOptionsView(a: Arbitrage): ArbitrageOptionView[] {
  return a.options.map((o) => ({ label: o.t, cost: o.cost, pro: o.pro, con: o.con, decisionType: o.decisionType }));
}

function toSituationItem(state: ProductState, a: Arbitrage, arbIndex: number): ArbitrageItemView {
  const territory = situationTerritory(state, a.situationId);
  return {
    kind: "situation",
    key: `sit-${arbIndex}`,
    title: a.title,
    dueLabel: a.due,
    urgencyLabel: a.urgency,
    dueColor: a.dueC,
    metaLabel: a.meta,
    territoryId: territory.id,
    territoryLabel: territory.label,
    decider: a.decider,
    context: a.context,
    known: a.known,
    unknown: a.unknown,
    inaction: a.inaction,
    options: arbOptionsView(a),
    arbIndex,
    situationId: a.situationId
  };
}

// toOpportunityItem — pending_arbitration réel, options génériques
// "Retenir" / "Écarter" (les deux seules issues réelles de
// arbitrate_program_opportunity, rules.ts). Le domaine ne porte pas de
// coût/pro/con par opportunité (ce serait fabriquer une estimation non
// sourcée, interdit par la doctrine G1 potentialValueHypothesis) : les
// deux options restent volontairement génériques plutôt qu'une donnée
// inventée pour imiter la richesse des fixtures situation-anchorées.
function toOpportunityItem(state: ProductState, opportunityId: string): ArbitrageItemView | undefined {
  const detail = getOpportunityDetail(opportunityId, state);
  if (!detail) return undefined;
  const territoryId = detail.territoryIds[0];
  return {
    kind: "opportunity",
    key: `opp-${opportunityId}`,
    title: detail.problem,
    dueLabel: "—",
    urgencyLabel: "instruction terminée",
    dueColor: "rgba(11,26,42,.6)",
    metaLabel: `${detail.territoryNames.join(", ")} · opportunité · à arbitrer`,
    territoryId,
    territoryLabel: detail.territoryNames.join(", ") || "Territoire non résolu",
    decider: DECIDER_LABEL,
    context: detail.justification || detail.subLabel,
    known: detail.establishedFacts,
    unknown: detail.knowledgeGaps,
    inaction: "Sans décision, cette opportunité reste en instruction : aucune Initiative ne peut en découler tant qu'elle n'est pas arbitrée.",
    options: [
      { label: "Retenir l’opportunité", cost: "ouvre une instruction de programme", pro: "Autorise la suite de l’instruction à partir des faits établis et engage le passage vers une Initiative réelle.", con: "Engage une instruction plus poussée sur une hypothèse encore à qualifier complètement." },
      { label: "Écarter l’opportunité", cost: "referme la piste", pro: "Referme une piste dont les conditions ne sont pas réunies aujourd’hui.", con: "Peut écarter une opportunité réelle si de nouveaux éléments apparaissent plus tard." }
    ],
    opportunityId
  };
}

// getArbitrageItems — liste fusionnée, uniquement ce qui nécessite
// réellement une décision aujourd'hui (mandat §2 : "ne jamais afficher
// comme à décider un objet déjà décidé").
export function getArbitrageItems(state: ProductState = DEMO_STATE): ArbitrageItemView[] {
  const pendingStatic = ARB.map((a, index) => ({ a, index })).filter(
    ({ a }) => !(a.situationId && findLatestDecisionForSituation(state, a.situationId))
  );
  const situationItems = pendingStatic.map(({ a, index }) => toSituationItem(state, a, index));

  const pendingOpportunities = state.programOpportunities.filter((o) => o.status === "pending_arbitration");
  const opportunityItems = pendingOpportunities
    .map((o) => toOpportunityItem(state, o.id))
    .filter((item): item is ArbitrageItemView => Boolean(item));

  return [...situationItems, ...opportunityItems];
}
