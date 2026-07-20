import Link from "next/link";
import { PublicContactForm } from "@/components/public/PublicContactForm";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";

export default function ContactPage() {
  return <main className="min-h-screen bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]">
    <PublicSiteHeader />
    <section className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.55fr)] lg:px-10 lg:py-20">
        <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mb-ocean-600)]">Participer à Mbàmbulaan</p><h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,4.7vw,4.4rem)] font-semibold leading-[1.02] text-[var(--mb-navy-900)]">Une information, une initiative, un besoin ou une envie de contribuer ?</h1><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--mb-neutral-600)]">Cet espace est ouvert aux acteurs de terrain, organisations, partenaires, institutions et particuliers. Expliquez simplement ce que vous souhaitez partager, proposer ou rechercher.</p></div>
        <div className="border-l-2 border-[var(--mb-sand-300)] pl-5"><p className="text-[11px] font-bold text-[var(--mb-navy-900)]">Vous pouvez notamment</p><ul className="mt-4 space-y-3 text-[11px] leading-5 text-[var(--mb-neutral-600)]"><li>Faire connaître une initiative locale</li><li>Signaler une information ou un événement utile</li><li>Proposer une expertise, un partenariat ou un soutien</li><li>Rejoindre un projet ou partager un besoin</li></ul><Link href="/decouvrir#projets" className="mt-6 inline-flex text-[11px] font-bold text-[var(--mb-ocean-600)]">Voir les projets ouverts →</Link></div>
      </div>
    </section>
    <section>
      <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(15rem,.45fr)_minmax(0,1fr)] lg:px-10 lg:py-20">
        <div><h2 className="text-[22px] font-semibold text-[var(--mb-navy-900)]">Les informations utiles</h2><ol className="mt-5 grid gap-4 text-[11px] leading-5 text-[var(--mb-neutral-600)]"><li><strong className="block text-[var(--mb-navy-900)]">1. Ce que vous souhaitez faire</strong>Partager, proposer, rechercher, rejoindre ou soutenir.</li><li><strong className="block text-[var(--mb-navy-900)]">2. Le territoire ou les acteurs concernés</strong>Une localité, un quai, une communauté ou l’ensemble de la filière.</li><li><strong className="block text-[var(--mb-navy-900)]">3. Ce qui serait utile ensuite</strong>Une mise en relation, de la visibilité, une ressource ou un premier échange.</li></ol></div>
        <PublicContactForm />
      </div>
    </section>
  </main>;
}
