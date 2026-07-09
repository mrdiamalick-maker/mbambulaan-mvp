import Link from "next/link";

const modules = [
  {
    title: "Cartographie high-level",
    eyebrow: "Quais et pirogues",
    description:
      "Vue des quais sur le littoral, pirogues en mer, débarquements, alertes et détail au clic.",
    metrics: "5 zones suivies",
  },
  {
    title: "Valorisation communautaire",
    eyebrow: "Terrain vers programme",
    description:
      "Besoin terrain, qualification, programme, partenaire, action prioritaire et suivi d'impact.",
    metrics: "12 actions ouvertes",
  },
  {
    title: "Pilotage high-level",
    eyebrow: "Preuve et synthèse",
    description:
      "KPI, volumes, alertes, actions, synthèse institutionnelle et export de suivi.",
    metrics: "4 rapports prêts",
  },
];

const consoleSignals = [
  ["Joal", "Tension forte", "Débarquements sardiniers à qualifier"],
  ["Kayar", "Alerte météo", "Pirogues à suivre avant retour"],
  ["Saint-Louis", "Programme actif", "Formation froid et traçabilité"],
];

export default function EspacePrivePortalPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8f7] text-slate-950">
      <header className="border-b border-cyan-950/10 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#07384a] text-sm font-black text-white shadow-sm">
              Mb
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black tracking-tight">Mbàmbulaan</span>
              <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-cyan-800 sm:block">
                Maritime Product Console
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/demande-demo"
              className="hidden rounded-xl border border-cyan-950/10 bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 sm:inline-flex"
            >
              Demander une démo
            </Link>
            <Link
              href="/espace-prive/etat"
              className="rounded-xl bg-[#07384a] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#052c3b]"
            >
              Entrer
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[88rem] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:py-14">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-cyan-950/10 bg-[linear-gradient(135deg,#ffffff_0%,#f1fbfb_45%,#f8f1df_100%)] p-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-900">
              Socle open-source · composants utiles uniquement
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-[-0.045em] text-slate-950 sm:text-7xl">
              Console maritime pour coordonner la pêche artisanale.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-slate-600">
              Une interface privée pour lire le littoral, qualifier les besoins terrain, suivre les pirogues et transformer les signaux en actions documentées.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/espace-prive/etat"
                className="rounded-2xl bg-[#07384a] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#052c3b]"
              >
                Ouvrir l'espace Ministère
              </Link>
              <Link
                href="/devis"
                className="rounded-2xl border border-cyan-950/10 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                Cadrer un pilote
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {modules.map((module) => (
              <article
                key={module.title}
                className="rounded-[1.5rem] border border-cyan-950/10 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">{module.eyebrow}</p>
                <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">{module.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{module.description}</p>
                <p className="mt-5 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-950">{module.metrics}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-cyan-950/10 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.1)] sm:p-6">
          <div className="rounded-[1.5rem] bg-[#07384a] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Accès simulé</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Espace Ministère</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50">
              Démonstration privée avec données locales. Les cartes sont structurées pour une future évolution Leaflet ou MapLibre.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {consoleSignals.map(([place, level, detail]) => (
              <div key={place} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-slate-950">{place}</p>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-amber-900">
                    {level}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-5 text-slate-600">{detail}</p>
              </div>
            ))}
          </div>

          <Link
            href="/espace-prive/etat"
            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b5f5a]"
          >
            Accéder à la console maritime
          </Link>
          <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold leading-5 text-slate-500">
            Version de démonstration : pas d'authentification réelle, pas de base de données, aucune décision automatique.
          </p>
        </aside>
      </section>
    </main>
  );
}
