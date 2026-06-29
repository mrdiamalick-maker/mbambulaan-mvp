import Link from "next/link";

const profiles = [
  {
    slug: "etat",
    label: "État / Ministère",
    scenario: "Arbitrer une tension sur un territoire pilote",
    value: "Voir les signaux terrain, les programmes actifs, les demandes de financement et une note de décision exploitable.",
    shown: ["Tension Joal", "KPIs filière", "Acteurs à coordonner", "Note ministère"]
  },
  {
    slug: "ong",
    label: "ONG / Programme",
    scenario: "Suivre un programme et produire une preuve bailleur",
    value: "Comprendre où agir, quelles preuves existent et quelles limites doivent rester visibles.",
    shown: ["Bénéficiaires", "Actions terrain", "Impact estimé", "Reporting prudent"]
  },
  {
    slug: "collectivite",
    label: "Collectivité",
    scenario: "Transformer un problème de quai en action communale",
    value: "Passer d'un signal local à une décision défendable devant les acteurs du territoire.",
    shown: ["Quai prioritaire", "Acteurs locaux", "Action communale", "Compte rendu"]
  },
  {
    slug: "pecheur",
    label: "Pêcheur",
    scenario: "Signaler un besoin et suivre le retour de coordination",
    value: "Montrer une expérience assistée, simple, avec relais terrain plutôt qu'un dashboard lourd.",
    shown: ["Signal", "Statut", "Relais quai", "Retour coordination"]
  },
  {
    slug: "mareyeur",
    label: "Mareyeur",
    scenario: "Organiser un flux produit et réduire le risque logistique",
    value: "Visualiser les lots, la qualité, les besoins marché et les actions à coordonner.",
    shown: ["Flux produits", "Qualité", "Logistique", "Confiance"]
  },
  {
    slug: "exportateur",
    label: "Entreprise / Exportateur",
    scenario: "Qualifier une opportunité sans marketplace",
    value: "Évaluer une opportunité encadrée avec qualité, trace, risque et limites de preuve.",
    shown: ["Opportunité", "Trace", "Risque supply", "Coordination commerciale"]
  },
  {
    slug: "organisation",
    label: "Organisation professionnelle",
    scenario: "Structurer une demande collective",
    value: "Transformer des besoins membres en actions collectives lisibles pour partenaires et financeurs.",
    shown: ["Membres", "Demandes agrégées", "Plaidoyer", "Preuves"]
  },
  {
    slug: "investisseur",
    label: "Investisseur",
    scenario: "Comprendre la thèse infrastructure",
    value: "Lire pourquoi Mbàmbulaan peut devenir une couche de coordination vendable et défendable.",
    shown: ["Segments payeurs", "Flux de valeur", "Risques", "Trajectoire"]
  }
];

export function ProfileSelector() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black text-[#0d3b4c]">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0d3b4c] text-sm text-white">Mb</span>
          <span>Mbàmbulaan</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-black text-[#425662]">
          <Link href="/">Accueil</Link>
          <Link href="/devis" className="hidden text-[#0d6f8d] sm:inline">Demander un devis</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">Démo personnalisée sur invitation</p>
          <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c] sm:text-7xl">
            Choisissez le scénario adapté à votre rôle.
          </h1>
        </div>
        <div className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl">
          <p className="text-lg font-bold leading-8 text-[#52656f]">
            La démo n'ouvre pas tout le produit. Elle simule un espace métier : problème réel, signaux, lecture Mbàmbulaan, décision, coordination, preuve et résultat de valeur.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Public", "Démo", "Privé"].map((step, index) => (
              <div key={step} className="rounded-2xl bg-[#f1f6f6] p-4">
                <span className="text-xs font-black text-[#0d6f8d]">0{index + 1}</span>
                <strong className="mt-2 block text-[#0d3b4c]">{step}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
        {profiles.map((profile) => (
          <Link
            key={profile.slug}
            href={`/demo/${profile.slug}`}
            className="group flex min-h-[23rem] flex-col rounded-[1.7rem] border border-[#dce5e8] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0d6f8d] hover:shadow-xl"
          >
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">{profile.label}</span>
            <h2 className="mt-4 text-2xl font-black leading-tight text-[#0d3b4c]">{profile.scenario}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#586973]">{profile.value}</p>
            <div className="mt-5 grid gap-2">
              {profile.shown.map((item) => (
                <span key={item} className="rounded-2xl bg-[#f2f7f7] px-3 py-2 text-xs font-black text-[#0d3b4c]">{item}</span>
              ))}
            </div>
            <strong className="mt-auto pt-6 text-sm font-black text-[#0d6f8d]">Voir cette démo →</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
