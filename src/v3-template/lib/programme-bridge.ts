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

  // Décision attendue — la situation ouverte la plus prioritaire parmi
  // celles rattachées à ce programme, si elle est réellement en file
  // d'arbitrage (critique/haute, même seuil que /app/etat/arbitrages et
  // territory-synthesis.ts) ; son responsable devient le décideur. Aucune
  // échéance structurée n'existe sur Initiative à ce jour dans le domaine
  // réel — absence honnête plutôt qu'une date inventée (gap documenté).
  const linkedSituations = state.situations.filter((s) => initiative.situationIds.includes(s.id) && s.status !== "reglee");
  const priorityRank: Record<string, number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };
  const lead = [...linkedSituations].sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])[0];
  const leadInQueue = lead && (lead.priority === "critique" || lead.priority === "haute");
  const decider = lead?.responsibleId ? state.actors.find((a) => a.id === lead.responsibleId) : state.actors.find((a) => a.id === initiative.ownerId);

  return {
    hasRealMatch: true,
    budgetIdentifiedFcfa: initiative.budgetFcfa,
    budgetConfirmedFcfa: confirmed,
    budgetUnchiffre: initiative.budgetStatus === "a_estimer",
    gapMajor: gapMajorFor(initiative),
    decisionExpected: leadInQueue ? lead!.nextStep : undefined,
    decisionMaker: leadInQueue ? (decider ? `${decider.name} · ${decider.role.replaceAll("_", " ")}` : "Non assigné") : undefined,
    deadline: undefined
  };
}
