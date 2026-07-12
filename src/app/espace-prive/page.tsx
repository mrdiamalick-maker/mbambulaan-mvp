import Link from "next/link";

const missionLines = [
  ["Atlas maritime", "Observer les quais, les pirogues, les débarquements et les alertes."],
  ["Filière & programmes", "Qualifier les signaux terrain et coordonner les réponses."],
  ["Pilotage institutionnel", "Arbitrer, tracer les décisions et préparer les transmissions."],
];

export default function EspacePrivePortalPage() {
  return <main data-private-console className="min-h-screen bg-[var(--mb-navy-900)] text-white">
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,3fr)_minmax(25rem,2fr)]">
      <section className="flex min-h-[52vh] flex-col border-b border-white/10 px-6 py-6 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-14 lg:py-8">
        <header className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-[2px] bg-[var(--mb-sand-300)] text-[10px] font-black text-[var(--mb-navy-900)]">Mb</span><div><p className="text-[13px] font-bold">Mbàmbulaan</p><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/45">Console de Coordination Maritime</p></div></header>

        <div className="my-auto max-w-3xl py-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">Pêche artisanale sénégalaise</p>
          <h1 className="mt-4 max-w-2xl text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-[var(--mb-offwhite)] sm:text-[28px]">Coordonner la filière pêche artisanale, avec des données vérifiées.</h1>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {missionLines.map(([title, description], index) => <div key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4"><span className="font-mono text-[10px] text-[var(--mb-ocean-400)]">0{index + 1}</span><div><h2 className="text-[13px] font-semibold text-white">{title}</h2><p className="mt-1 text-[11px] leading-5 text-white/55">{description}</p></div></div>)}
          </div>
          <div className="mt-7 grid grid-cols-3 border border-white/10 bg-white/[0.03]"><TrustNumber value="8" label="Quais suivis" /><TrustNumber value="323" label="Pirogues actives" /><TrustNumber value="10:45" label="Dernière synchronisation" /></div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[9px] text-white/35"><span>MBÀMBULAAN · VERSION PILOTE 0.1</span><span>Support technique · Epic Conseil</span></footer>
      </section>

      <section className="flex min-h-[48vh] items-center bg-[var(--mb-offwhite)] px-6 py-10 text-[var(--mb-neutral-900)] sm:px-10 lg:min-h-screen lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.11em] text-[var(--mb-ocean-600)]">Accès institutionnel</p>
          <h2 className="mt-3 text-[24px] font-semibold text-[var(--mb-navy-900)]">Ouvrir l’espace Ministère</h2>
          <p className="mt-2 text-[12px] leading-5 text-[var(--mb-neutral-600)]">Simulation locale destinée à la présentation du dispositif de coordination.</p>

          <form className="mt-8 grid gap-4">
            <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">Organisation
              <select defaultValue="ministere" className="h-10 rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-3 text-[12px] font-semibold outline-none focus:border-[var(--mb-ocean-600)]"><option value="ministere">Ministère des Pêches</option><option value="direction">Direction technique</option><option value="partenaire">Partenaire de programme</option></select>
            </label>
            <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">Identifiant
              <input defaultValue="demo.ministere" className="h-10 rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-3 font-mono text-[12px] outline-none focus:border-[var(--mb-ocean-600)]" />
            </label>
            <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">Code d’accès
              <input type="password" defaultValue="mbambulaan" className="h-10 rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-3 font-mono text-[12px] outline-none focus:border-[var(--mb-ocean-600)]" />
            </label>
            <Link href="/espace-prive/etat" className="mt-2 inline-flex h-11 items-center justify-between rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[12px] font-bold text-white hover:bg-[var(--mb-navy-900)]"><span>Accéder à la console</span><span aria-hidden="true">→</span></Link>
          </form>

          <div className="mt-6 border-l-2 border-[var(--mb-ocean-600)] bg-white px-3 py-3"><p className="text-[10px] font-semibold leading-4 text-[var(--mb-neutral-600)]">Accès tracé et réservé aux acteurs habilités de la filière.</p><p className="mt-1 font-mono text-[9px] text-[var(--mb-neutral-400)]">Données simulées · décisions validées par un agent</p></div>
        </div>
      </section>
    </div>
  </main>;
}

function TrustNumber({ value, label }: { value: string; label: string }) {
  return <div className="border-r border-white/10 px-3 py-3 last:border-r-0"><p className="font-mono text-[16px] font-semibold text-[var(--mb-sand-300)]">{value}</p><p className="mt-1 text-[9px] leading-3 text-white/40">{label}</p></div>;
}
