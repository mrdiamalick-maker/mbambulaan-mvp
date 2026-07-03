export type RoleKey = "etat" | "ong" | "collectivite" | "pecheur" | "mareyeur" | "exportateur" | "organisation" | "investisseur";
export type Tone = "blue" | "green" | "amber" | "red" | "slate";

export type Kpi = { label: string; value: string; detail: string; tone?: Tone };
export type RoleProfile = {
  key: RoleKey;
  label: string;
  audience: string;
  promise: string;
  problem: string;
  value: string;
  primaryCta: string;
  href: string;
  accent: Tone;
  kpis: Kpi[];
  modules: string[];
  decisions: string[];
  proof: string;
  limit: string;
};
export type Territory = { name: string; region: string; tension: "Faible" | "Moyenne" | "Forte" | "Critique"; signals: number; actor: string; action: string };
export type WorkspaceModule = { name: string; description: string; metric: string; status: "Actif" | "Pret" | "En cadrage" };

export const roleProfiles: RoleProfile[] = [
  {
    key: "etat",
    label: "Etat / Ministere",
    audience: "Cabinet, direction peche, cellule programme",
    promise: "Arbitrer les territoires, les tensions et les financements avec une preuve lisible.",
    problem: "Les donnees de terrain, programmes, acteurs et financements restent dispersees.",
    value: "Mbambulaan consolide les signaux et transforme la lecture filiere en decisions priorisees.",
    primaryCta: "Cadrer un pilote institutionnel",
    href: "/demo/etat",
    accent: "blue",
    kpis: [
      { label: "Territoires suivis", value: "5", detail: "Littoral pilote", tone: "blue" },
      { label: "Tensions critiques", value: "2", detail: "Joal et Kayar", tone: "red" },
      { label: "Notes pretes", value: "4", detail: "Decision ministerielle", tone: "green" }
    ],
    modules: ["Carte des tensions", "Financements", "Programmes", "Notes ministere"],
    decisions: ["Prioriser Joal", "Mobiliser le froid", "Eviter doublon programme"],
    proof: "Signaux systeme, donnees estimees et validations terrain simulees.",
    limit: "Les donnees restent mockees tant que le pilote terrain n'est pas signe."
  },
  {
    key: "ong",
    label: "ONG / Programme",
    audience: "Chef de programme, M&E officer, bailleur",
    promise: "Suivre l'impact, les preuves et les risques d'un programme filiere.",
    problem: "Les actions terrain sont difficiles a relier aux preuves et au reporting bailleur.",
    value: "Mbambulaan relie beneficiaires, actions, territoires, preuves et rapports.",
    primaryCta: "Preparer une demo programme",
    href: "/demo/ong",
    accent: "green",
    kpis: [
      { label: "Actions actives", value: "18", detail: "3 territoires", tone: "green" },
      { label: "Preuves collectees", value: "42", detail: "terrain et systeme", tone: "blue" },
      { label: "Rapport bailleur", value: "Pret", detail: "Synthese generee", tone: "amber" }
    ],
    modules: ["Portefeuille programme", "Beneficiaires", "Preuves", "Reporting"],
    decisions: ["Reorienter une action", "Verifier preuve terrain", "Reduire doublon"],
    proof: "Historique d'action, niveau de preuve et statut de validation.",
    limit: "Le reporting final dependra des donnees partenaires integrees."
  },
  {
    key: "collectivite",
    label: "Collectivite",
    audience: "Maire, service local, partenaire territorial",
    promise: "Transformer les problemes du quai en actions locales visibles.",
    problem: "Les collectivites voient les urgences mais manquent de synthese actionnable.",
    value: "Mbambulaan montre les tensions, partenaires, actions et notes de decision locales.",
    primaryCta: "Lancer territoire pilote",
    href: "/demo/collectivite",
    accent: "amber",
    kpis: [
      { label: "Quais suivis", value: "3", detail: "Petite-Cote", tone: "amber" },
      { label: "Actions locales", value: "9", detail: "dont 4 pretes", tone: "green" },
      { label: "Partenaires", value: "7", detail: "mobilisables", tone: "blue" }
    ],
    modules: ["Carte communale", "Actions", "Partenaires", "Note mairie"],
    decisions: ["Renforcer conservation", "Mobiliser relais", "Cadrer convention"],
    proof: "Preuves locales simulees et statut de chaque action.",
    limit: "La vue communale sera calibree avec les equipes locales."
  },
  {
    key: "pecheur",
    label: "Pecheur",
    audience: "Pecheur, relais quai, agent terrain",
    promise: "Un parcours assiste pour signaler, suivre et recevoir un retour clair.",
    problem: "Le pecheur ne doit pas subir un dashboard complexe pour etre visible.",
    value: "Mbambulaan facilite la remontee terrain via relais, statut simple et preuve.",
    primaryCta: "Voir parcours assiste",
    href: "/demo/pecheur",
    accent: "slate",
    kpis: [
      { label: "Signaux envoyes", value: "12", detail: "via relais", tone: "blue" },
      { label: "Demandes suivies", value: "8", detail: "statut clair", tone: "green" },
      { label: "Retours recus", value: "6", detail: "opportunites encadrees", tone: "amber" }
    ],
    modules: ["Signalement", "Suivi", "Relais quai", "Retour"],
    decisions: ["Qualifier disponibilite", "Demander accompagnement", "Suivre statut"],
    proof: "Signal declaratif, validation relais et historique de statut.",
    limit: "Le MVP ne remplace pas WhatsApp, SMS ou le relais humain."
  },
  {
    key: "mareyeur",
    label: "Mareyeur",
    audience: "Mareyeur, responsable flux, relais logistique",
    promise: "Organiser les flux, anticiper la qualite et securiser les retraits.",
    problem: "Les volumes, prix, qualites et retraits sont incertains au quotidien.",
    value: "Mbambulaan qualifie les lots, signale les risques et propose les prochaines actions.",
    primaryCta: "Voir flux qualifies",
    href: "/demo/mareyeur",
    accent: "green",
    kpis: [
      { label: "Lots qualifies", value: "14", detail: "qualite visible", tone: "green" },
      { label: "Flux a organiser", value: "5", detail: "prioritaires", tone: "amber" },
      { label: "Risque perte", value: "-28%", detail: "simulation", tone: "blue" }
    ],
    modules: ["Produits", "Qualite", "Logistique", "Financement court terme"],
    decisions: ["Organiser retrait", "Suivre qualite", "Demander froid"],
    proof: "Qualite, trace et statut de coordination simules.",
    limit: "Ce n'est pas une place de marche ouverte."
  },
  {
    key: "exportateur",
    label: "Entreprise / Exportateur",
    audience: "Acheteur, responsable supply, qualite",
    promise: "Qualifier une opportunite avant engagement commercial.",
    problem: "L'achat est risque quand qualite, trace et acteurs ne sont pas verifies.",
    value: "Mbambulaan reduit l'incertitude supply avec preuves, risques et coordination.",
    primaryCta: "Qualifier une opportunite",
    href: "/demo/exportateur",
    accent: "blue",
    kpis: [
      { label: "Opportunites qualifiees", value: "6", detail: "non publiques", tone: "blue" },
      { label: "Score trace", value: "82%", detail: "moyenne", tone: "green" },
      { label: "Risques ouverts", value: "3", detail: "a traiter", tone: "amber" }
    ],
    modules: ["Pipeline supply", "Risques", "Preuves", "Conditions"],
    decisions: ["Demander preuve", "Verifier trace", "Lancer coordination"],
    proof: "Niveau de trace, confiance acteur et preuve associee.",
    limit: "Mbambulaan qualifie, il ne remplace pas le contrat commercial."
  },
  {
    key: "organisation",
    label: "Organisation professionnelle",
    audience: "GIE, cooperative, bureau d'organisation",
    promise: "Structurer les membres, demandes collectives et dossiers partenaires.",
    problem: "Les besoins collectifs existent mais restent peu defendables sans preuve.",
    value: "Mbambulaan consolide registre, demandes, preuves et notes de plaidoyer.",
    primaryCta: "Structurer un pilote",
    href: "/demo/organisation",
    accent: "amber",
    kpis: [
      { label: "Membres recenses", value: "86", detail: "3 quais", tone: "blue" },
      { label: "Demandes collectives", value: "11", detail: "classees", tone: "amber" },
      { label: "Dossiers prets", value: "4", detail: "partenaires", tone: "green" }
    ],
    modules: ["Registre", "Demandes collectives", "Preuves", "Plaidoyer"],
    decisions: ["Prioriser demande", "Generer note", "Mobiliser partenaire"],
    proof: "Registre simule, sources et statut des demandes.",
    limit: "Les membres devront etre verifies pendant le pilote."
  },
  {
    key: "investisseur",
    label: "Investisseur",
    audience: "Investisseur, advisor, partenaire strategique",
    promise: "Lire Mbambulaan comme infrastructure verticale monetisable.",
    problem: "Le potentiel reste flou si le produit ressemble a une simple app.",
    value: "Mbambulaan montre segments payeurs, data effects, territoires et services.",
    primaryCta: "Voir these infrastructure",
    href: "/demo/investisseur",
    accent: "red",
    kpis: [
      { label: "Segments payeurs", value: "7", detail: "B2B et institutionnels", tone: "blue" },
      { label: "Services monetisables", value: "9", detail: "data, coordination, reporting", tone: "green" },
      { label: "Territoires pilotes", value: "5", detail: "scalables", tone: "amber" }
    ],
    modules: ["These", "Payeurs", "Roadmap", "Risques"],
    decisions: ["Evaluer pilote", "Lire traction", "Ouvrir data room"],
    proof: "Mock de data room, jalons et hypotheses critiques.",
    limit: "Les metrics financiers restent des hypotheses de cadrage."
  }
];

export const territories: Territory[] = [
  { name: "Joal", region: "Petite-Cote", tension: "Critique", signals: 14, actor: "Commune de Joal", action: "Renforcer conservation et retrait" },
  { name: "Mbour", region: "Thies", tension: "Forte", signals: 11, actor: "Organisation mareyeurs", action: "Orienter flux vers transformation" },
  { name: "Kayar", region: "Thies", tension: "Moyenne", signals: 8, actor: "Relais quai", action: "Qualifier volumes matinaux" },
  { name: "Saint-Louis", region: "Nord", tension: "Forte", signals: 9, actor: "Service peche", action: "Suivre tension carburant" },
  { name: "Dakar", region: "Cap-Vert", tension: "Faible", signals: 5, actor: "Acheteurs institutionnels", action: "Preparer reporting" }
];

export const workspaceModules: WorkspaceModule[] = [
  { name: "Vue territoire", description: "Lecture des quais, tensions et priorites d'action.", metric: "5 territoires", status: "Actif" },
  { name: "Registre acteurs", description: "Acteurs terrain, institutions, organisations et relais.", metric: "142 acteurs", status: "Actif" },
  { name: "Signaux qualifies", description: "Signaux terrain classes par source, statut et preuve.", metric: "47 signaux", status: "Actif" },
  { name: "Programmes", description: "Actions, partenaires et interventions en cours.", metric: "6 programmes", status: "Pret" },
  { name: "Financements", description: "Demandes de froid, equipements et fonds de roulement.", metric: "18 demandes", status: "En cadrage" },
  { name: "Produits / flux", description: "Lots, qualite, disponibilites et risques logistiques.", metric: "22 flux", status: "Actif" },
  { name: "Coordination", description: "File d'actions, responsables et prochaines etapes.", metric: "12 actions", status: "Actif" },
  { name: "Rapports", description: "Notes ministere, bailleur, mairie, entreprise et data room.", metric: "9 rapports", status: "Pret" },
  { name: "Preuves", description: "Niveaux declaratif, systeme, estime et valide.", metric: "64 preuves", status: "Actif" },
  { name: "Parametres d'acces", description: "Roles, permissions et modules actives.", metric: "8 roles", status: "Pret" }
];

export const signals = [
  { source: "Relais Joal", title: "Besoin froid sur lots sensibles", territory: "Joal", proof: "Valide", status: "A traiter" },
  { source: "Service peche", title: "Surplus sardinelle matin", territory: "Mbour", proof: "Systeme", status: "Qualifie" },
  { source: "GIE femmes", title: "Demande caisses isothermes", territory: "Kayar", proof: "Declaratif", status: "En cadrage" },
  { source: "Programme partenaire", title: "Risque doublon appui froid", territory: "Saint-Louis", proof: "Estime", status: "Decision" }
];

export const actions = [
  { action: "Prioriser Joal", owner: "Ministere", territory: "Joal", status: "Pret", next: "Valider convention pilote" },
  { action: "Qualifier financement froid", owner: "Programme", territory: "Mbour", status: "En cours", next: "Comparer demandes" },
  { action: "Organiser flux mareyeur", owner: "Terrain", territory: "Kayar", status: "A lancer", next: "Confirmer relais" },
  { action: "Generer note partenaire", owner: "Mbambulaan", territory: "Petite-Cote", status: "Pret", next: "Partager synthese" }
];

export const reports = [
  { title: "Note ministere", status: "Pret", proof: "Systeme + validation simulee", audience: "Etat" },
  { title: "Reporting bailleur", status: "En cours", proof: "Donnees estimees", audience: "ONG" },
  { title: "Dossier financement froid", status: "Pret", proof: "Signaux qualifies", audience: "Programme" },
  { title: "Synthese entreprise", status: "Pret", proof: "Trace et qualite", audience: "Exportateur" },
  { title: "Note collectivite", status: "Pret", proof: "Territoire pilote", audience: "Collectivite" }
];

export const globalKpis: Kpi[] = [
  { label: "Signaux actifs", value: "47", detail: "sources terrain et systeme", tone: "blue" },
  { label: "Actions ouvertes", value: "12", detail: "coordination en cours", tone: "amber" },
  { label: "Acteurs coordonnes", value: "142", detail: "institutions et terrain", tone: "green" },
  { label: "Rapports prets", value: "9", detail: "decision et pilotage", tone: "slate" }
];

export function getRoleProfile(role: RoleKey) {
  return roleProfiles.find((profile) => profile.key === role) ?? roleProfiles[0];
}
