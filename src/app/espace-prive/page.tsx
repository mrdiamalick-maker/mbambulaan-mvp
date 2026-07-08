import Link from "next/link";

export default function EspacePrivePortalPage() {
  return <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.18),transparent_30%),linear-gradient(180deg,#edfdfa_0%,#f8fbfa_55%,#fff7e7_100%)] text-slate-950">
    <header className="border-b border-cyan-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</span><span><span className="block text-base font-black">Mbàmbulaan</span><span className="hidden text-xs font-bold text-cyan-700 sm:block">Accès institutionnel</span></span></Link>
        <Link href="/demande-demo" className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">Demander un essai</Link>
      </div>
    </header>

    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-center lg:py-20">
      <div>
        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Accès réservé Ministère</span>
        <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Connexion à la tour de contrôle institutionnelle.</h1>
        <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-slate-600">Accès réservé aux équipes autorisées du ministère et aux cellules de coordination. Cette entrée ouvre une simulation du hub souverain de supervision, coordination communautaire, prévention, projets et preuve d'impact.</p>
        <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            ["Supervision", "Quais, pirogues pilotes et signaux à qualifier."],
            ["Coordination", "Besoins terrain, campagnes, partenaires et projets."],
            ["Preuve", "Notes, arbitrages, pièces et impact institutionnel."]
          ].map(([title, text]) => <div key={title} className="rounded-[1.35rem] border border-cyan-100 bg-white/80 p-4 shadow-sm"><p className="text-sm font-black text-cyan-950">{title}</p><p className="mt-2 text-xs font-bold leading-5 text-slate-500">{text}</p></div>)}
        </div>
      </div>

      <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-5 shadow-[0_24px_70px_rgba(8,145,178,0.16)]">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Connexion simulée</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Espace Ministère</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-slate-600">Aucune authentification backend dans cette V1. Le bouton ouvre le hub ministère de démonstration.</p>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Identifiant institutionnel</span><input readOnly value="ministere.peche@mbambulaan.demo" className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-sm font-black text-cyan-950 outline-none" /></label>
          <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Mot de passe</span><input readOnly type="password" value="simulation-ministere" className="rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-sm font-black text-cyan-950 outline-none" /></label>
        </div>
        <Link href="/espace-prive/etat" className="mt-6 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-900/20">Entrer dans le hub ministère</Link>
        <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-950">Message de sécurité : accès réservé aux équipes autorisées du ministère et aux cellules de coordination. Données mockées pour démonstration.</p>
      </aside>
    </section>
  </main>;
}
