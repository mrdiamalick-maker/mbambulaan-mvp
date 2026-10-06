// Opportunités de démonstration — mandat G1 "Territory → Situation →
// Opportunity → Arbitration → Initiative/Result".
//
// Volontairement PAS appliquées par createDemoState() (src/data/demo-state.ts) :
// le Demo World ne doit jamais contenir de ProgramOpportunity au
// chargement (doctrine déjà établie et testée, LOT 0.3, "le Demo World
// ne contient aucune ProgramOpportunity au chargement" —
// tests/program-opportunity.test.ts, TEST D). Une Opportunity naît
// toujours d'un geste explicite (create_program_opportunity), jamais
// d'une promotion automatique au chargement — ces deux cas de
// démonstration suivent exactement la même règle : ce fichier fournit
// les commandes prêtes à appliquer, pas un état déjà créé.
//
// Les deux cas ci-dessous n'ont volontairement AUCUN collectiveNeedId ni
// situationId fabriqué : aucune Situation ni aucun CollectiveNeed
// existant du Demo World ne porte réellement sur ces deux sujets (Joal :
// uniquement la chaîne du froid/glace ; Kayar : uniquement la
// motorisation/pannes moteur, cf. cn-kayar-motorisation). Créer un lien
// de complaisance vers l'un de ces objets aurait été une fausse relation
// — le mandat interdit explicitement de "fabriquer une Situation
// factuelle uniquement pour satisfaire une relation". L'ancrage retenu
// est donc Territory (+ Site), toujours réel et toujours obligatoire.
import type { ProductState } from "@/domain/types";
import { applyCommand } from "@/domain/rules";

// JOAL — valorisation des coproduits/écailles de poisson. Hypothèse
// d'opportunité explicitement non chiffrée (mandat G1 : "ne pas inventer
// volumes, rentabilité, emplois ou faisabilité industrielle") — tout ce
// qui relèverait d'un chiffre non sourcé reste en knowledgeGaps, jamais
// en establishedFacts ni en potentialValueHypothesis.
export function createJoalCoproductsOpportunityCommand(actorId: string) {
  return {
    type: "create_program_opportunity" as const,
    actorId,
    // Pas de collectiveNeedId : aucun besoin collectif existant ne porte
    // sur les coproduits/écailles (cn-kayar-motorisation est un sujet
    // différent, à Kayar). Pas de situationId : aucune Situation Joal
    // existante ne porte sur ce sujet (sit-glace/sit-joal-glace-recurrence
    // portent sur la chaîne du froid, pas sur la valorisation de coproduits).
    territoryIds: ["joal"],
    siteIds: ["quai-joal"],
    problem: "Les écailles et autres coproduits de poisson générés au débarquement à Joal-Fadiouth ne sont aujourd'hui ni collectés de façon structurée ni valorisés.",
    justification: "Le territoire concentre une activité de débarquement réelle et documentée (voir indicateurs d'activité du territoire). Une valorisation industrielle des coproduits — écailles notamment, par exemple vers une filière de type Scalite — est une hypothèse qui n'a jamais été qualifiée et mérite une instruction avant toute décision.",
    potentialBeneficiaries: "Opérateurs du quai de Joal et éventuel partenaire industriel de valorisation, sous réserve de qualification.",
    involvedActorIds: ["act-gestionnaire"],
    establishedFacts: [
      "Joal-Fadiouth concentre une activité de débarquement de poissons entiers réelle et significative (voir indicateurs d'activité du territoire).",
      "Aucune collecte ni valorisation structurée des écailles/coproduits n'est aujourd'hui documentée dans le domaine pour ce territoire."
    ],
    hypotheses: [
      "Les écailles et autres coproduits de poisson générés localement pourraient être collectés et valorisés industriellement (par exemple vers une filière de type Scalite ou équivalent)."
    ],
    knowledgeGaps: [
      "Volume réel d'écailles/coproduits générés localement — non mesuré.",
      "Faisabilité logistique de la collecte (fréquence, stockage, transport) — non étudiée.",
      "Rentabilité économique de la valorisation — non estimée.",
      "Emplois potentiels générés — non estimés.",
      "Existence et conditions d'un partenaire industriel intéressé — non vérifiées."
    ],
    potentialValueHypothesis: "Valorisation industrielle potentielle des coproduits de poisson (écailles notamment) — ampleur économique non estimée à ce stade : strictement une hypothèse à qualifier, pas un résultat ni une projection chiffrée.",
    evidenceRefs: [
      { objectType: "territory" as const, objectId: "joal" },
      { objectType: "site" as const, objectId: "quai-joal" }
    ],
    possibleInterventions: [
      "Étudier la faisabilité d'une collecte structurée des écailles/coproduits au débarquement",
      "Identifier un ou plusieurs partenaires industriels potentiels de valorisation",
      "Qualifier le cadre logistique et réglementaire nécessaire"
    ],
    desiredOutcomes: [
      "Un volume réel de coproduits valorisables mesuré et documenté",
      "Une évaluation de faisabilité industrielle et logistique",
      "Une décision argumentée sur la pertinence de poursuivre"
    ],
    possibleIndicators: [{ label: "Volume d'écailles/coproduits collecté", unit: "kg/mois" }],
    maturity: "faible" as const
  };
}

// KAYAR — connectivité et localisation maritime. Mbàmbulaan y est
// explicitement cadré comme couche de coordination/données/services,
// jamais comme opérateur télécom ou fournisseur de connectivité
// satellite lui-même (mandat G1, contrainte explicite) — ce cadrage est
// porté par knowledgeGaps/possibleInterventions, pas par une affirmation
// de rôle technique.
export function createKayarConnectivityOpportunityCommand(actorId: string) {
  return {
    type: "create_program_opportunity" as const,
    actorId,
    // Pas de collectiveNeedId : cn-kayar-motorisation porte sur les
    // pannes moteur, un sujet différent de la connectivité/localisation.
    // Pas de situationId : aucune Situation Kayar existante ne porte sur
    // ce sujet.
    territoryIds: ["kayar"],
    siteIds: ["zone-kayar"],
    problem: "Les capitaines et pêcheurs opérant en mer à Kayar ne disposent d'aucun dispositif coordonné de connectivité ou de localisation maritime documenté dans le domaine.",
    justification: "Une meilleure connectivité/localisation pourrait améliorer la sécurité et la coordination des sorties en mer, en appui d'un programme piloté avec des acteurs publics et des opérateurs compétents. L'hypothèse mérite une instruction avant toute décision, sans présumer du rôle technique de Mbàmbulaan.",
    potentialBeneficiaries: "Capitaines et pêcheurs opérant en mer à Kayar, sous réserve de qualification du besoin réel.",
    involvedActorIds: ["act-capitaine-kayar"],
    establishedFacts: [
      "Kayar est un territoire de pêche actif, avec des capitaines et des pirogues opérant réellement en mer (voir activité du territoire).",
      "Aucun dispositif de connectivité ou de localisation maritime coordonné n'est aujourd'hui documenté dans le domaine pour les pirogues de Kayar."
    ],
    hypotheses: [
      "Un programme coordonné de connectivité/localisation maritime, mené avec des acteurs publics et des opérateurs techniques compétents, pourrait améliorer la sécurité et la coordination des sorties en mer."
    ],
    knowledgeGaps: [
      "Besoins réels exprimés par les capitaines en matière de connectivité/localisation — non recueillis formellement.",
      "Opérateurs publics/privés compétents et leur disponibilité — non identifiés.",
      "Modèle de gouvernance et de financement d'un tel programme — non défini.",
      "Rôle précis de Mbàmbulaan (coordination/données/services) vis-à-vis d'un opérateur technique — à clarifier ; Mbàmbulaan n'est pas un opérateur télécom ni un fournisseur de connectivité satellite."
    ],
    potentialValueHypothesis: "Amélioration potentielle de la sécurité et de la coordination des sorties en mer via une meilleure connectivité/localisation — ampleur non estimée à ce stade : strictement une hypothèse à qualifier, pas un résultat observé.",
    evidenceRefs: [
      { objectType: "territory" as const, objectId: "kayar" },
      { objectType: "site" as const, objectId: "zone-kayar" }
    ],
    possibleInterventions: [
      "Recueillir les besoins réels des capitaines et opérateurs de Kayar en connectivité/localisation",
      "Identifier les acteurs publics et opérateurs techniques compétents",
      "Définir le rôle de coordination de Mbàmbulaan sans présomption de rôle d'opérateur technique"
    ],
    desiredOutcomes: [
      "Une qualification réelle du besoin de connectivité/localisation à Kayar",
      "Une cartographie des opérateurs/acteurs publics pertinents",
      "Une décision argumentée sur la pertinence et le montage d'un programme coordonné"
    ],
    possibleIndicators: [{ label: "Sorties en mer couvertes par un dispositif de localisation", unit: "%" }],
    maturity: "faible" as const
  };
}

// applyDemoProgramOpportunities — geste explicite (jamais appelé par
// createDemoState) qui applique les deux commandes ci-dessus sur un
// ProductState donné, pour toute démonstration ou test qui veut les
// exercer en conditions réelles (mêmes validations, même moteur,
// qu'une création humaine via l'UI).
export function applyDemoProgramOpportunities(state: ProductState, actorId: string): ProductState {
  const withJoal = applyCommand(state, createJoalCoproductsOpportunityCommand(actorId));
  return applyCommand(withJoal, createKayarConnectivityOpportunityCommand(actorId));
}
