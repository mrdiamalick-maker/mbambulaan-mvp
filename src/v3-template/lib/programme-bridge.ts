// Pont Programmes ↔ synthèse réelle — mandat "Intégration /etat V5 +
// Corrections Produit" §8 (correction P1 Détail programme) : afficher
// immédiatement en tête du détail programme l'écart majeur, la prochaine
// décision attendue, le décideur et l'échéance — seulement s'ils existent
// réellement. Même discipline que territory-synthesis.ts/landing-bridge.ts :
// construite uniquement à partir du domaine réel (Initiative.budgetFcfa/
// funding/indicators/situationIds/ownerId), jamais des fixtures p.budId/
// p.budConf/p.inds (data/programmes.ts, gabarit V3 gelé).
//
// PROGRAMME_ID_BY_TITLE — les 9 programmes du gabarit V3 et les 9
// Initiative du domaine réel (4 explicites + 5 générées, src/data/
// demo-state.ts) désignent aujourd'hui le même portefeuille, programme par
// programme : 7 titres sont identiques au caractère près, les 2 restants
// (chaîne du froid, géolocalisation pirogues) correspondent au même objet
// par son territoire et son objet — vérifié un par un, jamais déduit d'un
// slug générique.
import { DEMO_STATE } from "./demo-state";
import type { Initiative, ProductState } from "@/domain/types";
import { ARB } from "../data/arbitrages";
import { PROGS } from "../data/programmes";
import { findLatestDecisionForSituation } from "./situations-bridge";

export const PROGRAMME_ID_BY_TITLE: Record<string, string> = {
  "Résilience de la chaîne du froid · Petite-Côte": "init-froid",
  "Référentiel progressif des pirogues et immatriculations": "init-immatriculation",
  "Qualité, immatriculations et flux · Cap-Vert": "init-cap-vert-xxl",
  "Transformation et accès au marché · Casamance": "init-casamance-xxl",
  "Dispositif territorial de suivi des retours et alertes": "init-securite",
  "Valorisation et froid · Petite-Côte": "init-petite-cote-xxl",
  "Logistique estuarienne · Sine-Saloum": "init-saloum-xxl",
  "Sécurité et continuité des opérations · Grande-Côte": "init-grande-cote-xxl",
  "Équipement de géolocalisation pour pirogues volontaires": "init-lompoul-balises"
};

export interface ProgrammeSynthesisView {
  hasRealMatch: boolean;
  budgetIdentifiedFcfa?: number;
  budgetConfirmedFcfa?: number;
  budgetUnchiffre: boolean;
  gapMajor?: string;
  decisionExpected?: string;
  decisionMaker?: string;
  deadline?: string;
}

function formatMFcfa(amountFcfa: number): string {
  return `${Math.round(amountFcfa / 1_000_000)} M FCFA`;
}

// gapMajorFor — un seul écart, le plus significatif : priorité au budget
// non chiffré (le gap le plus structurant, mandat §7 "ne jamais inventer
// de données financières"), puis l'indicateur le plus loin de sa cible,
// honnêtement absent si le programme n'a ni budget ni indicateur.
function gapMajorFor(initiative: Initiative): string | undefined {
  if (initiative.budgetStatus === "a_estimer") {
    return "Aucun montant n’est encore chiffré pour ce programme.";
  }
  if (initiative.indicators.length > 0) {
    const worst = [...initiative.indicators].sort((a, b) => {
      const spanA = Math.abs(a.target - a.baseline) || 1;
      const spanB = Math.abs(b.target - b.baseline) || 1;
      const progA = Math.abs(a.current - a.baseline) / spanA;
      const progB = Math.abs(b.current - b.baseline) / spanB;
      return progA - progB;
    })[0];
    return `${worst.label} : ${worst.current}${worst.unit} contre une cible de ${worst.target}${worst.unit}.`;
  }
  if (initiative.budgetFcfa) {
    const confirmed = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);
    if (confirmed < initiative.budgetFcfa) {
      return `${formatMFcfa(initiative.budgetFcfa - confirmed)} identifiés restent à confirmer.`;
    }
  }
  return undefined;
}

export function getProgrammeSynthesis(fixtureTitle: string, state: ProductState = DEMO_STATE): ProgrammeSynthesisView {
  const initiativeId = PROGRAMME_ID_BY_TITLE[fixtureTitle];
  const initiative = initiativeId ? state.initiatives.find((item) => item.id === initiativeId) : undefined;
  if (!initiative) return { hasRealMatch: false, budgetUnchiffre: false };

  const confirmed = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);

  // Une décision attendue ne naît jamais d'un score ou de la seule
  // priorité d'une situation. Elle existe uniquement lorsqu'un dossier
  // d'arbitrage humain référence explicitement ce programme.
  //
  // etat-v5 checkpoint F — un arbitrage dont la Situation porte déjà une
  // Decision réelle enregistrée (state.decisions) n'est plus "attendu" :
  // même doctrine que presentation-bridge.ts (isArbitrageDecided). Le
  // premier arbitrage préparé pour ce programme qui reste réellement
  // ouvert est retenu, pas le premier de la liste sans condition —
  // trouvé en audit F : sans ce filtre, "Résilience de la chaîne du
  // froid" continuait d'afficher "Mobiliser une capacité froide à Joal"
  // comme décision attendue après que cette décision ait été enregistrée
  // (dec-glace-1/2, demo-state.ts), alors que la Présentation et la Note
  // de décision (checkpoint E) l'excluaient déjà correctement.
  const preparedArbitration = ARB.find(
    (item) => item.programmeTitle === fixtureTitle && !(item.situationId && findLatestDecisionForSituation(state, item.situationId))
  );

  return {
    hasRealMatch: true,
    budgetIdentifiedFcfa: initiative.budgetFcfa,
    budgetConfirmedFcfa: confirmed,
    budgetUnchiffre: initiative.budgetStatus === "a_estimer",
    gapMajor: gapMajorFor(initiative),
    decisionExpected: preparedArbitration?.title,
    decisionMaker: preparedArbitration?.decider,
    deadline: preparedArbitration ? `${preparedArbitration.due} · ${preparedArbitration.urgency}` : undefined
  };
}

// INITIATIVE_STATUS_LABEL — même vocabulaire que /app/app/etat/rapport/
// page.tsx (Initiative.status), pas un 2e vocabulaire de statut de
// programme pour le Portfolio.
export const INITIATIVE_STATUS_LABEL: Record<Initiative["status"], string> = {
  cadrage: "Cadrage", financee: "Financée", execution: "Exécution", terminee: "Terminée"
};

// ProgrammePortfolioMetric — closeout (lot "etat-v5-integration", §2) :
// remplace les totaux/avancements/calendrier/santé de data/programmes.ts
// par le domaine réel pour Portfolio.tsx. Chaque champ est undefined (ou
// un compteur à 0) quand la donnée réelle n'existe pas — jamais reconstitué
// depuis la fixture. Spécifiquement : aucune dépense réelle n'est suivie
// par Funding (3 statuts possibles : a_mobiliser/en_instruction/confirme,
// aucun "dépensé"), et aucun jalon structuré n'existe sur Initiative — ces
// deux métriques restent donc absentes ici, à masquer ou annoter côté UI,
// jamais comblées par la valeur fixture budSpent/milestones.
export interface ProgrammePortfolioMetric {
  fixtureId: number;
  title: string;
  hasRealMatch: boolean;
  status?: Initiative["status"];
  budgetIdentifiedFcfa?: number;
  budgetConfirmedFcfa: number;
  budgetUnchiffre: boolean;
  avancementPct?: number;
  openLinkedSituationsCount: number;
  criticalLinkedSituationsCount: number;
}

export function getProgrammePortfolioMetrics(state: ProductState = DEMO_STATE): ProgrammePortfolioMetric[] {
  return PROGS.map((p) => {
    const initiativeId = PROGRAMME_ID_BY_TITLE[p.title];
    const initiative = initiativeId ? state.initiatives.find((item) => item.id === initiativeId) : undefined;
    if (!initiative) {
      return {
        fixtureId: p.id, title: p.title, hasRealMatch: false,
        budgetConfirmedFcfa: 0, budgetUnchiffre: true,
        openLinkedSituationsCount: 0, criticalLinkedSituationsCount: 0
      };
    }
    const confirmed = initiative.funding.filter((f) => f.status === "confirme").reduce((sum, f) => sum + f.amountFcfa, 0);
    const avancementPct = initiative.indicators.length > 0
      ? Math.round(
          initiative.indicators.reduce((sum, i) => {
            const span = Math.abs(i.target - i.baseline) || 1;
            return sum + Math.min(100, Math.max(0, (Math.abs(i.current - i.baseline) / span) * 100));
          }, 0) / initiative.indicators.length
        )
      : undefined;
    const linked = state.situations.filter((s) => initiative.situationIds.includes(s.id) && s.status !== "reglee");
    const critical = linked.filter((s) => s.priority === "critique" || s.priority === "haute");
    return {
      fixtureId: p.id, title: p.title, hasRealMatch: true, status: initiative.status,
      budgetIdentifiedFcfa: initiative.budgetFcfa,
      budgetConfirmedFcfa: confirmed,
      budgetUnchiffre: initiative.budgetStatus === "a_estimer",
      avancementPct,
      openLinkedSituationsCount: linked.length,
      criticalLinkedSituationsCount: critical.length
    };
  });
}
