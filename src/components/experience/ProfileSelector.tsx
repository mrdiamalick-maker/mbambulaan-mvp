import Link from "next/link";

const profiles = [
  ["etat", "État / Ministère", "Sponsor principal : décision, coordination, programmes, preuves."],
  ["ong", "ONG / Programme", "Suivi programme, bénéficiaires, preuves, reporting bailleur."],
  ["collectivite", "Collectivité", "Territorialisation, action locale, financement, légitimité."],
  ["pecheur", "Pêcheur", "Parcours assisté : signal, financement, statut, relais quai."],
  ["mareyeur", "Mareyeur", "Flux produits, besoins marché, qualité, logistique, confiance."],
  ["exportateur", "Entreprise / Exportateur", "Opportunités qualifiées, trace, risque, coordination commerciale."],
  ["organisation", "Organisation professionnelle", "Membres, demandes collectives, plaidoyer, partenaires."],
  ["investisseur", "Investisseur", "Thèse infrastructure, modèle économique, traction, risques."]
];

export function ProfileSelector() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-black">Mbàmbulaan</Link>
        <Link href="/devis" className="text-sm font-black text-[#0d6f8d]">Demander un devis</Link>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">Démo personnalisée</p>
        <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">Choisissez l’espace à présenter.</h1>
        <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-[#52656f]">Chaque profil ouvre un parcours métier : problème, données utiles, intelligence Mbàmbulaan, décisions, preuves, limites et offre commerciale.</p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        {profiles.map(([slug, title, text]) => (
          <Link key={slug} href={`/demo/${slug}`} className="rounded-3xl border border-[#dce5e8] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0d6f8d] hover:shadow-xl">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">Espace</span>
            <h2 className="mt-3 text-xl font-black text-[#0d3b4c]">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#586973]">{text}</p>
            <strong className="mt-5 inline-flex text-sm font-black text-[#0d6f8d]">Entrer dans l’espace →</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
