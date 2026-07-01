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

export type WorkflowStep = {
  label: string;
  status: "Termine" | "En cours" | "A lancer";
};

export type MapPoint = {
  name: string;
  zone: string;
  x: number;
  y: number;
  tension: "Faible" | "Moyenne" | "Forte" | "Critique";
  actors: string[];
  signals: number;
  programs: number;
  funding: string;
  priority: string;
  proof: string;
};

export type CapabilityPanel = {
  title: string;
  metric: string;
  description: string;
  tone: Tone;
};

export type EcosystemProfile = {
  mapTitle: string;
  mapSubtitle: string;
  capabilities: CapabilityPanel[];
  secondaryTitle: string;
  secondaryRecords: PrivateRecord[];
  decisionRoomTitle: string;
  decisionBullets: string[];
};

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

const sharedTerritories = ["Joal", "Mbour", "Kayar", "Saint-Louis", "Dakar"];

const sharedMapPoints: MapPoint[] = [
  {
    name: "Saint-Louis",
    zone: "Nord",
    x: 23,
    y: 12,
    tension: "Forte",
    actors: ["Service peche", "Cooperative", "Programme resilience"],
    signals: 9,
    programs: 2,
    funding: "180 M FCFA",
    priority: "Suivre carburant, froid et doublon programme",
    proof: "Validation terrain simulee"
  },
  {
    name: "Kayar",
    zone: "Grande-Cote",
    x: 36,
    y: 38,
    tension: "Moyenne",
    actors: ["Relais quai", "Pecheurs referents", "Mareyeurs"],
    signals: 8,
    programs: 1,
    funding: "65 M FCFA",
    priority: "Qualifier les volumes matinaux",
    proof: "Systeme"
  },
  {
    name: "Dakar",
    zone: "Cap-Vert",
    x: 29,
    y: 50,
    tension: "Faible",
    actors: ["Administration", "Exportateurs", "Investisseurs"],
    signals: 5,
    programs: 3,
    funding: "240 M FCFA",
    priority: "Cadrer decisions et data room",
    proof: "Estime"
  },
  {
    name: "Mbour",
    zone: "Petite-Cote",
    x: 47,
    y: 64,
    tension: "Forte",
    actors: ["Mareyeurs", "Transformateurs", "ONG"],
    signals: 11,
    programs: 2,
    funding: "120 M FCFA",
    priority: "Orienter flux vers transformation",
    proof: "Validation relais"
  },
  {
    name: "Joal",
    zone: "Petite-Cote",
    x: 56,
    y: 75,
    tension: "Critique",
    actors: ["Commune", "Organisation professionnelle", "Relais quai"],
    signals: 14,
    programs: 2,
    funding: "210 M FCFA",
    priority: "Renforcer conservation et retrait",
    proof: "Validation terrain simulee"
  }
];

export const ecosystemMapPoints = sharedMapPoints;

export const ecosystemProfiles: Record<RoleKey, EcosystemProfile> = {
  etat: {
    mapTitle: "Carte institutionnelle des quais, tensions et financements",
    mapSubtitle: "Priorisation nationale des territoires pilotes, alertes et demandes d'appui.",
    capabilities: [
      { title: "Priorisation publique", metric: "12 arbitrages", description: "Classe les territoires par urgence, impact et preuve disponible.", tone: "red" },
      { title: "Financements suivis", metric: "18 dossiers", description: "Relie besoins, programmes et risques de doublon.", tone: "amber" },
      { title: "Notes ministerielles", metric: "4 pretes", description: "Produit une synthese exploitable pour cabinet ou direction.", tone: "blue" },
      { title: "Alertes institutionnelles", metric: "7 actives", description: "Signale tensions, doublons, blocages et zones critiques.", tone: "green" }
    ],
    secondaryTitle: "Programmes, financements et alertes institutionnelles",
    secondaryRecords: [
      { id: "etat-sec-1", title: "Programme froid Joal", territory: "Joal", owner: "Cellule programme", status: "Pret arbitrage", priority: "Critique", proof: "Validation terrain simulee", next: "Signer note de cadrage" },
      { id: "etat-sec-2", title: "Financement caisses Mbour", territory: "Mbour", owner: "Direction financements", status: "En instruction", priority: "Haute", proof: "Estime", next: "Comparer avec programme ONG" },
      { id: "etat-sec-3", title: "Doublon appui Saint-Louis", territory: "Saint-Louis", owner: "Coordination nationale", status: "A rapprocher", priority: "Haute", proof: "Systeme", next: "Fusionner deux demandes" }
    ],
    decisionRoomTitle: "Salle de decision ministerielle",
    decisionBullets: [
      "Joal ressort comme priorite critique car tension, perte potentielle et besoin froid convergent.",
      "Mbour doit etre coordonne avec les mareyeurs et transformateurs avant d'engager un financement.",
      "Saint-Louis demande une verification de doublon pour eviter deux programmes concurrents."
    ]
  },
  ong: {
    mapTitle: "Carte programme, beneficiaires et preuves terrain",
    mapSubtitle: "Lecture par zone d'intervention, retards, preuves et alertes bailleur.",
    capabilities: [
      { title: "Portefeuille actions", metric: "18 actions", description: "Suit responsable, delai, preuve et prochain jalon.", tone: "green" },
      { title: "Beneficiaires", metric: "246 suivis", description: "Regroupe relais, organisations et acteurs appuyes.", tone: "blue" },
      { title: "Score preuve", metric: "78%", description: "Indique si le reporting est defendable.", tone: "amber" },
      { title: "Alertes delai", metric: "5 risques", description: "Signale les actions sans preuve ou en retard.", tone: "red" }
    ],
    secondaryTitle: "Checklist suivi-evaluation et reporting bailleur",
    secondaryRecords: [
      { id: "ong-sec-1", title: "Preuve formation qualite", territory: "Joal", owner: "M&E officer", status: "A collecter", priority: "Haute", proof: "Declaratif", next: "Ajouter preuve terrain" },
      { id: "ong-sec-2", title: "Rapport bailleur T2", territory: "Mbour", owner: "Chef programme", status: "En cours", priority: "Moyenne", proof: "Systeme", next: "Generer extrait" },
      { id: "ong-sec-3", title: "Retard distribution", territory: "Kayar", owner: "Coordinateur terrain", status: "A traiter", priority: "Haute", proof: "Estime", next: "Assigner responsable" }
    ],
    decisionRoomTitle: "Pilotage programme",
    decisionBullets: [
      "Le bailleur voit ce qui est fait, prouve et encore fragile.",
      "Les retards ne restent pas caches dans un tableur.",
      "Chaque action garde un responsable, une zone et une prochaine etape."
    ]
  },
  collectivite: {
    mapTitle: "Carte communale des quais, urgences et partenaires",
    mapSubtitle: "Une lecture locale pour coordonner mairie, relais quai et partenaires.",
    capabilities: [
      { title: "Urgences locales", metric: "6 ouvertes", description: "Rend visibles les sujets a traiter en conseil ou comite local.", tone: "red" },
      { title: "Partenaires mobilisables", metric: "7 acteurs", description: "Associe chaque action a un partenaire possible.", tone: "blue" },
      { title: "Calendrier communal", metric: "9 jalons", description: "Suit date, responsable et prochaine reunion.", tone: "amber" },
      { title: "Note mairie", metric: "1 prete", description: "Transforme les signaux en note locale courte.", tone: "green" }
    ],
    secondaryTitle: "Actions locales avec responsable et echeance",
    secondaryRecords: [
      { id: "col-sec-1", title: "Appui froid quai Joal", territory: "Joal", owner: "Mairie", status: "Pret", priority: "Critique", proof: "Validation relais", next: "Mobiliser partenaire froid" },
      { id: "col-sec-2", title: "Collecte femmes transformatrices", territory: "Mbour", owner: "Service local", status: "Planifie", priority: "Haute", proof: "Declaratif", next: "Fixer date terrain" },
      { id: "col-sec-3", title: "Transport vers marche", territory: "Kayar", owner: "Relais quai", status: "Ouvert", priority: "Moyenne", proof: "Systeme", next: "Identifier transporteur" }
    ],
    decisionRoomTitle: "Valeur pour la collectivite",
    decisionBullets: [
      "La mairie voit les urgences, les partenaires et les preuves sans attendre un rapport long.",
      "Chaque sujet local a un responsable, une date et une action coordonnee.",
      "La collectivite peut justifier une convention ou un pilote par des preuves terrain."
    ]
  },
  pecheur: {
    mapTitle: "Vue simple du quai et du relais",
    mapSubtitle: "Un pecheur ne voit pas un cockpit: il voit son signal, son relais et la prochaine etape.",
    capabilities: [
      { title: "Signal assiste", metric: "3 champs", description: "Declaration simple, compatible WhatsApp, SMS ou relais humain.", tone: "blue" },
      { title: "Statut lisible", metric: "4 etats", description: "Recu, verifie, traite, retour envoye.", tone: "green" },
      { title: "Relais actif", metric: "1 contact", description: "Un humain reste au centre de la confiance.", tone: "amber" },
      { title: "Retour encadre", metric: "6 retours", description: "Le pecheur comprend la prochaine etape sans marketplace.", tone: "slate" }
    ],
    secondaryTitle: "Demandes d'aide et retours de relais",
    secondaryRecords: [
      { id: "pec-sec-1", title: "Besoin caisse isotherme", territory: "Kayar", owner: "Relais quai", status: "En traitement", priority: "Haute", proof: "Validation relais", next: "Attendre retour relais" },
      { id: "pec-sec-2", title: "Lot a signaler demain", territory: "Kayar", owner: "Pecheur A", status: "A preparer", priority: "Moyenne", proof: "Declaratif", next: "Confirmer heure" },
      { id: "pec-sec-3", title: "Retour coordination", territory: "Mbour", owner: "Relais", status: "Envoye", priority: "Faible", proof: "Systeme", next: "Lire message" }
    ],
    decisionRoomTitle: "Experience pecheur",
    decisionBullets: [
      "Pas de surcharge: le produit assiste le relais et clarifie le statut.",
      "La preuve reste simple: declaration, relais, historique.",
      "Le pecheur ne devient pas operateur d'un dashboard."
    ]
  },
  mareyeur: {
    mapTitle: "Carte flux, qualite, froid et retraits",
    mapSubtitle: "Organiser les lots qualifies, anticiper la perte et planifier le retrait.",
    capabilities: [
      { title: "Lots qualifies", metric: "14 lots", description: "Volume, qualite, statut et disponibilite.", tone: "green" },
      { title: "Risque perte", metric: "5 alertes", description: "Priorise les lots sensibles avant degradation.", tone: "red" },
      { title: "Plan de retrait", metric: "7 actifs", description: "Coordonne responsable, quai, transport et horaire.", tone: "blue" },
      { title: "Besoin froid", metric: "3 demandes", description: "Declenche une action de conservation si necessaire.", tone: "amber" }
    ],
    secondaryTitle: "Plan retraits, transport et besoins froid",
    secondaryRecords: [
      { id: "mar-sec-1", title: "Retrait Joal 16h", territory: "Joal", owner: "Mareyeur A", status: "Planifie", priority: "Haute", proof: "Validation terrain", next: "Confirmer transport" },
      { id: "mar-sec-2", title: "Froid Kayar", territory: "Kayar", owner: "Relais quai", status: "Urgent", priority: "Critique", proof: "Estime", next: "Demander caisse" },
      { id: "mar-sec-3", title: "Historique lot Mbour", territory: "Mbour", owner: "Equipe flux", status: "Trace", priority: "Moyenne", proof: "Systeme", next: "Voir historique" }
    ],
    decisionRoomTitle: "Decision flux",
    decisionBullets: [
      "Le mareyeur decide quel lot traiter, quel retrait organiser et quel risque signaler.",
      "La qualite et la trace remplacent la logique de simple catalogue.",
      "Chaque action reste coordonnee avec le relais et le territoire."
    ]
  },
  exportateur: {
    mapTitle: "Carte supply qualifie, risques et conditions logistiques",
    mapSubtitle: "Une entreprise voit des opportunites non publiques, qualifiees et prouvees.",
    capabilities: [
      { title: "Pipeline supply", metric: "6 lignes", description: "Lots ou flux qualifies avant decision commerciale.", tone: "blue" },
      { title: "Score confiance", metric: "82%", description: "Synthese acteur, preuve et historique simules.", tone: "green" },
      { title: "Risques qualite", metric: "3 ouverts", description: "Points a lever avant engagement.", tone: "red" },
      { title: "Conditions logistiques", metric: "5 suivies", description: "Froid, retrait, volume, delai, trace.", tone: "amber" }
    ],
    secondaryTitle: "Pipeline supply et decisions d'achat",
    secondaryRecords: [
      { id: "exp-sec-1", title: "Dorade Joal - preuve a completer", territory: "Joal", owner: "Qualite", status: "A verifier", priority: "Haute", proof: "Trace partielle", next: "Demander preuve" },
      { id: "exp-sec-2", title: "Crevette Saint-Louis - risque delai", territory: "Saint-Louis", owner: "Supply", status: "Risque", priority: "Critique", proof: "Estime", next: "Bloquer decision" },
      { id: "exp-sec-3", title: "Sardinelle Mbour - decision possible", territory: "Mbour", owner: "Achat", status: "Pret", priority: "Moyenne", proof: "Valide", next: "Preparer decision" }
    ],
    decisionRoomTitle: "Decision supply",
    decisionBullets: [
      "L'entreprise ne navigue pas un marche public: elle qualifie une opportunite encadree.",
      "Le risque qualite est visible avant engagement.",
      "La decision conserve les preuves et conditions logistiques."
    ]
  },
  organisation: {
    mapTitle: "Carte membres, demandes collectives et dossiers partenaires",
    mapSubtitle: "Structurer la parole collective par quai, preuve et priorite.",
    capabilities: [
      { title: "Registre membres", metric: "86 membres", description: "Membres par quai, role et statut de verification.", tone: "blue" },
      { title: "Demandes collectives", metric: "11 ouvertes", description: "Classe les besoins defendables par priorite.", tone: "amber" },
      { title: "Dossiers partenaires", metric: "4 prets", description: "Transforme les demandes en dossiers lisibles.", tone: "green" },
      { title: "Plaidoyer", metric: "3 notes", description: "Justifie une action collective avec preuves.", tone: "slate" }
    ],
    secondaryTitle: "Membres par quai et besoins de preuve",
    secondaryRecords: [
      { id: "org-sec-1", title: "Membres Joal a verifier", territory: "Joal", owner: "Bureau GIE", status: "En cours", priority: "Haute", proof: "Registre", next: "Verifier 12 membres" },
      { id: "org-sec-2", title: "Dossier froid collectif", territory: "Joal", owner: "Presidente", status: "Pret", priority: "Critique", proof: "Valide", next: "Envoyer partenaire" },
      { id: "org-sec-3", title: "Demande formation Mbour", territory: "Mbour", owner: "Secretaire", status: "Ouvert", priority: "Moyenne", proof: "Declaratif", next: "Collecter preuves" }
    ],
    decisionRoomTitle: "Bureau organisation",
    decisionBullets: [
      "Le bureau voit les demandes qui peuvent etre defendues tout de suite.",
      "Les membres et preuves ne sont plus separes des dossiers partenaires.",
      "La note de plaidoyer sort d'une base tracee, pas d'un texte isole."
    ]
  },
  investisseur: {
    mapTitle: "Carte d'expansion, segments payeurs et potentiel",
    mapSubtitle: "Lecture investisseur: territoire, payeurs, offres, pipeline et risques.",
    capabilities: [
      { title: "These infrastructure", metric: "1 OS filiere", description: "Mbambulaan orchestre, qualifie et prouve; ce n'est pas une app de peche.", tone: "slate" },
      { title: "Segments payeurs", metric: "7 segments", description: "Etat, ONG, collectivites, entreprises, organisations, investisseurs, assureurs futurs.", tone: "blue" },
      { title: "Potentiel revenus", metric: "5 offres", description: "Pilote, convention, SaaS, reporting, intelligence territoriale.", tone: "green" },
      { title: "Roadmap scale", metric: "4 phases", description: "Pilote, production, Senegal, Afrique de l'Ouest.", tone: "amber" }
    ],
    secondaryTitle: "Data room: segments, offres, risques et roadmap",
    secondaryRecords: [
      { id: "inv-sec-1", title: "Offre pilote institutionnel", territory: "Dakar", owner: "CEO", status: "A cadrer", priority: "Critique", proof: "Hypothese", next: "Evaluer convention" },
      { id: "inv-sec-2", title: "Pipeline ONG programme", territory: "Mbour", owner: "Partenariats", status: "Pipeline", priority: "Haute", proof: "Conversation", next: "Qualifier sponsor" },
      { id: "inv-sec-3", title: "Unit economics terrain", territory: "Joal", owner: "Produit", status: "A simuler", priority: "Haute", proof: "Estime", next: "Ouvrir modele" }
    ],
    decisionRoomTitle: "Lecture investisseur / associe",
    decisionBullets: [
      "Le produit vend une infrastructure de coordination avec plusieurs segments payeurs.",
      "Le moat vient du reseau humain, des preuves, des donnees territoriales et des workflows.",
      "La prochaine levee doit financer pilote terrain, convention institutionnelle et industrialisation produit."
    ]
  }
};

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
    intro: "Arbitrer les territoires, prioriser les interventions et produire des notes consolidées.",
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
      { title: "Notes ministerielles", description: "Syntheses prêtes pour decision.", metric: "4 notes", tone: "amber" }
    ],
    recordsTitle: "Alertes territoriales",
    records: [
      { id: "etat-1", title: "Tension froid a Joal", territory: "Joal", owner: "Direction peche", status: "A arbitrer", priority: "Critique", proof: "Validation terrain simulee", next: "Prioriser appui froid" },
      { id: "etat-2", title: "Doublon programme a Saint-Louis", territory: "Saint-Louis", owner: "Cellule programme", status: "En analyse", priority: "Haute", proof: "Donnee estimee", next: "Consolider partenaires" },
      { id: "etat-3", title: "Flux mareyeurs a Mbour", territory: "Mbour", owner: "Service local", status: "Ouvert", priority: "Moyenne", proof: "Systeme", next: "Orienter coordination" }
    ],
    workflows: [
      { label: "Signal qualifie", status: "Termine" },
      { label: "Arbitrage territoire", status: "En cours" },
      { label: "Note ministerielle", status: "A lancer" }
    ],
    actions: ["Prioriser territoire", "Changer statut alerte", "Generer synthese", "Ouvrir note"],
    reports: [
      { title: "Note cabinet", status: "Prete", audience: "Ministre" },
      { title: "Tableau tensions", status: "En cours", audience: "Direction" }
    ],
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
    kpis: [
      { label: "Actions terrain", value: "18", detail: "dont 6 finalisees", tone: "green" },
      { label: "Beneficiaires", value: "246", detail: "organisations et relais", tone: "blue" },
      { label: "Preuves", value: "42", detail: "photos, statuts, notes", tone: "amber" },
      { label: "Risques", value: "5", detail: "a traiter", tone: "red" }
    ],
    modules: [
      { title: "Portefeuille actions", description: "Suivi des actions par territoire.", metric: "18 actions", tone: "green" },
      { title: "Preuves terrain", description: "Documents et confirmations locales.", metric: "42 preuves", tone: "blue" },
      { title: "Risques programme", description: "Blocages et alertes de mise en oeuvre.", metric: "5 risques", tone: "red" },
      { title: "Reporting bailleur", description: "Synthese programme actionnable.", metric: "1 rapport", tone: "amber" }
    ],
    recordsTitle: "Actions programme",
    records: [
      { id: "ong-1", title: "Distribution caisses isothermes", territory: "Mbour", owner: "Coordinateur terrain", status: "En cours", priority: "Haute", proof: "Preuve terrain ajoutee", next: "Marquer action realisee" },
      { id: "ong-2", title: "Formation qualite Joal", territory: "Joal", owner: "M&E officer", status: "Planifie", priority: "Moyenne", proof: "Declaratif", next: "Collecter presence" },
      { id: "ong-3", title: "Controle doublon Kayar", territory: "Kayar", owner: "Chef programme", status: "A verifier", priority: "Haute", proof: "Estime", next: "Comparer partenaires" }
    ],
    workflows: [
      { label: "Action terrain", status: "En cours" },
      { label: "Preuve locale", status: "A lancer" },
      { label: "Rapport bailleur", status: "A lancer" }
    ],
    actions: ["Ajouter preuve locale", "Marquer realise", "Filtrer territoire", "Generer rapport"],
    reports: [
      { title: "Reporting bailleur T2", status: "En cours", audience: "Bailleur" },
      { title: "Note risques programme", status: "Prete", audience: "Direction ONG" }
    ],
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
    kpis: [
      { label: "Quais suivis", value: "3", detail: "Joal et environs", tone: "amber" },
      { label: "Urgences", value: "6", detail: "dont 2 critiques", tone: "red" },
      { label: "Partenaires", value: "7", detail: "mobilisables", tone: "blue" },
      { label: "Actions mairie", value: "9", detail: "4 pretes", tone: "green" }
    ],
    modules: [
      { title: "Quais locaux", description: "Etat des quais et signaux locaux.", metric: "3 quais", tone: "amber" },
      { title: "Demandes terrain", description: "Demandes remontees par relais.", metric: "11 demandes", tone: "blue" },
      { title: "Partenaires", description: "Acteurs a mobiliser localement.", metric: "7 partenaires", tone: "green" },
      { title: "Note mairie", description: "Synthese pour conseil municipal.", metric: "1 note", tone: "slate" }
    ],
    recordsTitle: "Urgences communales",
    records: [
      { id: "col-1", title: "Quai Joal - froid insuffisant", territory: "Joal", owner: "Service local", status: "Prioritaire", priority: "Critique", proof: "Validation relais", next: "Demander appui partenaire" },
      { id: "col-2", title: "Besoin collecte femmes transformatrices", territory: "Mbour", owner: "Mairie", status: "Ouvert", priority: "Haute", proof: "Declaratif", next: "Affecter action" },
      { id: "col-3", title: "Signal transport Kayar", territory: "Kayar", owner: "Relais quai", status: "A lancer", priority: "Moyenne", proof: "Systeme", next: "Prioriser quai" }
    ],
    workflows: [
      { label: "Urgence locale", status: "En cours" },
      { label: "Partenaire affecte", status: "A lancer" },
      { label: "Note communale", status: "A lancer" }
    ],
    actions: ["Affecter action", "Prioriser quai", "Demander appui", "Generer note"],
    reports: [
      { title: "Note maire", status: "Prete", audience: "Conseil municipal" },
      { title: "Liste partenaires", status: "En cours", audience: "Commune" }
    ],
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
    kpis: [
      { label: "Signalements", value: "12", detail: "envoyes via relais", tone: "blue" },
      { label: "Demandes suivies", value: "8", detail: "statut visible", tone: "green" },
      { label: "Retours", value: "6", detail: "opportunites encadrees", tone: "amber" },
      { label: "Relais actif", value: "1", detail: "Kayar", tone: "slate" }
    ],
    modules: [
      { title: "Signalement assiste", description: "Declaration simplifiee avec relais humain.", metric: "3 champs", tone: "blue" },
      { title: "Statut simple", description: "Comprendre ou en est la demande.", metric: "4 statuts", tone: "green" },
      { title: "Relais quai", description: "Contact local et prochaine etape.", metric: "1 relais", tone: "amber" },
      { title: "Retours recus", description: "Reponses lisibles, non marketplace.", metric: "6 retours", tone: "slate" }
    ],
    recordsTitle: "Mes signalements",
    records: [
      { id: "pec-1", title: "Lot sardinelle disponible", territory: "Kayar", owner: "Pecheur A", status: "Recu", priority: "Moyenne", proof: "Declaratif", next: "Voir relais" },
      { id: "pec-2", title: "Besoin caisses", territory: "Kayar", owner: "Pecheur B", status: "En traitement", priority: "Haute", proof: "Validation relais", next: "Afficher prochaine etape" },
      { id: "pec-3", title: "Retour opportunite encadree", territory: "Mbour", owner: "Relais quai", status: "Retour envoye", priority: "Moyenne", proof: "Systeme", next: "Suivre statut" }
    ],
    workflows: [
      { label: "Signal envoye", status: "Termine" },
      { label: "Relais verifie", status: "En cours" },
      { label: "Retour recu", status: "A lancer" }
    ],
    actions: ["Creer signalement", "Suivre statut", "Voir relais", "Afficher prochaine etape"],
    reports: [
      { title: "Historique signalements", status: "Disponible", audience: "Pecheur" },
      { title: "Retour relais", status: "En cours", audience: "Relais quai" }
    ],
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
    kpis: [
      { label: "Lots suivis", value: "14", detail: "qualifies", tone: "green" },
      { label: "Risques perte", value: "5", detail: "a traiter", tone: "red" },
      { label: "Retraits", value: "7", detail: "organises", tone: "blue" },
      { label: "Besoin froid", value: "3", detail: "demandes ouvertes", tone: "amber" }
    ],
    modules: [
      { title: "Lots qualifies", description: "Volumes, qualite et disponibilite.", metric: "14 lots", tone: "green" },
      { title: "Risque de perte", description: "Lots sensibles a traiter.", metric: "5 alertes", tone: "red" },
      { title: "Retraits", description: "Actions logistiques en cours.", metric: "7 retraits", tone: "blue" },
      { title: "Froid et transport", description: "Demandes operationnelles.", metric: "3 besoins", tone: "amber" }
    ],
    recordsTitle: "Lots et retraits",
    records: [
      { id: "mar-1", title: "Lot sardinelle 700 kg", territory: "Mbour", owner: "Relais Mbour", status: "A qualifier", priority: "Haute", proof: "Systeme", next: "Qualifier lot" },
      { id: "mar-2", title: "Retrait Joal apres-midi", territory: "Joal", owner: "Mareyeur A", status: "Planifie", priority: "Moyenne", proof: "Validation terrain", next: "Organiser retrait" },
      { id: "mar-3", title: "Risque perte Kayar", territory: "Kayar", owner: "Relais quai", status: "Urgent", priority: "Critique", proof: "Estime", next: "Demander froid" }
    ],
    workflows: [
      { label: "Lot qualifie", status: "En cours" },
      { label: "Retrait organise", status: "A lancer" },
      { label: "Preuve logistique", status: "A lancer" }
    ],
    actions: ["Qualifier lot", "Organiser retrait", "Demander froid", "Signaler risque"],
    reports: [
      { title: "Plan retrait", status: "En cours", audience: "Mareyeurs" },
      { title: "Alerte qualite", status: "Prete", audience: "Relais" }
    ],
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
    kpis: [
      { label: "Opportunites", value: "6", detail: "qualifiees", tone: "blue" },
      { label: "Score trace", value: "82%", detail: "moyenne", tone: "green" },
      { label: "Risques qualite", value: "3", detail: "a verifier", tone: "red" },
      { label: "Decisions", value: "2", detail: "pretes", tone: "amber" }
    ],
    modules: [
      { title: "Pipeline supply", description: "Opportunites qualifiees et non publiques.", metric: "6 lignes", tone: "blue" },
      { title: "Preuves", description: "Trace, qualite, confiance et statut.", metric: "18 preuves", tone: "green" },
      { title: "Risques qualite", description: "Points a verifier avant engagement.", metric: "3 risques", tone: "red" },
      { title: "Conditions", description: "Logistique et exigences supply.", metric: "5 conditions", tone: "amber" }
    ],
    recordsTitle: "Opportunites qualifiees",
    records: [
      { id: "exp-1", title: "Supply dorade Joal", territory: "Joal", owner: "Acheteur qualite", status: "A qualifier", priority: "Haute", proof: "Trace partielle", next: "Demander preuve" },
      { id: "exp-2", title: "Crevette Saint-Louis", territory: "Saint-Louis", owner: "Responsable supply", status: "Risque qualite", priority: "Critique", proof: "Estime", next: "Suivre risque" },
      { id: "exp-3", title: "Sardinelle Mbour", territory: "Mbour", owner: "Equipe achat", status: "Decision prete", priority: "Moyenne", proof: "Valide", next: "Preparer decision" }
    ],
    workflows: [
      { label: "Opportunite identifiee", status: "Termine" },
      { label: "Preuve demandee", status: "En cours" },
      { label: "Decision achat", status: "A lancer" }
    ],
    actions: ["Demander preuve", "Qualifier opportunite", "Suivre risque", "Preparer decision"],
    reports: [
      { title: "Decision supply", status: "Prete", audience: "Entreprise" },
      { title: "Matrice risques", status: "En cours", audience: "Qualite" }
    ],
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
    kpis: [
      { label: "Membres", value: "86", detail: "recenses", tone: "blue" },
      { label: "Demandes", value: "11", detail: "collectives", tone: "amber" },
      { label: "Dossiers", value: "4", detail: "partenaires", tone: "green" },
      { label: "Preuves", value: "24", detail: "associees", tone: "slate" }
    ],
    modules: [
      { title: "Registre membres", description: "Base collective structuree.", metric: "86 membres", tone: "blue" },
      { title: "Demandes collectives", description: "Besoins classes par priorite.", metric: "11 demandes", tone: "amber" },
      { title: "Dossiers partenaires", description: "Dossiers prets pour plaidoyer.", metric: "4 dossiers", tone: "green" },
      { title: "Preuves", description: "Elements defensables et sources.", metric: "24 preuves", tone: "slate" }
    ],
    recordsTitle: "Demandes collectives",
    records: [
      { id: "org-1", title: "Demande froid collectif", territory: "Joal", owner: "Bureau GIE", status: "Classee", priority: "Haute", proof: "Registre", next: "Generer note partenaire" },
      { id: "org-2", title: "Formation qualite", territory: "Mbour", owner: "Secretaire", status: "Ouvert", priority: "Moyenne", proof: "Declaratif", next: "Classer demande" },
      { id: "org-3", title: "Appui caisses", territory: "Kayar", owner: "Presidente", status: "A consolider", priority: "Haute", proof: "Valide", next: "Suivre dossier" }
    ],
    workflows: [
      { label: "Membre ajoute", status: "Termine" },
      { label: "Demande classee", status: "En cours" },
      { label: "Dossier partenaire", status: "A lancer" }
    ],
    actions: ["Ajouter membre", "Classer demande", "Generer note", "Suivre dossier"],
    reports: [
      { title: "Note partenaire", status: "Prete", audience: "Partenaires" },
      { title: "Registre bureau", status: "En cours", audience: "Organisation" }
    ],
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
    kpis: [
      { label: "Segments payeurs", value: "7", detail: "B2B et institutionnels", tone: "blue" },
      { label: "Offres", value: "5", detail: "pilotables", tone: "green" },
      { label: "Pipeline", value: "12", detail: "partenaires cibles", tone: "amber" },
      { label: "Risques", value: "6", detail: "suivis", tone: "red" }
    ],
    modules: [
      { title: "These infrastructure", description: "Pourquoi Mbambulaan n'est pas une app.", metric: "1 these", tone: "slate" },
      { title: "Segments payeurs", description: "Etat, ONG, entreprises, organisations.", metric: "7 segments", tone: "blue" },
      { title: "Revenus simulables", description: "Pilotes, conventions, abonnements, data.", metric: "5 offres", tone: "green" },
      { title: "Roadmap", description: "Pilote, production, scale Senegal.", metric: "4 phases", tone: "amber" }
    ],
    recordsTitle: "Segments et risques",
    records: [
      { id: "inv-1", title: "Pilote institutionnel", territory: "Dakar", owner: "CEO", status: "A cadrer", priority: "Critique", proof: "Hypothese", next: "Voir potentiel revenus" },
      { id: "inv-2", title: "Programme ONG", territory: "Mbour", owner: "Partenariats", status: "Pipeline", priority: "Haute", proof: "Conversation", next: "Filtrer segment" },
      { id: "inv-3", title: "Risque execution terrain", territory: "Joal", owner: "Produit", status: "A surveiller", priority: "Haute", proof: "Analyse", next: "Lire risques" }
    ],
    workflows: [
      { label: "These claire", status: "Termine" },
      { label: "Segments priorises", status: "En cours" },
      { label: "Data room", status: "A lancer" }
    ],
    actions: ["Ouvrir data room", "Filtrer payeurs", "Voir potentiel revenus", "Lire roadmap"],
    reports: [
      { title: "Investment memo", status: "Prete", audience: "Associe" },
      { title: "Roadmap scale", status: "En cours", audience: "Investisseur" }
    ],
    detailLabel: "Detail business",
    notePlaceholder: "Ajouter une note investisseur temporaire...",
    synthesis: "Memo simule: Mbambulaan est une infrastructure verticale avec plusieurs payeurs, data effects et pilotes territoriaux monetisables."
  }
];

export const privateTerritories = sharedTerritories;

export function getPrivateSpaceConfig(role: RoleKey) {
  return privateSpaceConfigs.find((space) => space.key === role) ?? privateSpaceConfigs[0];
}
