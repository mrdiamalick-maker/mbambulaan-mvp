// Pont Mode Présentation — mandat "Intégration /etat V5 + Corrections
// Produit" §13 : une narration décisionnelle (SITUATION→FAITS
// ESSENTIELS→CONSÉQUENCES/ENJEUX→DÉCISIONS ATTENDUES→OPTIONS), pas un
// simple plein écran du tableau de bord. Construite à partir des mêmes
// ponts déjà réels (situations-bridge.ts, landing-bridge.ts) et des
// arbitrages (décideur ajouté au §10) — jamais une donnée fabriquée pour
// ce lot.
import { DEMO_STATE } from "./demo-state";
import type { ProductState } from "@/domain/types";
import { buildSituationHeaderStats } from "./situations-bridge";
import { getNationalLandingTotals } from "./landing-bridge";
import { ARB } from "../data/arbitrages";

export interface PresentationSlide {
  kicker: string;
  title: string;
  lines: string[];
}

export function buildPresentationSlides(state: ProductState = DEMO_STATE): PresentationSlide[] {
  const header = buildSituationHeaderStats(state);
  const activity = getNationalLandingTotals();
  const criticalSituations = state.situations.filter((s) => s.status !== "reglee" && s.priority === "critique").slice(0, 5);
  const lead = ARB[0];

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
      title: `${ARB.length} décision(s) en attente`,
      lines: ARB.map((a) => `${a.title} — échéance ${a.due} (${a.urgency}) · ${a.decider}.`)
    },
    {
      kicker: "Options / orientation si disponible",
      title: lead ? lead.title : "Aucune option disponible",
      lines: lead ? lead.options.map((o) => `${o.t} — résout : ${o.pro} Laisse ouvert : ${o.con}`) : ["Aucune option n’est disponible sans arbitrage en attente."]
    }
  ];
}
