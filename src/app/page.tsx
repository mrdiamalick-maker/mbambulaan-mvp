import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Fish,
  Globe2,
  Handshake,
  Leaf,
  MessageSquareText,
  Radio,
  ShieldCheck,
  ShipWheel,
  Store
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";

const pillars = [
  ["Atlas", "Territoires, sites, quais et capacités", Globe2],
  ["Référentiels", "Acteurs, espèces, pirogues et infrastructures", ShieldCheck],
  ["Opérations", "Sorties, retours, débarquements et lots", ShipWheel],
  ["Capacités", "Glace, froid, transport et transformation", Building2],
  ["Coordination", "Besoins, engagements, actions et résultats", Handshake],
  ["Valorisation", "Qualité, pertes évitées et débouchés", Fish],
  ["Marchés", "Prix, disponibilité, rareté et opportunités", Store],
  ["Durabilité", "Provenance, pratiques et traçabilité", Leaf],
  ["Community", "Échanges professionnels transformables en action", MessageSquareText],
  ["Pilotage", "Situation, décisions et rapports vérifiables", Radio],
  ["Confiance", "Sources, mandats, historique et audit", CheckCircle2],
  ["Offres", "Droits fonctionnels et valeur par segment", CircleDollarSign]
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-[#062d36] text-white">
        <PublicHeader dark />
        <section className="relative mx-auto grid min-h-[76vh] max-w-[1500px] items-end overflow-hidden px-5 pb-14 pt-16 md:px-10 md:pb-20 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 border border-white/25 bg-white/8 px-3 py-2 text-xs font-bold uppercase tracking-[.08em]"><Anchor size={14} /> Pêche artisanale sénégalaise</p>
            <h1 className="title-balance text-5xl font-bold leading-[1.02] md:text-7xl">La filière reliée, du retour en mer à la décision.</h1>
            <p className="title-balance mt-6 max-w-3xl text-lg leading-8 text-[#c7dde1] md:text-xl">Mbàmbulaan rassemble connaissance, opérations, coordination, valorisation et durabilité dans une infrastructure numérique commune.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/demo" className="inline-flex items-center gap-2 bg-[#36c6b1] px-6 py-3.5 font-bold text-[#062d36]">Explorer la démonstration <ArrowRight size={18} /></Link><Link href="/atlas" className="border border-white/45 px-6 py-3.5 font-bold">Ouvrir l’Atlas public</Link></div>
          </div>
          <div className="relative mt-12 min-h-[420px] lg:mt-0">
            <div className="map-grid absolute inset-0 border border-white/15 opacity-85" />
            <div className="absolute inset-y-0 right-0 w-[48%] bg-[#eef0e8]/80 [clip-path:polygon(40%_0,100%_0,100%_100%,25%_100%,48%_78%,32%_62%,50%_43%,30%_24%)]" />
            {[
              [35, 17, "Saint-Louis", "stable"],
              [44, 36, "Kayar", "vigilance"],
              [40, 50, "Hann", "vigilance"],
              [47, 63, "Mbour", "vigilance"],
              [49, 73, "Joal", "critique"],
              [34, 90, "Kafountine", "stable"]
            ].map(([left, top, label, status]) => <div key={String(label)} className="absolute z-10" style={{ left: `${left}%`, top: `${top}%` }}><span className={`block size-4 rounded-full border-3 border-white ${status === "critique" ? "bg-[#c94f3d]" : status === "vigilance" ? "bg-[#d89614]" : "bg-[#18a394]"}`} /><span className="mt-1 block bg-[#062d36]/90 px-2 py-1 text-xs font-bold">{label}</span></div>)}
            <div className="absolute bottom-5 left-5 right-5 border border-white/20 bg-[#062d36]/90 p-4 backdrop-blur"><p className="text-xs font-bold uppercase text-[#36c6b1]">Situation active</p><p className="mt-1 font-bold">Machine à glace indisponible à Joal</p><p className="mt-2 text-xs leading-5 text-[#c7dde1]">Signal terrain → capacité alternative → engagement → résultat documenté.</p></div>
          </div>
        </section>
      </div>

      <section className="border-b border-[#d8e1e2] bg-[#f4f7f6]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {[["Comprendre", "Une vue fiable des territoires, actifs, produits et tensions."], ["Coordonner", "Des responsabilités, échéances et engagements explicites."], ["Démontrer", "Des résultats reliés à leurs sources, limites et bénéficiaires."]].map(([title, text]) => <div key={title} className="border-b border-[#d8e1e2] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 lg:p-9"><h2 className="text-xl font-bold text-[#062d36]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#60737a]">{text}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="max-w-3xl"><p className="label">Douze piliers, un même domaine</p><h2 className="title-balance mt-3 text-3xl font-bold leading-tight text-[#062d36] md:text-5xl">Une infrastructure commune, pas une collection d’applications.</h2><p className="mt-5 text-base leading-7 text-[#60737a]">Chaque pilier utilise les mêmes acteurs, territoires, sorties, lots, besoins, actions et résultats. Les droits changent selon le rôle et le plan ; la réalité métier ne se duplique pas.</p></div>
        <div className="mt-10 grid gap-px overflow-hidden border border-[#d8e1e2] bg-[#d8e1e2] sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(([title, text, Icon]) => <article key={title} className="bg-white p-5"><Icon size={20} className="text-[#087287]" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">{text}</p></article>)}
        </div>
      </section>

      <section className="bg-[#eef8f7] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div><p className="label">Parcours de référence</p><h2 className="mt-3 text-3xl font-bold text-[#062d36]">Une pirogue revient. Tout l’écosystème se met en mouvement.</h2><p className="mt-5 text-base leading-7 text-[#60737a]">Annonce de retour, capacité de glace, débarquement, pesée, lots, besoin transformateur, opportunité, engagement, transport, résultat et rapport : le scénario est jouable avec plusieurs rôles.</p><Link href="/demo" className="mt-6 inline-flex items-center gap-2 bg-[#075466] px-5 py-3 font-bold text-white">Lancer le parcours <ArrowRight size={17} /></Link></div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {["Retour annoncé", "Capacité recherchée", "Débarquement enregistré", "Lots créés", "Opportunité qualifiée", "Engagement suivi", "Résultat observable", "Rapport consolidé"].map((item, index) => <li key={item} className="flex items-center gap-3 border border-[#c8d7da] bg-white p-4 text-sm font-bold"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#075466] text-xs text-white">{index + 1}</span>{item}</li>)}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="label">Produit professionnel</p><h2 className="mt-3 text-3xl font-bold text-[#062d36]">La valeur est visible avant de parler de prix.</h2><p className="mt-4 max-w-3xl text-base leading-7 text-[#60737a]">Acteurs, organisations, territoires, institutions et partenaires accèdent à des capacités adaptées, des droits explicites et une raison concrète de renouveler.</p></div>
        <Link href="/offres" className="inline-flex items-center gap-2 border border-[#075466] px-5 py-3 font-bold text-[#075466]">Comparer les offres <ArrowRight size={17} /></Link>
      </section>
      <footer className="border-t border-[#d8e1e2] bg-[#062d36] px-5 py-8 text-sm text-[#b9d1d5] md:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Mbàmbulaan. Données de démonstration, non officielles.</p><p>Connaissance · Coordination · Valorisation · Durabilité</p></div></footer>
    </main>
  );
}
