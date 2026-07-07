import Link from "next/link";
import { SectionCard, StatusBadge } from "@/components/premium/PremiumComponents";

const hubFlows = [
  ["Terrain", "Un quai, une alerte, une activité ou un besoin remonte depuis les acteurs de la pêche."],
  ["Hub", "Mbàmbulaan relie l’information au bon territoire, au bon acteur et à la bonne suite."],
  ["Décision", "Le ministère ou le partenaire prépare une demande, une vérification, une note ou un arbitrage."],
  ["Retour", "L’acteur concerné répond avec une pièce, un avis, un relevé ou un compte rendu."],
  ["Preuve", "La décision reste suivie, expliquée et réutilisable pour coordonner la filière."]
];

const pillars = [
  ["Voir le terrain", "Quais, pêches du jour, tensions, incidents, preuves et besoins sont regroupés dans une lecture claire."],
  ["Coordonner les acteurs", "Référents, mareyeurs, ONG, institutions et acteurs privés reçoivent des demandes compréhensibles."],
  ["Suivre les décisions", "Chaque demande a un responsable, une pièce attendue, un délai et un retour visible."],
  ["Accélérer avec l’IA", "L’IA propose, explique et prépare. L’humain relit, corrige et valide."],
  ["Prouver l’action", "Photos, relevés, avis, justificatifs et comptes rendus alimentent le suivi."],
  ["Préparer le passage à l’échelle", "Le hub peut commencer par l’État et s’étendre aux programmes, partenaires et acteurs économiques."]
];

export default function Home() {
  return <main className="min-h-screen bg-[#f4faf9] text-slate-950">
    <header className="sticky top-0 z-40 border-b border-cyan-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</span><span><span className="block text-base font-black">Mbàmbulaan</span><span className="hidden text-xs font-bold text-cyan-700 sm:block">Le hub de coordination de la pêche artisanale</span></span></Link>
        <div className="flex items-center gap-2"><Link href="/espace-prive" className="hidden rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950 sm:inline-flex">Entrer dans le hub</Link><Link href="/demande-demo" className="rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-4 py-2 text-sm font-black text-white">Demander un essai pilote</Link></div>
      </div>
    </header>

    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1fr] lg:items-center lg:py-24">
      <div><StatusBadge tone="blue">Hub métier pour la filière pêche artisanale</StatusBadge><h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Relier le terrain, les acteurs et les décisions.</h1><p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">Mbàmbulaan est le hub qui aide la filière à mieux voir ce qui se passe, envoyer la bonne demande au bon acteur, recevoir le retour attendu et garder une preuve utile pour décider.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/demande-demo" className="rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-6 py-3 text-center text-sm font-black text-white shadow-lg shadow-cyan-900/20">Demander un essai pilote</Link><Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-6 py-3 text-center text-sm font-black text-cyan-950">Voir le hub</Link></div></div>
      <div className="rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-xl shadow-cyan-950/10"><div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Lecture du hub</p><h2 className="mt-2 text-2xl font-black">De l’information terrain à la preuve de décision</h2><div className="mt-5 grid gap-3">{hubFlows.map(([label, text], index) => <div key={label} className="grid grid-cols-[2.35rem_1fr] gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-cyan-950">{index + 1}</span><span><span className="block text-sm font-black">{label}</span><span className="block text-xs font-semibold leading-5 text-white/75">{text}</span></span></div>)}</div></div></div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-3">{pillars.map(([title, text]) => <SectionCard key={title} title={title} description=""><p className="text-sm font-semibold leading-6 text-slate-600">{text}</p></SectionCard>)}</section>
  </main>;
}
