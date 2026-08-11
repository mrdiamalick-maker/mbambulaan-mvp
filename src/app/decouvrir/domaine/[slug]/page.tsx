import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BookOpenText, Compass, MapPinned } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { publicNews } from "@/data/public-content";
import { findPublicDomainBySlug, publicDomains } from "@/data/public-domains";

export function generateStaticParams() { return publicDomains.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const domain = findPublicDomainBySlug(slug); if (!domain) return {};
  return { title: `${domain.title} | Découvrir | Mbàmbulaan`, description: domain.definition, alternates: { canonical: `/decouvrir/domaine/${slug}` } };
}

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const domain = findPublicDomainBySlug(slug); if (!domain) notFound();
  const contents = publicNews.filter((item) => item.domain === domain.title);
  const territories = Array.from(new Set(contents.map((item) => item.territory).filter((item): item is string => Boolean(item))));
  return <main className="pub-scope min-h-screen"><PublicHeader dark />
    <section className="pub-hero px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14"><div className="mx-auto max-w-[1500px]"><Link href="/decouvrir" className="inline-flex items-center gap-2 text-sm font-bold text-white/64 transition hover:text-white"><ArrowLeft size={15}/> Retour à Découvrir</Link><div className="mt-8 max-w-4xl"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--pub-turquoise-300)]">Domaine de connaissance</p><h1 className="pub-display mt-4 text-[clamp(2.8rem,6vw,5.2rem)] not-italic leading-[.98]">{domain.title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-white/70">{domain.definition}</p></div></div></section>
    <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20"><div className="grid gap-8 lg:grid-cols-[1fr_360px]"><div><p className="pub-eyebrow">Pourquoi ce domaine compte</p><h2 className="pub-display mt-3 max-w-3xl text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3rem]">Comprendre les dépendances avant de choisir une réponse.</h2><p className="mt-5 max-w-3xl text-base leading-7 text-[var(--pub-stone-700)]">{domain.stakes}</p></div><aside className="rounded-[var(--pub-radius-md)] bg-[var(--pub-deep-800)] p-6 text-white"><p className="pub-eyebrow pub-eyebrow--dark">Passer à l’action</p><h2 className="mt-4 text-2xl font-bold tracking-[-.035em]">Une situation réelle concerne ce domaine ?</h2><p className="mt-3 text-sm leading-6 text-white/62">Décrivez le besoin et son territoire. Mbàmbulaan qualifie la situation avant d’organiser la suite.</p><Link href={domain.solutionHref} className="pub-btn pub-btn-primary mt-6">Décrire mon besoin <ArrowRight size={15}/></Link></aside></div>
      <div className="mt-16"><div className="flex items-end justify-between gap-4"><div><p className="pub-eyebrow">Contenus du domaine</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] text-[var(--pub-deep-900)]">Approfondir avec les contenus disponibles.</h2></div><span className="text-xs font-semibold text-[var(--pub-stone-500)]">{contents.length} contenu{contents.length > 1 ? "s" : ""}</span></div>{contents.length ? <div className="mt-7 grid gap-4 lg:grid-cols-3">{contents.map((item) => <Link key={item.id} href={`/decouvrir/${item.id}`} className="pub-card group flex min-h-60 flex-col p-5"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14}/>{item.category}</div><h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.excerpt}</p><span className="mt-auto pt-5 text-xs font-semibold text-[var(--pub-stone-500)]">{item.territory} · {item.readingTime}</span></Link>)}</div> : <div className="pub-card mt-7 p-6"><p className="text-sm leading-6 text-[var(--pub-stone-700)]">Ce domaine est déjà structuré dans le référentiel Mbàmbulaan. Les premiers contenus éditoriaux seront publiés progressivement.</p></div>}</div>
      {territories.length > 0 && <div className="mt-16 border-t border-[var(--pub-stone-150)] pt-10"><div className="flex items-center gap-2 text-[var(--pub-deep-800)]"><MapPinned size={18}/><p className="pub-eyebrow">Territoires cités</p></div><div className="mt-5 flex flex-wrap gap-2">{territories.map((territory) => <span key={territory} className="rounded-full border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] px-4 py-2 text-sm font-bold text-[var(--pub-deep-800)]">{territory}</span>)}</div><Link href="/atlas" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]"><Compass size={15}/> Contextualiser dans l’Atlas <ArrowRight size={14}/></Link></div>}
    </section><PublicFooter /></main>;
}
