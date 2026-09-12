// Données de démonstration — portefeuille de programmes. Copiées depuis le
// standalone V3.

export interface ProgMilestone { t: string; d: string; st: "done" | "now" | "late" | "todo" }
export interface ProgIndicator { n: string; base: number; cur: number; tgt: number; u: string; inv?: boolean }
export interface ProgRealitySignal { t: string; k: string; c: string; sit: number }
export interface ProgIntel { t: string; k: string; c: string }
export interface ProgPartner { o: string; r: string; c: string; e: string; ec: string; ev: string; act: string; due: string }
export interface ProgCapacity { r: string; need: number; have: number }
export interface ProgRisk { t: string; l: string; c: string }

export interface Programme {
  id: number;
  title: string;
  short: string;
  phase: "Cadrage" | "Exécution" | "Financée" | "Expression du besoin";
  lead: string;
  terrs: string[];
  progress: number;
  budId: number;
  budConf: number;
  budSpent: number;
  health: "Critique" | "Attention" | "En bonne voie" | "À instruire";
  healthC: string;
  schedDelta: number;
  why: string;
  next: string;
  milestones: ProgMilestone[];
  inds: ProgIndicator[];
  reality: ProgRealitySignal[];
  intel: ProgIntel[];
  partners: ProgPartner[];
  cap: ProgCapacity[];
  capNote: string;
  risks: ProgRisk[];
}

export const PROGS: Programme[] = [
  {
    id: 0, title: "Résilience de la chaîne du froid · Petite-Côte", short: "Chaîne du froid · Petite-Côte",
    phase: "Cadrage", lead: "Cheikh Bâ", terrs: ["Joal-Fadiouth", "Mbour", "Kayar"], progress: 56,
    budId: 80, budConf: 0, budSpent: 0, health: "Critique", healthC: "#C8452B", schedDelta: -42,
    why: "Sécuriser la conservation et valoriser les débarquements de la Petite-Côte, où trois capacités froides concentrent l’essentiel des situations ouvertes.",
    next: "Instruction du financement · attendue depuis 6 semaines",
    milestones: [{ t: "Diagnostic territorial", d: "14 juin", st: "done" }, { t: "Cadrage technique", d: "02 août", st: "done" }, { t: "Instruction du financement", d: "29 juil.", st: "late" }, { t: "Démarrage travaux", d: "15 nov.", st: "todo" }],
    inds: [{ n: "Lots orientés vers une capacité froide disponible", base: 34, cur: 58, tgt: 85, u: "%" }, { n: "Temps moyen de remise en service", base: 72, cur: 41, tgt: 24, u: " h", inv: true }],
    reality: [
      { t: "Machine à glace indisponible au quai de Joal", k: "Signal critique · 2 jours · non qualifié", c: "#C8452B", sit: 0 },
      { t: "Capacité froide de Mbour réduite à une marge unique", k: "Signal élevé · 5 jours · observé", c: "#D89A4A", sit: 2 },
      { t: "Aucun relais mandaté à Kayar pour confirmer les signaux", k: "Angle mort · structurel", c: "#B6522F", sit: 4 }
    ],
    intel: [
      { t: "Instruction du financement sans réponse depuis 6 semaines", k: "Dépendance · Direction du budget", c: "#C8452B" },
      { t: "Le site de Joal devient prioritaire avant démarrage des travaux", k: "Réordonnancement à décider", c: "#D89A4A" }
    ],
    partners: [
      { o: "Direction du budget", r: "Financeur", c: "S. Diallo", e: "Sans réponse", ec: "#C8452B", ev: "Dossier transmis le 29 juillet", act: "Relance formelle attendue", due: "échue" },
      { o: "Conseil départemental de Mbour", r: "Maître d’ouvrage local", c: "A. Sarr", e: "Engagé", ec: "#4E7B5A", ev: "Terrain mis à disposition le 12 août", act: "Aucune action en attente", due: "—" },
      { o: "Coopérative froid Petite-Côte", r: "Exploitant", c: "M. Ndoye", e: "Actif", ec: "#4E7B5A", ev: "Signale la panne de Joal le 7 septembre", act: "Fournir un état des capacités", due: "12 sept." }
    ],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Ingénieur froid", need: 2, have: 0 }, { r: "Coordination territoriale", need: 3, have: 2 }, { r: "Relais de quai mandatés", need: 3, have: 0 }],
    capNote: "Aucun ingénieur froid n’est affecté : le cadrage technique a été produit par un prestataire externe non reconduit.",
    risks: [{ t: "Financement non confirmé à 6 semaines du démarrage prévu", l: "Élevé", c: "#C8452B" }, { t: "Aucune compétence froid interne mobilisable", l: "Élevé", c: "#C8452B" }, { t: "Site de Joal dégradé avant le début des travaux", l: "Moyen", c: "#D89A4A" }]
  },
  {
    id: 1, title: "Référentiel progressif des pirogues et immatriculations", short: "Référentiel pirogues",
    phase: "Exécution", lead: "Fatou Ndiaye", terrs: ["Hann", "Soumbédioune", "Rufisque-Bargny", "Mbour"], progress: 43,
    budId: 25, budConf: 25, budSpent: 14, health: "Attention", healthC: "#D89A4A", schedDelta: -18,
    why: "Fiabiliser le rattachement des actifs sans bloquer la déclaration initiale des acteurs.",
    next: "Revue territoriale · 30 sept.",
    milestones: [{ t: "Cadrage", d: "12 mai", st: "done" }, { t: "Déploiement 4 sites", d: "30 juil.", st: "done" }, { t: "Revue territoriale", d: "30 sept.", st: "now" }, { t: "Extension littoral", d: "15 janv.", st: "todo" }],
    inds: [{ n: "Pirogues avec immatriculation vérifiée", base: 18, cur: 43, tgt: 75, u: "%" }, { n: "Dossiers incomplets requalifiés", base: 0, cur: 36, tgt: 120, u: " dossiers" }],
    reality: [
      { t: "Retard du prestataire de saisie sur Mbour", k: "Signal modéré · 8 jours · observé", c: "#D89A4A", sit: 3 },
      { t: "Lectures de balance incohérentes à Hann", k: "Signal modéré · 6 jours · observé", c: "#9FB9CE", sit: 5 },
      { t: "Indicateur « dossiers requalifiés » stagnant depuis 3 semaines", k: "Écart réel / déclaré", c: "#B6522F", sit: 3 },
      { t: "Aucun signal reçu de Rufisque-Bargny depuis 4 semaines", k: "Angle mort · à vérifier", c: "#B6522F", sit: 3 }
    ],
    intel: [
      { t: "Jalons administratifs tenus alors qu’un indicateur stagne", k: "Statut « en bonne voie » à requalifier", c: "#B6522F" },
      { t: "Prestataire de saisie sans réponse depuis 2 relances", k: "Dépendance · contrat en cours", c: "#D89A4A" }
    ],
    partners: [
      { o: "Prestataire de saisie · Teranga Data", r: "Exécution", c: "O. Ba", e: "Défaillant", ec: "#C8452B", ev: "3 semaines de retard sur Mbour", act: "Mise en demeure à instruire", due: "15 sept." },
      { o: "Organisations de pirogues · Hann", r: "Bénéficiaire", c: "I. Diop", e: "Engagé", ec: "#4E7B5A", ev: "128 dossiers déposés en août", act: "Aucune action en attente", due: "—" },
      { o: "Direction des pêches maritimes", r: "Autorité de référence", c: "K. Fall", e: "Actif", ec: "#4E7B5A", ev: "Validation du référentiel le 22 août", act: "Revue territoriale à préparer", due: "30 sept." }
    ],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Agents de saisie", need: 8, have: 5 }, { r: "Coordination territoriale", need: 4, have: 4 }, { r: "Relais de quai mandatés", need: 4, have: 4 }],
    capNote: "Trois postes d’agents de saisie non pourvus, tous sur Mbour — le site où l’indicateur stagne.",
    risks: [{ t: "Défaillance du prestataire de saisie sur un site", l: "Élevé", c: "#C8452B" }, { t: "Revue territoriale préparée sur données incomplètes", l: "Moyen", c: "#D89A4A" }]
  },
  {
    id: 2, title: "Qualité, immatriculations et flux · Cap-Vert", short: "Qualité et flux · Cap-Vert",
    phase: "Exécution", lead: "Fatou Ndiaye", terrs: ["Yoff", "Ouakam", "Soumbédioune", "Rufisque-Bargny"], progress: 68,
    budId: 186, budConf: 186, budSpent: 121, health: "En bonne voie", healthC: "#4E7B5A", schedDelta: 3,
    why: "Rapprocher actifs, quais, pesées et débouchés dans un référentiel partagé.",
    next: "Consolidation · 15 oct.",
    milestones: [{ t: "Cadrage", d: "04 févr.", st: "done" }, { t: "Relais de quai mandatés", d: "18 avr.", st: "done" }, { t: "Référentiel partagé", d: "30 juin", st: "done" }, { t: "Consolidation", d: "15 oct.", st: "now" }],
    inds: [{ n: "Situations closes avec confirmation", base: 21, cur: 43, tgt: 80, u: "%" }, { n: "Délai médian de qualification", base: 74, cur: 44, tgt: 20, u: " min", inv: true }],
    reality: [{ t: "Lectures de balance incohérentes à Hann", k: "Signal modéré · traité par recalibrage", c: "#9FB9CE", sit: 5 }],
    intel: [{ t: "Aucun écart détecté entre exécution et signaux reçus", k: "Trajectoire cohérente", c: "#4E7B5A" }],
    partners: [
      { o: "Ville de Dakar", r: "Maître d’ouvrage local", c: "F. Gueye", e: "Engagé", ec: "#4E7B5A", ev: "4 postes de quai équipés", act: "Aucune action en attente", due: "—" },
      { o: "Relais de quai · 4 sites", r: "Exécution terrain", c: "collectif", e: "Actif", ec: "#4E7B5A", ev: "Délai de qualification ramené à 44 min", act: "Consolidation à documenter", due: "15 oct." }
    ],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Relais de quai mandatés", need: 4, have: 4 }, { r: "Coordination territoriale", need: 2, have: 2 }],
    capNote: "Seul programme du portefeuille dont toutes les capacités requises sont pourvues.",
    risks: [{ t: "Dépendance à la reconduction des mandats de relais", l: "Moyen", c: "#D89A4A" }]
  },
  {
    id: 3, title: "Transformation et accès au marché · Casamance", short: "Transformation · Casamance",
    phase: "Exécution", lead: "Mamadou Fall", terrs: ["Kafountine", "Elinkine", "Cap Skirring"], progress: 64,
    budId: 159, budConf: 0, budSpent: 0, health: "Attention", healthC: "#D89A4A", schedDelta: -9,
    why: "Renforcer la transformation locale et documenter les flux vers les débouchés régionaux.",
    next: "Volet froid à instruire",
    milestones: [{ t: "Cadrage", d: "20 mars", st: "done" }, { t: "2 relais opérationnels", d: "10 juin", st: "done" }, { t: "Volet froid", d: "30 sept.", st: "now" }, { t: "Marchés régionaux", d: "28 févr.", st: "todo" }],
    inds: [{ n: "Situations closes avec confirmation", base: 30, cur: 64, tgt: 80, u: "%" }, { n: "Sites avec relais opérationnel", base: 1, cur: 2, tgt: 3, u: " sites" }],
    reality: [
      { t: "Chambre froide de Cap Skirring fragile depuis 6 semaines", k: "Signal modéré · jamais recoupé", c: "#B6522F", sit: 7 },
      { t: "Aucun signal reçu d’Elinkine sur la période", k: "Angle mort · 0 signal", c: "#B6522F", sit: 7 }
    ],
    intel: [{ t: "Programme en exécution sans financement confirmé", k: "159 M identifiés, 0 confirmé", c: "#C8452B" }],
    partners: [
      { o: "Groupements de transformatrices", r: "Bénéficiaire", c: "A. Badji", e: "Engagé", ec: "#4E7B5A", ev: "3 groupements équipés en juin", act: "Aucune action en attente", due: "—" },
      { o: "Partenaire régional CEDEAO", r: "Cofinanceur envisagé", c: "non désigné", e: "À qualifier", ec: "#D89A4A", ev: "Aucun échange formalisé", act: "Prise de contact à instruire", due: "30 sept." }
    ],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Coordination territoriale", need: 3, have: 1 }, { r: "Relais de quai mandatés", need: 3, have: 2 }],
    capNote: "Une seule coordination pour trois sites séparés par 90 km de littoral et un bras de fleuve.",
    risks: [{ t: "Exécution engagée sans financement confirmé", l: "Élevé", c: "#C8452B" }, { t: "Elinkine ne remonte aucun signal", l: "Moyen", c: "#D89A4A" }]
  },
  {
    id: 4, title: "Dispositif territorial de suivi des retours et alertes", short: "Suivi des retours et alertes",
    phase: "Cadrage", lead: "Mamadou Fall", terrs: ["Saint-Louis", "Kayar"], progress: 46,
    budId: 55, budConf: 15, budSpent: 9, health: "Attention", healthC: "#D89A4A", schedDelta: -12,
    why: "Réduire les délais de qualification et fiabiliser la chaîne d’alerte entre capitaines, quais et responsables.",
    next: "Mandat des relais de quai · 20 sept.",
    milestones: [{ t: "Cadrage", d: "08 avr.", st: "done" }, { t: "Protocole d’annonce", d: "20 sept.", st: "now" }, { t: "Relais mandatés", d: "30 oct.", st: "todo" }, { t: "Extension littoral", d: "31 mars", st: "todo" }],
    inds: [{ n: "Alertes qualifiées en moins de 15 minutes", base: 22, cur: 46, tgt: 80, u: "%" }, { n: "Quais avec relais mandaté", base: 1, cur: 3, tgt: 8, u: " quais" }],
    reality: [
      { t: "Retour de pirogue retardé non confirmable à Kayar", k: "Signal élevé · aucune source secondaire", c: "#D89A4A", sit: 4 },
      { t: "Écart d’heures de retour récurrent à Joal", k: "Signal élevé · vérifié 6 fois", c: "#D89A4A", sit: 1 }
    ],
    intel: [{ t: "Le protocole d’annonce conditionne deux situations ouvertes", k: "Jalon du 20 septembre critique", c: "#D89A4A" }],
    partners: [
      { o: "Organisations de capitaines", r: "Partie prenante", c: "B. Sow", e: "À convaincre", ec: "#D89A4A", ev: "Réticence sur l’annonce obligatoire", act: "Atelier de protocole", due: "20 sept." },
      { o: "Poste de quai · Saint-Louis", r: "Exécution terrain", c: "D. Kane", e: "Engagé", ec: "#4E7B5A", ev: "Relevés fournis depuis juillet", act: "Aucune action en attente", due: "—" }
    ],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Coordination territoriale", need: 2, have: 1 }, { r: "Relais de quai mandatés", need: 8, have: 3 }],
    capNote: "Cinq mandats de relais restent à pourvoir, dont celui de Kayar où une situation est déjà bloquée.",
    risks: [{ t: "Protocole d’annonce non accepté par les capitaines", l: "Moyen", c: "#D89A4A" }]
  },
  {
    id: 5, title: "Valorisation et froid · Petite-Côte", short: "Valorisation et froid",
    phase: "Financée", lead: "Mamadou Fall", terrs: ["Popenguine", "Mbour", "Joal-Fadiouth"], progress: 50,
    budId: 135, budConf: 135, budSpent: 12, health: "En bonne voie", healthC: "#4E7B5A", schedDelta: 0,
    why: "Réduire les pertes et sécuriser l’orientation des volumes débarqués.",
    next: "Démarrage des travaux · 10 oct.",
    milestones: [{ t: "Cadrage", d: "15 janv.", st: "done" }, { t: "Financement confirmé", d: "30 juin", st: "done" }, { t: "Travaux", d: "10 oct.", st: "now" }, { t: "Exploitation", d: "30 avr.", st: "todo" }],
    inds: [{ n: "Situations closes avec confirmation", base: 24, cur: 50, tgt: 80, u: "%" }, { n: "Délai médian de qualification", base: 74, cur: 41, tgt: 20, u: " min", inv: true }],
    reality: [{ t: "Capacité froide de Mbour sous tension", k: "Signal élevé · 5 jours", c: "#D89A4A", sit: 2 }],
    intel: [{ t: "Le chantier porte sur le site actuellement sous tension", k: "Séquencement à confirmer", c: "#D89A4A" }],
    partners: [
      { o: "Direction du budget", r: "Financeur", c: "S. Diallo", e: "Engagé", ec: "#4E7B5A", ev: "135 M confirmés le 30 juin", act: "Aucune action en attente", due: "—" },
      { o: "Entreprise de travaux", r: "Exécution", c: "non attribué", e: "À désigner", ec: "#D89A4A", ev: "Appel d’offres en cours", act: "Attribution du marché", due: "25 sept." }
    ],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Ingénieur froid", need: 2, have: 1 }, { r: "Coordination territoriale", need: 3, have: 3 }],
    capNote: "Un ingénieur froid sur deux affecté ; le second poste est ouvert depuis mai.",
    risks: [{ t: "Attribution du marché de travaux non finalisée", l: "Moyen", c: "#D89A4A" }]
  },
  {
    id: 6, title: "Logistique estuarienne · Sine-Saloum", short: "Logistique estuarienne",
    phase: "Cadrage", lead: "Mamadou Fall", terrs: ["Foundiougne", "Djiffer", "Missirah"], progress: 57,
    budId: 105, budConf: 73.5, budSpent: 31, health: "En bonne voie", healthC: "#4E7B5A", schedDelta: -3,
    why: "Organiser la pesée, le regroupement et le transport entre sites dispersés du delta.",
    next: "Étude de regroupement · 12 oct.",
    milestones: [{ t: "Diagnostic", d: "20 févr.", st: "done" }, { t: "Cadrage", d: "30 mai", st: "done" }, { t: "Étude logistique", d: "12 oct.", st: "now" }, { t: "Mise en œuvre", d: "15 févr.", st: "todo" }],
    inds: [{ n: "Situations closes avec confirmation", base: 27, cur: 57, tgt: 80, u: "%" }, { n: "Sites avec relais opérationnel", base: 1, cur: 2, tgt: 3, u: " sites" }],
    reality: [{ t: "Missirah sans capacité froide recensée", k: "Structurel · à intégrer au cadrage", c: "#9FB9CE", sit: 6 }],
    intel: [{ t: "Balance de Djiffer recalibrée : précédent réutilisable", k: "Apprentissage transférable à Hann", c: "#4E7B5A" }],
    partners: [{ o: "Conseil départemental de Foundiougne", r: "Maître d’ouvrage local", c: "M. Cissé", e: "Engagé", ec: "#4E7B5A", ev: "Étude cofinancée à 30 %", act: "Aucune action en attente", due: "—" }],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Expert logistique", need: 1, have: 1 }, { r: "Coordination territoriale", need: 3, have: 2 }],
    capNote: "Capacités globalement pourvues ; la dispersion des sites reste le facteur limitant.",
    risks: [{ t: "Accessibilité des sites en saison des pluies", l: "Moyen", c: "#D89A4A" }]
  },
  {
    id: 7, title: "Sécurité et continuité des opérations · Grande-Côte", short: "Sécurité · Grande-Côte",
    phase: "Cadrage", lead: "Mamadou Fall", terrs: ["Saint-Louis", "Lompoul-sur-Mer", "Fass Boye", "Kayar"], progress: 36,
    budId: 144, budConf: 43.2, budSpent: 12, health: "Attention", healthC: "#D89A4A", schedDelta: -21,
    why: "Fiabiliser les retours, les relais et les capacités critiques du nord littoral.",
    next: "Cadrage avec les organisations · 05 oct.",
    milestones: [{ t: "Diagnostic", d: "10 mai", st: "done" }, { t: "Cadrage", d: "05 oct.", st: "now" }, { t: "Relais", d: "30 nov.", st: "todo" }, { t: "Suivi", d: "31 mars", st: "todo" }],
    inds: [{ n: "Situations closes avec confirmation", base: 18, cur: 36, tgt: 80, u: "%" }, { n: "Délai médian de qualification", base: 74, cur: 47, tgt: 20, u: " min", inv: true }],
    reality: [
      { t: "Absence de capacité froide à Fass Boye", k: "Signal élevé · vérifié", c: "#D89A4A", sit: 6 },
      { t: "Aucun relais mandaté sur les 4 sites du programme", k: "Angle mort · structurel", c: "#B6522F", sit: 4 }
    ],
    intel: [{ t: "Cadrage décalé de 3 semaines faute de disponibilité des organisations", k: "Jalon glissant", c: "#D89A4A" }],
    partners: [{ o: "Organisations de pêcheurs · Grande-Côte", r: "Partie prenante", c: "H. Ndiaye", e: "À convaincre", ec: "#D89A4A", ev: "Deux réunions reportées", act: "Atelier de cadrage", due: "05 oct." }],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }, { r: "Coordination territoriale", need: 4, have: 1 }, { r: "Relais de quai mandatés", need: 4, have: 0 }],
    capNote: "Une coordination pour quatre sites sur 180 km de littoral, aucun relais mandaté.",
    risks: [{ t: "Couverture terrain insuffisante pour cadrer", l: "Élevé", c: "#C8452B" }]
  },
  {
    id: 8, title: "Équipement de géolocalisation pour pirogues volontaires", short: "Géolocalisation pirogues",
    phase: "Expression du besoin", lead: "Cheikh Bâ", terrs: ["Lompoul-sur-Mer"], progress: 12,
    budId: 0, budConf: 0, budSpent: 0, health: "À instruire", healthC: "rgba(11,26,42,.45)", schedDelta: 0,
    why: "Documenter et instruire un dispositif pour les pirogues volontaires, avant tout choix technique ou fournisseur.",
    next: "Définition des indicateurs",
    milestones: [{ t: "Expression du besoin", d: "28 août", st: "done" }, { t: "Cadrage", d: "non planifié", st: "todo" }, { t: "Indicateurs", d: "non planifié", st: "todo" }, { t: "Instruction", d: "non planifié", st: "todo" }],
    inds: [],
    reality: [],
    intel: [{ t: "Aucun indicateur défini : l’avancement affiché n’est pas mesurable", k: "À instruire avant tout engagement", c: "#B6522F" }],
    partners: [{ o: "Organisation de pirogues · Lompoul", r: "Demandeur", c: "S. Mbaye", e: "Demandeur", ec: "#4E7B5A", ev: "Besoin exprimé le 28 août", act: "Cadrage à programmer", due: "non fixée" }],
    cap: [{ r: "Direction de programme", need: 1, have: 1 }],
    capNote: "Aucune capacité mobilisée à ce stade : le besoin n’est pas encore cadré.",
    risks: [{ t: "Choix technique engagé avant cadrage", l: "Moyen", c: "#D89A4A" }]
  }
];

export interface IndicatorDef {
  n: string;
  kind: "Résultat" | "Changement" | "Impact";
  u: string;
  tgt: number;
  inv?: boolean;
  nat: Array<number | null>;
  def: string;
  interp: string;
  caveats: string[];
}

export const IND: IndicatorDef[] = [
  {
    n: "Situations closes avec preuve vérifiable", kind: "Résultat", u: "%", tgt: 80,
    nat: [21, 24, 27, 29, 31, 33, 35, 37, 39, 40, 41, 43],
    def: "Part des situations closes accompagnées d’une trace vérifiable, sur l’ensemble des situations closes.",
    interp: "C’est l’indicateur le plus révélateur du portefeuille : il ne mesure pas l’activité mais la capacité à prouver ce qui a été fait. Il progresse de 22 points en un an, presque entièrement porté par les quatre sites où un relais de quai est mandaté. Là où il n’y a pas de relais, le chiffre stagne autour de 20 %.",
    caveats: ["La progression nationale masque une bipolarisation : quatre sites tirent la moyenne, quatorze n’ont pas bougé.", "Un taux élevé peut aussi signaler qu’on ne clôt que les situations faciles à prouver."]
  },
  {
    n: "Délai médian de qualification d’un signal", kind: "Résultat", u: " min", tgt: 20, inv: true,
    nat: [74, 72, 70, 66, 63, 60, 58, 56, 53, 49, 46, 44],
    def: "Temps médian entre la réception d’un signal et sa qualification par un agent.",
    interp: "Le délai a été divisé par 1,7 en douze semaines. La corrélation avec le mandat de relais de quai est directe : chaque nouveau relais mandaté fait baisser la médiane nationale de 6 à 9 minutes. L’objectif de 20 minutes n’est atteignable qu’avec une couverture d’au moins huit quais.",
    caveats: ["La médiane masque une longue traîne : 12 % des signaux attendent plus de 6 heures.", "Un délai court sur un signal non recoupé n’est pas une qualification fiable."]
  },
  {
    n: "Pirogues avec immatriculation vérifiée", kind: "Changement", u: "%", tgt: 75,
    nat: [18, 20, 23, 26, 28, 31, 33, 35, 38, 40, 42, 43],
    def: "Part des pirogues actives dont l’immatriculation a été vérifiée sur site.",
    interp: "Le référentiel progresse régulièrement mais le rythme s’est nettement ralenti depuis trois semaines : +1 point sur les trois dernières périodes contre +2,5 auparavant. Le ralentissement est concentré sur Mbour, où le prestataire de saisie accuse trois semaines de retard.",
    caveats: ["Le dénominateur — le nombre de pirogues actives — reste une estimation.", "La vérification porte sur le document, pas sur l’état réel de l’embarcation."]
  },
  {
    n: "Lots orientés vers une capacité froide disponible", kind: "Changement", u: "%", tgt: 85,
    nat: [34, 36, 39, 42, 44, 47, 50, 52, 54, 56, 57, 58],
    def: "Part des lots débarqués effectivement orientés vers une capacité de conservation disponible.",
    interp: "C’est le seul indicateur de changement de comportement du portefeuille : il mesure une pratique, pas une déclaration. Sa progression est réelle mais elle plafonne sur la Petite-Côte, où la capacité physique devient le facteur limitant plutôt que l’orientation.",
    caveats: ["L’indicateur ne dit rien de la qualité de la conservation une fois le lot orienté.", "Il n’est relevé que sur les sites disposant d’un poste de quai."]
  },
  {
    n: "Perte estimée à la première mise au froid", kind: "Impact", u: "%", tgt: 8, inv: true,
    nat: [null, null, null, 21, null, null, 19, null, null, 17, null, null],
    def: "Part estimée des volumes dégradés avant la première mise au froid.",
    interp: "Trois relevés seulement en douze mois, sur trois sites. La tendance est encourageante mais Mbàmbulaan ne peut pas encore parler d’impact : l’échantillon est trop faible et la méthode d’estimation varie d’un site à l’autre. Cet indicateur est affiché précisément pour rendre visible cette limite.",
    caveats: ["Trois relevés, trois sites — aucune valeur nationale ne peut en être déduite.", "La méthode d’estimation n’est pas harmonisée entre les sites."]
  },
  {
    n: "Revenu déclaré par sortie en mer", kind: "Impact", u: " kF", tgt: 0,
    nat: [null, null, null, null, null, null, null, null, null, null, null, null],
    def: "Revenu moyen déclaré par les capitaines et organisations, par sortie documentée.",
    interp: "Aucune donnée. Cet indicateur figure au cadre de résultats du portefeuille mais n’a jamais été collecté : aucun dispositif de recueil n’existe et aucun système externe n’est connecté. Il est affiché vide plutôt que retiré, parce que son absence est elle-même une information de gouvernance.",
    caveats: ["Aucun dispositif de recueil n’est en place à ce jour.", "Une estimation par extrapolation serait une invention, pas une mesure."]
  }
];

export const KINDC: Record<IndicatorDef["kind"], string> = { Résultat: "#0B1A2A", Changement: "#B6522F", Impact: "#4E7B5A" };

export const TERR_PERF: Record<string, number> = {
  Hann: 1.42, Yoff: 1.31, Soumbédioune: 1.28, "Rufisque-Bargny": 1.14, Ouakam: 1.09,
  Mbour: 0.96, Djiffer: 0.93, "Saint-Louis": 0.88, Kafountine: 0.84, "Joal-Fadiouth": 0.79,
  Foundiougne: 0.72, Kayar: 0.68, "Fass Boye": 0.61, "Cap Skirring": 0.57, Popenguine: 0.54,
  Missirah: 0.48, "Lompoul-sur-Mer": 0.44, Elinkine: 0.38
};

export const MS_ST: Record<ProgMilestone["st"], [string, string, string, string, string]> = {
  done: ["Fait", "✓", "#4E7B5A", "#4E7B5A", "#F7F3E9"],
  now: ["En cours", "●", "#B6522F", "#B6522F", "#F7F3E9"],
  late: ["En retard", "!", "#C8452B", "#C8452B", "#F7F3E9"],
  todo: ["À venir", "", "rgba(11,26,42,.35)", "transparent", "rgba(11,26,42,.4)"]
};

export const DECISIONS_BY_PROG: Record<number, Array<{ t: string; m: string; r: string }>> = {
  0: [
    { t: "Retenir le scénario de réhabilitation plutôt que la construction neuve", m: "12 août · Comité de programme", r: "Réduit le coût de 40 % et le délai de 7 mois." },
    { t: "Prioriser Joal sur Kayar pour le premier lot", m: "02 sept. · Direction de programme", r: "Décision prise avant la panne du 7 septembre." }
  ],
  1: [{ t: "Accepter les dossiers incomplets à la déclaration initiale", m: "12 mai · Comité de programme", r: "A permis 128 dépôts à Hann en août ; la requalification devient le point de charge." }],
  2: [{ t: "Mandater les relais de quai avant le déploiement du référentiel", m: "18 avr. · Direction de programme", r: "Délai de qualification divisé par 1,7 en cinq mois." }],
  3: [{ t: "Engager l’exécution sans attendre la confirmation du financement", m: "20 mars · Comité de programme", r: "Décision assumée ; le risque budgétaire reste ouvert à ce jour." }],
  4: [{ t: "Traiter le protocole d’annonce avant l’extension du dispositif", m: "08 avr. · Direction de programme", r: "Deux situations ouvertes dépendent de ce jalon." }],
  5: [{ t: "Attribuer le marché de travaux par appel d’offres ouvert", m: "30 juin · Comité de programme", r: "Attribution attendue le 25 septembre." }],
  6: [{ t: "Cofinancer l’étude logistique avec le conseil départemental", m: "30 mai · Comité de programme", r: "30 % du coût pris en charge localement." }],
  7: [{ t: "Reporter le cadrage faute de disponibilité des organisations", m: "14 août · Direction de programme", r: "Deux réunions reportées ; le jalon glisse de trois semaines." }],
  8: [{ t: "Ne retenir aucun choix technique avant cadrage", m: "28 août · Direction de programme", r: "Évite un engagement fournisseur sur un besoin non instruit." }]
};

export const ASKS_BY_PROG: Record<number, Array<{ d: string; c: string; t: string; who: string }>> = {
  0: [
    { d: "échue", c: "#C8452B", t: "Instruire le financement du volet froid (80 M FCFA identifiés)", who: "Direction du budget · relancée le 22 août" },
    { d: "12 sept.", c: "#D89A4A", t: "Fournir un état des capacités froides de la Petite-Côte", who: "Coopérative froid Petite-Côte" },
    { d: "20 sept.", c: "rgba(11,26,42,.6)", t: "Affecter un ingénieur froid au programme", who: "Secrétariat général" }
  ],
  1: [
    { d: "15 sept.", c: "#D89A4A", t: "Instruire la mise en demeure du prestataire de saisie", who: "Direction de programme" },
    { d: "30 sept.", c: "rgba(11,26,42,.6)", t: "Préparer la revue territoriale sur données consolidées", who: "Direction des pêches maritimes" }
  ],
  2: [{ d: "15 oct.", c: "rgba(11,26,42,.6)", t: "Documenter la consolidation pour réplication ailleurs", who: "Direction de programme" }],
  3: [
    { d: "30 sept.", c: "#D89A4A", t: "Formaliser une prise de contact avec le cofinanceur envisagé", who: "Direction de programme" },
    { d: "non fixée", c: "#C8452B", t: "Organiser la vérification de la capacité de Cap Skirring", who: "Coordination Casamance" }
  ],
  4: [
    { d: "20 sept.", c: "#D89A4A", t: "Tenir l’atelier de protocole avec les organisations de capitaines", who: "Direction de programme" },
    { d: "30 oct.", c: "rgba(11,26,42,.6)", t: "Mandater un relais de quai à Kayar", who: "Coordination Grande-Côte" }
  ],
  5: [{ d: "25 sept.", c: "#D89A4A", t: "Attribuer le marché de travaux", who: "Commission des marchés" }],
  6: [{ d: "12 oct.", c: "rgba(11,26,42,.6)", t: "Livrer l’étude de regroupement logistique", who: "Expert logistique" }],
  7: [
    { d: "05 oct.", c: "#D89A4A", t: "Tenir l’atelier de cadrage avec les organisations", who: "Direction de programme" },
    { d: "non fixée", c: "#C8452B", t: "Affecter trois coordinations territoriales manquantes", who: "Secrétariat général" }
  ],
  8: [{ d: "non fixée", c: "rgba(11,26,42,.6)", t: "Définir les indicateurs avant tout engagement", who: "Direction de programme" }]
};
