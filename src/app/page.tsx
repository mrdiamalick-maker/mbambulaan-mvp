import Link from "next/link";
import { PublicNav, SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";
import { globalKpis } from "@/data/mockMbambulaan";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicNav />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <StatusBadge tone="blue">Infrastructure de coordination</StatusBadge>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">L'operating system de la pêche artisanale sénégalaise.</h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Mbàmbulaan transforme les signaux terrain en décisions coordonnées, preuves exploitables et rapports utiles pour institutions, programmes, collectivités et partenaires.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-black text-white">Explorer la démo</Link>
            <Link href="/devis" className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-black text-slate-900">Cadrer un pilote</Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-200">Aperçu control room</p><h2 className="mt-2 text-2xl font-black">Petite-Côte · Joal</h2></div>
              <StatusBadge tone="amber">Tension forte</StatusBadge>
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
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-3">
        <SectionCard title="Pourquoi Mbàmbulaan ?" description="La filière ne manque pas seulement d'écrans. Elle manque d'une couche de coordination fiable."><p className="text-sm font-semibold leading-6 text-slate-600">La plateforme relie signaux, acteurs, financements, actions et preuves dans un parcours lisible.</p></SectionCard>
        <SectionCard title="Pour qui ?" description="Institutions, ONG, collectivités, organisations, entreprises et partenaires."><p className="text-sm font-semibold leading-6 text-slate-600">Chaque rôle voit une expérience différente, avec ses décisions, ses indicateurs et ses limites.</p></SectionCard>
        <SectionCard title="Ce que l'on achète" description="Un espace de coordination premium, pas une marketplace publique."><p className="text-sm font-semibold leading-6 text-slate-600">Après cadrage, l'organisation accède à un espace privé simulé puis à un futur workspace réel.</p></SectionCard>
      </section>
      <section className="bg-slate-950 px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-200">Prochaine étape</p><h2 className="mt-2 text-3xl font-black">Choisir une démo adaptée au rôle du prospect.</h2></div>
          <Link href="/demo" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-slate-950">Lancer la démo</Link>
        </div>
      </section>
    </main>
  );
}
