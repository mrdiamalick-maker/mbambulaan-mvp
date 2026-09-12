// Données de démonstration — écran Brief. Copiées depuis le standalone V3.

export interface HotSpot {
  name: string;
  color: string;
  n: string;
  trend: string;
  up: boolean;
  reading: string;
}

export const HOT: HotSpot[] = [
  {
    name: "Joal-Fadiouth", color: "#E05A3C", n: "9 signaux", trend: "↑ +4", up: true,
    reading: "Trois situations ouvertes se recoupent à Joal-Fadiouth et une capacité froide essentielle est indisponible depuis 48 heures. C’est le seul territoire où plusieurs signaux critiques portent sur la même chaîne de conservation."
  },
  {
    name: "Mbour", color: "#E0A455", n: "7 signaux", trend: "↑ +2", up: true,
    reading: "Mbour absorbe une partie du report de Joal alors qu’une de ses trois chambres froides est déjà déclarée fragile. Le territoire fonctionne, mais sa marge est réduite à une seule capacité disponible."
  },
  {
    name: "Kayar", color: "#E0A455", n: "5 signaux", trend: "↓ −1", up: false,
    reading: "Kayar est le seul foyer en reflux, mais aucun relais de quai n’y est mandaté : la baisse observée peut traduire une amélioration réelle comme une perte de remontée d’information."
  }
];

export interface AttentionItem {
  title: string;
  terr: string;
  age: string;
  sev: string;
  sevc: string;
  sevt: string;
  trust: string;
  tg: string;
  tc: string;
  sit: number;
  whyNow: string;
  known: string[];
  unknown: string[];
  next: string;
}

export const ATTN: AttentionItem[] = [
  {
    title: "Machine à glace indisponible au quai de Joal depuis 48 heures", terr: "Joal-Fadiouth", age: "signalé il y a 2 jours",
    sev: "Conséquence imminente", sevc: "#C8452B", sevt: "#A63A22", trust: "Déclarée, non recoupée", tg: "○", tc: "#0B1A2A", sit: 0,
    whyNow: "Une sortie en mer rentre cette nuit sans capacité de conservation.",
    known: ["Panne déclarée par le gestionnaire du quai, réception horodatée.", "Deux capacités froides sur trois restent en service à Mbour, à 28 km.", "Une sortie en mer est en cours, retour attendu dans la nuit."],
    unknown: ["Nature exacte de la panne : aucune vérification technique effectuée.", "Volume attendu au retour de la sortie en mer."],
    next: "Le système propose une vérification terrain avant toute mobilisation de capacité de remplacement."
  },
  {
    title: "Écart persistant entre heures de retour annoncées et constatées", terr: "Joal-Fadiouth", age: "observé sur 6 débarquements",
    sev: "Effet cumulatif", sevc: "#D89A4A", sevt: "#8E6420", trust: "Vérifiée", tg: "●", tc: "#4E7B5A", sit: 1,
    whyNow: "Sixième occurrence consécutive : ce n’est plus un aléa.",
    known: ["Écart de 60 à 120 minutes relevé au poste de quai sur 6 débarquements.", "Le relais de quai est mandaté depuis juillet et opérationnel."],
    unknown: ["Cause de l’écart : conditions en mer ou déclaration approximative au départ."],
    next: "Un protocole d’annonce du retour peut être confirmé avec les capitaines et le quai."
  },
  {
    title: "Chaîne du froid de Mbour réduite à une seule capacité de marge", terr: "Mbour", age: "observé depuis 5 jours",
    sev: "Fragilité structurelle", sevc: "#D89A4A", sevt: "#8E6420", trust: "Observée", tg: "◐", tc: "#B6522F", sit: 2,
    whyNow: "Mbour est aussi la capacité de repli désignée pour Joal.",
    known: ["Saturation observée au poste de quai sur deux jours consécutifs.", "Une capacité voisine est disponible à Popenguine, à 19 km."],
    unknown: ["Durée de la tension : dépend des sorties en mer prévues.", "Coût d’un délestage vers Popenguine."],
    next: "Un arbitrage de délestage temporaire est en attente de décision."
  },
  {
    title: "Le programme « Référentiel pirogues » avance sans que les signaux suivent", terr: "4 territoires", age: "écart depuis 3 semaines",
    sev: "Écart réel / déclaré", sevc: "#B6522F", sevt: "#B6522F", trust: "Observée", tg: "◐", tc: "#B6522F", sit: 3,
    whyNow: "Avancement à 43 % mais 4 signaux opérationnels non traités.",
    known: ["Jalons administratifs tenus : déploiement effectué sur 4 sites.", "Les immatriculations vérifiées sont passées de 18 % à 43 %."],
    unknown: ["Pourquoi les dossiers incomplets requalifiés stagnent depuis trois semaines.", "Si le retard d’un partenaire affecte déjà le terrain."],
    next: "Le programme peut être ouvert pour comparer trajectoire administrative et signaux reçus."
  }
];

export const BRIEF_DEC = [
  { dueN: "2", dueU: "jours", dueC: "#C8452B", title: "Mobiliser une capacité froide de remplacement à Joal", meta: "Arbitrage · qualification terrain requise avant décision" },
  { dueN: "4", dueU: "jours", dueC: "#D89A4A", title: "Autoriser le délestage temporaire Mbour → Popenguine", meta: "Arbitrage · coût non estimé" },
  { dueN: "9", dueU: "jours", dueC: "rgba(11,26,42,.6)", title: "Instruire le financement du volet froid Petite-Côte", meta: "Programme · 80 M FCFA identifiés, 0 confirmé" }
];

export const BRIEF_PROG = [
  { id: 1, title: "Référentiel progressif des pirogues", pct: "43%", alert: "4 signaux opérationnels contredisent le statut « en bonne voie »", alertC: "#B6522F" },
  { id: 0, title: "Résilience de la chaîne du froid · Petite-Côte", pct: "56%", alert: "Bloqué au financement depuis 6 semaines", alertC: "#C8452B" },
  { id: 2, title: "Qualité et flux · Cap-Vert", pct: "68%", alert: "Aucun écart détecté entre exécution et terrain", alertC: "#4E7B5A" }
];

export const BLIND = [
  { n: "01", t: "Aucun relais de quai mandaté sur 14 des 18 sites : les signaux y restent déclaratifs." },
  { n: "02", t: "Les volumes débarqués ne sont mesurés qu’à Djiffer, Mbour et Hann. Ailleurs, ils sont estimés." },
  { n: "03", t: "Le système ne reçoit rien de la pêche industrielle ni des navires étrangers sous licence." },
  { n: "04", t: "Aucune donnée budgétaire n’est connectée : les montants proviennent de saisies manuelles." }
];
