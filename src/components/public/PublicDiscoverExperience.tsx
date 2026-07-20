"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publicAgenda, publicStories, type PublicStoryCategory } from "@/data/publicEditorialContent";
import { PublicSiteHeader } from "./PublicSiteHeader";
import { PublicStoryVisual } from "./PublicStoryVisual";

const categories: Array<"Tous" | PublicStoryCategory> = ["Tous", "Comprendre", "Métiers & communautés", "Initiatives", "Infos pratiques"];
const featuredStories = publicStories.slice(0, 3);

export function PublicDiscoverExperience() {
  const [category, setCategory] = useState<(typeof categories)[number]>("Tous");
  const [query, setQuery] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);

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

  const featured = featuredStories[featuredIndex] ?? publicStories[0];

  function moveFeatured(direction: -1 | 1) {
    setFeaturedIndex((current) => (current + direction + featuredStories.length) % featuredStories.length);
  }

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicSiteHeader />

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto max-w-[84rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="mb-6 max-w-3xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Publications</p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-[var(--mb-navy-900)]">
              La pêche artisanale, à portée de tous
            </h1>
            <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">
              Récits, métiers, territoires, repères pratiques et informations utiles pour mieux comprendre la filière et celles et ceux qui la font vivre.
            </p>
          </div>

          <div className="grid overflow-hidden border border-[var(--mb-neutral-200)] bg-white lg:grid-cols-[minmax(15rem,.72fr)_minmax(0,1.28fr)]">
            <PublicStoryVisual story={featured} priorityLabel="À la une" />
            <div className="flex min-w-0 flex-col justify-between p-5 sm:p-7">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{featured.category} · {featured.location}</p>
                <h2 className="mt-3 max-w-3xl text-[clamp(1.45rem,3vw,2.25rem)] font-semibold leading-tight text-[var(--mb-navy-900)]">{featured.title}</h2>
                <p className="mt-3 max-w-2xl text-[12px] leading-6 text-[var(--mb-neutral-600)]">{featured.excerpt}</p>
                <Link href={`/publications/${featured.slug}`} className="mt-5 inline-flex text-[11px] font-bold text-[var(--mb-ocean-600)]">Lire la publication →</Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--mb-neutral-100)] pt-4">
                <div className="flex gap-2" aria-label="Choisir une publication à la une">
                  {featuredStories.map((story, index) => (
                    <button key={story.slug} type="button" onClick={() => setFeaturedIndex(index)} aria-label={`Afficher ${story.title}`} aria-current={featuredIndex === index ? "true" : undefined} className={`h-2.5 w-2.5 rounded-full border ${featuredIndex === index ? "border-[var(--mb-ocean-600)] bg-[var(--mb-ocean-600)]" : "border-[var(--mb-neutral-300)] bg-white"}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => moveFeatured(-1)} className="inline-flex h-9 w-9 items-center justify-center border border-[var(--mb-neutral-200)] text-[14px] text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]" aria-label="Publication précédente">←</button>
                  <button type="button" onClick={() => moveFeatured(1)} className="inline-flex h-9 w-9 items-center justify-center border border-[var(--mb-neutral-200)] text-[14px] text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]" aria-label="Publication suivante">→</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b border-[var(--mb-neutral-200)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[84rem] flex-col gap-3 px-5 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <nav className="flex min-w-0 gap-1 overflow-x-auto pb-1 lg:pb-0" aria-label="Filtrer les publications">
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
        <div className="mx-auto max-w-[84rem] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">À lire</p><h2 className="mt-2 text-[clamp(1.45rem,3vw,2rem)] font-semibold text-[var(--mb-navy-900)]">Toutes les publications</h2></div>
            {(query || category !== "Tous") ? <button type="button" onClick={() => { setQuery(""); setCategory("Tous"); }} className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Effacer les filtres</button> : null}
          </div>
          {stories.length ? (
            <div className="mt-7 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-2 xl:grid-cols-3">
              {stories.map((story) => (
                <Link key={story.slug} href={`/publications/${story.slug}`} className="group min-w-0 bg-white">
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
        <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.55fr)] lg:px-10 lg:py-16">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">À relayer</p>
            <h2 className="mt-3 text-[clamp(1.4rem,3vw,1.9rem)] font-semibold text-[var(--mb-navy-900)]">Rencontres et informations de la communauté</h2>
            <div className="mt-6 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] bg-white">
              {publicAgenda.map((event) => (
                <article key={event.title} className="grid gap-3 px-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center"><time className="font-mono text-[11px] font-bold text-[var(--mb-ocean-600)]">{event.date}</time><div><h3 className="text-[13px] font-semibold">{event.title}</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-500)]">{event.location}</p></div><span className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-400)]">{event.format}</span></article>
              ))}
            </div>
          </div>
          <aside className="self-start border-l-2 border-[var(--mb-sand-300)] bg-[var(--mb-offwhite)] p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Contribuer aux publications</p>
            <h2 className="mt-3 text-[19px] font-semibold text-[var(--mb-navy-900)]">Une histoire ou une information à partager ?</h2>
            <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">Proposez un sujet utile, accessible et respectueux des acteurs concernés.</p>
            <Link href="/contact" className="mt-5 inline-flex text-[11px] font-bold text-[var(--mb-ocean-600)]">Proposer un contenu →</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
