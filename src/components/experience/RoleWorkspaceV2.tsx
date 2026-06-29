import Link from "next/link";

type DemoStep = {
  title: string;
  subtitle: string;
  text: string;
  data: string[];
};

type Space = {
  title: string;
  subtitle: string;
  scenario: string;
  problem: string;
  promise: string;
  kpis: string[];
  steps: DemoStep[];
  actors: string[];
  value: string;
  limit: string;
  offer: string;
};

const spaces: Record<string, Space> = {
  ong: {
    title: "Démo ONG / Programme",
    subtitle: "Suivi programme, preuve et reporting bailleur",
    scenario: "Suivre un programme et produire une preuve bailleur",
    problem: "Une ONG finance des actions mais doit éviter les doublons, cibler les bons bénéficiaires, documenter les résultats et expliquer les limites de preuve.",
    promise: "Mbàmbulaan relie zones, bénéficiaires, actions, preuves, risques et reporting dans un même fil de coordination.",
    kpis: ["2 zones suivies", "38 bénéficiaires", "6 preuves", "1 rapport bailleur"],
    actors: ["Chef programme", "Relais terrain", "Collectivité", "GIE local", "Bailleur", "Équipe Mbàmbulaan"],
    steps: [
      { title: "Situation", subtitle: "Le programme intervient sur plusieurs quais.", text: "Les actions existent mais les preuves, les bénéficiaires et les besoins prioritaires sont dispersés.", data: ["Joal", "Mbour", "Bénéficiaires à confirmer"] },
      { title: "Signaux", subtitle: "Les relais remontent des besoins non couverts.", text: "Besoin froid, formation qualité et accès marché apparaissent dans plusieurs conversations terrain.", data: ["Besoin froid", "Formation qualité", "Débouchés"] },
      { title: "Lecture Mbàmbulaan", subtitle: "La plateforme relie action, zone et preuve.", text: "Mbàmbulaan identifie les doublons, les lacunes de preuve et les actions à prioriser.", data: ["Doublon détecté", "Preuve manquante", "Zone prioritaire"] },
      { title: "Décision", subtitle: "Réorienter une action vers le quai le plus fragile.", text: "Le programme peut cibler Joal et préparer un reporting prudent, sans surpromettre l'impact.", data: ["Priorité Joal", "Reporting prudent"] },
      { title: "Coordination", subtitle: "Mobiliser les bons relais.", text: "Relais terrain, commune, GIE et équipe programme reçoivent une action claire.", data: ["Relais", "Commune", "GIE"] },
      { title: "Preuve / résultat", subtitle: "Une preuve bailleur devient présentable.", text: "Le rapport distingue données validées, estimées et éléments à vérifier.", data: ["Validé", "Estimé", "À vérifier"] }
    ],
    value: "Le programme devient plus lisible, mieux documenté et plus facile à défendre auprès d'un bailleur.",
    limit: "L'impact est estimé tant qu'un protocole de suivi n'est pas formalisé.",
    offer: "Forfait programme + reporting + accompagnement terrain."
  },
  collectivite: {
    title: "Démo Collectivité",
    subtitle: "Action communale et coordination locale",
    scenario: "Transformer un problème de quai en action communale",
    problem: "La collectivité connaît les problèmes du quai mais manque d'un fil clair pour décider, mobiliser et rendre compte.",
    promise: "Mbàmbulaan transforme un signal local en action communale suivie, avec preuve et prochaine décision.",
    kpis: ["1 quai prioritaire", "5 acteurs", "2 actions", "1 note locale"],
    actors: ["Mairie", "Relais quai", "Pêcheurs", "Mareyeurs", "ONG partenaire", "Service pêche"],
    steps: [
      { title: "Situation", subtitle: "Un quai concentre les tensions.", text: "Joal signale une pression sur conservation, débouchés et organisation du quai.", data: ["Quai Joal", "Tension forte", "Besoin froid"] },
      { title: "Signaux", subtitle: "Les acteurs locaux remontent des éléments concordants.", text: "Pêcheurs, mareyeurs et relais signalent le même risque de perte de valeur.", data: ["Signal pêcheur", "Besoin mareyeur", "Relais commune"] },
      { title: "Lecture Mbàmbulaan", subtitle: "Le problème devient coordonnable.", text: "La plateforme relie besoin, acteurs, preuve et action communale possible.", data: ["Acteurs liés", "Preuve locale", "Action proposée"] },
      { title: "Décision", subtitle: "Choisir une action défendable.", text: "La collectivité priorise une réunion de coordination et un cadrage froid.", data: ["Réunion", "Cadrage froid"] },
      { title: "Coordination", subtitle: "Mobiliser sans tout centraliser.", text: "Chaque acteur conserve son rôle, mais la commune a une lecture d'ensemble.", data: ["Mairie", "GIE", "Partenaire"] },
      { title: "Preuve / résultat", subtitle: "Une note communale devient partageable.", text: "La synthèse montre ce qui a été vu, décidé et ce qui doit être confirmé.", data: ["Note locale", "Limites", "Suivi"] }
    ],
    value: "La collectivité gagne un rôle économique concret : organiser, faciliter, connecter et rendre compte.",
    limit: "Le pilote doit rester simple pour être réellement utilisable localement.",
    offer: "Convention territoire + appui opérationnel."
  },
  pecheur: {
    title: "Démo Pêcheur",
    subtitle: "Relais terrain et retour de coordination",
    scenario: "Signaler un besoin et suivre le retour de coordination",
    problem: "Le pêcheur ne veut pas un dashboard lourd. Il veut déclarer simplement, être entendu et savoir ce que son signal déclenche.",
    promise: "Mbàmbulaan s'appuie sur relais quai, WhatsApp, téléphone et déclaration assistée pour réduire la complexité numérique.",
    kpis: ["1 signal", "1 relais", "1 statut", "1 retour"],
    actors: ["Pêcheur", "Relais quai", "Mareyeur", "Animatrice", "Organisation", "Mbàmbulaan"],
    steps: [
      { title: "Situation", subtitle: "Un lot ou un besoin doit être signalé vite.", text: "Le pêcheur remonte une disponibilité ou un problème sans entrer dans une interface lourde.", data: ["Produit disponible", "Besoin glace", "Problème moteur"] },
      { title: "Signaux", subtitle: "Le relais qualifie la remontée.", text: "Le signal reçoit un statut, une source et une limite de preuve.", data: ["Déclaratif", "Relais quai", "Heure"] },
      { title: "Lecture Mbàmbulaan", subtitle: "La plateforme cherche le lien utile.", text: "Le signal est relié à un besoin, une tension ou une action de coordination.", data: ["Besoin compatible", "Tension quai", "Action possible"] },
      { title: "Décision", subtitle: "Répondre au pêcheur avec un statut clair.", text: "Le pêcheur voit ce qui est en attente, coordonné ou à compléter.", data: ["À traiter", "En coordination"] },
      { title: "Coordination", subtitle: "Mobiliser sans exposer tout le marché.", text: "Relais, mareyeur et organisation sont sollicités de façon encadrée.", data: ["Relais", "Mareyeur", "Organisation"] },
      { title: "Preuve / résultat", subtitle: "Le signal laisse une trace utile.", text: "L'historique renforce confiance, suivi et capacité future de service.", data: ["Historique", "Confiance", "Retour"] }
    ],
    value: "Le pêcheur bénéficie de la coordination sans porter la complexité numérique.",
    limit: "Pas de dashboard pêcheur complet avant preuve d'usage terrain.",
    offer: "Pilote quai + relais Mbàmbulaan + inclusion progressive."
  },
  mareyeur: {
    title: "Démo Mareyeur",
    subtitle: "Flux produit, qualité, logistique et confiance",
    scenario: "Organiser un flux produit et réduire le risque logistique",
    problem: "Le mareyeur doit anticiper qualité, disponibilité, acheteurs, transport et fonds de roulement avec peu de visibilité consolidée.",
    promise: "Mbàmbulaan lui donne une lecture de coordination, pas une place de marché ouverte.",
    kpis: ["3 lots", "2 besoins", "1 risque", "1 action"],
    actors: ["Mareyeur", "Pêcheur", "Transporteur", "Acheteur", "Relais quai", "Mbàmbulaan"],
    steps: [
      { title: "Situation", subtitle: "Un flux doit partir vite mais proprement.", text: "Un lot sensible est disponible, un besoin existe, la logistique reste incertaine.", data: ["Lot disponible", "Besoin acheteur", "Transport à organiser"] },
      { title: "Signaux", subtitle: "Qualité, volume et délai sont qualifiés.", text: "La donnée devient actionnable avec statut et niveau de preuve.", data: ["Qualité estimée", "Volume", "Délai"] },
      { title: "Lecture Mbàmbulaan", subtitle: "Le système détecte une opportunité encadrée.", text: "La correspondance indique pourquoi agir, ce qui manque et quel risque suivre.", data: ["Compatibilité", "Risque qualité", "Preuve système"] },
      { title: "Décision", subtitle: "Prioriser ou attendre.", text: "Le mareyeur peut choisir d'organiser le flux ou de demander une validation supplémentaire.", data: ["Organiser", "Vérifier", "Reporter"] },
      { title: "Coordination", subtitle: "Acteurs et dépendances sont visibles.", text: "Pêcheur, transporteur, acheteur et relais sont coordonnés autour du même fil.", data: ["Transport", "Acheteur", "Relais"] },
      { title: "Preuve / résultat", subtitle: "Le flux laisse une trace de confiance.", text: "L'action enrichit l'historique et prépare des services futurs.", data: ["Trace", "Confiance", "Service"] }
    ],
    value: "Le mareyeur gagne en anticipation, crédibilité et capacité de coordination.",
    limit: "À monétiser après validation terrain du comportement d'usage.",
    offer: "Compte professionnel mareyeur + services de coordination."
  },
  exportateur: {
    title: "Démo Entreprise / Exportateur",
    subtitle: "Opportunité qualifiée, trace et risque",
    scenario: "Qualifier une opportunité sans marketplace",
    problem: "L'entreprise ne veut pas des annonces. Elle veut réduire l'incertitude sur qualité, disponibilité, trace, risque et conditions.",
    promise: "Mbàmbulaan qualifie une opportunité et organise la relation commerciale avec prudence.",
    kpis: ["1 lot", "92% compatibilité", "2 limites", "1 action"],
    actors: ["Entreprise", "Mareyeur", "Pêcheur", "Relais qualité", "Logistique", "Mbàmbulaan"],
    steps: [
      { title: "Situation", subtitle: "Un besoin entreprise cherche un lot fiable.", text: "L'entreprise veut savoir si l'opportunité est exploitable sans être exposée à une marketplace brute.", data: ["Besoin", "Lot", "Délai"] },
      { title: "Signaux", subtitle: "Qualité et trace sont partielles.", text: "Les données disponibles sont cadrées avec leur niveau de preuve.", data: ["Qualité estimée", "Trace système", "Limites"] },
      { title: "Lecture Mbàmbulaan", subtitle: "Le système calcule une recommandation prudente.", text: "L'opportunité est classée selon compatibilité, risque et confiance acteur.", data: ["Score", "Risque", "Confiance"] },
      { title: "Décision", subtitle: "Coordonner, vérifier ou refuser.", text: "L'entreprise reçoit des options d'arbitrage, pas un bouton d'achat public.", data: ["Coordonner", "Vérifier", "Refuser"] },
      { title: "Coordination", subtitle: "La relation est encadrée.", text: "Les acteurs nécessaires sont mobilisés avec action et preuve associées.", data: ["Mareyeur", "Qualité", "Logistique"] },
      { title: "Preuve / résultat", subtitle: "La décision devient traçable.", text: "La preuve est claire sur ce qui est confirmé et ce qui reste incertain.", data: ["Confirmé", "Estimé", "À vérifier"] }
    ],
    value: "L'entreprise achète de la réduction d'incertitude, pas un simple accès à des annonces.",
    limit: "Pas de marketplace self-service. Les opportunités restent qualifiées et encadrées.",
    offer: "Abonnement entreprise + coordination qualifiée."
  },
  organisation: {
    title: "Démo Organisation professionnelle",
    subtitle: "Demandes collectives, membres et partenaires",
    scenario: "Structurer une demande collective",
    problem: "Une organisation représente beaucoup d'acteurs mais manque souvent de base membres, demandes agrégées et preuves solides.",
    promise: "Mbàmbulaan transforme l'organisation en interlocuteur crédible pour partenaires et financeurs.",
    kpis: ["24 membres", "7 besoins", "3 partenaires", "1 dossier"],
    actors: ["Bureau", "Membres", "Collectivité", "Partenaire", "Financeur", "Mbàmbulaan"],
    steps: [
      { title: "Situation", subtitle: "Les membres remontent des besoins similaires.", text: "Les demandes restent dispersées et difficiles à défendre collectivement.", data: ["Froid", "Moteurs", "Formation"] },
      { title: "Signaux", subtitle: "Les besoins sont regroupés.", text: "Mbàmbulaan agrège les remontées par territoire, urgence et preuve.", data: ["7 besoins", "3 urgents", "2 preuves"] },
      { title: "Lecture Mbàmbulaan", subtitle: "La demande devient lisible.", text: "Le système montre ce qui est prioritaire et ce qui peut être présenté à un partenaire.", data: ["Priorité", "Partenaire cible", "Limite"] },
      { title: "Décision", subtitle: "Porter une demande collective.", text: "L'organisation choisit le dossier à défendre et les preuves à compléter.", data: ["Dossier", "Preuves", "Membres"] },
      { title: "Coordination", subtitle: "Partenaires et membres sont reliés.", text: "La coordination rend l'action suivable, sans centraliser toute la filière.", data: ["Membres", "Partenaire", "Relais"] },
      { title: "Preuve / résultat", subtitle: "Le plaidoyer devient documenté.", text: "La demande collective peut être présentée avec chiffres, limites et responsables.", data: ["Plaidoyer", "Chiffres", "Responsables"] }
    ],
    value: "L'organisation devient structurée, lisible et finançable.",
    limit: "Commencer simple : appui structuration avant digitalisation lourde.",
    offer: "Pilote organisation + accompagnement structuration."
  },
  investisseur: {
    title: "Démo Investisseur",
    subtitle: "Thèse infrastructure et trajectoire économique",
    scenario: "Comprendre la thèse infrastructure",
    problem: "L'investisseur doit comprendre pourquoi Mbàmbulaan peut devenir une infrastructure, pas une application de niche.",
    promise: "La démo montre payeurs, flux de valeur, risques, traction et trajectoire.",
    kpis: ["8 segments", "3 flux", "1 thèse", "5 risques"],
    actors: ["État", "ONG", "Collectivités", "Entreprises", "Organisations", "Équipe Mbàmbulaan"],
    steps: [
      { title: "Situation", subtitle: "La filière manque d'une couche de coordination.", text: "Les acteurs paient aujourd'hui le coût de l'information dispersée.", data: ["Fragmentation", "Risque", "Perte valeur"] },
      { title: "Signaux", subtitle: "Les mêmes besoins reviennent chez plusieurs payeurs.", text: "Institutions, ONG, entreprises et territoires ont des besoins différents mais reliés.", data: ["Payeurs", "Territoires", "Données"] },
      { title: "Lecture Mbàmbulaan", subtitle: "Le produit devient une infrastructure de confiance.", text: "La valeur vient de la coordination, des données qualifiées, des preuves et des services par rôle.", data: ["Coordination", "Preuve", "Services"] },
      { title: "Décision", subtitle: "Identifier le premier wedge commercial.", text: "Le pilote institutionnel et territoire peut prouver l'usage et ouvrir les offres programme/entreprise.", data: ["Pilote", "Offres", "Traction"] },
      { title: "Coordination", subtitle: "Construire l'écosystème plutôt qu'un module isolé.", text: "Chaque segment nourrit les autres par données, preuves et confiance.", data: ["Réseau", "Données", "Services"] },
      { title: "Preuve / résultat", subtitle: "La thèse reste prudente et vérifiable.", text: "La démo sépare faits, hypothèses, risques et prochains jalons.", data: ["Faits", "Hypothèses", "Jalons"] }
    ],
    value: "L'investisseur voit la logique d'écosystème, pas seulement des écrans.",
    limit: "Hypothèses explicites. Pas de fausse traction.",
    offer: "Session investisseur + data room produit."
  }
};

spaces.entreprise = spaces.exportateur;

export function RoleWorkspace({ slug }: { slug: string }) {
  const ws = spaces[slug] ?? spaces.etat;

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-black text-[#0d3b4c]">Mbàmbulaan</Link>
        <nav className="hidden gap-6 text-sm font-bold text-[#425662] md:flex">
          <Link href="/demo">Changer de profil</Link>
          <Link href="/devis">Cadrer l'offre</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">{ws.subtitle}</p>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c] sm:text-7xl">{ws.scenario}</h1>
          <p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">{ws.problem}</p>
          <p className="mt-5 rounded-3xl bg-white p-5 text-base font-bold leading-7 text-[#0d3b4c] shadow-sm">{ws.promise}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ws.kpis.map((kpi) => (
            <article key={kpi} className="rounded-3xl border border-[#dce5e8] bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">Signal simulé</p>
              <p className="mt-3 text-2xl font-black text-[#0d3b4c]">{kpi}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Simulation guidée</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-[#0d3b4c]">Un espace métier en six étapes.</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {ws.steps.map((step, index) => (
            <article key={step.title} className="rounded-[1.7rem] border border-[#dce5e8] bg-white p-5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">Étape {index + 1}</span>
              <h3 className="mt-3 text-2xl font-black text-[#0d3b4c]">{step.title}</h3>
              <p className="mt-2 text-base font-black text-[#102a37]">{step.subtitle}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#586973]">{step.text}</p>
              <div className="mt-4 grid gap-2">
                {step.data.map((item) => (
                  <span key={item} className="rounded-2xl bg-[#f2f7f7] px-3 py-2 text-xs font-black text-[#0d3b4c]">{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] bg-[#0d3b4c] p-6 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Coordination</p>
          <h2 className="mt-3 text-3xl font-black">Acteurs à mobiliser</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ws.actors.map((actor) => (
              <div key={actor} className="rounded-2xl bg-white/10 p-4 text-sm font-black">{actor}</div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Résultat de valeur</p>
          <h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">{ws.title}</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-[#52656f]">{ws.value}</p>
          <p className="mt-5 rounded-2xl bg-[#fff7e8] p-4 text-sm font-semibold leading-6 text-[#0d3b4c]">Limite : {ws.limit}</p>
          <p className="mt-4 rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">Offre possible : {ws.offer}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demande-demo" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-center text-sm font-black text-white">Demander une démo complète</Link>
            <Link href="/devis" className="rounded-full border border-[#d8e1e5] bg-white px-6 py-4 text-center text-sm font-black text-[#0d3b4c]">Cadrer un pilote</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
