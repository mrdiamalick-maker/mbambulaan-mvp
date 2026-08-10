import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpenText, MapPinned } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { findContentById, publicNews } from "@/data/public-content";
import { publicTerritories } from "@/data/public-atlas";

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
    openGraph: { title: item.title, description: item.excerpt }
  };
}

export default async function ContentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findContentById(slug);
  if (!item) notFound();

  const related = publicNews.filter((news) => news.domain === item.domain && news.id !== item.id).slice(0, 3);
  const territory = item.territory ? publicTerritories.find((t) => t.name === item.territory) : undefined;

  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />

      <section className="pub-hero px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-3xl">
          <Link href="/decouvrir" className="inline-flex items-center gap-2 text-sm font-bold text-white/64 hover:text-white"><ArrowLeft size={15} /> Découvrir</Link>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-300)]">
            <span className="inline-flex items-center gap-1.5"><BookOpenText size={13} /> {item.category}</span>
            <span className="text-white/30">·</span>
            <span>{item.domain}</span>
          </div>
          <h1 className="mt-4 text-3xl font-[760] leading-[1.08] tracking-[-.045em] md:text-5xl">{item.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">{item.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/50">
            <span>{item.publishedAt}</span>
            <span>·</span>
            <span>{item.readingTime} de lecture</span>
            {item.territory && <><span>·</span><span className="inline-flex items-center gap-1"><MapPinned size={13} /> {item.territory}</span></>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 md:px-10 md:py-16">
        <article className="space-y-5 text-base leading-8 text-[#324b4f]">
          {item.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </article>

        <div className="mt-8 flex items-center gap-2 rounded-xl border border-[#d9e3e3] bg-white px-4 py-3 text-xs font-semibold text-[var(--pub-stone-500)]">
          <BadgeCheck size={15} className="shrink-0 text-[var(--pub-turquoise-500)]" /> {item.verification}
        </div>

        {item.cta && (
          <div className="mt-8 rounded-2xl bg-[#eaf5f1] p-6">
            <p className="text-sm leading-6 text-[#3b5751]">Ce contenu vous concerne directement ?</p>
            <Link href={item.cta.href} className="mt-3 inline-flex items-center gap-2 text-base font-black text-[var(--pub-deep-800)]">{item.cta.label} <ArrowRight size={16} /></Link>
          </div>
        )}

        {territory && (
          <Link href={`/atlas/${territory.slug}`} className="mt-6 flex items-center gap-3 rounded-2xl border border-[#d9e3e3] bg-white p-5 transition hover:border-[#8fc3bd]">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><MapPinned size={18} /></span>
            <span><strong className="block text-sm font-bold text-[var(--pub-deep-900)]">Voir le territoire : {territory.name}</strong><span className="text-xs text-[var(--pub-stone-500)]">Portrait, activités et services documentés dans l’Atlas Mbàmbulaan.</span></span>
          </Link>
        )}
      </section>

      {related.length > 0 && (
        <section className="border-t border-[#d9e3e3] bg-white px-5 py-14 md:px-10 md:py-18">
          <div className="mx-auto max-w-[1500px]">
            <p className="pub-eyebrow">À lire aussi</p>
            <h2 className="mt-3 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)] md:text-3xl">{item.domain}</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {related.map((news) => (
                <Link key={news.id} href={`/decouvrir/${news.id}`} className="pub-card group flex min-h-56 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14} />{news.category}</div>
                  <h3 className="mt-4 text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{news.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{news.excerpt}</p>
                  <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Lire <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter />
    </main>
  );
}
