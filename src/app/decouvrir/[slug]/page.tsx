import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpenText, Compass, MapPinned } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { EventOnMount } from "@/components/public/EventOnMount";
import { findContentById, publicNews } from "@/data/public-content";
import { publicTerritories } from "@/data/public-atlas";
import { findPublicDomainByTitle } from "@/data/public-domains";

export function generateStaticParams() {
  return publicNews.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = findContentById(slug);
  if (!item) return {};
  return {
    title: `${item.title} | Mbàmbulaan Découvrir`,
    description: item.excerpt,
    alternates: { canonical: `/decouvrir/${item.id}` },
    openGraph: { title: item.title, description: item.excerpt }
  };
}

export default async function ContentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findContentById(slug);
  if (!item) notFound();

  const related = publicNews.filter((news) => news.domain === item.domain && news.id !== item.id).slice(0, 3);
  const territory = item.territory ? publicTerritories.find((t) => t.name === item.territory) : undefined;
  const takeaways = item.body.slice(0, 3).map((paragraph) => paragraph.split(". ")[0].replace(/\.$/, ""));
  const domain = findPublicDomainByTitle(item.domain);
  const domainHref = domain ? `/decouvrir/domaine/${domain.slug}` : "/decouvrir";

  return (
    <main className="pub-scope min-h-screen">
      <EventOnMount event="content_view" properties={{ content: item.id, domain: item.domain }} />
      <PublicHeader dark />

      <section className="pub-hero px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-4xl">
          <Link href="/decouvrir" className="inline-flex items-center gap-2 text-sm font-bold text-white/64 transition hover:text-white"><ArrowLeft size={15}/> Retour à Découvrir</Link>
          <div className="mt-7 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-300)]"><span className="inline-flex items-center gap-1.5"><BookOpenText size={13}/> {item.category}</span><span className="text-white/30">·</span><Link href={domainHref} className="transition hover:text-white">{item.domain}</Link></div>
          <h1 className="pub-display mt-4 text-[clamp(2.8rem,6vw,5rem)] not-italic leading-[1.02]">{item.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/70">{item.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/50"><span>{item.publishedAt}</span><span>·</span><span>{item.readingTime} de lecture</span>{item.territory && <><span>·</span><span className="inline-flex items-center gap-1"><MapPinned size={13}/> {item.territory}</span></>}</div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
        <div className="rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] p-6 md:p-7">
          <p className="pub-eyebrow">À retenir</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">{takeaways.map((text, index) => <div key={`${index}-${text}`} className="rounded-2xl border border-[var(--pub-stone-150)] bg-white p-4"><span className="text-xs font-black text-[var(--pub-turquoise-500)]">0{index + 1}</span><p className="mt-2 text-sm font-semibold leading-6 text-[var(--pub-deep-900)]">{text}.</p></div>)}</div>
        </div>

        <article className="mt-12 space-y-8 text-base leading-8 text-[var(--pub-stone-700)]">
          {item.body.map((paragraph, index) => (
            <section key={index}>
              <p className="pub-eyebrow">{index === 0 ? "Contexte" : index === item.body.length - 1 ? "Implications" : "Ce qui se joue"}</p>
              <p className="mt-3">{paragraph}</p>
            </section>
          ))}
        </article>

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-[var(--pub-stone-150)] bg-white px-4 py-3 text-xs font-semibold leading-5 text-[var(--pub-stone-500)]"><BadgeCheck size={15} className="mt-0.5 shrink-0 text-[var(--pub-turquoise-500)]"/><span>{item.verification}</span></div>

        {territory && (
          <section className="mt-12 rounded-[var(--pub-radius-md)] bg-[var(--pub-deep-800)] p-6 text-white md:p-7">
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/8 text-[var(--pub-turquoise-300)]"><MapPinned size={19}/></span><div><p className="pub-eyebrow pub-eyebrow--dark">Dans quel territoire ?</p><h2 className="mt-3 text-2xl font-bold tracking-[-.035em]">{territory.name}</h2><p className="mt-3 text-sm leading-6 text-white/62">Ce contenu prend davantage de sens lorsqu’il est replacé dans les activités, infrastructures et services documentés du territoire.</p><Link href={`/atlas/${territory.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-turquoise-300)]">Voir le territoire dans l’Atlas <ArrowRight size={15}/></Link></div></div>
          </section>
        )}

        <section className="mt-12 rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-white p-6 md:p-7">
          <p className="pub-eyebrow">Passer de la compréhension à l’action</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-.035em] text-[var(--pub-deep-900)]">Ce sujet correspond à une situation réelle ?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--pub-stone-700)]">Décrivez le besoin, le territoire et le contexte. Mbàmbulaan qualifie la situation avant d’organiser la suite.</p>
          <Link href={item.cta?.href ?? "/solutions"} className="pub-btn pub-btn-primary mt-6">{item.cta?.label ?? "Décrire mon besoin"} <ArrowRight size={16}/></Link>
        </section>
      </section>

      {related.length > 0 && (
        <section className="border-t border-[var(--pub-stone-150)] bg-white px-5 py-14 md:px-10 md:py-18">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="pub-eyebrow">Poursuivre</p><h2 className="mt-3 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)] md:text-3xl">Approfondir : {item.domain}</h2></div><Link href={domainHref} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]"><Compass size={15}/> Voir tout le domaine</Link></div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">{related.map((news) => <Link key={news.id} href={`/decouvrir/${news.id}`} className="pub-card group flex min-h-56 flex-col p-5"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14}/>{news.category}</div><h3 className="mt-4 text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{news.title}</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{news.excerpt}</p><span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[var(--pub-deep-800)]">Lire <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span></Link>)}</div>
          </div>
        </section>
      )}

      <PublicFooter />
    </main>
  );
}
