import Link from "next/link";
import { ArrowRight, Compass, MapPinned, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicAtlasWorkspace } from "@/components/ecosystem/PublicAtlasWorkspace";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";

export default function PublicAtlasPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Atlas Mbàmbulaan"
        title={<>Explorer l’économie maritime <span className="text-[#74e1d6]">par les territoires.</span></>}
        description="L’Atlas public permet de découvrir les quais, les activités et les informations territoriales utiles sans exposer les données opérationnelles privées. La couverture s’enrichit progressivement, en commençant par la filière halieutique sénégalaise."
        actions={<><Link href="/solutions?source=atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5fe0d3] px-4 py-2.5 text-sm font-bold text-[#031a22]">Trouver une solution <ArrowRight size={16}/></Link><Link href="/contact?intent=intervention&source=atlas" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white"><Compass size={16}/> Étudier une intervention</Link></>}
      />

      <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label">Territoires</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[#102e37] md:text-3xl">Chercher un quai, une localité ou une activité.</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#cbd9d8] bg-white px-3 py-2 text-xs font-bold text-[#60737a]"><ShieldCheck size={14} className="text-[#118f83]"/> Données publiques et de démonstration clairement distinguées</span>
        </div>

        <PublicAtlasWorkspace />

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <Link href="/decouvrir" className="surface group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
            <MapPinned className="text-[#0a6d68]"/>
            <p className="label mt-5">Comprendre</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[#10373a]">Découvrir les métiers et les chaînes de valeur.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Relier chaque territoire aux contenus qui expliquent ses activités et ses enjeux.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Découvrir <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
          <Link href="/opportunites" className="surface group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
            <Compass className="text-[#0a6d68]"/>
            <p className="label mt-5">Opportunités</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[#10373a]">Voir les programmes, formations et appels pertinents.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Accéder aux opportunités reliées aux territoires et aux besoins de l’économie maritime.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Voir les opportunités <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
          <Link href="/contact?intent=correction&source=atlas" className="surface group p-6 transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
            <ShieldCheck className="text-[#0a6d68]"/>
            <p className="label mt-5">Contribuer</p>
            <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em] text-[#10373a]">Signaler une information ou proposer une mise à jour.</h2>
            <p className="mt-3 text-sm leading-6 text-[#60716f]">Les contributions sont examinées par Mbàmbulaan avant toute publication.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075568]">Proposer une correction <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
