import Link from "next/link";
import { SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

const flow = [
  ["Lire", "Le cockpit Etat relie signaux terrain, quais, preuves et programmes."],
  ["Envoyer", "Une action sortante est adressee au bon partenaire avec piece attendue et delai."],
  ["Repondre", "Le partenaire complete la demande dans son espace destinataire."],
  ["Suivre", "Le retour reste visible cote Etat dans le journal de coordination."]
];

export default function Home() {
  return <main className="min-h-screen bg-[#f4faf9] text-slate-950">
    <header className="sticky top-0 z-40 border-b border-cyan-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</span><span><span className="block text-base font-black">Mbàmbulaan</span><span className="hidden text-xs font-bold text-cyan-700 sm:block">Infrastructure de coordination pour la peche artisanale</span></span></Link>
        <div className="flex items-center gap-2"><Link href="/espace-prive/etat" className="hidden rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950 sm:inline-flex">Cockpit Etat</Link><Link href="/demande-demo" className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Demander un essai pilote</Link></div>
      </div>
    </header>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1fr] lg:items-center lg:py-24">
      <div><StatusBadge tone="blue">Solution B2B de coordination territoriale</StatusBadge><h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Transformer les signaux terrain en actions suivies.</h1><p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Mbàmbulaan aide l’Etat et ses partenaires a passer d’informations dispersees a une coordination concrete : action envoyee, piece attendue, retour recu, decision documentee.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/demande-demo" className="rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-6 py-3 text-center text-sm font-black text-white shadow-lg shadow-cyan-900/20">Demander un essai pilote</Link><Link href="/espace-prive/etat" className="rounded-full border border-cyan-200 bg-white px-6 py-3 text-center text-sm font-black text-cyan-950">Voir le cockpit Etat</Link></div></div>
      <div className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl shadow-cyan-950/10"><div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Apercu produit</p><h2 className="mt-2 text-2xl font-black">Etat vers partenaire vers retour</h2><div className="mt-5 grid gap-3">{flow.map(([label, text], index) => <div key={label} className="grid grid-cols-[2.35rem_1fr] gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-cyan-950">{index + 1}</span><span><span className="block text-sm font-black">{label}</span><span className="block text-xs font-semibold leading-5 text-white/70">{text}</span></span></div>)}</div></div></div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-3"><SectionCard title="Cockpit Etat" description="Espace emetteur"><p className="text-sm font-semibold leading-6 text-slate-600">L’Etat decide, envoie une action et suit le retour.</p></SectionCard><SectionCard title="Espaces destinataires" description="Partenaires concernes"><p className="text-sm font-semibold leading-6 text-slate-600">Referent, mareyeur, ONG, institution ou acteur prive recoit une demande claire.</p></SectionCard><SectionCard title="Journal de coordination" description="Retour suivi"><p className="text-sm font-semibold leading-6 text-slate-600">Chaque reponse devient une piece du dossier et une preuve de coordination.</p></SectionCard></section>
  </main>;
}
