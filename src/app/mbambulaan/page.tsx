import Link from "next/link";
import { ArrowRight, Compass, MapPinned, Network, Radar, Route, Waves } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const pillars = [
  { title: "Terrain", text: "Comprendre les réalités, identifier les besoins et maintenir une relation directe avec les territoires.", icon: Route },
  { title: "Réseau", text: "Mobiliser organisations, professionnels, entreprises, partenaires, experts et programmes lorsque l’action l’exige.", icon: Network },
  { title: "Technologie", text: "Structurer l’information, relier les contextes et rendre la coordination plus simple et plus fiable.", icon: Radar }
] as const;

const loop = ["Observer", "Qualifier", "Connecter", "Coordonner", "Réaliser", "Mesurer", "Apprendre"];

export default function MbambulaanPage() {
  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#10373a]">
      <PublicHeader />
      <section className="relative overflow-hidden border-b border-[#ded2bd] bg-[#031a22] px-5 py-16 text-white md:px-10 md:py-24">
        <div className="absolute inset-0 ocean-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#74e1d6]"><Waves size={16} /> Mbàmbulaan entreprise</div>
            <h1 className="mt-5 font-serif text-5xl leading-[.98] tracking-[-.045em] md:text-7xl">Terrain, réseau et technologie.<br /><em>Une même capacité d’action.</em></h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">Mbàmbulaan construit une infrastructure de coordination pour l’économie maritime, en commençant par la filière halieutique sénégalaise.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-[24px] border border-[#ded5c5] bg-white p-6 shadow-[0_18px_45px_rgba(16,55,58,.06)]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={20} /></span>
              <h2 className="mt-5 text-2xl font-black tracking-[-.03em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#667b81]">{text}</p>
            </article>
          ))}
        </div>

        <section className="mt-14 grid gap-8 rounded-[28px] border border-[#ded5c5] bg-white p-6 md:p-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#0a6d68]">Ce que fait Mbàmbulaan</p>
            <h2 className="mt-4 font-serif text-4xl tracking-[-.04em]">Comprendre avant d’organiser l’action.</h2>
            <p className="mt-4 text-sm leading-7 text-[#667b81]">Mbàmbulaan ne remplace pas les métiers. L’entreprise aide à transformer un besoin, une capacité ou une opportunité en action plus lisible, plus coordonnée et mieux suivie.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {loop.map((item, index) => (
              <div key={item} className="rounded-xl bg-[#f3f7f6] p-4">
                <p className="text-[10px] font-black text-[#8da0a3]">0{index + 1}</p>
                <p className="mt-2 text-sm font-black text-[#10373a]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[26px] bg-[#eaf5f1] p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#0a6d68]">Vous avez un besoin ?</p>
            <h2 className="mt-3 text-2xl font-black">Décrivez ce que vous cherchez à accomplir.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Transport, froid, équipement, formation, sourcing, projet ou autre besoin : Mbàmbulaan organise la qualification.</p>
            <Link href="/solutions" className="mt-6 inline-flex items-center gap-2 font-black text-[#075568]">Trouver une solution <ArrowRight size={16} /></Link>
          </div>
          <div className="rounded-[26px] bg-[#f2eadb] p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#8b601e]">Vous pouvez apporter une capacité ?</p>
            <h2 className="mt-3 text-2xl font-black">Faites connaître votre capacité à Mbàmbulaan.</h2>
            <p className="mt-3 text-sm leading-6 text-[#6e6657]">Entreprise, ONG, expert, transporteur, formateur, financeur ou organisation : l’entrée dans le réseau reste qualifiée.</p>
            <Link href="/reseau" className="mt-6 inline-flex items-center gap-2 font-black text-[#8b601e]">Rejoindre le réseau <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="mt-14 flex flex-col gap-5 rounded-[26px] bg-[#031a22] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#74e1d6]">Explorer le littoral</p>
            <h2 className="mt-2 text-2xl font-black">Voir les territoires avant d’agir.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-3 font-black text-[#031a22]"><MapPinned size={16} /> Ouvrir l’Atlas</Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 px-4 py-3 font-bold text-white"><Compass size={16} /> Parler à Mbàmbulaan</Link>
          </div>
        </section>
      </section>
      <PublicFooter />
    </main>
  );
}
