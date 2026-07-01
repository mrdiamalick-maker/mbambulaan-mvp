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

export type QuayReferent = {
  id: string;
  name: string;
  role: string;
  trust: "Élevée" | "Moyenne" | "À vérifier";
  availability: string;
  lastReport: string;
  needs: string;
  programs: string[];
  action: string;
};

export type QuayProgram = {
  name: string;
  owner: string;
  status: string;
  risk: string;
};

export type QuayBudget = {
  planned: number;
  committed: number;
  consumed: number;
  pendingFunding: number;
  variance: string;
  status: string;
};

export type QuayProfile = {
  id: string;
  name: string;
  commune: string;
  region: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  tension: "Faible" | "Moyenne" | "Forte" | "Critique";
  priorityScore: number;
  mainRisk: string;
  lastUpdate: string;
  metrics: {
    openIncidents: number;
    budgetExecution: number;
    pendingFundingFcfa: number;
    criticalResources: number;
    activePrograms: number;
    validatedProofs: number;
    availableReferents: number;
  };
  programs: QuayProgram[];
  budget: QuayBudget;
  incidents: string[];
  resources: string[];
  referents: QuayReferent[];
  proofs: string[];
  recommendedAction: string;
  missingData: string;
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

export const quayProfiles: QuayProfile[] = [
  {
    id: "joal",
    name: "Joal",
    commune: "Joal-Fadiouth",
    region: "Thiès",
    lat: 14.1667,
    lng: -16.8333,
    x: 56,
    y: 75,
    tension: "Critique",
    priorityScore: 92,
    mainRisk: "Froid critique et financement partiellement justifié",
    lastUpdate: "Il y a 2 jours",
    metrics: { openIncidents: 3, budgetExecution: 61, pendingFundingFcfa: 48, criticalResources: 2, activePrograms: 3, validatedProofs: 5, availableReferents: 3 },
    programs: [
      { name: "Programme froid quai Joal", owner: "Programme résilience littorale", status: "À arbitrer", risk: "Justification partielle" },
      { name: "Appui caisses normalisées", owner: "Direction pêche artisanale", status: "En suivi", risk: "Preuves à consolider" },
      { name: "Suivi débarquement artisanal", owner: "Service local", status: "Actif", risk: "Volumes à vérifier" }
    ],
    budget: { planned: 120, committed: 88, consumed: 73, pendingFunding: 48, variance: "Justification partielle sur équipements froid", status: "Écart à instruire" },
    incidents: ["Panne partielle chambre froide", "Conflit d'accès quai", "Retard vérification lots"],
    resources: ["Chambre froide principale", "Relais terrain secondaire"],
    referents: [
      { id: "joal-awa", name: "Awa Diouf", role: "Référente mareyeuse", trust: "Élevée", availability: "Disponible", lastReport: "Il y a 3 jours", needs: "Froid, caisses, preuve livraison", programs: ["Programme froid quai Joal"], action: "Demander compte rendu" },
      { id: "joal-mamadou", name: "Mamadou Sarr", role: "Référent pêcheur", trust: "Élevée", availability: "Partielle", lastReport: "Il y a 4 jours", needs: "Froid et carburant", programs: ["Suivi débarquement artisanal"], action: "Préparer prise de contact" },
      { id: "joal-ousmane", name: "Ousmane Ndiaye", role: "Relais organisation locale", trust: "Moyenne", availability: "À confirmer", lastReport: "Il y a 6 jours", needs: "Coordination programme froid", programs: ["Appui caisses normalisées"], action: "Demander vérification terrain" }
    ],
    proofs: ["Validation relais Joal", "Signal froid confirmé", "Bordereau financement partiel"],
    recommendedAction: "Demander vérification terrain et préparer note d'arbitrage financement froid.",
    missingData: "Justificatifs complets des équipements froid"
  },
  {
    id: "kayar",
    name: "Kayar",
    commune: "Kayar",
    region: "Thiès",
    lat: 14.9189,
    lng: -17.1211,
    x: 36,
    y: 38,
    tension: "Forte",
    priorityScore: 81,
    mainRisk: "Carburant et relais communautaire fragile",
    lastUpdate: "Il y a 4 jours",
    metrics: { openIncidents: 2, budgetExecution: 74, pendingFundingFcfa: 22, criticalResources: 1, activePrograms: 2, validatedProofs: 4, availableReferents: 2 },
    programs: [
      { name: "Appui sécurité sorties en mer", owner: "Direction pêche artisanale", status: "Actif", risk: "Tension carburant" },
      { name: "Relais de suivi communautaire", owner: "Cellule terrain", status: "Fragile", risk: "Relais secondaire absent" }
    ],
    budget: { planned: 75, committed: 56, consumed: 41, pendingFunding: 22, variance: "Retard justification relais", status: "Sous-utilisé" },
    incidents: ["Tension carburant", "Absence relais secondaire"],
    resources: ["Relais communautaire principal"],
    referents: [
      { id: "kayar-cheikh", name: "Cheikh Fall", role: "Référent pêcheur", trust: "Élevée", availability: "Disponible", lastReport: "Il y a 5 jours", needs: "Carburant", programs: ["Appui sécurité sorties en mer"], action: "Demander compte rendu" },
      { id: "kayar-fatou", name: "Fatou Gueye", role: "Organisation locale", trust: "Moyenne", availability: "Disponible matin", lastReport: "Il y a 7 jours", needs: "Relais secondaire", programs: ["Relais de suivi communautaire"], action: "Affecter suivi programme" }
    ],
    proofs: ["Signal relais indisponible", "Compte rendu carburant"],
    recommendedAction: "Affecter un relais secondaire et demander un compte rendu carburant.",
    missingData: "Disponibilité hebdomadaire du relais secondaire"
  },
  {
    id: "mbour",
    name: "Mbour",
    commune: "Mbour",
    region: "Thiès",
    lat: 14.4206,
    lng: -16.9676,
    x: 47,
    y: 64,
    tension: "Moyenne",
    priorityScore: 67,
    mainRisk: "Écart de financement et preuves de distribution",
    lastUpdate: "Il y a 5 jours",
    metrics: { openIncidents: 1, budgetExecution: 52, pendingFundingFcfa: 36, criticalResources: 1, activePrograms: 4, validatedProofs: 3, availableReferents: 3 },
    programs: [
      { name: "Caisses et hygiène de transport", owner: "ONG partenaire", status: "En exécution", risk: "Preuves partielles" },
      { name: "Modernisation points de vente", owner: "Commune", status: "Actif", risk: "Coordination acteurs" },
      { name: "Appui femmes transformatrices", owner: "Programme partenaire", status: "Actif", risk: "Suivi impact" },
      { name: "Suivi mareyage local", owner: "Service local", status: "En suivi", risk: "Données incomplètes" }
    ],
    budget: { planned: 95, committed: 58, consumed: 49, pendingFunding: 36, variance: "Financement demandé mais preuve partielle", status: "Justification requise" },
    incidents: ["Retard livraison caisses normalisées"],
    resources: ["Stock caisses normalisées"],
    referents: [
      { id: "mbour-mariama", name: "Mariama Ba", role: "Référente mareyeuse", trust: "Élevée", availability: "Disponible", lastReport: "Il y a 2 jours", needs: "Caisses et hygiène", programs: ["Caisses et hygiène de transport"], action: "Demander preuve livraison" },
      { id: "mbour-ibrahima", name: "Ibrahima Kane", role: "Référent pêcheur", trust: "Moyenne", availability: "Partielle", lastReport: "Il y a 8 jours", needs: "Hygiène quai", programs: ["Suivi mareyage local"], action: "Demander compte rendu" },
      { id: "mbour-aminata", name: "Aminata Sow", role: "Relais programme", trust: "Élevée", availability: "Disponible", lastReport: "Il y a 1 jour", needs: "Validation distribution", programs: ["Appui femmes transformatrices"], action: "Relier à financement" }
    ],
    proofs: ["Photos distribution caisses", "Liste bénéficiaires partielle", "Signal relais programme"],
    recommendedAction: "Signaler l'écart budget et demander une preuve de livraison.",
    missingData: "Liste finale des bénéficiaires"
  },
  {
    id: "saint-louis",
    name: "Saint-Louis",
    commune: "Saint-Louis",
    region: "Saint-Louis",
    lat: 16.0326,
    lng: -16.4818,
    x: 23,
    y: 12,
    tension: "Forte",
    priorityScore: 84,
    mainRisk: "Doublon programme et tension territoriale",
    lastUpdate: "Hier",
    metrics: { openIncidents: 2, budgetExecution: 69, pendingFundingFcfa: 55, criticalResources: 2, activePrograms: 3, validatedProofs: 6, availableReferents: 2 },
    programs: [
      { name: "Appui sécurité pêche artisanale", owner: "Direction pêche artisanale", status: "Actif", risk: "Chevauchement partenaire" },
      { name: "Programme équipements quai", owner: "Coopération technique", status: "À vérifier", risk: "Matériel obsolète" },
      { name: "Projet partenaire suivi embarcations", owner: "Partenaire technique", status: "Actif", risk: "Doublon potentiel" }
    ],
    budget: { planned: 140, committed: 101, consumed: 96, pendingFunding: 55, variance: "Risque de chevauchement entre deux partenaires", status: "Doublon à qualifier" },
    incidents: ["Signal conflit zone de débarquement", "Équipement de contrôle indisponible"],
    resources: ["Équipement contrôle quai", "Coordination partenaire"],
    referents: [
      { id: "sl-abdoulaye", name: "Abdoulaye Dia", role: "Référent pêcheur", trust: "Élevée", availability: "Disponible", lastReport: "Hier", needs: "Coordination zone débarquement", programs: ["Appui sécurité pêche artisanale"], action: "Demander vérification terrain" },
      { id: "sl-rokhaya", name: "Rokhaya Mbaye", role: "Relais organisation professionnelle", trust: "Moyenne", availability: "À confirmer", lastReport: "Il y a 3 jours", needs: "Équipements quai", programs: ["Programme équipements quai"], action: "Préparer note coordination" }
    ],
    proofs: ["Détection système doublon", "Compte rendu zone débarquement", "Signal équipement indisponible"],
    recommendedAction: "Détecter le doublon programme et préparer une note de coordination partenaire.",
    missingData: "Périmètre exact du projet partenaire"
  },
  {
    id: "dakar",
    name: "Dakar",
    commune: "Dakar",
    region: "Dakar",
    lat: 14.7167,
    lng: -17.4677,
    x: 29,
    y: 50,
    tension: "Faible",
    priorityScore: 54,
    mainRisk: "Transmission de données à consolider",
    lastUpdate: "Aujourd'hui",
    metrics: { openIncidents: 1, budgetExecution: 83, pendingFundingFcfa: 18, criticalResources: 0, activePrograms: 3, validatedProofs: 8, availableReferents: 4 },
    programs: [
      { name: "Suivi export et qualité", owner: "Service qualité", status: "Actif", risk: "Faible" },
      { name: "Coordination mareyage urbain", owner: "Collectivité", status: "Actif", risk: "Données dispersées" },
      { name: "Données débarquement pilote", owner: "Cellule data", status: "Pilote", risk: "Transmission irrégulière" }
    ],
    budget: { planned: 110, committed: 97, consumed: 91, pendingFunding: 18, variance: "Suivi normal", status: "Stable" },
    incidents: ["Incident mineur de transmission données"],
    resources: ["Aucune ressource critique"],
    referents: [
      { id: "dakar-coumba", name: "Coumba Diop", role: "Référente mareyeuse", trust: "Élevée", availability: "Disponible", lastReport: "Aujourd'hui", needs: "Suivi qualité", programs: ["Coordination mareyage urbain"], action: "Maintenir suivi" },
      { id: "dakar-serigne", name: "Serigne Mboup", role: "Référent pêcheur", trust: "Élevée", availability: "Disponible", lastReport: "Hier", needs: "Débarquement pilote", programs: ["Données débarquement pilote"], action: "Demander compte rendu" },
      { id: "dakar-babacar", name: "Babacar Faye", role: "Relais qualité", trust: "Élevée", availability: "Disponible", lastReport: "Il y a 2 jours", needs: "Qualité export", programs: ["Suivi export et qualité"], action: "Relier à rapport" },
      { id: "dakar-ndeye", name: "Ndeye Ndiaye", role: "Partenaire données", trust: "Moyenne", availability: "À confirmer", lastReport: "Il y a 5 jours", needs: "Transmission régulière", programs: ["Données débarquement pilote"], action: "Demander synchronisation" }
    ],
    proofs: ["Rapport qualité", "Signal données pilote", "Compte rendu mareyage"],
    recommendedAction: "Maintenir Dakar comme quai pilote données et consolider la transmission.",
    missingData: "Fréquence réelle des transmissions"
  }
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
  "Pourquoi ce quai est prioritaire ?",
  "Quel financement est bloqué ?",
  "Quel référent contacter ?",
  "Quelle ressource est critique ?",
  "Quelle note préparer ?",
  "Quelle donnée manque ?"
];