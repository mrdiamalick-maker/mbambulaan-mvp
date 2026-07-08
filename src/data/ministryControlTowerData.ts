export type Region = "Dakar" | "Thiès" | "Saint-Louis" | "Ziguinchor" | "Fatick" | "Louga";
export type Level = "normal" | "surveillance" | "urgent";
export type ModuleId = "map" | "community" | "tracking";
export type MapItemType = "Tous" | "Quais" | "Pirogues" | "Débarquements" | "Espèces" | "Alertes";

export type Coordinates = {
  lat: number;
  lng: number;
};

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
};

export type Landing = {
  id: string;
  quayId: string;
  time: string;
  volumeTons: number;
  species: string[];
  pirogueIds: string[];
  status: string;
};

export type MapAlert = {
  id: string;
  quayId: string;
  title: string;
  level: Level;
  source: string;
  updatedAt: string;
  nextAction: string;
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
    x: 61,
    y: 72,
    landingsToday: 18,
    volumeTons: 42.5,
    activePirogues: 46,
    species: ["Sardinelle", "Yaboy", "Cymbium"],
    alertCount: 3,
    level: "surveillance",
    lastUpdated: "10:45"
  },
  {
    id: "mbour",
    name: "Mbour",
    region: "Thiès",
    commune: "Mbour",
    coordinates: { lat: 14.4167, lng: -16.9667 },
    x: 58,
    y: 63,
    landingsToday: 24,
    volumeTons: 54.8,
    activePirogues: 61,
    species: ["Yaboy", "Poulpe", "Crevettes"],
    alertCount: 2,
    level: "surveillance",
    lastUpdated: "10:38"
  },
  {
    id: "kayar",
    name: "Kayar",
    region: "Thiès",
    commune: "Kayar",
    coordinates: { lat: 14.9189, lng: -17.1192 },
    x: 52,
    y: 43,
    landingsToday: 14,
    volumeTons: 31.2,
    activePirogues: 37,
    species: ["Thiof", "Sardinelle", "Capitaine"],
    alertCount: 4,
    level: "urgent",
    lastUpdated: "10:22"
  },
  {
    id: "saint-louis",
    name: "Saint-Louis",
    region: "Saint-Louis",
    commune: "Guet Ndar",
    coordinates: { lat: 16.0179, lng: -16.4896 },
    x: 46,
    y: 11,
    landingsToday: 12,
    volumeTons: 27.6,
    activePirogues: 52,
    species: ["Sardinelle", "Capitaine", "Thiof"],
    alertCount: 5,
    level: "urgent",
    lastUpdated: "10:18"
  },
  {
    id: "hann",
    name: "Hann",
    region: "Dakar",
    commune: "Dakar",
    coordinates: { lat: 14.7167, lng: -17.4333 },
    x: 55,
    y: 53,
    landingsToday: 10,
    volumeTons: 22.4,
    activePirogues: 29,
    species: ["Yaboy", "Sardinelle", "Crevettes"],
    alertCount: 1,
    level: "normal",
    lastUpdated: "10:05"
  },
  {
    id: "soumbedioune",
    name: "Soumbédioune",
    region: "Dakar",
    commune: "Dakar Plateau",
    coordinates: { lat: 14.6781, lng: -17.4648 },
    x: 54,
    y: 57,
    landingsToday: 8,
    volumeTons: 15.7,
    activePirogues: 24,
    species: ["Thiof", "Poulpe", "Cymbium"],
    alertCount: 1,
    level: "normal",
    lastUpdated: "09:54"
  },
  {
    id: "fass-boye",
    name: "Fass Boye",
    region: "Louga",
    commune: "Fass Boye",
    coordinates: { lat: 15.4503, lng: -16.8567 },
    x: 50,
    y: 34,
    landingsToday: 7,
    volumeTons: 18.3,
    activePirogues: 33,
    species: ["Sardinelle", "Yaboy"],
    alertCount: 3,
    level: "surveillance",
    lastUpdated: "09:48"
  },
  {
    id: "kafountine",
    name: "Kafountine",
    region: "Ziguinchor",
    commune: "Kafountine",
    coordinates: { lat: 12.9307, lng: -16.7446 },
    x: 63,
    y: 88,
    landingsToday: 11,
    volumeTons: 24.9,
    activePirogues: 41,
    species: ["Crevettes", "Poulpe", "Cymbium"],
    alertCount: 2,
    level: "surveillance",
    lastUpdated: "09:36"
  }
];

export const pirogues: Pirogue[] = [
  { id: "pir-101", registration: "DK-PI-2041", quayId: "joal", status: "Retour déclaré", lastPosition: "Petite-Côte", lastDeclaration: "10:12", declaredActivity: "Débarquement de sardinelle", x: 49, y: 70, level: "normal" },
  { id: "pir-102", registration: "SL-PI-1188", quayId: "saint-louis", status: "À vérifier", lastPosition: "Large de Saint-Louis", lastDeclaration: "08:55", declaredActivity: "Retour non confirmé", x: 31, y: 12, level: "urgent" },
  { id: "pir-103", registration: "TH-PI-0772", quayId: "kayar", status: "À surveiller", lastPosition: "Nord Kayar", lastDeclaration: "09:18", declaredActivity: "Trajectoire inhabituelle", x: 42, y: 39, level: "surveillance" },
  { id: "pir-104", registration: "ZG-PI-4510", quayId: "kafountine", status: "Retour attendu", lastPosition: "Casamance maritime", lastDeclaration: "09:45", declaredActivity: "Pêche crevettes", x: 48, y: 90, level: "normal" },
  { id: "pir-105", registration: "MB-PI-3307", quayId: "mbour", status: "Actif", lastPosition: "Mbour Sud", lastDeclaration: "10:06", declaredActivity: "Débarquement poulpe", x: 47, y: 60, level: "normal" },
  { id: "pir-106", registration: "FB-PI-2214", quayId: "fass-boye", status: "Départ à confirmer", lastPosition: "Fass Boye", lastDeclaration: "08:40", declaredActivity: "Départ groupé signalé", x: 39, y: 33, level: "surveillance" }
];

export const landings: Landing[] = [
  { id: "land-1", quayId: "joal", time: "08:15", volumeTons: 6.4, species: ["Sardinelle", "Yaboy"], pirogueIds: ["pir-101"], status: "Déclaré" },
  { id: "land-2", quayId: "mbour", time: "08:40", volumeTons: 8.2, species: ["Poulpe", "Crevettes"], pirogueIds: ["pir-105"], status: "Contrôle quai" },
  { id: "land-3", quayId: "kayar", time: "09:05", volumeTons: 4.9, species: ["Thiof", "Capitaine"], pirogueIds: ["pir-103"], status: "À vérifier" },
  { id: "land-4", quayId: "saint-louis", time: "09:12", volumeTons: 7.1, species: ["Sardinelle"], pirogueIds: ["pir-102"], status: "Incomplet" },
  { id: "land-5", quayId: "kafountine", time: "09:40", volumeTons: 5.6, species: ["Crevettes", "Cymbium"], pirogueIds: ["pir-104"], status: "Déclaré" }
];

export const mapAlerts: MapAlert[] = [
  { id: "alert-1", quayId: "saint-louis", title: "Retour pirogue à confirmer", level: "urgent", source: "Cellule quai", updatedAt: "10:18", nextAction: "Demander confirmation au référent local" },
  { id: "alert-2", quayId: "kayar", title: "Pesée non normalisée", level: "surveillance", source: "Référent quai", updatedAt: "10:05", nextAction: "Planifier contrôle de pesée" },
  { id: "alert-3", quayId: "joal", title: "Besoin de glace signalé", level: "surveillance", source: "Groupement femmes", updatedAt: "09:58", nextAction: "Vérifier stock disponible" },
  { id: "alert-4", quayId: "mbour", title: "Panne froid partielle", level: "surveillance", source: "Gestionnaire quai", updatedAt: "09:35", nextAction: "Contacter maintenance froid" },
  { id: "alert-5", quayId: "fass-boye", title: "Départ groupé à confirmer", level: "surveillance", source: "Relais local", updatedAt: "09:20", nextAction: "Demander vérification terrain" }
];

export const communityNeeds: CommunityNeed[] = [
  { id: "need-1", need: "Besoin de glace", region: "Thiès", place: "Mbour", actors: "Mareyeurs et femmes transformatrices", urgency: "surveillance", status: "Ouvert", nextAction: "Vérifier disponibilité froid" },
  { id: "need-2", need: "Gilets de sécurité", region: "Saint-Louis", place: "Guet Ndar", actors: "Capitaines et jeunes pêcheurs", urgency: "urgent", status: "À traiter", nextAction: "Préparer demande équipement" },
  { id: "need-3", need: "Pesée normalisée", region: "Thiès", place: "Kayar", actors: "Pêcheurs et mareyeurs", urgency: "urgent", status: "Signal consolidé", nextAction: "Programmer contrôle de pesée" },
  { id: "need-4", need: "Appui femmes transformatrices", region: "Thiès", place: "Joal-Fadiouth", actors: "Groupements de femmes", urgency: "surveillance", status: "À documenter", nextAction: "Préparer fiche projet" },
  { id: "need-5", need: "Formation hygiène", region: "Dakar", place: "Hann", actors: "Mareyeurs et transformateurs", urgency: "normal", status: "À planifier", nextAction: "Identifier formateurs" },
  { id: "need-6", need: "Programme jeunes", region: "Louga", place: "Fass Boye", actors: "Jeunes et familles", urgency: "surveillance", status: "À cadrer", nextAction: "Réunir relais locaux" }
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
