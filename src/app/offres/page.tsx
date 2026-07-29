import Link from "next/link";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { createDemoState } from "@/data/demo-state";

export default function OffersPage() {
  const { plans } = createDemoState();
  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <PublicHeader />
      <section className="bg-[#062d36] px-5 py-14 text-white md:px-10"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.08em] text-[#36c6b1]">Offres et droits</p><h1 className="mt-3 max-w-4xl text-4xl font-bold md:text-6xl">Chaque segment paie pour une capacité de coordination concrète.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#c7dde1]">Les montants restent sur devis. Les droits, limites, bénéficiaires et raisons de renouveler sont déjà explicites.</p></div></section>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => <article key={plan.id} className={`surface flex flex-col p-5 ${plan.name === "Institution" ? "border-t-4 border-t-[#18a394]" : ""}`}><p className="label">{plan.target}</p><h2 className="mt-2 text-2xl font-bold text-[#062d36]">{plan.name}</h2><p className="mt-3 text-sm leading-6 text-[#60737a]">{plan.value}</p><ul className="mt-5 space-y-2 text-sm">{plan.capabilities.map((capability) => <li key={capability} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#18a394]" />{capability}</li>)}</ul><div className="mt-5 border-t border-[#d8e1e2] pt-4"><p className="flex items-start gap-2 text-xs leading-5 text-[#60737a]"><LockKeyhole size={14} className="mt-0.5 shrink-0" /> Limites : {plan.limits.join(" · ")}</p></div><Link href="/contact" className="mt-6 inline-flex items-center justify-center gap-2 bg-[#075466] px-4 py-3 text-sm font-bold text-white">{plan.name === "Public" ? "Découvrir" : "Cadrer cette offre"} <ArrowRight size={15} /></Link></article>)}
        </div>
        <div className="mt-8 border-l-4 border-[#d89614] bg-[#fff8e8] p-5"><p className="font-bold">Ce qui reste partenaire</p><p className="mt-2 text-sm leading-6 text-[#60737a]">Paiement, assurance et financement ne sont pas opérés nativement par Mbàmbulaan. La plateforme prépare les besoins, responsabilités, conditions d’activation et résultats pour des partenaires habilités.</p></div>
      </section>
    </main>
  );
}
