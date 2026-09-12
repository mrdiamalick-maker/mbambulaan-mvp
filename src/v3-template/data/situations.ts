// Données de démonstration — écran Situations. Copiées depuis le
// standalone V3.

export interface SituationSource { n: string; k: string; tg: string; tc: string }
export interface SituationTimelineEvent { d: string; t: string; tg: string; tc: string; who: string }
export interface SituationOption { t: string; k: string; reco: boolean }
export interface SituationAffected { n: string; k: string }

export interface Situation {
  id: number;
  terr: string;
  title: string;
  sev: "Critique" | "Élevé" | "Modéré";
  sevc: string;
  sevt: string;
  trust: "Déclarée" | "Observée" | "Vérifiée";
  tg: string;
  tc: string;
  since: string;
  stage: number; // 1 signal reçu, 2 en instruction, 3 qualifiée, 4 close avec preuve
  channel: string;
  progId: number;
  what: string;
  conseq: string;
  known: string[];
  unknown: string[];
  affected: SituationAffected[];
  timeline: SituationTimelineEvent[];
  sources: SituationSource[];
  sysSays: string;
  sysSuggests: string;
  options: SituationOption[];
}

export const STAGE_LAB = ["", "Signal reçu", "En instruction", "Qualifiée", "Close avec preuve"];

export const FUNNEL = [
  { label: "Signaux reçus", n: 132, pct: "100%", c: "#0B1A2A", read: "132 signaux reçus sur la période, tous canaux confondus." },
  { label: "Signaux qualifiés", n: 118, pct: "89%", c: "#B6522F", read: "14 signaux écartés : doublons, hors périmètre ou non localisables." },
  { label: "Situations suivies", n: 91, pct: "69%", c: "#DE9C74", read: "91 situations ouvertes sur la période ; 24 restent ouvertes aujourd’hui." },
  { label: "Closes avec preuve", n: 41, pct: "31%", c: "#7FB08A", read: "Seules 41 situations ont été closes avec une trace vérifiable. C’est le vrai indicateur de maturité." }
];

export const AGING = [
  { lab: "< 48 h", n: 6, c: "#9FB9CE" },
  { lab: "2–7 j", n: 9, c: "#DE9C74" },
  { lab: "1–3 sem.", n: 5, c: "#D89A4A" },
  { lab: "3–6 sem.", n: 3, c: "#C8452B" },
  { lab: "> 6 sem.", n: 1, c: "#8E2F1A" }
];

export const SITS: Situation[] = [
  {
    id: 0, terr: "Joal-Fadiouth", title: "Machine à glace indisponible au quai de Joal", sev: "Critique", sevc: "#C8452B", sevt: "#A63A22",
    trust: "Déclarée", tg: "○", tc: "#0B1A2A", since: "il y a 2 jours", stage: 1, channel: "Gestionnaire de quai · téléphone", progId: 0,
    what: "La machine à glace du quai est déclarée hors service depuis deux jours. Trois situations sont ouvertes sur le territoire et une sortie en mer est en cours : les prises attendues n’auront pas de capacité de conservation immédiate au débarquement.",
    conseq: "Une sortie en mer rentre cette nuit sans capacité de conservation disponible sur le site.",
    known: ["Panne déclarée par le gestionnaire du quai, réception horodatée le 7 septembre à 06 h 40.", "Deux capacités froides sur trois restent en service à Mbour, à 28 km.", "Une sortie en mer est en cours, retour attendu dans la nuit."],
    unknown: ["Nature exacte de la panne : aucune vérification technique effectuée.", "Volume attendu au retour de la sortie en mer.", "Disponibilité réelle de la capacité de Mbour au moment du débarquement."],
    affected: [{ n: "4", k: "organisations de mareyeurs" }, { n: "11", k: "capitaines rattachés au quai" }, { n: "1", k: "gestionnaire de capacité froide" }, { n: "2", k: "programmes concernés" }],
    timeline: [
      { d: "07 sept. 06:40", t: "Panne déclarée par le gestionnaire du quai", tg: "○", tc: "#0B1A2A", who: "Source déclarative" },
      { d: "07 sept. 09:15", t: "Situation ouverte automatiquement par recoupement avec 2 situations existantes", tg: "◐", tc: "#B6522F", who: "Système" },
      { d: "08 sept. 11:02", t: "Vérification terrain demandée au poste de quai", tg: "◐", tc: "#B6522F", who: "Coordination · Fatick" },
      { d: "09 sept. 07:30", t: "Sortie en mer signalée en cours, retour attendu dans la nuit", tg: "○", tc: "#0B1A2A", who: "Source déclarative" }
    ],
    sources: [
      { n: "Gestionnaire du quai de Joal", k: "Déclaration téléphonique · horodatée", tg: "○", tc: "#0B1A2A" },
      { n: "Poste de quai · Joal", k: "Vérification demandée, non encore reçue", tg: "○", tc: "rgba(11,26,42,.45)" },
      { n: "Diagnostic territorial · juin 2026", k: "Inventaire des capacités froides du site", tg: "●", tc: "#4E7B5A" }
    ],
    sysSays: "Trois signaux distincts portent sur la même chaîne de conservation à Joal-Fadiouth en 14 jours.",
    sysSuggests: "Faire qualifier la panne par le poste de quai avant toute mobilisation de capacité de remplacement.",
    options: [
      { t: "Demander une vérification terrain", k: "Recommandé — lève l’incertitude principale en 4 h", reco: true },
      { t: "Mobiliser une capacité de remplacement", k: "Engage un coût avant confirmation de la panne", reco: false },
      { t: "Organiser un délestage vers Mbour", k: "Dépend d’une capacité elle-même sous tension", reco: false },
      { t: "Reporter — information insuffisante", k: "La sortie en mer rentre cette nuit", reco: false }
    ]
  },
  {
    id: 1, terr: "Joal-Fadiouth", title: "Écart persistant entre heures de retour annoncées et constatées", sev: "Élevé", sevc: "#D89A4A", sevt: "#8E6420",
    trust: "Vérifiée", tg: "●", tc: "#4E7B5A", since: "il y a 3 jours", stage: 2, channel: "Relais de quai mandaté", progId: 4,
    what: "Les heures de retour annoncées par les capitaines et celles constatées au quai divergent de 60 à 120 minutes, ce qui désorganise la réception et la mise au froid.",
    conseq: "Sixième occurrence consécutive : la désorganisation de la réception devient structurelle.",
    known: ["Écart constaté sur 6 débarquements consécutifs, relevés au poste de quai.", "Le relais de quai est mandaté depuis juillet et opérationnel.", "Aucun incident de sécurité associé à ces retards."],
    unknown: ["Cause de l’écart : conditions en mer ou déclaration approximative au départ."],
    affected: [{ n: "6", k: "pirogues concernées" }, { n: "1", k: "poste de quai" }, { n: "4", k: "organisations de mareyeurs" }, { n: "1", k: "programme concerné" }],
    timeline: [
      { d: "28 août", t: "Premier écart relevé au poste de quai", tg: "◐", tc: "#B6522F", who: "Relais mandaté" },
      { d: "02 sept.", t: "Quatrième occurrence · situation requalifiée en récurrence", tg: "●", tc: "#4E7B5A", who: "Coordination · Fatick" },
      { d: "06 sept.", t: "Sixième occurrence confirmée, écart moyen 84 minutes", tg: "●", tc: "#4E7B5A", who: "Relais mandaté" }
    ],
    sources: [
      { n: "Relais de quai mandaté · Joal", k: "Relevés horodatés sur 6 débarquements", tg: "●", tc: "#4E7B5A" },
      { n: "Déclarations de départ des capitaines", k: "Déclaratif, non recoupé", tg: "○", tc: "#0B1A2A" }
    ],
    sysSays: "L’écart est confirmé par une source mandatée sur six occurrences : ce n’est plus un aléa.",
    sysSuggests: "Confirmer un protocole d’annonce du retour avec les capitaines et le quai.",
    options: [
      { t: "Valider le protocole d’annonce", k: "Recommandé — la récurrence est établie", reco: true },
      { t: "Demander un relevé complémentaire", k: "Six relevés concordants existent déjà", reco: false },
      { t: "Reporter d’une semaine", k: "Deux débarquements sont prévus d’ici là", reco: false }
    ]
  },
  {
    id: 2, terr: "Mbour", title: "Capacité froide sous tension après deux débarquements successifs", sev: "Élevé", sevc: "#D89A4A", sevt: "#8E6420",
    trust: "Observée", tg: "◐", tc: "#B6522F", since: "il y a 5 jours", stage: 2, channel: "Poste de quai", progId: 5,
    what: "Deux débarquements successifs ont saturé la chaîne du froid de Mbour. Une chambre froide sur trois est déclarée fragile par son gestionnaire et confirmée par le poste de quai.",
    conseq: "Mbour est aussi la capacité de repli désignée pour Joal-Fadiouth : sa marge tombe à une seule capacité.",
    known: ["Saturation observée au poste de quai sur deux jours consécutifs.", "Une capacité voisine est disponible à Popenguine, à 19 km.", "La fragilité de la troisième chambre est déclarée et confirmée au quai."],
    unknown: ["Durée de la tension : dépend des sorties en mer prévues.", "Coût d’un délestage vers Popenguine."],
    affected: [{ n: "7", k: "organisations de mareyeurs" }, { n: "3", k: "gestionnaires de froid" }, { n: "52", k: "acteurs actifs sur le site" }, { n: "3", k: "programmes concernés" }],
    timeline: [
      { d: "02 sept.", t: "Deux débarquements successifs relevés au quai", tg: "◐", tc: "#B6522F", who: "Poste de quai" },
      { d: "03 sept.", t: "Chambre froide déclarée fragile par son gestionnaire", tg: "○", tc: "#0B1A2A", who: "Source déclarative" },
      { d: "04 sept.", t: "Fragilité confirmée par le poste de quai", tg: "●", tc: "#4E7B5A", who: "Poste de quai" },
      { d: "07 sept.", t: "Joal désigne Mbour comme capacité de repli", tg: "◐", tc: "#B6522F", who: "Système" }
    ],
    sources: [
      { n: "Poste de quai · Mbour", k: "Observation directe sur 2 jours", tg: "◐", tc: "#B6522F" },
      { n: "Gestionnaire de chambre froide", k: "Déclaration de fragilité", tg: "○", tc: "#0B1A2A" },
      { n: "Inventaire froid · Popenguine", k: "Capacité disponible confirmée", tg: "●", tc: "#4E7B5A" }
    ],
    sysSays: "La capacité de repli de Joal est elle-même la capacité sous tension de Mbour.",
    sysSuggests: "Arbitrer un délestage temporaire vers Popenguine avant d’engager le repli de Joal.",
    options: [
      { t: "Autoriser le délestage vers Popenguine", k: "Recommandé — libère la marge avant le retour de Joal", reco: true },
      { t: "Prioriser la maintenance préventive", k: "Effet à 3 semaines, pas cette nuit", reco: false },
      { t: "Demander une vérification", k: "La fragilité est déjà confirmée au quai", reco: false }
    ]
  },
  {
    id: 3, terr: "Mbour", title: "Retard d’un partenaire sur le déploiement des immatriculations", sev: "Modéré", sevc: "#9FB9CE", sevt: "#4A6478",
    trust: "Observée", tg: "◐", tc: "#B6522F", since: "il y a 8 jours", stage: 2, channel: "Intelligence programme", progId: 1,
    what: "Le prestataire chargé de la saisie des dossiers d’immatriculation accuse trois semaines de retard sur Mbour, alors que les jalons administratifs du programme sont déclarés tenus.",
    conseq: "L’indicateur « dossiers incomplets requalifiés » stagne depuis trois semaines sans que le statut du programme change.",
    known: ["36 dossiers requalifiés contre 90 attendus à cette date.", "Les trois autres sites du programme sont à jour."],
    unknown: ["Cause du retard : capacité du prestataire ou qualité des dossiers reçus.", "Effet sur la date de revue territoriale du 30 septembre."],
    affected: [{ n: "1", k: "prestataire" }, { n: "54", k: "dossiers en attente" }, { n: "1", k: "jalon programme" }, { n: "1", k: "revue territoriale" }],
    timeline: [
      { d: "18 août", t: "Écart de saisie détecté par comparaison avec les 3 autres sites", tg: "◐", tc: "#B6522F", who: "Système" },
      { d: "25 août", t: "Relance du prestataire par la direction de programme", tg: "●", tc: "#4E7B5A", who: "Direction de programme" },
      { d: "01 sept.", t: "Aucune reprise constatée · situation maintenue ouverte", tg: "◐", tc: "#B6522F", who: "Système" }
    ],
    sources: [
      { n: "Suivi de saisie · programme pirogues", k: "Comparaison inter-sites", tg: "◐", tc: "#B6522F" },
      { n: "Prestataire de saisie", k: "Aucune réponse enregistrée", tg: "○", tc: "rgba(11,26,42,.45)" }
    ],
    sysSays: "Un jalon administratif tenu coexiste avec un indicateur de terrain stagnant depuis trois semaines.",
    sysSuggests: "Rapprocher ce retard du statut du programme avant la revue du 30 septembre.",
    options: [
      { t: "Inscrire à la revue du 30 septembre", k: "Recommandé — le sujet est administratif, pas urgent", reco: true },
      { t: "Requalifier le statut du programme", k: "Décision de direction de programme", reco: false },
      { t: "Clore — hors périmètre", k: "L’écart resterait invisible", reco: false }
    ]
  },
  {
    id: 4, terr: "Kayar", title: "Retour de pirogue retardé de 90 minutes", sev: "Élevé", sevc: "#D89A4A", sevt: "#8E6420",
    trust: "Déclarée", tg: "○", tc: "#0B1A2A", since: "il y a 3 jours", stage: 1, channel: "Téléphone · membre d’équipage", progId: 4,
    what: "Un retard de retour a été signalé par téléphone par un membre de l’équipage. Aucun relais de quai mandaté n’est en place à Kayar pour recouper l’information.",
    conseq: "Sans source secondaire, une alerte de sécurité ne peut être ni confirmée ni écartée.",
    known: ["Signal reçu par téléphone, horodaté.", "La pirogue est immatriculée et rattachée à une organisation connue."],
    unknown: ["Confirmation du retour effectif : aucune source secondaire.", "État de l’équipage et conditions en mer."],
    affected: [{ n: "1", k: "pirogue" }, { n: "7", k: "membres d’équipage" }, { n: "1", k: "organisation de rattachement" }, { n: "0", k: "relais mandaté sur le site" }],
    timeline: [
      { d: "06 sept. 19:20", t: "Signal reçu par téléphone", tg: "○", tc: "#0B1A2A", who: "Membre d’équipage" },
      { d: "06 sept. 21:00", t: "Aucune source secondaire disponible sur le site", tg: "○", tc: "rgba(11,26,42,.45)", who: "Système" }
    ],
    sources: [
      { n: "Membre d’équipage", k: "Déclaration téléphonique unique", tg: "○", tc: "#0B1A2A" },
      { n: "Registre d’immatriculation", k: "Rattachement confirmé", tg: "●", tc: "#4E7B5A" }
    ],
    sysSays: "Kayar est le seul foyer en reflux apparent, et le seul sans relais mandaté : la baisse peut être une perte de remontée.",
    sysSuggests: "Recouper la déclaration avec un relais territorial avant toute alerte.",
    options: [
      { t: "Mandater un relais de quai à Kayar", k: "Recommandé — traite la cause, pas l’occurrence", reco: true },
      { t: "Contacter l’organisation de rattachement", k: "Confirme ce cas, pas les suivants", reco: false },
      { t: "Clore sans suite", k: "Aucune confirmation n’a été obtenue", reco: false }
    ]
  },
  {
    id: 5, terr: "Hann", title: "Lectures de balance incohérentes sur trois pesées", sev: "Modéré", sevc: "#9FB9CE", sevt: "#4A6478",
    trust: "Observée", tg: "◐", tc: "#B6522F", since: "il y a 6 jours", stage: 2, channel: "Relais de quai mandaté", progId: 2,
    what: "Trois pesées consécutives présentent des écarts supérieurs à 8 % avec les volumes déclarés par les mareyeurs.",
    conseq: "Les écarts de pesée sont la première cause de litige commercial documentée sur le site.",
    known: ["Écarts relevés par le relais mandaté sur trois pesées.", "Un cas identique à Djiffer avait été résolu par recalibrage."],
    unknown: ["Origine de l’écart : matériel ou méthode de pesée."],
    affected: [{ n: "3", k: "pesées concernées" }, { n: "5", k: "organisations de mareyeurs" }, { n: "1", k: "balance de quai" }, { n: "1", k: "programme concerné" }],
    timeline: [
      { d: "03 sept.", t: "Premier écart relevé", tg: "◐", tc: "#B6522F", who: "Relais mandaté" },
      { d: "05 sept.", t: "Troisième écart · situation ouverte", tg: "◐", tc: "#B6522F", who: "Système" }
    ],
    sources: [
      { n: "Relais de quai mandaté · Hann", k: "Relevés de pesée", tg: "●", tc: "#4E7B5A" },
      { n: "Précédent Djiffer · 28 juillet", k: "Cas analogue résolu par recalibrage", tg: "●", tc: "#4E7B5A" }
    ],
    sysSays: "Un précédent documenté existe : le recalibrage a rétabli des lectures cohérentes à Djiffer en 48 h.",
    sysSuggests: "Appliquer le même recalibrage qu’à Djiffer et enregistrer la preuve au dossier.",
    options: [
      { t: "Programmer un recalibrage", k: "Recommandé — précédent documenté", reco: true },
      { t: "Demander une expertise externe", k: "Coût et délai sans précédent justificatif", reco: false }
    ]
  },
  {
    id: 6, terr: "Fass Boye", title: "Absence de capacité froide sur un site à forte activité", sev: "Élevé", sevc: "#D89A4A", sevt: "#8E6420",
    trust: "Vérifiée", tg: "●", tc: "#4E7B5A", since: "il y a 12 jours", stage: 3, channel: "Diagnostic territorial", progId: 7,
    what: "Le diagnostic territorial confirme qu’aucune capacité froide n’est disponible à Fass Boye alors que le site documente 37 débarquements sur 30 jours.",
    conseq: "Toute la production du site dépend d’un transport immédiat vers Kayar ou Mbour.",
    known: ["Absence confirmée lors du diagnostic de juin 2026.", "37 débarquements documentés sur 30 jours."],
    unknown: ["Volume effectivement perdu faute de conservation."],
    affected: [{ n: "24", k: "acteurs actifs" }, { n: "37", k: "débarquements sur 30 j" }, { n: "0", k: "capacité froide sur site" }, { n: "1", k: "programme concerné" }],
    timeline: [
      { d: "14 juin", t: "Absence confirmée au diagnostic territorial", tg: "●", tc: "#4E7B5A", who: "Diagnostic" },
      { d: "28 août", t: "Rattachée au programme Grande-Côte", tg: "●", tc: "#4E7B5A", who: "Direction de programme" }
    ],
    sources: [{ n: "Diagnostic territorial · juin 2026", k: "Vérification sur site", tg: "●", tc: "#4E7B5A" }],
    sysSays: "C’est une situation structurelle, pas un incident : elle relève d’un programme, pas d’un arbitrage d’urgence.",
    sysSuggests: "Traiter dans le cadre du programme Grande-Côte plutôt qu’en arbitrage.",
    options: [
      { t: "Maintenir dans le programme Grande-Côte", k: "Recommandé — nature structurelle", reco: true },
      { t: "Élever en arbitrage national", k: "Aucune décision immédiate ne changerait l’état", reco: false }
    ]
  },
  {
    id: 7, terr: "Cap Skirring", title: "Chambre froide déclarée fragile depuis six semaines", sev: "Modéré", sevc: "#9FB9CE", sevt: "#4A6478",
    trust: "Déclarée", tg: "○", tc: "#0B1A2A", since: "il y a 6 semaines", stage: 1, channel: "Gestionnaire · formulaire", progId: 3,
    what: "La seule capacité froide du site est déclarée fragile depuis six semaines sans qu’aucune vérification n’ait pu être organisée.",
    conseq: "Six semaines sans recoupement : la situation vieillit sans progresser.",
    known: ["Déclaration initiale du gestionnaire, reçue par formulaire."],
    unknown: ["État réel de la capacité.", "Pourquoi aucune vérification n’a été organisée."],
    affected: [{ n: "13", k: "acteurs actifs" }, { n: "1", k: "capacité froide" }, { n: "1", k: "programme concerné" }],
    timeline: [
      { d: "29 juil.", t: "Déclaration reçue par formulaire", tg: "○", tc: "#0B1A2A", who: "Gestionnaire" },
      { d: "09 sept.", t: "Situation signalée comme vieillissante par le système", tg: "◐", tc: "#B6522F", who: "Système" }
    ],
    sources: [{ n: "Gestionnaire de la capacité", k: "Formulaire · non recoupé", tg: "○", tc: "#0B1A2A" }],
    sysSays: "Six semaines sans recoupement sur une capacité unique : le risque n’est pas mesuré, il est ignoré.",
    sysSuggests: "Intégrer la vérification à la prochaine mission Casamance du programme.",
    options: [
      { t: "Rattacher à la mission Casamance", k: "Recommandé — sans coût de déplacement dédié", reco: true },
      { t: "Envoyer une mission dédiée", k: "Coût élevé pour une capacité unique", reco: false }
    ]
  }
];
