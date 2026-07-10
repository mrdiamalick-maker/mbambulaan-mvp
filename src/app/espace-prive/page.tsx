import Link from "next/link";

const osModules = [
  {
    title: "Maritime Atlas",
    description: "Lire les quais, les pirogues, les débarquements et les alertes sur une carte opérationnelle.",
    signal: "Carte vivante",
    stat: "8 quais suivis",
  },
  {
    title: "Value Chain & Communities",
    description: "Relier besoins terrain, programmes, partenaires, formations et actions d'impact.",
    signal: "Chaîne de valeur",
    stat: "6 besoins ouverts",
  },
  {
    title: "Institutional Steering",
    description: "Piloter les KPI, les volumes, les preuves, les risques et la synthèse institutionnelle.",
    signal: "Décision publique",
    stat: "10 indicateurs",
  },
];

const operatingFlow = [
  "Observer le littoral",
  "Qualifier le signal",
  "Prioriser l'action",
  "Coordonner les acteurs",
  "Conserver la preuve",
];

const proofItems = ["Données mockées", "Simulation privée", "Humain valide", "Prêt pour pilote"];

export default function EspacePrivePortalPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071b22] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.35),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(14,165,233,0.22),transparent_30%),linear-gradient(135deg,#071b22_0%,#0b3142_48%,#103f3f_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,#f5f8f3)]" />

      <header className="relative z-10 border-b border-white/10 bg-white/8 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-[94rem] items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sm font-black text-[#07384a] shadow-sm">Mb</span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black tracking-tight">Mbàmbulaan</span>
              <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-cyan-100 sm:block">Maritime Coordination OS</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/demande-demo" className="hidden rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/15 sm:inline-flex">Demander une démo</Link>
            <Link href="/espace-prive/etat" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-[#07384a] shadow-sm transition hover:bg-cyan-50">Entrer</Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[94rem] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-stretch lg:py-14">
        <div className="grid gap-6">
          <section className="overflow-hidden rounded-[2.25rem] border border-white/12 bg-white/10 shadow-[0_34px_120px_rgba(2,6,23,0.34)] backdrop-blur-xl">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:p-10">
              <div>
                <span className="inline-flex rounded-full border border-cyan-200/40 bg-cyan-100/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-50">Reset privé · Coordination maritime</span>
                <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-[-0.05em] text-white sm:text-7xl">Mbàmbulaan Maritime Coordination OS.</h1>
                <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-cyan-50/86">Un espace privé pour superviser le littoral, relier les communautés à des programmes, coordonner les décisions et produire des preuves institutionnelles.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/espace-prive/etat" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#07384a] shadow-sm transition hover:bg-cyan-50">Ouvrir le Maritime OS</Link>
                  <Link href="/devis" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-white/15">Cadrer un pilote</Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/12 bg-slate-950/28 p-5 shadow-2xl shadow-slate-950/20">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Flux de coordination</p>
                <div className="mt-5 grid gap-3">
                  {operatingFlow.map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-100 text-xs font-black text-[#07384a]">{index + 1}</span>
                      <p className="text-sm font-black">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {osModules.map((module) => (
              <article key={module.title} className="rounded-[1.6rem] border border-white/12 bg-white/92 p-5 text-slate-950 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">{module.signal}</p>
                <h2 className="mt-3 text-xl font-black tracking-tight">{module.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{module.description}</p>
                <p className="mt-5 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-950">{module.stat}</p>
              </article>
            ))}
          </section>
        </div>

        <aside className="grid gap-5 rounded-[2.25rem] border border-white/12 bg-white/94 p-5 text-slate-950 shadow-[0_34px_120px_rgba(2,6,23,0.24)] backdrop-blur-xl sm:p-6">
          <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#07384a,#0f766e)] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Organisation simulée</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Ministère des Pêches</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50">Accès de démonstration sans authentification réelle. Les données sont locales et les décisions restent humaines.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {proofItems.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-800">{item}</div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-cyan-950/10 bg-[#f6fbfa] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Ce que l'espace montre</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">Une journée maritime coordonnée : carte, tension, besoin, action, preuve et pilotage.</p>
          </div>

          <Link href="/espace-prive/etat" className="flex w-full items-center justify-center rounded-2xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b5f5a]">Lancer le Maritime Coordination OS</Link>
        </aside>
      </section>
    </main>
  );
}
