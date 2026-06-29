import Link from "next/link";
import { getWorkspace } from "@/components/experience/RoleWorkspaceV2";

const ws = getWorkspace("etat");
const levelClass: Record<string, string> = { stable: "bg-[#2f9e73]", watch: "bg-[#e6b84f]", high: "bg-[#e87c45]", critical: "bg-[#c64d4d]" };
const programs = [
  ["Programme froid artisanal", "ONG + Commune", "Joal", "à relier au pilote"],
  ["Appui qualité débarquement", "Service pêche", "Mbour", "actif"],
  ["Innovation caisses isothermes", "Entreprise locale", "Petite-Côte", "à qualifier"],
  ["Formation femmes transformatrices", "Programme partenaire", "Joal", "preuve partielle"]
];
const innovations = [
  ["Mini unité glace", "Impact potentiel élevé", "preuve économique à consolider"],
  ["Registre relais quai", "Faible coût", "déploiement terrain nécessaire"],
  ["Suivi qualité lot", "Risque réduit", "validation protocole requise"]
];

function Badge({ children }: { children: string }) {
  return <span className="rounded-full bg-[#edf5f5] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#102f3a]">{children}</span>;
}

function CompactTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Données opérationnelles</p>
      <h2 className="mt-2 text-2xl font-black text-[#102f3a]">{title}</h2>
      <div className="mt-5 grid gap-3">
        {rows.map((row) => (
          <div key={row.join("-")} className="grid gap-3 rounded-2xl bg-[#f3f7f7] p-4 md:grid-cols-[1fr_0.9fr_0.8fr_0.9fr]">
            {row.map((cell) => <span key={cell} className="text-sm font-bold leading-6 text-[#435861]">{cell}</span>)}
          </div>
        ))}
      </div>
    </article>
  );
}

export function InstitutionalCockpit() {
  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#112f36]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-black text-[#102f3a]"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#102f3a] text-sm text-white">Mb</span><span>Mbàmbulaan · Ministère</span></Link>
        <nav className="hidden items-center gap-6 text-sm font-black text-[#50636a] md:flex"><Link href="/demo">Changer de profil</Link><Link href="/devis">Cadrer pilote</Link></nav>
        <Badge>{ws.status}</Badge>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0d6f8d]">Cockpit institutionnel vivant</p>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.055em] text-[#102f3a] sm:text-7xl">Le ministère voit quoi arbitrer, avec qui et sur quelle preuve.</h1>
          <p className="mt-5 text-lg font-bold leading-8 text-[#52656f]">Mbàmbulaan ne remplace pas les outils publics. Il relie signaux, demandes, programmes, innovations et acteurs pour produire une décision coordonnable.</p>
          <div className="mt-7 flex flex-wrap gap-2"><Badge>Joal / Petite-Côte</Badge><Badge>Niveau de preuve visible</Badge><Badge>Note ministère simulée</Badge></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ws.kpis.map(([label, value, detail]) => (
            <article key={label} className="rounded-[1.5rem] border border-[#d9e4e6] bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">{label}</p>
              <p className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#102f3a]">{value}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#60727a]">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Carte stylisée</p><h2 className="mt-2 text-2xl font-black text-[#102f3a]">Territoires sous tension</h2></div><Badge>{ws.proof}</Badge></div>
          <div className="relative mt-5 min-h-[22rem] overflow-hidden rounded-[1.6rem] bg-[#e6efea]">
            <div className="absolute left-[27%] top-[10%] h-[82%] w-[42%] rounded-[45%] border border-[#93aaa5] bg-[#fbfdf8]" />
            <div className="absolute left-[41%] top-[20%] h-[66%] w-[28%] rounded-[45%] border border-[#b4c3bf]" />
            {ws.points.map(([label, x, y, level]) => <div key={label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}><span className={`block h-5 w-5 rounded-full border-2 border-white shadow-lg ${levelClass[level]}`} /><span className="mt-2 block rounded-full bg-white px-3 py-1 text-xs font-black text-[#102f3a] shadow-sm">{label}</span></div>)}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{ws.points.map(([label, , , level]) => <div key={label} className="rounded-2xl bg-[#f3f7f7] p-4 text-sm font-bold leading-6 text-[#52656f]"><strong className="block text-[#102f3a]">{label}</strong>Niveau : {level}</div>)}</div>
        </article>
        <article className="rounded-[2rem] bg-[#102f3a] p-6 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Diagnostic Mbàmbulaan</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Prioriser Joal pour un pilote froid.</h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-white/72">Le pilote froid a le meilleur ratio urgence, coordination possible et preuve disponible.</p>
          <div className="mt-6 grid gap-4">{ws.scores.map(([label, value, detail]) => <div key={label}><div className="mb-2 flex justify-between gap-3"><strong>{label}</strong><span className="font-black text-[#8fd8e5]">{value}%</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#8fd8e5]" style={{ width: `${value}%` }} /></div><p className="mt-1 text-xs font-bold text-white/55">{detail}</p></div>)}</div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-2"><CompactTable title="Demandes de financement" rows={ws.tableRows} /><CompactTable title="Programmes et innovations" rows={programs} /></section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Signaux chronologiques</p><h2 className="mt-2 text-2xl font-black text-[#102f3a]">Ce qui remonte du territoire</h2>
          <div className="mt-5 grid gap-3">{ws.signals.map(([time, title, source, proof]) => <div key={title} className="rounded-2xl bg-[#f3f7f7] p-4"><div className="flex justify-between gap-3"><span className="font-black text-[#0d6f8d]">{time}</span><span className="text-xs font-black uppercase tracking-[0.12em] text-[#61737b]">{proof}</span></div><h3 className="mt-2 font-black text-[#102f3a]">{title}</h3><p className="mt-1 text-sm font-bold text-[#52656f]">{source}</p></div>)}</div>
        </article>
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-5 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Innovations à qualifier</p><h2 className="mt-2 text-2xl font-black text-[#102f3a]">Ce qui peut devenir service ou programme.</h2>
          <div className="mt-5 grid gap-3">{innovations.map(([title, value, limit]) => <div key={title} className="rounded-2xl bg-[#f3f7f7] p-4"><strong className="block text-[#102f3a]">{title}</strong><span className="mt-1 block text-sm font-bold text-[#0d6f8d]">{value}</span><span className="mt-1 block text-sm font-bold text-[#52656f]">{limit}</span></div>)}</div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[2rem] bg-[#102f3a] p-6 text-white shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Note ministère simulée</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Décision recommandée</h2><p className="mt-4 text-sm font-semibold leading-6 text-white/72">Prioriser Joal pour un pilote froid, mobiliser commune, ONG et organisation professionnelle, puis consolider les preuves avant financement.</p>
          <div className="mt-6 grid gap-3">{ws.actions.map(([label, owner, , status], index) => <div key={label} className="grid gap-3 rounded-2xl bg-white/10 p-4 md:grid-cols-[auto_1fr_0.9fr]"><span className="font-black text-white/35">0{index + 1}</span><strong>{label}</strong><span className="text-sm font-semibold text-white/65">{owner} · {status}</span></div>)}</div>
        </article>
        <article className="rounded-[2rem] border border-[#d9e4e6] bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Preuve, limites et achat</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#102f3a]">Pourquoi financer Mbàmbulaan</h2><p className="mt-4 text-base font-bold leading-7 text-[#52656f]">{ws.valueResult}</p>
          <div className="mt-5 grid gap-3">{ws.limits.map((item) => <div key={item} className="rounded-2xl bg-[#fff4dc] p-4 text-sm font-bold leading-6 text-[#4f3c12]">{item}</div>)}</div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/devis" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-center text-sm font-black text-white">{ws.primaryCta}</Link><Link href="/demande-demo" className="rounded-full border border-[#cbd9dc] bg-white px-6 py-4 text-center text-sm font-black text-[#102f3a]">{ws.secondaryCta}</Link></div>
        </article>
      </section>
    </main>
  );
}
