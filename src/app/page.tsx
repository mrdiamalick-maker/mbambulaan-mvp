import Link from "next/link";
import { SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

const flow = [
  ["Question", "Que se passe-t-il sur le terrain ?"],
  ["Insight", "Où agir, avec quelle preuve ?"],
  ["Exploration", "Quels quais, acteurs, budgets ou incidents ?"],
  ["Action", "Quelle décision préparer ?"],
  ["Trace", "Quelle preuve conserver ?"]
];

const useCases = [
  ["Ministère", "Tensions, budgets, incidents", "Arbitrer une priorité", "Pilotage institutionnel"],
  ["Collectivité", "Quais locaux, urgences", "Coordonner une réponse", "Territoire"],
  ["ONG / Programme", "Actions, preuves, risques", "Rendre compte", "Programme"],
  ["Organisation", "Membres, demandes, preuves", "Défendre un dossier", "Plaidoyer"],
  ["Entreprise", "Supply qualifié, risques", "Décider sans catalogue public", "Flux privé"],
  ["Investisseur", "Segments, offres, roadmap", "Lire le potentiel", "Data room"]
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4faf9] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-cyan-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</span>
            <span>
              <span className="block text-base font-black">Mbàmbulaan</span>
              <span className="hidden text-xs font-bold text-cyan-700 sm:block">Écosystème numérique au service de la pêche artisanale</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
            <Link href="#solution">Solution</Link>
            <Link href="#cas-usages">Cas d'usage</Link>
            <Link href="#cartographie">Aperçu</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/espace-prive" className="hidden rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950 sm:inline-flex">Se connecter</Link>
            <Link href="/demo" className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Demander un essai</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:py-24">
        <div>
          <StatusBadge tone="blue">Écosystème numérique au service de la pêche artisanale</StatusBadge>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            Voir, prioriser et documenter l’action terrain.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
            Mbàmbulaan transforme les signaux des quais en décisions coordonnées pour les institutions, programmes, collectivités et partenaires.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="rounded-full bg-cyan-700 px-6 py-3 text-center text-sm font-black text-white shadow-sm shadow-cyan-900/20">
              Demander un essai
            </Link>
            <Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-6 py-3 text-center text-sm font-black text-cyan-950">
              Se connecter
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl shadow-cyan-950/10">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Lecture progressive</p>
            <div className="mt-5 grid gap-3">
              {flow.map(([label, text], index) => (
                <div key={label} className="grid grid-cols-[2.35rem_1fr] gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-cyan-950">{index + 1}</span>
                  <span>
                    <span className="block text-sm font-black">{label}</span>
                    <span className="block text-xs font-semibold leading-5 text-white/70">{text}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-white p-4 text-cyan-950">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">Exemple</p>
              <p className="mt-2 text-2xl font-black">Joal critique</p>
              <p className="mt-1 text-sm font-bold text-slate-600">Froid, budget et preuve terrain convergent vers une note d’arbitrage.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-3">
        <SectionCard title="Question" description="Chaque vue commence par une décision à éclairer.">
          <p className="text-sm font-semibold leading-6 text-slate-600">Pas de dashboard générique : un problème institutionnel, une lecture, une prochaine action.</p>
        </SectionCard>
        <SectionCard title="Insight" description="La plateforme relie territoire, acteur, budget, ressource, incident et preuve.">
          <p className="text-sm font-semibold leading-6 text-slate-600">Les signaux deviennent des priorités visibles, comparables et défendables.</p>
        </SectionCard>
        <SectionCard title="Trace" description="Chaque décision peut produire une note, une preuve ou un historique.">
          <p className="text-sm font-semibold leading-6 text-slate-600">L’IA assiste. L’humain valide. La décision reste documentée.</p>
        </SectionCard>
      </section>

      <section id="cas-usages" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <StatusBadge tone="green">Cas d’usage</StatusBadge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Une matrice simple : acteur, lecture, décision.</h2>
          </div>
          <Link href="/demo/etat" className="rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white">Voir le scénario Ministère</Link>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-cyan-100 bg-white shadow-sm">
          <div className="grid bg-cyan-950 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-50 md:grid-cols-[0.85fr_1fr_1fr_0.85fr]">
            <span>Acteur</span>
            <span>Lecture</span>
            <span>Décision</span>
            <span>Module</span>
          </div>
          {useCases.map(([actor, read, decision, module]) => (
            <div key={actor} className="grid gap-2 border-t border-cyan-100 px-5 py-4 text-sm md:grid-cols-[0.85fr_1fr_1fr_0.85fr] md:items-center">
              <p className="font-black">{actor}</p>
              <p className="font-semibold text-slate-600">{read}</p>
              <p className="font-bold text-cyan-900">{decision}</p>
              <p className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{module}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cartographie" className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Aperçu solution" description="Une lecture analytique compacte, orientée action.">
          <div className="grid gap-3">
            {["Carte des quais", "Tensions", "Budgets", "Ressources", "Notes et preuves"].map((item, index) => (
              <div key={item} className="grid grid-cols-[2rem_1fr] gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-700 text-xs font-black text-white">{index + 1}</span>
                <span className="self-center text-sm font-black text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Espace privé Ministère" description="Le premier espace de référence est une solution institutionnelle de pilotage et de coordination.">
          <div className="rounded-[1.25rem] bg-gradient-to-br from-cyan-50 to-emerald-50 p-5">
            <p className="text-4xl font-black text-cyan-950">3 zones</p>
            <p className="mt-2 text-sm font-bold text-slate-600">Joal, Mbour et Saint-Louis demandent une lecture prioritaire.</p>
            <Link href="/espace-prive/etat" className="mt-5 inline-flex rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white">
              Entrer dans l’espace Ministère
            </Link>
          </div>
        </SectionCard>
      </section>

      <section className="bg-gradient-to-r from-cyan-950 via-teal-900 to-emerald-900 px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Démo qualifiée</p>
            <h2 className="mt-2 text-3xl font-black">Montrer le bon espace privé au bon décideur.</h2>
          </div>
          <Link href="/demo" className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-slate-950">
            Lancer la démo
          </Link>
        </div>
      </section>
    </main>
  );
}
