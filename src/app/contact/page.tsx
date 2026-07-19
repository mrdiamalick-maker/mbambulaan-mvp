import Link from "next/link";
import { PublicContactForm } from "@/components/public/PublicContactForm";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";

export default function ContactPage() {
  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <PublicSiteHeader />
    <section className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.55fr)] lg:px-10 lg:py-20">
        <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Nous contacter</p><h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,4.7vw,4.4rem)] font-semibold leading-[1.02] text-[var(--mb-navy-900)]">Parlons de votre territoire, de votre programme ou de votre besoin.</h1><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">Donnez-nous les éléments essentiels. Vous obtiendrez un récapitulatif clair pour préparer le premier échange.</p></div>
        <div className="border-l-2 border-[var(--mb-sand-300)] pl-5"><p className="text-[11px] font-bold text-[var(--mb-navy-900)]">Nous orientons les échanges autour de</p><ul className="mt-4 space-y-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]"><li>Un atelier avec une institution publique</li><li>Un partenariat technique ou financier</li><li>Un programme territorial à structurer</li><li>Une initiative portée par la filière</li></ul><Link href="/decouvrir#programmes" className="mt-6 inline-flex text-[11px] font-bold text-[var(--mb-ocean-600)]">Voir les programmes suivis →</Link></div>
      </div>
    </section>
    <section>
      <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(15rem,.45fr)_minmax(0,1fr)] lg:px-10 lg:py-20">
        <div><h2 className="text-[22px] font-semibold text-[var(--mb-navy-900)]">Les informations utiles</h2><ol className="mt-5 grid gap-4 text-[11px] leading-5 text-[var(--mb-neutral-600)]"><li><strong className="block text-[var(--mb-navy-900)]">1. Le contexte</strong>Le problème ou l’opportunité que vous observez.</li><li><strong className="block text-[var(--mb-navy-900)]">2. Le territoire</strong>La zone, le quai ou les communautés concernés.</li><li><strong className="block text-[var(--mb-navy-900)]">3. Le résultat recherché</strong>Ce qu’un premier échange devrait permettre de décider.</li></ol></div>
        <PublicContactForm />
      </div>
    </section>
  </main>;
}
