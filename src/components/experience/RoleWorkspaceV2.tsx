import Link from "next/link";

export type RoleSlug = "etat" | "ong" | "collectivite" | "pecheur" | "mareyeur" | "exportateur" | "organisation" | "investisseur";

type Proof = "Déclaratif" | "Estimé" | "Validé" | "Système";
type Kpi = [label: string, value: string, detail: string];
type Point = [label: string, x: number, y: number, level: "stable" | "watch" | "high" | "critical"];
type Score = [label: string, value: number, detail: string];
type Signal = [time: string, title: string, source: string, proof: Proof];
type Action = [label: string, owner: string, impact: string, status: string];

export type RoleProfile = {
  slug: RoleSlug;
  label: string;
  shortLabel: string;
  scenario: string;
  promise: string;
  problem: string;
  value: string;
  previewKpis: string[];
  unlockLabel: string;
};

export type Workspace = {
  slug: RoleSlug;
  title: string;
  role: string;
  context: string;
  proof: Proof;
  status: string;
  headline: string;
  subhead: string;
  problem: string;
  kpis: Kpi[];
  points: Point[];
  signals: Signal[];
  scores: Score[];
  tableTitle: string;
  tableRows: string[][];
  actions: Action[];
  actors: string[];
  valueResult: string;
  limits: string[];
  primaryCta: string;
  secondaryCta: string;
};

const points: Point[] = [
  ["Joal", 44, 72, "critical"],
  ["Mbour", 52, 64, "high"],
  ["Kayar", 42, 35, "watch"],
  ["Dakar", 33, 47, "stable"]
];

const roleProfileRows: [RoleSlug, string, string, string, string, string, string, string[], string][] = [
  ["etat", "État / Ministère", "Ministère", "Arbitrer une tension territoriale à Joal", "Piloter les tensions, coordonner les programmes et produire une note exploitable.", "Les signaux terrain, demandes de financement et programmes actifs restent dispersés.", "Une décision institutionnelle mieux cadrée, avec preuve, limites et acteurs à mobiliser.", ["3 territoires suivis", "12 signaux qualifiés", "4 décisions prioritaires"], "Entrer dans l’espace ministère"],
  ["ong", "ONG / Programme", "Programme", "Piloter une action bailleur sans perdre la preuve terrain", "Relier bénéficiaires, actions, preuves et reporting prudent.", "Les actions existent, mais les preuves et zones prioritaires sont difficiles à lire.", "Un programme mieux ciblé, mieux documenté et plus défendable.", ["38 bénéficiaires", "6 preuves collectées", "1 rapport bailleur"], "Entrer dans l’espace programme"],
  ["collectivite", "Collectivité", "Commune", "Transformer un problème de quai en action locale", "Faire passer une tension locale vers une action communale suivable.", "La mairie voit les tensions mais manque d’un fil pour mobiliser et rendre compte.", "Une action locale plus légitime, visible et coordonnée.", ["1 quai prioritaire", "5 acteurs locaux", "2 actions ouvertes"], "Entrer dans l’espace collectivité"],
  ["pecheur", "Pêcheur", "Terrain", "Signaler un besoin sans dashboard complexe", "Utiliser relais quai, téléphone ou WhatsApp pour déclencher une coordination utile.", "Le pêcheur veut un retour clair, pas une interface lourde.", "Un signal suivi, une opportunité encadrée et une trace de confiance.", ["1 signal", "1 relais quai", "1 retour"], "Entrer dans l’espace pêcheur"],
  ["mareyeur", "Mareyeur", "Flux", "Organiser un flux produit avec moins d’incertitude", "Qualifier disponibilité, qualité, logistique et besoin acheteur.", "Le mareyeur agit vite avec des informations souvent partielles.", "Plus d’anticipation, moins de risque et une coordination mieux tracée.", ["3 lots", "2 besoins marché", "1 risque logistique"], "Entrer dans l’espace mareyeur"],
  ["exportateur", "Entreprise / Exportateur", "Entreprise", "Qualifier une opportunité sans marketplace publique", "Réduire l’incertitude commerciale par qualité, trace et risque.", "L’entreprise veut une opportunité qualifiée, pas des annonces brutes.", "Une décision commerciale plus sûre, avec conditions et limites visibles.", ["1 lot qualifié", "92% compatibilité", "2 limites de preuve"], "Entrer dans l’espace entreprise"],
  ["organisation", "Organisation professionnelle", "Organisation", "Structurer une demande collective finançable", "Regrouper les besoins membres et les transformer en dossier partenaire.", "Les demandes des membres sont nombreuses mais peu formalisables.", "Une organisation plus crédible, représentée et finançable.", ["24 membres", "7 besoins agrégés", "3 partenaires"], "Entrer dans l’espace organisation"],
  ["investisseur", "Investisseur", "Investisseur", "Comprendre la thèse infrastructure de Mbàmbulaan", "Lire les payeurs, flux de valeur, risques et trajectoire de scale.", "Il faut prouver que Mbàmbulaan n’est pas une application de niche.", "Une vision claire des segments payeurs et de la défensibilité produit.", ["8 segments payeurs", "3 flux de valeur", "5 risques suivis"], "Entrer dans l’espace investisseur"]
];

export const roleProfiles: RoleProfile[] = roleProfileRows.map(([slug, label, shortLabel, scenario, promise, problem, value, previewKpis, unlockLabel]) => ({
  slug: slug as RoleSlug,
  label,
  shortLabel,
  scenario,
  promise,
  problem,
  value,
  previewKpis,
  unlockLabel
}));

export const workspaces: Record<RoleSlug, Workspace> = {
  etat: {
    slug: "etat", title: "Cockpit institutionnel", role: "État / Ministère", context: "Joal / Petite-Côte", proof: "Système", status: "Simulation pilote",
    headline: "Prioriser, coordonner, prouver.", subhead: "Le ministère voit tensions, programmes actifs, demandes de financement et décision recommandée.",
    problem: "Joal concentre signaux de conservation, demandes d’équipement froid et risque de perte de valeur.",
    kpis: [["Territoires suivis", "03", "Joal, Kayar, Saint-Louis"], ["Signaux qualifiés", "12", "4 nécessitent arbitrage"], ["Demandes financement", "08", "froid, moteurs, qualité"], ["Décisions en attente", "04", "note prête à discuter"]],
    points, signals: [["08:10", "Risque de dégradation sur lot sensible", "Relais quai Joal", "Validé"], ["08:35", "Besoin froid remonté par mareyeurs", "Organisation locale", "Déclaratif"], ["09:20", "Financement groupable avec innovation froid", "Mbàmbulaan", "Estimé"]],
    scores: [["Priorité territoriale", 91, "tension forte à Joal"], ["Preuve disponible", 74, "système + validation partielle"], ["Coordination possible", 86, "acteurs identifiés"]],
    tableTitle: "Demandes de financement", tableRows: [["Unité glace quai", "Commune / GIE", "18 M FCFA", "prioritaire"], ["Caisses isothermes", "Mareyeurs", "6 M FCFA", "groupable"], ["Formation qualité", "ONG", "3 M FCFA", "programme actif"]],
    actions: [["Prioriser Joal", "Ministère", "Arbitrage territorial", "prêt"], ["Ouvrir coordination", "Commune", "Responsabilités claires", "à lancer"], ["Générer note ministre", "Mbàmbulaan", "Décision partageable", "prêt"]],
    actors: ["Ministère", "Commune de Joal", "Service pêche", "ONG partenaire", "Organisation professionnelle", "Mareyeurs"],
    valueResult: "Le ministère achète une capacité quotidienne de pilotage, coordination, priorisation, mémoire programme et preuve.",
    limits: ["Preuve système : signaux consolidés localement", "Impact estimé : protocole pilote requis", "À vérifier : volumes exacts, coûts et responsabilités"],
    primaryCta: "Cadrer un pilote institutionnel", secondaryCta: "Générer une note ministère"
  },
  ong: {
    slug: "ong", title: "Cockpit programme", role: "ONG / Programme", context: "Programme Petite-Côte", proof: "Estimé", status: "Reporting simulé",
    headline: "Prouver l’action sans surpromettre l’impact.", subhead: "L’espace programme relie bénéficiaires, actions terrain, preuves collectées et reporting bailleur.",
    problem: "Deux actions appuient les mêmes acteurs alors qu’un quai prioritaire manque encore de preuve terrain.",
    kpis: [["Programmes actifs", "04", "froid, qualité, formation"], ["Bénéficiaires suivis", "38", "GIE, mareyeurs, relais"], ["Preuves collectées", "06", "photos, signal, validation"], ["Actions terrain", "11", "dont 4 en attente"]],
    points, signals: [["08:30", "Besoin formation qualité confirmé", "Animatrice terrain", "Validé"], ["09:15", "Doublon possible avec appui froid", "Tableau programme", "Système"], ["10:05", "Preuve bénéficiaire incomplète", "Relais local", "Déclaratif"]],
    scores: [["Ciblage", 83, "zone prioritaire claire"], ["Preuve bailleur", 68, "preuves partielles"], ["Risque doublon", 76, "deux actions proches"]],
    tableTitle: "Portefeuille programme", tableRows: [["Formation qualité", "Joal", "validée", "maintenir"], ["Équipement froid", "Mbour", "estimée", "réorienter"], ["Relais données", "Foundiougne", "déclarative", "vérifier"]],
    actions: [["Réorienter une action", "Chef programme", "Moins de doublons", "recommandé"], ["Demander preuve terrain", "Relais local", "Reporting plus solide", "à faire"], ["Coordonner avec collectivité", "ONG", "Action plus légitime", "prêt"]],
    actors: ["ONG", "Bailleur", "Relais terrain", "Collectivité", "GIE local", "Mbàmbulaan"],
    valueResult: "L’ONG paie pour mieux cibler, prouver, éviter les doublons et rendre compte.",
    limits: ["Preuves terrain partielles", "Impact estimé tant que le protocole n’est pas signé", "Bénéficiaires à confirmer par liste terrain"],
    primaryCta: "Préparer une démo programme", secondaryCta: "Générer un reporting bailleur"
  },
  collectivite: {
    slug: "collectivite", title: "Cockpit collectivité", role: "Collectivité", context: "Commune de Joal", proof: "Validé", status: "Action locale simulée",
    headline: "Transformer un problème local en action économique.", subhead: "La mairie voit tensions du quai, acteurs à mobiliser et partenaires possibles.",
    problem: "Le quai demande froid, organisation et visibilité sur les partenaires mobilisables.",
    kpis: [["Quais suivis", "02", "Joal et point secondaire"], ["Acteurs locaux", "57", "pêcheurs, mareyeurs, GIE"], ["Actions en cours", "03", "froid, quai, formation"], ["Partenaires", "05", "ONG, État, privé"]],
    points, signals: [["08:40", "Demande de réunion quai", "Relais local", "Déclaratif"], ["09:10", "Besoin froid confirmé", "GIE", "Validé"], ["10:30", "Partenaire technique disponible", "Mbàmbulaan", "Système"]],
    scores: [["Urgence locale", 88, "besoin récurrent"], ["Acteurs mobilisables", 82, "coalition possible"], ["Valeur publique", 79, "service et revenus"]],
    tableTitle: "Pipeline action communale", tableRows: [["Réunion quai", "Service pêche", "coordination", "prêt"], ["Unité froid", "ONG / État", "revenu local", "à cadrer"], ["Note maire", "Mbàmbulaan", "décision", "prête"]],
    actions: [["Créer action communale", "Mairie", "Service visible", "prêt"], ["Mobiliser partenaire", "Adjoint économie", "Financement ciblé", "à lancer"], ["Préparer note maire", "Mbàmbulaan", "Décision partageable", "prêt"]],
    actors: ["Mairie", "Relais quai", "GIE", "Service pêche", "ONG partenaire", "Mareyeurs"],
    valueResult: "La collectivité gagne en légitimité, coordination locale, visibilité et capacité à attirer des partenaires.",
    limits: ["Preuve locale simulée", "Besoin de validation conseil municipal", "Revenus potentiels à confirmer"],
    primaryCta: "Lancer un territoire pilote", secondaryCta: "Préparer une note maire"
  },
  pecheur: {
    slug: "pecheur", title: "Parcours pêcheur assisté", role: "Pêcheur", context: "Relais quai Joal", proof: "Déclaratif", status: "Parcours assisté",
    headline: "Un signal simple, un retour clair.", subhead: "Le pêcheur utilise relais, WhatsApp ou appel pour déclencher une coordination.",
    problem: "Un lot et un besoin d’appui froid doivent être signalés sans perdre du temps.",
    kpis: [["Signaux déclarés", "04", "lots, froid, moteur"], ["Demandes suivies", "03", "financement, glace, débouché"], ["Opportunités reçues", "02", "via relais"], ["Confiance", "78", "historique simulé"]],
    points, signals: [["06:50", "Disponibilité sardinelle annoncée", "Appel relais", "Déclaratif"], ["07:15", "Besoin glace confirmé", "Relais quai", "Validé"], ["08:05", "Retour mareyeur possible", "Mbàmbulaan", "Système"]],
    scores: [["Simplicité", 94, "canal assisté"], ["Suivi", 76, "retour visible"], ["Confiance", 78, "historique en construction"]],
    tableTitle: "Suivi simple de demandes", tableRows: [["Disponibilité lot", "appel", "qualifié", "mareyeur contacté"], ["Besoin glace", "WhatsApp", "en coordination", "commune alertée"], ["Moteur", "relais", "à vérifier", "organisation informée"]],
    actions: [["Signaler disponibilité", "Pêcheur", "Visibilité lot", "ouvert"], ["Contacter relais", "Relais quai", "Qualification rapide", "prêt"], ["Recevoir opportunité", "Mbàmbulaan", "Mise en relation encadrée", "simulé"]],
    actors: ["Pêcheur", "Relais quai", "Mareyeur", "Organisation", "Animatrice", "Mbàmbulaan"],
    valueResult: "Le pêcheur gagne accompagnement, suivi, accès progressif aux opportunités et futurs services.",
    limits: ["Signal déclaratif au départ", "Validation relais nécessaire", "Pas de dashboard pêcheur complet au MVP"],
    primaryCta: "Activer un relais quai", secondaryCta: "Inclure dans un pilote"
  },
  mareyeur: {
    slug: "mareyeur", title: "Cockpit mareyeur", role: "Mareyeur", context: "Flux Joal → Dakar", proof: "Système", status: "Opportunité encadrée",
    headline: "Organiser un flux avant qu’il devienne un risque.", subhead: "Le mareyeur voit produits disponibles, qualité, logistique, prix indicatif et action.",
    problem: "Un lot sensible peut répondre à un besoin, mais logistique et qualité doivent être encadrées.",
    kpis: [["Produits disponibles", "03", "sardinelle, dorade, thiof"], ["Besoins marché", "05", "Dakar et Mbour"], ["Risque qualité", "Moyen", "délai + froid"], ["Prix indicatif", "820", "FCFA/kg simulé"]],
    points, signals: [["07:40", "Lot sensible disponible à Joal", "Relais quai", "Validé"], ["08:10", "Besoin marché Dakar détecté", "Mareyeur", "Déclaratif"], ["08:45", "Transport à confirmer", "Logistique", "Estimé"]],
    scores: [["Compatibilité", 89, "besoin proche"], ["Risque logistique", 62, "transport à confirmer"], ["Confiance", 81, "historique positif"]],
    tableTitle: "Portefeuille produits", tableRows: [["Sardinelle", "1,2 t", "à traiter vite", "organiser flux"], ["Dorade", "460 kg", "frais", "surveiller"], ["Thiof", "180 kg", "premium", "qualifier prix"]],
    actions: [["Organiser flux", "Mareyeur", "Moins d’incertitude", "prêt"], ["Demander transport", "Transporteur", "Délai sécurisé", "à confirmer"], ["Suivre qualité", "Relais quai", "Risque réduit", "en cours"]],
    actors: ["Mareyeur", "Pêcheur", "Transporteur", "Acheteur", "Relais quai", "Mbàmbulaan"],
    valueResult: "Le mareyeur paie pour l’anticipation, la réduction du risque et la crédibilité commerciale.",
    limits: ["Qualité estimée sans contrôle officiel", "Transport à confirmer", "Prix indicatif mocké"],
    primaryCta: "Ouvrir un espace professionnel", secondaryCta: "Demander coordination transport"
  },
  exportateur: {
    slug: "exportateur", title: "Cockpit entreprise", role: "Entreprise / Exportateur", context: "Opportunité qualifiée", proof: "Système", status: "Qualification commerciale",
    headline: "Réduire l’incertitude avant engagement.", subhead: "L’entreprise voit qualité, trace, fournisseurs potentiels, conditions et risques sans marketplace brute.",
    problem: "Un acheteur veut évaluer un lot et son risque supply avant relation commerciale.",
    kpis: [["Opportunités qualifiées", "04", "dont 1 prioritaire"], ["Lots suivis", "09", "trace système"], ["Score qualité", "87", "frais, délai, froid"], ["Risques ouverts", "02", "transport, preuve"]],
    points, signals: [["09:30", "Opportunité lot Joal détectée", "Mbàmbulaan", "Système"], ["09:45", "Trace lot partielle", "Relais quai", "Validé"], ["10:10", "Condition logistique non confirmée", "Transport", "Estimé"]],
    scores: [["Compatibilité", 92, "besoin et lot alignés"], ["Trace", 71, "partielle"], ["Risque supply", 64, "transport ouvert"]],
    tableTitle: "Pipeline opportunités", tableRows: [["Lot sardinelle Joal", "87", "trace partielle", "vérifier"], ["Dorade Mbour", "91", "trace système", "qualifier"], ["Thiof Dakar", "78", "à compléter", "attendre"]],
    actions: [["Qualifier opportunité", "Entreprise", "Moins d’incertitude", "prêt"], ["Demander preuve", "Relais qualité", "Décision plus solide", "à faire"], ["Lancer coordination", "Mbàmbulaan", "Relation encadrée", "prêt"]],
    actors: ["Entreprise", "Exportateur", "Mareyeur", "Relais qualité", "Transporteur", "Mbàmbulaan"],
    valueResult: "L’entreprise paie pour réduire l’incertitude commerciale et qualifier une relation avant engagement.",
    limits: ["Trace système non officielle", "Qualité à confirmer", "Conditions commerciales non contractuelles"],
    primaryCta: "Qualifier une opportunité export", secondaryCta: "Demander preuve complémentaire"
  },
  organisation: {
    slug: "organisation", title: "Cockpit organisation", role: "Organisation professionnelle", context: "GIE et réseau local", proof: "Validé", status: "Structuration simulée",
    headline: "Passer de demandes dispersées à un dossier collectif.", subhead: "L’organisation voit membres, besoins récurrents, preuves et partenaires mobilisables.",
    problem: "Les membres demandent froid, financement moteur et formation, mais rien n’est encore défendable collectivement.",
    kpis: [["Membres recensés", "24", "12 actifs cette semaine"], ["Demandes collectives", "07", "froid, moteur, formation"], ["Partenaires cibles", "03", "commune, ONG, État"], ["Preuves", "05", "signaux et validations"]],
    points, signals: [["08:25", "Besoins froid regroupables", "Membres GIE", "Déclaratif"], ["09:35", "Partenaire intéressé par dossier", "Mbàmbulaan", "Système"], ["10:50", "Registre membres incomplet", "Bureau GIE", "Validé"]],
    scores: [["Représentativité", 80, "membres recensés"], ["Finançabilité", 84, "besoin groupé"], ["Preuve", 65, "registre incomplet"]],
    tableTitle: "Demandes collectives", tableRows: [["Froid", "14 membres", "partielle", "Commune / ONG"], ["Moteurs", "8 membres", "déclarative", "État"], ["Formation", "18 membres", "validée", "Programme"]],
    actions: [["Créer demande collective", "Bureau", "Dossier défendable", "prêt"], ["Mettre à jour registre", "Organisation", "Preuve renforcée", "à faire"], ["Associer partenaire", "Mbàmbulaan", "Financement ciblé", "recommandé"]],
    actors: ["Bureau GIE", "Membres", "Commune", "ONG", "Service pêche", "Mbàmbulaan"],
    valueResult: "L’organisation devient un interlocuteur crédible, finançable et mieux représenté.",
    limits: ["Registre membres incomplet", "Besoins déclaratifs à valider", "Partenaires non engagés"],
    primaryCta: "Structurer un pilote organisation", secondaryCta: "Générer une note partenaire"
  },
  investisseur: {
    slug: "investisseur", title: "Cockpit investisseur", role: "Investisseur", context: "Thèse infrastructure", proof: "Estimé", status: "Data room simulée",
    headline: "Une infrastructure verticale, pas une application de niche.", subhead: "L’espace investisseur rend visibles segments payeurs, flux de valeur, risques et trajectoire.",
    problem: "Il faut prouver que Mbàmbulaan peut vendre plusieurs services autour d’une même couche de coordination.",
    kpis: [["Segments payeurs", "08", "État, ONG, entreprises"], ["Flux de valeur", "03", "donnée, coordination, preuve"], ["Territoires pilotes", "02", "Joal, Kayar"], ["Risques suivis", "05", "usage, preuve, terrain"]],
    points, signals: [["09:00", "Intérêt institutionnel sur pilote", "Pipeline commercial", "Déclaratif"], ["09:40", "Cas d’usage ONG validable", "Discovery produit", "Validé"], ["10:20", "Wedge entreprise à tester", "Mbàmbulaan", "Estimé"]],
    scores: [["Défensibilité", 82, "données + réseau humain"], ["Monétisation", 77, "plusieurs payeurs"], ["Risque exécution", 69, "terrain et preuve"]],
    tableTitle: "Matrice payeurs", tableRows: [["État", "pilotage + preuve", "cycle long", "licence / pilote"], ["ONG", "reporting + ciblage", "budget programme", "forfait"], ["Entreprise", "qualification supply", "preuve qualité", "abonnement"]],
    actions: [["Voir thèse", "CEO", "Alignement investissement", "prêt"], ["Analyser payeurs", "Équipe", "Priorisation commerciale", "en cours"], ["Demander data room", "Investisseur", "Diligence", "disponible"]],
    actors: ["État", "ONG", "Collectivités", "Entreprises", "Organisations", "Équipe Mbàmbulaan"],
    valueResult: "L’investisseur comprend pourquoi Mbàmbulaan peut devenir une infrastructure verticale avec plusieurs payeurs.",
    limits: ["Hypothèses commerciales explicites", "Traction à prouver par pilotes", "Risque terrain central"],
    primaryCta: "Ouvrir une session investisseur", secondaryCta: "Demander la data room"
  }
};

const aliases: Record<string, RoleSlug> = { entreprise: "exportateur", "acteur-terrain": "pecheur" };
export function getWorkspace(slug: string) { return workspaces[(aliases[slug] ?? slug) as RoleSlug] ?? workspaces.etat; }

const levelClass: Record<Point[3], string> = { stable: "bg-[#2f9e73]", watch: "bg-[#e6b84f]", high: "bg-[#e87c45]", critical: "bg-[#c64d4d]" };
const proofClass: Record<Proof, string> = { Déclaratif: "bg-[#eef2f3] text-[#405158]", Estimé: "bg-[#fff1d4] text-[#6a4a00]", Validé: "bg-[#e4f6ee] text-[#17624a]", Système: "bg-[#e3f3f8] text-[#0d5970]" };

function ProofBadge({ proof }: { proof: Proof }) {
  return <span className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${proofClass[proof]}`}>{proof}</span>;
}

export function RoleWorkspace({ slug }: { slug: string }) {
  const ws = getWorkspace(slug);

  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#112f36]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black text-[#102f3a]"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#102f3a] text-sm text-white">Mb</span><span>{ws.role}</span></Link>
        <nav className="hidden items-center gap-6 text-sm font-black text-[#50636a] md:flex"><Link href="/demo">Changer de rôle</Link><Link href="/devis">Cadrer l’offre</Link></nav>
        <ProofBadge proof={ws.proof} />
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#0d6f8d]">{ws.context}</p><h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.055em] text-[#102f3a] sm:text-7xl">{ws.headline}</h1><p className="mt-5 text-lg font-bold leading-8 text-[#52656f]">{ws.subhead}</p></div>
          <div className="rounded-[2rem] border border-[#d9e4e6] bg-white p-6 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Problème actif</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">{ws.title}</h2><p className="mt-4 text-base font-bold leading-7 text-[#52656f]">{ws.problem}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-[#eef5f5] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#102f3a]">{ws.status}</span><ProofBadge proof={ws.proof} /></div></div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{ws.kpis.map(([label, value, detail]) => <article key={label} className="rounded-[1.5rem] border border-[#d9e4e6] bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">{label}</p><p className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">{value}</p><p className="mt-2 text-sm font-semibold leading-6 text-[#60727a]">{detail}</p></article>)}</div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Vue territoire</p><h2 className="mt-2 text-2xl font-black text-[#102f3a]">{ws.context}</h2><div className="relative mt-5 min-h-[20rem] overflow-hidden rounded-[1.6rem] bg-[#e8efea]"><div className="absolute left-[30%] top-[12%] h-[78%] w-[38%] rounded-[50%] border border-[#94aaa8] bg-[#f8fbf8]" />{ws.points.map(([label, x, y, level]) => <div key={label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}><span className={`block h-4 w-4 rounded-full border-2 border-white shadow-lg ${levelClass[level]}`} /><span className="mt-2 block rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#102f3a] shadow-sm">{label}</span></div>)}</div></article>
        <article className="rounded-[2rem] bg-[#102f3a] p-5 text-white shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Signaux actifs</p><h2 className="mt-2 text-2xl font-black">Ce que Mbàmbulaan qualifie</h2><div className="mt-5 grid gap-3">{ws.signals.map(([time, title, source, proof]) => <div key={title} className="rounded-2xl bg-white/10 p-4"><div className="flex justify-between gap-3"><span className="text-sm font-black text-white/50">{time}</span><ProofBadge proof={proof} /></div><h3 className="mt-2 text-base font-black">{title}</h3><p className="mt-2 text-xs font-bold text-white/60">{source}</p></div>)}</div></article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Intelligence Mbàmbulaan</p><h2 className="mt-2 text-2xl font-black text-[#102f3a]">Diagnostic et priorisation</h2><div className="mt-5 grid gap-4">{ws.scores.map(([label, value, detail]) => <div key={label}><div className="mb-2 flex justify-between gap-4"><div><strong className="block text-sm text-[#102f3a]">{label}</strong><span className="text-xs font-bold text-[#6b7b82]">{detail}</span></div><span className="text-xl font-black text-[#0d6f8d]">{value}%</span></div><div className="h-3 overflow-hidden rounded-full bg-[#e7eeee]"><div className="h-full rounded-full bg-[#0d6f8d]" style={{ width: `${value}%` }} /></div></div>)}</div></article>
        <article className="overflow-hidden rounded-[2rem] border border-[#d9e4e6] bg-white shadow-xl"><div className="p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Données mockées</p><h2 className="mt-2 text-2xl font-black text-[#102f3a]">{ws.tableTitle}</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-left text-sm"><tbody>{ws.tableRows.map((row) => <tr key={row.join("-")} className="border-t border-[#edf2f3]">{row.map((cell) => <td key={cell} className="px-5 py-4 font-bold text-[#33484f]">{cell}</td>)}</tr>)}</tbody></table></div></article>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8"><div className="rounded-[2rem] bg-[#102f3a] p-5 text-white shadow-2xl md:p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Actions possibles</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">File de coordination</h2><div className="mt-6 grid gap-3">{ws.actions.map(([label, owner, impact, status]) => <div key={label} className="grid gap-3 rounded-2xl bg-white/10 p-4 md:grid-cols-[1fr_0.8fr_0.8fr_auto] md:items-center"><strong>{label}</strong><span className="text-sm font-bold text-white/70">{owner}</span><span className="text-sm font-bold text-white/70">{impact}</span><span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-white/70">{status}</span></div>)}</div></div></section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-6 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Acteurs à coordonner</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">Un espace métier, pas une page narrative.</h2><div className="mt-5 flex flex-wrap gap-2">{ws.actors.map((actor) => <span key={actor} className="rounded-full bg-[#edf4f4] px-3 py-2 text-xs font-black text-[#102f3a]">{actor}</span>)}</div></article>
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-6 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Résultat de valeur</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">Pourquoi ce rôle paierait</h2><p className="mt-4 text-base font-bold leading-7 text-[#52656f]">{ws.valueResult}</p><div className="mt-6 grid gap-3">{ws.limits.map((limit) => <div key={limit} className="rounded-2xl bg-[#fff4dc] p-4 text-sm font-bold leading-6 text-[#4f3c12]">{limit}</div>)}</div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/devis" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-center text-sm font-black text-white">{ws.primaryCta}</Link><Link href="/demande-demo" className="rounded-full border border-[#cbd9dc] bg-white px-6 py-4 text-center text-sm font-black text-[#102f3a]">{ws.secondaryCta}</Link></div></article>
      </section>
    </main>
  );
}
