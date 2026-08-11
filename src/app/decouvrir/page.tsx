import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpenText, Compass, Snowflake, Truck, Factory, Handshake, MapPinned, Waves } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { publicNews, type PublicContentDomain } from "@/data/public-content";

export const metadata: Metadata = {
  title: "Découvrir | Mbàmbulaan",
  description: "Comprendre la filière halieutique sénégalaise pour mieux savoir où agir : territoires, froid, transport, transformation, financement et coordination.",
  alternates: { canonical: "/decouvrir" }
};

const domains: { title: PublicContentDomain; slug: string }[] = [
  { title: "Pêche & ressources", slug: "peche-ressources" },
  { title: "Débarquement", slug: "debarquement" },
  { title: "Conservation & froid", slug: "conservation-froid" },
  { title: "Transformation & valorisation", slug: "transformation-valorisation" },
  { title: "Transport & logistique", slug: "transport-logistique" },
  { title: "Commerce & débouchés", slug: "commerce-debouches" },
  { title: "Équipements & maintenance", slug: "equipements-maintenance" },
  { title: "Compétences & formation", slug: "competences-formation" },
  { title: "Financement & développement", slug: "financement-developpement" },
  { title: "Territoires & infrastructures", slug: "territoires-infrastructures" },
  { title: "Durabilité & environnement", slug: "durabilite-environnement" }
];

const entryTopics = [
  { title: "Réduire les pertes après capture", text: "Comprendre ce qui se joue entre débarquement, froid, transport et débouchés.", icon: Waves, href: "/decouvrir/analyse-pertes-post-capture" },
  { title: "Organiser le froid", text: "Qualifier un besoin de glace, de stockage ou de conservation avant de chercher une solution.", icon: Snowflake, href: "/decouvrir/guide-besoin-froid" },
  { title: "Comprendre un territoire", text: "Relier activités, infrastructures et besoins à un contexte local précis.", icon: MapPinned, href: "/atlas" },
  { title: "Acheminer les produits", text: "Structurer origine, destination, volume, fréquence et contraintes de transport.", icon: Truck, href: "/decouvrir/guide-transport" },
  { title: "Valoriser la transformation", text: "Voir où la valeur se crée après le débarquement et ce qui peut la limiter.", icon: Factory, href: "/decouvrir/comprendre-transformation" },
  { title: "Financer une intervention", text: "Commencer par documenter le problème, les bénéficiaires et le résultat attendu.", icon: Handshake, href: "/decouvrir/comprendre-financement" }
];

export default function DiscoverPage() {
  const featured = publicNews.slice(0, 5);
  const lead = featured[0];
  const secondary = featured.slice(1);

  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Découvrir"
        title={<>Comprendre la filière pour mieux savoir <span className="text-[var(--pub-turquoise-300)]">où agir.</span></>}
        description="Mbàmbulaan relie métiers, territoires, infrastructures et situations concrètes pour rendre la filière plus lisible avant une décision ou une demande d’action."
        actions={<><Link href="/atlas" className="pub-btn pub-btn-on-dark"><Compass size={16}/> Ouvrir l’Atlas</Link><Link href="/solutions" className="pub-btn pub-btn-primary">Décrire une situation <ArrowRight size={16}/></Link></>}
        backgroundImage="/images/decouvrir-cover.jpg"
        backgroundAlt="Débarquement et transformation artisanale sur un quai sénégalais."
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <p className="pub-eyebrow">Commencer par un sujet</p>
        <h2 className="pub-display mt-3 max-w-3xl text-[2.2rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3rem]">Partir d’une situation concrète plutôt que d’une catégorie abstraite.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entryTopics.map(({ title, text, icon: Icon, href }) => (
            <Link key={title} href={href} className="pub-card group p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Icon size={20}/></span>
              <h3 className="mt-5 text-xl font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Explorer <ArrowRight size={14} className="transition group-hover:translate-x-1"/></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--pub-stone-150)] bg-white px-5 py-12 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <p className="pub-eyebrow">Explorer toute la filière</p>
          <h2 className="pub-display mt-3 max-w-3xl text-[2rem] not-italic text-[var(--pub-deep-900)]">Onze domaines pour approfondir un sujet, sans perdre la vue d’ensemble.</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {domains.map((domain) => <Link key={domain.slug} href={`/decouvrir/domaine/${domain.slug}`} className="rounded-full border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] px-4 py-2 text-sm font-bold text-[var(--pub-deep-800)] transition hover:border-[var(--pub-turquoise-500)] hover:bg-[rgba(182,82,47,.05)]">{domain.title}</Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div><p className="pub-eyebrow">À lire maintenant</p><h2 className="pub-display mt-3 text-[2.2rem] not-italic text-[var(--pub-deep-900)] md:text-[3rem]">Des contenus utiles, reliés au terrain et à l’action.</h2></div>
          <span className="text-xs font-semibold text-[var(--pub-stone-500)]">Sélection éditoriale</span>
        </div>
        {lead && <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <Link href={`/decouvrir/${lead.id}`} className="pub-card group min-h-[360px] p-7 md:p-9"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]"><BookOpenText size={14}/>{lead.category}</div><h3 className="mt-5 max-w-3xl text-3xl font-bold tracking-[-.04em] text-[var(--pub-deep-900)] md:text-4xl">{lead.title}</h3><p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--pub-stone-700)]">{lead.excerpt}</p><div className="mt-8 flex items-center justify-between"><span className="text-xs font-semibold text-[var(--pub-stone-500)]">{lead.territory} · {lead.readingTime}</span><span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Lire <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span></div></Link>
          <div className="grid gap-4 sm:grid-cols-2">{secondary.map((item) => <Link key={item.id} href={`/decouvrir/${item.id}`} className="pub-card group flex min-h-44 flex-col p-5"><div className="text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]">{item.category}</div><h3 className="mt-3 text-lg font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.title}</h3><span className="mt-auto pt-4 text-xs font-semibold text-[var(--pub-stone-500)]">{item.territory} · {item.readingTime}</span></Link>)}</div>
        </div>}
      </section>

      <section className="bg-[var(--pub-deep-900)] px-5 py-14 text-white md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.14em] text-[var(--pub-turquoise-300)]">Passer à l’action</p><h2 className="mt-3 max-w-3xl text-3xl font-[740] tracking-[-.04em]">Un sujet correspond à une situation réelle ?</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Décrivez la situation. Mbàmbulaan qualifie le besoin, le contextualise et organise la suite avec les acteurs pertinents.</p></div>
          <Link href="/solutions" className="pub-btn pub-btn-primary min-h-12">Décrire ma situation <ArrowRight size={17}/></Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
