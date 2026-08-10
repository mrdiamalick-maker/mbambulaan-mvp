import Link from "next/link";
import { ArrowRight, CalendarDays, CircleDollarSign, GraduationCap, Handshake, MapPinned, Megaphone, UsersRound } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { publicAnnouncements, type PublicOpportunityType } from "@/data/public-content";

const typeIcon: Record<PublicOpportunityType, typeof GraduationCap> = {
  Formation: GraduationCap,
  Programme: Megaphone,
  Financement: CircleDollarSign,
  Rencontre: UsersRound,
  Appel: Handshake
};

const types: PublicOpportunityType[] = ["Formation", "Programme", "Financement", "Rencontre", "Appel"];

type SearchParams = Record<string, string | string[] | undefined>;

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const activeType = types.find((item) => item === typeParam);
  const filtered = activeType ? publicAnnouncements.filter((item) => item.type === activeType) : publicAnnouncements;

  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Opportunités"
        title={<>Programmes, formations, financements et rencontres <span className="text-[var(--pub-turquoise-300)]">qui peuvent devenir des actions.</span></>}
        description="Mbàmbulaan sélectionne, contextualise et relaie les opportunités utiles à l’économie maritime. Lorsqu’une coordination est nécessaire, Mbàmbulaan reste dans la boucle."
        actions={<><Link href="/solutions" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Être accompagné <ArrowRight size={16}/></Link><Link href="/contact?intent=organisation" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white">Proposer une opportunité</Link></>}
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-wrap gap-2">
          <Link href="/opportunites" className={`rounded-full border px-3 py-1.5 text-xs font-bold ${!activeType ? "border-[#10373a] bg-[#10373a] text-white" : "border-[#d9e3e3] bg-white text-[var(--pub-stone-500)] hover:border-[#8fc3bd]"}`}>Tout</Link>
          {types.map((label) => (
            <Link key={label} href={`/opportunites?type=${encodeURIComponent(label)}`} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${activeType === label ? "border-[#10373a] bg-[#10373a] text-white" : "border-[#d9e3e3] bg-white text-[var(--pub-stone-500)] hover:border-[#8fc3bd]"}`}>{label}</Link>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const Icon = typeIcon[item.type] ?? CircleDollarSign;
            return (
              <Link key={item.id} href={`/opportunites/${item.id}`} className="pub-card group flex min-h-72 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
                <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><Icon size={14}/>{item.type}</span><span className="text-[10px] font-bold text-[#8a9a9e]">Démonstration</span></div>
                <h2 className="mt-5 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.description}</p>
                <div className="mt-5 space-y-2 rounded-xl bg-[#f7faf9] p-4 text-xs text-[#526970]">
                  <p className="flex items-center gap-2"><MapPinned size={14} className="text-[#08758a]"/> {item.territory}</p>
                  <p className="flex items-center gap-2"><UsersRound size={14} className="text-[#08758a]"/> {item.audience}</p>
                  <p className="flex items-center gap-2"><CalendarDays size={14} className="text-[#08758a]"/> {item.deadline}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[var(--pub-deep-800)]">Je suis intéressé <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
              </Link>
            );
          })}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
