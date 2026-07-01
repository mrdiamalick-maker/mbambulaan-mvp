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
  lat: number;
  lng: number;
  x: number;
  y: number;
  tension: "Faible" | "Moyenne" | "Forte" | "Critique";
  signals: number;
  programs: number;
  budget: string;
  priority: string;
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

export const ministryKpis: MinistryKpi[] = [
  { label: "Territoires critiques", value: "3", detail: "Joal, Mbour, Saint-Louis", tone: "red" },
  { label: "Programmes à risque", value: "6", detail: "2 chevauchements détectés", tone: "amber" },
  { label: "Exécution budgétaire", value: "64%", detail: "moyenne portefeuille", tone: "blue" },
  { label: "Incidents ouverts", value: "4", detail: "2 critiques", tone: "red" },
  { label: "Financements bloqués", value: "2", detail: "à arbitrer", tone: "amber" },
  { label: "Ressources critiques", value: "9", detail: "froid, relais, matériel", tone: "green" }
];

export const ministryTerritories: MinistryTerritory[] = [
  { name: "Saint-Louis", zone: "Nord", lat: 16.0326, lng: -16.4818, x: 23, y: 12, tension: "Forte", signals: 9, programs: 2, budget: "180 M FCFA", priority: "Vérifier doublon programme avant nouvel engagement.", actors: ["Service pêche", "Coopérative", "Programme résilience"] },
  { name: "Kayar", zone: "Grande-Côte", lat: 14.9189, lng: -17.1211, x: 36, y: 38, tension: "Moyenne", signals: 8, programs: 1, budget: "65 M FCFA", priority: "Renforcer relais terrain et qualification des volumes matinaux.", actors: ["Relais quai", "Pêcheurs référents", "Mareyeurs"] },
  { name: "Dakar", zone: "Cap-Vert", lat: 14.7167, lng: -17.4677, x: 29, y: 50, tension: "Faible", signals: 5, programs: 3, budget: "240 M FCFA", priority: "Consolider les notes nationales et la gouvernance des accès.", actors: ["Administration", "Exportateurs", "Investisseurs"] },
  { name: "Mbour", zone: "Petite-Côte", lat: 14.4206, lng: -16.9676, x: 47, y: 64, tension: "Forte", signals: 11, programs: 2, budget: "120 M FCFA", priority: "Orienter flux vers transformation et demander preuves de distribution.", actors: ["Mareyeurs", "Transformateurs", "ONG"] },
  { name: "Joal", zone: "Petite-Côte", lat: 14.1667, lng: -16.8333, x: 56, y: 75, tension: "Critique", signals: 14, programs: 2, budget: "210 M FCFA", priority: "Prioriser froid, retrait et preuve terrain avant arbitrage.", actors: ["Commune", "Organisation professionnelle", "Relais quai"] }
];

export const ministryBudgetLines: MinistryBudgetLine[] = [
  { id: "bud-joal-froid", program: "Renforcement froid Joal", territory: "Joal", partner: "Programme résilience littorale", planned: "210 M FCFA", committed: "145 M FCFA", consumed: "82 M FCFA", executionRate: 39, status: "Retard justification", delay: "18 jours", proof: "Validation terrain simulée", variance: "63 M FCFA engagés non justifiés" },
  { id: "bud-mbour-caisses", program: "Caisses isothermes Mbour", territory: "Mbour", partner: "ONG partenaire", planned: "120 M FCFA", committed: "96 M FCFA", consumed: "74 M FCFA", executionRate: 62, status: "En exécution", delay: "5 jours", proof: "Preuves partielles", variance: "22 M FCFA à documenter" },
  { id: "bud-saint-louis", program: "Appui quai Saint-Louis", territory: "Saint-Louis", partner: "Coopération technique", planned: "180 M FCFA", committed: "166 M FCFA", consumed: "161 M FCFA", executionRate: 89, status: "Risque doublon", delay: "0 jour", proof: "Système", variance: "Deux interventions similaires détectées" },
  { id: "bud-kayar-relais", program: "Relais quai Kayar", territory: "Kayar", partner: "Direction pêche artisanale", planned: "65 M FCFA", committed: "28 M FCFA", consumed: "14 M FCFA", executionRate: 22, status: "Sous-utilisé", delay: "31 jours", proof: "Estimé", variance: "Financement bloqué à instruire" }
];

export const ministryResources: MinistryResource[] = [
  { id: "res-joal-froid", name: "Chambre froide quai Joal", category: "Froid", territory: "Joal", state: "Dégradé", availability: "Partielle", owner: "Service local", linkedProgram: "Renforcement froid Joal" },
  { id: "res-mbour-agent", name: "Agents de contrôle Mbour", category: "Ressources humaines", territory: "Mbour", state: "Disponible", availability: "3 agents", owner: "Direction régionale", linkedProgram: "Caisses isothermes Mbour" },
  { id: "res-kayar-relais", name: "Relais terrain Kayar", category: "Relais", territory: "Kayar", state: "Critique", availability: "1 relais actif", owner: "Cellule terrain", linkedProgram: "Relais quai Kayar" },
  { id: "res-saint-louis-pesee", name: "Équipement pesée Saint-Louis", category: "Matériel", territory: "Saint-Louis", state: "Obsolète", availability: "À vérifier", owner: "Coopérative", linkedProgram: "Appui quai Saint-Louis" }
];

export const ministryIncidents: MinistryIncident[] = [
  { id: "inc-joal-froid", title: "Rupture de froid sur lot sensible", type: "Infrastructure", territory: "Joal", severity: "Critique", resource: "Chambre froide quai Joal", date: "2026-07-01", owner: "Service local", status: "Ouvert", next: "Demander vérification terrain", fundingLink: "Renforcement froid Joal" },
  { id: "inc-kayar-relais", title: "Relais terrain indisponible", type: "Ressource humaine", territory: "Kayar", severity: "Haute", resource: "Relais terrain Kayar", date: "2026-06-29", owner: "Cellule terrain", status: "En cours", next: "Affecter relais secondaire", fundingLink: "Relais quai Kayar" },
  { id: "inc-saint-louis-pesee", title: "Matériel de pesée obsolète", type: "Obsolescence", territory: "Saint-Louis", severity: "Haute", resource: "Équipement pesée Saint-Louis", date: "2026-06-25", owner: "Coopérative", status: "À vérifier", next: "Créer note d'urgence", fundingLink: "Appui quai Saint-Louis" },
  { id: "inc-mbour-preuves", title: "Preuves de distribution incomplètes", type: "Preuve", territory: "Mbour", severity: "Moyenne", resource: "Dossier caisses", date: "2026-06-28", owner: "ONG partenaire", status: "Ouvert", next: "Demander preuve complémentaire", fundingLink: "Caisses isothermes Mbour" }
];

export const ministryActors = [
  { name: "Direction pêche artisanale", type: "Service public", territory: "Dakar", role: "Arbitrage et suivi national", trust: "Élevée" },
  { name: "Commune de Joal", type: "Collectivité", territory: "Joal", role: "Coordination locale", trust: "Élevée" },
  { name: "Programme résilience littorale", type: "ONG / Programme", territory: "Mbour", role: "Exécution terrain", trust: "Moyenne" },
  { name: "Relais quai Kayar", type: "Relais terrain", territory: "Kayar", role: "Validation et remontée terrain", trust: "À vérifier" }
];

export const ministryProofs: MinistryProof[] = [
  { id: "proof-joal", source: "Validation relais Joal", level: "Validé", territory: "Joal", date: "2026-07-01", linkedDecision: "Prioriser appui froid", validation: "Humaine simulée" },
  { id: "proof-mbour", source: "Photos distribution caisses", level: "Partiel", territory: "Mbour", date: "2026-06-30", linkedDecision: "Demander preuve complémentaire", validation: "À compléter" },
  { id: "proof-kayar", source: "Signal relais indisponible", level: "Déclaratif", territory: "Kayar", date: "2026-06-29", linkedDecision: "Affecter relais secondaire", validation: "Terrain requis" },
  { id: "proof-saint-louis", source: "Détection système doublon", level: "Système", territory: "Saint-Louis", date: "2026-06-28", linkedDecision: "Comparer interventions", validation: "Analyse requise" }
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