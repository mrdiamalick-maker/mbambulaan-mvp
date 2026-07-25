import Link from "next/link";
import { ArrowRight, CircleCheck, Factory, Handshake, Lightbulb, MapPinned, RotateCcw, Target } from "lucide-react";

const steps = [
  { number: "01", title: "Observer", detail: "Le poste de quai de Joal signale l’arrêt de la machine à glace.", href: "/app/situations/sit-glace", icon: Factory },
  { number: "02", title: "Qualifier", detail: "Le signal est recoupé avec le relais local et devient une situation vérifiée.", href: "/app/situations/sit-glace", icon: CircleCheck },
  { number: "03", title: "Prioriser", detail: "Le risque de perte place la continuité du froid parmi les actions urgentes.", href: "/app/travail", icon: Target },
  { number: "04", title: "Coordonner", detail: "Service technique, poste de quai et coordination nationale partagent les engagements.", href: "/app/coordination", icon: Handshake },
  { number: "05", title: "Agir", detail: "L’intervention est suivie, un blocage peut être documenté puis levé.", href: "/app/situations/sit-glace", icon: RotateCcw },
  { number: "06", title: "Transformer", detail: "Le besoin récurrent alimente un programme territorial de résilience du froid.", href: "/app/initiatives", icon: MapPinned },
  { number: "07", title: "Mesurer et apprendre", detail: "Le résultat confirmé nourrit la synthèse et une pratique réutilisable.", href: "/app/resultats", icon: Lightbulb }
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <header className="flex items-center justify-between border-b border-[#d8e1e2] bg-white px-5 py-4 md:px-10"><Link href="/" className="font-bold text-[#062d36]">Mbàmbulaan</Link><span className="border border-[#b9dfe4] bg-[#eaf8fa] px-3 py-1.5 text-xs font-bold text-[#075466]">Tenant de démonstration isolé</span></header>
      <section className="bg-[#062d36] px-5 py-14 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[.08em] text-[#36c6b1]">Parcours unique · 8 à 10 minutes</p><h1 className="title-balance mt-3 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">Du signal terrain à une transformation territoriale mesurable.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#c7dde1]">Cette démonstration utilise le produit réel sur un jeu de données déterministe. Changez de rôle dans l’application pour voir les mêmes objets depuis chaque responsabilité.</p><Link href="/app/travail" className="mt-8 inline-flex items-center gap-2 bg-[#36c6b1] px-6 py-3.5 font-bold text-[#062d36]">Commencer par le briefing <ArrowRight size={18} /></Link></div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        <div className="mb-7"><p className="label">Fil conducteur</p><h2 className="mt-2 text-2xl font-bold text-[#062d36]">Machine à glace indisponible à Joal</h2></div>
        <ol className="grid gap-px overflow-hidden border border-[#d8e1e2] bg-[#d8e1e2] md:grid-cols-2">
          {steps.map(({ number, title, detail, href, icon: Icon }) => <li key={number} className="bg-white p-5 md:p-6"><div className="flex items-start gap-4"><span className="text-sm font-black text-[#18a394]">{number}</span><div className="min-w-0"><Icon size={20} className="text-[#087287]" /><h3 className="mt-3 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">{detail}</p><Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#075466]">Voir dans le produit <ArrowRight size={15} /></Link></div></div></li>)}
        </ol>
        <div className="mt-8 border-l-4 border-[#d89614] bg-[#fff8e8] p-5"><p className="font-bold">Repère de crédibilité</p><p className="mt-2 text-sm leading-6 text-[#60737a]">Toutes les valeurs sont simulées. Le niveau Déclarée, Vérifiée ou Consolidée indique le traitement interne de l’information, jamais une validation officielle externe.</p></div>
      </section>
    </main>
  );
}
