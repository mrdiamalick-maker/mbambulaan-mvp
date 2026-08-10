import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, BadgeCheck, CalendarDays, Landmark, MapPinned, UsersRound } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ContactRequestForm } from "@/components/public/ContactRequestForm";
import { EventOnMount } from "@/components/public/EventOnMount";
import { findAnnouncementById, publicAnnouncements, type PublicOpportunityType } from "@/data/public-content";
import type { PublicRequestIntent } from "@/domain/public/request";

const intentByType: Record<PublicOpportunityType, { intent: PublicRequestIntent; category?: string }> = {
  Formation: { intent: "formation" },
  Programme: { intent: "programme" },
  Financement: { intent: "financement" },
  Rencontre: { intent: "autre", category: "Rencontre" },
  Appel: { intent: "autre", category: "Appel" }
};

export function generateStaticParams() {
  return publicAnnouncements.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = findAnnouncementById(slug);
  if (!item) return {};
  return {
    title: `${item.title} | Opportunités Mbàmbulaan`,
    description: item.description,
    alternates: { canonical: `/opportunites/${item.id}` },
    openGraph: { title: item.title, description: item.description }
  };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findAnnouncementById(slug);
  if (!item) notFound();

  const mapping = intentByType[item.type];
  const related = publicAnnouncements.filter((a) => a.type === item.type && a.id !== item.id).slice(0, 3);

  return (
    <main className="pub-scope min-h-screen">
      <EventOnMount event="opportunity_view" properties={{ opportunity: item.id, type: item.type }} />
      <PublicHeader dark />

      <section className="pub-hero px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-[1500px]">
          <Link href="/opportunites" className="inline-flex items-center gap-2 text-sm font-bold text-white/64 hover:text-white"><ArrowLeft size={15} /> Opportunités</Link>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-300)]">
            <span>{item.type}</span><span className="text-white/30">·</span><span>{item.status}</span><span className="text-white/30">·</span><span className="text-white/50">Démonstration</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-[760] leading-[1.08] tracking-[-.045em] md:text-5xl">{item.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">{item.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
          <div>
            {item.details?.map((paragraph, index) => <p key={index} className="mt-4 text-base leading-8 text-[#324b4f] first:mt-0">{paragraph}</p>)}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-[#d9e3e3] bg-white p-4"><MapPinned size={17} className="shrink-0 text-[#08758a]" /><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#8a9a9e]">Territoire</p><p className="text-sm font-bold text-[var(--pub-deep-900)]">{item.territory}</p></div></div>
              <div className="flex items-center gap-3 rounded-xl border border-[#d9e3e3] bg-white p-4"><UsersRound size={17} className="shrink-0 text-[#08758a]" /><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#8a9a9e]">Public concerné</p><p className="text-sm font-bold text-[var(--pub-deep-900)]">{item.audience}</p></div></div>
              <div className="flex items-center gap-3 rounded-xl border border-[#d9e3e3] bg-white p-4"><CalendarDays size={17} className="shrink-0 text-[#08758a]" /><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#8a9a9e]">Échéance</p><p className="text-sm font-bold text-[var(--pub-deep-900)]">{item.deadline}</p></div></div>
              <div className="flex items-center gap-3 rounded-xl border border-[#d9e3e3] bg-white p-4"><Landmark size={17} className="shrink-0 text-[#08758a]" /><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#8a9a9e]">Organisateur</p><p className="text-sm font-bold text-[var(--pub-deep-900)]">{item.organizer}</p></div></div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#d9e3e3] bg-white px-4 py-3 text-xs font-semibold text-[var(--pub-stone-500)]">
              <BadgeCheck size={15} className="shrink-0 text-[var(--pub-turquoise-500)]" /> Niveau d’implication Mbàmbulaan : {item.involvement} · {item.verification}
            </div>
          </div>

          <aside>
            <p className="pub-eyebrow">Je suis intéressé</p>
            <h2 className="mt-2 text-xl font-[740] tracking-[-.03em] text-[var(--pub-deep-900)]">Manifester mon intérêt</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--pub-stone-700)]">Mbàmbulaan reprend contact pour qualifier votre intérêt et vous orienter vers la suite utile.</p>
            <div className="mt-5">
              <ContactRequestForm
                intent={mapping.intent}
                category={mapping.category ?? item.type}
                descriptionLabel="Précisez votre intérêt (optionnel)"
                descriptionPlaceholder="Ex. profil, disponibilité, question particulière…"
                descriptionRequired={false}
                source="opportunites"
                context={{ page: "opportunites", opportunity: item.id, opportunityTitle: item.title, territory: item.territory }}
                analyticsEvent="opportunity_interest"
              />
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <p className="pub-eyebrow">Autres opportunités · {item.type}</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {related.map((a) => (
                <Link key={a.id} href={`/opportunites/${a.id}`} className="pub-card group flex min-h-48 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
                  <h3 className="text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{a.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--pub-stone-700)]">{a.territory}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <PublicFooter />
    </main>
  );
}
