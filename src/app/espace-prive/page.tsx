import Link from "next/link";

const spaces = [
  { number: "01", title: "Atlas maritime", role: "Observer", description: "Quais, pirogues, débarquements, zones et alertes réunis dans une lecture géographique commune.", signal: "8 quais · 5 alertes ouvertes" },
  { number: "02", title: "Filière & programmes", role: "Coordonner", description: "Les besoins terrain deviennent des programmes qualifiés, reliés à des partenaires et à des preuves.", signal: "6 besoins · 4 programmes" },
  { number: "03", title: "Pilotage institutionnel", role: "Décider", description: "Situation du jour, risques, arbitrages et exports pour une décision publique documentée.", signal: "10 indicateurs · 3 actions en retard" },
];

const signals = [
  { time: "10:18", place: "Saint-Louis", title: "Retour de pirogue à confirmer", level: "Urgent", color: "text-red-700" },
  { time: "09:58", place: "Joal-Fadiouth", title: "Besoin de glace qualifié", level: "Vigilance", color: "text-amber-700" },
  { time: "09:35", place: "Mbour", title: "Maintenance froid à coordonner", level: "À traiter", color: "text-[#0f6b7a]" },
];

export default function EspacePrivePortalPage() {
  return <main className="min-h-screen bg-[#eef2f2] text-slate-900">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center bg-[#062330] text-xs font-black text-white">Mb</span><span><span className="block text-base font-semibold text-[#062330]">Mbàmbulaan</span><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Coordination maritime</span></span></Link><div className="flex items-center gap-3"><span className="hidden text-xs font-semibold text-slate-500 sm:block">Espace de démonstration</span><Link href="/" className="text-sm font-bold text-[#0f6b7a]">Retour au site</Link></div></div></header>

    <section className="mx-auto max-w-[92rem] px-5 py-8 sm:px-8 lg:py-12">
      <div className="grid overflow-hidden border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,42,55,.09)] lg:grid-cols-[minmax(0,1.3fr)_minmax(22rem,.7fr)]">
        <div className="border-b border-slate-200 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#0f6b7a]">Accès institutionnel simulé</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-[#062330] sm:text-6xl">Un espace commun pour observer, coordonner et décider.</h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600">Mbàmbulaan relie la situation maritime, les besoins des communautés et le pilotage institutionnel dans une console privée conçue pour les équipes publiques et leurs partenaires.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/espace-prive/etat" className="inline-flex h-11 items-center justify-center bg-[#0b3142] px-5 text-sm font-bold text-white transition hover:bg-[#062330]">Ouvrir l’espace Ministère</Link><Link href="/devis" className="inline-flex h-11 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cadrer un pilote</Link></div>
          <div className="mt-10 grid border-y border-slate-200 sm:grid-cols-3">{spaces.map((space) => <article key={space.title} className="border-b border-slate-100 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#0f6b7a]">{space.number}</span><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{space.role}</span></div><h2 className="mt-4 text-lg font-semibold text-[#102a43]">{space.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{space.description}</p><p className="mt-4 text-xs font-bold text-[#0f6b7a]">{space.signal}</p></article>)}</div>
        </div>

        <aside className="bg-[#f8faf9] p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Situation simulée</p><h2 className="mt-1 text-xl font-semibold text-[#062330]">Signaux opérationnels</h2></div><span className="inline-flex items-center gap-2 text-[11px] font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Consolidé</span></div>
          <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">{signals.map((signal) => <div key={signal.title} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 py-4"><p className="text-xs font-bold text-[#0f6b7a]">{signal.time}</p><div><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-[#102a43]">{signal.title}</p><span className={`text-[10px] font-bold ${signal.color}`}>● {signal.level}</span></div><p className="mt-1 text-xs text-slate-500">{signal.place}</p></div></div>)}</div>
          <div className="mt-8 border-l-2 border-[#0f6b7a] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0f6b7a]">Cadre de confiance</p><p className="mt-2 text-sm leading-6 text-slate-600">Les données présentées sont locales et simulées. Mbàmbulaan assiste la lecture et conserve la trace; les agents restent responsables de la vérification et de la décision.</p></div>
          <Link href="/espace-prive/etat" className="mt-6 flex h-11 w-full items-center justify-between bg-[#0f6b7a] px-4 text-sm font-bold text-white hover:bg-[#0b5260]"><span>Entrer dans la console</span><span>→</span></Link>
        </aside>
      </div>
      <p className="mt-5 text-center text-xs text-slate-500">Simulation Mbàmbulaan · Ministère des Pêches · Données mockées · Validation humaine</p>
    </section>
  </main>;
}
