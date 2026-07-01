import Link from "next/link";
import type { ReactNode } from "react";

const publicPreview = {
  console: [
    "Signal terrain détecté : Joal / conservation",
    "Besoin financement qualifié : chaîne du froid",
    "Programme partenaire identifié : appui quai",
    "Décision recommandée : cadrer un pilote Joal",
    "Note de synthèse prête avec limites de preuve"
  ],
  nodes: [
    { label: "Quai", x: 10, y: 62 },
    { label: "Collectivité", x: 30, y: 34 },
    { label: "ONG", x: 52, y: 55 },
    { label: "Ministère", x: 72, y: 24 },
    { label: "Entreprise", x: 88, y: 66 }
  ],
  metrics: [
    { label: "Signaux qualifiés", value: "12" },
    { label: "Acteurs reliés", value: "7" },
    { label: "Décision proposée", value: "1" }
  ]
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#112f36]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#102f3a] text-sm font-black text-white">Mb</span>
          <span>
            <strong className="block text-sm font-black tracking-tight text-[#102f3a]">Mbàmbulaan</strong>
            <small className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#718086]">Coordination OS</small>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-black text-[#50636a] md:flex">
          <Link href="/demo">Démo</Link>
          <Link href="/demande-demo">Demander une démo</Link>
          <Link href="/devis" className="rounded-full border border-[#cbd9dc] bg-white px-4 py-2 text-[#102f3a] shadow-sm">Cadrer un pilote</Link>
        </nav>
        <Link href="/demo" className="rounded-full bg-[#0d6f8d] px-4 py-3 text-xs font-black text-white md:hidden">Démo</Link>
      </header>
      {children}
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-sm font-bold text-[#65767c] sm:px-8 md:flex-row md:items-center md:justify-between">
        <span>Mbàmbulaan transforme les signaux terrain en décisions coordonnées.</span>
        <span>Public → démo par rôle → espace privé contextualisé.</span>
      </footer>
    </main>
  );
}

function Cta({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-black shadow-sm transition hover:-translate-y-0.5 ${
        secondary
          ? "border border-[#ccdadd] bg-white text-[#102f3a]"
          : "bg-[#0d6f8d] text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0d6f8d]">{children}</p>;
}

function MiniCockpit() {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-[#102f3a] p-4 shadow-2xl">
      <div className="rounded-[1.55rem] bg-[#f9fbf8] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#0d6f8d]">Console de coordination</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#102f3a]">Joal / Petite-Côte</h2>
          </div>
          <span className="rounded-full bg-[#fff2cf] px-3 py-2 text-xs font-black text-[#6b4a00]">Tension forte</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {publicPreview.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-[#dde8e9] bg-white p-4">
              <p className="text-3xl font-black text-[#102f3a]">{metric.value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#6b7a80]">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative min-h-[16rem] overflow-hidden rounded-[1.5rem] bg-[#e7f0ee] p-4">
            <div className="absolute inset-x-10 top-1/2 h-px bg-[#7aa2a0]" />
            <div className="absolute left-1/2 top-10 h-[11rem] w-px bg-[#7aa2a0]" />
            {publicPreview.nodes.map((node) => (
              <div
                key={node.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <span className="mx-auto block h-4 w-4 rounded-full border-2 border-white bg-[#0d6f8d] shadow-lg" />
                <span className="mt-2 block rounded-full bg-white/90 px-2 py-1 text-[0.65rem] font-black text-[#102f3a] shadow-sm">{node.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-[1.5rem] bg-[#0f2630] p-4 text-white">
            {publicPreview.console.map((line, index) => (
              <div key={line} className="flex gap-3 border-b border-white/10 py-3 last:border-b-0">
                <span className="font-black text-white/35">0{index + 1}</span>
                <p className="text-sm font-semibold leading-6 text-white/80">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div>
          <Eyebrow>Pêche artisanale · infrastructure de coordination</Eyebrow>
          <h1 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.055em] text-[#102f3a] sm:text-7xl">
            L’infrastructure de coordination de la pêche artisanale.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-[#4d6269]">
            Mbàmbulaan connecte les acteurs, qualifie les signaux, organise les décisions et transforme les données terrain en services utiles.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Cta href="/demo">Lancer la démo</Cta>
            <Cta href="/devis" secondary>Cadrer un pilote</Cta>
          </div>
        </div>
        <MiniCockpit />
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-2 lg:grid-cols-5">
        {["Voir", "Comprendre", "Coordonner", "Décider", "Prouver"].map((verb) => (
          <article key={verb} className="rounded-[1.5rem] border border-[#d9e4e6] bg-white p-5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">Rendre possible</span>
            <h2 className="mt-3 text-2xl font-black text-[#102f3a]">{verb}</h2>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>Pourquoi Mbàmbulaan</Eyebrow>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.045em] text-[#102f3a]">
            La filière n’a pas besoin d’un dashboard public. Elle a besoin d’un système d’orchestration.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Information dispersée entre terrain, programmes et institutions.",
            "Coordination faible entre quais, acteurs, financeurs et services.",
            "Décisions difficiles faute de preuve lisible.",
            "Services inexistants parce que la donnée n’est pas qualifiée."
          ].map((item) => (
            <div key={item} className="rounded-[1.35rem] border border-[#d9e4e6] bg-white p-5 text-sm font-bold leading-6 text-[#4d6269] shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="rounded-[2rem] bg-[#102f3a] p-6 text-white shadow-2xl md:p-8">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">Démo par rôle</p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.045em]">Découvrez l’espace qui correspond à votre décision.</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                Ministère, ONG, collectivité, entreprise, organisation ou acteur terrain : chaque démo ouvre un cockpit différent.
              </p>
            </div>
            <Cta href="/demo">Découvrir par rôle</Cta>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export function ModuleGate({ title }: { title: string }) {
  return (
    <Shell>
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <Eyebrow>Module privé</Eyebrow>
        <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.05em] text-[#102f3a]">{title} n’est pas un accès public.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-8 text-[#52656f]">
          Cette fonctionnalité appartient à un espace privé ou à une démo personnalisée selon le rôle.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Cta href="/demo">Choisir une démo</Cta>
          <Cta href="/espace-prive" secondary>Comprendre les espaces privés</Cta>
        </div>
      </section>
    </Shell>
  );
}
