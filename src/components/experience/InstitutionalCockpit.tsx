import Link from "next/link";

const kpis = [
  ["Territoires suivis", "03", "Joal, Kayar, Saint-Louis"],
  ["Signaux qualifiés", "12", "dont 4 à arbitrer"],
  ["Demandes financement", "08", "froid, moteurs, sécurité"],
  ["Programmes actifs", "05", "État, UE, JICA, ONG"],
  ["Innovations", "06", "trace, froid, transformation"],
  ["Décisions", "04", "note générable"]
];

const tensions = [
  ["Joal", "Tension forte", "glace, conservation, débouchés", "pilote froid"],
  ["Kayar", "Tension moyenne", "prix, logistique, conflits", "médiation"],
  ["Saint-Louis", "Surveillance", "sécurité, sortie en mer", "coordination"]
];

const decisions = [
  "Prioriser Joal pour un pilote froid et coordination mareyeurs",
  "Mandater une réunion commune Ministère, Commune et ONG",
  "Consolider les preuves sur demandes de financement",
  "Ouvrir un registre des innovations de la filière"
];

export function InstitutionalCockpit() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-black">Mbàmbulaan</Link>
        <nav className="hidden gap-6 text-sm font-bold text-[#425662] md:flex"><Link href="/demo">Changer de profil</Link><Link href="/devis">Cadrer pilote</Link></nav>
      </header>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">Espace État / Ministère</p><h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c]">Cockpit institutionnel de la filière.</h1><p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">Visualiser les données, repérer les tensions, suivre les programmes, arbitrer les demandes de financement et préparer les décisions.</p><div className="mt-6 rounded-3xl bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-[#0d3b4c]">Pourquoi le ministère revient chaque jour</h2><p className="mt-3 text-sm font-semibold leading-6 text-[#52656f]">Mbàmbulaan devient la couche de coordination : signaux terrain, programmes, financements, innovations, acteurs, décisions et preuves.</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{kpis.map(([label,value,detail])=><article key={label} className="rounded-3xl border border-[#dce5e8] bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">{label}</p><p className="mt-3 text-4xl font-black text-[#0d3b4c]">{value}</p><p className="mt-2 text-sm font-semibold text-[#64727a]">{detail}</p></article>)}</div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Tensions filière</p><h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">Ce qui demande arbitrage.</h2>{tensions.map(([zone,level,issue,action])=><div key={zone} className="mt-3 grid gap-3 rounded-2xl bg-[#f2f7f7] p-4 md:grid-cols-4"><strong>{zone}</strong><span className="font-black text-[#0d6f8d]">{level}</span><span className="text-sm font-semibold text-[#52656f]">{issue}</span><span className="text-sm font-black text-[#0d3b4c]">{action}</span></div>)}</article>
        <article className="rounded-[2rem] bg-[#0d3b4c] p-6 text-white shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Décisions recommandées</p><h2 className="mt-3 text-3xl font-black">Note prête à discuter.</h2>{decisions.map((d,i)=><div key={d} className="mt-4 flex gap-4 rounded-2xl bg-white/10 p-4"><span className="font-black text-white/45">0{i+1}</span><strong>{d}</strong></div>)}</article>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-2"><article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Programmes et innovations</p><h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">Mémoire opérationnelle.</h2>{["Programme résilience pêche", "Fonds équipement quai", "Innovation traçabilité", "Sensibilisation sécurité"].map((item)=><div key={item} className="mt-4 rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">{item}</div>)}</article><article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Valeur sponsor</p><h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">Pourquoi le ministère peut sponsoriser.</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Réflexe quotidien", "Donnée consolidée", "Programmes coordonnés", "Financements priorisés", "Rapports institutionnels", "Intégrations possibles"].map((item)=><div key={item} className="rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">{item}</div>)}</div><p className="mt-5 text-sm font-semibold leading-6 text-[#52656f]">Données simulées. En pilote, le niveau de preuve dépendra des conventions, relais terrain, partenaires et intégrations.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/demande-demo" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-center text-sm font-black text-white">Démo ministère</Link><Link href="/devis" className="rounded-full border border-[#d8e1e5] px-6 py-4 text-center text-sm font-black text-[#0d3b4c]">Cadrer pilote</Link></div></article></section>
    </main>
  );
}
