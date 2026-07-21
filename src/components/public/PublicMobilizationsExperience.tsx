import Link from "next/link";
import { publicMobilizations } from "@/data/publicMobilizations";
import { PublicSiteHeader } from "./PublicSiteHeader";

const actionTypes = [
  ["Signaler", "Pollution, sécurité, pratique préoccupante ou situation à vérifier."],
  ["Mobiliser", "Faire connaître une cause, un engagement communautaire ou une action locale."],
  ["Contribuer", "Apporter une expertise, du matériel, un relais, un partenariat ou du temps."],
  ["Suivre", "Voir ce qui a été reçu, qualifié puis relayé vers les acteurs compétents."],
];

export function PublicMobilizationsExperience() {
  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <PublicSiteHeader />

    <section className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.55fr)] lg:items-end lg:px-10 lg:py-14">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Mobilisations</p>
          <h1 className="mt-3 max-w-4xl text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-[var(--mb-navy-900)]">Faire remonter les causes, organiser les contributions et obtenir un relais</h1>
          <p className="mt-4 max-w-3xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">Mbàmbulaan relie les communautés, les organisations, les partenaires et les autorités. Une contribution publique n'est pas seulement publiée : elle est qualifiée, rattachée à un territoire puis orientée vers le bon circuit de traitement.</p>
        </div>
        <div className="border-l-2 border-[var(--mb-sand-300)] bg-[var(--mb-offwhite)] p-5">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Besoin d'agir maintenant ?</p>
          <h2 className="mt-2 text-[19px] font-semibold text-[var(--mb-navy-900)]">Déposer une contribution structurée</h2>
          <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Choisissez le type de remontée, le territoire et les éléments utiles. Le MVP montre ensuite comment cette information rejoint le bureau opérationnel du Ministère.</p>
          <Link href="/contact" className="mt-5 inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[11px] font-bold text-white">Signaler ou mobiliser</Link>
        </div>
      </div>
    </section>

    <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
      <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 lg:px-10">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-400)]">Une chaîne unique de coordination</p>
        <div className="mt-5 grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {actionTypes.map(([title, text], index) => <article key={title} className="bg-[var(--mb-navy-900)] p-5"><span className="font-mono text-[9px] text-[var(--mb-sand-300)]">0{index + 1}</span><h2 className="mt-2 text-[16px] font-semibold">{title}</h2><p className="mt-2 text-[10px] leading-5 text-white/60">{text}</p></article>)}
        </div>
      </div>
    </section>

    <section className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto max-w-[84rem] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Causes actives</p><h2 className="mt-2 text-[clamp(1.45rem,3vw,2rem)] font-semibold text-[var(--mb-navy-900)]">Des mobilisations reliées aux acteurs compétents</h2></div><Link href="/contact" className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Proposer une cause →</Link></div>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {publicMobilizations.map((item) => <article key={item.id} className="flex min-w-0 flex-col border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-mono text-[9px] font-bold uppercase text-[var(--mb-ocean-600)]">{item.cause}</p><span className={`border px-2 py-1 text-[8px] font-bold uppercase ${item.urgency === "Critique" ? "border-[var(--mb-red-600)]/30 text-[var(--mb-red-600)]" : "border-[var(--mb-neutral-300)] text-[var(--mb-neutral-500)]"}`}>{item.urgency}</span></div>
            <h3 className="mt-3 text-[19px] font-semibold leading-tight text-[var(--mb-navy-900)]">{item.title}</h3>
            <p className="mt-2 text-[10px] font-bold text-[var(--mb-neutral-500)]">{item.territory}</p>
            <p className="mt-4 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{item.summary}</p>
            <dl className="mt-5 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] text-[10px]"><div className="py-3"><dt className="font-bold text-[var(--mb-neutral-400)]">Contribution recherchée</dt><dd className="mt-1 leading-5">{item.need}</dd></div><div className="py-3"><dt className="font-bold text-[var(--mb-neutral-400)]">Relais prévu</dt><dd className="mt-1 leading-5">{item.authorityRelay}</dd></div></dl>
            <div className="mt-auto flex items-center justify-between gap-3 pt-5"><span className="text-[9px] font-bold uppercase text-[var(--mb-neutral-500)]">{item.contributions} contributions</span><Link href="/contact" className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Contribuer →</Link></div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="bg-[var(--mb-offwhite)]">
      <div className="mx-auto grid max-w-[84rem] gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-10 lg:py-16">
        <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Transparence du parcours</p><h2 className="mt-2 text-[clamp(1.4rem,3vw,1.9rem)] font-semibold text-[var(--mb-navy-900)]">Soumis publiquement, traité dans un dossier unique</h2><p className="mt-3 max-w-3xl text-[12px] leading-6 text-[var(--mb-neutral-600)]">Le MVP distingue la publication publique de la validation institutionnelle. Une dénonciation ou une alerte reste déclarative tant qu'elle n'a pas été vérifiée. Le Ministère conserve son processus, ses responsables, ses preuves et ses décisions.</p></div>
        <Link href="/espace-prive/etat" className="inline-flex h-11 items-center justify-center border border-[var(--mb-neutral-300)] bg-white px-5 text-[11px] font-bold text-[var(--mb-navy-900)]">Voir le relais Ministère</Link>
      </div>
    </section>
  </main>;
}
