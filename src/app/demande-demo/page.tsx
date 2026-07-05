import Link from "next/link";
import { LeadForm, PageIntro } from "@/components/premium/PremiumComponents";

function SiteHeader() {
  return <header className="sticky top-0 z-40 border-b border-cyan-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</span><span><span className="block text-base font-black">Mbàmbulaan</span><span className="hidden text-xs font-bold text-cyan-700 sm:block">Coordonner les acteurs de la pêche artisanale</span></span></Link><div className="flex items-center gap-2"><Link href="/espace-prive/etat" className="hidden rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950 sm:inline-flex">Espace ministère</Link><Link href="/demande-demo" className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Demander un essai pilote</Link></div></div></header>;
}

function SiteFooter() {
  return <footer className="border-t border-cyan-100 bg-white px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-bold text-slate-600 md:flex-row md:items-center md:justify-between"><p>Mbàmbulaan · Coordination numérique pour la pêche artisanale</p><div className="flex flex-wrap gap-4"><Link href="/demande-demo">Demander un essai</Link><Link href="/espace-prive/etat">Espace ministère</Link></div></div></footer>;
}

export default function DemandeDemoPage() {
  return <main className="min-h-screen bg-[#f6fbfb]">
    <SiteHeader />
    <PageIntro eyebrow="Demande d'essai" title="Préparer un essai utile pour votre organisation." description="Indiquez votre organisation, le territoire concerné, le problème prioritaire et les acteurs à coordonner. L’objectif est de préparer une discussion concrète sur vos besoins, pas une démonstration générique." />
    <LeadForm kind="demo" />
    <SiteFooter />
  </main>;
}
