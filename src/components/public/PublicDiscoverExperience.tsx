"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  publicAgenda,
  publicPrograms,
  publicStories,
  type PublicStoryCategory,
} from "@/data/publicEditorialContent";
import { PublicSiteHeader } from "./PublicSiteHeader";
import { PublicStoryVisual } from "./PublicStoryVisual";

const categories: Array<"Tous" | PublicStoryCategory> = ["Tous", "Territoires", "Communautés", "Programmes", "Ressources"];

const assistantAnswers = [
  {
    question: "Pourquoi la chaîne de froid est-elle importante ?",
    answer: "Elle préserve la qualité, réduit les pertes après débarquement et améliore la valeur créée localement.",
    source: "Programme Joal–Mbour · Chaîne de froid communautaire",
  },
  {
    question: "Comment un besoin devient-il un programme ?",
    answer: "Il est documenté, qualifié, relié à des bénéficiaires, à un résultat attendu, à un budget et à des partenaires potentiels.",
    source: "Parcours Communautés & Programmes",
  },
  {
    question: "Quel rôle jouent les femmes transformatrices ?",
    answer: "Elles prolongent la valeur du débarquement par la transformation, la conservation et la commercialisation locale.",
    source: "Publication · Femmes transformatrices et valeur locale",
  },
];

export function PublicDiscoverExperience() {
  const [category, setCategory] = useState<(typeof categories)[number]>("Tous");
  const [query, setQuery] = useState("");
  const [assistantQuestion, setAssistantQuestion] = useState(0);

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

  const featured = publicStories[1];
  const answer = assistantAnswers[assistantQuestion];

  return (
    <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
      <PublicSiteHeader />

      <section className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,.8fr)_minmax(25rem,1.2fr)] lg:items-end lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">La filière en mouvement</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-0.03em] text-[var(--mb-navy-900)]">
              Territoires, métiers et initiatives de la pêche artisanale
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">
              Retrouvez les publications, programmes et ressources qui donnent à voir les réalités de la filière et les réponses portées par ses acteurs.
            </p>
          </div>
          <Link href={"/decouvrir/" + featured.slug} className="group grid border border-[var(--mb-neutral-200)] bg-white sm:grid-cols-[13rem_minmax(0,1fr)]">
            <PublicStoryVisual story={featured} compact priorityLabel="Programme à suivre" />
            <div className="p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--mb-neutral-400)]">{featured.location}</p>
              <h2 className="mt-3 text-[20px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{featured.title}</h2>
              <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{featured.excerpt}</p>
              <span className="mt-4 inline-flex text-[10px] font-bold text-[var(--mb-ocean-600)]">Lire →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b border-[var(--mb-neutral-200)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[84rem] flex-col gap-3 px-5 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <nav className="flex min-w-0 gap-1 overflow-x-auto" aria-label="Filtrer les publications">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={"shrink-0 border-b-2 px-3 py-2 text-[10px] font-bold " + (category === item ? "border-[var(--mb-ocean-600)] text-[var(--mb-ocean-600)]" : "border-transparent text-[var(--mb-neutral-600)] hover:text-[var(--mb-navy-900)]")}
              >
                {item}
              </button>
            ))}
          </nav>
          <label className="relative block w-full lg:w-72">
            <span className="sr-only">Rechercher dans les publications</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un territoire, un sujet…"
              className="h-10 w-full rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 pr-9 text-[11px] outline-none focus:border-[var(--mb-ocean-600)]"
            />
            <span className="pointer-events-none absolute right-3 top-2.5 text-[var(--mb-neutral-400)]" aria-hidden="true">⌕</span>
          </label>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]">
        <div className="mx-auto max-w-[84rem] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Publications</p>
              <h2 className="mt-2 text-[27px] font-semibold text-[var(--mb-navy-900)]">{stories.length} contenu{stories.length > 1 ? "s" : ""} à consulter</h2>
            </div>
            {(query || category !== "Tous") ? <button type="button" onClick={() => { setQuery(""); setCategory("Tous"); }} className="text-[10px] font-bold text-[var(--mb-ocean-600)]">Effacer les filtres</button> : null}
          </div>

          {stories.length ? (
            <div className="mt-8 grid gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] md:grid-cols-2 xl:grid-cols-3">
              {stories.map((story) => (
                <Link key={story.slug} href={"/decouvrir/" + story.slug} className="group bg-white">
                  <PublicStoryVisual story={story} compact />
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase text-[var(--mb-neutral-400)]"><span>{story.publishedAt}</span><span>·</span><span>{story.readingTime}</span></div>
                    <h3 className="mt-3 text-[18px] font-semibold leading-tight text-[var(--mb-navy-900)] group-hover:text-[var(--mb-ocean-600)]">{story.title}</h3>
                    <p className="mt-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{story.excerpt}</p>
                    <span className="mt-5 inline-flex text-[10px] font-bold text-[var(--mb-ocean-600)]">Lire la publication →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-[var(--mb-neutral-300)] bg-white px-5 py-14 text-center">
              <h3 className="text-[16px] font-semibold text-[var(--mb-navy-900)]">Aucun contenu dans cette sélection</h3>
              <p className="mt-2 text-[11px] text-[var(--mb-neutral-600)]">Essayez un autre sujet ou affichez toutes les publications.</p>
            </div>
          )}
        </div>
      </section>

      <section id="programmes" className="border-b border-[var(--mb-neutral-200)] bg-white">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(18rem,.6fr)_minmax(0,1.4fr)] lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Initiatives suivies</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight text-[var(--mb-navy-900)]">Des programmes reliés à un territoire et à un prochain résultat</h2>
            <p className="mt-4 text-[12px] leading-6 text-[var(--mb-neutral-600)]">Chaque initiative rend visibles son public, son niveau de préparation et le prochain jalon collectif.</p>
            <Link href="/contact" className="mt-6 inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--mb-navy-700)] px-4 text-[11px] font-bold text-white">Proposer une initiative</Link>
          </div>
          <div className="divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)]">
            {publicPrograms.map((program) => (
              <article key={program.id} className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_9rem] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.07em] text-[var(--mb-neutral-400)]"><span>{program.territory}</span><span>·</span><span>{program.theme}</span></div>
                  <h3 className="mt-2 text-[17px] font-semibold text-[var(--mb-navy-900)]">{program.title}</h3>
                  <p className="mt-2 text-[10px] text-[var(--mb-neutral-600)]">{program.beneficiaries} · {program.status}</p>
                  <div className="mt-4 h-1.5 max-w-xl bg-[var(--mb-neutral-100)]"><div className="h-full bg-[var(--mb-ocean-600)]" style={{ width: program.progress + "%" }} /></div>
                </div>
                <div className="md:text-right">
                  <strong className="font-mono text-[20px] text-[var(--mb-navy-900)]">{program.progress}%</strong>
                  <p className="mt-1 text-[9px] leading-4 text-[var(--mb-neutral-500)]">{program.nextMilestone}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.72fr)] lg:px-10 lg:py-20">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">Agenda</p>
            <h2 className="mt-3 text-[28px] font-semibold text-[var(--mb-navy-900)]">Prochains rendez-vous de la filière</h2>
            <div className="mt-7 divide-y divide-[var(--mb-neutral-200)] border-y border-[var(--mb-neutral-200)] bg-white">
              {publicAgenda.map((event) => (
                <article key={event.title} className="grid gap-3 px-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center">
                  <time className="font-mono text-[11px] font-bold text-[var(--mb-ocean-600)]">{event.date}</time>
                  <div><h3 className="text-[13px] font-semibold">{event.title}</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-500)]">{event.location}</p></div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-400)]">{event.format}</span>
                </article>
              ))}
            </div>
          </div>

          <details className="self-start border border-[var(--mb-ocean-600)]/20 bg-[var(--mb-foam)]">
            <summary className="cursor-pointer list-none p-5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Assistance Mbàmbulaan</p>
              <h2 className="mt-2 text-[17px] font-semibold text-[var(--mb-navy-900)]">Poser une question sur les ressources</h2>
              <p className="mt-2 text-[10px] text-[var(--mb-neutral-600)]">Préfiguration locale · réponses issues des contenus publics visibles</p>
            </summary>
            <div className="border-t border-[var(--mb-ocean-600)]/15 p-5">
              <div className="flex flex-wrap gap-2">
                {assistantAnswers.map((item, index) => (
                  <button key={item.question} type="button" onClick={() => setAssistantQuestion(index)} className={"border px-2.5 py-2 text-left text-[9px] font-semibold " + (assistantQuestion === index ? "border-[var(--mb-ocean-600)] bg-white text-[var(--mb-navy-900)]" : "border-[var(--mb-neutral-200)] text-[var(--mb-neutral-600)]")}>{item.question}</button>
                ))}
              </div>
              <div className="mt-4 border-l-2 border-[var(--mb-ocean-600)] bg-white p-4">
                <p className="text-[11px] leading-5 text-[var(--mb-neutral-700)]">{answer.answer}</p>
                <p className="mt-3 font-mono text-[8px] text-[var(--mb-neutral-400)]">Source : {answer.source}</p>
              </div>
            </div>
          </details>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex max-w-[84rem] flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-end lg:px-10 lg:py-18">
          <div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--mb-ocean-600)]">À propos des contenus</p><p className="mt-3 max-w-3xl text-[12px] leading-6 text-[var(--mb-neutral-600)]">Cette préfiguration éditoriale utilise des sujets et chiffres illustratifs. Les publications définitives seront documentées et validées avec les acteurs de la filière.</p></div>
          <Link href="/contact" className="inline-flex h-10 shrink-0 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-300)] px-4 text-[11px] font-bold text-[var(--mb-navy-900)]">Nous contacter</Link>
        </div>
      </section>
    </main>
  );
}
