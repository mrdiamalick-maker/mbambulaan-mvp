import Link from "next/link";

type Space = {
  title: string;
  subtitle: string;
  problem: string;
  promise: string;
  cockpit: string[];
  signals: string[];
  decisions: string[];
  services: string[];
  value: string;
  limit: string;
  offer: string;
};

const spaces: Record<string, Space> = {
  etat: {
    title: "Espace État / Ministère",
    subtitle: "Outil d'aide à la décision institutionnelle",
    problem: "Le ministère voit des rapports, mais pas toujours les tensions réelles, les besoins agrégés, les demandes de financement, les programmes actifs et les innovations au même endroit.",
    promise: "Mbàmbulaan devient la couche quotidienne de coordination : lire, prioriser, arbitrer, suivre, justifier.",
    cockpit: ["KPIs filière agrégés", "Carte territoires / quais", "Tensions et conflits", "Demandes de financement", "Programmes et innovations", "Intégrations outils existants"],
    signals: ["Hausse tension mareyeurs / transformateurs", "Besoin froid récurrent à Joal", "Programme partenaire en chevauchement", "Demande financement groupée", "Innovation locale à qualifier"],
    decisions: ["Prioriser un territoire", "Mandater une mission", "Financer un besoin critique", "Coordonner un partenaire", "Produire une note ministre"],
    services: ["Cockpit institutionnel", "Observatoire filière", "Registre programmes", "Hub financement", "Rapport décisionnel"],
    value: "Le ministère ne subit plus les informations dispersées. Il dispose d'une mémoire opérationnelle et d'un outil de pilotage quotidien.",
    limit: "Mbàmbulaan ne remplace pas les systèmes publics. Il coordonne les données disponibles et indique le niveau de confiance.",
    offer: "Pilote ministère + convention données + territoire démonstrateur."
  },
  ong: {
    title: "Espace ONG / Programme",
    subtitle: "Suivi programme, preuve et reporting bailleur",
    problem: "Les programmes financent des actions mais peinent à éviter les doublons, cibler les bons bénéficiaires, prouver l'utilité et ajuster vite.",
    promise: "Mbàmbulaan relie zones, bénéficiaires, actions, preuves, risques et reporting.",
    cockpit: ["Portefeuille programmes", "Zones d'intervention", "Bénéficiaires", "Actions terrain", "Preuves", "Impact estimé"],
    signals: ["Bénéficiaires non couverts", "Doublon intervention", "Retard terrain", "Preuve manquante", "Risque d'acceptation locale"],
    decisions: ["Réorienter une action", "Choisir un territoire", "Appuyer un groupe", "Documenter une preuve", "Préparer reporting"],
    services: ["Suivi programme", "Ciblage bénéficiaires", "Preuve impact", "Reporting bailleur", "Coordination partenaires"],
    value: "Le programme devient plus lisible, mieux documenté et plus facile à défendre auprès d'un bailleur.",
    limit: "L'impact est estimé, pas présenté comme officiel sans protocole d'évaluation.",
    offer: "Forfait programme + reporting + accompagnement terrain."
  },
  collectivite: {
    title: "Espace Collectivité",
    subtitle: "Territorialisation, revenus locaux et services utiles",
    problem: "La collectivité est proche des quais mais manque d'un outil simple pour comprendre l'économie locale, mobiliser les acteurs et montrer son utilité.",
    promise: "Mbàmbulaan aide la mairie à passer de l'observation à l'action locale mesurable.",
    cockpit: ["Quais et sites", "Acteurs économiques", "Problèmes prioritaires", "Opportunités locales", "Revenus potentiels", "Partenaires"],
    signals: ["Besoin équipement froid", "Conflit usage espace quai", "Opportunité transformation", "Demande financement", "Action communale bloquée"],
    decisions: ["Lancer une action", "Mobiliser un partenaire", "Prioriser un quai", "Créer un service", "Présenter une note conseil"],
    services: ["Tableau territorial", "Carte acteurs", "Suivi action", "Note maire", "Recherche financement"],
    value: "La collectivité gagne un rôle économique concret : organiser, faciliter, connecter et rendre compte.",
    limit: "L'espace doit rester simple : peu de communes peuvent absorber un outil lourd.",
    offer: "Convention territoire + appui opérationnel."
  },
  pecheur: {
    title: "Parcours Pêcheur assisté",
    subtitle: "Relais terrain plutôt que dashboard complet",
    problem: "Le pêcheur veut vendre mieux, financer, sécuriser et diversifier. Un espace web complet risque d'être peu utilisé au MVP.",
    promise: "Mbàmbulaan passe d'abord par relais quai, pêcheurs référents, WhatsApp, téléphone et déclaration assistée.",
    cockpit: ["Disponibilité", "Signal problème", "Demande financement", "Statut", "Opportunité encadrée", "Historique confiance"],
    signals: ["Produit disponible", "Besoin financement", "Problème moteur", "Besoin glace", "Diversification souhaitée"],
    decisions: ["Déclarer un signal", "Suivre le statut", "Demander un relais", "Accepter une opportunité", "Construire confiance"],
    services: ["Déclaration assistée", "Relais quai", "Statut signal", "Financement", "Retour coordination"],
    value: "Le pêcheur bénéficie de la coordination sans porter la complexité numérique.",
    limit: "Décision produit : pas de grand dashboard pêcheur individualisé avant preuve d'usage.",
    offer: "Pilote quai + relais Mbàmbulaan + inclusion progressive."
  },
  mareyeur: {
    title: "Espace Mareyeur",
    subtitle: "Flux, qualité, logistique et anticipation",
    problem: "Le mareyeur gère flux, achats, prix, qualité et acheteurs. Il peut capter une vraie valeur d'un espace professionnel.",
    promise: "Mbàmbulaan donne visibilité et coordination sans ouvrir une marketplace publique.",
    cockpit: ["Produits disponibles", "Besoins marché", "Prix indicatifs", "Qualité", "Logistique", "Historique confiance"],
    signals: ["Lot disponible", "Besoin acheteur", "Risque qualité", "Transport à organiser", "Besoin fonds de roulement"],
    decisions: ["Prioriser un produit", "Contacter un acheteur", "Sécuriser qualité", "Organiser logistique", "Demander financement"],
    services: ["Portefeuille produits", "Matching encadré", "Alertes qualité", "Coordination transport", "Financement court terme"],
    value: "Le mareyeur gagne en anticipation, crédibilité et capacité de coordination.",
    limit: "À monétiser après validation terrain du comportement d'usage.",
    offer: "Compte professionnel mareyeur + services de coordination."
  },
  exportateur: {
    title: "Espace Entreprise / Exportateur",
    subtitle: "Opportunités qualifiées, trace et risque",
    problem: "L'entreprise ne veut pas une vitrine. Elle veut réduire l'incertitude sur qualité, disponibilité, trace, risque et conditions.",
    promise: "Mbàmbulaan qualifie les opportunités et organise la relation commerciale avec prudence.",
    cockpit: ["Produits qualifiés", "Besoins marché", "Qualité", "Trace", "Risque supply", "Conditions"],
    signals: ["Opportunité compatible", "Preuve qualité partielle", "Risque rupture", "Besoin coordination", "Acteur à vérifier"],
    decisions: ["Suivre une opportunité", "Demander preuve", "Coordonner achat", "Accepter risque", "Préparer contrat"],
    services: ["Portefeuille opportunités", "Qualité / trace", "Données marché", "Coordination achat", "Suivi risque"],
    value: "L'entreprise achète de la réduction d'incertitude, pas un simple accès à des annonces.",
    limit: "Pas de marketplace self-service. Les opportunités restent qualifiées et encadrées.",
    offer: "Abonnement entreprise + frais de coordination qualifiée."
  },
  organisation: {
    title: "Espace Organisation professionnelle",
    subtitle: "Structurer les membres et parler aux partenaires",
    problem: "Une organisation peut représenter beaucoup d'acteurs sans disposer d'une base membres, de demandes agrégées ou de preuves solides.",
    promise: "Mbàmbulaan transforme l'organisation en interlocuteur crédible.",
    cockpit: ["Registre membres", "Besoins agrégés", "Demandes collectives", "Actions", "Partenaires", "Preuves"],
    signals: ["Demande récurrente", "Membre prioritaire", "Action partenaire", "Besoin plaidoyer", "Preuve manquante"],
    decisions: ["Quelle demande porter", "Qui prioriser", "Quel partenaire viser", "Quelle preuve présenter", "Quelle action suivre"],
    services: ["Registre", "Demandes collectives", "Plaidoyer", "Actions partenaires", "Preuves"],
    value: "L'organisation devient structurée, lisible et finançable.",
    limit: "Commencer simple : appui structuration avant digitalisation lourde.",
    offer: "Pilote organisation + accompagnement structuration."
  },
  investisseur: {
    title: "Espace Investisseur",
    subtitle: "Thèse infrastructure et trajectoire économique",
    problem: "L'investisseur doit comprendre pourquoi Mbàmbulaan peut devenir une infrastructure, pas une application de niche.",
    promise: "L'espace montre payeurs, flux de valeur, risques, traction et trajectoire.",
    cockpit: ["Segments payeurs", "Flux de valeur", "Pilotes", "Risques", "Unit economics", "Traction"],
    signals: ["Sponsor ministère", "Programme finançable", "Usage mareyeur", "Donnée stratégique", "Risque adoption"],
    decisions: ["Qui paie", "Qu'est-ce qui scale", "Quel risque", "Quel jalon", "Quel financement"],
    services: ["Mémo investisseur", "Traction pilote", "Business model", "Risques", "Scénarios"],
    value: "L'investisseur voit la logique d'écosystème, pas seulement des écrans.",
    limit: "Hypothèses explicites. Pas de fausse traction.",
    offer: "Session investisseur + data room produit."
  }
};

export function RoleWorkspace({ slug }: { slug: string }) {
  const ws = spaces[slug] ?? spaces.etat;
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><Link href="/" className="font-black">Mbàmbulaan</Link><nav className="hidden gap-6 text-sm font-bold text-[#425662] md:flex"><Link href="/demo">Démo</Link><Link href="/devis">Devis</Link></nav></header>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">{ws.subtitle}</p><h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">{ws.title}</h1><p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">{ws.problem}</p><p className="mt-5 rounded-3xl bg-white p-5 text-base font-bold leading-7 text-[#0d3b4c] shadow-sm">{ws.promise}</p></div>
        <div className="rounded-[2rem] bg-[#0d3b4c] p-6 text-white shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Cockpit de valeur</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{ws.cockpit.map((item)=><div key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-black">{item}</div>)}</div></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-3"><Panel title="Signaux que l'espace révèle" items={ws.signals} /><Panel title="Décisions rendues possibles" items={ws.decisions} dark /><Panel title="Services Mbàmbulaan" items={ws.services} /></section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]"><article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Valeur pour le payeur</p><h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">Pourquoi l'acquisition se justifie</h2><p className="mt-4 text-base font-semibold leading-7 text-[#52656f]">{ws.value}</p></article><article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><h2 className="text-2xl font-black text-[#0d3b4c]">Preuve, limite et offre</h2><p className="mt-4 text-sm font-semibold leading-6 text-[#52656f]">{ws.limit}</p><p className="mt-5 rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">{ws.offer}</p><div className="mt-6 flex flex-col gap-3"><Link href="/demande-demo" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-center text-sm font-black text-white">Demander une démo complète</Link><Link href="/devis" className="rounded-full border border-[#d8e1e5] bg-white px-6 py-4 text-center text-sm font-black text-[#0d3b4c]">Cadrer l'offre</Link></div></article></section>
    </main>
  );
}

function Panel({ title, items, dark = false }: { title: string; items: string[]; dark?: boolean }) {
  return <article className={`rounded-[2rem] p-6 shadow-xl ${dark ? "bg-[#0d3b4c] text-white" : "border border-[#dce5e8] bg-white text-[#0d3b4c]"}`}><h2 className="text-2xl font-black">{title}</h2>{items.map((item)=><p key={item} className={`mt-3 rounded-2xl p-4 text-sm font-black ${dark ? "bg-white/10" : "bg-[#f2f7f7]"}`}>{item}</p>)}</article>;
}
