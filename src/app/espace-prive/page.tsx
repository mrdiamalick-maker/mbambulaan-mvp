import Link from "next/link";

export default function EspacePrivePortalPage() {
  return <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f6f8fa_0%,#edf4f6_48%,#f8f1e4_100%)] text-slate-950">
    <header className="border-b border-slate-200/80 bg-white/92 px-5 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0b3142] text-sm font-black text-white shadow-sm">Mb</span><span><span className="block text-base font-black tracking-tight">Mbàmbulaan</span><span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-cyan-800 sm:block">Accès institutionnel</span></span></Link>
        <Link href="/demande-demo" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">Demander un essai</Link>
      </div>
    </header>

    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:py-16">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white/92 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-900">Accès Ministère</span>
        <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-[-0.04em] text-slate-950 sm:text-7xl">Porte d’entrée opérationnelle.</h1>
        <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Une entrée réservée pour consulter la carte des quais, suivre les pirogues, lire les débarquements, traiter les alertes et organiser les programmes terrain.</p>
        <div className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-3">
          {[
            ["Carte", "Quais, pirogues, positions et alertes."],
            ["Programmes", "Besoins, priorités et partenaires."],
            ["Suivi", "Débarquements, volumes et actions." ]
          ].map(([title, text]) => <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-black text-slate-950">{title}</p><p className="mt-2 text-xs font-bold leading-5 text-slate-500">{text}</p></div>)}
        </div>
      </div>

      <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <div className="rounded-2xl border border-[#0b3142] bg-[#0b3142] p-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Connexion simulée</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Espace Ministère</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-cyan-50">Accès de démonstration. Aucune authentification réelle dans cette version.</p>
        </div>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Identifiant</span><input readOnly value="ministere.peche@mbambulaan.demo" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none" /></label>
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Mot de passe</span><input readOnly type="password" value="simulation-ministere" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 outline-none" /></label>
        </div>
        <Link href="/espace-prive/etat" className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#0b3142] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#062330]">Entrer dans l'espace Ministère</Link>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-950">Données simulées pour démonstration institutionnelle. Les décisions restent validées par les services compétents.</p>
      </aside>
    </section>
  </main>;
}
