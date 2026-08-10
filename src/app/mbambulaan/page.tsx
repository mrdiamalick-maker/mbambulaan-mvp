import Link from "next/link";
import { ArrowRight, Compass, MapPinned, Network, Radar, Route } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";

const pillars = [
  { title: "Terrain", text: "Comprendre les réalités, identifier les besoins et maintenir une relation directe avec les territoires.", icon: Route },
  { title: "Réseau", text: "Mobiliser organisations, professionnels, entreprises, partenaires, experts et programmes lorsque l’action l’exige.", icon: Network },
  { title: "Technologie", text: "Structurer l’information, relier les contextes et rendre la coordination plus simple et plus fiable.", icon: Radar }
] as const;

const loop = ["Observer", "Qualifier", "Connecter", "Coordonner", "Réaliser", "Mesurer", "Apprendre"];

export default function MbambulaanPage() {
  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Mbàmbulaan"
        title={<>Terrain, réseau et technologie. <span className="text-[var(--pub-turquoise-300)]">Une même capacité d’action.</span></>}
        description="Mbàmbulaan construit une infrastructure de coordination pour l’économie maritime, en commençant par la filière halieutique sénégalaise."
        actions={
          <>
            <Link href="/atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/12"><MapPinned size={16}/> Ouvrir l’Atlas</Link>
            <Link href="/solutions" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Trouver une solution <ArrowRight size={16}/></Link>
          </>
        }
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article key={title} className="pub-card p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Icon size={20} /></span>
              <h2 className="mt-5 text-2xl font-bold tracking-[-.03em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{text}</p>
            </article>
          ))}
        </div>

        <section className="mt-14 grid gap-8 rounded-[28px] border border-[#d9e3e3] bg-white p-6 md:p-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="pub-eyebrow">Ce que fait Mbàmbulaan</p>
            <h2 className="mt-4 text-4xl font-[740] tracking-[-.04em]">Comprendre avant d’organiser l’action.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--pub-stone-700)]">Mbàmbulaan aide à transformer un besoin, une capacité ou une opportunité en action plus lisible, plus coordonnée et mieux suivie.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {loop.map((item, index) => (
              <div key={item} className="rounded-xl bg-[var(--pub-ivory-200)] p-4">
                <p className="text-[10px] font-black text-[#8da0a3]">0{index + 1}</p>
                <p className="mt-2 text-sm font-black text-[var(--pub-deep-900)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[26px] bg-[#eaf5f1] p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-deep-800)]">Vous avez un besoin ?</p>
            <h2 className="mt-3 text-2xl font-black">Décrivez ce que vous cherchez à accomplir.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Transport, froid, équipement, formation, sourcing, projet ou autre besoin : Mbàmbulaan organise la qualification.</p>
            <Link href="/solutions" className="mt-6 inline-flex items-center gap-2 font-black text-[var(--pub-deep-800)]">Trouver une solution <ArrowRight size={16} /></Link>
          </div>
          <div className="rounded-[26px] bg-[#f2eadb] p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#8b601e]">Vous pouvez apporter une capacité ?</p>
            <h2 className="mt-3 text-2xl font-black">Faites connaître votre capacité à Mbàmbulaan.</h2>
            <p className="mt-3 text-sm leading-6 text-[#6e6657]">Entreprise, ONG, expert, transporteur, formateur, financeur ou organisation : l’entrée dans le réseau reste qualifiée.</p>
            <Link href="/contact?intent=contribution" className="mt-6 inline-flex items-center gap-2 font-black text-[#8b601e]">Proposer mes services <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="mt-14 flex flex-col gap-5 rounded-[26px] bg-[#031a22] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-turquoise-300)]">Explorer le littoral</p>
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
