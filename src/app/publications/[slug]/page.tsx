import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { PublicStoryVisual } from "@/components/public/PublicStoryVisual";
import { getPublicStory, publicStories } from "@/data/publicEditorialContent";

export function generateStaticParams() {
  return publicStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = getPublicStory(slug);
  return story ? { title: story.title + " — Mbàmbulaan", description: story.excerpt } : {};
}

export default async function PublicStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getPublicStory(slug);
  if (!story) notFound();
  const related = publicStories.filter((item) => item.slug !== story.slug).slice(0, 3);

  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <PublicSiteHeader />
    <article>
      <header className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[76rem] px-5 pb-9 pt-6 sm:px-8 lg:px-10 lg:pb-12">
          <nav className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-600)]" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link><span>›</span><Link href="/publications">Publications</Link><span>›</span><span className="text-[var(--mb-ocean-600)]">{story.category}</span></nav>
          <div className="mt-7 max-w-5xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--mb-ocean-600)]">{story.kicker}</p><h1 className="mt-4 text-[clamp(2rem,4.5vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-[var(--mb-navy-900)]">{story.title}</h1><p className="mt-5 max-w-3xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">{story.excerpt}</p><div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--mb-neutral-400)]"><span>{story.publishedAt}</span><span>·</span><span>{story.readingTime}</span><span>·</span><span>{story.location}</span></div></div>
        </div>
      </header>
      <div className="mx-auto max-w-[76rem] px-5 py-7 sm:px-8 lg:px-10"><PublicStoryVisual story={story} /></div>
      <div className="mx-auto grid max-w-[76rem] gap-8 px-5 pb-14 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:px-10 lg:pb-20">
        <div className="max-w-3xl"><p className="border-l-4 border-[var(--mb-ocean-600)] pl-5 text-[16px] font-medium leading-7 text-[var(--mb-navy-900)]">{story.lead}</p><div className="mt-10 grid gap-10">{story.sections.map((section) => <section key={section.title}><h2 className="text-[24px] font-semibold leading-tight text-[var(--mb-navy-900)]">{section.title}</h2><div className="mt-4 grid gap-4 text-[14px] leading-7 text-[var(--mb-neutral-600)]">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div></div>
        <aside className="self-start border-t-2 border-[var(--mb-navy-900)] bg-white lg:sticky lg:top-6"><p className="px-4 pt-4 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">À retenir</p><dl className="mt-2 divide-y divide-[var(--mb-neutral-100)]">{story.keyFacts.map((fact) => <div key={fact.label} className="px-4 py-4"><dt className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-400)]">{fact.label}</dt><dd className="mt-2 text-[13px] font-semibold leading-5 text-[var(--mb-navy-900)]">{fact.value}</dd></div>)}</dl><div className="border-t border-[var(--mb-neutral-200)] p-4"><Link href="/contact" className="inline-flex min-h-10 w-full items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-3 text-[10px] font-bold text-white">Échanger sur ce sujet</Link></div></aside>
      </div>
    </article>
    <section className="border-t border-[var(--mb-neutral-200)] bg-white"><div className="mx-auto max-w-[84rem] px-5 py-12 sm:px-8 lg:px-10"><div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">À poursuivre</p><h2 className="mt-2 text-[24px] font-semibold text-[var(--mb-navy-900)]">Autres lectures</h2></div><Link href="/publications" className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Toutes les publications →</Link></div><div className="mt-7 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-3">{related.map((item) => <Link key={item.slug} href={`/publications/${item.slug}`} className="group bg-white p-5"><p className="font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]">{item.category} · {item.location}</p><h3 className="mt-3 text-[17px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{item.title}</h3><p className="mt-3 text-[10px] leading-5 text-[var(--mb-neutral-600)]">{item.excerpt}</p></Link>)}</div></div></section>
  </main>;
}
