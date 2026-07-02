export type MinistryTone = "blue" | "green" | "amber" | "red" | "slate";

export type MinistryKpi = {
  label: string;
  value: string;
  detail: string;
  tone: MinistryTone;
};

export type MinistryTerritory = {
  name: string;
  zone: string;
  commune: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  tension: "Faible" | "Moyenne" | "Forte" | "Critique";
  signals: number;
  programs: number;
  budget: string;
  mainRisk: string;
  priority: string;
  recommendedAction: string;
  actors: string[];
};

export type MinistryBudgetLine = {
  id: string;
  program: string;
  territory: string;
  partner: string;
  planned: string;
  committed: string;
  consumed: string;
  executionRate: number;
  status: string;
  delay: string;
  proof: string;
  variance: string;
};

export type MinistryResource = {
  id: string;
  name: string;
  category: string;
  territory: string;
  state: string;
  availability: string;
  owner: string;
  linkedProgram: string;
};

export type MinistryIncident = {
  id: string;
  title: string;
  type: string;
  territory: string;
  severity: "Faible" | "Moyenne" | "Haute" | "Critique";
  resource: string;
  date: string;
  owner: string;
  status: string;
  next: string;
  fundingLink: string;
};

export type MinistryProof = {
  id: string;
  source: string;
  level: string;
  territory: string;
  date: string;
  linkedDecision: string;
  validation: string;
};

export type MinistryQuayMetric = {
  quay: string;
  priorityScore: number;
  executionRate: number;
  pendingFunding: string;
  criticalResources: number;
  validatedProofs: number;
  referentsAvailable: number;
  lastUpdate: string;
  signalTrend: number[];
  incidentTrend: number[];
};

export type MinistryReferent = {
  id: string;
  name: string;
  role: string;
  quay: string;
  trust: "Élevée" | "Moyenne" | "À vérifier";
  availability: string;
  lastReport: string;
  needs: string;
  programs: string;
  status: string;
};

export type MinistryPendingAction = {
  id: string;
  title: string;
  quay: string;
  type: string;
  status: string;
};

export const ministryKpis: MinistryKpi[] = [
  { label: "Territoires critiques", value: "3", detail: "Joal, Mbour, Saint-Louis", tone: "red" },
  { label: "Programmes à risque", value: "6", detail: "2 chevauchements détectés", tone: "amber" },
  { label: "Exécution budgétaire", value: "64%", detail: "moyenne portefeuille", tone: "blue" },
  { label: "Incidents ouverts", value: "4", detail: "2 critiques", tone: "red" },
  { label: "Financements bloqués", value: "2", detail: "à arbitrer", tone: "amber" },
  { label: "Ressources critiques", value: "9", detail: "froid, relais, matériel", tone: "green" }
];

export const ministryTerritories: MinistryTerritory[] = [
  {
    name: "Saint-Louis",
    zone: "Nord",
    commune: "Saint-Louis",
    lat: 16.0326,
    lng: -16.4818,
    x: 23,
    y: 12,
    tension: "Forte",
    signals: 9,
    programs: 3,
    budget: "140 M FCFA",
    mainRisk: "Chevauchement programme et équipement de contrôle indisponible",
    priority: "Vérifier doublon programme avant nouvel engagement.",
    recommendedAction: "Préparer note de coordination partenaire.",
    actors: ["Service pêche", "Coopérative", "Programme résilience"]
  },
  {
    name: "Kayar",
    zone: "Grande-Côte",
    commune: "Kayar",
    lat: 14.9189,
    lng: -17.1211,
    x: 36,
    y: 38,
    tension: "Forte",
    signals: 8,
    programs: 2,
    budget: "75 M FCFA",
    mainRisk: "Tension carburant et capacité relais insuffisante",
    priority: "Affecter un relais secondaire et clarifier les besoins carburant.",
    recommendedAction: "Demander compte rendu carburant au référent pêcheur.",
    actors: ["Relais quai", "Pêcheurs référents", "Mareyeurs"]
  },
  {
    name: "Dakar",
    zone: "Cap-Vert",
    commune: "Dakar",
    lat: 14.7167,
    lng: -17.4677,
    x: 29,
    y: 50,
    tension: "Faible",
    signals: 5,
    programs: 3,
    budget: "110 M FCFA",
    mainRisk: "Transmission de données à surveiller, tension opérationnelle faible",
    priority: "Consolider les notes nationales et utiliser Dakar comme pilote données.",
    recommendedAction: "Maintenir le suivi et documenter la méthode pilote.",
    actors: ["Administration", "Exportateurs", "Investisseurs"]
  },
  {
    name: "Mbour",
    zone: "Petite-Côte",
    commune: "Mbour",
    lat: 14.4206,
    lng: -16.9676,
    x: 47,
    y: 64,
    tension: "Moyenne",
    signals: 11,
    programs: 4,
    budget: "95 M FCFA",
    mainRisk: "Écart de financement et preuves de livraison incomplètes",
    priority: "Signaler l'écart budget et demander preuve de livraison.",
    recommendedAction: "Demander preuve complémentaire au programme caisses.",
    actors: ["Mareyeurs", "Transformateurs", "ONG"]
  },
  {
    name: "Joal",
    zone: "Petite-Côte",
    commune: "Joal-Fadiouth",
    lat: 14.1667,
    lng: -16.8333,
    x: 56,
    y: 75,
    tension: "Critique",
    signals: 14,
    programs: 3,
    budget: "120 M FCFA",
    mainRisk: "Froid et financement partiellement justifié",
    priority: "Prioriser froid, retrait et preuve terrain avant arbitrage.",
    recommendedAction: "Demander vérification terrain et préparer note d'arbitrage froid.",
    actors: ["Commune", "Organisation professionnelle", "Relais quai"]
  }
];

export const ministryBudgetLines: MinistryBudgetLine[] = [
  { id: "bud-joal-froid", program: "Programme froid quai Joal", territory: "Joal", partner: "Programme résilience littorale", planned: "120 M FCFA", committed: "88 M FCFA", consumed: "73 M FCFA", executionRate: 61, status: "Justification partielle", delay: "18 jours", proof: "Validation terrain simulée", variance: "Équipements froid à justifier" },
  { id: "bud-mbour-caisses", program: "Caisses et hygiène de transport", territory: "Mbour", partner: "ONG partenaire", planned: "95 M FCFA", committed: "58 M FCFA", consumed: "49 M FCFA", executionRate: 52, status: "Preuve partielle", delay: "5 jours", proof: "Preuves partielles", variance: "Financement demandé mais preuve partielle" },
  { id: "bud-saint-louis", program: "Appui sécurité pêche artisanale", territory: "Saint-Louis", partner: "Coopération technique", planned: "140 M FCFA", committed: "101 M FCFA", consumed: "96 M FCFA", executionRate: 69, status: "Risque doublon", delay: "0 jour", proof: "Système", variance: "Risque de chevauchement entre deux partenaires" },
  { id: "bud-kayar-relais", program: "Appui sécurité sorties en mer", territory: "Kayar", partner: "Direction pêche artisanale", planned: "75 M FCFA", committed: "56 M FCFA", consumed: "41 M FCFA", executionRate: 74, status: "Retard justification", delay: "31 jours", proof: "Estimé", variance: "Retard justification relais" },
  { id: "bud-dakar-data", program: "Suivi export et qualité", territory: "Dakar", partner: "Cellule nationale", planned: "110 M FCFA", committed: "97 M FCFA", consumed: "91 M FCFA", executionRate: 83, status: "Suivi normal", delay: "0 jour", proof: "Validé", variance: "Écart faible, suivi normal" }
];

export const ministryResources: MinistryResource[] = [
  { id: "res-joal-froid", name: "Chambre froide quai Joal", category: "Froid", territory: "Joal", state: "Dégradé", availability: "Partielle", owner: "Service local", linkedProgram: "Renforcement froid Joal" },
  { id: "res-joal-relais", name: "Relais terrain secondaire", category: "Relais", territory: "Joal", state: "À renforcer", availability: "Intermittente", owner: "Commune de Joal", linkedProgram: "Suivi débarquement artisanal" },
  { id: "res-mbour-agent", name: "Agents de contrôle Mbour", category: "Ressources humaines", territory: "Mbour", state: "Disponible", availability: "3 agents", owner: "Direction régionale", linkedProgram: "Caisses isothermes Mbour" },
  { id: "res-mbour-caisses", name: "Stock caisses normalisées", category: "Matériel", territory: "Mbour", state: "À compléter", availability: "Partielle", owner: "ONG partenaire", linkedProgram: "Caisses et hygiène de transport" },
  { id: "res-kayar-relais", name: "Relais terrain Kayar", category: "Relais", territory: "Kayar", state: "Critique", availability: "1 relais actif", owner: "Cellule terrain", linkedProgram: "Relais quai Kayar" },
  { id: "res-saint-louis-pesee", name: "Équipement contrôle quai", category: "Matériel", territory: "Saint-Louis", state: "Obsolète", availability: "À vérifier", owner: "Coopérative", linkedProgram: "Appui quai Saint-Louis" },
  { id: "res-saint-louis-partner", name: "Coordination partenaire", category: "Coordination", territory: "Saint-Louis", state: "À clarifier", availability: "Partielle", owner: "Coopération technique", linkedProgram: "Projet partenaire suivi embarcations" },
  { id: "res-dakar-data", name: "Cellule transmission données", category: "Données", territory: "Dakar", state: "Disponible", availability: "Active", owner: "Cellule nationale", linkedProgram: "Données débarquement pilote" }
];

export const ministryIncidents: MinistryIncident[] = [
  { id: "inc-joal-froid", title: "Rupture de froid sur lot sensible", type: "Infrastructure", territory: "Joal", severity: "Critique", resource: "Chambre froide quai Joal", date: "2026-07-01", owner: "Service local", status: "Ouvert", next: "Demander vérification terrain", fundingLink: "Renforcement froid Joal" },
  { id: "inc-kayar-relais", title: "Relais terrain indisponible", type: "Ressource humaine", territory: "Kayar", severity: "Haute", resource: "Relais terrain Kayar", date: "2026-06-29", owner: "Cellule terrain", status: "En cours", next: "Affecter relais secondaire", fundingLink: "Relais quai Kayar" },
  { id: "inc-kayar-carburant", title: "Tension carburant signalée", type: "Approvisionnement", territory: "Kayar", severity: "Haute", resource: "Suivi communautaire", date: "2026-06-30", owner: "Relais local", status: "Ouvert", next: "Demander compte rendu carburant", fundingLink: "Appui sécurité sorties en mer" },
  { id: "inc-saint-louis-pesee", title: "Matériel de pesée obsolète", type: "Obsolescence", territory: "Saint-Louis", severity: "Haute", resource: "Équipement pesée Saint-Louis", date: "2026-06-25", owner: "Coopérative", status: "À vérifier", next: "Créer note d'urgence", fundingLink: "Appui quai Saint-Louis" },
  { id: "inc-saint-louis-zone", title: "Signal conflit zone de débarquement", type: "Coordination", territory: "Saint-Louis", severity: "Haute", resource: "Zone débarquement", date: "2026-06-27", owner: "Service régional", status: "Ouvert", next: "Préparer note partenaire", fundingLink: "Programme équipements quai" },
  { id: "inc-mbour-preuves", title: "Preuves de distribution incomplètes", type: "Preuve", territory: "Mbour", severity: "Moyenne", resource: "Dossier caisses", date: "2026-06-28", owner: "ONG partenaire", status: "Ouvert", next: "Demander preuve complémentaire", fundingLink: "Caisses isothermes Mbour" },
  { id: "inc-dakar-data", title: "Incident mineur de transmission données", type: "Données", territory: "Dakar", severity: "Faible", resource: "Cellule transmission données", date: "2026-07-01", owner: "Cellule nationale", status: "Surveillé", next: "Maintenir suivi", fundingLink: "Données débarquement pilote" }
];

export const ministryActors = [
  { name: "Direction pêche artisanale", type: "Service public", territory: "Dakar", role: "Arbitrage et suivi national", trust: "Élevée" },
  { name: "Commune de Joal", type: "Collectivité", territory: "Joal", role: "Coordination locale", trust: "Élevée" },
  { name: "Programme résilience littorale", type: "ONG / Programme", territory: "Mbour", role: "Exécution terrain", trust: "Moyenne" },
  { name: "Relais quai Kayar", type: "Relais terrain", territory: "Kayar", role: "Validation et remontée terrain", trust: "À vérifier" }
];

export const ministryProofs: MinistryProof[] = [
  { id: "proof-joal", source: "Validation relais Joal", level: "Validé", territory: "Joal", date: "2026-07-01", linkedDecision: "Prioriser appui froid", validation: "Humaine simulée" },
  { id: "proof-joal-froid", source: "Compte rendu chambre froide", level: "Partiel", territory: "Joal", date: "2026-06-30", linkedDecision: "Préparer arbitrage froid", validation: "Terrain requis" },
  { id: "proof-mbour", source: "Photos distribution caisses", level: "Partiel", territory: "Mbour", date: "2026-06-30", linkedDecision: "Demander preuve complémentaire", validation: "À compléter" },
  { id: "proof-kayar", source: "Signal relais indisponible", level: "Déclaratif", territory: "Kayar", date: "2026-06-29", linkedDecision: "Affecter relais secondaire", validation: "Terrain requis" },
  { id: "proof-saint-louis", source: "Détection système doublon", level: "Système", territory: "Saint-Louis", date: "2026-06-28", linkedDecision: "Comparer interventions", validation: "Analyse requise" },
  { id: "proof-saint-louis-equip", source: "Relevé équipement contrôle", level: "Validé", territory: "Saint-Louis", date: "2026-06-30", linkedDecision: "Demander maintenance", validation: "Humaine simulée" },
  { id: "proof-dakar", source: "Journal transmission données", level: "Validé", territory: "Dakar", date: "2026-07-01", linkedDecision: "Maintenir pilote données", validation: "Système contrôlé" },
  { id: "proof-dakar-export", source: "Synthèse qualité export", level: "Validé", territory: "Dakar", date: "2026-07-01", linkedDecision: "Consolider méthode nationale", validation: "Humaine simulée" }
];

export const ministryAiModules = [
  { name: "IA Synthèse", status: "Activée", control: "Validation humaine avant diffusion" },
  { name: "IA Territoire", status: "Activée", control: "Sources affichées par territoire" },
  { name: "IA Alertes budgétaires", status: "Activée", control: "Seuils paramétrables" },
  { name: "IA Notes", status: "Brouillon uniquement", control: "Jamais publiée sans validation" },
  { name: "IA Recherche assistée", status: "Désactivée", control: "Activation future selon droits" },
  { name: "Validation humaine", status: "Obligatoire", control: "Décision finale par utilisateur autorisé" }
];

export const ministryQuickQuestions = [
  "Que se passe-t-il à Joal ?",
  "Quelles zones prioriser cette semaine ?",
  "Quels programmes risquent de se chevaucher ?",
  "Quels budgets sont en retard ?",
  "Quelles ressources sont critiques ou obsolètes ?",
  "Quels incidents doivent être traités cette semaine ?"
];

export const ministryQuayMetrics: MinistryQuayMetric[] = [
  { quay: "Joal", priorityScore: 92, executionRate: 61, pendingFunding: "48 M FCFA", criticalResources: 2, validatedProofs: 5, referentsAvailable: 3, lastUpdate: "il y a 2 jours", signalTrend: [6, 8, 10, 13, 14], incidentTrend: [1, 2, 2, 3, 3] },
  { quay: "Mbour", priorityScore: 67, executionRate: 52, pendingFunding: "36 M FCFA", criticalResources: 1, validatedProofs: 3, referentsAvailable: 3, lastUpdate: "il y a 5 jours", signalTrend: [5, 6, 7, 9, 11], incidentTrend: [0, 1, 1, 1, 1] },
  { quay: "Kayar", priorityScore: 81, executionRate: 74, pendingFunding: "22 M FCFA", criticalResources: 1, validatedProofs: 4, referentsAvailable: 2, lastUpdate: "il y a 4 jours", signalTrend: [3, 5, 7, 7, 8], incidentTrend: [0, 1, 1, 2, 2] },
  { quay: "Saint-Louis", priorityScore: 84, executionRate: 69, pendingFunding: "55 M FCFA", criticalResources: 2, validatedProofs: 6, referentsAvailable: 2, lastUpdate: "hier", signalTrend: [4, 6, 6, 8, 9], incidentTrend: [1, 1, 2, 2, 2] },
  { quay: "Dakar", priorityScore: 54, executionRate: 83, pendingFunding: "18 M FCFA", criticalResources: 0, validatedProofs: 8, referentsAvailable: 4, lastUpdate: "aujourd'hui", signalTrend: [2, 3, 4, 4, 5], incidentTrend: [0, 0, 1, 1, 1] }
];

export const ministryReferents: MinistryReferent[] = [
  { id: "ref-joal-pecheur", name: "Mamadou Sarr", role: "Référent pêcheur", quay: "Joal", trust: "Élevée", availability: "Disponibilité partielle", lastReport: "Compte rendu il y a 3 jours", needs: "Froid et carburant", programs: "Programme froid quai Joal", status: "Actif" },
  { id: "ref-joal-mareyeur", name: "Awa Diouf", role: "Référente mareyeuse", quay: "Joal", trust: "Élevée", availability: "Disponible", lastReport: "Compte rendu il y a 3 jours", needs: "Coordination transport", programs: "Programme froid quai Joal", status: "Actif" },
  { id: "ref-joal-org", name: "Ousmane Ndiaye", role: "Relais organisation locale", quay: "Joal", trust: "Moyenne", availability: "À confirmer", lastReport: "Suit le programme froid", needs: "Preuve pour financement", programs: "Programme froid quai Joal", status: "À relancer" },
  { id: "ref-joal-relais", name: "Sokhna Fall", role: "Relais local", quay: "Joal", trust: "Élevée", availability: "Disponible", lastReport: "Incident froid documenté", needs: "Vérification terrain", programs: "Renforcement froid Joal", status: "Actif" },
  { id: "ref-mbour-pecheur", name: "Ibrahima Kane", role: "Référent pêcheur", quay: "Mbour", trust: "Moyenne", availability: "Après-midi", lastReport: "Besoin hygiène quai", needs: "Hygiène quai", programs: "Suivi mareyage local", status: "Actif" },
  { id: "ref-mbour-mareyeur", name: "Mariama Ba", role: "Référente mareyeuse", quay: "Mbour", trust: "Élevée", availability: "Disponible", lastReport: "Suit les caisses", needs: "Preuves de distribution", programs: "Caisses et hygiène de transport", status: "Actif" },
  { id: "ref-mbour-program", name: "Aminata Sow", role: "Relais programme", quay: "Mbour", trust: "Élevée", availability: "Disponible", lastReport: "Livraison partielle", needs: "Preuve livraison", programs: "Modernisation points de vente", status: "Actif" },
  { id: "ref-kayar-pecheur", name: "Cheikh Fall", role: "Référent pêcheur", quay: "Kayar", trust: "Élevée", availability: "Disponible", lastReport: "Besoin carburant", needs: "Carburant", programs: "Appui sécurité sorties en mer", status: "Actif" },
  { id: "ref-kayar-org", name: "Fatou Gueye", role: "Responsable organisation locale", quay: "Kayar", trust: "Moyenne", availability: "À confirmer", lastReport: "Compte rendu il y a 7 jours", needs: "Relais secondaire", programs: "Relais de suivi communautaire", status: "Compte rendu requis" },
  { id: "ref-saint-louis-pecheur", name: "Abdoulaye Dia", role: "Référent pêcheur", quay: "Saint-Louis", trust: "Élevée", availability: "Disponible", lastReport: "Zone de débarquement signalée", needs: "Clarification zone", programs: "Appui sécurité pêche artisanale", status: "Actif" },
  { id: "ref-saint-louis-org", name: "Rokhaya Mbaye", role: "Relais organisation professionnelle", quay: "Saint-Louis", trust: "Moyenne", availability: "Disponible", lastReport: "Suit équipements", needs: "Clarification programme", programs: "Programme équipements quai", status: "Actif" },
  { id: "ref-dakar-mareyeur", name: "Coumba Diop", role: "Référente mareyeuse", quay: "Dakar", trust: "Élevée", availability: "Disponible", lastReport: "Flux urbains suivis", needs: "Suivi qualité", programs: "Coordination mareyage urbain", status: "Actif" },
  { id: "ref-dakar-pecheur", name: "Serigne Mboup", role: "Référent pêcheur", quay: "Dakar", trust: "Élevée", availability: "Disponible", lastReport: "Débarquements pilotes", needs: "Transmission stable", programs: "Données débarquement pilote", status: "Actif" },
  { id: "ref-dakar-qualite", name: "Babacar Faye", role: "Relais qualité", quay: "Dakar", trust: "Élevée", availability: "Disponible", lastReport: "Contrôles consolidés", needs: "Méthode nationale", programs: "Suivi export et qualité", status: "Actif" },
  { id: "ref-dakar-data", name: "Ndeye Ndiaye", role: "Partenaire données", quay: "Dakar", trust: "Moyenne", availability: "Disponible", lastReport: "Suivi export", needs: "Documentation pilote", programs: "Suivi export et qualité", status: "Actif" }
];

export const ministryInitialPendingActions: MinistryPendingAction[] = [
  { id: "act-initial-joal", title: "Vérifier preuve froid Joal", quay: "Joal", type: "Vérification", status: "À traiter" },
  { id: "act-initial-mbour", title: "Compléter preuves caisses Mbour", quay: "Mbour", type: "Preuve", status: "À traiter" }
];