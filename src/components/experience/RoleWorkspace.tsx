import Link from "next/link";

type Workspace = {
  title: string;
  segment: string;
  problem: string;
  sponsorValue: string;
  dailyUse: string;
  data: string[];
  intelligence: string[];
  services: string[];
  decisions: string[];
  proof: string;
  commercial: string;
};

const workspaces: Record<string, Workspace> = {
  etat: {
    title: "Espace État / Ministère",
    segment: "Sponsor institutionnel",
    problem: "Le ministère ne manque pas seulement de tableaux. Il manque d'une couche quotidienne pour lire la filière, repérer les tensions, suivre les programmes, arbitrer les priorités et documenter les décisions.",
    sponsorValue: "Mbàmbulaan devient le réflexe de coordination : données filière, demandes de financement, innovations, programmes, conflits et décisions dans un même espace.",
    dailyUse: "Chaque matin : consulter les tensions, voir les signaux qualifiés, ouvrir les demandes critiques, suivre les programmes actifs, préparer une note de décision.",
    data: ["KPIs agrégés par territoire", "Tensions et conflits", "Besoins des acteurs", "Demandes de financement", "Programmes et innovations", "Carte acteurs / quais"],
    intelligence: ["Priorisation des décisions", "Lecture des zones sous tension", "Détection des doublons programme", "Aide à la note de synthèse", "Limites de preuve visibles"],
    services: ["Cockpit territorial", "Rapport ministère", "Suivi programmes", "Hub financement", "Connecteurs outils existants"],
    decisions: ["Quel territoire prioriser ?", "Quel conflit traiter ?", "Quel programme financer ?", "Quel acteur mobiliser ?", "Quelle preuve manque ?"],
    proof: "Données simulées, niveau de confiance indiqué, intégrations possibles avec outils de l'État. Mbàmbulaan ne remplace pas les systèmes publics : il les coordonne.",
    commercial: "Pilote institutionnel sponsorisé + convention données + déploiement territoire pilote."
  },
  ong: {
    title: "Espace ONG / Programme",
    segment: "Bailleur, coopération, programme de développement",
    problem: "Les programmes financent des actions mais peinent à prouver l'utilité, éviter les doublons, identifier les bons bénéficiaires et ajuster vite l'intervention.",
    sponsorValue: "Mbàmbulaan sert de couche de suivi, de preuve et de coordination entre bailleur, État, collectivité et acteurs terrain.",
    dailyUse: "Suivre les activités, repérer les bénéficiaires à risque, documenter les preuves, préparer un reporting bailleur et ajuster le plan d'action.",
    data: ["Zones d'intervention", "Bénéficiaires", "Actions terrain", "Besoins remontés", "Preuves collectées", "Risques d'exécution"],
    intelligence: ["Détection doublons", "Ciblage bénéficiaires", "Impact estimé", "Alertes terrain", "Rapport bailleur assisté"],
    services: ["Portefeuille programme", "Suivi sensibilisation", "Module financement", "Preuve d'impact", "Coordination partenaires"],
    decisions: ["Où intervenir ?", "Qui soutenir ?", "Quelle action arrêter ?", "Quelle preuve manque ?", "Quel partenaire mobiliser ?"],
    proof: "Impact estimé, non officiel, mais traçable. Les hypothèses sont explicites pour ne pas surpromettre aux bailleurs.",
    commercial: "Forfait programme + reporting + accompagnement terrain."
  },
  collectivite: {
    title: "Espace Collectivité",
    segment: "Mairie, conseil départemental, territoire pilote",
    problem: "La collectivité est proche du terrain mais manque d'outils simples pour lire l'économie locale, mobiliser les acteurs et créer une valeur visible pour les citoyens.",
    sponsorValue: "Mbàmbulaan transforme la commune en facilitateur économique : quais, acteurs, besoins, financements et actions locales deviennent lisibles.",
    dailyUse: "Voir les problèmes prioritaires, préparer une action communale, identifier un partenaire, suivre l'exécution et produire une note maire/conseil municipal.",
    data: ["Quais et sites", "Acteurs économiques", "Besoins prioritaires", "Opportunités locales", "Revenus potentiels", "Partenaires mobilisables"],
    intelligence: ["Priorités territoire", "Potentiel win-win", "Actions recommandées", "Suivi exécution", "Synthèse conseil municipal"],
    services: ["Tableau territorial simple", "Carte acteurs", "Suivi action", "Demandes financement", "Note communale"],
    decisions: ["Quel problème traiter ?", "Quelle action créer ?", "Quel partenaire contacter ?", "Quel service financer ?", "Comment rendre compte ?"],
    proof: "Espace volontairement simple : utile pour une mairie avec peu de moyens numériques.",
    commercial: "Convention territoire + accompagnement opérationnel."
  },
  pecheur: {
    title: "Parcours Pêcheur assisté",
    segment: "Pêcheur référent, quai pilote, relais terrain",
    problem: "Un dashboard complet pêcheur serait probablement trop lourd au MVP. Le besoin réel est vendre mieux, financer, sécuriser l'activité, diversifier et recevoir un retour utile.",
    sponsorValue: "Mbàmbulaan doit d'abord aider par relais : pêcheurs référents, agents terrain, téléphone, WhatsApp et déclaration assistée.",
    dailyUse: "Signaler une disponibilité ou un problème, demander un financement, recevoir un statut, être relié à une opportunité encadrée.",
    data: ["Disponibilités", "Problèmes déclarés", "Demandes financement", "Historique confiance", "Retours coordination", "Diversification possible"],
    intelligence: ["Qualification assistée", "Priorisation par quai", "Orientation vers bon acteur", "Statut visible", "Alerte financement"],
    services: ["Déclaration assistée", "Relais quai", "Statut signal", "Demande financement", "Historique confiance"],
    decisions: ["Dois-je signaler ?", "Qui peut m'aider ?", "Mon besoin est-il suivi ?", "Quelle opportunité est fiable ?", "Quel financement demander ?"],
    proof: "Décision CPO : pas de grand espace pêcheur individualisé au départ. Construire un parcours assisté d'abord.",
    commercial: "Pilote quai + relais Mbàmbulaan + inclusion progressive."
  },
  mareyeur: {
    title: "Espace Mareyeur",
    segment: "Intermédiaire de flux et d'information",
    problem: "Le mareyeur gère achats, disponibilités, qualité, logistique, prix et relations acheteurs. Il peut utiliser un espace plus tôt que le pêcheur.",
    sponsorValue: "Mbàmbulaan lui donne anticipation, visibilité et coordination sans ouvrir une marketplace publique.",
    dailyUse: "Voir les produits disponibles, comparer les besoins, suivre la qualité, gérer la logistique et demander une coordination.",
    data: ["Disponibilités produits", "Besoins marché", "Prix indicatifs", "Qualité", "Logistique", "Historique transactions"],
    intelligence: ["Matching encadré", "Alertes qualité", "Prévision demande", "Score confiance", "Besoin fonds de roulement"],
    services: ["Portefeuille produits", "Matching besoins", "Suivi qualité", "Coordination transport", "Financement court terme"],
    decisions: ["Quel produit prioriser ?", "Quel acheteur contacter ?", "Quel risque logistique ?", "Quelle qualité garantir ?", "Quel besoin financer ?"],
    proof: "L'espace mareyeur peut être monétisable plus tôt si l'usage terrain est confirmé.",
    commercial: "Compte professionnel mareyeur + services de coordination."
  },
  exportateur: {
    title: "Espace Entreprise / Exportateur",
    segment: "Acheteur, transformateur, exportateur, entreprise privée",
    problem: "L'entreprise ne veut pas juste voir des produits. Elle veut réduire l'incertitude : qualité, disponibilité, trace, risque et conditions de coordination.",
    sponsorValue: "Mbàmbulaan qualifie les opportunités et organise la relation avec la filière sans devenir une marketplace ouverte.",
    dailyUse: "Consulter les opportunités qualifiées, vérifier la qualité, lire les limites, demander coordination et suivre un portefeuille d'approvisionnement.",
    data: ["Produits qualifiés", "Besoins marché", "Qualité déclarée", "Trace disponible", "Risque supply", "Conditions"],
    intelligence: ["Scoring confiance", "Compatibilité besoin-produit", "Alerte risque", "Synthèse qualité", "Demande coordination"],
    services: ["Portefeuille opportunités", "Qualité / trace", "Données marché", "Coordination achat", "Suivi risque"],
    decisions: ["Quelle opportunité suivre ?", "Quel risque accepter ?", "Quelle preuve demander ?", "Quel acteur mobiliser ?", "Quel contrat préparer ?"],
    proof: "Pas de vitrine ouverte. Les données sont qualifiées, encadrées et contextualisées.",
    commercial: "Abonnement entreprise + frais de coordination qualifiée."
  },
  organisation: {
    title: "Espace Organisation professionnelle",
    segment: "Groupement, association, interprofession",
    problem: "Beaucoup d'organisations représentent les acteurs mais manquent de données membres, de demandes agrégées et de preuves pour parler aux partenaires.",
    sponsorValue: "Mbàmbulaan transforme une organisation dispersée en interlocuteur crédible pour l'État, les ONG et les entreprises.",
    dailyUse: "Tenir le registre membres, agréger les demandes, préparer un plaidoyer, suivre les actions partenaires et prouver l'activité.",
    data: ["Registre membres", "Besoins agrégés", "Demandes collectives", "Actions en cours", "Partenaires", "Preuves d'organisation"],
    intelligence: ["Agrégation demandes", "Priorités collectives", "Note de plaidoyer", "Mise en relation partenaire", "Suivi organisationnel"],
    services: ["Registre", "Demandes collectives", "Plaidoyer", "Actions partenaires", "Preuves"],
    decisions: ["Quelle demande porter ?", "Quel membre prioriser ?", "Quel partenaire viser ?", "Quelle preuve présenter ?", "Quelle action suivre ?"],
    proof: "Démarrer simple : beaucoup d'organisations ont besoin d'être structurées avant d'être digitalisées lourdement.",
    commercial: "Pilote organisation + appui structuration."
  },
  investisseur: {
    title: "Espace Investisseur",
    segment: "Investisseur, partenaire stratégique",
    problem: "L'investisseur doit comprendre pourquoi Mbàmbulaan peut devenir une infrastructure et non une application de niche.",
    sponsorValue: "L'espace montre la thèse : coordination, donnée fiable, services, payeurs, risques et trajectoire économique.",
    dailyUse: "Lire la thèse, suivre les signaux de traction, voir les segments payeurs, comprendre les risques et les prochains jalons.",
    data: ["Segments payeurs", "Flux de valeur", "Pilotes", "Risques", "Unit economics", "Traction"],
    intelligence: ["Thèse infrastructure", "Analyse payeur", "Priorité marché", "Risque exécution", "Roadmap valeur"],
    services: ["Memo investisseur", "Traction pilote", "Business model", "Risques", "Scénarios"],
    decisions: ["Pourquoi maintenant ?", "Qui paie ?", "Qu'est-ce qui scale ?", "Quel risque majeur ?", "Quel jalon finance ?"],
    proof: "Hypothèses explicites et prudentes. Pas de fausse traction.",
    commercial: "Session investisseur + data room produit."
  }
};

export function RoleWorkspace({ slug }: { slug: string }) {
  const ws = workspaces[slug] ?? workspaces.etat;
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-black">Mbàmbulaan</Link>
        <nav className="hidden gap-6 text-sm font-bold text-[#425662] md:flex"><Link href="/demo">Démo</Link><Link href="/devis">Devis</Link></nav>
      </header>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">{ws.segment}</p><h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">{ws.title}</h1><p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">{ws.problem}</p><p className="mt-5 rounded-3xl bg-white p-5 text-base font-bold leading-7 text-[#0d3b4c] shadow-sm">{ws.sponsorValue}</p></div>
        <div className="rounded-[2rem] bg-[#0d3b4c] p-6 text-white shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Usage quotidien</p><h2 className="mt-3 text-3xl font-black">Pourquoi on revient chaque jour</h2><p className="mt-4 text-base font-semibold leading-7 text-white/72">{ws.dailyUse}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{ws.data.slice(0,3).map((item)=><div key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-black">{item}</div>)}</div></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-3">
        <Panel title="Données utiles" items={ws.data} />
        <Panel title="Intelligence Mbàmbulaan" items={ws.intelligence} dark />
        <Panel title="Services visibles" items={ws.services} />
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><h2 className="text-2xl font-black text-[#0d3b4c]">Parcours de décision</h2>{ws.decisions.map((d,i)=><div key={d} className="mt-4 flex gap-4 rounded-2xl bg-[#f2f7f7] p-4"><span className="font-black text-[#0d6f8d]">0{i+1}</span><strong>{d}</strong></div>)}</div>
        <div className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><h2 className="text-2xl font-black text-[#0d3b4c]">Preuve, limite et offre</h2><p className="mt-4 text-sm font-semibold leading-6 text-[#52656f]">{ws.proof}</p><p className="mt-5 rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">{ws.commercial}</p><div className="mt-6 flex flex-col gap-3"><Link href="/demande-demo" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-center text-sm font-black text-white">Demander une démo complète</Link><Link href="/devis" className="rounded-full border border-[#d8e1e5] bg-white px-6 py-4 text-center text-sm font-black text-[#0d3b4c]">Cadrer l'offre</Link></div></div>
      </section>
    </main>
  );
}

function Panel({ title, items, dark = false }: { title: string; items: string[]; dark?: boolean }) {
  return <article className={`rounded-[2rem] p-6 shadow-xl ${dark ? "bg-[#0d3b4c] text-white" : "border border-[#dce5e8] bg-white text-[#0d3b4c]"}`}><h2 className="text-2xl font-black">{title}</h2>{items.map((item)=><p key={item} className={`mt-3 rounded-2xl p-4 text-sm font-black ${dark ? "bg-white/10" : "bg-[#f2f7f7]"}`}>{item}</p>)}</article>;
}
