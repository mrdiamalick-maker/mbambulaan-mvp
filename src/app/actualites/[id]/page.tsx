import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { publicArticleDetails, publicNews } from "@/data/public-content";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return publicNews.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = publicNews.find((entry) => entry.id === id);
  if (!item) return {};
  return { title: `${item.title} | Mbàmbulaan`, description: item.excerpt };
}

export default async function PublicArticlePage({ params }: Props) {
  const { id } = await params;
  const item = publicNews.find((entry) => entry.id === id);
  const detail = publicArticleDetails[id];
  if (!item || !detail) notFound();

  const related = publicNews.filter((entry) => entry.id !== item.id && entry.category === item.category).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <article>
        <header className="bg-[#031a22] px-5 pb-16 pt-12 text-white md:px-10 md:pb-20 md:pt-16">
          <div className="mx-auto max-w-[1180px]">
            <Link href="/actualites" className="inline-flex items-center gap-2 text-sm font-bold text-white/58 transition hover:text-white"><ArrowLeft size={16} /> Actualités & annonces</Link>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-bold text-white/55"><span className="rounded-full border border-white/14 bg-white/7 px-3 py-1.5 text-[#74e1d6]">{item.category}</span><span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {item.territory}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> {item.readingTime}</span></div>
            <h1 className="mt-6 max-w-5xl text-[clamp(2.7rem,6vw,5.7rem)] font-[760] leading-[.98] tracking-[-.055em]">{item.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/67">{detail.lead}</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/42"><span>{detail.author}</span><span>{item.publishedAt}</span><span>Contenu de démonstration</span></div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 md:px-10 md:py-20 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {detail.sections.map((section, index) => (
              <section key={section.title} className="border-b border-[#d9e3e3] pb-10 last:border-0">
                <div className="flex items-start gap-4"><span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#e5f7f3] text-xs font-black text-[#075568]">0{index + 1}</span><div><h2 className="text-2xl font-[740] tracking-[-.035em] text-[#102e37] md:text-3xl">{section.title}</h2><p className="mt-5 text-base leading-8 text-[#536d73]">{section.content}</p></div></div>
              </section>
            ))}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="surface p-5"><p className="label">À retenir</p><div className="mt-5 space-y-4">{detail.takeaways.map((takeaway) => <div key={takeaway} className="flex gap-3 text-sm leading-6 text-[#456168]"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#149a88]" />{takeaway}</div>)}</div></div>
            <div className="rounded-2xl border border-[#f0dcae] bg-[#fff8e8] p-5"><ShieldCheck size={20} className="text-[#a87212]"/><h2 className="mt-4 font-bold text-[#5a430f]">Cadre de confiance</h2><p className="mt-2 text-xs leading-5 text-[#786640]">Ce contenu illustre un usage produit. Il ne constitue ni une statistique officielle, ni un avis réglementaire, ni l’annonce d’un programme réel.</p></div>
          </aside>
        </div>
      </article>

      <section className="border-t border-[#d9e3e3] bg-white px-5 py-14 md:px-10">
        <div className="mx-auto max-w-[1180px]"><div className="flex items-end justify-between gap-5"><div><p className="label">Poursuivre la lecture</p><h2 className="mt-2 text-2xl font-bold">Décryptages associés</h2></div><Link href="/actualites" className="hidden text-sm font-bold text-[#075568] sm:inline-flex">Tout voir <ArrowRight size={15}/></Link></div><div className="mt-7 grid gap-3 md:grid-cols-3">{related.map((entry) => <Link key={entry.id} href={`/actualites/${entry.id}`} className="group rounded-2xl border border-[#d9e3e3] bg-[#f8fbfa] p-5 transition hover:border-[#8fc3bd]"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#118879]">{entry.territory}</p><h3 className="mt-3 font-bold leading-6">{entry.title}</h3><span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#075568]">Lire <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span></Link>)}</div></div>
      </section>
      <PublicFooter />
    </main>
  );
}
