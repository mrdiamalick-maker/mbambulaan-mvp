import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";
import { globalKpis } from "@/data/mockMbambulaan";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6fbfb] text-slate-950">
      <PublicNav />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <StatusBadge tone="blue">Solution B2B data & coordination</StatusBadge>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            Transformer les signaux terrain en décisions coordonnées.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
            Mbàmbulaan relie quais, acteurs, signaux, programmes, financements, preuves et décisions dans des espaces privés adaptés aux institutions, programmes, collectivités et partenaires.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="rounded-full bg-cyan-700 px-6 py-3 text-center text-sm font-black text-white shadow-sm shadow-cyan-900/20">
              Demander un essai
            </Link>
            <Link href="#cas-usages" className="rounded-full border border-cyan-200 bg-white px-6 py-3 text-center text-sm font-black text-cyan-950">
              Voir les cas d'usage
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-cyan-100 bg-white p-5 shadow-xl shadow-cyan-950/10">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-900 via-teal-800 to-emerald-700 p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Aperçu solution</p>
                <h2 className="mt-2 text-2xl font-black">Données · Analyse · Action</h2>
              </div>
              <StatusBadge tone="amber">Tension forte</StatusBadge>
            </div>
            <div className="mt-6 h-40 rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.22),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-4">
              <div className="relative h-full">
                {["Joal", "Mbour", "Kayar", "Saint-Louis"].map((quai, index) => (
                  <span key={quai} className="absolute rounded-full bg-white px-2 py-1 text-[0.68rem] font-black text-cyan-950" style={{ left: `${18 + index * 19}%`, top: `${18 + (index % 2) * 42}%` }}>
                    {quai}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {globalKpis.map((kpi) => (
                <div key={kpi.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-white/55">{kpi.label}</p>
                  <p className="mt-3 text-3xl font-black">{kpi.value}</p>
                  <p className="mt-1 text-sm font-semibold text-white/65">{kpi.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-3">
        <SectionCard title="Donnée exploitable" description="Les signaux terrain deviennent des informations qualifiées, contextualisées et traçables.">
          <p className="text-sm font-semibold leading-6 text-slate-600">Chaque donnée garde une source, un territoire, un acteur, un niveau de preuve et une prochaine action.</p>
        </SectionCard>
        <SectionCard title="Coordination privée" description="Chaque organisation accède à un espace différent selon son rôle, ses permissions et ses modules.">
          <p className="text-sm font-semibold leading-6 text-slate-600">Ministère, ONG, collectivité, entreprise ou investisseur ne voient pas le même produit.</p>
        </SectionCard>
        <SectionCard title="Décision actionnable" description="Les cartes, KPIs, alertes et rapports mènent à une décision, pas à une simple visualisation.">
          <p className="text-sm font-semibold leading-6 text-slate-600">Prioriser, vérifier, affecter, générer une note, préparer un rapport ou cadrer un financement.</p>
        </SectionCard>
      </section>

      <section id="cas-usages" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 max-w-3xl">
          <StatusBadge tone="green">Cas d'usage</StatusBadge>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Une même plateforme, des décisions différentes selon l'acteur.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Ministère", "Prioriser les territoires, programmes et financements."],
            ["ONG", "Suivre actions, preuves et reporting bailleur."],
            ["Collectivité", "Coordonner les urgences locales et partenaires."],
            ["Organisation", "Structurer membres, demandes collectives et plaidoyer."],
            ["Mareyeur", "Organiser flux, qualité, froid et retraits."],
            ["Exportateur", "Réduire le risque supply avant engagement."],
            ["Investisseur", "Lire les segments payeurs, risques et roadmap."],
            ["Partenaire", "Accéder uniquement aux modules autorisés."]
          ].map(([title, text]) => (
            <SectionCard key={title} title={title} description={text}>
              <Link href="/demo" className="text-sm font-black text-cyan-700">Qualifier ce cas</Link>
            </SectionCard>
          ))}
        </div>
      </section>

      <section id="cartographie" className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
        <SectionCard title="Cartographie et intelligence territoriale" description="Les quais, acteurs, tensions, programmes et financements deviennent une vue de décision.">
          <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_25%_20%,rgba(20,184,166,0.25),transparent_26%),linear-gradient(135deg,#ecfeff,#f7e7c3)]">
            {["Saint-Louis", "Kayar", "Dakar", "Mbour", "Joal"].map((quai, index) => (
              <span key={quai} className="absolute rounded-full bg-white px-3 py-2 text-xs font-black text-cyan-950 shadow-sm" style={{ left: `${18 + index * 13}%`, top: `${12 + index * 15}%` }}>
                {quai}
              </span>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Analyse, coordination et reporting" description="La donnée ne reste pas dans un graphique : elle mène à une action suivie.">
          <div className="grid gap-3">
            {["Filtrer les tensions", "Prioriser un territoire", "Affecter une action", "Conserver une preuve", "Préparer une note"].map((item) => (
              <div key={item} className="rounded-2xl bg-cyan-50 p-4 text-sm font-black text-cyan-950">{item}</div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section id="ressources" className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 md:grid-cols-2">
        <SectionCard title="Parcours prospect" description="Un prospect ne voit pas tout le produit : il qualifie son besoin, puis demande un essai.">
          <Link href="/demande-demo" className="inline-flex rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white">Demander un essai</Link>
        </SectionCard>
        <SectionCard title="Parcours partenaire" description="Un partenaire acquis se connecte à son espace privé selon ses droits.">
          <Link href="/espace-prive" className="inline-flex rounded-full border border-cyan-200 bg-white px-5 py-3 text-sm font-black text-cyan-950">Se connecter</Link>
        </SectionCard>
      </section>

      <section className="bg-gradient-to-r from-cyan-950 via-teal-900 to-emerald-900 px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Prochaine étape</p>
            <h2 className="mt-2 text-3xl font-black">Montrer le bon espace privé au bon décideur.</h2>
          </div>
          <Link href="/demo" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-slate-950">
            Lancer la démo
          </Link>
        </div>
      </section>
    </main>
  );
}
