// Pont Fiche territoire ↔ domaine réel — G2.1 ("Vision territoriale").
// Seul endroit qui assemble la fiche territoire (5 sections : À retenir,
// Opportunités, Décisions et actions, Capacités, Sources) à partir du
// domaine canonique réel — jamais une seconde logique : réutilise
// situations-bridge.ts (findLatestDecisionForSituation, même doctrine
// d'exclusion que Brief/Présentation/Programme), territory-synthesis.ts
// (sujet d'attention), landing-bridge.ts/territory-intelligence.ts
// (activité réelle), opportunity-bridge.ts (G1), data/arbitrages.ts (ARB,
// même source que Brief/Arbitrages/Programme).
//
// Mbambulaan_Etat_G2_Territoires.html est l'autorité visuelle (structure,
// ordre, styles) ; ce pont ne produit que les DONNÉES, jamais le texte
// narratif figé du HTML — un territoire sans donnée réelle équivalente
// affiche un état honnête, jamais une valeur copiée du mockup (mandat §9
// G2.1 : "ne pas inventer de cas").
import { DEMO_STATE } from "./demo-state";
import type { ProductState, Situation } from "@/domain/types";
import { isOpenSituation, buildUncertainties, trustGlyph } from "@/domain/situation-intelligence";
import { trustLabels, glyphBorderColor, priorityLabels, type GlyphTag } from "@/lib/status-tokens";
import { getTerritorySynthesis } from "./territory-synthesis";
import { findLatestDecisionForSituation } from "./situations-bridge";
import { getOpportunitiesForTerritory, type OpportunityRowView } from "./opportunity-bridge";
import { TERRITORY_ID_BY_NAME, INFRA_STATE_LABEL, INFRA_STATUS_COLOR } from "./landing-bridge";
import { buildTerritoryLandingActivity } from "@/domain/territory-intelligence";
import { ARB } from "../data/arbitrages";
import { TERR } from "../data/territories";
import { LVD, LVT } from "../theme";

const ACTIVITY_LABEL: Record<GlyphTag, string> = { critique: "Sous tension", vigilance: "Vigilance", stable: "Stable" };
const PRIORITY_RANK: Record<Situation["priority"], number> = { critique: 3, haute: 2, moyenne: 1, faible: 0 };

export interface TerritoryListItem {
  id: string;
  name: string;
  region: string;
  zone: string;
  signalsLabel: string;
  statusColor: string;
  tag: "documentee" | "cas_a_documenter" | "structure_prete";
  tagLabel: string;
}

// getTerritoryList (section "Territoires", vue liste) — les 18 sites du
// gabarit V3 (data/territories.ts, référence géographique déjà utilisée
// par Atlas.tsx), chacun résolu vers son Territory réel pour le compte de
// signaux et le statut.
//
// "documentée" = ProgramOpportunity réelle OU arbitrage réellement
// préparé (ARB) référençant ce territoire — PAS la seule présence d'une
// Situation : le Demo World réel (contrairement au jeu de données épars
// du HTML mockup) porte au moins une Situation sur les 18 territoires,
// rendant ce critère-là universellement vrai et donc inutile pour
// distinguer un territoire réellement instruit (chaîne complète jusqu'à
// l'opportunité/l'arbitrage) d'un territoire qui n'a, à ce jour, que des
// signaux à qualifier. Saint-Louis reste le cas vide spécifique désigné
// par le mandat G2.1, indépendamment de ses propres données réelles
// (traité explicitement dans getTerritoryFiche ci-dessous).
export function getTerritoryList(state: ProductState = DEMO_STATE): TerritoryListItem[] {
  return TERR.map((row) => {
    const [name, region, , , level, , zone] = row;
    const territoryId = TERRITORY_ID_BY_NAME[name];
    const territory = territoryId ? state.territories.find((item) => item.id === territoryId) : undefined;
    const signalCount = territoryId ? state.signals.filter((item) => item.territoryId === territoryId).length : 0;
    const isDocumented = Boolean(
      territoryId &&
        territoryId !== "saint-louis" &&
        (state.programOpportunities.some((item) => item.territoryIds.includes(territoryId)) || ARB.some((item) => item.territories?.includes(name)))
    );
    const isSaintLouis = territoryId === "saint-louis";
    return {
      id: territoryId ?? name,
      name,
      region,
      zone,
      signalsLabel: `${signalCount} ${signalCount > 1 ? "signaux" : "signal"} · 14 j`,
      statusColor: territory ? glyphBorderColor[territory.activity] : glyphBorderColor[level as GlyphTag],
      tag: isDocumented ? "documentee" : isSaintLouis ? "cas_a_documenter" : "structure_prete",
      tagLabel: isDocumented ? "Fiche documentée" : isSaintLouis ? "Cas à documenter" : "Structure prête"
    };
  });
}

export interface TerritoryRetainItem {
  severityLabel: string;
  severityColor: string;
  trustGlyph: string;
  trustLabel: string;
  title: string;
  consequence: string;
  action: string;
  owner: string;
  due: string;
}

export interface TerritoryDecisionAction {
  kind: "Décision" | "Action";
  title: string;
  owner: string;
  due: string;
  dueSub: string;
  dueColor: string;
  meta: string;
  ctaLabel: string;
  targetOpportunityId?: string;
}

export interface TerritoryFicheView {
  id: string;
  name: string;
  region: string;
  zone?: string;
  statusLabel: string;
  statusColor: string;
  statusTextColor: string;
  synthesis: string;
  updatedLabel: string;
  isDocumented: boolean;
  isSpecificEmptyCase: boolean;
  counts: { situations: number; opportunities: number; decisions: number; initiatives: number; results: number };
  confidence: { declared: number; observed: number; verified: number };
  confidenceReadNote: string;
  actors: Array<{ name: string; note: string }>;
  retain: TerritoryRetainItem[];
  emptyRetainNote?: string;
  opportunities: OpportunityRowView[];
  decisionsAndActions: TerritoryDecisionAction[];
  capacities: Array<{ name: string; state: string; stateColor: string; trustGlyph: string; trustLabel: string }>;
  activity: Array<{ name: string; value: string; source: string; trustGlyph: string }>;
  sources: Array<{ name: string; detail: string; trustGlyph: string; date: string }>;
  unknowns: string[];
}

const ACTOR_ROLE_LABEL: Record<string, string> = {
  capitaine: "Capitaine",
  mareyeur: "Mareyeur",
  gestionnaire_organisation: "Gestionnaire d'organisation",
  coordinateur: "Coordination territoriale",
  operateur: "Opérateur",
  prestataire: "Prestataire",
  transformateur: "Transformateur",
  institution: "Institution",
  administrateur: "Administration"
};

export function getTerritoryFiche(territoryId: string, state: ProductState = DEMO_STATE): TerritoryFicheView | undefined {
  const territory = state.territories.find((item) => item.id === territoryId);
  if (!territory) return undefined;

  // Saint-Louis (mandat G2.1 §4) — cas vide spécifique désigné
  // explicitement par le mandat : "ne pas inventer de cas ; reproduire
  // exactement l'état vide prévu par le HTML", quelles que soient les
  // données réelles de ce territoire (le Demo World en porte, comme pour
  // les 18 territoires — cf. commentaire de getTerritoryList ci-dessus).
  // Choix produit assumé, pas une divergence silencieuse : ce territoire
  // précis reste la démonstration volontaire du modèle vide, les 17
  // autres restent entièrement pilotés par leurs données réelles.
  const forceEmpty = territoryId === "saint-louis";

  const situations = forceEmpty ? [] : state.situations.filter((item) => item.territoryId === territoryId);
  const openSituations = situations.filter(isOpenSituation).sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
  const opportunities = forceEmpty ? [] : getOpportunitiesForTerritory(territoryId, state);
  const decisionsForTerritory = state.decisions.filter((d) => d.situationId && situations.some((s) => s.id === d.situationId));
  const initiativesForTerritory = forceEmpty ? [] : state.initiatives.filter((item) => item.territoryIds.includes(territoryId));
  const resultsForTerritory = forceEmpty ? [] : state.results.filter((item) => item.territoryIds.includes(territoryId));
  const isDocumented = !forceEmpty && (situations.length > 0 || opportunities.length > 0);
  const isSpecificEmptyCase = forceEmpty;

  const signalsOfTerritory = forceEmpty ? [] : state.signals.filter((item) => item.territoryId === territoryId);
  const confidence = { declared: 0, observed: 0, verified: 0 };
  for (const signal of signalsOfTerritory) {
    if (signal.trust === "declaree") confidence.declared += 1;
    else if (signal.trust === "observee") confidence.observed += 1;
    else if (signal.trust === "verifiee") confidence.verified += 1;
  }
  const confidenceTotal = confidence.declared + confidence.observed + confidence.verified;
  const confidenceReadNote = confidenceTotal === 0
    ? "Information insuffisante pour qualifier le territoire."
    : confidence.declared >= confidence.observed + confidence.verified
      ? "Information encore majoritairement déclarée, non recoupée."
      : "Information recoupée par plusieurs sources indépendantes.";

  const synthesis = forceEmpty ? undefined : getTerritorySynthesis(territory.name, state);
  const zone = TERR.find((row) => row[0] === territory.name)?.[6];

  const retain: TerritoryRetainItem[] = openSituations.slice(0, 2).map((situation) => ({
    severityLabel: priorityLabels[situation.priority],
    severityColor: LVT[situation.priority === "critique" ? "critique" : situation.priority === "haute" ? "vigilance" : "stable"],
    trustGlyph: trustGlyph(situation.trust),
    trustLabel: trustLabels[situation.trust],
    title: situation.title,
    consequence: situation.description,
    action: situation.nextStep,
    owner: situation.responsibleId ? (state.actors.find((a) => a.id === situation.responsibleId)?.name ?? "Non assigné") : "Non assigné",
    due: "—"
  }));

  const territoryArbName = territory.name;
  const pendingArb = forceEmpty
    ? undefined
    : ARB.find((item) => (item.territories?.includes(territoryArbName) ?? false) && !(item.situationId && findLatestDecisionForSituation(state, item.situationId)));
  const decisionsAndActions: TerritoryDecisionAction[] = [];
  if (pendingArb) {
    decisionsAndActions.push({
      kind: "Décision",
      title: pendingArb.title,
      owner: pendingArb.decider,
      due: pendingArb.due,
      dueSub: pendingArb.urgency,
      dueColor: LVD.critique,
      meta: pendingArb.meta,
      ctaLabel: "Préparer l’arbitrage"
    });
  }
  const detectedOpportunity = opportunities.find((item) => item.status === "detected");
  if (detectedOpportunity) {
    decisionsAndActions.push({
      kind: "Action",
      title: detectedOpportunity.problem,
      owner: "Coordination territoriale",
      due: "—",
      dueSub: "à fixer",
      dueColor: "rgba(11,26,42,.4)",
      meta: `Opportunité repérée · ${detectedOpportunity.missingCount} informations manquantes`,
      ctaLabel: "Ouvrir l’instruction",
      targetOpportunityId: detectedOpportunity.id
    });
  } else if (synthesis?.action && decisionsAndActions.length < 2) {
    decisionsAndActions.push({
      kind: "Action",
      title: synthesis.action,
      owner: synthesis.responsible ?? "Non assigné",
      due: "—",
      dueSub: "",
      dueColor: "rgba(11,26,42,.4)",
      meta: "",
      ctaLabel: "Voir la situation"
    });
  }

  const infrastructures = forceEmpty ? [] : state.infrastructures.filter((item) => item.territoryId === territoryId);
  const capacities = infrastructures.map((infra) => ({
    name: infra.name,
    state: INFRA_STATE_LABEL[infra.status],
    stateColor: INFRA_STATUS_COLOR[infra.status],
    trustGlyph: trustGlyph(infra.trust),
    trustLabel: trustLabels[infra.trust]
  }));

  const activityReal = forceEmpty ? { landingCount: 0, totalLandedKg: 0 } : buildTerritoryLandingActivity(state, territoryId);
  const activity = [
    { name: "Signaux reçus · 14 jours", value: String(signalsOfTerritory.length), source: "Calcul système sur signaux reçus", trustGlyph: trustGlyph("observee") },
    { name: "Débarquements relevés", value: `${activityReal.landingCount} horodatés`, source: "Débarquements enregistrés", trustGlyph: trustGlyph("verifiee") },
    {
      name: "Volumes débarqués",
      value: activityReal.totalLandedKg > 0 ? `${Math.round(activityReal.totalLandedKg).toLocaleString("fr-FR")} kg` : "Non suivis",
      source: activityReal.totalLandedKg > 0 ? "Débarquements enregistrés" : "Aucune source à ce jour",
      trustGlyph: activityReal.totalLandedKg > 0 ? trustGlyph("verifiee") : "—"
    }
  ];

  const sources = signalsOfTerritory.slice(0, 4).map((signal) => ({
    name: signal.reportedBy || signal.source,
    detail: signal.title,
    trustGlyph: trustGlyph(signal.trust),
    date: signal.createdAt.slice(0, 10)
  }));

  const leadUnknowns = openSituations[0] ? buildUncertainties(state, openSituations[0]).map((item) => item.detail) : [];

  return {
    id: territory.id,
    name: territory.name,
    region: territory.region,
    zone,
    statusLabel: ACTIVITY_LABEL[territory.activity],
    statusColor: LVD[territory.activity],
    statusTextColor: LVT[territory.activity],
    synthesis: synthesis?.subject
      ? `${synthesis.subject}${synthesis.stake ? ` ${synthesis.stake}` : ""}`
      : signalsOfTerritory.length > 0
        ? `${signalsOfTerritory.length} signal${signalsOfTerritory.length > 1 ? "aux" : ""} déclaratif${signalsOfTerritory.length > 1 ? "s" : ""} reçu${signalsOfTerritory.length > 1 ? "s" : ""} sur 14 jours, non recoupé${signalsOfTerritory.length > 1 ? "s" : ""}. Aucune situation n’est retenue à ce jour.`
        : "Aucun signal reçu sur 14 jours. Aucune situation n’est retenue et aucun diagnostic territorial n’est enregistré.",
    updatedLabel: signalsOfTerritory[0]?.createdAt.slice(0, 10) ?? "aucune",
    isDocumented,
    isSpecificEmptyCase,
    counts: {
      situations: situations.length,
      opportunities: opportunities.length,
      decisions: decisionsForTerritory.length,
      initiatives: initiativesForTerritory.length,
      results: resultsForTerritory.length
    },
    confidence,
    confidenceReadNote,
    actors: (forceEmpty ? [] : state.actors)
      .filter((item) => item.territoryIds.includes(territoryId))
      .slice(0, 5)
      .map((item) => ({ name: item.name, note: `${ACTOR_ROLE_LABEL[item.role] ?? item.role}${item.verified ? "" : " · non vérifié"}` })),
    retain,
    emptyRetainNote: retain.length === 0 ? "Aucune situation n’est retenue sur ce territoire. Les signaux reçus ne suffisent pas à ouvrir une situation." : undefined,
    opportunities,
    decisionsAndActions,
    capacities,
    activity,
    sources,
    unknowns: leadUnknowns
  };
}
