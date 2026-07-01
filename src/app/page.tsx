import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";
import { globalKpis } from "@/data/mockMbambulaan";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6fbfb] text-slate-950">
      <PublicNav />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <StatusBadge tone="blue">Écosystème numérique au service de la pêche artisanale</StatusBadge>
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
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Flux de décision</p>
                <h2 className="mt-2 text-2xl font-black">Signal terrain → décision publique</h2>
              </div>
              <StatusBadge tone="amber">Tension forte</StatusBadge>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ["1", "Signal terrain", "Une alerte remonte d'un quai ou d'un relais."],
                ["2", "Analyse territoriale", "Mbàmbulaan relie tension, acteurs, programmes et preuves."],
                ["3", "Coordination", "Le bon service suit la bonne action avec le bon partenaire."],
                ["4", "Décision / rapport", "Une note sobre est préparée pour arbitrage."]
              ].map(([step, title, text]) => (
                <div key={title} className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-cyan-950">{step}</span>
                  <span>
                    <span className="block text-sm font-black">{title}</span>
                    <span className="block text-xs font-semibold leading-5 text-white/70">{text}</span>
                  </span>
                </div>
              ))}
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
        <div className="overflow-hidden rounded-[1.75rem] border border-cyan-100 bg-white shadow-sm">
          <div className="grid bg-cyan-950 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-50 md:grid-cols-[1fr_1.2fr_1.1fr]">
            <span>Profil</span>
            <span>Ce qu'il doit voir</span>
            <span>Décision facilitée</span>
          </div>
          {[
            ["Ministère", "Territoires, tensions, budgets, ressources, incidents, preuves.", "Arbitrer et prioriser l'action publique."],
            ["ONG / Programme", "Actions, bénéficiaires, preuves terrain, risques et reporting.", "Rendre compte sans perdre le fil terrain."],
            ["Collectivité", "Quais locaux, urgences, partenaires, notes mairie.", "Coordonner une réponse locale."],
            ["Organisation professionnelle", "Membres, demandes collectives, dossiers partenaires.", "Défendre une priorité avec preuves."],
            ["Entreprise / exportateur", "Supply qualifié, risques, conditions logistiques.", "Décider sans catalogue public."],
            ["Investisseur / associé", "Segments payeurs, offres, pipeline, risques, roadmap.", "Comprendre le potentiel vendable."]
          ].map(([profile, visible, decision]) => (
            <div key={profile} className="grid gap-2 border-t border-cyan-100 px-5 py-4 text-sm md:grid-cols-[1fr_1.2fr_1.1fr] md:items-center">
              <p className="font-black text-slate-950">{profile}</p>
              <p className="font-semibold leading-6 text-slate-600">{visible}</p>
              <p className="font-bold leading-6 text-cyan-900">{decision}</p>
            </div>
          ))}
        </div>
        <Link href="/demo/etat" className="mt-5 inline-flex rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white">Voir le scénario Ministère</Link>
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
