import Link from "next/link";
import { ArrowRight, Bot, Check, FileSpreadsheet, LockKeyhole, MessageSquareMore, Orbit, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { createDemoState } from "@/data/demo-state";
import { PublicFooter } from "@/components/public/PublicFooter";

const premiumModules = [
  { icon: Orbit, title: "Atlas Premium", text: "Historique, comparaisons, filtres avancés, tensions, prix et lecture multi-territoires.", buyers: "Organisations, territoires, institutions" },
  { icon: FileSpreadsheet, title: "Rapports & redevabilité", text: "Exports Excel, dossiers PDF, rapports programmés, sources, limites et indicateurs de résultat.", buyers: "Institutions, programmes, bailleurs" },
  { icon: MessageSquareMore, title: "Coordination omnicanale", text: "SMS, téléphone, WhatsApp Business, e-mail et notifications convergent vers les mêmes objets métier.", buyers: "Territoires et organisations" },
  { icon: Bot, title: "Copilot gouverné", text: "Synthèses, rapprochements et contrôles de cohérence explicables, activés selon les droits.", buyers: "Équipes de pilotage" }
] as const;

export default function OffersPage() {
  const { plans } = createDemoState();
  const basePlans = plans.filter((plan) => !["Public", "Atlas Premium"].includes(plan.name));

  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 pb-16 pt-14 text-white md:px-10 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-[1500px]"><p className="label-inverse">Solutions, modules et droits</p><h1 className="mt-4 max-w-5xl text-4xl font-[760] leading-[1.02] tracking-[-.05em] md:text-6xl">Payer pour mieux coordonner.<br/><span className="text-[#74e1d6]">Renouveler parce que la valeur est mesurable.</span></h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/66">Mbàmbulaan ne vend pas des écrans. Chaque offre correspond à un mandat, un périmètre, des capacités opérationnelles et une preuve de valeur durable.</p><div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-3 py-2 text-xs font-bold text-white/70"><ShieldCheck size={15} className="text-[#74e1d6]"/> Tarification sur devis · périmètre et niveau de service contractualisés</div></div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]"><div><p className="label">Socle d’abonnement</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] md:text-4xl">Cinq offres lisibles, alignées sur ceux qui utilisent et ceux qui paient.</h2><p className="mt-5 text-sm leading-7 text-[#667b81]">L’accès public reste gratuit et agrégé. Les capacités avancées sont ouvertes par organisation, territoire ou programme.</p></div><div className="grid gap-4 md:grid-cols-2">{basePlans.map((plan, index) => <article key={plan.id} className={`surface flex flex-col overflow-hidden ${index === 3 ? "border-[#80bdb5] shadow-[0_18px_48px_rgba(5,54,64,.08)]" : ""}`}><div className={`${index === 3 ? "bg-[#052630] text-white" : "bg-white"} p-6`}><p className={index === 3 ? "label-inverse" : "label"}>{plan.target}</p><h3 className="mt-3 text-2xl font-[740] tracking-[-.035em]">{plan.name}</h3><p className={`mt-3 text-sm leading-6 ${index === 3 ? "text-white/58" : "text-[#60737a]"}`}>{plan.value}</p></div><div className="flex flex-1 flex-col border-t border-[#d8e1e2] p-6"><ul className="space-y-3 text-sm">{plan.capabilities.map((capability) => <li key={capability} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#18a394]" />{capability}</li>)}</ul><div className="mt-6 border-t border-[#d8e1e2] pt-4"><p className="flex items-start gap-2 text-xs leading-5 text-[#60737a]"><LockKeyhole size={14} className="mt-0.5 shrink-0" /> Limites : {plan.limits.join(" · ")}</p></div><Link href="/contact" className="btn-primary mt-6 justify-center">Cadrer cette offre <ArrowRight size={15} /></Link></div></article>)}</div></div>
      </section>

      <section className="border-y border-[#d9e3e3] bg-white px-5 py-16 md:px-10 md:py-20"><div className="mx-auto max-w-[1500px]"><div className="max-w-3xl"><p className="label">Modules Premium</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] md:text-4xl">Monter en gamme lorsqu’une capacité devient critique.</h2><p className="mt-4 text-sm leading-6 text-[#667b81]">Les modules s’ajoutent au socle sans créer une autre application ni dupliquer les données.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{premiumModules.map(({icon:Icon,title,text,buyers})=><article key={title} className="rounded-2xl border border-[#d9e3e3] bg-[#f8fbfa] p-5"><span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={20}/></span><h3 className="mt-7 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#667b81]">{text}</p><p className="mt-5 border-t border-[#e0e8e8] pt-4 text-[11px] font-bold text-[#08758a]">Pour : {buyers}</p></article>)}</div></div></section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10"><div className="grid gap-5 rounded-2xl border border-[#f0dcae] bg-[#fff8e8] p-6 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-bold text-[#5f4512]">Ce qui reste opéré par des partenaires habilités</p><p className="mt-2 max-w-4xl text-sm leading-6 text-[#786640]">Paiement, assurance, financement et certification ne sont pas opérés nativement par Mbàmbulaan. La plateforme qualifie les besoins, conditions, responsabilités, preuves et résultats pour sécuriser leur intervention.</p></div><Link href="/a-propos" className="btn-secondary shrink-0">Notre doctrine <ArrowRight size={15}/></Link></div></section>
      <PublicFooter />
    </main>
  );
}
