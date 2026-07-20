import Link from "next/link";
import { PublicContactForm } from "@/components/public/PublicContactForm";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";

export default function ContactPage() {
  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <PublicSiteHeader />
    <section className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto grid max-w-[84rem] gap-7 px-5 py-9 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.5fr)] lg:px-10 lg:py-12">
        <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Participer à Mbàmbulaan</p><h1 className="mt-3 max-w-3xl text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[1.04] text-[var(--mb-navy-900)]">Partagez, proposez ou rejoignez une initiative</h1><p className="mt-4 max-w-2xl text-[13px] leading-6 text-[var(--mb-neutral-600)]">Cet espace est ouvert aux acteurs de terrain, organisations, partenaires, institutions et particuliers.</p></div>
        <div className="border-l-2 border-[var(--mb-sand-300)] pl-5"><p className="text-[11px] font-bold text-[var(--mb-navy-900)]">Vous pouvez notamment</p><ul className="mt-4 space-y-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]"><li>Faire connaître une initiative locale</li><li>Signaler une information utile</li><li>Proposer une expertise ou un soutien</li><li>Rejoindre un projet</li></ul><Link href="/projets" className="mt-5 inline-flex text-[11px] font-bold text-[var(--mb-ocean-600)]">Voir les projets ouverts →</Link></div>
      </div>
    </section>
    <section><div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(15rem,.42fr)_minmax(0,1fr)] lg:px-10 lg:py-14"><div><h2 className="text-[21px] font-semibold text-[var(--mb-navy-900)]">Les informations utiles</h2><ol className="mt-5 grid gap-4 text-[11px] leading-5 text-[var(--mb-neutral-600)]"><li><strong className="block text-[var(--mb-navy-900)]">1. Votre intention</strong>Partager, proposer, rejoindre ou soutenir.</li><li><strong className="block text-[var(--mb-navy-900)]">2. Le territoire concerné</strong>Une localité, un quai ou une communauté.</li><li><strong className="block text-[var(--mb-navy-900)]">3. La suite recherchée</strong>Une mise en relation, une ressource ou un échange.</li></ol></div><PublicContactForm /></div></section>
  </main>;
}
