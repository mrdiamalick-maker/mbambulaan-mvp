import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Building2,
  CircleDollarSign,
  Fish,
  Gauge,
  Globe2,
  Handshake,
  Leaf,
  MapPinned,
  MessageSquareText,
  Radio,
  ShieldCheck,
  ShipWheel,
  Snowflake,
  Store,
  TrendingUp,
  Waves
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { createDemoState } from "@/data/demo-state";

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
  ["Confiance", "Sources, mandats, historique et audit", ShieldCheck],
  ["Offres", "Droits fonctionnels et valeur par segment", CircleDollarSign]
] as const;

const territories = [
  { name: "Joal-Fadiouth", status: "Critique", detail: "Machine à glace indisponible", left: 49, top: 73, tone: "bg-[#c94f3d]" },
  { name: "Mbour", status: "Vigilance", detail: "2,34 t débarquées · 2 lots disponibles", left: 47, top: 63, tone: "bg-[#d89614]" },
  { name: "Kayar", status: "Vigilance", detail: "Transport froid sous tension", left: 44, top: 36, tone: "bg-[#d89614]" },
  { name: "Saint-Louis", status: "Stable", detail: "Capacités disponibles", left: 35, top: 17, tone: "bg-[#18a394]" },
  { name: "Hann", status: "Vigilance", detail: "Prix en variation", left: 40, top: 50, tone: "bg-[#d89614]" },
  { name: "Kafountine", status: "Stable", detail: "Activité régulière", left: 34, top: 90, tone: "bg-[#18a394]" }
] as const;

export default function HomePage() {
  const state = createDemoState();
  const incomingTrips = state.trips.filter((trip) => trip.status === "en_mer").length;
  const activeSituations = state.situations.filter((situation) => !["resultat", "reglee"].includes(situation.status)).length;
  const criticalInfrastructure = state.infrastructures.filter((item) => item.status !== "operationnelle").length;
  const availableLotsKg = state.lots.reduce((sum, lot) => sum + lot.availableKg, 0);

  const liveMetrics = [
    [String(state.vessels.length), "Pirogues suivies", ShipWheel],
    [String(incomingTrips), "Retours attendus", Waves],
    [`${state.landings.length}`, "Débarquements suivis", Anchor],
    [`${Math.round(availableLotsKg / 100) / 10} t`, "Lots disponibles", Fish],
    [String(activeSituations), "Situations actives", Gauge],
    [String(criticalInfrastructure), "Capacités sous tension", Snowflake]
  ] as const;

  return (
    <main className="min-h-screen bg-white text-[#062d36]">
      <div className="overflow-hidden bg-[#062d36] text-white">
        <PublicHeader dark />

        <section className="relative mx-auto grid min-h-[82vh] max-w-[1500px] gap-10 px-5 pb-10 pt-12 md:px-10 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:pb-16 lg:pt-16">
          <div className="relative z-10 max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 border border-white/20 bg-white/8 px-3 py-2 text-xs font-bold uppercase tracking-[.08em]"><Anchor size={14} /> Infrastructure numérique de la filière halieutique</p>
            <h1 className="title-balance text-5xl font-bold leading-[.98] md:text-7xl">Voir la filière. Comprendre les tensions. Coordonner les réponses.</h1>
            <p className="title-balance mt-6 max-w-3xl text-lg leading-8 text-[#c7dde1] md:text-xl">Mbàmbulaan relie territoires, pirogues, débarquements, espèces, prix, infrastructures, acteurs et décisions dans une seule expérience vivante.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/demo" className="inline-flex items-center gap-2 bg-[#36c6b1] px-6 py-3.5 font-bold text-[#062d36]">Explorer la journée <ArrowRight size={18} /></Link>
              <Link href="/atlas" className="inline-flex items-center gap-2 border border-white/45 px-6 py-3.5 font-bold"><MapPinned size={18} /> Ouvrir l’Atlas</Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/10 sm:grid-cols-3">
              {liveMetrics.map(([value, label, Icon]) => (
                <div key={label} className="bg-[#0a3741] p-4">
                  <div className="flex items-center justify-between gap-3"><strong className="text-2xl">{value}</strong><Icon size={18} className="text-[#36c6b1]" /></div>
                  <p className="mt-2 text-xs leading-5 text-[#bdd5d9]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[540px] border border-white/15 bg-[#0b3a44] shadow-[0_35px_80px_rgba(0,0,0,.22)]">
            <div className="map-grid absolute inset-0 opacity-75" />
            <div className="absolute inset-y-0 right-0 w-[52%] bg-[#eef0e8]/90 [clip-path:polygon(43%_0,100%_0,100%_100%,23%_100%,43%_82%,31%_67%,50%_50%,31%_30%,48%_13%)]" />
            <div className="absolute left-5 top-5 z-20 border border-white/15 bg-[#062d36]/92 p-4 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#36c6b1]">Aujourd’hui · 29 juillet 2026</p>
              <p className="mt-2 text-lg font-bold">Situation nationale simulée</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-[#c7dde1]">Un même référentiel alimente Atlas, opérations, marchés et pilotage.</p>
            </div>

            {territories.map((territory) => (
              <div key={territory.name} className="group absolute z-10" style={{ left: `${territory.left}%`, top: `${territory.top}%` }}>
                <span className={`block size-4 rounded-full border-[3px] border-white shadow-lg ${territory.tone}`} />
                <span className="mt-1 block whitespace-nowrap bg-[#062d36]/94 px-2 py-1 text-[11px] font-bold">{territory.name}</span>
                <div className="pointer-events-none absolute left-5 top-0 z-30 hidden w-56 border border-white/15 bg-[#062d36] p-3 shadow-xl group-hover:block">
                  <p className="text-xs font-bold text-[#36c6b1]">{territory.status}</p>
                  <p className="mt-1 text-sm font-bold">{territory.detail}</p>
                </div>
              </div>
            ))}

            <div className="absolute bottom-5 left-5 right-5 z-20 grid gap-px border border-white/15 bg-white/10 sm:grid-cols-[1.1fr_.9fr]">
              <div className="bg-[#062d36]/94 p-5 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#36c6b1]">Signal prioritaire</p>
                <p className="mt-2 text-xl font-bold">Machine à glace indisponible à Joal</p>
                <p className="mt-2 text-sm leading-6 text-[#c7dde1]">Impact sur 12 t/jour de capacité théorique. Une capacité alternative doit être mobilisée avant le prochain débarquement.</p>
              </div>
              <div className="bg-[#0d4550] p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#8fe4d7]">Chaîne d’action</p>
                <ol className="mt-3 space-y-2 text-sm font-semibold">
                  <li>1. Signal terrain confirmé</li>
                  <li>2. Capacité alternative identifiée</li>
                  <li>3. Engagement à documenter</li>
                </ol>
                <Link href="/demo" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#8fe4d7]">Jouer le scénario <ArrowRight size={15} /></Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-b border-[#d8e1e2] bg-[#f4f7f6]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-4">
          {[
            ["Observer", "Atlas, retours, débarquements, prix et capacités."],
            ["Comprendre", "Sources, confiance, rareté, saisonnalité et impacts."],
            ["Coordonner", "Besoins, capacités, engagements, responsabilités."],
            ["Mesurer", "Volumes valorisés, résultats et bénéficiaires."]
          ].map(([title, text], index) => (
            <div key={title} className="border-b border-[#d8e1e2] p-6 md:border-b-0 md:border-r md:last:border-r-0 lg:p-8">
              <span className="text-xs font-black text-[#087287]">0{index + 1}</span>
              <h2 className="mt-2 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#60737a]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="label">La filière en un coup d’œil</p>
            <h2 className="title-balance mt-3 text-3xl font-bold leading-tight md:text-5xl">Pas un tableau de bord de plus. Une lecture commune de la réalité.</h2>
          </div>
          <p className="text-base leading-7 text-[#60737a]">Chaque donnée visible doit mener à une compréhension, puis à une décision ou une action. Les modules partagent le même état métier : une pirogue, un lot, une tension ou une infrastructure ne se dupliquent pas d’un écran à l’autre.</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="border border-[#cbd9db] bg-[#f8fbfa] p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-4"><div><p className="label">Marché du jour</p><h3 className="mt-2 text-2xl font-bold">Sardinelle ronde · Mbour</h3></div><TrendingUp className="text-[#087287]" /></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              {[["2,1 t", "Débarquées"], ["1,4 t", "Disponibles"], ["950 FCFA/kg", "Prix indicatif"], ["88 %", "Traçabilité"]].map(([value, label]) => <div key={label} className="border-t border-[#cbd9db] pt-4"><strong className="text-xl">{value}</strong><p className="mt-1 text-xs text-[#60737a]">{label}</p></div>)}
            </div>
          </article>
          <article className="border border-[#cbd9db] bg-[#062d36] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#36c6b1]">Décision à prendre</p>
            <h3 className="mt-3 text-2xl font-bold">Mobiliser une capacité froid avant 16 h</h3>
            <p className="mt-3 text-sm leading-6 text-[#c7dde1]">Une partie du volume disponible est à risque. Le moteur de coordination propose une capacité alternative et explique pourquoi.</p>
            <Link href="/app/coordination" className="mt-5 inline-flex items-center gap-2 bg-[#36c6b1] px-4 py-3 text-sm font-bold text-[#062d36]">Voir la coordination <ArrowRight size={16} /></Link>
          </article>
        </div>
      </section>

      <section className="bg-[#eef8f7] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="label">Douze piliers, un seul écosystème</p><h2 className="title-balance mt-3 text-3xl font-bold leading-tight md:text-5xl">Explorer, comprendre, agir.</h2><p className="mt-5 text-base leading-7 text-[#60737a]">Les piliers ne sont pas des destinations isolées. Ils se répondent autour des mêmes acteurs, territoires, sorties, lots, capacités, opportunités et résultats.</p></div>
          <div className="mt-10 grid gap-px overflow-hidden border border-[#d8e1e2] bg-[#d8e1e2] sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map(([title, text, Icon]) => <article key={title} className="group bg-white p-5 transition hover:-translate-y-0.5 hover:bg-[#f8fbfa]"><Icon size={20} className="text-[#087287]" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#60737a]">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[.85fr_1.15fr]">
        <div><p className="label">Parcours de référence</p><h2 className="mt-3 text-3xl font-bold">Une pirogue revient. Tout l’écosystème se met en mouvement.</h2><p className="mt-5 text-base leading-7 text-[#60737a]">Annonce de retour, capacité de glace, débarquement, pesée, lots, besoin transformateur, opportunité, engagement, transport, résultat et rapport : le scénario est jouable avec plusieurs rôles.</p><Link href="/demo" className="mt-6 inline-flex items-center gap-2 bg-[#075466] px-5 py-3 font-bold text-white">Lancer le parcours <ArrowRight size={17} /></Link></div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {["Retour annoncé", "Capacité recherchée", "Débarquement enregistré", "Lots créés", "Opportunité qualifiée", "Engagement suivi", "Résultat observable", "Rapport consolidé"].map((item, index) => <li key={item} className="flex items-center gap-3 border border-[#c8d7da] bg-white p-4 text-sm font-bold"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#075466] text-xs text-white">{index + 1}</span>{item}</li>)}
        </ol>
      </section>

      <section className="border-y border-[#d8e1e2] bg-[#062d36] px-5 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#36c6b1]">Produit professionnel</p><h2 className="mt-3 text-3xl font-bold md:text-5xl">La valeur payante apparaît dans la profondeur.</h2><p className="mt-4 max-w-3xl text-base leading-7 text-[#c7dde1]">Atlas enrichi, pilotage territorial, coordination, capacités, traçabilité, rapports et droits adaptés aux acteurs, organisations, territoires et institutions.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/offres" className="inline-flex items-center gap-2 bg-white px-5 py-3 font-bold text-[#075466]">Comparer les offres <ArrowRight size={17} /></Link><Link href="/connexion" className="inline-flex items-center gap-2 border border-white/35 px-5 py-3 font-bold">Entrer dans l’application</Link></div>
        </div>
      </section>

      <footer className="bg-[#041f26] px-5 py-8 text-sm text-[#b9d1d5] md:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Mbàmbulaan. Données de démonstration, non officielles.</p><p>Connaissance · Coordination · Valorisation · Durabilité</p></div></footer>
    </main>
  );
}
