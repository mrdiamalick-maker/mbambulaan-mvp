import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass, MapPinned, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicAtlasWorkspace } from "@/components/ecosystem/PublicAtlasWorkspace";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { EventOnMount } from "@/components/public/EventOnMount";

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
        title={<>Explorer l’économie maritime <span className="text-[var(--pub-turquoise-300)]">par les territoires.</span></>}
        description="L’Atlas public permet de découvrir les quais, les activités et les informations territoriales utiles sans exposer les données opérationnelles privées. La couverture s’enrichit progressivement, en commençant par la filière halieutique sénégalaise."
        actions={<><Link href="/solutions?source=atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Trouver une solution <ArrowRight size={16}/></Link><Link href="/contact?intent=programme&source=atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white"><Compass size={16}/> Étudier une intervention</Link></>}
      />

      <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pub-eyebrow">Territoires</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)] md:text-3xl">Chercher un quai, une localité ou une activité.</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#cbd9d8] bg-white px-3 py-2 text-xs font-bold text-[var(--pub-stone-500)]"><ShieldCheck size={14} className="text-[var(--pub-turquoise-500)]"/> Données publiques et de démonstration clairement distinguées</span>
        </div>

        <PublicAtlasWorkspace />

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <Link href="/decouvrir" className="pub-card group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
            <MapPinned className="text-[var(--pub-deep-800)]"/>
            <p className="pub-eyebrow mt-5">Comprendre</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Découvrir les métiers et les chaînes de valeur.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Relier chaque territoire aux contenus qui expliquent ses activités et ses enjeux.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Découvrir <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
          <Link href="/opportunites" className="pub-card group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
            <Compass className="text-[var(--pub-deep-800)]"/>
            <p className="pub-eyebrow mt-5">Opportunités</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Voir les programmes, formations et appels pertinents.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Accéder aux opportunités reliées aux territoires et aux besoins de l’économie maritime.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Voir les opportunités <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
          <Link href="/contact?intent=correction&source=atlas" className="pub-card group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
            <ShieldCheck className="text-[var(--pub-deep-800)]"/>
            <p className="pub-eyebrow mt-5">Contribuer</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Signaler une information ou proposer une mise à jour.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Les contributions sont examinées par Mbàmbulaan avant toute publication.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-deep-800)]">Proposer une correction <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
