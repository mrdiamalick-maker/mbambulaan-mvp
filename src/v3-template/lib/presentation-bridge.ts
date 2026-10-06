// Pont Mode Présentation — mandat "Intégration /etat V5 + Corrections
// Produit" §13 : une narration décisionnelle (SITUATION→FAITS
// ESSENTIELS→CONSÉQUENCES/ENJEUX→DÉCISIONS ATTENDUES→OPTIONS), pas un
// simple plein écran du tableau de bord. Construite à partir des mêmes
// ponts déjà réels (situations-bridge.ts, landing-bridge.ts) et des
// arbitrages (décideur ajouté au §10) — jamais une donnée fabriquée pour
// ce lot.
import { DEMO_STATE } from "./demo-state";
import type { ProductState } from "@/domain/types";
import { buildSituationHeaderStats, findLatestDecisionForSituation } from "./situations-bridge";
import { getNationalLandingTotals } from "./landing-bridge";
import { ARB, type Arbitrage } from "../data/arbitrages";

export interface PresentationSlide {
  kicker: string;
  title: string;
  lines: string[];
}

// isArbitrageDecided (etat-v5 checkpoint E) — un arbitrage sans
// situationId (ex. ARB[2], arbitrage de portefeuille programme) ne peut
// aujourd'hui recevoir aucune Decision réelle (voir Arbitrages.tsx : le
// domaine ne possède pas d'objet de décision Programme compatible), donc
// reste toujours "en attente" par construction, jamais fabriqué décidé.
function isArbitrageDecided(state: ProductState, arbitrage: Arbitrage): boolean {
  return Boolean(arbitrage.situationId && findLatestDecisionForSituation(state, arbitrage.situationId));
}

export function buildPresentationSlides(state: ProductState = DEMO_STATE): PresentationSlide[] {
  const header = buildSituationHeaderStats(state);
  const activity = getNationalLandingTotals(state);
  const criticalSituations = state.situations.filter((s) => s.status !== "reglee" && s.priority === "critique").slice(0, 5);
  // pendingArbitrages (etat-v5 checkpoint E) — un arbitrage déjà tranché
  // (Decision réelle enregistrée sur sa Situation) ne doit plus apparaître
  // comme une décision encore attendue : une proposition système devenue
  // décision humaine sort de la file d'attente, elle ne reste pas
  // affichée comme si elle restait à trancher.
  const pendingArbitrages = ARB.filter((a) => !isArbitrageDecided(state, a));
  const lead = pendingArbitrages[0];

  return [
    {
      kicker: "Situation",
      title: `${header.openCount} situation(s) ouverte(s) sur le littoral`,
      lines: [
        `${header.criticalCount} critique(s), ${header.toQualifyCount} en attente de qualification.`,
        `${activity.landingCount} débarquement(s) enregistré(s) à ce jour, pour ${Math.round(activity.totalLandedKg)} kg.`
      ]
    },
    {
      kicker: "Faits essentiels",
      title: criticalSituations.length > 0 ? "Ce qui concentre l’attention aujourd’hui" : "Aucune situation critique ouverte",
      lines: criticalSituations.length > 0
        ? criticalSituations.map((s) => `${s.title} — ${state.territories.find((t) => t.id === s.territoryId)?.name ?? s.territoryId}.`)
        : ["Le littoral ne compte aucune situation critique ouverte à ce jour."]
    },
    {
      kicker: "Conséquences / enjeux",
      title: lead ? lead.title : "Aucun enjeu documenté",
      lines: lead ? [lead.inaction] : ["Aucun arbitrage en attente ne documente de conséquence à ce jour."]
    },
    {
      kicker: "Décisions attendues",
      title: pendingArbitrages.length > 0 ? `${pendingArbitrages.length} décision(s) en attente` : "Aucune décision en attente",
      lines: pendingArbitrages.length > 0
        ? pendingArbitrages.map((a) => `${a.title} — échéance ${a.due} (${a.urgency}) · ${a.decider}.`)
        : ["Tous les arbitrages préparés ont déjà une décision enregistrée."]
    },
    {
      kicker: "Options / orientation si disponible",
      title: lead ? lead.title : "Aucune option disponible",
      lines: lead ? lead.options.map((o) => `${o.t} — résout : ${o.pro} Laisse ouvert : ${o.con}`) : ["Aucune option n’est disponible sans arbitrage en attente."]
    }
  ];
}
