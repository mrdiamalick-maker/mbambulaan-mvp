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
    region: "Thiès",
    commune: "Joal-Fadiouth",
    x: 56,
    y: 72,
    volumeTons: 42.5,
    landings: 18,
    activePirogues: 46,
    mainSpecies: ["Sardinelle", "Yaboy", "Cymbium"],
    alerts: 4,
    tension: "forte",
    communityNeed: "Chaîne de froid et appui aux femmes transformatrices",
    signalsToQualify: ["Besoin de glace", "Flux femmes transformatrices à documenter", "Panne froid partielle"],
    ministryRecommendation: "Documenter le besoin froid et préparer une fiche partenaire pour les groupements de transformation.",
    proofLevel: "partiel",
    beneficiaries: 1240
  },
  {
    id: "kayar",
    name: "Kayar",
    region: "Thiès",
    commune: "Kayar",
    x: 48,
    y: 45,
    volumeTons: 31.2,
    landings: 14,
    activePirogues: 37,
    mainSpecies: ["Thiof", "Sardinelle", "Capitaine"],
    alerts: 5,
    tension: "critique",
    communityNeed: "Pesée normalisée, traçabilité et dialogue communautaire jeunes",
    signalsToQualify: ["Zone de conflit potentiel", "Départ groupé à qualifier", "Besoin de pesée"],
    ministryRecommendation: "Ouvrir une vérification terrain prudente et structurer un projet traçabilité avec un partenaire technique.",
    proofLevel: "declaratif",
    beneficiaries: 980
  },
  {
    id: "mbour",
    name: "Mbour",
    region: "Thiès",
    commune: "Mbour",
    x: 59,
    y: 63,
    volumeTons: 54.8,
    landings: 24,
    activePirogues: 61,
    mainSpecies: ["Yaboy", "Poulpe", "Crevettes"],
    alerts: 3,
    tension: "forte",
    communityNeed: "Atelier chaîne de froid et réduction des pertes post-capture",
    signalsToQualify: ["Panne chaîne de froid", "Besoin de glace", "Volume à vérifier"],
    ministryRecommendation: "Prioriser la conservation et rapprocher opérateur froid, collectivité et groupements locaux.",
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
    communityNeed: "Sécurité en mer et formation des capitaines de pirogues",
    signalsToQualify: ["Chalutier signalé au large", "Absence de retour déclaratif", "Atelier sécurité proposé"],
    ministryRecommendation: "Programmer une campagne sécurité en mer et demander un retour référent avec les services compétents.",
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
    communityNeed: "Qualité, hygiène et organisation des mareyeurs",
    signalsToQualify: ["Hygiène de débarquement", "Formation qualité"],
    ministryRecommendation: "Organiser une formation qualité et hygiène avec les services techniques et la chambre de commerce.",
    proofLevel: "systeme",
    beneficiaries: 760
  },
  {
    id: "soumbedioune",
    name: "Soumbédioune",
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
    signalsToQualify: ["Besoin d'organisation de quai", "Valorisation touristique et halieutique"],
    ministryRecommendation: "Qualifier les besoins d'organisation et préparer un micro-projet de valorisation locale.",
    proofLevel: "declaratif",
    beneficiaries: 430
  },
  {
    id: "fass-boye",
    name: "Fass Boye",
    region: "Thiès",
    commune: "Fass Boye",
    x: 45,
    y: 39,
    volumeTons: 18.3,
    landings: 7,
    activePirogues: 33,
    mainSpecies: ["Sardinelle", "Yaboy"],
    alerts: 5,
    tension: "forte",
    communityNeed: "Programme jeunes métiers bleus et sensibilisation communautaire",
    signalsToQualify: ["Départ inhabituel hors fenêtre déclarée", "Rupture de contact déclaratif", "Besoin d'alternatives locales"],
    ministryRecommendation: "Proposer une campagne de dialogue communautaire et structurer un programme jeunes métiers bleus.",
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
    communityNeed: "Aire de transformation améliorée et pêche durable",
    signalsToQualify: ["Besoin d'infrastructure communautaire", "Sensibilisation aux engins interdits", "Contrôle qualité"],
    ministryRecommendation: "Relier transformation, pêche durable et financement partenaire pour une aire communautaire pilote.",
    proofLevel: "partiel",
    beneficiaries: 1010
  }
];

export const pilotPirogues: PilotPirogue[] = [
  { id: "pir-101", registration: "DK-PI-2041", quayId: "joal", status: "Retour déclaré", lastPosition: "Zone Petite-Côte", x: 61, y: 69 },
  { id: "pir-102", registration: "SL-PI-1188", quayId: "saint-louis", status: "Situation à qualifier", lastPosition: "Large de Saint-Louis", signal: "Absence de retour déclaratif", x: 31, y: 14 },
  { id: "pir-103", registration: "TH-PI-0772", quayId: "kayar", status: "Hors circuit habituel", lastPosition: "Nord Kayar", signal: "Trajectoire incohérente avec zone déclarée", x: 51, y: 37 },
  { id: "pir-104", registration: "ZG-PI-4510", quayId: "kafountine", status: "Retour attendu", lastPosition: "Casamance maritime", x: 24, y: 89 },
  { id: "pir-105", registration: "MB-PI-3307", quayId: "mbour", status: "Actif", lastPosition: "Mbour Sud", x: 64, y: 60 },
  { id: "pir-106", registration: "FB-PI-2214", quayId: "fass-boye", status: "Départ groupé à qualifier", lastPosition: "Fass Boye", signal: "Départ inhabituel hors fenêtre déclarée", x: 47, y: 35 }
];

export const sensitiveZones: SensitiveZone[] = [
  { id: "zone-sl", name: "Saint-Louis", x: 33, y: 17, radius: 15, level: "prioritaire", reason: "Sécurité en mer et signalements au large" },
  { id: "zone-kayar", name: "Kayar", x: 49, y: 41, radius: 13, level: "attention", reason: "Tension communautaire et pesée" },
  { id: "zone-joal", name: "Joal", x: 57, y: 71, radius: 12, level: "attention", reason: "Chaîne de froid et transformation" },
  { id: "zone-kaf", name: "Kafountine", x: 29, y: 86, radius: 14, level: "attention", reason: "Transformation et pêche durable" }
];

export const liveSignals: LiveSignal[] = [
  { id: "live-1", time: "08:15", label: "Débarquement déclaré à Joal", territory: "Joal-Fadiouth", level: "info" },
  { id: "live-2", time: "08:27", label: "Alerte chaîne de froid à Mbour", territory: "Mbour", level: "attention" },
  { id: "live-3", time: "08:42", label: "Besoin communautaire remonté à Kayar", territory: "Kayar", level: "attention" },
  { id: "live-4", time: "09:05", label: "Chalutier signalé au large de Saint-Louis", territory: "Saint-Louis", level: "prioritaire" },
  { id: "live-5", time: "09:18", label: "Pirogue hors circuit habituel à qualifier", territory: "Kayar", level: "attention" },
  { id: "live-6", time: "09:31", label: "Départ inhabituel déclaré par référent local", territory: "Fass Boye", level: "attention" },
  { id: "live-7", time: "10:10", label: "Atelier sécurité en mer proposé", territory: "Saint-Louis", level: "info" }
];

export const preventionSignals: PreventionSignal[] = [
  { id: "sig-1", label: "Pirogue hors circuit habituel", territory: "Kayar", type: "Mobilité maritime", level: "attention", source: "Référent local", recommendedAction: "Demander une qualification terrain et vérifier le rattachement au quai." },
  { id: "sig-2", label: "Absence de retour déclaratif", territory: "Saint-Louis", type: "Sécurité en mer", level: "prioritaire", source: "Cellule quai", recommendedAction: "Coordonner avec les services compétents et conserver une trace prudente." },
  { id: "sig-3", label: "Départ groupé à qualifier", territory: "Fass Boye", type: "Prévention communautaire", level: "attention", source: "Relais jeunesse", recommendedAction: "Proposer un dialogue communautaire et une campagne d'alternatives locales." },
  { id: "sig-4", label: "Chalutier signalé au large", territory: "Saint-Louis", type: "Coordination maritime", level: "prioritaire", source: "Signalement communautaire", recommendedAction: "Transmettre une demande de vérification institutionnelle aux services compétents." },
  { id: "sig-5", label: "Pirogue non rattachée à un quai connu", territory: "Dakar", type: "Qualification administrative", level: "attention", source: "Lecture terrain", recommendedAction: "Qualifier l'information avant toute action et rechercher un rattachement communautaire." }
];

export const communityNeeds: CommunityNeed[] = [
  { id: "need-1", territory: "Joal-Fadiouth", category: "Chaîne de froid", audience: "Femmes transformatrices", urgency: "forte", beneficiaries: 420, status: "À qualifier", partner: "Bailleur / RSE froid", summary: "Besoin de glace, caisses et conservation pour réduire les pertes." },
  { id: "need-2", territory: "Kayar", category: "Pesée et traçabilité", audience: "Pêcheurs et mareyeurs", urgency: "critique", beneficiaries: 360, status: "Signal consolidé", partner: "Partenaire technique", summary: "Pesée normalisée pour rendre les volumes plus fiables et arbitrables." },
  { id: "need-3", territory: "Saint-Louis", category: "Sécurité en mer", audience: "Capitaines et jeunes pêcheurs", urgency: "critique", beneficiaries: 510, status: "À programmer", partner: "ONG maritime / protection civile", summary: "Formation sécurité, réflexes de déclaration et prévention des sorties à risque." },
  { id: "need-4", territory: "Fass Boye", category: "Alternatives économiques", audience: "Jeunes et familles", urgency: "forte", beneficiaries: 280, status: "À documenter", partner: "Coopération internationale", summary: "Sensibilisation sur les départs irréguliers et parcours métiers bleus." },
  { id: "need-5", territory: "Kafountine", category: "Transformation durable", audience: "Groupements communautaires", urgency: "forte", beneficiaries: 390, status: "Partenaire à identifier", partner: "ONG environnementale", summary: "Aire de transformation améliorée et sensibilisation pêche durable." }
];

export const impactProjects: ImpactProject[] = [
  { id: "project-1", name: "Chaîne de froid communautaire à Mbour", territory: "Mbour", owner: "Comité quai / collectivité", beneficiaries: 680, problem: "Pertes post-débarquement et panne froid récurrente", expectedImpact: "Réduction des pertes et meilleure valeur commerciale", budget: "85 M FCFA", status: "Prêt à cadrer", partnerTarget: "Opérateur froid / bailleur", urgency: "forte", maturity: "Fiche courte possible" },
  { id: "project-2", name: "Programme sécurité pirogues à Saint-Louis", territory: "Saint-Louis", owner: "Référents Guet Ndar", beneficiaries: 760, problem: "Sorties à risque et retours déclaratifs incomplets", expectedImpact: "Meilleure prévention et coordination avec les services compétents", budget: "46 M FCFA", status: "Prioritaire", partnerTarget: "ONG maritime", urgency: "critique", maturity: "Besoin de pièces" },
  { id: "project-3", name: "Valorisation des femmes transformatrices à Joal", territory: "Joal-Fadiouth", owner: "Groupements de femmes", beneficiaries: 540, problem: "Sous-valorisation et manque d'équipements", expectedImpact: "Autonomisation, qualité et revenus locaux", budget: "72 M FCFA", status: "Documenté", partnerTarget: "Fondation / RSE", urgency: "forte", maturity: "Prêt partenaire" },
  { id: "project-4", name: "Pesée normalisée et traçabilité à Kayar", territory: "Kayar", owner: "Organisation professionnelle", beneficiaries: 430, problem: "Volumes difficiles à objectiver", expectedImpact: "Arbitrages plus fiables et données de filière", budget: "38 M FCFA", status: "À compléter", partnerTarget: "Partenaire technique", urgency: "critique", maturity: "Prototype possible" },
  { id: "project-5", name: "Programme jeunes métiers bleus à Fass Boye", territory: "Fass Boye", owner: "Relais communautaires", beneficiaries: 320, problem: "Manque d'alternatives économiques locales", expectedImpact: "Insertion, dialogue communautaire et prévention", budget: "64 M FCFA", status: "À cadrer", partnerTarget: "Coopération / ONG", urgency: "forte", maturity: "Note préparatoire" }
];

export const trainingPrograms: TrainingProgram[] = [
  { id: "train-1", title: "Campagne sécurité en mer · Saint-Louis", territory: "Saint-Louis", audience: "Jeunes pêcheurs, capitaines, référents", objective: "Réduire les sorties à risque et améliorer les réflexes de déclaration.", partner: "ONG maritime, protection civile, collectivités", status: "À planifier", period: "Août 2026", participants: 180, impactIndicator: "Taux de retours déclaratifs" },
  { id: "train-2", title: "Sensibilisation départs irréguliers · Fass Boye / Kayar", territory: "Fass Boye / Kayar", audience: "Jeunes, familles, pêcheurs, relais", objective: "Ouvrir un dialogue communautaire sur les risques et alternatives locales.", partner: "Ministère, ONG, coopération, collectivités", status: "Prioritaire", period: "Septembre 2026", participants: 260, impactIndicator: "Participants sensibilisés" },
  { id: "train-3", title: "Atelier chaîne de froid · Mbour", territory: "Mbour", audience: "Mareyeurs, femmes transformatrices, gestionnaires", objective: "Réduire les pertes post-capture et améliorer la valeur commerciale.", partner: "Privé, programme public, bailleur", status: "En cadrage", period: "Juillet 2026", participants: 95, impactIndicator: "Volume mieux conservé" },
  { id: "train-4", title: "Formation qualité & hygiène · Hann", territory: "Hann", audience: "Mareyeurs, transformateurs, quais", objective: "Améliorer la qualité sanitaire et la valorisation des produits.", partner: "Services techniques, ONG, chambre de commerce", status: "À confirmer", period: "Octobre 2026", participants: 120, impactIndicator: "Bonnes pratiques adoptées" },
  { id: "train-5", title: "Pêche durable et engins interdits · Kafountine", territory: "Kafountine", audience: "Pêcheurs, relais, jeunes", objective: "Renforcer les pratiques durables et les règles locales.", partner: "Services techniques, ONG environnementale", status: "À financer", period: "Novembre 2026", participants: 150, impactIndicator: "Engagements communautaires" },
  { id: "train-6", title: "Formation référents communautaires Mbàmbulaan", territory: "Multi-quais", audience: "Référents de quai, agents locaux", objective: "Professionnaliser la remontée d'informations terrain.", partner: "Ministère, collectivités, programme public", status: "Prêt à lancer", period: "Juillet 2026", participants: 75, impactIndicator: "Qualité des données terrain" }
];

export const awarenessCampaigns: AwarenessCampaign[] = trainingPrograms.filter((program) => program.title.includes("Sensibilisation") || program.title.includes("Campagne") || program.title.includes("Pêche durable"));

export const partners: Partner[] = [
  { id: "partner-ong", family: "ONG", role: "Animation terrain et prévention", potentialContribution: "Formations, relais communautaires, suivi social" },
  { id: "partner-coop", family: "Coopération internationale", role: "Appui programme national", potentialContribution: "Financement, assistance technique, reporting impact" },
  { id: "partner-private", family: "Entreprises privées", role: "Chaîne de valeur et équipements", potentialContribution: "Froid, énergie, logistique, pesée" },
  { id: "partner-rse", family: "Fondations et RSE", role: "Impact social et femmes", potentialContribution: "Autonomisation, insertion, programmes communautaires" },
  { id: "partner-pro", family: "Organisations professionnelles", role: "Légitimité terrain", potentialContribution: "Validation communautaire, mobilisation acteurs, gouvernance locale" },
  { id: "partner-bank", family: "Bailleurs et institutions", role: "Financement structurant", potentialContribution: "Projets à impact, observatoire, programmes territoriaux" }
];

export const partnerOpportunities: PartnerOpportunity[] = [
  { id: "opp-1", title: "Fiche partenaire froid Petite-Côte", partnerFamily: "Opérateur froid / RSE", territory: "Mbour / Joal", expectedValue: "Réduction des pertes et meilleure valeur locale" },
  { id: "opp-2", title: "Programme prévention jeunes métiers bleus", partnerFamily: "Coopération / ONG", territory: "Fass Boye / Kayar", expectedValue: "Dialogue communautaire et alternatives économiques" },
  { id: "opp-3", title: "Qualité et hygiène des débarquements", partnerFamily: "Services techniques / chambre de commerce", territory: "Hann", expectedValue: "Professionnalisation et sécurité sanitaire" },
  { id: "opp-4", title: "Pêche durable et transformation", partnerFamily: "ONG environnementale", territory: "Kafountine", expectedValue: "Pratiques durables et valorisation communautaire" }
];

export const fundingModels: FundingModel[] = [
  { id: "model-1", label: "Achat institutionnel", description: "Le ministère finance une plateforme souveraine de coordination de filière." },
  { id: "model-2", label: "Programme bailleur", description: "Un partenaire finance un programme territorial documenté par Mbàmbulaan." },
  { id: "model-3", label: "Cofinancement public / privé", description: "Collectivités, entreprises et ministère financent des actions de chaîne de valeur." },
  { id: "model-4", label: "Startup opératrice incubée", description: "Mbàmbulaan devient l'opérateur terrain et data d'un programme national." },
  { id: "model-5", label: "Abonnement territorial", description: "Un territoire finance l'accès aux modules de supervision, preuves et reporting." },
  { id: "model-6", label: "Reporting et impact", description: "Les partenaires financent le suivi, la preuve et les notes de décision." }
];

export const assistedInsights: AssistedInsight[] = [
  { id: "ai-joal", quayId: "joal", module: "map", title: "Lecture assistée · Joal-Fadiouth", body: "Joal-Fadiouth concentre une forte activité et un besoin prioritaire sur la chaîne de froid.", recommendation: "Documenter le besoin et préparer une fiche partenaire pour les femmes transformatrices." },
  { id: "ai-saint-louis", quayId: "saint-louis", module: "map", title: "Lecture assistée · Saint-Louis", body: "Saint-Louis présente plusieurs signaux à qualifier liés à la sécurité en mer.", recommendation: "Programmer une campagne sécurité et demander un retour référent avec validation humaine." },
  { id: "ai-kayar", quayId: "kayar", module: "map", title: "Lecture assistée · Kayar", body: "Kayar montre un besoin récurrent de pesée normalisée et des signaux communautaires sensibles.", recommendation: "Structurer un projet traçabilité avec partenaire technique et ouvrir une vérification prudente." },
  { id: "ai-fass", quayId: "fass-boye", module: "community", title: "Lecture assistée · Fass Boye / Kayar", body: "Les signaux communautaires demandent une réponse de prévention, d'écoute et d'alternatives économiques.", recommendation: "Proposer un programme de sensibilisation et de métiers bleus avec ONG et collectivités." },
  { id: "ai-proof", module: "proof", title: "Lecture assistée · Pilotage", body: "Trois projets sont suffisamment documentés pour être présentés à des partenaires.", recommendation: "Préparer des fiches courtes, vérifier les pièces et programmer un point d'arbitrage." }
];

export const ministryPossibilities = [
  "superviser les quais et signaux de la filière",
  "écouter les communautés en continu",
  "structurer les besoins en projets finançables",
  "orienter ONG, bailleurs et privés vers les bonnes initiatives",
  "documenter l'impact social et économique",
  "renforcer la prévention et la sensibilisation",
  "soutenir l'insertion des jeunes dans les métiers de la mer",
  "valoriser les femmes et groupements communautaires",
  "améliorer la coordination institutionnelle",
  "créer une base solide pour un programme national"
];

export const proofSentences = [
  "Les volumes concentrés sur Joal et Mbour nécessitent une vérification renforcée de la chaîne de froid.",
  "Les besoins les plus fréquents concernent la conservation, la sécurité et la transformation.",
  "Trois projets sont suffisamment documentés pour être présentés à des partenaires.",
  "Les campagnes de sensibilisation se concentrent sur les zones où les signaux communautaires sont les plus fréquents.",
  "Le pilotage ne remplace pas le terrain : il aide à prioriser, arbitrer et prouver l'impact."
];

export function getQuayById(id: string) {
  return ministryQuays.find((quay) => quay.id === id) ?? ministryQuays[0];
}
