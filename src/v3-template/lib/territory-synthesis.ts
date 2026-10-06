// Pont Atlas ↔ synthèse territoriale réelle — mandat "Intégration /etat V5
// + Corrections Produit" §4 (correction P1 Territoire) : ajoute en tête du
// détail territoire une synthèse lisible (sujet d'attention principal,
// conséquence/enjeu, action en cours, responsable si connu, décision
// attendue si applicable). Même discipline que landing-bridge.ts/
// situations-bridge.ts : construite UNIQUEMENT à partir du domaine réel
// (Territory.activity, Situation ouverte la plus prioritaire,
// Situation.responsibleId/nextStep) et, pour une décision attendue, d'un
// arbitrage explicitement préparé par un humain — jamais d'une inférence
// sur la seule priorité. Les fixtures de lecture t.reading/t.level
// (data/territories.ts, gabarit V3 gelé) ne pilotent pas cette synthèse. Si aucune
// situation ouverte n'existe sur ce territoire, la synthèse l'affiche
// honnêtement plutôt que d'inventer un sujet d'attention (mandat §15).
import { DEMO_STATE } from "./demo-state";
import type { ProductState, Situation } from "@/domain/types";
import { isOpenSituation } from "@/domain/situation-intelligence";
import { priorityLabels, glyphBorderColor, type GlyphTag } from "@/lib/status-tokens";
import { TERRITORY_ID_BY_NAME } from "./landing-bridge";
import { ARB } from "../data/arbitrages";

const PRIORITY_RANK: Record<Situation["priority"], number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };

const ACTIVITY_LABEL: Record<GlyphTag, string> = { critique: "Critique", vigilance: "Vigilance", stable: "Stable" };

export interface TerritorySynthesisView {
  activityLevel: GlyphTag;
  activityLabel: string;
  activityColor: string;
  hasAttention: boolean;
  priorityLabel?: string;
  subject?: string;
  stake?: string;
  action?: string;
  responsible?: string;
  decisionExpected?: string;
}

// getTerritorySynthesis — un seul sujet d'attention par territoire (le
// plus prioritaire des situations encore ouvertes), même convention de
// lecture que le reste du produit ("le plus significatif en premier").
// decisionExpected n'est rempli que lorsqu'un arbitrage humainement préparé
// référence explicitement le territoire. Une priorité critique ou haute ne
// devient donc jamais, à elle seule, une décision institutionnelle attendue.
export function getTerritorySynthesis(territoryName: string, state: ProductState = DEMO_STATE): TerritorySynthesisView | undefined {
  const territoryId = TERRITORY_ID_BY_NAME[territoryName];
  const territory = territoryId ? state.territories.find((item) => item.id === territoryId) : undefined;
  if (!territory) return undefined;

  const lead = state.situations
    .filter((item) => item.territoryId === territory.id && isOpenSituation(item))
    .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])[0];

  const responsible = lead?.responsibleId ? state.actors.find((item) => item.id === lead.responsibleId) : undefined;
  const preparedArbitration = ARB.find((item) => item.territories?.includes(territoryName));

  return {
    activityLevel: territory.activity,
    activityLabel: ACTIVITY_LABEL[territory.activity],
    activityColor: glyphBorderColor[territory.activity],
    hasAttention: Boolean(lead),
    priorityLabel: lead ? priorityLabels[lead.priority] : undefined,
    subject: lead?.title,
    stake: lead && lead.description !== lead.title ? lead.description : undefined,
    action: lead?.nextStep,
    responsible: lead ? (responsible ? `${responsible.name} · ${responsible.role.replaceAll("_", " ")}` : "Non assigné") : undefined,
    decisionExpected: preparedArbitration?.title
  };
}
