export type TensionLevel = "faible" | "moderee" | "forte" | "critique";
export type ProofLevel = "declaratif" | "partiel" | "valide" | "systeme";
export type SignalLevel = "info" | "attention" | "prioritaire";
export type ModuleId = "map" | "community" | "proof";

export type Quay = {
  id: string;
  name: string;
  region: string;
  commune: string;
  x: number;
  y: number;
  volumeTons: number;
  landings: number;
  activePirogues: number;
  mainSpecies: string[];
  alerts: number;
  tension: TensionLevel;
  communityNeed: string;
  signalsToQualify: string[];
  ministryRecommendation: string;
  proofLevel: ProofLevel;
  beneficiaries: number;
};

export type PilotPirogue = {
  id: string;
  registration: string;
  quayId: string;
  status: string;
  lastPosition: string;
  signal?: string;
  x: number;
  y: number;
};

export type CommunityNeed = {
  id: string;
  territory: string;
  category: string;
  audience: string;
  urgency: TensionLevel;
  beneficiaries: number;
  status: string;
  partner: string;
  summary: string;
};

export type ImpactProject = {
  id: string;
  name: string;
  territory: string;
  owner: string;
  beneficiaries: number;
  problem: string;
  expectedImpact: string;
  budget: string;
  status: string;
  partnerTarget: string;
  urgency: TensionLevel;
  maturity: string;
};

export type TrainingProgram = {
  id: string;
  title: string;
  territory: string;
  audience: string;
  objective: string;
  partner: string;
  status: string;
  period: string;
  participants: number;
  impactIndicator: string;
};

export type AwarenessCampaign = TrainingProgram;

export type PreventionSignal = {
  id: string;
  label: string;
  territory: string;
  type: string;
  level: SignalLevel;
  source: string;
  recommendedAction: string;
};

export type Partner = {
  id: string;
  family: string;
  role: string;
  potentialContribution: string;
};

export type PartnerOpportunity = {
  id: string;
  title: string;
  partnerFamily: string;
  territory: string;
  expectedValue: string;
};

export type FundingModel = {
  id: string;
  label: string;
  description: string;
};

export type LiveSignal = {
  id: string;
  time: string;
  label: string;
  territory: string;
  level: SignalLevel;
};

export type SensitiveZone = {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  level: SignalLevel;
  reason: string;
};

export type AssistedInsight = {
  id: string;
  quayId?: string;
  module: ModuleId;
  title: string;
  body: string;
  recommendation: string;
};

export const ministryQuays: Quay[] = [
  {
    id: "joal",
    name: "Joal-Fadiouth",
    region: "Thies",
    commune: "Joal-Fadiouth",
    x: 56,
    y: 72,
    volumeTons: 42.5,
    landings: 18,
    activePirogues: 46,
    mainSpecies: ["Sardinelle", "Yaboy", "Cymbium"],
    alerts: 4,
    tension: "forte",
    communityNeed: "Chaine de froid et appui aux femmes transformatrices",
    signalsToQualify: ["Besoin de glace", "Flux femmes transformatrices a documenter", "Panne froid partielle"],
    ministryRecommendation: "Documenter le besoin froid et preparer une fiche partenaire pour les groupements de transformation.",
    proofLevel: "partiel",
    beneficiaries: 1240
  },
  {
    id: "kayar",
    name: "Kayar",
    region: "Thies",
    commune: "Kayar",
    x: 48,
    y: 45,
    volumeTons: 31.2,
    landings: 14,
    activePirogues: 37,
    mainSpecies: ["Thiof", "Sardinelle", "Capitaine"],
    alerts: 5,
    tension: "critique",
    communityNeed: "Pesee normalisee, tracabilite et dialogue communautaire jeunes",
    signalsToQualify: ["Zone de conflit potentiel", "Depart groupe a qualifier", "Besoin pesee"],
    ministryRecommendation: "Ouvrir une verification terrain prudente et structurer un projet tracabilite avec partenaire technique.",
    proofLevel: "declaratif",
    beneficiaries: 980
  },
  {
    id: "mbour",
    name: "Mbour",
    region: "Thies",
    commune: "Mbour",
    x: 59,
    y: 63,
    volumeTons: 54.8,
    landings: 24,
    activePirogues: 61,
    mainSpecies: ["Yaboy", "Poulpe", "Crevettes"],
    alerts: 3,
    tension: "forte",
    communityNeed: "Atelier chaine de froid et reduction des pertes post-capture",
    signalsToQualify: ["Panne chaine de froid", "Besoin glace", "Volume a verifier"],
    ministryRecommendation: "Prioriser la conservation et rapprocher operateur froid, collectivite et groupements locaux.",
    proofLevel: "valide",
    beneficiaries: 1530
  },
  {
    id: "saint-louis",
    name: "Saint-Louis",
    region: "Saint-Louis",
    commune: "Guet Ndar",
    x: 34,
    y: 18,
    volumeTons: 27.6,
    landings: 12,
    activePirogues: 52,
    mainSpecies: ["Sardinelle", "Capitaine", "Thiof"],
    alerts: 6,
    tension: "critique",
    communityNeed: "Securite en mer et formation capitaines de pirogues",
    signalsToQualify: ["Chalutier signale au large", "Absence de retour declaratif", "Atelier securite propose"],
    ministryRecommendation: "Programmer une campagne securite en mer et demander un retour referent avec les services competents.",
    proofLevel: "partiel",
    beneficiaries: 1320
  },
  {
    id: "hann",
    name: "Hann",
    region: "Dakar",
    commune: "Dakar",
    x: 42,
    y: 52,
    volumeTons: 22.4,
    landings: 10,
    activePirogues: 29,
    mainSpecies: ["Yaboy", "Sardinelle", "Crevettes"],
    alerts: 2,
    tension: "moderee",
    communityNeed: "Qualite, hygiene et organisation des mareyeurs",
    signalsToQualify: ["Hygiene de debarquement", "Formation qualite"],
    ministryRecommendation: "Organiser une formation qualite et hygiene avec services techniques et chambre de commerce.",
    proofLevel: "systeme",
    beneficiaries: 760
  },
  {
    id: "soumbedioune",
    name: "Soumbedioune",
    region: "Dakar",
    commune: "Dakar Plateau",
    x: 39,
    y: 56,
    volumeTons: 15.7,
    landings: 8,
    activePirogues: 24,
    mainSpecies: ["Thiof", "Dorade", "Poulpe"],
    alerts: 1,
    tension: "moderee",
    communityNeed: "Organisation de quai et valorisation artisanale",
    signalsToQualify: ["Besoin organisation quai", "Valorisation touristique et halieutique"],
    ministryRecommendation: "Qualifier les besoins d'organisation et preparer un micro-projet de valorisation locale.",
    proofLevel: "declaratif",
    beneficiaries: 430
  },
  {
    id: "fass-boye",
    name: "Fass Boye",
    region: "Thies",
    commune: "Fass Boye",
    x: 45,
    y: 39,
    volumeTons: 18.3,
    landings: 7,
    activePirogues: 33,
    mainSpecies: ["Sardinelle", "Yaboy"],
    alerts: 5,
    tension: "forte",
    communityNeed: "Programme jeunes metiers bleus et sensibilisation communautaire",
    signalsToQualify: ["Depart inhabituel hors fenetre declaree", "Rupture de contact declaratif", "Besoin alternatives locales"],
    ministryRecommendation: "Proposer une campagne de dialogue communautaire et structurer un programme jeunes metiers bleus.",
    proofLevel: "declaratif",
    beneficiaries: 890
  },
  {
    id: "kafountine",
    name: "Kafountine",
    region: "Ziguinchor",
    commune: "Kafountine",
    x: 29,
    y: 86,
    volumeTons: 24.9,
    landings: 11,
    activePirogues: 41,
    mainSpecies: ["Crevettes", "Poulpe", "Cymbium"],
    alerts: 3,
    tension: "forte",
    communityNeed: "Aire de transformation amelioree et peche durable",
    signalsToQualify: ["Besoin infrastructure communautaire", "Sensibilisation engins interdits", "Controle qualite"],
    ministryRecommendation: "Relier transformation, peche durable et financement partenaire pour une aire communautaire pilote.",
    proofLevel: "partiel",
    beneficiaries: 1010
  }
];

export const pilotPirogues: PilotPirogue[] = [
  { id: "pir-101", registration: "DK-PI-2041", quayId: "joal", status: "Retour declare", lastPosition: "Zone Petite-Cote", x: 61, y: 69 },
  { id: "pir-102", registration: "SL-PI-1188", quayId: "saint-louis", status: "Situation a qualifier", lastPosition: "Large de Saint-Louis", signal: "Absence de retour declaratif", x: 31, y: 14 },
  { id: "pir-103", registration: "TH-PI-0772", quayId: "kayar", status: "Hors circuit habituel", lastPosition: "Nord Kayar", signal: "Trajectoire incoherente avec zone declaree", x: 51, y: 37 },
  { id: "pir-104", registration: "ZG-PI-4510", quayId: "kafountine", status: "Retour attendu", lastPosition: "Casamance maritime", x: 24, y: 89 },
  { id: "pir-105", registration: "MB-PI-3307", quayId: "mbour", status: "Actif", lastPosition: "Mbour Sud", x: 64, y: 60 },
  { id: "pir-106", registration: "FB-PI-2214", quayId: "fass-boye", status: "Depart groupe a qualifier", lastPosition: "Fass Boye", signal: "Depart inhabituel hors fenetre declaree", x: 47, y: 35 }
];

export const sensitiveZones: SensitiveZone[] = [
  { id: "zone-sl", name: "Saint-Louis", x: 33, y: 17, radius: 15, level: "prioritaire", reason: "Securite en mer et signalements au large" },
  { id: "zone-kayar", name: "Kayar", x: 49, y: 41, radius: 13, level: "attention", reason: "Tension communautaire et pesee" },
  { id: "zone-joal", name: "Joal", x: 57, y: 71, radius: 12, level: "attention", reason: "Chaine de froid et transformation" },
  { id: "zone-kaf", name: "Kafountine", x: 29, y: 86, radius: 14, level: "attention", reason: "Transformation et peche durable" }
];

export const liveSignals: LiveSignal[] = [
  { id: "live-1", time: "08:15", label: "Debarquement declare a Joal", territory: "Joal-Fadiouth", level: "info" },
  { id: "live-2", time: "08:27", label: "Alerte chaine de froid a Mbour", territory: "Mbour", level: "attention" },
  { id: "live-3", time: "08:42", label: "Besoin communautaire remonte a Kayar", territory: "Kayar", level: "attention" },
  { id: "live-4", time: "09:05", label: "Chalutier signale au large de Saint-Louis", territory: "Saint-Louis", level: "prioritaire" },
  { id: "live-5", time: "09:18", label: "Pirogue hors circuit habituel a qualifier", territory: "Kayar", level: "attention" },
  { id: "live-6", time: "09:31", label: "Depart inhabituel declare par referent local", territory: "Fass Boye", level: "attention" },
  { id: "live-7", time: "10:10", label: "Atelier securite en mer propose", territory: "Saint-Louis", level: "info" }
];

export const preventionSignals: PreventionSignal[] = [
  { id: "sig-1", label: "Pirogue hors circuit habituel", territory: "Kayar", type: "Mobilite maritime", level: "attention", source: "Referent local", recommendedAction: "Demander une qualification terrain et verifier le rattachement au quai." },
  { id: "sig-2", label: "Absence de retour declaratif", territory: "Saint-Louis", type: "Securite en mer", level: "prioritaire", source: "Cellule quai", recommendedAction: "Coordonner avec les services competents et conserver une trace prudente." },
  { id: "sig-3", label: "Depart groupe a qualifier", territory: "Fass Boye", type: "Prevention communautaire", level: "attention", source: "Relais jeunesse", recommendedAction: "Proposer un dialogue communautaire et une campagne d'alternatives locales." },
  { id: "sig-4", label: "Chalutier signale au large", territory: "Saint-Louis", type: "Coordination maritime", level: "prioritaire", source: "Signalement communautaire", recommendedAction: "Transmettre une demande de verification institutionnelle aux services competents." },
  { id: "sig-5", label: "Pirogue non rattachee a un quai connu", territory: "Dakar", type: "Qualification administrative", level: "attention", source: "Lecture terrain", recommendedAction: "Qualifier l'information avant toute action et rechercher un rattachement communautaire." }
];

export const communityNeeds: CommunityNeed[] = [
  { id: "need-1", territory: "Joal-Fadiouth", category: "Chaine de froid", audience: "Femmes transformatrices", urgency: "forte", beneficiaries: 420, status: "A qualifier", partner: "Bailleur / RSE froid", summary: "Besoin de glace, caisses et conservation pour reduire les pertes." },
  { id: "need-2", territory: "Kayar", category: "Pesee et tracabilite", audience: "Pêcheurs et mareyeurs", urgency: "critique", beneficiaries: 360, status: "Signal consolide", partner: "Partenaire technique", summary: "Pesee normalisee pour rendre les volumes plus fiables et arbitrables." },
  { id: "need-3", territory: "Saint-Louis", category: "Securite en mer", audience: "Capitaines et jeunes pêcheurs", urgency: "critique", beneficiaries: 510, status: "A programmer", partner: "ONG maritime / protection civile", summary: "Formation securite, reflexes de declaration et prevention des sorties a risque." },
  { id: "need-4", territory: "Fass Boye", category: "Alternatives economiques", audience: "Jeunes et familles", urgency: "forte", beneficiaries: 280, status: "A documenter", partner: "Cooperation internationale", summary: "Sensibilisation sur les departs irreguliers et parcours metiers bleus." },
  { id: "need-5", territory: "Kafountine", category: "Transformation durable", audience: "Groupements communautaires", urgency: "forte", beneficiaries: 390, status: "Partenaire a identifier", partner: "ONG environnementale", summary: "Aire de transformation amelioree et sensibilisation peche durable." }
];

export const impactProjects: ImpactProject[] = [
  { id: "project-1", name: "Chaine de froid communautaire a Mbour", territory: "Mbour", owner: "Comite quai / collectivite", beneficiaries: 680, problem: "Pertes post-debarquement et panne froid recurrente", expectedImpact: "Reduction des pertes et meilleure valeur commerciale", budget: "85 M FCFA", status: "Pret a cadrer", partnerTarget: "Operateur froid / bailleur", urgency: "forte", maturity: "Fiche courte possible" },
  { id: "project-2", name: "Programme securite pirogues a Saint-Louis", territory: "Saint-Louis", owner: "Referents Guet Ndar", beneficiaries: 760, problem: "Sorties a risque et retours declaratifs incomplets", expectedImpact: "Meilleure prevention et coordination avec services competents", budget: "46 M FCFA", status: "Prioritaire", partnerTarget: "ONG maritime", urgency: "critique", maturity: "Besoin de pieces" },
  { id: "project-3", name: "Valorisation des femmes transformatrices a Joal", territory: "Joal-Fadiouth", owner: "Groupements de femmes", beneficiaries: 540, problem: "Sous-valorisation et manque d'equipements", expectedImpact: "Autonomisation, qualite et revenus locaux", budget: "72 M FCFA", status: "Documente", partnerTarget: "Fondation / RSE", urgency: "forte", maturity: "Pret partenaire" },
  { id: "project-4", name: "Pesee normalisee et tracabilite a Kayar", territory: "Kayar", owner: "Organisation professionnelle", beneficiaries: 430, problem: "Volumes difficiles a objectiver", expectedImpact: "Arbitrages plus fiables et donnees de filiere", budget: "38 M FCFA", status: "A completer", partnerTarget: "Partenaire technique", urgency: "critique", maturity: "Prototype possible" },
  { id: "project-5", name: "Programme jeunes metiers bleus a Fass Boye", territory: "Fass Boye", owner: "Relais communautaires", beneficiaries: 320, problem: "Manque d'alternatives economiques locales", expectedImpact: "Insertion, dialogue communautaire et prevention", budget: "64 M FCFA", status: "A cadrer", partnerTarget: "Cooperation / ONG", urgency: "forte", maturity: "Note preparatoire" }
];

export const trainingPrograms: TrainingProgram[] = [
  { id: "train-1", title: "Campagne securite en mer · Saint-Louis", territory: "Saint-Louis", audience: "Jeunes pêcheurs, capitaines, referents", objective: "Reduire les sorties a risque et ameliorer les reflexes de declaration.", partner: "ONG maritime, protection civile, collectivites", status: "A planifier", period: "Aout 2026", participants: 180, impactIndicator: "Taux de retours declaratifs" },
  { id: "train-2", title: "Sensibilisation departs irreguliers · Fass Boye / Kayar", territory: "Fass Boye / Kayar", audience: "Jeunes, familles, pêcheurs, relais", objective: "Ouvrir un dialogue communautaire sur les risques et alternatives locales.", partner: "Ministere, ONG, cooperation, collectivites", status: "Prioritaire", period: "Septembre 2026", participants: 260, impactIndicator: "Participants sensibilises" },
  { id: "train-3", title: "Atelier chaine de froid · Mbour", territory: "Mbour", audience: "Mareyeurs, femmes transformatrices, gestionnaires", objective: "Reduire les pertes post-capture et ameliorer la valeur commerciale.", partner: "Prive, programme public, bailleur", status: "En cadrage", period: "Juillet 2026", participants: 95, impactIndicator: "Volume mieux conserve" },
  { id: "train-4", title: "Formation qualite & hygiene · Hann", territory: "Hann", audience: "Mareyeurs, transformateurs, quais", objective: "Ameliorer la qualite sanitaire et la valorisation des produits.", partner: "Services techniques, ONG, chambre de commerce", status: "A confirmer", period: "Octobre 2026", participants: 120, impactIndicator: "Bonnes pratiques adoptees" },
  { id: "train-5", title: "Pêche durable et engins interdits · Kafountine", territory: "Kafountine", audience: "Pêcheurs, relais, jeunes", objective: "Renforcer les pratiques durables et les regles locales.", partner: "Services techniques, ONG environnementale", status: "A financer", period: "Novembre 2026", participants: 150, impactIndicator: "Engagements communautaires" },
  { id: "train-6", title: "Formation referents communautaires Mbàmbulaan", territory: "Multi-quais", audience: "Referents de quai, agents locaux", objective: "Professionnaliser la remontee d'informations terrain.", partner: "Ministere, collectivites, programme public", status: "Pret a lancer", period: "Juillet 2026", participants: 75, impactIndicator: "Qualite des donnees terrain" }
];

export const awarenessCampaigns: AwarenessCampaign[] = trainingPrograms.filter((program) => program.title.includes("Sensibilisation") || program.title.includes("Campagne") || program.title.includes("Pêche durable"));

export const partners: Partner[] = [
  { id: "partner-ong", family: "ONG", role: "Animation terrain et prevention", potentialContribution: "Formations, relais communautaires, suivi social" },
  { id: "partner-coop", family: "Cooperation internationale", role: "Appui programme national", potentialContribution: "Financement, assistance technique, reporting impact" },
  { id: "partner-private", family: "Entreprises privees", role: "Chaine de valeur et equipements", potentialContribution: "Froid, energie, logistique, pesee" },
  { id: "partner-rse", family: "Fondations et RSE", role: "Impact social et femmes", potentialContribution: "Autonomisation, insertion, programmes communautaires" },
  { id: "partner-pro", family: "Organisations professionnelles", role: "Legitimite terrain", potentialContribution: "Validation communautaire, mobilisation acteurs, gouvernance locale" },
  { id: "partner-bank", family: "Bailleurs et institutions", role: "Financement structurant", potentialContribution: "Projets a impact, observatoire, programmes territoriaux" }
];

export const partnerOpportunities: PartnerOpportunity[] = [
  { id: "opp-1", title: "Fiche partenaire froid Petite-Cote", partnerFamily: "Operateur froid / RSE", territory: "Mbour / Joal", expectedValue: "Reduction des pertes et meilleure valeur locale" },
  { id: "opp-2", title: "Programme prevention jeunes metiers bleus", partnerFamily: "Cooperation / ONG", territory: "Fass Boye / Kayar", expectedValue: "Dialogue communautaire et alternatives economiques" },
  { id: "opp-3", title: "Qualite et hygiene des debarquements", partnerFamily: "Services techniques / chambre de commerce", territory: "Hann", expectedValue: "Professionnalisation et securite sanitaire" },
  { id: "opp-4", title: "Pêche durable et transformation", partnerFamily: "ONG environnementale", territory: "Kafountine", expectedValue: "Pratiques durables et valorisation communautaire" }
];

export const fundingModels: FundingModel[] = [
  { id: "model-1", label: "Achat institutionnel", description: "Le ministere finance une plateforme souveraine de coordination de filiere." },
  { id: "model-2", label: "Programme bailleur", description: "Un partenaire finance un programme territorial documente par Mbàmbulaan." },
  { id: "model-3", label: "Cofinancement public / prive", description: "Collectivites, entreprises et ministere financent des actions de chaine de valeur." },
  { id: "model-4", label: "Startup operatrice incubee", description: "Mbàmbulaan devient l'operateur terrain et data d'un programme national." },
  { id: "model-5", label: "Abonnement territorial", description: "Un territoire finance l'acces aux modules de supervision, preuves et reporting." },
  { id: "model-6", label: "Reporting et impact", description: "Les partenaires financent le suivi, la preuve et les notes de decision." }
];

export const assistedInsights: AssistedInsight[] = [
  { id: "ai-joal", quayId: "joal", module: "map", title: "Lecture assistee · Joal-Fadiouth", body: "Joal-Fadiouth concentre une forte activite et un besoin prioritaire sur la chaine de froid.", recommendation: "Documenter le besoin et preparer une fiche partenaire pour les femmes transformatrices." },
  { id: "ai-saint-louis", quayId: "saint-louis", module: "map", title: "Lecture assistee · Saint-Louis", body: "Saint-Louis presente plusieurs signaux a qualifier lies a la securite en mer.", recommendation: "Programmer une campagne securite et demander un retour referent avec validation humaine." },
  { id: "ai-kayar", quayId: "kayar", module: "map", title: "Lecture assistee · Kayar", body: "Kayar montre un besoin recurrent de pesee normalisee et des signaux communautaires sensibles.", recommendation: "Structurer un projet tracabilite avec partenaire technique et ouvrir une verification prudente." },
  { id: "ai-fass", quayId: "fass-boye", module: "community", title: "Lecture assistee · Fass Boye / Kayar", body: "Les signaux communautaires demandent une reponse de prevention, d'ecoute et d'alternatives economiques.", recommendation: "Proposer un programme de sensibilisation et de metiers bleus avec ONG et collectivites." },
  { id: "ai-proof", module: "proof", title: "Lecture assistee · Pilotage", body: "Trois projets sont suffisamment documentes pour etre presentes a des partenaires.", recommendation: "Preparer des fiches courtes, verifier les pieces et programmer un point d'arbitrage." }
];

export const ministryPossibilities = [
  "superviser les quais et signaux de la filiere",
  "ecouter les communautes en continu",
  "structurer les besoins en projets financables",
  "orienter ONG, bailleurs et prives vers les bonnes initiatives",
  "documenter l'impact social et economique",
  "renforcer la prevention et la sensibilisation",
  "soutenir l'insertion des jeunes dans les metiers de la mer",
  "valoriser les femmes et groupements communautaires",
  "ameliorer la coordination institutionnelle",
  "creer une base solide pour un programme national"
];

export const proofSentences = [
  "Les volumes concentres sur Joal et Mbour necessitent une verification renforcee de la chaine de froid.",
  "Les besoins les plus frequents concernent la conservation, la securite et la transformation.",
  "Trois projets sont suffisamment documentes pour etre presentes a des partenaires.",
  "Les campagnes de sensibilisation se concentrent sur les zones ou les signaux communautaires sont les plus frequents.",
  "Le pilotage ne remplace pas le terrain : il aide a prioriser, arbitrer et prouver l'impact."
];

export function getQuayById(id: string) {
  return ministryQuays.find((quay) => quay.id === id) ?? ministryQuays[0];
}
