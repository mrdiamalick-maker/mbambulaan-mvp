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
        actions={<><Link href="/solutions?source=atlas" className="pub-btn pub-btn-primary">Décrire une situation <ArrowRight size={16}/></Link><Link href="/contact?intent=programme&source=atlas" className="pub-btn pub-btn-on-dark"><Compass size={16}/> Étudier une intervention</Link></>}
        backgroundImage="/images/atlas-cover.jpg"
        backgroundAlt="Quai de pêche artisanale sur le littoral sénégalais."
      />

      {/* PUB-AT1 (audit Premium XXL Public, CEO 2026-08-16) : py-10/py-14
          harmonisé vers py-14/py-20, le même rythme vertical que les
          sections équivalentes sur Découvrir et Opportunités (P4) — aucun
          changement structurel, uniquement l'espacement extérieur. */}
      <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <BlurFade inView className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="pub-eyebrow">Lecture territoriale</p>
            <h2 className="pub-display mt-3 text-[2.1rem] not-italic leading-[1.05] text-[var(--pub-deep-900)] md:text-[2.8rem]">Choisir un territoire, puis lire ce qui le structure.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--pub-stone-700)]">Quais, activités, services documentés et espèces représentées sont présentés comme un portrait public du territoire — jamais comme un tableau de bord opérationnel.</p>
          </div>
          <span className="inline-flex max-w-md items-center gap-2 rounded-full border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)] px-3 py-2 text-xs font-bold text-[var(--pub-stone-500)]"><ShieldCheck size={14} className="text-[var(--pub-turquoise-500)]"/> Données publiques et démonstration éditoriale clairement distinguées</span>
        </BlurFade>

        <PublicAtlasWorkspace />

        {/* PUB-AT2 (audit Premium XXL Public, CEO 2026-08-16) : bande de
            navigation éditoriale légère plutôt que trois grosses .pub-card
            — l'Atlas (PublicAtlasWorkspace ci-dessus) doit rester la
            vedette de la page, pas partager la scène avec trois cards du
            même poids visuel juste en dessous. */}
        <section className="mt-12 divide-y divide-[var(--pub-stone-150)] rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)] md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
          <Link href="/decouvrir" className="group flex items-start gap-3 p-5 transition hover:bg-[var(--pub-ivory-100)]">
            <MapPinned size={18} className="mt-0.5 shrink-0 text-[var(--pub-turquoise-500)]"/>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]">Comprendre</p>
              <p className="mt-1.5 text-sm font-bold leading-5 text-[var(--pub-deep-900)]">Relier le territoire aux métiers et aux chaînes de valeur.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--pub-deep-800)]">Découvrir <ArrowRight size={12} className="transition group-hover:translate-x-1"/></span>
            </div>
          </Link>
          <Link href="/opportunites" className="group flex items-start gap-3 p-5 transition hover:bg-[var(--pub-ivory-100)]">
            <Compass size={18} className="mt-0.5 shrink-0 text-[var(--pub-turquoise-500)]"/>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]">Agir</p>
              <p className="mt-1.5 text-sm font-bold leading-5 text-[var(--pub-deep-900)]">Voir les opportunités et programmes reliés au terrain.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--pub-deep-800)]">Voir les opportunités <ArrowRight size={12} className="transition group-hover:translate-x-1"/></span>
            </div>
          </Link>
          <Link href="/contact?intent=correction&source=atlas" className="group flex items-start gap-3 p-5 transition hover:bg-[var(--pub-ivory-100)]">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[var(--pub-turquoise-500)]"/>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.11em] text-[var(--pub-turquoise-500)]">Fiabiliser</p>
              <p className="mt-1.5 text-sm font-bold leading-5 text-[var(--pub-deep-900)]">Signaler une information ou proposer une mise à jour.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--pub-deep-800)]">Proposer une correction <ArrowRight size={12} className="transition group-hover:translate-x-1"/></span>
            </div>
          </Link>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
