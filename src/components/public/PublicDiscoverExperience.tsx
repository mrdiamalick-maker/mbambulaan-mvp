"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publicAgenda, publicStories, type PublicStoryCategory } from "@/data/publicEditorialContent";
import { PublicSiteHeader } from "./PublicSiteHeader";
import { PublicStoryVisual } from "./PublicStoryVisual";

const categories: Array<"Tous" | PublicStoryCategory> = ["Tous", "Comprendre", "Métiers & communautés", "Initiatives", "Infos pratiques"];

export function PublicDiscoverExperience() {
  const [category, setCategory] = useState<(typeof categories)[number]>("Tous");
  const [query, setQuery] = useState("");

  const stories = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return publicStories.filter((story) => {
      const matchesCategory = category === "Tous" || story.category === category;
      const matchesQuery = !normalized || [story.title, story.excerpt, story.location, story.category]
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const featured = publicStories[0];

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicSiteHeader />

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,.8fr)_minmax(25rem,1.2fr)] lg:items-end lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Publications</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-0.03em] text-[var(--mb-navy-900)]">
              Comprendre la pêche artisanale et faire circuler les savoirs utiles
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">
              Des récits, explications, portraits, repères pratiques et informations accessibles pour mieux connaître les métiers, les territoires et les communautés de la filière.
            </p>
          </div>
          <Link href={`/decouvrir/${featured.slug}`} className="group grid border border-[var(--mb-neutral-200)] bg-white sm:grid-cols-[13rem_minmax(0,1fr)]">
            <PublicStoryVisual story={featured} compact priorityLabel="À la une" />
            <div className="p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{featured.category} · {featured.location}</p>
              <h2 className="mt-3 text-[20px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{featured.title}</h2>
              <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{featured.excerpt}</p>
              <span className="mt-4 inline-flex text-[10px] font-bold text-[var(--mb-ocean-600)]">Lire la publication →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b border-[var(--mb-neutral-200)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[84rem] flex-col gap-3 px-5 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <nav className="flex min-w-0 gap-1 overflow-x-auto" aria-label="Filtrer les publications">
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 border-b-2 px-3 py-2 text-[10px] font-bold ${category === item ? "border-[var(--mb-ocean-600)] text-[var(--mb-ocean-600)]" : "border-transparent text-[var(--mb-neutral-600)] hover:text-[var(--mb-navy-900)]"}`}>{item}</button>
            ))}
          </nav>
          <label className="relative block w-full lg:w-72">
            <span className="sr-only">Rechercher dans les publications</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un métier, un lieu, un sujet…" className="h-10 w-full rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 pr-9 text-[11px] outline-none focus:border-[var(--mb-ocean-600)]" />
            <span className="pointer-events-none absolute right-3 top-2.5 text-[var(--mb-neutral-400)]" aria-hidden="true">⌕</span>
          </label>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]">
        <div className="mx-auto max-w-[84rem] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">À lire</p><h2 className="mt-2 text-[27px] font-semibold text-[var(--mb-navy-900)]">Apprendre, découvrir et mieux comprendre</h2></div>
            {(query || category !== "Tous") ? <button type="button" onClick={() => { setQuery(""); setCategory("Tous"); }} className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Effacer les filtres</button> : null}
          </div>
          {stories.length ? (
            <div className="mt-8 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-2 xl:grid-cols-3">
              {stories.map((story) => (
                <Link key={story.slug} href={`/decouvrir/${story.slug}`} className="group bg-white">
                  <PublicStoryVisual story={story} compact />
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]"><span>{story.category}</span><span>·</span><span>{story.readingTime}</span></div>
                    <h3 className="mt-3 text-[18px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{story.title}</h3>
                    <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{story.excerpt}</p>
                    <span className="mt-5 inline-flex text-[10px] font-bold text-[var(--mb-ocean-600)]">Lire la publication →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-[var(--mb-neutral-300)] bg-white px-5 py-14 text-center"><h3 className="text-[16px] font-semibold text-[var(--mb-navy-900)]">Aucun contenu dans cette sélection</h3><p className="mt-2 text-[11px] text-[var(--mb-neutral-600)]">Essayez un autre sujet ou affichez toutes les publications.</p></div>
          )}
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.55fr)] lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">À relayer</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[var(--mb-navy-900)]">Rencontres et informations de la communauté</h2>
            <div className="mt-7 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] bg-white">
              {publicAgenda.map((event) => (
                <article key={event.title} className="grid gap-3 px-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center"><time className="font-mono text-[11px] font-bold text-[var(--mb-ocean-600)]">{event.date}</time><div><h3 className="text-[13px] font-semibold">{event.title}</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-500)]">{event.location}</p></div><span className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-400)]">{event.format}</span></article>
              ))}
            </div>
          </div>
          <aside className="self-start border-l-2 border-[var(--mb-sand-300)] bg-[var(--mb-offwhite)] p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Contribuer à la ligne éditoriale</p>
            <h2 className="mt-3 text-[20px] font-semibold text-[var(--mb-navy-900)]">Une histoire, une information ou une ressource à partager ?</h2>
            <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Proposez un sujet utile à la communauté. Toute publication doit rester accessible, documentée et respectueuse des acteurs concernés.</p>
            <Link href="/contact" className="mt-5 inline-flex text-[11px] font-bold text-[var(--mb-ocean-600)]">Proposer un contenu →</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
