import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ProductProvider } from "@/components/providers/ProductProvider";
import { AtlasWorkspace } from "@/components/ecosystem/AtlasWorkspace";

export default function PublicAtlasPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <PublicHeader />
      <section className="border-b border-[#d8e1e2] bg-white px-5 py-12 md:px-10">
        <div className="mx-auto max-w-7xl"><p className="label">Atlas public</p><h1 className="mt-2 max-w-4xl text-4xl font-bold text-[#062d36] md:text-5xl">Explorer la filière sans exposer les données professionnelles.</h1><p className="mt-4 max-w-3xl text-base leading-7 text-[#60737a]">Cette vue limitée présente des territoires et capacités de démonstration. L’Atlas Premium ajoute historique, comparaison, fiabilité, prix, rareté et exports.</p></div>
      </section>
      <ProductProvider><div className="mx-auto max-w-7xl p-5 md:p-10"><AtlasWorkspace publicMode /><div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-[#b9dfe4] bg-[#eaf8fa] p-5"><div><p className="font-bold text-[#062d36]">Besoin d’une lecture professionnelle ?</p><p className="mt-1 text-sm text-[#60737a]">Connectez-vous ou explorez les offres Atlas Premium.</p></div><div className="flex gap-2"><Link href="/offres" className="border border-[#075466] px-4 py-2.5 text-sm font-bold text-[#075466]">Voir les offres</Link><Link href="/connexion" className="inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white">Accès professionnel <ArrowRight size={15} /></Link></div></div></div></ProductProvider>
    </main>
  );
}
