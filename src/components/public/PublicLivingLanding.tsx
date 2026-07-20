import Link from "next/link";
import { publicAgenda, publicPrograms, publicStories } from "@/data/publicEditorialContent";
import { PublicSiteHeader } from "./PublicSiteHeader";
import { PublicStoryVisual } from "./PublicStoryVisual";

export function PublicLivingLanding() {
  const featured = publicStories[0];
  const latest = publicStories.slice(1, 4);
  const leadProject = publicPrograms[0];

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicSiteHeader />

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] lg:grid-cols-[minmax(0,.9fr)_minmax(25rem,1.1fr)]">
          <div className="flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-600)]">La communauté de la pêche artisanale</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--mb-navy-900)]">Comprendre, partager et contribuer</h1>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-[var(--mb-neutral-600)]">Découvrez les métiers et les territoires, suivez les informations utiles et rejoignez des initiatives concrètes.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/publications" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white hover:bg-[var(--mb-navy-900)]">Voir les publications</Link>
              <Link href="/projets" className="inline-flex h-11 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] bg-white px-5 text-[11px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">Voir les projets</Link>
            </div>
          </div>

          <Link href={`/publications/${featured.slug}`} className="group relative border-t border-[var(--mb-neutral-200)] lg:border-l lg:border-t-0">
            <PublicStoryVisual story={featured} priorityLabel="À la une" />
            <div className="border-t border-[var(--mb-neutral-200)] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]"><span>{featured.category}</span><span>·</span><span>{featured.readingTime}</span></div>
              <h2 className="mt-3 max-w-3xl text-[22px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{featured.title}</h2>
              <p className="mt-3 max-w-2xl text-[11px] leading-5 text-[var(--mb-neutral-600)]">{featured.excerpt}</p>
              <span className="mt-4 inline-flex text-[10px] font-bold text-[var(--mb-ocean-600)]">Lire la publication →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto grid max-w-[84rem] divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          <article className="p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-ocean-400)]">Projet ouvert</p><h2 className="mt-3 text-[17px] font-semibold">{leadProject.title}</h2><p className="mt-2 text-[10px] leading-5 text-white/60">{leadProject.summary}</p><Link href="/projets" className="mt-4 inline-flex text-[10px] font-bold text-[var(--mb-sand-300)]">Découvrir le projet →</Link></article>
          <article className="p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-ocean-400)]">Prochain rendez-vous</p><p className="mt-3 font-mono text-[22px] font-semibold text-[var(--mb-sand-300)]">{publicAgenda[0].date}</p><h2 className="mt-2 text-[17px] font-semibold">{publicAgenda[0].title}</h2><p className="mt-2 text-[10px] text-white/55">{publicAgenda[0].location} · {publicAgenda[0].format}</p></article>
          <article className="p-5 sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-ocean-400)]">Participer</p><h2 className="mt-3 text-[17px] font-semibold">Témoigner, relayer ou contribuer</h2><p className="mt-2 text-[10px] leading-5 text-white/60">Acteur de terrain, organisation, expert, partenaire ou particulier : chacun peut trouver sa place.</p><Link href="/contact" className="mt-4 inline-flex text-[10px] font-bold text-[var(--mb-sand-300)]">Nous contacter →</Link></article>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Dernières publications</p><h2 className="mt-2 text-[clamp(1.45rem,3vw,2rem)] font-semibold leading-tight text-[var(--mb-navy-900)]">La filière en mouvement</h2></div><Link href="/publications" className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Toutes les publications →</Link></div>
          <div className="mt-7 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] lg:grid-cols-3">
            {latest.map((story) => <Link key={story.slug} href={`/publications/${story.slug}`} className="group min-w-0 bg-white"><PublicStoryVisual story={story} compact /><div className="p-5"><p className="font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]">{story.category} · {story.readingTime}</p><h3 className="mt-3 text-[18px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{story.title}</h3><p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{story.excerpt}</p></div></Link>)}
          </div>
        </div>
      </section>

      <section className="bg-[var(--mb-offwhite)]">
        <div className="mx-auto grid max-w-[84rem] gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-10 lg:py-16">
          <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Construire avec les acteurs</p><h2 className="mt-2 max-w-4xl text-[clamp(1.4rem,3vw,1.9rem)] font-semibold leading-tight text-[var(--mb-navy-900)]">Une expérience, une information ou une initiative à partager ?</h2><p className="mt-3 max-w-2xl text-[12px] leading-6 text-[var(--mb-neutral-600)]">Faites connaître un besoin, un événement, une expertise ou une possibilité de partenariat.</p></div>
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">Participer</Link>
        </div>
      </section>
    </main>
  );
}
