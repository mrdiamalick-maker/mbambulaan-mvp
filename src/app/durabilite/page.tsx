import Link from "next/link";
import { ArrowRight, CheckCircle2, Fish, Leaf, Link2, ShieldCheck, Waves } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { createDemoState } from "@/data/demo-state";

export default function PublicSustainabilityPage() {
  const state = createDemoState();
  const favorable = state.sustainability.filter((item) => item.status === "favorable").length;
  const averageTraceability = Math.round(state.lots.reduce((sum, item) => sum + item.traceabilityCompleteness, 0) / Math.max(state.lots.length, 1));
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 pb-16 pt-14 text-white md:px-10 md:pb-20 md:pt-20"><div className="mx-auto max-w-[1500px]"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#74e1d6]"><Leaf size={17}/> Durabilité, provenance et confiance</div><h1 className="mt-5 max-w-5xl text-4xl font-[760] leading-[1.01] tracking-[-.055em] md:text-7xl">Améliorer les pratiques.<br/><span className="text-[#74e1d6]">Ne jamais masquer les lacunes.</span></h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/66">Mbàmbulaan relie sortie, zone, espèce, lot, conservation et destination. La plateforme soutient une démarche de progrès sans se substituer au contrôle réglementaire.</p></div></section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
          [averageTraceability + "%", "complétude moyenne", "Lots du jeu de démonstration"],
          [state.sustainability.length, "évaluations reliées", "Provenance et pratique contextualisées"],
          [favorable, "lectures favorables", "Aucune certification automatique"],
          [state.scarcity.length, "indicateurs de disponibilité", "Raisons et confiance visibles"]
        ].map(([value,label,detail])=><div key={String(label)} className="surface p-5"><p className="text-3xl font-[760] tracking-[-.04em] text-[#075568]">{value}</p><p className="mt-2 text-sm font-bold">{label}</p><p className="mt-1 text-xs leading-5 text-[#718489]">{detail}</p></div>)}</div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="label">Une traçabilité progressive</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] md:text-4xl">Chaque lien compte. Chaque absence reste visible.</h2><p className="mt-5 text-sm leading-7 text-[#667b81]">Le produit préfère une donnée déclarée et honnêtement qualifiée à une fausse certitude. Le niveau de confiance progresse avec les confirmations disponibles.</p></div><div className="grid gap-3 sm:grid-cols-2">{[
          [Link2,"Provenance","Sortie, pirogue, zone, espèce et débarquement utilisent la même trace."],
          [ShieldCheck,"Complétude","Les champs manquants, la source et le statut de vérification sont explicites."],
          [Fish,"Ressource","Saisonnalité, disponibilité, besoin et pression sont contextualisés par territoire."],
          [CheckCircle2,"Amélioration","Toute vigilance propose un prochain geste sans créer de décision automatique."]
        ].map(([Icon,title,text])=>{const ItemIcon=Icon as typeof Link2;return <article key={String(title)} className="rounded-2xl border border-[#d9e3e3] bg-white p-5"><ItemIcon size={20} className="text-[#08758a]"/><h3 className="mt-6 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">{String(text)}</p></article>})}</div></div>
      </section>

      <section className="bg-[#052630] px-5 py-16 text-white md:px-10 md:py-20"><div className="mx-auto max-w-[1500px]"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><Waves className="text-[#74e1d6]"/><p className="label-inverse mt-5">Du fait à la preuve</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em]">Une chaîne lisible de bout en bout.</h2></div><div className="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-5">{["Sortie déclarée","Retour confirmé","Pesée reliée","Lot qualifié","Destination documentée"].map((step,index)=><div key={step} className="bg-white/[.04] p-5"><span className="text-xs font-black text-[#74e1d6]">0{index+1}</span><p className="mt-8 text-sm font-bold">{step}</p></div>)}</div></div></div></section>

      <section className="mx-auto flex max-w-[1500px] flex-col gap-7 px-5 py-16 md:px-10 md:py-20 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-3xl"><p className="label">Démonstration</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em]">Revenir d’un indicateur jusqu’à sa source.</h2><p className="mt-4 text-sm leading-6 text-[#667b81]">Ouvrez un lot, sa pirogue, son débarquement, son niveau de complétude et la recommandation associée.</p></div><div className="flex flex-wrap gap-3"><Link href="/demo" className="btn-primary">Voir les scénarios <ArrowRight size={16}/></Link><Link href="/contact" className="btn-secondary">Cadrer un pilote</Link></div></section>
      <PublicFooter />
    </main>
  );
}
