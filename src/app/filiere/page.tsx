import Link from "next/link";
import { Anchor, ArrowRight, Factory, Fish, Handshake, Scale, ShipWheel, Store, Truck, UsersRound } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { createDemoState } from "@/data/demo-state";

const chain = [
  [ShipWheel, "Préparer et sortir", "Pirogue, équipage, zone déclarée, heure de retour attendue."],
  [Anchor, "Débarquer", "Arrivée, quai, espèces, qualité, pesée et preuve."],
  [Scale, "Constituer les lots", "Quantité disponible, conservation, traçabilité et statut."],
  [Truck, "Orienter", "Besoin, capacité froide, transport, transformation ou marché."],
  [Store, "Valoriser", "Engagement, exécution, résultat économique et apprentissage."]
] as const;

export default function FilierePage() {
  const state = createDemoState();
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 pb-16 pt-14 text-white md:px-10 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-[1500px]">
          <p className="label-inverse">Comprendre la filière</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-[760] leading-[1.02] tracking-[-.05em] md:text-6xl">La pêche artisanale forme un système. Mbàmbulaan relie ses décisions.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/66">Le produit part des réalités du quai : acteurs nombreux, information fragmentée, temps court, infrastructures contraintes et valeur rapidement périssable.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [state.territories.length, "territoires côtiers simulés", "Un même référentiel territorial"],
            [state.sites.filter((item) => item.type === "quai").length, "quais représentés", "Points d’ancrage opérationnels"],
            [state.actors.length, "profils d’acteurs", "Mandats et droits distincts"],
            [state.infrastructures.length, "capacités suivies", "Froid, pesée et transport"]
          ].map(([value, label, detail]) => <div key={String(label)} className="surface p-5"><p className="text-3xl font-black tracking-[-.04em] text-[#075568]">{value}</p><p className="mt-2 text-sm font-bold">{label}</p><p className="mt-1 text-xs text-[#718489]">{detail}</p></div>)}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-24"><p className="label">La chaîne de valeur</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em] md:text-4xl">Un seul parcours, plusieurs métiers.</h2><p className="mt-5 text-sm leading-7 text-[#667b81]">Chaque étape produit une information utile à la suivante. Le rôle de Mbàmbulaan est de maintenir ce lien, pas de remplacer les professionnels.</p></div>
          <div className="space-y-3">
            {chain.map(([Icon, title, text], index) => <article key={title} className="surface grid gap-4 p-5 sm:grid-cols-[48px_1fr_auto] sm:items-center"><span className="grid size-12 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={21} /></span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[#667b81]">{text}</p></div><span className="text-xs font-black text-[#a3b3b6]">0{index + 1}</span></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#052630] px-5 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-[1500px]">
          <p className="label-inverse">Les ruptures que le produit traite</p>
          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              [UsersRound, "Acteurs fragmentés", "Qui peut agir, selon quel mandat et sur quel territoire ?"],
              [Fish, "Information périssable", "Un retour, un volume ou un prix perd vite sa valeur s’il n’est pas contextualisé."],
              [Factory, "Capacités contraintes", "Une chambre froide disponible n’est utile que si ses conditions sont connues."],
              [Handshake, "Responsabilité diffuse", "Une coordination doit nommer qui fait quoi, avant quand et avec quelle preuve."]
            ].map(([Icon, title, text]) => { const ItemIcon = Icon as typeof UsersRound; return <article key={String(title)} className="rounded-2xl border border-white/10 bg-white/5 p-5"><ItemIcon size={21} className="text-[#74e1d6]"/><h3 className="mt-6 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-white/55">{String(text)}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1500px] flex-col gap-7 px-5 py-16 md:px-10 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl"><p className="label">Voir le système en action</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em]">Du retour de pirogue au rapport de décision.</h2><p className="mt-4 text-sm leading-6 text-[#667b81]">Explorez six scénarios reliés aux mêmes objets métier et aux mêmes règles de confiance.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/demo" className="btn-primary">Lancer la démonstration <ArrowRight size={16}/></Link><Link href="/atlas" className="btn-secondary">Explorer les territoires</Link></div>
      </section>
      <PublicFooter />
    </main>
  );
}

