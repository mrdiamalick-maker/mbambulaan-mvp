import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone, Newspaper, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { publicAnnouncements, publicNews } from "@/data/public-content";

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 pb-16 pt-14 text-white md:px-10 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-[1500px]">
          <p className="label-inverse">Actualités, annonces et opportunités</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-[760] leading-[1.02] tracking-[-.05em] md:text-6xl">
            Comprendre ce qui bouge. Savoir où contribuer.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/66">
            Une lecture publique des dynamiques de la filière et des exemples d’appels à contribution. Tous les éléments ci-dessous sont des contenus de démonstration, jamais des annonces officielles.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-3 py-2 text-xs font-bold text-white/70">
            <ShieldCheck size={15} className="text-[#74e1d6]" /> Contenus illustratifs · sources et validation requises avant publication réelle
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="flex flex-col gap-4 border-b border-[#d9e3e3] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">Décryptages de la filière</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] md:text-4xl">À la une</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#667b81]">Des contenus structurés pour relier un fait terrain à ses acteurs, ses impacts et aux décisions possibles.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {publicNews.map((item, index) => (
            <Link href={`/actualites/${item.id}`} key={item.id} className={`surface group flex min-h-[310px] flex-col p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd] hover:shadow-[0_18px_48px_rgba(5,54,64,.1)] ${index === 0 ? "md:col-span-2 xl:col-span-1" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="data-chip"><Newspaper size={13} /> {item.category}</span>
                <span className="text-[11px] font-bold text-[#819397]">{item.readingTime}</span>
              </div>
              <h3 className="mt-7 text-2xl font-bold tracking-[-.035em] text-[#102e37]">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-[#667b81]">{item.excerpt}</p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-7 text-xs font-semibold text-[#718489]">
                <span>{item.territory}<span className="mt-2 flex items-center gap-1.5 font-black text-[#075568]">Lire le décryptage <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span></span><span>{item.publishedAt}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9e3e3] bg-white px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-3xl">
            <p className="label">Annonces de démonstration</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-.04em] md:text-4xl">Des besoins et capacités rendus actionnables.</h2>
            <p className="mt-4 text-sm leading-6 text-[#667b81]">La publication publique informe. La qualification, les droits d’accès, les engagements et le suivi restent dans l’espace professionnel.</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#d9e3e3] bg-[#d9e3e3] lg:grid-cols-2">
            {publicAnnouncements.map((item) => (
              <article key={item.id} className="bg-[#f8fbfa] p-6">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.08em] text-[#08758a]"><Megaphone size={14} /> {item.type} · {item.territory}</div>
                <h3 className="mt-3 text-lg font-bold text-[#102e37]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667b81]">{item.description}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#d9e3e3] pt-4 text-xs text-[#667b81]">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {item.deadline}</span>
                  <span>{item.audience}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-[#052630] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
            <div><p className="label-inverse">Vous portez un besoin réel ?</p><h3 className="mt-2 text-2xl font-bold">Qualifions-le avant de le diffuser.</h3></div>
            <Link href="/contact" className="btn-accent shrink-0">Proposer une contribution <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
