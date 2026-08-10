import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpenText, Compass, Snowflake, ShipWheel, Truck, Wrench, GraduationCap, Handshake, Factory, Waves, Leaf, Store, MapPinned as TerritoryIcon, X } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { ValueChainDiagram } from "@/components/public/ValueChainDiagram";
import { StatBand } from "@/components/public/StatBand";
import { SplitBar } from "@/components/public/SplitBar";
import { publicNews, type PublicContentDomain } from "@/data/public-content";
import { filiereStats, landingsSplit, statsNote } from "@/data/public-stats";

export const metadata: Metadata = {
  title: "Découvrir | Mbàmbulaan",
  description: "Comprendre l’économie maritime sénégalaise par ses métiers, ses chaînes de valeur et ses territoires : pêche, débarquement, froid, transformation, logistique, formation, financement et durabilité.",
  alternates: { canonical: "/decouvrir" }
};

const domains: { title: PublicContentDomain; text: string; icon: typeof Waves }[] = [
  { title: "Pêche & ressources", text: "Comprendre les pratiques, les espèces, la saisonnalité et les dynamiques de la ressource.", icon: Waves },
  { title: "Débarquement", text: "Voir comment les quais structurent les flux, les métiers et la première mise en marché.", icon: ShipWheel },
  { title: "Conservation & froid", text: "Glace, stockage, chaîne du froid et préservation de la qualité après capture.", icon: Snowflake },
  { title: "Transformation & valorisation", text: "Transformation artisanale, conditionnement et création de valeur locale.", icon: Factory },
  { title: "Transport & logistique", text: "Collecte, acheminement, manutention et organisation des flux entre territoires.", icon: Truck },
  { title: "Commerce & débouchés", text: "Mareyage, marchés, distribution et accès aux débouchés locaux, régionaux et export.", icon: Store },
  { title: "Équipements & maintenance", text: "Matériel, moteurs, froid, sécurité et services de maintenance utiles à l’activité.", icon: Wrench },
  { title: "Compétences & formation", text: "Savoirs métier, sécurité, qualité, gestion et montée en compétences des acteurs.", icon: GraduationCap },
  { title: "Financement & développement", text: "Programmes, appuis, partenariats et leviers d’investissement dans les territoires.", icon: Handshake },
  { title: "Territoires & infrastructures", text: "Quais, sites, équipements collectifs et lecture territoriale de la filière.", icon: TerritoryIcon },
  { title: "Durabilité & environnement", text: "Préserver la ressource, réduire les pertes et mieux documenter les pratiques.", icon: Leaf }
];

type SearchParams = Record<string, string | string[] | undefined>;

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const domaineParam = Array.isArray(params.domaine) ? params.domaine[0] : params.domaine;
  const activeDomain = domains.find((item) => item.title === domaineParam)?.title;
  const filteredNews = activeDomain ? publicNews.filter((item) => item.domain === activeDomain) : publicNews.slice(0, 6);

  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Découvrir"
        title={<>Comprendre l’économie maritime, <span className="text-[var(--pub-turquoise-300)]">par les usages et les territoires.</span></>}
        description="Mbàmbulaan rend lisibles les métiers, les chaînes de valeur, les besoins et les capacités qui structurent la filière halieutique et, progressivement, l’économie maritime sénégalaise."
        actions={<><Link href="/atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/12"><Compass size={16}/> Ouvrir l’Atlas</Link><Link href="/solutions" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22] hover:bg-[#76e8dd]">Trouver une solution <ArrowRight size={16}/></Link></>}
      />

      <section className="mx-auto max-w-[1500px] px-5 pt-14 md:px-10 md:pt-20">
        <p className="pub-eyebrow">La chaîne de valeur halieutique</p>
        <h2 className="pub-display mt-3 max-w-3xl text-[2rem] not-italic leading-[1.08] text-[var(--pub-deep-900)] md:text-[2.6rem]">Six maillons qui se lisent ensemble, jamais isolément.</h2>
        <div className="mt-8"><ValueChainDiagram /></div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div>
            <p className="pub-eyebrow">Pourquoi cette filière compte</p>
            <h2 className="pub-display mt-3 text-2xl not-italic text-[var(--pub-deep-900)]">Une économie qui fait déjà vivre le pays.</h2>
            <div className="mt-6"><StatBand stats={filiereStats.slice(3, 6)} /></div>
            <p className="mt-4 text-xs leading-5 text-[var(--pub-stone-500)]">{statsNote}</p>
          </div>
          <aside className="pub-card p-6 md:p-7">
            <p className="pub-eyebrow">Répartition des débarquements</p>
            <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">La filière est d’abord artisanale : des milliers de pirogues réparties sur tout le littoral, plutôt qu’une flotte industrielle concentrée.</p>
            <div className="mt-6"><SplitBar segments={landingsSplit} /></div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pb-14 md:px-10 md:pb-20">
        <p className="pub-eyebrow">Explorer par domaine</p>
        <h2 className="pub-display mt-3 text-2xl not-italic text-[var(--pub-deep-900)]">Neuf axes pour lire l’ensemble de la filière.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {domains.map(({ title, text, icon: Icon }) => (
            <Link key={title} href={`/decouvrir?domaine=${encodeURIComponent(title)}`} className={`pub-card group p-6 ${activeDomain === title ? "border-[var(--pub-turquoise-500)] ring-2 ring-[var(--pub-turquoise-500)]/15" : ""}`}>
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Icon size={20}/></span>
              <h2 className="mt-5 text-xl font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Explorer <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--pub-stone-150)] bg-white px-5 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="pub-eyebrow">{activeDomain ?? "À lire maintenant"}</p>
              <h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] text-[var(--pub-deep-900)] md:text-4xl">{activeDomain ? `Contenus : ${activeDomain}` : "Des contenus utiles, reliés à l’action."}</h2>
            </div>
            {activeDomain ? (
              <Link href="/decouvrir" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]"><X size={15}/> Réinitialiser le filtre</Link>
            ) : (
              <Link href="/opportunites" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Voir les opportunités <ArrowRight size={15}/></Link>
            )}
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {filteredNews.length ? filteredNews.map((item) => (
              <Link key={item.id} href={`/decouvrir/${item.id}`} className="pub-card group flex min-h-64 flex-col p-5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14}/>{item.category}</div>
                <h3 className="mt-4 text-xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-xs font-semibold text-[var(--pub-stone-500)]">{item.territory} · {item.readingTime}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--pub-deep-800)]">Lire <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
                </div>
              </Link>
            )) : <p className="text-sm text-[var(--pub-stone-500)]">Aucun contenu publié pour ce domaine pour le moment.</p>}
          </div>
        </div>
      </section>

      <section className="bg-[#0b3139] px-5 py-14 text-white md:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-turquoise-300)]">Passer à l’action</p><h2 className="mt-3 max-w-3xl text-3xl font-[740] tracking-[-.04em]">Vous avez un besoin dans l’économie maritime ?</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Décrivez votre besoin. Mbàmbulaan le qualifie et organise la suite avec son réseau et ses partenaires.</p></div>
          <Link href="/solutions" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#5fe0d3] px-5 py-3 font-bold text-[#031a22]">Trouver une solution <ArrowRight size={17}/></Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
