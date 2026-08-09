import Link from "next/link";
import { ArrowRight, BookOpen, MapPinned, ShieldCheck, Users } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ProductProvider } from "@/components/providers/ProductProvider";
import { PublicAtlasWorkspace } from "@/components/ecosystem/PublicAtlasWorkspace";
import { PublicFooter } from "@/components/public/PublicFooter";
import { createDemoState } from "@/data/demo-state";

export default function PublicAtlasPage() {
  const state = createDemoState();
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 pb-16 pt-14 text-white md:px-10 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#74e1d6]"><MapPinned size={16}/> Atlas public du littoral</div>
          <h1 className="mt-5 max-w-5xl text-4xl font-[760] leading-[1.01] tracking-[-.055em] md:text-7xl">Voir les territoires.<br/><span className="text-[#74e1d6]">Comprendre les interdépendances.</span></h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/66">Une lecture ouverte, agrégée et pédagogique des quais, flux, capacités et situations qui structurent la pêche artisanale sénégalaise.</p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold"><span className="public-trust-pill"><ShieldCheck size={14}/> Données de démonstration</span><span className="public-trust-pill"><Users size={14}/> {state.territories.length} territoires représentés</span><span className="public-trust-pill"><MapPinned size={14}/> Géométrie illustrative</span></div>
        </div>
      </section>
      <ProductProvider>
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16">
          <PublicAtlasWorkspace />
          <section className="mt-12 grid gap-4 md:grid-cols-2">
            <Link href="/actualites" className="group rounded-2xl border border-[#d9e3e3] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd] md:p-8"><Users className="text-[#0a6d68]"/><p className="label mt-6">Ressources ouvertes</p><h2 className="mt-2 text-3xl font-[740] tracking-[-.04em] text-[#10373a]">Suivre les dynamiques et les initiatives.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#60716f]">Décryptages, besoins qualifiés, capacités et appels à contribution du littoral.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0a6d68]">Voir ce qui bouge <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span></Link>
            <Link href="/durabilite" className="group rounded-2xl border border-[#d9e3e3] bg-[#f9f5eb] p-6 transition hover:-translate-y-0.5 hover:border-[#d5b980] md:p-8"><BookOpen className="text-[#a66f20]"/><p className="label mt-6">Pêche durable</p><h2 className="mt-2 text-3xl font-[740] tracking-[-.04em] text-[#10373a]">Préserver la ressource et la valeur.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#60716f]">Provenance, saisonnalité, qualité et démarches de progrès expliquées simplement.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#8b601e]">Découvrir les engagements <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span></Link>
          </section>
        </div>
      </ProductProvider>
      <PublicFooter />
    </main>
  );
}
