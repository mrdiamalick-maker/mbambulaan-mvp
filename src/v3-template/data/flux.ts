// Données de démonstration — écran Flux entrant et écran Sources.
// Copiées depuis le standalone V3.

export interface FluxMatch { k: string; v: string }
export interface FluxAction { l: string; e: string }
export interface FluxItem {
  id: number; channel: string; chanC: string; title: string; terr: string; from: string;
  age: string; received: string; ageC: string; raw: string;
  matched: FluxMatch[]; missing: string[]; hasDup: boolean; dup: string; actions: FluxAction[];
}

export const FLUX: FluxItem[] = [
  {
    id: 0, channel: "Terrain", chanC: "#B6522F", title: "Chambre froide du quai en difficulté", terr: "Mbour", from: "Relais de quai mandaté",
    age: "2 h", received: "aujourd’hui 06:12", ageC: "rgba(11,26,42,.6)",
    raw: "« La chambre froide 3 tourne mal depuis le débarquement d’hier soir. Le gestionnaire dit que c’est le compresseur. Deux mareyeurs ont dû laisser des lots dehors ce matin. »",
    matched: [{ k: "Territoire", v: "Mbour" }, { k: "Capacité", v: "Chambre froide 3 · privée" }, { k: "Émetteur", v: "Relais mandaté · vérifié" }],
    missing: ["Nombre et volume des lots concernés", "Confirmation technique du diagnostic compresseur"],
    hasDup: true, dup: "Une situation ouverte le 3 septembre porte déjà sur la tension de la chaîne du froid de Mbour. Cet élément peut la compléter plutôt que créer un doublon.",
    actions: [
      { l: "Rattacher à la situation existante", e: "L’élément rejoint la situation « Capacité froide sous tension » à Mbour, dont il devient la quatrième source. Le niveau de connaissance de cette situation passe d’observée à vérifiée." },
      { l: "Ouvrir une nouvelle situation", e: "Une situation distincte est créée. Le recoupement détecté reste enregistré mais n’est pas appliqué — le motif de ce choix sera demandé." },
      { l: "Demander un complément", e: "Une demande de précision est envoyée au relais mandaté. L’élément reste dans le flux entrant, avec son ancienneté visible." },
      { l: "Écarter", e: "L’élément est écarté avec motif obligatoire. Il reste consultable et compté dans les statistiques du flux, mais n’alimente aucun tableau de bord." }
    ]
  },
  {
    id: 1, channel: "Contribution publique", chanC: "#4A6478", title: "Signalement de pollution près du quai", terr: "Hann", from: "Formulaire public · non identifié",
    age: "5 h", received: "aujourd’hui 03:40", ageC: "rgba(11,26,42,.6)",
    raw: "« Il y a une nappe sombre dans l’eau du côté du quai depuis hier. Ça sent fort. Personne ne fait rien. »",
    matched: [{ k: "Territoire", v: "Hann · probable" }, { k: "Émetteur", v: "Non identifié" }],
    missing: ["Localisation précise", "Toute confirmation par une source secondaire", "Périmètre : Mbàmbulaan suit l’économie maritime, pas la qualité de l’eau"],
    hasDup: false, dup: "",
    actions: [
      { l: "Transférer hors périmètre", e: "L’élément est orienté vers l’autorité compétente en matière d’environnement. Le transfert est tracé ; Mbàmbulaan n’en tire aucun constat." },
      { l: "Demander un complément", e: "Impossible : l’émetteur n’est pas identifié et aucun canal de retour n’existe. C’est la limite structurelle des contributions anonymes." },
      { l: "Écarter", e: "L’élément est écarté pour hors-périmètre, avec motif. Il reste consultable dans l’historique du flux." }
    ]
  },
  {
    id: 2, channel: "Partenaire", chanC: "#8E6420", title: "Notification de retard de livraison d’équipement", terr: "4 territoires", from: "Teranga Data · prestataire",
    age: "1 j", received: "hier 14:05", ageC: "rgba(11,26,42,.6)",
    raw: "« Suite à un retard fournisseur, la livraison des terminaux de saisie prévue le 12 septembre est reportée au 3 octobre. Les sites de Mbour et Rufisque sont concernés. »",
    matched: [{ k: "Programme", v: "Référentiel pirogues" }, { k: "Partenaire", v: "Teranga Data · exécution" }, { k: "Territoires", v: "Mbour, Rufisque-Bargny" }],
    missing: ["Effet sur le jalon de revue territoriale du 30 septembre"],
    hasDup: true, dup: "Une situation ouverte le 1er septembre porte déjà sur le retard de ce prestataire à Mbour. Ce retard de livraison en est probablement une cause.",
    actions: [
      { l: "Qualifier en intelligence programme", e: "L’élément rejoint l’onglet « Réalité et intelligence » du programme Référentiel pirogues, catégorie dépendance partenaire. Il ne devient pas un signal de terrain : il n’émane pas du territoire." },
      { l: "Rattacher à la situation existante", e: "L’élément documente la cause du retard déjà constaté à Mbour. La situation change de niveau : d’écart observé à cause identifiée." },
      { l: "Demander un complément", e: "Une demande est envoyée au prestataire sur l’effet du report sur le jalon du 30 septembre. L’élément reste dans le flux." },
      { l: "Écarter", e: "L’élément est écarté avec motif. Le retard partenaire n’apparaîtra dans aucune vue du programme." }
    ]
  },
  {
    id: 3, channel: "Terrain", chanC: "#B6522F", title: "Retour de pirogue non confirmé", terr: "Kayar", from: "Téléphone · membre d’équipage",
    age: "3 j", received: "6 sept. 19:20", ageC: "#D89A4A",
    raw: "« La pirogue de Modou n’est pas rentrée à l’heure prévue. On n’a pas de nouvelles depuis ce matin. »",
    matched: [{ k: "Territoire", v: "Kayar" }, { k: "Actif", v: "Pirogue immatriculée · rattachée" }],
    missing: ["Toute source secondaire — aucun relais mandaté à Kayar", "Confirmation du retour effectif"],
    hasDup: false, dup: "",
    actions: [
      { l: "Ouvrir une situation", e: "Une situation de niveau élevé est ouverte, explicitement marquée « déclarée, non recoupée ». Son ancienneté de trois jours sans confirmation devient visible dans le suivi." },
      { l: "Demander un complément", e: "Une demande est adressée à l’organisation de rattachement. Sans relais mandaté sur le site, c’est le seul recoupement possible." },
      { l: "Écarter", e: "Écarter un signal de sécurité sans confirmation exige un motif renforcé et une validation par un second agent." }
    ]
  },
  {
    id: 4, channel: "Formulaire", chanC: "#4A6478", title: "Déclaration de nouvelle capacité de transformation", terr: "Kafountine", from: "Groupement de transformatrices",
    age: "4 j", received: "5 sept. 10:30", ageC: "#D89A4A",
    raw: "« Notre groupement a mis en service une unité de séchage supplémentaire en août. Capacité estimée 400 kg par jour. Nous souhaitons être enregistrées. »",
    matched: [{ k: "Territoire", v: "Kafountine" }, { k: "Programme", v: "Transformation · Casamance" }, { k: "Organisation", v: "Groupement connu · équipé en juin" }],
    missing: ["Vérification sur site de la capacité annoncée", "Date exacte de mise en service"],
    hasDup: false, dup: "",
    actions: [
      { l: "Intégrer au référentiel comme déclarée", e: "La capacité rejoint l’inventaire territorial avec le niveau « déclarée, non recoupée ». Elle apparaît dans l’Atlas, marquée comme telle, et sera vérifiée à la prochaine mission Casamance." },
      { l: "Demander un complément", e: "Une demande de justificatif est envoyée au groupement avant intégration. L’élément reste dans le flux." },
      { l: "Écarter", e: "La déclaration est écartée avec motif. La capacité restera invisible dans l’inventaire." }
    ]
  },
  {
    id: 5, channel: "Relais", chanC: "#B6522F", title: "Écart de pesée répété sur trois lots", terr: "Hann", from: "Relais de quai mandaté",
    age: "6 j", received: "3 sept. 08:15", ageC: "#C8452B",
    raw: "« Troisième fois cette semaine : la balance affiche 8 à 11 % de moins que ce que déclarent les mareyeurs. Même sur des lots que j’ai vus peser ailleurs avant. »",
    matched: [{ k: "Territoire", v: "Hann" }, { k: "Capacité", v: "Balance de quai" }, { k: "Émetteur", v: "Relais mandaté · vérifié" }, { k: "Précédent", v: "Djiffer · 28 juillet" }],
    missing: ["Origine de l’écart : matériel ou méthode"],
    hasDup: true, dup: "Un cas analogue à Djiffer a été résolu par recalibrage le 28 juillet, avec preuve enregistrée. Le précédent est directement réutilisable.",
    actions: [
      { l: "Ouvrir une situation avec le précédent rattaché", e: "La situation est ouverte avec le cas de Djiffer en pièce jointe. La suggestion de recalibrage est proposée d’emblée, avec sa preuve d’efficacité." },
      { l: "Demander un complément", e: "Trois relevés concordants d’une source mandatée existent déjà. Une demande supplémentaire retarderait de six jours de plus." },
      { l: "Écarter", e: "Écarter un relevé d’une source mandatée exige un motif explicite." }
    ]
  }
];

export const STAGE_DEFS = [
  { k: "received", label: "Reçu", n: 34, def: "Arrivé dans le système, non encore examiné par un agent.", c: "rgba(11,26,42,.55)" },
  { k: "review", label: "À qualifier", n: 11, def: "Examiné, en attente d’une décision de qualification.", c: "#B6522F" },
  { k: "qualified", label: "Qualifié", n: 76, def: "Devenu situation, capacité, acteur ou intelligence programme.", c: "#4E7B5A" },
  { k: "rejected", label: "Écarté", n: 14, def: "Écarté avec motif — consultable, jamais supprimé.", c: "rgba(11,26,42,.4)" }
] as const;

export const SOURCES = [
  { n: "Relais de quai mandatés", state: "Connectée", c: "#4E7B5A", what: "Relevés horodatés de débarquements, pesées et heures de retour, produits par des personnes mandatées sur quatre quais.", effect: "C’est la seule source qui permet de faire passer un signal de « déclaré » à « vérifié ». Elle couvre 4 sites sur 18." },
  { n: "Formulaires et contributions", state: "Connectée", c: "#4E7B5A", what: "Déclarations d’acteurs, contributions publiques, signalements téléphoniques transcrits.", effect: "Alimente l’essentiel du volume reçu, mais ne produit jamais seule un fait vérifié." },
  { n: "Système budgétaire du ministère", state: "Non connectée", c: "#C8452B", what: "Engagements, mandatements et exécution budgétaire des programmes.", effect: "Tous les montants du portefeuille proviennent de saisies manuelles. Un écart entre le système et Mbàmbulaan ne serait pas détecté." },
  { n: "Registre national des immatriculations", state: "Non connectée", c: "#C8452B", what: "Référentiel officiel des pirogues et embarcations enregistrées.", effect: "Le taux d’immatriculation vérifiée est calculé sur un dénominateur estimé, pas sur le registre officiel." },
  { n: "Systèmes de suivi des navires", state: "Non envisagée à ce stade", c: "rgba(11,26,42,.4)", what: "Positions et activités de la pêche industrielle et des navires sous licence.", effect: "La pêche industrielle est entièrement absente de Mbàmbulaan. Aucune lecture du produit ne la couvre." },
  { n: "Référentiels institutionnels", state: "En discussion", c: "#D89A4A", what: "Découpage administratif, organisations enregistrées, données de référence du ministère.", effect: "Les référentiels sont aujourd’hui maintenus à la main dans Mbàmbulaan, avec un risque de divergence dans le temps." }
];
