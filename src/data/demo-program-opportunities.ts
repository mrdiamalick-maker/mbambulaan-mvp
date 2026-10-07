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

// MBOUR — coordination des capacités froides de la Petite-Côte (G2.1,
// mandat "Vision territoriale" §4). Contrairement à Joal/Kayar, un lien
// réel vers une Situation existe honnêtement ici : sit-mbour (chaîne du
// froid de Mbour réduite à une capacité de marge, repli désigné pour
// Joal) porte exactement ce sujet — le citer n'est pas une relation de
// complaisance, c'est la Situation que cette opportunité prolonge.
export function createMbourColdCoordinationOpportunityCommand(actorId: string) {
  return {
    type: "create_program_opportunity" as const,
    territoryIds: ["mbour", "joal"],
    siteIds: ["quai-mbour"],
    situationIds: ["sit-mbour"],
    actorId,
    problem: "Les capacités froides de Mbour, Joal-Fadiouth et Popenguine sont aujourd'hui traitées séparément alors qu'une panne ou une saturation sur l'une affecte les autres.",
    justification: "Mbour est le repli désigné de Joal-Fadiouth et sa propre marge est réduite à une seule capacité (voir situation sit-mbour) ; une capacité disponible existe à proximité, à Popenguine. Piloter ces sites comme un réseau coordonné plutôt que de traiter chaque tension isolément est une hypothèse qui mérite instruction.",
    potentialBeneficiaries: "Opérateurs et gestionnaires de chambres froides de Mbour, Joal-Fadiouth et Popenguine, sous réserve de qualification.",
    involvedActorIds: ["act-prestataire"],
    establishedFacts: [
      "Mbour est le repli désigné pour Joal-Fadiouth depuis le 7 septembre (voir situation sit-mbour).",
      "La chaîne du froid de Mbour est réduite à une seule capacité de marge (voir situation sit-mbour)."
    ],
    hypotheses: [
      "Piloter les capacités froides de Mbour, Joal-Fadiouth et Popenguine comme un réseau coordonné réduirait les ruptures, plutôt que de traiter chaque panne isolément."
    ],
    knowledgeGaps: [
      "Coût réel d'un délestage entre sites.",
      "Durée prévisible des tensions actuelles — dépend des sorties en mer.",
      "Règles de priorité entre sites en cas de saturation simultanée."
    ],
    potentialValueHypothesis: "Réduction potentielle des ruptures de chaîne du froid sur la Petite-Côte par une coordination inter-sites — ampleur non estimée à ce stade : strictement une hypothèse à qualifier.",
    evidenceRefs: [
      { objectType: "territory" as const, objectId: "mbour" },
      { objectType: "situation" as const, objectId: "sit-mbour" }
    ],
    possibleInterventions: [
      "Cartographier les capacités froides disponibles sur les trois sites",
      "Définir des règles de priorité et un protocole de délestage inter-sites",
      "Évaluer le coût et le financement nécessaire"
    ],
    desiredOutcomes: [
      "Un protocole de coordination inter-sites documenté",
      "Une évaluation du coût et du financement nécessaire",
      "Une décision argumentée sur la mise en place d'un pilotage coordonné"
    ],
    possibleIndicators: [{ label: "Ruptures de chaîne du froid évitées", unit: "événements/mois" }],
    maturity: "moyenne" as const
  };
}

// applyDemoProgramOpportunities — geste explicite (jamais appelé par
// createDemoState) qui applique les trois commandes ci-dessus sur un
// ProductState donné, pour toute démonstration ou test qui veut les
// exercer en conditions réelles (mêmes validations, même moteur, qu'une
// création humaine via l'UI). Mbour est ensuite fait passer à
// "qualifying" (= UI « En instruction ») : à la différence de Joal/Kayar
// (hypothèses tout juste identifiées), Mbour s'appuie déjà sur une
// Situation réelle et documentée (sit-mbour) — même geste humain
// explicite (update_program_opportunity_status), pas un statut différent
// inventé pour le distinguer.
export function applyDemoProgramOpportunities(state: ProductState, actorId: string): ProductState {
  const withJoal = applyCommand(state, createJoalCoproductsOpportunityCommand(actorId));
  const withKayar = applyCommand(withJoal, createKayarConnectivityOpportunityCommand(actorId));
  const withMbour = applyCommand(withKayar, createMbourColdCoordinationOpportunityCommand(actorId));
  const mbourOpportunity = withMbour.programOpportunities.find((item) => item.territoryIds.includes("mbour"))!;
  return applyCommand(withMbour, {
    type: "update_program_opportunity_status",
    programOpportunityId: mbourOpportunity.id,
    actorId,
    status: "qualifying",
    note: "Instruction engagée : la Situation sit-mbour et la capacité de Popenguine documentent déjà une partie du sujet."
  });
}
