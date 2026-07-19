import Link from "next/link";
import { publicAgenda, publicPrograms, publicStories } from "@/data/publicEditorialContent";
import { PublicSiteHeader } from "./PublicSiteHeader";
import { PublicStoryVisual } from "./PublicStoryVisual";

export function PublicLivingLanding() {
  const featured = publicStories[0];
  const latest = publicStories.slice(1, 4);
  const leadProgram = publicPrograms[0];

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicSiteHeader />

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] lg:grid-cols-[minmax(0,.92fr)_minmax(28rem,1.08fr)]">
          <div className="flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mb-ocean-600)]">
              Pêche artisanale sénégalaise
            </p>
            <h1 className="mt-5 max-w-3xl text-[clamp(2.7rem,5.4vw,5.4rem)] font-semibold leading-[.96] tracking-[-0.035em] text-[var(--mb-navy-900)]">
              Comprendre la filière. Faire avancer ses initiatives.
            </h1>
            <p className="mt-7 max-w-xl text-[16px] leading-7 text-[var(--mb-neutral-600)]">
              Mbàmbulaan relie les réalités des quais, les besoins des communautés, les programmes à impact et la décision publique.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/decouvrir" className="inline-flex h-12 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[12px] font-bold text-white hover:bg-[var(--mb-navy-900)]">
                Explorer la filière
              </Link>
              <Link href="/espace-prive" className="inline-flex h-12 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] bg-white px-5 text-[12px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">
                Accès Ministère
              </Link>
            </div>
          </div>

          <Link href={"/decouvrir/" + featured.slug} className="group relative border-t border-[var(--mb-neutral-200)] lg:border-l lg:border-t-0">
            <PublicStoryVisual story={featured} priorityLabel="À la une" />
            <div className="border-t border-[var(--mb-neutral-200)] bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">
                <span>{featured.publishedAt}</span><span>·</span><span>{featured.readingTime}</span>
              </div>
              <h2 className="mt-3 max-w-3xl text-[24px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">
                {featured.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[12px] leading-6 text-[var(--mb-neutral-600)]">{featured.excerpt}</p>
              <span className="mt-5 inline-flex text-[11px] font-bold text-[var(--mb-ocean-600)]">Lire la publication →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-900)] text-white">
        <div className="mx-auto grid max-w-[84rem] divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          <article className="p-5 sm:p-6 lg:p-7">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-ocean-400)]">Programme en suivi</p>
            <h2 className="mt-3 text-[17px] font-semibold">{leadProgram.title}</h2>
            <p className="mt-2 text-[11px] text-white/55">{leadProgram.territory} · {leadProgram.beneficiaries}</p>
            <div className="mt-5 h-1.5 bg-white/10"><div className="h-full bg-[var(--mb-ocean-400)]" style={{ width: leadProgram.progress + "%" }} /></div>
            <p className="mt-2 font-mono text-[9px] text-white/55">{leadProgram.progress}% · {leadProgram.nextMilestone}</p>
          </article>
          <article className="p-5 sm:p-6 lg:p-7">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-ocean-400)]">Prochain rendez-vous</p>
            <p className="mt-3 font-mono text-[23px] font-semibold text-[var(--mb-sand-300)]">{publicAgenda[0].date}</p>
            <h2 className="mt-2 text-[17px] font-semibold">{publicAgenda[0].title}</h2>
            <p className="mt-2 text-[11px] text-white/55">{publicAgenda[0].location} · {publicAgenda[0].format}</p>
          </article>
          <article className="p-5 sm:p-6 lg:p-7">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-ocean-400)]">La plateforme</p>
            <h2 className="mt-3 text-[17px] font-semibold">Une lecture publique. Une capacité institutionnelle.</h2>
            <p className="mt-3 text-[11px] leading-5 text-white/60">Le site rend la filière et ses initiatives visibles. La console aide le Ministère à superviser, traiter et décider.</p>
            <Link href="/espace-prive/etat" className="mt-4 inline-flex text-[11px] font-bold text-[var(--mb-sand-300)]">Découvrir la console →</Link>
          </article>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Dernières publications</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-tight text-[var(--mb-navy-900)]">La filière en mouvement</h2>
            </div>
            <Link href="/decouvrir" className="text-[11px] font-bold text-[var(--mb-ocean-600)]">Voir toutes les publications →</Link>
          </div>
          <div className="mt-9 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] lg:grid-cols-3">
            {latest.map((story) => (
              <Link key={story.slug} href={"/decouvrir/" + story.slug} className="group bg-white">
                <PublicStoryVisual story={story} compact />
                <div className="p-5">
                  <p className="font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]">{story.category} · {story.readingTime}</p>
                  <h3 className="mt-3 text-[18px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{story.title}</h3>
                  <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{story.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--mb-offwhite)]">
        <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">Faire avec les acteurs</p>
            <h2 className="mt-3 max-w-4xl text-[32px] font-semibold leading-tight text-[var(--mb-navy-900)]">
              Une initiative, un besoin territorial ou un partenariat à construire ?
            </h2>
            <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">
              Partagez le contexte, le territoire et le résultat recherché. Mbàmbulaan aide à préparer un échange structuré.
            </p>
          </div>
          <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-5 text-[11px] font-bold text-white">
            Nous contacter
          </Link>
        </div>
      </section>
    </main>
  );
}
