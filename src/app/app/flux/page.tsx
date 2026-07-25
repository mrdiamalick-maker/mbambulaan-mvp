"use client";

import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Boxes,
  ClipboardCheck,
  Gauge,
  HandCoins,
  MapPinned,
  Scale,
  ShipWheel,
  ShoppingBasket,
  ThermometerSnowflake,
  UsersRound
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProduct } from "@/components/providers/ProductProvider";

const coreFlows = [
  {
    id: "peche-debarquement",
    title: "Pêche, retour et débarquement",
    description: "Relier la sortie en mer, le retour, le débarquement, la pesée, les disponibilités et les besoins immédiats du quai.",
    icon: ShipWheel,
    actors: ["Pêcheurs", "Gestionnaires de quai", "Mareyeurs", "Services publics"],
    value: "Rendre visibles les volumes, les arrivées et les besoins au bon moment pour réduire les pertes et les frictions.",
    href: "/app/territoires"
  },
  {
    id: "quais-continuite",
    title: "Quais, capacités et continuité opérationnelle",
    description: "Relier équipements, capacités, incidents, pesée, froid, pollution et services locaux dans un même flux opérationnel.",
    icon: Anchor,
    actors: ["Quais", "Collectivités", "Prestataires", "Coordinateurs"],
    value: "Donner aux acteurs une capacité de coordination qu'ils n'ont pas aujourd'hui pour maintenir l'activité et prioriser les interventions.",
    href: "/app/coordination"
  },
  {
    id: "prix-debouches",
    title: "Prix, disponibilité et débouchés",
    description: "Relier les disponibilités crédibles, les niveaux de prix, l'inflation, les besoins d'achat, les capacités de transformation et les marchés.",
    icon: ShoppingBasket,
    actors: ["Mareyeurs", "Transformateurs", "Acheteurs", "Organisations professionnelles"],
    value: "Aider les acteurs à mieux décider, sécuriser l'approvisionnement et valoriser les débarquements.",
    href: "/app/situations"
  }
] as const;

const enablingCapabilities = [
  { title: "Pesée et traçabilité", icon: Scale, detail: "Relier volumes, origine, acteur, quai et destination." },
  { title: "Froid et conservation", icon: ThermometerSnowflake, detail: "Voir les capacités, besoins, incidents et solutions disponibles." },
  { title: "Référentiel pirogues", icon: Boxes, detail: "Créer une identité opérationnelle fiable des unités et organisations." },
  { title: "Financements et programmes", icon: HandCoins, detail: "Relier besoins, initiatives, financement, exécution et résultats." },
  { title: "Monitoring territorial", icon: Gauge, detail: "Transformer les contributions terrain en décisions et actions coordonnées." },
  { title: "Réseau d'acteurs", icon: UsersRound, detail: "Rendre explicites les rôles, capacités, engagements et responsabilités." }
] as const;

export default function ValueFlowsPage() {
  const { state } = useProduct();
  if (!state) return null;

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure sectorielle"
        title="Les flux de valeur que Mbàmbulaan rend possibles"
        description="Mbàmbulaan ne juxtapose pas des modules. La plateforme relie des réalités métier aujourd'hui dispersées pour créer une capacité collective nouvelle et utile à chaque acteur."
        actions={<Link href="/demo" className="inline-flex items-center gap-2 border border-[#9ecbd2] px-4 py-2.5 text-sm font-bold text-[#075466]">Voir la démonstration <ArrowRight size={16} /></Link>}
      />

      <div className="space-y-8 p-5 lg:p-8">
        <section className="surface p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="label">Noyau de démonstration</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#062d36]">Trois flux reliés pour prouver la valeur du produit</h2>
              <p className="mt-3 text-sm leading-7 text-[#526970]">Le MVP doit montrer comment une information de pêche devient un débarquement visible, comment le quai organise ses capacités, puis comment les volumes trouvent un débouché dans de meilleures conditions. La valeur vient de la continuité entre ces étapes.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold text-[#075466]">
              <div className="border border-[#cfe1e4] px-3 py-4">Mer</div>
              <div className="border border-[#cfe1e4] px-3 py-4">Quai</div>
              <div className="border border-[#cfe1e4] px-3 py-4">Marché</div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {coreFlows.map((flow, index) => {
            const Icon = flow.icon;
            return (
              <article key={flow.id} className="surface flex h-full flex-col p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-11 place-items-center bg-[#e6f7f4] text-[#087c70]"><Icon size={22} /></span>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#91a5aa]">Flux {index + 1}</span>
                </div>
                <h2 className="mt-5 text-xl font-black text-[#062d36]">{flow.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#526970]">{flow.description}</p>

                <div className="mt-5 border-t border-[#dce6e7] pt-5">
                  <p className="label">Acteurs reliés</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {flow.actors.map((actor) => <span key={actor} className="bg-[#f2f7f7] px-2.5 py-1.5 text-xs font-bold text-[#49626a]">{actor}</span>)}
                  </div>
                </div>

                <div className="mt-5 flex-1 border-t border-[#dce6e7] pt-5">
                  <p className="label">Infrastructure créée</p>
                  <p className="mt-2 text-sm leading-7 text-[#40575f]">{flow.value}</p>
                </div>

                <Link href={flow.href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#075466]">Explorer ce flux <ArrowRight size={16} /></Link>
              </article>
            );
          })}
        </section>

        <section>
          <div className="mb-4">
            <p className="label">Capacités transverses</p>
            <h2 className="mt-1 text-xl font-bold text-[#062d36]">Ce que Mbàmbulaan mutualise pour tout l'écosystème</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {enablingCapabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.title} className="surface p-5">
                  <Icon className="text-[#087287]" />
                  <h3 className="mt-4 font-bold text-[#062d36]">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#60737a]">{capability.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="surface p-6">
            <div className="flex items-center gap-3"><MapPinned className="text-[#087287]" /><h2 className="text-lg font-bold text-[#062d36]">Une infrastructure territoriale, pas un écran national abstrait</h2></div>
            <p className="mt-4 text-sm leading-7 text-[#526970]">Chaque territoire, quai, organisation et acteur contribue selon ses responsabilités. Mbàmbulaan relie ensuite ces contributions pour améliorer la coordination locale, sectorielle et nationale.</p>
          </div>
          <div className="surface p-6">
            <div className="flex items-center gap-3"><ClipboardCheck className="text-[#18a394]" /><h2 className="text-lg font-bold text-[#062d36]">Critère de réussite du produit</h2></div>
            <p className="mt-4 text-sm leading-7 text-[#526970]">Un utilisateur doit comprendre ce qu'il peut accomplir, ce qu'il reçoit, ce qu'il apporte et pourquoi son organisation aurait intérêt à financer durablement cette capacité.</p>
          </div>
        </section>
      </div>
    </>
  );
}
