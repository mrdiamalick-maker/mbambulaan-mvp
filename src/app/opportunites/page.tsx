import Link from "next/link";
import { ArrowRight, CalendarDays, CircleDollarSign, GraduationCap, Handshake, MapPinned, Megaphone, UsersRound } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { publicAnnouncements } from "@/data/public-content";

const typeIcon = {
  "Appel à participation": UsersRound,
  "Besoin qualifié": Handshake,
  Agenda: CalendarDays,
  "Capacité disponible": Megaphone
} as const;

export default function OpportunitiesPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Opportunités"
        title={<>Programmes, formations, financements et rencontres <span className="text-[#74e1d6]">qui peuvent devenir des actions.</span></>}
        description="Mbàmbulaan sélectionne, contextualise et relaie les opportunités utiles à l’économie maritime. Lorsqu’une coordination est nécessaire, Mbàmbulaan reste dans la boucle."
        actions={<><Link href="/solutions" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Être accompagné <ArrowRight size={16}/></Link><Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white">Proposer une opportunité</Link></>}
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-wrap gap-2">
          {["Tout", "Formation", "Programme", "Financement", "Rencontre", "Appel"].map((label, index) => <span key={label} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${index === 0 ? "border-[#10373a] bg-[#10373a] text-white" : "border-[#d9e3e3] bg-white text-[#60737a]"}`}>{label}</span>)}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {publicAnnouncements.map((item) => {
            const Icon = typeIcon[item.type] ?? CircleDollarSign;
            return (
              <article key={item.id} className="surface flex min-h-72 flex-col p-5">
                <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[#118f83]"><Icon size={14}/>{item.type}</span><span className="text-[10px] font-bold text-[#8a9a9e]">Démonstration</span></div>
                <h2 className="mt-5 text-xl font-bold tracking-[-.03em] text-[#102e37]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#667b81]">{item.description}</p>
                <div className="mt-5 space-y-2 rounded-xl bg-[#f7faf9] p-4 text-xs text-[#526970]">
                  <p className="flex items-center gap-2"><MapPinned size={14} className="text-[#08758a]"/> {item.territory}</p>
                  <p className="flex items-center gap-2"><UsersRound size={14} className="text-[#08758a]"/> {item.audience}</p>
                  <p className="flex items-center gap-2"><CalendarDays size={14} className="text-[#08758a]"/> {item.deadline}</p>
                </div>
                <Link href={`/contact?source=opportunite&opportunity=${item.id}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#075568]">Je suis intéressé <ArrowRight size={14}/></Link>
              </article>
            );
          })}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
