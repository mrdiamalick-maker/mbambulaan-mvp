export const situationStatuses = [
  "Reçu",
  "En cours d’examen",
  "Pris en charge",
  "Intervention prévue",
  "Intervention en cours",
  "En attente",
  "Réglé"
] as const;

export type SituationStatus = (typeof situationStatuses)[number];
export type Urgency = "Faible" | "Modérée" | "Élevée";
export type HistoryKind = "création" | "examen" | "affectation" | "planification" | "intervention" | "attente" | "résultat" | "clôture";

export type SituationHistory = {
  id: string;
  at: string;
  label: string;
  detail: string;
  author: string;
  kind: HistoryKind;
};

export type Situation = {
  id: string;
  title: string;
  description: string;
  site: string;
  urgency: Urgency;
  reportedAt: string;
  reportedBy: string;
  reporterContact: string;
  concernedActors: string[];
  status: SituationStatus;
  coordinator?: string;
  qualificationNote?: string;
  responsible?: string;
  responsibleContact?: string;
  plannedAction?: string;
  dueAt?: string;
  waitingReason?: string;
  resultNote?: string;
  completedAt?: string;
  confirmation?: string;
  resultRecorded?: boolean;
  nextStep: string;
  nextActor: string;
  nextDue: string;
  history: SituationHistory[];
};

export type NewSituationInput = {
  type: string;
  site: string;
  description: string;
  urgency: Urgency;
  reportedBy: string;
  reporterContact: string;
  attachmentName?: string;
};

export const DEMO_SITUATION_ID = "MBA-2026-001";
export const DEMO_STORAGE_KEY = "mbambulaan-coordination-demo-v1";
export const DEMO_DATE_LABEL = "24 juillet 2026";

const history = (
  id: string,
  at: string,
  label: string,
  detail: string,
  author: string,
  kind: HistoryKind
): SituationHistory => ({ id, at, label, detail, author, kind });

const primarySituation: Situation = {
  id: DEMO_SITUATION_ID,
  title: "Machine à glace en panne",
  description:
    "La machine à glace ne produit plus depuis ce matin. Les pêcheurs et mareyeurs risquent de ne pas pouvoir conserver les produits débarqués.",
  site: "Quai de débarquement de Mbao",
  urgency: "Élevée",
  reportedAt: "2026-07-24T08:10:00+00:00",
  reportedBy: "Ibrahima Sarr — Gestionnaire du site",
  reporterContact: "+221 77 000 00 10",
  concernedActors: ["Pêcheurs", "Mareyeurs", "Gestionnaire du site"],
  status: "Reçu",
  coordinator: "Awa Diop — Coordination locale",
  nextStep: "Comprendre la situation et vérifier les informations remontées",
  nextActor: "Awa Diop — Coordination locale",
  nextDue: "Aujourd’hui, 09:00",
  history: [
    history("hist-001", "08:10", "Difficulté remontée", "Le gestionnaire signale l’arrêt de la machine à glace.", "Ibrahima Sarr", "création"),
    history("hist-002", "08:18", "Situation reçue", "La coordination locale a reçu la remontée.", "Mbàmbulaan", "création")
  ]
};

const secondarySituations: Situation[] = [
  {
    ...primarySituation,
    id: "MBA-2026-002",
    title: "Accès au quai temporairement bloqué",
    description: "Un véhicule immobilisé gêne l’accès principal au quai.",
    site: "Quai de débarquement de Hann",
    urgency: "Modérée",
    reportedBy: "Fatou Fall — Mareyeuse",
    status: "En cours d’examen",
    qualificationNote: "Accès logistique perturbé, circulation piétonne maintenue.",
    nextStep: "Confirmer la durée probable du blocage",
    nextActor: "Coordination locale de Hann",
    nextDue: "Aujourd’hui, 10:30",
    history: [history("hist-101", "08:42", "Examen commencé", "La coordination vérifie l’accès secondaire.", "Coordination locale de Hann", "examen")]
  },
  {
    ...primarySituation,
    id: "MBA-2026-003",
    title: "Rupture de caisses de manutention",
    description: "Le stock de caisses propres est insuffisant pour la matinée.",
    site: "Quai de débarquement de Joal-Fadiouth",
    urgency: "Élevée",
    reportedBy: "GIE des mareyeurs de Joal",
    status: "Pris en charge",
    responsible: "Seynabou Ba — Gestion des équipements",
    responsibleContact: "+221 77 000 00 30",
    nextStep: "Organiser l’acheminement de 80 caisses depuis le dépôt communal",
    nextActor: "Seynabou Ba — Gestion des équipements",
    nextDue: "Aujourd’hui, 11:00",
    history: [history("hist-201", "07:55", "Responsable désignée", "Le dépôt communal prépare les caisses.", "Coordination locale", "affectation")]
  },
  {
    ...primarySituation,
    id: "MBA-2026-004",
    title: "Nettoyage renforcé de l’aire de débarquement",
    description: "Une intervention complémentaire est programmée après la marée.",
    site: "Quai de débarquement de Soumbédioune",
    urgency: "Modérée",
    reportedBy: "Comité de gestion du quai",
    status: "Intervention prévue",
    responsible: "Équipe communale d’assainissement",
    responsibleContact: "+221 33 000 00 40",
    plannedAction: "Nettoyer et désinfecter l’aire nord après le dernier débarquement.",
    dueAt: "2026-07-24T17:00:00+00:00",
    nextStep: "Démarrer le nettoyage à la fin des débarquements",
    nextActor: "Équipe communale d’assainissement",
    nextDue: "Aujourd’hui, 17:00",
    history: [history("hist-301", "09:05", "Intervention organisée", "L’équipe communale confirme son passage à 17:00.", "Coordination locale", "planification")]
  },
  {
    ...primarySituation,
    id: "MBA-2026-005",
    title: "Remise en service du point d’eau",
    description: "Le robinet principal est en cours de remplacement.",
    site: "Quai de débarquement de Kayar",
    urgency: "Élevée",
    reportedBy: "Poste local reconnu de Kayar",
    status: "Intervention en cours",
    responsible: "Ousmane Diouf — Service hydraulique",
    responsibleContact: "+221 77 000 00 50",
    plannedAction: "Remplacer le robinet et vérifier la pression du réseau.",
    dueAt: "2026-07-24T13:30:00+00:00",
    nextStep: "Terminer le remplacement puis vérifier le débit",
    nextActor: "Ousmane Diouf — Service hydraulique",
    nextDue: "Aujourd’hui, 13:30",
    history: [history("hist-401", "10:15", "Intervention démarrée", "Le service hydraulique remplace le robinet principal.", "Ousmane Diouf", "intervention")]
  },
  {
    ...primarySituation,
    id: "MBA-2026-006",
    title: "Chambre froide indisponible",
    description: "Le redémarrage est suspendu dans l’attente d’un composant électrique.",
    site: "Quai de débarquement de Saint-Louis",
    urgency: "Élevée",
    reportedBy: "Coopérative du quai",
    status: "En attente",
    responsible: "Service technique territorial",
    responsibleContact: "+221 77 000 00 60",
    plannedAction: "Remplacer le contacteur électrique et tester la chambre froide.",
    dueAt: "2026-07-24T15:00:00+00:00",
    waitingReason: "Pièce électrique en cours d’acheminement depuis Dakar.",
    nextStep: "Réceptionner le contacteur et reprendre l’intervention",
    nextActor: "Service technique territorial",
    nextDue: "Aujourd’hui, 15:00",
    history: [history("hist-501", "11:05", "Intervention mise en attente", "Le contacteur nécessaire n’est pas disponible sur place.", "Service technique territorial", "attente")]
  },
  {
    ...primarySituation,
    id: "MBA-2026-007",
    title: "Éclairage de sécurité rétabli",
    description: "Deux projecteurs ont été remplacés sur l’accès au quai.",
    site: "Quai de débarquement de Mbour",
    urgency: "Modérée",
    reportedBy: "Comité local de sécurité",
    status: "Réglé",
    responsible: "Équipe électrique communale",
    responsibleContact: "+221 77 000 00 70",
    plannedAction: "Remplacer les projecteurs défectueux et tester l’éclairage.",
    dueAt: "2026-07-24T07:30:00+00:00",
    resultNote: "Les deux projecteurs sont fonctionnels et l’accès est de nouveau éclairé.",
    completedAt: "2026-07-24T07:18:00+00:00",
    confirmation: "Compte rendu d’intervention signé par le gestionnaire du site.",
    resultRecorded: true,
    nextStep: "Aucune action requise — situation réglée",
    nextActor: "Aucun",
    nextDue: "Terminé à 07:18",
    history: [history("hist-601", "07:18", "Situation réglée", "Le gestionnaire confirme le fonctionnement des deux projecteurs.", "Coordination locale", "clôture")]
  }
];

export const initialSituations: Situation[] = [primarySituation, ...secondarySituations];

export function cloneInitialSituations(): Situation[] {
  return structuredClone(initialSituations);
}

export function appendHistory(
  situation: Situation,
  entry: Omit<SituationHistory, "id">
): Situation {
  return {
    ...situation,
    history: [...situation.history, { ...entry, id: `${situation.id}-${situation.history.length + 1}` }]
  };
}

export function validateSituation(situation: Situation): string[] {
  const errors: string[] = [];
  if (situation.status !== "Réglé" && (!situation.nextStep || !situation.nextActor || !situation.nextDue)) {
    errors.push("Une situation non réglée doit avoir une prochaine étape, un acteur et une échéance.");
  }
  if (["Pris en charge", "Intervention prévue", "Intervention en cours", "En attente", "Réglé"].includes(situation.status) && !situation.responsible) {
    errors.push("Une situation prise en charge doit avoir un responsable.");
  }
  if (["Intervention prévue", "Intervention en cours", "En attente", "Réglé"].includes(situation.status) && !situation.dueAt) {
    errors.push("Une intervention prévue doit avoir une échéance.");
  }
  if (situation.status === "En attente" && !situation.waitingReason) {
    errors.push("Une situation en attente doit avoir un motif.");
  }
  if (
    situation.status === "Réglé" &&
    (!situation.resultNote || !situation.completedAt || !situation.confirmation)
  ) {
    errors.push("Une situation réglée doit avoir un résultat, une date de fin et un élément de confirmation.");
  }
  return errors;
}

export function getStatusIndex(status: SituationStatus): number {
  return situationStatuses.indexOf(status);
}

export function formatDateTime(value?: string): string {
  if (!value) return "Non renseigné";
  return new Intl.DateTimeFormat("fr-SN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dakar"
  }).format(new Date(value));
}

export function computeDecisionMetrics(situations: Situation[]) {
  const active = situations.filter((item) => item.status !== "Réglé");
  return {
    total: situations.length,
    active: active.length,
    critical: active.filter((item) => item.urgency === "Élevée").length,
    waiting: active.filter((item) => item.status === "En attente").length,
    solved: situations.filter((item) => item.status === "Réglé").length,
    unassigned: active.filter((item) => !item.responsible).length,
    dueToday: active.filter((item) => Boolean(item.dueAt)).length
  };
}
