// Données de démonstration — écran Arbitrages. Copiées depuis le
// standalone V3.

export interface ArbOption { t: string; cost: string; pro: string; con: string }
export interface Arbitrage {
  due: string; urgency: string; dueC: string; title: string; meta: string; context: string;
  known: string[]; unknown: string[]; inaction: string; options: ArbOption[];
}

export const ARB: Arbitrage[] = [
  {
    due: "J−2", urgency: "avant vendredi", dueC: "#C8452B",
    title: "Mobiliser une capacité froide de remplacement à Joal",
    meta: "Joal-Fadiouth · chaîne du froid · 3 options",
    context: "La machine à glace du quai de Joal est déclarée hors service depuis deux jours et une sortie en mer rentre cette nuit. La décision porte sur l’engagement d’une capacité de remplacement avant que la panne ait été techniquement qualifiée.",
    known: ["Panne déclarée par le gestionnaire du quai, horodatée le 7 septembre.", "Deux capacités sur trois restent en service à Mbour, à 28 km.", "Une sortie en mer rentre dans la nuit."],
    unknown: ["Nature exacte de la panne — aucune vérification technique.", "Volume attendu au retour.", "Disponibilité réelle de Mbour au moment du débarquement."],
    inaction: "Les prises du retour de nuit arrivent sans capacité de conservation. La perte n’est pas quantifiable à l’avance, mais elle est certaine si le volume est significatif.",
    options: [
      { t: "Faire qualifier la panne avant tout engagement", cost: "délai 4 h · coût nul", pro: "Lève l’incertitude principale à temps si la vérification part ce matin. Évite d’engager un coût sur une panne peut-être mineure.", con: "Si le retour est plus précoce que prévu, la capacité de remplacement ne sera pas en place." },
      { t: "Mobiliser immédiatement une capacité mobile", cost: "≈ 1,2 M FCFA · 6 h", pro: "Garantit une capacité disponible au débarquement quel que soit l’état de la machine.", con: "Engage un coût sur une panne non qualifiée ; crée un précédent d’intervention sans vérification." },
      { t: "Organiser un délestage vers Mbour", cost: "transport ≈ 0,4 M FCFA", pro: "Utilise une capacité existante sans nouvel équipement.", con: "Mbour est déjà réduite à une seule capacité de marge : le délestage déplace le risque au lieu de le traiter." }
    ]
  },
  {
    due: "J−4", urgency: "cette semaine", dueC: "#D89A4A",
    title: "Autoriser le délestage temporaire Mbour → Popenguine",
    meta: "Petite-Côte · logistique · 3 options",
    context: "La chaîne du froid de Mbour est réduite à une capacité de marge alors qu’elle est aussi le repli désigné de Joal. Popenguine dispose d’une capacité confirmée disponible à 19 km.",
    known: ["Saturation observée au poste de quai de Mbour sur deux jours.", "Capacité disponible confirmée à Popenguine.", "Mbour est le repli désigné pour Joal depuis le 7 septembre."],
    unknown: ["Coût réel du transport quotidien vers Popenguine.", "Durée de la tension — dépend des sorties en mer."],
    inaction: "Mbour reste le repli de Joal sans marge propre. Un incident sur l’une des deux capacités restantes rendrait les deux sites simultanément vulnérables.",
    options: [
      { t: "Autoriser le délestage pour deux semaines", cost: "coût non estimé", pro: "Restaure une marge sur Mbour avant que le repli de Joal soit sollicité.", con: "Le coût de transport n’est pas chiffré : l’autorisation porte sur un montant inconnu." },
      { t: "Autoriser uniquement en cas de sollicitation du repli", cost: "coût conditionnel", pro: "N’engage la dépense que si le risque se matérialise.", con: "Le délai d’organisation du transport n’est pas compatible avec un débarquement de nuit." },
      { t: "Refuser et prioriser la maintenance de la capacité fragile", cost: "≈ 3 M FCFA · 3 semaines", pro: "Traite la cause structurelle plutôt que le symptôme.", con: "Aucun effet avant trois semaines ; ne répond pas à la situation de cette nuit." }
    ]
  },
  {
    due: "J−9", urgency: "avant la revue", dueC: "rgba(11,26,42,.6)",
    title: "Requalifier le statut du programme « Référentiel pirogues »",
    meta: "Portefeuille · 4 territoires · 3 options",
    context: "Le programme affiche 43 % d’avancement et des jalons administratifs tenus, alors que quatre signaux opérationnels restent ouverts et qu’un indicateur stagne depuis trois semaines. La décision porte sur ce que le portefeuille doit afficher avant la revue territoriale du 30 septembre.",
    known: ["Jalons administratifs tenus : déploiement effectué sur 4 sites.", "Les immatriculations vérifiées sont passées de 18 % à 43 %.", "Quatre signaux opérationnels ouverts, dont un retard prestataire de trois semaines."],
    unknown: ["Si le retard prestataire est ponctuel ou structurel.", "Effet réel sur la date de la revue du 30 septembre."],
    inaction: "Le programme reste affiché « en bonne voie » dans le portefeuille. La revue territoriale se tiendra sur une lecture que les signaux de terrain contredisent déjà.",
    options: [
      { t: "Requalifier en « attention » et documenter l’écart", cost: "sans coût · effet immédiat", pro: "Aligne l’affichage du portefeuille sur ce que le terrain remonte, avant la revue.", con: "Un statut dégradé sur un programme qui progresse réellement peut être mal interprété par les partenaires." },
      { t: "Maintenir le statut et traiter le retard prestataire séparément", cost: "sans coût", pro: "Évite de pénaliser un programme dont les jalons sont tenus.", con: "Le portefeuille continue d’afficher une trajectoire que quatre signaux contredisent." },
      { t: "Suspendre l’affichage du statut jusqu’à la revue", cost: "sans coût", pro: "Reconnaît explicitement que la lecture actuelle est insuffisante.", con: "Prive le portefeuille d’une lecture consolidée pendant trois semaines." }
    ]
  }
];
