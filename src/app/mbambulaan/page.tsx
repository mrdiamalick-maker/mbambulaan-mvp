import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass, MapPinned, Network, Radar, Route } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { LoopDiagram } from "@/components/public/LoopDiagram";
import { EditorialPhoto } from "@/components/public/EditorialPhoto";

export const metadata: Metadata = {
  title: "Mbàmbulaan | Infrastructure de coordination",
  description: "Mbàmbulaan organise la coordination entre territoires, situations et capacités dans l’économie maritime, en commençant par la pêche artisanale sénégalaise.",
  alternates: { canonical: "/mbambulaan" }
};

const pillars = [
  { title: "Terrain", text: "Comprendre les réalités, identifier les situations et maintenir une relation directe avec les territoires.", icon: Route },
  { title: "Réseau", text: "Relier organisations, professionnels, entreprises, partenaires, experts et programmes lorsque l’action l’exige.", icon: Network },
  { title: "Technologie", text: "Structurer l’information, relier les contextes et rendre la coordination plus simple, traçable et fiable.", icon: Radar }
] as const;

const tensions = [
  { title: "Information fragmentée", text: "Il est difficile de savoir qui fait quoi, où, avec quelle capacité réelle et dans quelles conditions." },
  { title: "Besoins mal qualifiés", text: "Une demande vague conduit facilement à une réponse inadaptée, surdimensionnée ou impossible à mobiliser." },
  { title: "Actions isolées", text: "Équipement, financement, formation, logistique et débouchés sont encore trop souvent traités séparément." }
] as const;

const capabilities = [
  { title: "Comprendre", text: "Rendre lisibles les territoires, les métiers, les capacités documentées et les enjeux de la filière." },
  { title: "Qualifier", text: "Transformer une demande vague en situation exploitable, avec territoire, contexte, contraintes et résultat recherché." },
  { title: "Relier", text: "Identifier les acteurs et capacités pertinents sans transformer Mbàmbulaan en annuaire public ou marketplace." },
  { title: "Coordonner", text: "Organiser la suite entre les parties concernées et suivre ce qui doit réellement se passer jusqu’au résultat." }
] as const;

export default function MbambulaanPage() {
  return (
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />

      <PublicSectionHero
        eyebrow="Mbàmbulaan"
        title={<>Mbàmbulaan organise la coordination là où les acteurs, les situations et les capacités sont <span className="text-[var(--pub-turquoise-300)]">dispersés.</span></>}
        description="Nous commençons par la pêche artisanale sénégalaise : comprendre les territoires, qualifier les situations, relier les bons acteurs et suivre l’action jusqu’au résultat."
        actions={<><Link href="/atlas" className="pub-btn pub-btn-on-dark"><MapPinned size={16}/> Comprendre un territoire</Link><Link href="/solutions" className="pub-btn pub-btn-primary">Décrire une situation <ArrowRight size={16}/></Link></>}
        backgroundImage="/images/mbambulaan-terrain-hero.jpg"
        backgroundAlt="Équipe Mbàmbulaan sur le terrain, échange avec des acteurs de la filière sur un quai."
      />

      <section className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article key={title} className="pub-card p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><Icon size={20}/></span>
              <h2 className="mt-5 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10"><EditorialPhoto src="/images/mbambulaan-terrain.jpg" alt="Équipe Mbàmbulaan en échange avec des acteurs de la filière sur un site de débarquement." caption="Présence terrain : comprendre un territoire suppose d’abord de s’y rendre."/></div>

        <section className="mt-16">
          <p className="pub-eyebrow">Pourquoi Mbàmbulaan existe</p>
          <h2 className="pub-display mt-3 max-w-4xl text-[2.4rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[3.4rem]">Le problème n’est pas seulement le manque de solutions. C’est le manque de coordination.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{tensions.map((item) => <article key={item.title} className="pub-card p-6"><h3 className="text-xl font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.text}</p></article>)}</div>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[var(--pub-stone-700)]">Mbàmbulaan crée une couche de coordination commune entre ces situations : une information plus fiable, des besoins mieux qualifiés et des actions qui peuvent enfin être reliées entre elles.</p>
        </section>

        <section className="mt-16 rounded-[var(--pub-radius-lg)] border border-[var(--pub-stone-150)] bg-white p-6 md:p-10">
          <p className="pub-eyebrow">Comment ça fonctionne</p>
          <h2 className="mt-4 text-3xl font-[740] tracking-[-.04em] text-[var(--pub-deep-900)] md:text-4xl">Une situation devient une action coordonnée.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--pub-stone-700)]">Mbàmbulaan relie les territoires et les capacités, qualifie les situations et coordonne l’action. La boucle ci-dessous décrit comment cette coordination se déroule dans le temps.</p>
          <div className="mt-8"><LoopDiagram/></div>
        </section>

        <section id="valeur-immediate" className="mt-16 scroll-mt-24">
          <p className="pub-eyebrow">Ce qui existe déjà</p>
          <h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] text-[var(--pub-deep-900)] md:text-4xl">Une infrastructure utile avant même tous les outils professionnels.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{capabilities.map((item) => <article key={item.title} className="pub-card p-6"><h3 className="text-xl font-bold tracking-[-.025em] text-[var(--pub-deep-900)]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">{item.text}</p></article>)}</div>
          <div className="mt-6 rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)] p-5"><p className="text-sm leading-6 text-[var(--pub-stone-700)]">Les outils professionnels viendront renforcer cette infrastructure avec des workflows et espaces adaptés aux organisations qui opèrent quotidiennement dans la filière, à mesure que les usages réels le justifieront.</p></div>
        </section>

        <section className="mt-16">
          <p className="pub-eyebrow">Entrer dans Mbàmbulaan</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-[740] tracking-[-.04em] text-[var(--pub-deep-900)] md:text-4xl">Trois portes d’entrée, une même logique de coordination.</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <article className="pub-card p-6"><p className="text-xs font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-500)]">J’ai une situation à résoudre</p><h3 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Décrire la situation avant de qualifier le besoin.</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Transport, froid, équipement, formation, financement, sourcing ou autre situation : Mbàmbulaan organise la qualification.</p><Link href="/solutions" className="pub-btn pub-btn-primary mt-6">Décrire ma situation <ArrowRight size={16}/></Link></article>
            <article className="pub-card p-6"><p className="text-xs font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-500)]">Je peux apporter une capacité</p><h3 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[var(--pub-deep-900)]">Faire connaître une capacité mobilisable.</h3><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Entreprise, ONG, expert, transporteur, formateur, financeur ou organisation : l’entrée dans le réseau reste qualifiée.</p><Link href="/contact?intent=contribution" className="pub-btn pub-btn-outline mt-6">Proposer une capacité <ArrowRight size={16}/></Link></article>
            <article className="rounded-[var(--pub-radius-md)] bg-[var(--pub-deep-800)] p-6 text-white"><p className="text-xs font-black uppercase tracking-[.12em] text-[var(--pub-turquoise-300)]">Je veux agir sur un territoire</p><h3 className="mt-3 text-2xl font-bold tracking-[-.03em]">Comprendre le contexte avant d’intervenir.</h3><p className="mt-3 text-sm leading-6 text-white/62">L’Atlas relie activités, capacités documentées et contenus territoriaux pour préparer une décision ou une intervention.</p><Link href="/atlas" className="pub-btn pub-btn-primary mt-6"><MapPinned size={16}/> Ouvrir l’Atlas</Link></article>
          </div>
          <div className="mt-8 flex flex-col gap-4 rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)] p-6 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-bold text-[var(--pub-deep-900)]">Vous ne savez pas encore par où commencer ?</p><p className="mt-1 text-sm text-[var(--pub-stone-700)]">Parlez-nous du contexte. Nous vous orienterons vers le bon point d’entrée.</p></div><Link href="/contact" className="pub-btn pub-btn-outline"><Compass size={16}/> Parler à Mbàmbulaan</Link></div>
        </section>
      </section>
      <PublicFooter/>
    </main>
  );
}
