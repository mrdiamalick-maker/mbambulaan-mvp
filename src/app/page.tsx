import Link from "next/link";
import { SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

const flow = [
  ["Signal terrain", "Un incident, une tension ou une donnée remonte depuis un quai."],
  ["Analyse territoriale", "Mbàmbulaan relie quai, programme, budget, ressource et preuve."],
  ["Coordination", "Les référents, institutions et partenaires voient l’action utile."],
  ["Décision / rapport", "Une note, une action et une trace restent documentées."]
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

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.22),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(16,185,129,0.18),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1fr] lg:items-center lg:py-24">
        <div>
          <StatusBadge tone="blue">Solution B2B de coordination territoriale</StatusBadge>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            Transformer les signaux terrain en décisions traçables.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
            Mbàmbulaan aide les institutions, collectivités, programmes et partenaires à passer d’informations dispersées à une action coordonnée, documentée et défendable.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="rounded-full bg-cyan-700 px-6 py-3 text-center text-sm font-black text-white shadow-sm shadow-cyan-900/20">
              Demander un essai
            </Link>
            <Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-6 py-3 text-center text-sm font-black text-cyan-950">
              Se connecter
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-3">
            <p className="rounded-2xl bg-white/80 p-3 ring-1 ring-cyan-100">Pas une marketplace.</p>
            <p className="rounded-2xl bg-white/80 p-3 ring-1 ring-cyan-100">Pas un tableau de bord générique.</p>
            <p className="rounded-2xl bg-white/80 p-3 ring-1 ring-cyan-100">Un système de coordination.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl shadow-cyan-950/10">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Aperçu analytique</p>
                <h2 className="mt-2 text-2xl font-black">Vision nationale → quai → action → trace</h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black ring-1 ring-white/15">Simulation</span>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
              <div className="relative min-h-80 overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_24%_20%,rgba(34,211,238,0.24),transparent_26%),linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] ring-1 ring-white/10">
                <div className="absolute left-[30%] top-8 h-[84%] w-10 rounded-full border-l-4 border-cyan-200/40" />
                {[
                  ["Saint-Louis", "Forte", 24, 12, "bg-amber-300"],
                  ["Kayar", "Forte", 38, 36, "bg-amber-300"],
                  ["Dakar", "Faible", 30, 48, "bg-emerald-300"],
                  ["Mbour", "Moyenne", 50, 64, "bg-yellow-300"],
                  ["Joal", "Critique", 58, 76, "bg-rose-400"]
                ].map(([name, level, x, y, tone]) => (
                  <div key={name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                    <span className={`block rounded-full border-4 border-white ${tone} ${name === "Joal" ? "h-10 w-10 shadow-lg shadow-rose-500/30" : "h-7 w-7"}`} />
                    <span className="mt-1 block -translate-x-1/3 rounded-full bg-white/90 px-2 py-1 text-[0.65rem] font-black text-cyan-950">{name}</span>
                    <span className="sr-only">{level}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                <MetricPreview label="Priorité Joal" value="92" suffix="/100" />
                <MetricPreview label="Budget exécuté" value="61" suffix="%" />
                <MetricPreview label="Preuves validées" value="5" suffix="" />
              </div>
            </div>
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
              <p className="mt-1 text-sm font-bold text-slate-600">Froid, budget, référents et preuve terrain convergent vers une note d’arbitrage.</p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section id="solution" className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-3">
        <SectionCard title="Lire" description="Unifier des signaux terrain dispersés.">
          <p className="text-sm font-semibold leading-6 text-slate-600">Quais, budgets, incidents, ressources et preuves sont reliés dans une même lecture opérationnelle.</p>
        </SectionCard>
        <SectionCard title="Décider" description="Transformer la lecture en priorité concrète.">
          <p className="text-sm font-semibold leading-6 text-slate-600">La plateforme indique ce qu’il faut regarder, pourquoi c’est important et quelle action lancer.</p>
        </SectionCard>
        <SectionCard title="Tracer" description="Conserver la preuve et préparer le rapport.">
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

function MetricPreview({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  const numeric = Number(value);
  const degrees = Number.isFinite(numeric) ? Math.min(100, numeric) * 3.6 : 0;

  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(#67e8f9 ${degrees}deg, rgba(255,255,255,.18) 0deg)` }}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-950 text-xs font-black text-white">{value}{suffix}</span>
        </span>
        <span className="text-sm font-black text-white/85">{label}</span>
      </div>
    </div>
  );
}
