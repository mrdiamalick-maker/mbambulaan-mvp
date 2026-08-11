import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Anchor, ArrowLeft, ArrowRight, BadgeCheck, BookOpenText, Compass, Factory, Fish, MapPin, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { EventOnMount } from "@/components/public/EventOnMount";
import { findTerritoryBySlug, publicTerritories } from "@/data/public-atlas";
import { publicNews } from "@/data/public-content";
import { BlurFade } from "@/components/magicui/blur-fade";

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
    alternates: { canonical: `/atlas/${territory.slug}` },
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
  const nearby = publicTerritories.filter((item) => item.id !== territory.id && item.region === territory.region).slice(0, 3);

  return (
    <main className="pub-scope min-h-screen">
      <EventOnMount event="atlas_location_view" properties={{ territory: territory.id }} />
      <PublicHeader dark />

      <section className="pub-hero px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-[1500px]">
          <Link href="/atlas" className="inline-flex items-center gap-2 text-sm font-bold text-white/64 transition hover:text-white"><ArrowLeft size={15}/> Retour à l’Atlas</Link>
          <BlurFade inView className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-300)]"><span>{territory.type}</span><span className="text-white/30">·</span><span>{territory.region}{territory.department ? ` · ${territory.department}` : ""}</span></div>
              <h1 className="pub-display mt-4 text-[clamp(3rem,7vw,5.8rem)] not-italic leading-[.98]">{territory.name}</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/70">{territory.description}</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href={`/solutions?territory=${encodeURIComponent(territory.name)}`} className="pub-btn pub-btn-primary">Trouver une solution ici <ArrowRight size={16}/></Link><Link href={`/contact?intent=programme&territory=${encodeURIComponent(territory.name)}`} className="pub-btn pub-btn-on-dark"><Compass size={16}/> Étudier une intervention</Link></div>
            </div>
            <div className="rounded-[var(--pub-radius-md)] border border-white/12 bg-white/[.06] p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-300)]">Référentiel public</p>
              <div className="mt-4 grid gap-3 text-sm text-white/72"><p className="flex items-center gap-3"><BadgeCheck size={16}/> {territory.verification}</p><p className="flex items-center gap-3"><MapPin size={16}/> {territory.coordinates.lat.toFixed(2)}, {territory.coordinates.lon.toFixed(2)}</p><p className="flex items-center gap-3"><ShieldCheck size={16}/> Mise à jour {territory.updatedAt}</p></div>
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <p className="pub-eyebrow">Portrait territorial</p>
            <h2 className="pub-display mt-3 max-w-3xl text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3rem]">Ce que le territoire permet de comprendre publiquement.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="pub-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Anchor size={18}/></span><p className="pub-eyebrow mt-5">Activités</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--pub-stone-700)]">{territory.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul></div>
              <div className="pub-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Factory size={18}/></span><p className="pub-eyebrow mt-5">Services documentés</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--pub-stone-700)]">{territory.documentedServices.length ? territory.documentedServices.map((item) => <li key={item}>{item}</li>) : <li>À documenter</li>}</ul></div>
              <div className="pub-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Fish size={18}/></span><p className="pub-eyebrow mt-5">Espèces représentées</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--pub-stone-700)]">{territory.species?.length ? territory.species.map((item) => <li key={item}>{item}</li>) : <li>À enrichir</li>}</ul></div>
            </div>
          </div>

          <aside className="rounded-[var(--pub-radius-md)] bg-[var(--pub-deep-800)] p-6 text-white md:p-7">
            <p className="pub-eyebrow pub-eyebrow--dark">Fiabilité de l’information</p>
            <h2 className="mt-4 text-2xl font-bold tracking-[-.035em]">Un portrait sourcé, pas une promesse de disponibilité.</h2>
            <p className="mt-4 text-sm leading-6 text-white/62">Les services indiqués sont des capacités documentées. Pour savoir si une capacité est réellement mobilisable, Mbàmbulaan qualifie le besoin avec les acteurs concernés.</p>
            <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-white/50"><p>Source : {territory.source}</p><p className="mt-2">Mise à jour : {territory.updatedAt}</p></div>
            <Link href={`/contact?intent=correction&territory=${encodeURIComponent(territory.name)}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-turquoise-300)]"><MessageSquareWarning size={16}/> Signaler une correction</Link>
          </aside>
        </div>

        {relatedContent.length > 0 && <div className="mt-16"><p className="pub-eyebrow">Pour comprendre le contexte</p><h2 className="pub-display mt-3 text-[2rem] not-italic text-[var(--pub-deep-900)]">Contenus liés à {territory.name}</h2><div className="mt-6 grid gap-4 lg:grid-cols-3">{relatedContent.map((item) => <Link key={item.id} href={`/decouvrir/${item.id}`} className="pub-card group flex min-h-52 flex-col p-5"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14}/>{item.category}</div><h3 className="mt-4 text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.title}</h3><span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[var(--pub-deep-800)]">Lire <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span></Link>)}</div></div>}

        {nearby.length > 0 && <div className="mt-16 border-t border-[var(--pub-stone-150)] pt-10"><div className="flex items-end justify-between gap-4"><div><p className="pub-eyebrow">Même région</p><h2 className="mt-2 text-2xl font-bold tracking-[-.035em] text-[var(--pub-deep-900)]">Continuer l’exploration territoriale.</h2></div><Link href="/atlas" className="hidden items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)] md:inline-flex">Tout l’Atlas <ArrowRight size={15}/></Link></div><div className="mt-6 grid gap-4 lg:grid-cols-3">{nearby.map((item) => <Link key={item.id} href={`/atlas/${item.slug}`} className="pub-card group p-5"><p className="pub-eyebrow">{item.type} · {item.region}</p><h3 className="mt-3 text-xl font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.name}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--pub-stone-700)]">{item.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Découvrir <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span></Link>)}</div></div>}
      </section>

      <PublicFooter />
    </main>
  );
}
