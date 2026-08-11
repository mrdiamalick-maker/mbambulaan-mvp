import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass, MapPinned, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicAtlasWorkspace } from "@/components/ecosystem/PublicAtlasWorkspace";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { EventOnMount } from "@/components/public/EventOnMount";
import { BlurFade } from "@/components/magicui/blur-fade";

export const metadata: Metadata = {
  title: "Atlas | Mbàmbulaan",
  description: "Explorer l’économie maritime sénégalaise par les territoires : quais, activités, services documentés et opportunités, sans données opérationnelles privées.",
  alternates: { canonical: "/atlas" }
};

export default function PublicAtlasPage() {
  return (
    <main className="pub-scope min-h-screen">
      <EventOnMount event="atlas_open" />
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Atlas Mbàmbulaan"
        title={<>Comprendre un territoire avant de décider <span className="text-[var(--pub-turquoise-300)]">où agir.</span></>}
        description="L’Atlas public rassemble des repères territoriaux, des activités et des capacités documentées pour donner un contexte commun. Il n’expose ni opérations individuelles, ni volumes privés, ni disponibilité en temps réel."
        actions={<><Link href="/solutions?source=atlas" className="pub-btn pub-btn-primary">Trouver une solution <ArrowRight size={16}/></Link><Link href="/contact?intent=programme&source=atlas" className="pub-btn pub-btn-on-dark"><Compass size={16}/> Étudier une intervention</Link></>}
        backgroundImage="/images/atlas-cover.jpg"
        backgroundAlt="Quai de pêche artisanale sur le littoral sénégalais."
      />

      <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10 md:py-14">
        <BlurFade inView className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="pub-eyebrow">Lecture territoriale</p>
            <h2 className="pub-display mt-3 text-[2.1rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[2.8rem]">Choisir un territoire, puis lire ce qui le structure.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--pub-stone-700)]">Quais, activités, services documentés et espèces représentées sont présentés comme un portrait public du territoire — jamais comme un tableau de bord opérationnel.</p>
          </div>
          <span className="inline-flex max-w-md items-center gap-2 rounded-full border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] px-3 py-2 text-xs font-bold text-[var(--pub-stone-500)]"><ShieldCheck size={14} className="text-[var(--pub-turquoise-500)]"/> Données publiques et démonstration éditoriale clairement distinguées</span>
        </BlurFade>

        <PublicAtlasWorkspace />

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          <Link href="/decouvrir" className="pub-card group p-6">
            <MapPinned className="text-[var(--pub-deep-800)]"/>
            <p className="pub-eyebrow mt-5">Comprendre</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Relier le territoire aux métiers et aux chaînes de valeur.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Les contenus publics expliquent les activités, les dépendances et les enjeux qui structurent chaque zone.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Découvrir <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
          <Link href="/opportunites" className="pub-card group p-6">
            <Compass className="text-[var(--pub-deep-800)]"/>
            <p className="pub-eyebrow mt-5">Agir</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Voir les opportunités et programmes reliés au terrain.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Formations, programmes, appels et initiatives utiles sont reliés aux territoires quand le contexte le justifie.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Voir les opportunités <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
          <Link href="/contact?intent=correction&source=atlas" className="pub-card group p-6">
            <ShieldCheck className="text-[var(--pub-deep-800)]"/>
            <p className="pub-eyebrow mt-5">Fiabiliser</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Signaler une information ou proposer une mise à jour.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Toute contribution est examinée avant publication afin de préserver la qualité du référentiel territorial.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Proposer une correction <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
