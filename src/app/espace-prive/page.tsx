import Link from "next/link";

export default function EspacePrivePortalPage() {
  return <main className="min-h-screen overflow-hidden bg-[#eef2f5] text-slate-950">
    <header className="border-b border-slate-200 bg-[#0b1f33] px-5 py-4 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center border border-white/20 bg-white/10 text-sm font-black text-white">Mb</span><span><span className="block text-base font-black tracking-tight">Mbàmbulaan</span><span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-slate-300 sm:block">Accès institutionnel</span></span></Link>
        <Link href="/demande-demo" className="border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white hover:text-slate-950">Demander un essai</Link>
      </div>
    </header>

    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:py-20">
      <div>
        <span className="inline-flex border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700">Ministère des Pêches</span>
        <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-[-0.04em] text-slate-950 sm:text-7xl">Espace de coordination de la pêche artisanale.</h1>
        <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Consulter la carte des quais, suivre les pirogues, lire les débarquements, traiter les alertes et transformer les besoins terrain en programmes suivis.</p>
        <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            ["Carte opérationnelle", "Quais, pirogues, positions et alertes."],
            ["Programmes terrain", "Besoins, priorités et partenaires."],
            ["Suivi quotidien", "Débarquements, volumes et actions." ]
          ].map(([title, text]) => <div key={title} className="border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-black text-slate-950">{title}</p><p className="mt-2 text-xs font-bold leading-5 text-slate-500">{text}</p></div>)}
        </div>
      </div>

      <aside className="border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Connexion simulée</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Accès Ministère</h2>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Identifiant</span><input readOnly value="ministere.peche@mbambulaan.demo" className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none" /></label>
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Mot de passe</span><input readOnly type="password" value="simulation-ministere" className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none" /></label>
        </div>
        <Link href="/espace-prive/etat" className="mt-6 flex w-full items-center justify-center bg-[#0b1f33] px-5 py-3 text-sm font-black text-white transition hover:bg-slate-900">Entrer dans l'espace Ministère</Link>
        <p className="mt-5 border-l-4 border-amber-500 bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-950">Données simulées pour démonstration. Aucune authentification réelle dans cette version.</p>
      </aside>
    </section>
  </main>;
}
