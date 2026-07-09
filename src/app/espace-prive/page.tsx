import Link from "next/link";

const modules = [
  {
    title: "Cartographie maritime",
    description: "Quais, pirogues, débarquements, alertes et détail opérationnel au clic.",
    stat: "8 quais",
  },
  {
    title: "Valorisation communautaire",
    description: "Besoins terrain, qualification, programmes, partenaires et suivi d'impact.",
    stat: "6 besoins",
  },
  {
    title: "Pilotage institutionnel",
    description: "KPI, volumes, alertes, actions, synthèse de journée et export de preuve.",
    stat: "10 KPI",
  },
];

const journey = [
  "Lire le littoral",
  "Identifier une tension",
  "Qualifier le besoin",
  "Mobiliser un programme",
  "Suivre la preuve",
];

export default function EspacePrivePortalPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#eef6f5] text-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(20,184,166,0.24),transparent_32%),radial-gradient(circle_at_86%_10%,rgba(14,116,144,0.2),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#e6f4f3_52%,#f7eddc_100%)]" />

      <header className="border-b border-cyan-950/10 bg-white/82 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#07384a] text-sm font-black text-white shadow-sm">Mb</span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black tracking-tight">Mbàmbulaan</span>
              <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-cyan-800 sm:block">Espace privé simulé</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/demande-demo" className="hidden rounded-xl border border-cyan-950/10 bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 sm:inline-flex">Demander une démo</Link>
            <Link href="/espace-prive/etat" className="rounded-xl bg-[#07384a] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#052c3b]">Ouvrir la console</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[90rem] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-stretch lg:py-14">
        <div className="grid gap-6">
          <section className="overflow-hidden rounded-[2rem] border border-cyan-950/10 bg-white/90 shadow-[0_34px_100px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-10">
              <div>
                <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-900">Console privée · Ministère</span>
                <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-[-0.045em] text-slate-950 sm:text-7xl">Un espace pour piloter la pêche artisanale.</h1>
                <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-slate-600">La console montre comment un signal terrain devient une action coordonnée : carte maritime, besoins communautaires, suivi des preuves et synthèse institutionnelle.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/espace-prive/etat" className="rounded-2xl bg-[#07384a] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#052c3b]">Entrer dans l'espace Ministère</Link>
                  <Link href="/devis" className="rounded-2xl border border-cyan-950/10 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">Cadrer un pilote</Link>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-cyan-950/10 bg-[#07384a] p-5 text-white shadow-2xl shadow-cyan-950/20">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Parcours produit</p>
                <div className="mt-5 grid gap-3">
                  {journey.map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-xs font-black text-[#07384a]">{index + 1}</span>
                      <p className="text-sm font-black">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {modules.map((module) => (
              <article key={module.title} className="rounded-[1.5rem] border border-cyan-950/10 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">{module.stat}</p>
                <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">{module.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{module.description}</p>
              </article>
            ))}
          </section>
        </div>

        <aside className="grid gap-5 rounded-[2rem] border border-cyan-950/10 bg-white/94 p-5 shadow-[0_34px_100px_rgba(15,23,42,0.12)] backdrop-blur sm:p-6">
          <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#07384a,#0f766e)] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Accès de démonstration</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Ministère des Pêches</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50">Données locales simulées. Aucune authentification réelle. Aucune décision automatique.</p>
          </div>

          <div className="grid gap-3">
            {[
              ["Carte", "Quais et pirogues visibles sur une carte métier."],
              ["Actions", "Alertes, programmes et besoins priorisés."],
              ["Preuves", "Synthèse exportable et traçabilité des décisions."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">{title}</p>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>

          <Link href="/espace-prive/etat" className="flex w-full items-center justify-center rounded-2xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b5f5a]">Lancer l'espace privé</Link>
        </aside>
      </section>
    </main>
  );
}
