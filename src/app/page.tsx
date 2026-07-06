import Link from "next/link";
import { SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

const flow = [
  ["Comprendre", "Le ministère voit les alertes, les quais concernés, les preuves disponibles et les programmes en cours."],
  ["Demander", "Une demande claire est envoyée au bon acteur : référent, mareyeur, ONG, institution ou fournisseur."],
  ["Répondre", "L’acteur concerné ajoute l’information attendue : photo, relevé, devis, avis ou compte rendu."],
  ["Suivre", "Le ministère voit qui a répondu, ce qui manque encore et quelle décision peut être prise."]
];

export default function Home() {
  return <main className="min-h-screen bg-[#f4faf9] text-slate-950">
    <header className="sticky top-0 z-40 border-b border-cyan-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</span><span><span className="block text-base font-black">Mbàmbulaan</span><span className="hidden text-xs font-bold text-cyan-700 sm:block">Coordonner les acteurs de la pêche artisanale</span></span></Link>
        <div className="flex items-center gap-2"><Link href="/espace-prive/etat" className="hidden rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950 sm:inline-flex">Espace ministère</Link><Link href="/demande-demo" className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Demander un essai pilote</Link></div>
      </div>
    </header>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1fr] lg:items-center lg:py-24">
      <div><StatusBadge tone="blue">Coordination de la filière pêche artisanale</StatusBadge><h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Transformer les informations du terrain en décisions suivies.</h1><p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Mbàmbulaan aide le ministère et ses partenaires à mieux organiser le suivi des quais, des demandes et des preuves terrain. Chaque demande a un responsable, une pièce attendue, un délai et un retour visible.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/demande-demo" className="rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-6 py-3 text-center text-sm font-black text-white shadow-lg shadow-cyan-900/20">Demander un essai pilote</Link><Link href="/espace-prive/etat" className="rounded-full border border-cyan-200 bg-white px-6 py-3 text-center text-sm font-black text-cyan-950">Voir l’espace ministère</Link></div></div>
      <div className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl shadow-cyan-950/10"><div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Exemple de suivi</p><h2 className="mt-2 text-2xl font-black">Du signal terrain à la réponse reçue</h2><div className="mt-5 grid gap-3">{flow.map(([label, text], index) => <div key={label} className="grid grid-cols-[2.35rem_1fr] gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-cyan-950">{index + 1}</span><span><span className="block text-sm font-black">{label}</span><span className="block text-xs font-semibold leading-5 text-white/70">{text}</span></span></div>)}</div></div></div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-3"><SectionCard title="Espace ministère" description="Voir et décider"><p className="text-sm font-semibold leading-6 text-slate-600">Le ministère suit les alertes, prépare une demande et vérifie les retours reçus.</p></SectionCard><SectionCard title="Espaces acteurs" description="Répondre à une demande"><p className="text-sm font-semibold leading-6 text-slate-600">Référent, mareyeur, ONG, institution ou acteur privé reçoit une demande simple et sait quoi fournir.</p></SectionCard><SectionCard title="Suivi des décisions" description="Garder une preuve"><p className="text-sm font-semibold leading-6 text-slate-600">Chaque réponse complète le dossier : photo, justificatif, avis, devis ou compte rendu.</p></SectionCard></section>
  </main>;
}
