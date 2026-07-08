import Link from "next/link";

export default function EspacePrivePortalPage() {
  return <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_52%,#fff7ed_100%)] text-slate-950">
    <header className="border-b border-cyan-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-800 text-sm font-black text-white">Mb</span><span><span className="block text-base font-black">Mbàmbulaan</span><span className="hidden text-xs font-bold text-cyan-700 sm:block">Accès Ministère</span></span></Link>
        <Link href="/demande-demo" className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">Demander un essai</Link>
      </div>
    </header>

    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:py-20">
      <div>
        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Accès Ministère</span>
        <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">Espace de suivi des quais de pêche artisanale.</h1>
        <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Connexion simulée pour consulter la carte, les quais, les pirogues, les débarquements, les alertes, les besoins terrain et les indicateurs de suivi.</p>
        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
          {[
            ["Carte", "Quais, pirogues et alertes."],
            ["Communautés", "Besoins, projets et formations."],
            ["Suivi", "Indicateurs et actions." ]
          ].map(([title, text]) => <div key={title} className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm"><p className="text-sm font-black text-cyan-950">{title}</p><p className="mt-2 text-xs font-bold leading-5 text-slate-500">{text}</p></div>)}
        </div>
      </div>

      <aside className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-[0_24px_70px_rgba(8,145,178,0.14)]">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Connexion simulée</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Accès Ministère</h2>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Identifiant</span><input readOnly value="ministere.peche@mbambulaan.demo" className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-sm font-black text-cyan-950 outline-none" /></label>
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Mot de passe</span><input readOnly type="password" value="simulation-ministere" className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-sm font-black text-cyan-950 outline-none" /></label>
        </div>
        <Link href="/espace-prive/etat" className="mt-6 flex w-full items-center justify-center rounded-full bg-cyan-800 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-900/20">Entrer dans l'espace Ministère</Link>
        <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-950">Données simulées pour démonstration. Aucune authentification réelle dans cette version.</p>
      </aside>
    </section>
  </main>;
}
