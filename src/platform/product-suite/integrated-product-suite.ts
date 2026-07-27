export type ProductCode =
  | "fisher"
  | "cooperative"
  | "business"
  | "government"
  | "finance"
  | "knowledge"
  | "atlas";

export type ProductCapabilityStatus = "available" | "attention" | "blocked" | "planned";

export interface ProductCapabilityView {
  code: string;
  name: string;
  description: string;
  status: ProductCapabilityStatus;
  href: string;
  operationalValue: string;
}

export interface ProductWorkspaceView {
  code: ProductCode;
  name: string;
  actor: string;
  purpose: string;
  payer: string;
  value: string;
  capabilities: ProductCapabilityView[];
  primaryJourney: string[];
  dependencies: ProductCode[];
}

export interface ProductSuiteRuntimeSummary {
  running: boolean;
  pendingEvents: number;
  failedEvents: number;
  openSignals: number;
  atlasInsights: number;
  atlasScenarios: number;
  graphNodes: number;
}

export interface IntegratedProductSuiteSnapshot {
  generatedAt: string;
  products: ProductWorkspaceView[];
  runtime: ProductSuiteRuntimeSummary;
  completion: {
    totalProducts: number;
    availableCapabilities: number;
    attentionCapabilities: number;
    blockedCapabilities: number;
    plannedCapabilities: number;
  };
}

const products: ProductWorkspaceView[] = [
  {
    code: "fisher",
    name: "Mbàmbulaan Fisher",
    actor: "Pêcheur, patron de pirogue et équipage",
    purpose: "Préparer, déclarer et suivre les opérations de pêche et de débarquement.",
    payer: "Coopérative, programme public ou organisation de filière",
    value: "Moins d'attente, meilleure anticipation des services et traçabilité des captures.",
    dependencies: [],
    primaryJourney: ["Préparer la campagne", "Annoncer le retour", "Débarquer", "Faire peser", "Suivre les lots et le règlement"],
    capabilities: [
      { code: "campaign", name: "Campagnes", description: "Préparation et suivi de campagne.", status: "available", href: "/operations/retours", operationalValue: "Anticiper les retours et les besoins." },
      { code: "landing", name: "Débarquement", description: "Confirmation du retour et de la réception.", status: "available", href: "/operations/debarquements", operationalValue: "Fiabiliser le point d'entrée physique." },
      { code: "offline", name: "Mode hors ligne", description: "Capture et synchronisation terrain.", status: "attention", href: "/produit/fisher", operationalValue: "Continuer à travailler sans réseau stable." },
    ],
  },
  {
    code: "cooperative",
    name: "Mbàmbulaan Cooperative",
    actor: "Coopérative et organisation de producteurs",
    purpose: "Coordonner les membres, capacités, obligations, lots et règlements.",
    payer: "Coopérative, fédération ou programme d'appui",
    value: "Visibilité consolidée, meilleure allocation des services et pouvoir de négociation renforcé.",
    dependencies: ["fisher"],
    primaryJourney: ["Voir les retours", "Réserver les capacités", "Constituer les lots", "Suivre les engagements", "Rapprocher les règlements"],
    capabilities: [
      { code: "members", name: "Membres et flotte", description: "Registre des acteurs et navires.", status: "available", href: "/registre", operationalValue: "Connaître les acteurs autorisés." },
      { code: "coordination", name: "Coordination de services", description: "Besoins, capacités, réservations et tensions.", status: "available", href: "/pilotage", operationalValue: "Transformer un besoin en service exécuté." },
      { code: "settlement", name: "Règlements", description: "Suivi des montants, écarts et preuves.", status: "attention", href: "/produit/cooperative", operationalValue: "Réduire les délais et litiges de paiement." },
    ],
  },
  {
    code: "business",
    name: "Mbàmbulaan Business",
    actor: "Mareyeur, transformateur, transporteur et opérateur de froid",
    purpose: "Acheter, vendre, transporter et exécuter des services de manière fiable.",
    payer: "Entreprise utilisatrice ou donneur d'ordre",
    value: "Accès fiable aux volumes, meilleure planification et preuve d'exécution.",
    dependencies: ["cooperative"],
    primaryJourney: ["Voir les besoins", "Déclarer une capacité", "S'engager", "Exécuter", "Déposer la preuve", "Être réglé"],
    capabilities: [
      { code: "capacity", name: "Capacités", description: "Déclaration et allocation des moyens.", status: "available", href: "/services", operationalValue: "Monétiser une capacité disponible." },
      { code: "trade", name: "Transactions", description: "Réservations, accords et livraison.", status: "available", href: "/commerce", operationalValue: "Sécuriser les flux commerciaux." },
      { code: "connectors", name: "Connecteurs partenaires", description: "API, webhooks et échanges signés.", status: "attention", href: "/produit/business", operationalValue: "Éviter les doubles saisies." },
    ],
  },
  {
    code: "government",
    name: "Mbàmbulaan Government",
    actor: "Ministère, services territoriaux et autorités de contrôle",
    purpose: "Superviser la filière, cibler les politiques et suivre les résultats.",
    payer: "État, agence publique ou programme sectoriel",
    value: "Information fiable, coordination territoriale et décisions fondées sur des preuves.",
    dependencies: ["fisher", "cooperative", "business", "atlas"],
    primaryJourney: ["Observer", "Détecter les tensions", "Prioriser", "Décider", "Déclencher les actions", "Mesurer les résultats"],
    capabilities: [
      { code: "supervision", name: "Supervision nationale", description: "Signaux, opérations et territoires.", status: "available", href: "/pilotage", operationalValue: "Voir ce qui exige une décision." },
      { code: "programs", name: "Programmes publics", description: "Ciblage, exécution et mesure d'impact.", status: "available", href: "/programmes", operationalValue: "Relier financement public et résultats." },
      { code: "policy", name: "Politiques et conformité", description: "Règles, contrôles et obligations.", status: "attention", href: "/produit/government", operationalValue: "Rendre les règles opérationnelles et auditables." },
    ],
  },
  {
    code: "finance",
    name: "Mbàmbulaan Finance",
    actor: "Institution financière, fonds, mutuelle et financeur de programme",
    purpose: "Financer des opérations et investissements sur la base de preuves fiables.",
    payer: "Financeur, programme ou bénéficiaire selon l'offre",
    value: "Réduction du risque d'information et meilleur suivi de l'usage des fonds.",
    dependencies: ["cooperative", "business", "knowledge"],
    primaryJourney: ["Qualifier le besoin", "Évaluer le risque", "Structurer l'offre", "Décaisser", "Suivre l'usage", "Mesurer le remboursement et l'impact"],
    capabilities: [
      { code: "ethical-finance", name: "Finance éthique", description: "Partage du risque et financement adossé aux opérations.", status: "available", href: "/finance", operationalValue: "Financer sans dissocier le capital de l'activité réelle." },
      { code: "risk", name: "Risque et preuves", description: "Décision appuyée sur les événements et documents.", status: "attention", href: "/produit/finance", operationalValue: "Réduire l'asymétrie d'information." },
      { code: "payments", name: "Paiements réels", description: "Décaissement, encaissement et rapprochement.", status: "planned", href: "/produit/finance", operationalValue: "Exécuter les flux financiers dans Mbàmbulaan." },
    ],
  },
  {
    code: "knowledge",
    name: "Mbàmbulaan Knowledge",
    actor: "Expert, chercheur, partenaire technique et gestionnaire de référentiel",
    purpose: "Maintenir les référentiels, preuves, connaissances et standards partagés.",
    payer: "Institution, programme ou client de données et d'expertise",
    value: "Langage commun, données de qualité et décisions explicables.",
    dependencies: [],
    primaryJourney: ["Collecter", "Vérifier", "Versionner", "Publier", "Relier les preuves", "Mesurer la qualité"],
    capabilities: [
      { code: "reference-data", name: "Référentiels nationaux", description: "Espèces, territoires, sites, unités et organisations.", status: "available", href: "/registre", operationalValue: "Éviter les interprétations divergentes." },
      { code: "evidence", name: "Coffre de preuves", description: "Documents contrôlés, intègres et conservés.", status: "available", href: "/preuves", operationalValue: "Rendre chaque décision vérifiable." },
      { code: "quality", name: "Qualité des données", description: "Anomalies, doublons et corrections gouvernées.", status: "available", href: "/qualite", operationalValue: "Empêcher les données douteuses de contaminer les décisions." },
    ],
  },
  {
    code: "atlas",
    name: "Mbàmbulaan Atlas",
    actor: "Décideur public, dirigeant, financeur et partenaire stratégique",
    purpose: "Transformer les données de l'écosystème en décisions explicables et suivies.",
    payer: "Ministère, programme, entreprise ou financeur",
    value: "Scénarios comparables, décisions fondées sur des preuves et suivi des résultats.",
    dependencies: ["government", "knowledge"],
    primaryJourney: ["Poser une question", "Inspecter les preuves", "Comparer les scénarios", "Décider", "Déclencher les actions", "Observer les résultats"],
    capabilities: [
      { code: "insights", name: "Questions et insights", description: "Analyse à partir des signaux du runtime.", status: "available", href: "/atlas", operationalValue: "Comprendre les causes et priorités." },
      { code: "scenarios", name: "Scénarios", description: "Évaluation de valeur, résilience, coût et risque.", status: "available", href: "/atlas", operationalValue: "Comparer avant d'engager les ressources." },
      { code: "action-loop", name: "Boucle décision-action", description: "Transformation d'une décision en travail opérationnel.", status: "attention", href: "/atlas", operationalValue: "Fermer la boucle entre analyse et terrain." },
    ],
  },
];

export function getIntegratedProductSuite(
  runtime: ProductSuiteRuntimeSummary,
  generatedAt = new Date().toISOString(),
): IntegratedProductSuiteSnapshot {
  const capabilities = products.flatMap((product) => product.capabilities);
  return {
    generatedAt,
    products: structuredClone(products),
    runtime: structuredClone(runtime),
    completion: {
      totalProducts: products.length,
      availableCapabilities: capabilities.filter((item) => item.status === "available").length,
      attentionCapabilities: capabilities.filter((item) => item.status === "attention").length,
      blockedCapabilities: capabilities.filter((item) => item.status === "blocked").length,
      plannedCapabilities: capabilities.filter((item) => item.status === "planned").length,
    },
  };
}

export function getProductWorkspace(code: ProductCode): ProductWorkspaceView | undefined {
  const product = products.find((item) => item.code === code);
  return product ? structuredClone(product) : undefined;
}
