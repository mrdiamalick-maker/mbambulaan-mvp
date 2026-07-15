export type Region = "Dakar" | "Thiès" | "Saint-Louis" | "Ziguinchor" | "Fatick" | "Louga";
export type Level = "normal" | "surveillance" | "urgent";
export type DataTrustLevel = "raw" | "declared" | "verified" | "consolidated";
export type ModuleId = "map" | "community" | "tracking";
export type MapItemType = "Tous" | "Quais" | "Pirogues" | "Débarquements" | "Espèces" | "Alertes";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type PirogueCycleStage = "preparation" | "departure" | "atSea" | "expectedReturn" | "returned" | "landing" | "declared" | "verified";

export type Quay = {
  id: string;
  name: string;
  region: Region;
  commune: string;
  coordinates: Coordinates;
  x: number;
  y: number;
  landingsToday: number;
  volumeTons: number;
  activePirogues: number;
  species: string[];
  alertCount: number;
  level: Level;
  lastUpdated: string;
  trustLevel: DataTrustLevel;
};

export type Pirogue = {
  id: string;
  registration: string;
  quayId: string;
  status: string;
  lastPosition: string;
  lastDeclaration: string;
  declaredActivity: string;
  x: number;
  y: number;
  level: Level;
  cycleStage: PirogueCycleStage;
  departureTime?: string;
  expectedReturnTime?: string;
  actualReturnTime?: string;
  landingTime?: string;
  declaredAt?: string;
  lastCycleEvent: string;
  cycleHistory: Array<{ stage: PirogueCycleStage; time?: string; label: string }>;
  trustLevel: DataTrustLevel;
};

export type Landing = {
  id: string;
  quayId: string;
  time: string;
  volumeTons: number;
  species: string[];
  pirogueIds: string[];
  status: string;
  trustLevel: DataTrustLevel;
};

export type MapAlert = {
  id: string;
  quayId: string;
  title: string;
  level: Level;
  source: string;
  updatedAt: string;
  nextAction: string;
  trustLevel: DataTrustLevel;
};

export type CommunityNeed = {
  id: string;
  need: string;
  region: Region;
  place: string;
  actors: string;
  urgency: Level;
  status: string;
  nextAction: string;
  trustLevel: DataTrustLevel;
};

export type FieldReferent = {
  id: string;
  name: string;
  role: "Pêcheur référent" | "Mareyeur référent" | "Référent de quai" | "Agent territorial";
  quayId?: string;
  region: Region;
  status: "Actif" | "En attente" | "Suspendu";
  reliabilityScore: number;
  verificationsCompleted: number;
  lastActivity: string;
  contactChannel: "WhatsApp structuré" | "Téléphone" | "Application terrain";
  supervisingCell: string;
};

export type SpeciesRecord = {
  id: string;
  localName: string;
  scientificName: string;
  category: string;
  regulatoryStatus: "Libre" | "Réglementée" | "Protégée" | "Repos biologique";
  commonZones: string[];
  seasonality: string;
  monthlyVolumeTrend: number[];
  recentLandingVolume: number;
  alertLevel: Level;
  decisionUse: string;
};

export type CommunityProject = {
  id: string;
  project: string;
  territory: string;
  owner: string;
  beneficiaries: number;
  estimatedBudget: string;
  status: string;
  targetPartner: string;
  nextAction: string;
};

export type TrainingProgram = {
  id: string;
  title: string;
  region: Region;
  target: string;
  period: string;
  potentialPartner: string;
  expectedParticipants: number;
  status: string;
};

export type Partner = {
  id: string;
  name: string;
  family: string;
  usefulFor: string;
  territory: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  action: string;
};

export type PendingAction = {
  id: string;
  action: string;
  owner: string;
  territory: string;
  dueDate: string;
  status: string;
  level: Level;
};

export const regions: Region[] = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Fatick", "Louga"];
export const speciesOptions = ["Sardinelle", "Yaboy", "Thiof", "Capitaine", "Poulpe", "Crevettes", "Cymbium"];
export const mapTypes: MapItemType[] = ["Tous", "Quais", "Pirogues", "Débarquements", "Espèces", "Alertes"];
export const levelOptions = ["Tous", "Normal", "À surveiller", "Urgent"];

export const quays: Quay[] = [
  {
    id: "joal",
    name: "Joal-Fadiouth",
    region: "Thiès",
    commune: "Joal-Fadiouth",
    coordinates: { lat: 14.1667, lng: -16.8333 },
    x: 48,
    y: 72,
    landingsToday: 18,
    volumeTons: 42.5,
    activePirogues: 46,
    species: ["Sardinelle", "Yaboy", "Cymbium"],
    alertCount: 3,
    level: "surveillance",
    lastUpdated: "10:45",
    trustLevel: "consolidated"
  },
  {
    id: "mbour",
    name: "Mbour",
    region: "Thiès",
    commune: "Mbour",
    coordinates: { lat: 14.4167, lng: -16.9667 },
    x: 47,
    y: 63,
    landingsToday: 24,
    volumeTons: 54.8,
    activePirogues: 61,
    species: ["Yaboy", "Poulpe", "Crevettes"],
    alertCount: 2,
    level: "surveillance",
    lastUpdated: "10:38",
    trustLevel: "verified"
  },
  {
    id: "kayar",
    name: "Kayar",
    region: "Thiès",
    commune: "Kayar",
    coordinates: { lat: 14.9189, lng: -17.1192 },
    x: 46,
    y: 43,
    landingsToday: 14,
    volumeTons: 31.2,
    activePirogues: 37,
    species: ["Thiof", "Sardinelle", "Capitaine"],
    alertCount: 4,
    level: "urgent",
    lastUpdated: "10:22",
    trustLevel: "declared"
  },
  {
    id: "saint-louis",
    name: "Saint-Louis",
    region: "Saint-Louis",
    commune: "Guet Ndar",
    coordinates: { lat: 16.0179, lng: -16.4896 },
    x: 48,
    y: 11,
    landingsToday: 12,
    volumeTons: 27.6,
    activePirogues: 52,
    species: ["Sardinelle", "Capitaine", "Thiof"],
    alertCount: 5,
    level: "urgent",
    lastUpdated: "10:18",
    trustLevel: "declared"
  },
  {
    id: "hann",
    name: "Hann",
    region: "Dakar",
    commune: "Dakar",
    coordinates: { lat: 14.7167, lng: -17.4333 },
    x: 46,
    y: 53,
    landingsToday: 10,
    volumeTons: 22.4,
    activePirogues: 29,
    species: ["Yaboy", "Sardinelle", "Crevettes"],
    alertCount: 1,
    level: "normal",
    lastUpdated: "10:05",
    trustLevel: "verified"
  },
  {
    id: "soumbedioune",
    name: "Soumbédioune",
    region: "Dakar",
    commune: "Dakar Plateau",
    coordinates: { lat: 14.6781, lng: -17.4648 },
    x: 47,
    y: 57,
    landingsToday: 8,
    volumeTons: 15.7,
    activePirogues: 24,
    species: ["Thiof", "Poulpe", "Cymbium"],
    alertCount: 1,
    level: "normal",
    lastUpdated: "09:54",
    trustLevel: "verified"
  },
  {
    id: "fass-boye",
    name: "Fass Boye",
    region: "Louga",
    commune: "Fass Boye",
    coordinates: { lat: 15.4503, lng: -16.8567 },
    x: 46,
    y: 34,
    landingsToday: 7,
    volumeTons: 18.3,
    activePirogues: 33,
    species: ["Sardinelle", "Yaboy"],
    alertCount: 3,
    level: "surveillance",
    lastUpdated: "09:48",
    trustLevel: "declared"
  },
  {
    id: "kafountine",
    name: "Kafountine",
    region: "Ziguinchor",
    commune: "Kafountine",
    coordinates: { lat: 12.9307, lng: -16.7446 },
    x: 50,
    y: 88,
    landingsToday: 11,
    volumeTons: 24.9,
    activePirogues: 41,
    species: ["Crevettes", "Poulpe", "Cymbium"],
    alertCount: 2,
    level: "surveillance",
    lastUpdated: "09:36",
    trustLevel: "declared"
  }
];

export const pirogues: Pirogue[] = [
  { id: "pir-101", registration: "DK-PI-2041", quayId: "joal", status: "Preuve validée", lastPosition: "Quai de Joal-Fadiouth", lastDeclaration: "10:12", declaredActivity: "6,4 t de sardinelle déclarées", x: 53, y: 70, level: "normal", cycleStage: "verified", departureTime: "04:42", expectedReturnTime: "09:30", actualReturnTime: "09:18", landingTime: "09:26", declaredAt: "10:12", lastCycleEvent: "Déclaration vérifiée à 10:24", cycleHistory: [{ stage: "preparation", time: "04:20", label: "Préparation" }, { stage: "departure", time: "04:42", label: "Départ" }, { stage: "atSea", time: "05:08", label: "En mer" }, { stage: "returned", time: "09:18", label: "Retour" }, { stage: "landing", time: "09:26", label: "Débarquement" }, { stage: "declared", time: "10:12", label: "Déclaré" }, { stage: "verified", time: "10:24", label: "Preuve" }], trustLevel: "verified" },
  { id: "pir-102", registration: "SL-PI-1188", quayId: "saint-louis", status: "Retour attendu", lastPosition: "Large de Saint-Louis", lastDeclaration: "08:55", declaredActivity: "Retour non confirmé", x: 72, y: 12, level: "urgent", cycleStage: "expectedReturn", departureTime: "05:05", expectedReturnTime: "11:00", lastCycleEvent: "Retour attendu avant 11:00", cycleHistory: [{ stage: "preparation", time: "04:35", label: "Préparation" }, { stage: "departure", time: "05:05", label: "Départ" }, { stage: "atSea", time: "05:32", label: "En mer" }, { stage: "expectedReturn", time: "11:00", label: "Retour attendu" }], trustLevel: "declared" },
  { id: "pir-103", registration: "TH-PI-0772", quayId: "kayar", status: "En mer · vigilance", lastPosition: "Nord Kayar", lastDeclaration: "09:18", declaredActivity: "Trajectoire inhabituelle", x: 67, y: 39, level: "surveillance", cycleStage: "atSea", departureTime: "05:18", expectedReturnTime: "12:20", lastCycleEvent: "Position reçue à 09:18", cycleHistory: [{ stage: "preparation", time: "04:50", label: "Préparation" }, { stage: "departure", time: "05:18", label: "Départ" }, { stage: "atSea", time: "09:18", label: "En mer" }], trustLevel: "raw" },
  { id: "pir-104", registration: "ZG-PI-4510", quayId: "kafountine", status: "Retour en cours", lastPosition: "Casamance maritime", lastDeclaration: "09:45", declaredActivity: "Pêche crevettes", x: 66, y: 90, level: "normal", cycleStage: "expectedReturn", departureTime: "03:58", expectedReturnTime: "11:30", lastCycleEvent: "Cap retour confirmé à 09:45", cycleHistory: [{ stage: "preparation", time: "03:35", label: "Préparation" }, { stage: "departure", time: "03:58", label: "Départ" }, { stage: "atSea", time: "04:30", label: "En mer" }, { stage: "expectedReturn", time: "11:30", label: "Retour attendu" }], trustLevel: "declared" },
  { id: "pir-105", registration: "MB-PI-3307", quayId: "mbour", status: "Débarquement en cours", lastPosition: "Quai de Mbour", lastDeclaration: "10:06", declaredActivity: "Poulpe et crevettes", x: 52, y: 61, level: "normal", cycleStage: "landing", departureTime: "04:10", expectedReturnTime: "09:50", actualReturnTime: "09:54", landingTime: "10:06", lastCycleEvent: "Débarquement commencé à 10:06", cycleHistory: [{ stage: "preparation", time: "03:42", label: "Préparation" }, { stage: "departure", time: "04:10", label: "Départ" }, { stage: "atSea", time: "04:36", label: "En mer" }, { stage: "returned", time: "09:54", label: "Retour" }, { stage: "landing", time: "10:06", label: "Débarquement" }], trustLevel: "declared" },
  { id: "pir-106", registration: "FB-PI-2214", quayId: "fass-boye", status: "Départ à confirmer", lastPosition: "Quai de Fass Boye", lastDeclaration: "08:40", declaredActivity: "Départ groupé signalé", x: 52, y: 33, level: "surveillance", cycleStage: "departure", departureTime: "08:40", expectedReturnTime: "16:30", lastCycleEvent: "Départ signalé à 08:40", cycleHistory: [{ stage: "preparation", time: "08:10", label: "Préparation" }, { stage: "departure", time: "08:40", label: "Départ" }], trustLevel: "raw" }
];

export const landings: Landing[] = [
  { id: "land-1", quayId: "joal", time: "08:15", volumeTons: 6.4, species: ["Sardinelle", "Yaboy"], pirogueIds: ["pir-101"], status: "Déclaré", trustLevel: "verified" },
  { id: "land-2", quayId: "mbour", time: "08:40", volumeTons: 8.2, species: ["Poulpe", "Crevettes"], pirogueIds: ["pir-105"], status: "Contrôle quai", trustLevel: "declared" },
  { id: "land-3", quayId: "kayar", time: "09:05", volumeTons: 4.9, species: ["Thiof", "Capitaine"], pirogueIds: ["pir-103"], status: "À vérifier", trustLevel: "raw" },
  { id: "land-4", quayId: "saint-louis", time: "09:12", volumeTons: 7.1, species: ["Sardinelle"], pirogueIds: ["pir-102"], status: "Incomplet", trustLevel: "raw" },
  { id: "land-5", quayId: "kafountine", time: "09:40", volumeTons: 5.6, species: ["Crevettes", "Cymbium"], pirogueIds: ["pir-104"], status: "Déclaré", trustLevel: "declared" }
];

export const mapAlerts: MapAlert[] = [
  { id: "alert-1", quayId: "saint-louis", title: "Retour pirogue à confirmer", level: "urgent", source: "Cellule quai", updatedAt: "10:18", nextAction: "Demander confirmation au référent local", trustLevel: "declared" },
  { id: "alert-2", quayId: "kayar", title: "Pesée non normalisée", level: "surveillance", source: "Référent quai", updatedAt: "10:05", nextAction: "Planifier contrôle de pesée", trustLevel: "declared" },
  { id: "alert-3", quayId: "joal", title: "Besoin de glace signalé", level: "surveillance", source: "Groupement femmes", updatedAt: "09:58", nextAction: "Vérifier stock disponible", trustLevel: "raw" },
  { id: "alert-4", quayId: "mbour", title: "Panne froid partielle", level: "surveillance", source: "Gestionnaire quai", updatedAt: "09:35", nextAction: "Contacter maintenance froid", trustLevel: "verified" },
  { id: "alert-5", quayId: "fass-boye", title: "Départ groupé à confirmer", level: "surveillance", source: "Relais local", updatedAt: "09:20", nextAction: "Demander vérification terrain", trustLevel: "raw" }
];

export const communityNeeds: CommunityNeed[] = [
  { id: "need-1", need: "Besoin de glace", region: "Thiès", place: "Mbour", actors: "Mareyeurs et femmes transformatrices", urgency: "surveillance", status: "Ouvert", nextAction: "Vérifier disponibilité froid", trustLevel: "verified" },
  { id: "need-2", need: "Gilets de sécurité", region: "Saint-Louis", place: "Guet Ndar", actors: "Capitaines et jeunes pêcheurs", urgency: "urgent", status: "À traiter", nextAction: "Préparer demande équipement", trustLevel: "verified" },
  { id: "need-3", need: "Pesée normalisée", region: "Thiès", place: "Kayar", actors: "Pêcheurs et mareyeurs", urgency: "urgent", status: "Signal consolidé", nextAction: "Programmer contrôle de pesée", trustLevel: "consolidated" },
  { id: "need-4", need: "Appui femmes transformatrices", region: "Thiès", place: "Joal-Fadiouth", actors: "Groupements de femmes", urgency: "surveillance", status: "À documenter", nextAction: "Préparer fiche projet", trustLevel: "declared" },
  { id: "need-5", need: "Formation hygiène", region: "Dakar", place: "Hann", actors: "Mareyeurs et transformateurs", urgency: "normal", status: "À planifier", nextAction: "Identifier formateurs", trustLevel: "declared" },
  { id: "need-6", need: "Programme jeunes", region: "Louga", place: "Fass Boye", actors: "Jeunes et familles", urgency: "surveillance", status: "À cadrer", nextAction: "Réunir relais locaux", trustLevel: "raw" }
];

export const fieldReferents: FieldReferent[] = [
  { id: "ref-joal-1", name: "Awa Diouf", role: "Agent territorial", quayId: "joal", region: "Thiès", status: "Actif", reliabilityScore: 94, verificationsCompleted: 28, lastActivity: "Aujourd’hui · 10:24", contactChannel: "Application terrain", supervisingCell: "Cellule régionale de Thiès" },
  { id: "ref-joal-2", name: "Mamadou Sarr", role: "Pêcheur référent", quayId: "joal", region: "Thiès", status: "Actif", reliabilityScore: 87, verificationsCompleted: 19, lastActivity: "Aujourd’hui · 09:58", contactChannel: "WhatsApp structuré", supervisingCell: "Cellule régionale de Thiès" },
  { id: "ref-mbour-1", name: "Fatou Ndiaye", role: "Mareyeur référent", quayId: "mbour", region: "Thiès", status: "Actif", reliabilityScore: 91, verificationsCompleted: 23, lastActivity: "Aujourd’hui · 09:35", contactChannel: "Téléphone", supervisingCell: "Cellule régionale de Thiès" },
  { id: "ref-kayar-1", name: "Ibrahima Fall", role: "Référent de quai", quayId: "kayar", region: "Thiès", status: "Actif", reliabilityScore: 89, verificationsCompleted: 31, lastActivity: "Aujourd’hui · 10:05", contactChannel: "Application terrain", supervisingCell: "Cellule régionale de Thiès" },
  { id: "ref-sl-1", name: "Cheikh Ba", role: "Agent territorial", quayId: "saint-louis", region: "Saint-Louis", status: "Actif", reliabilityScore: 96, verificationsCompleted: 42, lastActivity: "Aujourd’hui · 10:18", contactChannel: "Application terrain", supervisingCell: "Cellule régionale de Saint-Louis" },
  { id: "ref-hann-1", name: "Rokhaya Seck", role: "Référent de quai", quayId: "hann", region: "Dakar", status: "Actif", reliabilityScore: 84, verificationsCompleted: 17, lastActivity: "Hier · 17:40", contactChannel: "WhatsApp structuré", supervisingCell: "Cellule régionale de Dakar" },
];

export const speciesDirectory: SpeciesRecord[] = [
  { id: "esp-sardinelle", localName: "Yaboy / sardinelle", scientificName: "Sardinella aurita", category: "Pélagique", regulatoryStatus: "Réglementée", commonZones: ["Thiès", "Saint-Louis", "Dakar"], seasonality: "Novembre à juin", monthlyVolumeTrend: [62, 68, 75, 81, 76, 69], recentLandingVolume: 48.6, alertLevel: "surveillance", decisionUse: "Surveiller la pression et orienter la conservation." },
  { id: "esp-thiof", localName: "Thiof", scientificName: "Epinephelus aeneus", category: "Démersale", regulatoryStatus: "Protégée", commonZones: ["Kayar", "Dakar", "Petite-Côte"], seasonality: "Suivi annuel renforcé", monthlyVolumeTrend: [38, 35, 31, 28, 24, 21], recentLandingVolume: 8.4, alertLevel: "urgent", decisionUse: "Déclencher une vigilance biodiversité et contrôler les volumes." },
  { id: "esp-poulpe", localName: "Poulpe", scientificName: "Octopus vulgaris", category: "Céphalopode", regulatoryStatus: "Repos biologique", commonZones: ["Mbour", "Joal-Fadiouth", "Kafountine"], seasonality: "Repos biologique saisonnier", monthlyVolumeTrend: [22, 28, 34, 39, 18, 8], recentLandingVolume: 12.7, alertLevel: "surveillance", decisionUse: "Aligner les programmes et contrôles sur le repos biologique." },
  { id: "esp-crevette", localName: "Crevette côtière", scientificName: "Penaeus notialis", category: "Crustacé", regulatoryStatus: "Réglementée", commonZones: ["Kafountine", "Mbour", "Dakar"], seasonality: "Mars à octobre", monthlyVolumeTrend: [18, 21, 27, 32, 35, 31], recentLandingVolume: 16.2, alertLevel: "normal", decisionUse: "Documenter les volumes pour la qualité et le financement froid." },
];

export const communityProjects: CommunityProject[] = [
  { id: "project-1", project: "Chaîne de froid communautaire", territory: "Mbour / Joal", owner: "Comité quai", beneficiaries: 680, estimatedBudget: "85 M FCFA", status: "À cadrer", targetPartner: "Opérateur froid", nextAction: "Préparer fiche projet" },
  { id: "project-2", project: "Sécurité pirogues", territory: "Saint-Louis", owner: "Référents Guet Ndar", beneficiaries: 760, estimatedBudget: "46 M FCFA", status: "Prioritaire", targetPartner: "ONG maritime", nextAction: "Demander informations" },
  { id: "project-3", project: "Pesée et traçabilité", territory: "Kayar", owner: "Organisation professionnelle", beneficiaries: 430, estimatedBudget: "38 M FCFA", status: "Documenté", targetPartner: "Partenaire technique", nextAction: "Marquer prioritaire" },
  { id: "project-4", project: "Métiers bleus jeunes", territory: "Fass Boye", owner: "Relais communautaires", beneficiaries: 320, estimatedBudget: "64 M FCFA", status: "À compléter", targetPartner: "Coopération internationale", nextAction: "Préparer note" }
];

export const trainingPrograms: TrainingProgram[] = [
  { id: "train-1", title: "Sécurité en mer", region: "Saint-Louis", target: "Capitaines et jeunes pêcheurs", period: "Août 2026", potentialPartner: "ONG maritime", expectedParticipants: 180, status: "À planifier" },
  { id: "train-2", title: "Hygiène et qualité", region: "Dakar", target: "Mareyeurs et transformateurs", period: "Octobre 2026", potentialPartner: "Services techniques", expectedParticipants: 120, status: "À confirmer" },
  { id: "train-3", title: "Chaîne de froid", region: "Thiès", target: "Gestionnaires de quai", period: "Juillet 2026", potentialPartner: "Entreprise privée", expectedParticipants: 95, status: "En cadrage" },
  { id: "train-4", title: "Traçabilité et pesée", region: "Thiès", target: "Référents de quai", period: "Septembre 2026", potentialPartner: "Partenaire technique", expectedParticipants: 75, status: "Prioritaire" },
  { id: "train-5", title: "Pêche durable", region: "Ziguinchor", target: "Pêcheurs et relais locaux", period: "Novembre 2026", potentialPartner: "ONG environnementale", expectedParticipants: 150, status: "À financer" }
];

export const partners: Partner[] = [
  { id: "partner-1", name: "ONG maritime", family: "ONG", usefulFor: "Sécurité en mer et formations", territory: "Saint-Louis" },
  { id: "partner-2", name: "Programme public froid", family: "Programme public", usefulFor: "Chaîne de froid et conservation", territory: "Mbour / Joal" },
  { id: "partner-3", name: "Collectivités littorales", family: "Collectivité", usefulFor: "Mobilisation locale et salles de formation", territory: "Multi-quais" },
  { id: "partner-4", name: "Entreprise équipements", family: "Entreprise privée", usefulFor: "Caisses, glace, pesée et énergie", territory: "Thiès" },
  { id: "partner-5", name: "Organisation professionnelle", family: "Organisation professionnelle", usefulFor: "Validation terrain et mobilisation acteurs", territory: "Kayar" }
];

export const dashboardMetrics: DashboardMetric[] = [
  { id: "metric-1", label: "Débarquements aujourd'hui", value: "104", detail: "Déclarations reçues depuis les quais suivis.", action: "Voir les débarquements" },
  { id: "metric-2", label: "Volume total débarqué", value: "237,4 t", detail: "Volume mocké déclaré sur la journée.", action: "Comparer par quai" },
  { id: "metric-3", label: "Quais actifs", value: "8", detail: "Quais avec activité ou alerte récente.", action: "Ouvrir la carte" },
  { id: "metric-4", label: "Pirogues actives", value: "323", detail: "Pirogues rattachées aux quais suivis.", action: "Voir les pirogues" },
  { id: "metric-5", label: "Alertes ouvertes", value: "21", detail: "Alertes terrain à traiter ou vérifier.", action: "Traiter les alertes" },
  { id: "metric-6", label: "Besoins terrain ouverts", value: "6", detail: "Besoins remontés par les communautés.", action: "Voir les besoins" },
  { id: "metric-7", label: "Projets en cours", value: "4", detail: "Projets communautaires suivis.", action: "Voir les projets" },
  { id: "metric-8", label: "Formations planifiées", value: "5", detail: "Sessions ou campagnes à organiser.", action: "Voir le planning" },
  { id: "metric-9", label: "Participants attendus", value: "620", detail: "Public attendu sur les formations.", action: "Voir les publics" },
  { id: "metric-10", label: "Actions en retard", value: "3", detail: "Actions à reprendre cette semaine.", action: "Voir les actions" }
];

export const pendingActions: PendingAction[] = [
  { id: "action-1", action: "Confirmer retour pirogue SL-PI-1188", owner: "Cellule quai", territory: "Saint-Louis", dueDate: "Aujourd'hui", status: "Urgent", level: "urgent" },
  { id: "action-2", action: "Vérifier panne froid Mbour", owner: "Maintenance froid", territory: "Mbour", dueDate: "Demain", status: "À suivre", level: "surveillance" },
  { id: "action-3", action: "Préparer fiche projet Joal", owner: "Service programmes", territory: "Joal-Fadiouth", dueDate: "Cette semaine", status: "Ouvert", level: "surveillance" },
  { id: "action-4", action: "Planifier formation pesée Kayar", owner: "Service technique", territory: "Kayar", dueDate: "Cette semaine", status: "Ouvert", level: "normal" }
];

export function getQuayById(id: string) {
  return quays.find((quay) => quay.id === id) ?? quays[0];
}
