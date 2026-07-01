import type { RoleKey, Tone } from "./mockMbambulaan";

export type PrivateRecord = {
  id: string;
  title: string;
  territory: string;
  owner: string;
  status: string;
  priority: "Faible" | "Moyenne" | "Haute" | "Critique";
  proof: string;
  next: string;
};

export type WorkflowStep = { label: string; status: "Termine" | "En cours" | "A lancer" };

export type PrivateSpaceConfig = {
  key: RoleKey;
  title: string;
  organization: string;
  roleLabel: string;
  territoryDefault: string;
  accent: Tone;
  topbarCta: string;
  sidebar: string[];
  intro: string;
  kpis: { label: string; value: string; detail: string; tone: Tone }[];
  modules: { title: string; description: string; metric: string; tone: Tone }[];
  recordsTitle: string;
  records: PrivateRecord[];
  workflows: WorkflowStep[];
  actions: string[];
  reports: { title: string; status: string; audience: string }[];
  detailLabel: string;
  notePlaceholder: string;
  synthesis: string;
};

export const privateTerritories = ["Joal", "Mbour", "Kayar", "Saint-Louis", "Dakar"];

const baseRecords = (prefix: string, owner: string): PrivateRecord[] => [
  { id: `${prefix}-1`, title: "Tension prioritaire Joal", territory: "Joal", owner, status: "Ouvert", priority: "Critique", proof: "Validation terrain simulee", next: "Prioriser action" },
  { id: `${prefix}-2`, title: "Signal qualifie Mbour", territory: "Mbour", owner, status: "En cours", priority: "Haute", proof: "Systeme", next: "Changer statut" },
  { id: `${prefix}-3`, title: "Coordination Kayar", territory: "Kayar", owner, status: "A lancer", priority: "Moyenne", proof: "Donnee estimee", next: "Generer synthese" }
];

export const privateSpaceConfigs: PrivateSpaceConfig[] = [
  {
    key: "etat",
    title: "Cockpit institutionnel",
    organization: "Ministere des Peches",
    roleLabel: "Etat / Ministere",
    territoryDefault: "Joal",
    accent: "blue",
    topbarCta: "Generer note ministerielle",
    sidebar: ["Synthese nationale", "Territoires", "Tensions", "Programmes", "Financements", "Notes", "Preuves"],
    intro: "Arbitrer les territoires, prioriser les interventions et produire des notes consolidees.",
    kpis: [
      { label: "Territoires suivis", value: "5", detail: "littoral pilote", tone: "blue" },
      { label: "Alertes critiques", value: "7", detail: "dont 2 a arbitrer", tone: "red" },
      { label: "Financements", value: "18", detail: "demandes qualifiees", tone: "amber" },
      { label: "Notes pretes", value: "4", detail: "decision ministerielle", tone: "green" }
    ],
    modules: [
      { title: "Carte des territoires", description: "Lecture des tensions par quai et zone.", metric: "5 zones", tone: "blue" },
      { title: "Priorites publiques", description: "File des arbitrages institutionnels.", metric: "12 actions", tone: "red" },
      { title: "Programmes actifs", description: "Suivi des interventions et doublons.", metric: "6 programmes", tone: "green" },
      { title: "Notes ministerielles", description: "Syntheses pretes pour decision.", metric: "4 notes", tone: "amber" }
    ],
    recordsTitle: "Alertes territoriales",
    records: baseRecords("etat", "Direction peche"),
    workflows: [{ label: "Signal qualifie", status: "Termine" }, { label: "Arbitrage territoire", status: "En cours" }, { label: "Note ministerielle", status: "A lancer" }],
    actions: ["Prioriser territoire", "Changer statut alerte", "Generer synthese", "Ouvrir note"],
    reports: [{ title: "Note cabinet", status: "Prete", audience: "Ministre" }, { title: "Tableau tensions", status: "En cours", audience: "Direction" }],
    detailLabel: "Detail de l'alerte",
    notePlaceholder: "Ajouter une instruction ministerielle temporaire...",
    synthesis: "Synthese simulee: Joal doit etre traite en priorite avec appui froid, coordination mareyeurs et preuve terrain."
  },
  {
    key: "ong",
    title: "Espace programme et reporting",
    organization: "Programme resilience littorale",
    roleLabel: "ONG / Programme",
    territoryDefault: "Mbour",
    accent: "green",
    topbarCta: "Generer reporting bailleur",
    sidebar: ["Vue programme", "Beneficiaires", "Actions terrain", "Preuves", "Risques", "Reporting", "Budget"],
    intro: "Suivre actions, beneficiaires, preuves terrain, risques et reporting bailleur.",
    kpis: [{ label: "Actions terrain", value: "18", detail: "dont 6 finalisees", tone: "green" }, { label: "Beneficiaires", value: "246", detail: "organisations et relais", tone: "blue" }, { label: "Preuves", value: "42", detail: "photos, statuts, notes", tone: "amber" }, { label: "Risques", value: "5", detail: "a traiter", tone: "red" }],
    modules: [{ title: "Portefeuille actions", description: "Suivi des actions par territoire.", metric: "18 actions", tone: "green" }, { title: "Preuves terrain", description: "Documents et confirmations locales.", metric: "42 preuves", tone: "blue" }, { title: "Risques programme", description: "Blocages de mise en oeuvre.", metric: "5 risques", tone: "red" }, { title: "Reporting bailleur", description: "Synthese programme actionnable.", metric: "1 rapport", tone: "amber" }],
    recordsTitle: "Actions programme",
    records: baseRecords("ong", "Coordinateur terrain"),
    workflows: [{ label: "Action terrain", status: "En cours" }, { label: "Preuve locale", status: "A lancer" }, { label: "Rapport bailleur", status: "A lancer" }],
    actions: ["Ajouter preuve locale", "Marquer realise", "Filtrer territoire", "Generer rapport"],
    reports: [{ title: "Reporting bailleur T2", status: "En cours", audience: "Bailleur" }, { title: "Note risques programme", status: "Prete", audience: "Direction ONG" }],
    detailLabel: "Detail de l'action programme",
    notePlaceholder: "Ajouter une note M&E temporaire...",
    synthesis: "Rapport simule: les actions Mbour avancent, Joal demande une preuve locale et Kayar necessite verification doublon."
  },
  {
    key: "collectivite",
    title: "Espace communal Joal",
    organization: "Commune pilote Petite-Cote",
    roleLabel: "Collectivite",
    territoryDefault: "Joal",
    accent: "amber",
    topbarCta: "Generer note communale",
    sidebar: ["Commune", "Quais", "Urgences", "Partenaires", "Actions", "Note mairie"],
    intro: "Suivre les urgences locales, mobiliser les partenaires et coordonner les acteurs du quai.",
    kpis: [{ label: "Quais suivis", value: "3", detail: "Joal et environs", tone: "amber" }, { label: "Urgences", value: "6", detail: "dont 2 critiques", tone: "red" }, { label: "Partenaires", value: "7", detail: "mobilisables", tone: "blue" }, { label: "Actions mairie", value: "9", detail: "4 pretes", tone: "green" }],
    modules: [{ title: "Quais locaux", description: "Etat des quais et signaux locaux.", metric: "3 quais", tone: "amber" }, { title: "Demandes terrain", description: "Demandes remontees par relais.", metric: "11 demandes", tone: "blue" }, { title: "Partenaires", description: "Acteurs a mobiliser localement.", metric: "7 partenaires", tone: "green" }, { title: "Note mairie", description: "Synthese conseil municipal.", metric: "1 note", tone: "slate" }],
    recordsTitle: "Urgences communales",
    records: baseRecords("collectivite", "Service local"),
    workflows: [{ label: "Urgence locale", status: "En cours" }, { label: "Partenaire affecte", status: "A lancer" }, { label: "Note communale", status: "A lancer" }],
    actions: ["Affecter action", "Prioriser quai", "Demander appui", "Generer note"],
    reports: [{ title: "Note maire", status: "Prete", audience: "Conseil municipal" }, { title: "Liste partenaires", status: "En cours", audience: "Commune" }],
    detailLabel: "Detail de l'urgence locale",
    notePlaceholder: "Ajouter une note de coordination communale...",
    synthesis: "Note communale simulee: Joal concentre les urgences froid et doit mobiliser partenaire, relais quai et service local."
  },
  {
    key: "pecheur",
    title: "Parcours assiste pecheur",
    organization: "Relais quai Mbambulaan",
    roleLabel: "Pecheur",
    territoryDefault: "Kayar",
    accent: "slate",
    topbarCta: "Creer signalement",
    sidebar: ["Mes signalements", "Mes demandes", "Statut", "Relais quai", "Retours"],
    intro: "Un espace simple, mobile-first, pour signaler, suivre et comprendre la prochaine etape.",
    kpis: [{ label: "Signalements", value: "12", detail: "envoyes via relais", tone: "blue" }, { label: "Demandes suivies", value: "8", detail: "statut visible", tone: "green" }, { label: "Retours", value: "6", detail: "opportunites encadrees", tone: "amber" }, { label: "Relais actif", value: "1", detail: "Kayar", tone: "slate" }],
    modules: [{ title: "Signalement assiste", description: "Declaration simplifiee avec relais humain.", metric: "3 champs", tone: "blue" }, { title: "Statut simple", description: "Comprendre ou en est la demande.", metric: "4 statuts", tone: "green" }, { title: "Relais quai", description: "Contact local et prochaine etape.", metric: "1 relais", tone: "amber" }, { title: "Retours recus", description: "Reponses lisibles, non marketplace.", metric: "6 retours", tone: "slate" }],
    recordsTitle: "Mes signalements",
    records: baseRecords("pecheur", "Relais quai"),
    workflows: [{ label: "Signal envoye", status: "Termine" }, { label: "Relais verifie", status: "En cours" }, { label: "Retour recu", status: "A lancer" }],
    actions: ["Creer signalement", "Suivre statut", "Voir relais", "Afficher prochaine etape"],
    reports: [{ title: "Historique signalements", status: "Disponible", audience: "Pecheur" }, { title: "Retour relais", status: "En cours", audience: "Relais quai" }],
    detailLabel: "Detail du signalement",
    notePlaceholder: "Ajouter une precision courte pour le relais...",
    synthesis: "Synthese simulee: le signalement est recu, le relais quai verifie et la prochaine etape est affichee simplement."
  },
  {
    key: "mareyeur",
    title: "Espace flux et logistique",
    organization: "Coordination mareyeurs",
    roleLabel: "Mareyeur",
    territoryDefault: "Mbour",
    accent: "green",
    topbarCta: "Organiser retrait",
    sidebar: ["Lots", "Qualite", "Risques", "Retraits", "Froid", "Transport"],
    intro: "Organiser les volumes, anticiper les risques de perte et securiser les retraits.",
    kpis: [{ label: "Lots suivis", value: "14", detail: "qualifies", tone: "green" }, { label: "Risques perte", value: "5", detail: "a traiter", tone: "red" }, { label: "Retraits", value: "7", detail: "organises", tone: "blue" }, { label: "Besoin froid", value: "3", detail: "demandes ouvertes", tone: "amber" }],
    modules: [{ title: "Lots qualifies", description: "Volumes, qualite et disponibilite.", metric: "14 lots", tone: "green" }, { title: "Risque de perte", description: "Lots sensibles a traiter.", metric: "5 alertes", tone: "red" }, { title: "Retraits", description: "Actions logistiques en cours.", metric: "7 retraits", tone: "blue" }, { title: "Froid et transport", description: "Demandes operationnelles.", metric: "3 besoins", tone: "amber" }],
    recordsTitle: "Lots et retraits",
    records: baseRecords("mareyeur", "Relais Mbour"),
    workflows: [{ label: "Lot qualifie", status: "En cours" }, { label: "Retrait organise", status: "A lancer" }, { label: "Preuve logistique", status: "A lancer" }],
    actions: ["Qualifier lot", "Organiser retrait", "Demander froid", "Signaler risque"],
    reports: [{ title: "Plan retrait", status: "En cours", audience: "Mareyeurs" }, { title: "Alerte qualite", status: "Prete", audience: "Relais" }],
    detailLabel: "Detail du lot",
    notePlaceholder: "Ajouter une note logistique temporaire...",
    synthesis: "Synthese simulee: le lot Kayar doit etre traite avant degradation; organiser froid et retrait prioritaire."
  },
  {
    key: "exportateur",
    title: "Espace supply qualifie",
    organization: "Entreprise supply partenaire",
    roleLabel: "Exportateur / Entreprise",
    territoryDefault: "Dakar",
    accent: "blue",
    topbarCta: "Preparer decision supply",
    sidebar: ["Pipeline supply", "Opportunites", "Preuves", "Risques", "Conditions", "Decision"],
    intro: "Qualifier des opportunites non publiques avec preuves, risques et conditions logistiques.",
    kpis: [{ label: "Opportunites", value: "6", detail: "qualifiees", tone: "blue" }, { label: "Score trace", value: "82%", detail: "moyenne", tone: "green" }, { label: "Risques qualite", value: "3", detail: "a verifier", tone: "red" }, { label: "Decisions", value: "2", detail: "pretes", tone: "amber" }],
    modules: [{ title: "Pipeline supply", description: "Opportunites qualifiees et non publiques.", metric: "6 lignes", tone: "blue" }, { title: "Preuves", description: "Trace, qualite, confiance et statut.", metric: "18 preuves", tone: "green" }, { title: "Risques qualite", description: "Points a verifier avant engagement.", metric: "3 risques", tone: "red" }, { title: "Conditions", description: "Logistique et exigences supply.", metric: "5 conditions", tone: "amber" }],
    recordsTitle: "Opportunites qualifiees",
    records: baseRecords("exportateur", "Responsable supply"),
    workflows: [{ label: "Opportunite identifiee", status: "Termine" }, { label: "Preuve demandee", status: "En cours" }, { label: "Decision achat", status: "A lancer" }],
    actions: ["Demander preuve", "Qualifier opportunite", "Suivre risque", "Preparer decision"],
    reports: [{ title: "Decision supply", status: "Prete", audience: "Entreprise" }, { title: "Matrice risques", status: "En cours", audience: "Qualite" }],
    detailLabel: "Detail supply",
    notePlaceholder: "Ajouter une condition supply temporaire...",
    synthesis: "Synthese simulee: opportunite Mbour prete, Joal demande preuve, Saint-Louis reste sous risque qualite."
  },
  {
    key: "organisation",
    title: "Espace collectif et plaidoyer",
    organization: "Organisation professionnelle",
    roleLabel: "Organisation professionnelle",
    territoryDefault: "Joal",
    accent: "amber",
    topbarCta: "Generer note partenaire",
    sidebar: ["Membres", "Demandes", "Dossiers", "Preuves", "Plaidoyer", "Bureau"],
    intro: "Structurer les membres, demandes collectives, preuves et dossiers partenaires.",
    kpis: [{ label: "Membres", value: "86", detail: "recenses", tone: "blue" }, { label: "Demandes", value: "11", detail: "collectives", tone: "amber" }, { label: "Dossiers", value: "4", detail: "partenaires", tone: "green" }, { label: "Preuves", value: "24", detail: "associees", tone: "slate" }],
    modules: [{ title: "Registre membres", description: "Base collective structuree.", metric: "86 membres", tone: "blue" }, { title: "Demandes collectives", description: "Besoins classes par priorite.", metric: "11 demandes", tone: "amber" }, { title: "Dossiers partenaires", description: "Dossiers prets pour plaidoyer.", metric: "4 dossiers", tone: "green" }, { title: "Preuves", description: "Elements defensables et sources.", metric: "24 preuves", tone: "slate" }],
    recordsTitle: "Demandes collectives",
    records: baseRecords("organisation", "Bureau GIE"),
    workflows: [{ label: "Membre ajoute", status: "Termine" }, { label: "Demande classee", status: "En cours" }, { label: "Dossier partenaire", status: "A lancer" }],
    actions: ["Ajouter membre", "Classer demande", "Generer note", "Suivre dossier"],
    reports: [{ title: "Note partenaire", status: "Prete", audience: "Partenaires" }, { title: "Registre bureau", status: "En cours", audience: "Organisation" }],
    detailLabel: "Detail demande collective",
    notePlaceholder: "Ajouter une note du bureau...",
    synthesis: "Synthese simulee: la demande froid collectif est prioritaire et peut etre portee dans une note partenaire."
  },
  {
    key: "investisseur",
    title: "Executive room investisseur",
    organization: "Mbambulaan venture room",
    roleLabel: "Investisseur / Associe",
    territoryDefault: "Dakar",
    accent: "red",
    topbarCta: "Ouvrir data room",
    sidebar: ["These", "Segments payeurs", "Offres", "Revenus", "Partenaires", "Risques", "Roadmap"],
    intro: "Comprendre vision, business model, segments payeurs, traction, risques et roadmap.",
    kpis: [{ label: "Segments payeurs", value: "7", detail: "B2B et institutionnels", tone: "blue" }, { label: "Offres", value: "5", detail: "pilotables", tone: "green" }, { label: "Pipeline", value: "12", detail: "partenaires cibles", tone: "amber" }, { label: "Risques", value: "6", detail: "suivis", tone: "red" }],
    modules: [{ title: "These infrastructure", description: "Pourquoi Mbambulaan n'est pas une app.", metric: "1 these", tone: "slate" }, { title: "Segments payeurs", description: "Etat, ONG, entreprises, organisations.", metric: "7 segments", tone: "blue" }, { title: "Revenus simulables", description: "Pilotes, conventions, abonnements, data.", metric: "5 offres", tone: "green" }, { title: "Roadmap", description: "Pilote, production, scale Senegal.", metric: "4 phases", tone: "amber" }],
    recordsTitle: "Segments et risques",
    records: baseRecords("investisseur", "CEO"),
    workflows: [{ label: "These claire", status: "Termine" }, { label: "Segments priorises", status: "En cours" }, { label: "Data room", status: "A lancer" }],
    actions: ["Ouvrir data room", "Filtrer payeurs", "Voir potentiel revenus", "Lire roadmap"],
    reports: [{ title: "Investment memo", status: "Prete", audience: "Associe" }, { title: "Roadmap scale", status: "En cours", audience: "Investisseur" }],
    detailLabel: "Detail business",
    notePlaceholder: "Ajouter une note investisseur temporaire...",
    synthesis: "Memo simule: Mbambulaan est une infrastructure verticale avec plusieurs payeurs, data effects et pilotes territoriaux monetisables."
  }
];

export function getPrivateSpaceConfig(role: RoleKey) {
  return privateSpaceConfigs.find((space) => space.key === role) ?? privateSpaceConfigs[0];
}
