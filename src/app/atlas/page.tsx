import Link from "next/link";
import { ArrowRight, Database, MapPinned, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ProductProvider } from "@/components/providers/ProductProvider";
import { AtlasWorkspace } from "@/components/ecosystem/AtlasWorkspace";

export default function PublicAtlasPage() {
  return <main className="min-h-screen bg-[#f4f7f6]">
    <PublicHeader />
    <section className="bg-[#062f38] px-5 py-14 text-white md:px-10"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#64decd]"><MapPinned size={16}/> Observatoire territorial</div><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">Les quais donnent à voir la filière.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#c7dde1]">Explorez les territoires, l’activité des quais, les capacités disponibles et les produits observés. Les données sensibles restent réservées aux organisations habilitées.</p></div><div className="flex gap-3 text-xs font-bold"><span className="data-chip"><Database size={14}/> Sources visibles</span><span className="data-chip"><ShieldCheck size={14}/> Données agrégées</span></div></div></section>
    <ProductProvider><div className="mx-auto max-w-7xl p-5 md:p-10"><AtlasWorkspace publicMode /><div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[18px] border border-[#b9dfe4] bg-[#eaf8fa] p-5 md:flex-row md:items-center"><div><p className="font-black text-[#062d36]">Votre organisation veut coordonner et agir ?</p><p className="mt-1 text-sm text-[#60737a]">L’espace professionnel relie chaque observation à une responsabilité, une action et un résultat.</p></div><div className="flex flex-wrap gap-2"><Link href="/offres" className="btn-secondary">Voir les solutions</Link><Link href="/connexion" className="btn-primary">Accès professionnel <ArrowRight size={15}/></Link></div></div></div></ProductProvider>
  </main>;
}
