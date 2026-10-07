// Pont Casebook territorial ↔ domaine réel (G2.4, mandat "Territorial
// Casebook + Brief Data Alignment"). Pour chacun des 18 territoires du Demo
// World, au maximum 1 ou 2 "cas significatifs" — jamais un remplissage
// artificiel des 18 territoires avec des affirmations présentées comme
// réelles (mandat Partie A, §1 : "le but n'est pas de remplir l'outil").
//
// Trois qualifications, jamais mélangées :
// - "documente" : soutenu par des objets/données existantes (Situation,
//   signal, infrastructure, Initiative, Result...), jamais seulement une
//   Situation par construction — cf. documentedCaseFromSituation ci-dessous,
//   qui enrichit (jamais ne remplace) avec Decision/Initiative/Result réels
//   quand ils existent.
// - "a_qualifier" : hypothèse/opportunité de démonstration (ProgramOpportunity
//   réelle), knowledgeGaps et potentialValueHypothesis exposés tels quels,
//   AUCUN chiffre inventé, jamais transformée en fait établi.
// - "a_documenter" : aucun cas suffisamment soutenu — état vide honnête,
//   jamais comblé par un cas générique.
//
// Les quatre territoires déjà cadrés (G2.1/G2.1a/G1) sont conservés tels
// quels. Pour les 14 autres, le Demo World réel (src/data/demo-state.ts)
// porte en fait une Situation hand-authored et spécifique pour chacun des
// 18 territoires (vérifié ligne par ligne : aucun des 14 ne dépend de la
// veille générique "sit-{id}-veille" — cf. GENERIC_SITUATION_SUFFIX
// ci-dessous) : un seul cas "documenté" en est donc construit, jamais deux
// copies du même problème générique (mandat Partie A : "ne pas créer 18
// copies d'un même problème générique").
import { DEMO_STATE } from "./demo-state";
import type { ProductState, Situation } from "@/domain/types";
import { findLatestDecisionForSituation } from "./situations-bridge";
import { getOpportunitiesForTerritory, getOpportunityDetail } from "./opportunity-bridge";

export type CaseQualification = "documente" | "a_qualifier" | "a_documenter";

export const CASE_QUALIFICATION_LABEL: Record<CaseQualification, string> = {
  documente: "Documenté",
  a_qualifier: "À qualifier",
  a_documenter: "À documenter"
};

// TerritorialCaseView — un cas référence, lorsque disponible, les objets
// canoniques réels qui le soutiennent (mandat Partie A, "modèle casebook") :
// territoryId (toujours), situationId, programOpportunityId, initiativeId,
// resultId(s), source(s). Le casebook reste une couche de curation/
// démonstration territoriale, jamais une nouvelle source de vérité
// parallèle : chaque champ ci-dessous est soit copié tel quel depuis le
// domaine, soit absent — jamais recalculé ou inventé.
export interface TerritorialCaseView {
  id: string;
  title: string;
  qualification: CaseQualification;
  qualificationLabel: string;
  summary: string;
  territoryId: string;
  // knowledgeGaps/potentialValueHypothesis — uniquement pour "a_qualifier" ;
  // jamais un chiffre, toujours le texte hypothèse réel de la
  // ProgramOpportunity (mandat Partie A, §"à qualifier" : "aucune métrique
  // économique inventée").
  knowledgeGaps?: string[];
  potentialValueHypothesis?: string;
  linkedSituationId?: string;
  linkedOpportunityId?: string;
  linkedInitiativeId?: string;
  // linkedResultIds — Result(s) réel(s) dont le territoryIds inclut ce
  // territoire (src/domain/types.ts, Result.territoryIds), jamais déduit
  // d'une simple proximité thématique. Seul "result-immatriculation-t1"
  // existe aujourd'hui dans le Demo World (4 territoires couverts) ;
  // absent pour tous les autres cas, jamais fabriqué pour symétrie.
  linkedResultIds?: string[];
  // sources — uniquement pour "documente", uniquement le texte réel déjà
  // porté par la Situation (Situation.confirmation), jamais une source
  // inventée pour imiter la richesse d'un cas mieux documenté.
  sources?: string[];
}

// GENERIC_SITUATION_SUFFIX — les situations générées par
// createDemoState() pour les territoires non "approfondis" au sens de
// deepenedSituationIdsByTerritory (data/demo-state.ts) suivent toutes le
// gabarit `sit-{territoryId}-veille` (situationTemplates, 5 modèles cyclés) :
// plusieurs partagent littéralement le même texte, seul le nom du
// territoire change. Jamais utilisées comme cas "documenté" — exactement
// le générique copié sur plusieurs territoires que le mandat interdit.
// Fait important (vérifié dans demo-state.ts) : ce filtre à lui seul écarte
// aussi bien les 7 territoires de deepenedSituationIdsByTerritory que les
// 11 autres qui portent DÉJÀ une Situation hand-authored distincte (ex.
// Hann, Lompoul, Elinkine…) ET reçoivent malgré tout une veille générique
// en plus (la génération ne connaît que deepenedSituationIdsByTerritory,
// pas les situations hand-authored posées directement dans le tableau
// `situations`) : sans ce filtre, le générique écraserait silencieusement
// le cas réellement spécifique dans tout appel qui ne distinguerait pas
// les deux.
const GENERIC_SITUATION_SUFFIX = "-veille";

function isSpecificSituation(situation: Situation): boolean {
  return !situation.id.endsWith(GENERIC_SITUATION_SUFFIX);
}

// resultsForTerritory — Result(s) réels dont Result.territoryIds inclut ce
// territoire, jamais déduits d'une Initiative/Situation par proximité :
// une lecture directe du champ canonique (domain/types.ts).
function resultsForTerritory(state: ProductState, territoryId: string): string[] {
  return state.results.filter((r) => r.territoryIds.includes(territoryId)).map((r) => r.id);
}

function qualifyingCaseFromOpportunity(state: ProductState, territoryId: string, opportunityId: string): TerritorialCaseView | undefined {
  const detail = getOpportunityDetail(opportunityId, state);
  if (!detail) return undefined;
  return {
    id: detail.id,
    title: detail.problem,
    qualification: "a_qualifier",
    qualificationLabel: CASE_QUALIFICATION_LABEL.a_qualifier,
    summary: detail.justification,
    territoryId,
    knowledgeGaps: detail.knowledgeGaps,
    potentialValueHypothesis: detail.potentialValueHypothesis,
    linkedOpportunityId: detail.id
  };
}

// documentedCaseFromSituation — un cas "documenté" honnête : le texte
// réel de la Situation, enrichi (jamais remplacé) d'une Decision, d'une
// Initiative et/ou d'un Result réels quand ils existent, jamais fabriqués
// pour l'occasion.
function documentedCaseFromSituation(state: ProductState, situation: Situation): TerritorialCaseView {
  const decision = findLatestDecisionForSituation(state, situation.id);
  const initiative = state.initiatives.find((item) => item.situationIds.includes(situation.id));
  const resultIds = resultsForTerritory(state, situation.territoryId);
  const notes: string[] = [];
  if (decision) notes.push("une décision réelle a déjà été rendue");
  if (initiative) notes.push(`rattachée à l'initiative « ${initiative.title} »`);
  if (resultIds.length > 0) notes.push("un résultat réel a été observé sur ce territoire");
  return {
    id: situation.id,
    title: situation.title,
    qualification: "documente",
    qualificationLabel: CASE_QUALIFICATION_LABEL.documente,
    summary: notes.length > 0 ? `${situation.description} (${notes.join(" ; ")}.)` : situation.description,
    territoryId: situation.territoryId,
    linkedSituationId: situation.id,
    linkedInitiativeId: initiative?.id,
    linkedResultIds: resultIds.length > 0 ? resultIds : undefined,
    sources: situation.confirmation ? [situation.confirmation] : undefined
  };
}

// --- Territoires déjà cadrés (G2.1/G2.1a/G1), conservés tels quels -------

function joalCases(state: ProductState): TerritorialCaseView[] {
  const cases: TerritorialCaseView[] = [];
  // Chaîne du froid — directement soutenue par sit-glace (Situation réelle)
  // et init-froid (Initiative réelle) : documenté, pas une hypothèse.
  const glace = state.situations.find((s) => s.id === "sit-glace");
  if (glace) cases.push(documentedCaseFromSituation(state, glace));
  // Valorisation coproduits/écailles — piste Scalite, explicitement à
  // qualifier (ProgramOpportunity réelle, knowledgeGaps non comblés).
  const ecaillesOpp = getOpportunitiesForTerritory("joal", state).find((o) => o.problem.includes("écailles"));
  if (ecaillesOpp) {
    const qualifying = qualifyingCaseFromOpportunity(state, "joal", ecaillesOpp.id);
    if (qualifying) cases.push(qualifying);
  }
  return cases.slice(0, 2);
}

function kayarCases(state: ProductState): TerritorialCaseView[] {
  const cases: TerritorialCaseView[] = [];
  // Tension thiof — Situation réelle, close avec confirmation (trust
  // "documentee") : un cas documenté distinct de la connectivité.
  const kayarSituation = state.situations.find((s) => s.id === "sit-kayar");
  if (kayarSituation) cases.push(documentedCaseFromSituation(state, kayarSituation));
  // Localisation/connectivité maritime — à qualifier. Mbàmbulaan y est
  // explicitement cadré comme couche de coordination/données, jamais un
  // opérateur télécom (porté par le texte réel de l'opportunité elle-même,
  // cf. demo-program-opportunities.ts).
  const connectOpp = getOpportunitiesForTerritory("kayar", state).find((o) => o.problem.toLowerCase().includes("connectivité") || o.problem.toLowerCase().includes("localisation"));
  if (connectOpp) {
    const qualifying = qualifyingCaseFromOpportunity(state, "kayar", connectOpp.id);
    if (qualifying) cases.push(qualifying);
  }
  return cases.slice(0, 2);
}

function mbourCases(state: ProductState): TerritorialCaseView[] {
  // Coordination des capacités froides de la Petite-Côte — à qualifier
  // (ProgramOpportunity réelle, déjà en instruction/"qualifying"). sit-mbour
  // existe réellement et partage même l'Initiative "init-froid" avec Joal,
  // mais un second cas quasi identique à celui de Joal serait redondant
  // (mandat explicite : "mutualisation des capacités froides de la
  // Petite-Côte", un seul cas par territoire ici) ; sit-mbour reste cité en
  // interne (evidenceRefs/justification de l'opportunité) plutôt que
  // dupliqué comme second cas.
  const froidOpp = getOpportunitiesForTerritory("mbour", state).find((o) => o.problem.toLowerCase().includes("capacités froides"));
  if (!froidOpp) return [];
  const qualifying = qualifyingCaseFromOpportunity(state, "mbour", froidOpp.id);
  return qualifying ? [qualifying] : [];
}

// Saint-Louis (G2.1 puis G2.1a) — reste "à documenter" au niveau du
// casebook tant qu'aucun cas canonique (ProgramOpportunity/Decision) n'est
// réellement qualifié, même si le territoire porte des données réelles
// (visibles ailleurs dans la fiche, cf. territory-fiche-bridge.ts
// territoryDataAvailable). Choix produit explicite du mandat, pas une
// divergence silencieuse.
function saintLouisCases(): TerritorialCaseView[] {
  return [];
}

const SPECIAL_CASE_BUILDERS: Record<string, (state: ProductState) => TerritorialCaseView[]> = {
  joal: joalCases,
  kayar: kayarCases,
  mbour: mbourCases,
  "saint-louis": saintLouisCases
};

// genericCase — pour les 14 autres territoires : un seul cas "documenté",
// construit depuis la Situation réellement spécifique à ce territoire
// (jamais la générique "-veille"). Plusieurs situations spécifiques
// peuvent exister (ex. Cap Skirring) : la plus prioritaire/ouverte
// d'abord, à défaut la première trouvée — jamais plus d'une pour ces
// territoires, afin de ne jamais sur-habiller un territoire que le mandat
// ne désigne pas comme prioritaire. Si, un jour, un territoire ne porte
// plus aucune Situation spécifique (donnée retirée du Demo World), ce
// repli retourne honnêtement [] — "à documenter" — jamais un cas fabriqué
// pour compenser.
function genericCase(state: ProductState, territoryId: string): TerritorialCaseView[] {
  const specific = state.situations.filter((s) => s.territoryId === territoryId && isSpecificSituation(s));
  if (specific.length === 0) return [];
  const chosen = [...specific].sort((a, b) => {
    const openRank = (s: Situation) => (s.status !== "reglee" ? 1 : 0);
    return openRank(b) - openRank(a);
  })[0];
  return [documentedCaseFromSituation(state, chosen)];
}

// getTerritorialCasebook — 0, 1 ou 2 cas, jamais plus (mandat Partie A,
// §1 : "au maximum 1 ou 2 cas significatifs").
export function getTerritorialCasebook(territoryId: string, state: ProductState = DEMO_STATE): TerritorialCaseView[] {
  const builder = SPECIAL_CASE_BUILDERS[territoryId];
  const cases = builder ? builder(state) : genericCase(state, territoryId);
  return cases.slice(0, 2);
}
