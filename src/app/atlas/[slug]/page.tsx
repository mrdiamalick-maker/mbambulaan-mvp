import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Anchor, ArrowLeft, ArrowRight, BadgeCheck, BookOpenText, Compass, Factory, Fish, MessageSquareWarning } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { findTerritoryBySlug, publicTerritories } from "@/data/public-atlas";
import { publicNews } from "@/data/public-content";

export function generateStaticParams() {
  return publicTerritories.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const territory = findTerritoryBySlug(slug);
  if (!territory) return {};
  return {
    title: `${territory.name} | Atlas Mbàmbulaan`,
    description: territory.description,
    openGraph: { title: `${territory.name} — Atlas Mbàmbulaan`, description: territory.description }
  };
}

export default async function TerritoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const territory = findTerritoryBySlug(slug);
  if (!territory) notFound();

  const relatedContent = (territory.relatedContentIds ?? [])
    .map((id) => publicNews.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />

      <section className="pub-hero px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-[1500px]">
          <Link href="/atlas" className="inline-flex items-center gap-2 text-sm font-bold text-white/64 hover:text-white"><ArrowLeft size={15} /> Atlas</Link>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-300)]">
            <span>{territory.type}</span><span className="text-white/30">·</span><span>{territory.region}{territory.department ? ` · ${territory.department}` : ""}</span>
          </div>
          <h1 className="mt-4 text-4xl font-[760] leading-[1.04] tracking-[-.05em] md:text-6xl">{territory.name}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">{territory.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/solutions?territory=${encodeURIComponent(territory.name)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Trouver une solution ici <ArrowRight size={16} /></Link>
            <Link href={`/contact?intent=programme&territory=${encodeURIComponent(territory.name)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white"><Compass size={16} /> Étudier une intervention</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-18">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="pub-card p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Anchor size={18} /></span>
            <p className="pub-eyebrow mt-5">Activités</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#536f74]">
              {territory.activities.map((activity) => <li key={activity}>{activity}</li>)}
            </ul>
          </div>
          <div className="pub-card p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Factory size={18} /></span>
            <p className="pub-eyebrow mt-5">Services documentés</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#536f74]">
              {territory.documentedServices.length ? territory.documentedServices.map((item) => <li key={item}>{item}</li>) : <li>À documenter</li>}
            </ul>
          </div>
          <div className="pub-card p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Fish size={18} /></span>
            <p className="pub-eyebrow mt-5">Espèces représentées</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#536f74]">
              {territory.species?.length ? territory.species.map((item) => <li key={item}>{item}</li>) : <li>À enrichir</li>}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d9e3e3] bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#3b5751]"><BadgeCheck size={16} className="text-[var(--pub-turquoise-500)]" /> Niveau de couverture : {territory.verification}</div>
          <div className="text-xs text-[var(--pub-stone-500)]">Source : {territory.source} · mise à jour {territory.updatedAt}</div>
        </div>

        <Link href={`/contact?intent=correction&territory=${encodeURIComponent(territory.name)}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">
          <MessageSquareWarning size={16} /> Signaler une information ou proposer une correction sur ce territoire
        </Link>

        {relatedContent.length > 0 && (
          <div className="mt-14">
            <p className="pub-eyebrow">Contenus liés</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {relatedContent.map((item) => (
                <Link key={item.id} href={`/decouvrir/${item.id}`} className="pub-card group flex min-h-52 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14} />{item.category}</div>
                  <h3 className="mt-4 text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.title}</h3>
                  <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Lire <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {publicTerritories.filter((item) => item.id !== territory.id && item.region === territory.region).slice(0, 3).map((item) => (
            <Link key={item.id} href={`/atlas/${item.slug}`} className="pub-card group p-5 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
              <p className="pub-eyebrow">{item.region}</p>
              <h3 className="mt-2 text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.name}</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Découvrir <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
