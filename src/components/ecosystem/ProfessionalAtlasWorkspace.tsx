"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Factory,
  Fish,
  Gauge,
  Layers3,
  Leaf,
  MapPin,
  Radio,
  Route,
  Scale,
  Search,
  ShipWheel,
  Sparkles,
  Store,
  UsersRound,
  Waves
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/ui/Badges";
import type { ProductState, TrustLevel } from "@/domain/types";

type Lens = "situation" | "operations" | "capacites" | "marches" | "durabilite";

const lenses: Array<{ id: Lens; label: string; icon: typeof Activity }> = [
  { id: "situation", label: "Situation", icon: Activity },
  { id: "operations", label: "Opérations", icon: ShipWheel },
  { id: "capacites", label: "Capacités", icon: Factory },
  { id: "marches", label: "Marchés", icon: Store },
  { id: "durabilite", label: "Durabilité", icon: Leaf }
];

const positions: Record<string, [number, number]> = {
  "saint-louis": [43, 13],
  kayar: [38, 31],
  hann: [48, 43],
  mbour: [42, 57],
  joal: [49, 69],
  kafountine: [34, 87]
};

const activityStyle = {
  critique: { dot: "bg-[#ff755e]", ring: "ring-[#ff755e]/30", label: "Action requise" },
  vigilance: { dot: "bg-[#f3b84f]", ring: "ring-[#f3b84f]/30", label: "Sous vigilance" },
  stable: { dot: "bg-[#57dbc8]", ring: "ring-[#57dbc8]/30", label: "Stable" }
} as const;

type WorkbenchItem = {
  id: string;
  category: string;
  title: string;
  metric: string;
  detail: string;
  source: string;
  trust: TrustLevel;
  href?: string;
  urgency?: "normal" | "attention" | "critique";
};

function formatDate(value?: string) {
  if (!value) return "Non horodaté";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function buildWorkbench(state: ProductState, territoryId: string, lens: Lens, speciesId: string): WorkbenchItem[] {
  const quayId = `quai-${territoryId}`;
  if (lens === "situation") {
    return state.situations.filter((item) => item.territoryId === territoryId).map((item) => ({
      id: item.id,
      category: item.status.replaceAll("_", " "),
      title: item.title,
      metric: item.priority === "critique" ? "Aujourd’hui" : item.priority === "haute" ? "À coordonner" : "Suivi",
      detail: item.nextStep,
      source: state.observations.find((observation) => item.observationIds.includes(observation.id))?.source ?? "Signal territorial",
      trust: item.trust,
      href: `/app/situations/${item.id}`,
      urgency: item.priority === "critique" ? "critique" : item.priority === "haute" ? "attention" : "normal"
    }));
  }

  if (lens === "operations") {
    return state.vessels.filter((vessel) => vessel.homeSiteId === quayId).map((vessel) => {
      const trip = state.trips.find((candidate) => candidate.vesselId === vessel.id);
      const landing = trip ? state.landings.find((candidate) => candidate.tripId === trip.id) : undefined;
      return {
        id: vessel.id,
        category: "Pirogue artisanale",
        title: `${vessel.name} · ${vessel.registration}`,
        metric: trip?.status.replaceAll("_", " ") ?? "À quai",
        detail: landing ? `${(landing.totalWeightKg / 1000).toFixed(2)} t · ${landing.status.replaceAll("_", " ")}` : `${trip?.crewCount ?? 0} membres d’équipage · ${trip?.zone ?? "zone non renseignée"}`,
        source: trip?.source ?? "Référentiel des actifs",
        trust: vessel.trust,
        href: "/app/operations",
        urgency: trip?.status === "en_mer" ? "attention" : "normal"
      };
    });
  }

  if (lens === "capacites") {
    return state.infrastructures.filter((item) => item.territoryId === territoryId).map((item) => ({
      id: item.id,
      category: item.type.replaceAll("_", " "),
      title: item.name,
      metric: `${item.availableCapacity}/${item.theoreticalCapacity} ${item.unit}`,
      detail: item.status === "operationnelle" ? "Capacité mobilisable sur le périmètre" : item.status === "fragile" ? "Continuité à sécuriser" : "Alternative requise",
      source: `Dernière déclaration · ${formatDate(item.updatedAt)}`,
      trust: item.trust,
      href: "/app/coordination",
      urgency: item.status === "indisponible" ? "critique" : item.status === "fragile" ? "attention" : "normal"
    }));
  }

  if (lens === "marches") {
    return state.priceObservations
      .filter((item) => item.territoryId === territoryId && (speciesId === "all" || item.speciesId === speciesId))
      .map((item) => ({
        id: item.id,
        category: item.marketName,
        title: state.species.find((species) => species.id === item.speciesId)?.name ?? item.speciesId,
        metric: `${item.priceFcfaKg.toLocaleString("fr-FR")} FCFA/kg`,
        detail: `Tendance ${item.trend}${item.flagged ? " · observation à vérifier" : " · aucune anomalie déclarée"}`,
        source: item.source,
        trust: item.trust,
        href: "/app/marches",
        urgency: item.flagged ? "attention" : "normal"
      }));
  }

  return state.sustainability
    .filter((assessment) => {
      const lot = state.lots.find((candidate) => candidate.id === assessment.lotId);
      return lot?.siteId === quayId && (speciesId === "all" || lot.speciesId === speciesId);
    })
    .map((assessment) => {
      const lot = state.lots.find((candidate) => candidate.id === assessment.lotId);
      const species = state.species.find((candidate) => candidate.id === lot?.speciesId);
      return {
        id: assessment.id,
        category: `Lot ${assessment.lotId}`,
        title: species?.name ?? "Lot suivi",
        metric: assessment.status,
        detail: assessment.recommendation,
        source: `${assessment.practice} · ${assessment.zone}`,
        trust: assessment.trust,
        href: "/app/durabilite",
        urgency: assessment.status === "incomplet" ? "critique" : assessment.status === "vigilance" ? "attention" : "normal"
      };
    });
}

export function ProfessionalAtlasWorkspace() {
  const { state } = useProduct();
  const [selectedId, setSelectedId] = useState("joal");
  const [lens, setLens] = useState<Lens>("situation");
  const [period, setPeriod] = useState("today");
  const [speciesId, setSpeciesId] = useState("all");
  const [search, setSearch] = useState("");
  const [assistantEnabled, setAssistantEnabled] = useState(false);
  if (!state) return null;

  const territory = state.territories.find((item) => item.id === selectedId) ?? state.territories[0];
  const quayId = `quai-${territory.id}`;
  const site = state.sites.find((item) => item.id === quayId);
  const situations = state.situations.filter((item) => item.territoryId === territory.id && item.status !== "reglee");
  const primarySituation = [...situations].sort((a, b) => (a.priority === "critique" ? -1 : b.priority === "critique" ? 1 : 0))[0];
  const vessels = state.vessels.filter((item) => item.homeSiteId === quayId);
  const trips = state.trips.filter((item) => vessels.some((vessel) => vessel.id === item.vesselId));
  const landings = state.landings.filter((item) => item.siteId === quayId);
  const landedKg = landings.reduce((sum, item) => sum + item.totalWeightKg, 0);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const availableCapacity = infrastructures.reduce((sum, item) => sum + item.availableCapacity, 0);
  const totalCapacity = infrastructures.reduce((sum, item) => sum + item.theoreticalCapacity, 0);
  const capacityRate = totalCapacity ? Math.round((availableCapacity / totalCapacity) * 100) : 0;
  const catchLines = landings.flatMap((item) => item.catches).filter((item) => speciesId === "all" || item.speciesId === speciesId);
  const speciesCount = new Set(catchLines.map((item) => item.speciesId)).size;
  const activeActors = state.actors.filter((actor) => actor.territoryIds.includes(territory.id) && actor.verified).length;

  const workbench = buildWorkbench(state, territory.id, lens, speciesId)
    .filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase()));
  const selectedLens = lenses.find((item) => item.id === lens) ?? lenses[0];
  const LensIcon = selectedLens.icon;

  return (
    <div className="space-y-6">
      <section className="ops-command-deck overflow-hidden">
        <div className="border-b border-white/10 px-4 py-4 lg:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#58d6c7]/25 bg-[#58d6c7]/10 text-[#70e3d5]"><Waves size={19} /></span>
              <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#70e3d5]">Atlas professionnel · poste d’observation</p><p className="mt-1 truncate text-sm font-bold text-white/84">Littoral sénégalais · lecture opérationnelle multi-source</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="ops-live-chip"><span className="size-1.5 rounded-full bg-[#58d6c7] shadow-[0_0_0_4px_rgba(88,214,199,.12)]" /> Jeu de démonstration actif</span>
              <button onClick={() => setAssistantEnabled((value) => !value)} className={`ops-live-chip transition ${assistantEnabled ? "border-[#70e3d5]/45 bg-[#70e3d5]/12 text-white" : ""}`} aria-pressed={assistantEnabled}>
                <Sparkles size={13} /> Assistance {assistantEnabled ? "activée" : "désactivée"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1fr)_minmax(330px,.36fr)]">
          <div className="relative min-h-[650px] overflow-hidden bg-[#041d27]">
            <div className="absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-[#041d27]/88 p-3 backdrop-blur-xl">
              <div className="grid gap-2 md:grid-cols-[minmax(210px,1.25fr)_minmax(150px,.7fr)_minmax(180px,.8fr)]">
                <label className="ops-filter">
                  <MapPin size={15} /><span className="sr-only">Territoire</span>
                  <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} aria-label="Sélectionner un quai">
                    {state.territories.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.region}</option>)}
                  </select><ChevronDown size={14} />
                </label>
                <label className="ops-filter">
                  <CalendarDays size={15} /><span className="sr-only">Période</span>
                  <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Sélectionner une période">
                    <option value="today">Aujourd’hui</option><option value="7d">7 jours</option><option value="30d">30 jours</option>
                  </select><ChevronDown size={14} />
                </label>
                <label className="ops-filter">
                  <Fish size={15} /><span className="sr-only">Espèce</span>
                  <select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} aria-label="Filtrer par espèce">
                    <option value="all">Toutes les espèces</option>{state.species.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select><ChevronDown size={14} />
                </label>
              </div>
            </div>

            <div className="ops-map-canvas absolute inset-0 pt-20">
              <div className="ops-landmass" />
              <div className="absolute bottom-5 left-5 z-20 text-[10px] font-black uppercase tracking-[.2em] text-white/25">Océan Atlantique</div>
              <div className="absolute left-5 top-24 z-20 rounded-lg border border-white/10 bg-[#041d27]/78 px-3 py-2 text-[10px] font-bold text-white/48 backdrop-blur">Quais uniquement · les objets métier s’ouvrent dans le poste de travail</div>
              {state.territories.map((item) => {
                const [left, top] = positions[item.id] ?? [50, 50];
                const active = item.id === territory.id;
                const openCount = state.situations.filter((candidate) => candidate.territoryId === item.id && candidate.status !== "reglee").length;
                const tone = activityStyle[item.activity];
                return (
                  <button key={item.id} onClick={() => setSelectedId(item.id)} style={{ left: `${left}%`, top: `${top}%` }} className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left ${active ? "scale-110" : "hover:scale-105"}`} aria-label={`Ouvrir le quai de ${item.name}`}>
                    <span className={`absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full ring-8 ${tone.ring} ${active ? "animate-pulse" : ""}`} />
                    <span className={`relative block size-3.5 rounded-full border-2 border-white ${tone.dot} shadow-[0_0_18px_rgba(255,255,255,.28)]`} />
                    <span className={`absolute left-5 top-1/2 w-max -translate-y-1/2 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold shadow-xl backdrop-blur ${active ? "border-[#70e3d5]/40 bg-[#0b3b46] text-white" : "border-white/10 bg-[#041d27]/80 text-white/72"}`}>
                      {item.name}{openCount > 0 && <span className="ml-2 text-[#f3b84f]">{openCount}</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="absolute bottom-5 right-5 z-30 hidden w-72 rounded-xl border border-white/10 bg-[#041d27]/84 p-4 text-white shadow-2xl backdrop-blur-xl md:block">
              <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.13em] text-white/40">Lecture sélectionnée</p><span className={`size-2 rounded-full ${activityStyle[territory.activity].dot}`} /></div>
              <p className="mt-2 text-lg font-black">{territory.name}</p>
              <p className="mt-1 text-xs text-white/50">{activityStyle[territory.activity].label} · {situations.length} situation{situations.length > 1 ? "s" : ""} ouverte{situations.length > 1 ? "s" : ""}</p>
            </div>
          </div>

          <aside className="bg-[#082a34] p-5 text-white lg:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#70e3d5]">Dossier territorial</p><h2 className="mt-2 text-2xl font-black tracking-[-.035em]">Quai de {territory.name}</h2><p className="mt-1 text-xs text-white/45">{site?.source ?? "Référentiel territorial"} · {territory.region}</p></div>
              <span className={`mt-1 size-2.5 rounded-full ${activityStyle[territory.activity].dot}`} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
              {[
                ["Volume", `${(landedKg / 1000).toFixed(2)} t`],
                ["Pirogues", String(vessels.length)],
                ["Espèces", String(speciesCount)],
                ["Capacité", `${capacityRate}%`]
              ].map(([label, value]) => <div key={label} className="bg-[#0b3540] p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] text-white/35">{label}</p><p className="mt-1.5 text-2xl font-black tracking-[-.04em]">{value}</p></div>)}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/38">Activité opérationnelle</p><span className="text-[10px] font-bold text-[#70e3d5]">{period === "today" ? "Aujourd’hui" : period === "7d" ? "7 jours" : "30 jours"}</span></div>
              <div className="mt-3 space-y-2">
                <div className="ops-context-row"><Route size={16} /><div><strong>{trips.filter((item) => item.status !== "debarquee").length} sortie(s) active(s)</strong><span>{trips.length} cycle(s) relié(s) au quai</span></div></div>
                <div className="ops-context-row"><Scale size={16} /><div><strong>{landings.length} débarquement(s)</strong><span>Pesée et lots reliés aux opérations</span></div></div>
                <div className="ops-context-row"><UsersRound size={16} /><div><strong>{activeActors} acteur(s) habilité(s)</strong><span>Sur le périmètre de démonstration</span></div></div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-[#f3b84f]"><CircleAlert size={16} /><p className="text-[10px] font-black uppercase tracking-[.12em]">Prochain geste</p></div>
              <p className="mt-3 text-sm font-bold leading-6">{primarySituation?.nextStep ?? "Maintenir la veille et la qualité des données du quai."}</p>
              <p className="mt-2 text-xs leading-5 text-white/45">{primarySituation ? `${primarySituation.reference} · ${primarySituation.title}` : "Aucune situation prioritaire ouverte"}</p>
              {primarySituation ? <Link href={`/app/situations/${primarySituation.id}`} className="btn-accent mt-4 w-full">Ouvrir la situation <ArrowRight size={15} /></Link> : <Link href="/app/operations" className="btn-on-dark mt-4 w-full">Voir les opérations <ArrowRight size={15} /></Link>}
            </div>
          </aside>
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-4">
          {[
            [Radio, "Signal", `${situations.length} ouvert(s)`, "Sources et confiance"],
            [Boxes, "Qualification", primarySituation?.status.replaceAll("_", " ") ?? "Veille", "Responsabilité connue"],
            [Gauge, "Décision", primarySituation ? "Action attendue" : "Aucune urgence", "Prochain geste explicite"],
            [CheckCircle2, "Résultat", String(state.situations.filter((item) => item.territoryId === territory.id && item.status === "reglee").length), "Boucles clôturées"]
          ].map(([Icon, label, value, detail]) => {
            const StepIcon = Icon as typeof Radio;
            return <div key={String(label)} className="bg-[#061f29] p-4 text-white"><div className="flex items-center gap-2 text-[#70e3d5]"><StepIcon size={15} /><p className="text-[9px] font-black uppercase tracking-[.13em]">{String(label)}</p></div><p className="mt-2 text-sm font-black capitalize">{String(value)}</p><p className="mt-1 text-[10px] text-white/38">{String(detail)}</p></div>;
          })}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-[#d9e3e3] bg-white p-4 lg:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div><div className="flex items-center gap-2 text-[#08758a]"><LensIcon size={17} /><p className="label">Poste de travail · {selectedLens.label}</p></div><h2 className="mt-2 text-xl font-black tracking-[-.03em] text-[#102e37]">Objets reliés au quai de {territory.name}</h2></div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Changer de lecture professionnelle">
              {lenses.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setLens(id)} className={`ops-lens ${lens === id ? "ops-lens-active" : ""}`}><Icon size={15} /> {label}</button>)}
            </div>
          </div>
          <label className="relative mt-4 block max-w-md">
            <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[#71858a]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtrer les objets de cette lecture…" className="h-10 w-full rounded-xl border border-[#d0ddde] bg-[#f8fbfa] pl-9 pr-3 text-sm font-semibold text-[#102e37]" />
          </label>
        </div>

        {workbench.length > 0 ? <div className="divide-y divide-[#e1e9e9]">{workbench.map((item) => (
          <article key={item.id} className="group grid gap-4 p-4 transition hover:bg-[#f8fbfa] md:grid-cols-[minmax(0,1.1fr)_minmax(140px,.45fr)_minmax(0,1fr)_auto] md:items-center md:px-5">
            <div className="min-w-0"><div className="flex items-center gap-2"><span className={`size-1.5 shrink-0 rounded-full ${item.urgency === "critique" ? "bg-[#c65242]" : item.urgency === "attention" ? "bg-[#d8951a]" : "bg-[#1fb6a4]"}`} /><p className="truncate text-[10px] font-black uppercase tracking-[.08em] text-[#7a8e94]">{item.category}</p></div><h3 className="mt-1.5 truncate font-bold text-[#102e37]">{item.title}</h3><div className="mt-2"><TrustBadge trust={item.trust} source={item.source} /></div></div>
            <div><p className="text-[9px] font-black uppercase tracking-[.09em] text-[#8a9a9e]">Lecture</p><p className="mt-1.5 text-sm font-black capitalize text-[#075568]">{item.metric}</p></div>
            <div className="min-w-0"><p className="text-sm leading-5 text-[#526970]">{item.detail}</p><p className="mt-1 truncate text-[10px] text-[#8a9a9e]">Source : {item.source}</p></div>
            {item.href ? <Link href={item.href} className="btn-secondary whitespace-nowrap">Ouvrir <ArrowRight size={14} /></Link> : null}
          </article>
        ))}</div> : <div className="grid min-h-48 place-items-center p-8 text-center"><div><Layers3 className="mx-auto text-[#9db0b4]" /><h3 className="mt-3 font-bold">Aucun objet pour cette combinaison</h3><p className="mt-2 text-sm text-[#667b81]">Modifiez le quai, l’espèce ou la lecture. La lacune reste visible.</p></div></div>}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="surface p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="label">Capacités et continuité</p><h2 className="mt-1 text-lg font-black">Disponibilité opérationnelle du quai</h2></div><Building2 size={21} className="text-[#08758a]" /></div>
          <div className="mt-5 space-y-4">{infrastructures.length ? infrastructures.map((item) => {
            const rate = item.theoreticalCapacity ? Math.round(item.availableCapacity / item.theoreticalCapacity * 100) : 0;
            return <div key={item.id}><div className="flex items-center justify-between gap-3 text-sm"><div><p className="font-bold">{item.name}</p><p className="mt-0.5 text-xs capitalize text-[#71858a]">{item.type.replaceAll("_", " ")} · {item.status}</p></div><strong>{rate}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eeee]"><div className={`h-full rounded-full ${rate < 25 ? "bg-[#c65242]" : rate < 60 ? "bg-[#d8951a]" : "bg-[#1fb6a4]"}`} style={{ width: `${rate}%` }} /></div></div>;
          }) : <p className="text-sm text-[#667b81]">Aucune capacité documentée pour ce quai.</p>}</div>
          <Link href="/app/coordination" className="link-action mt-5">Mobiliser une capacité <ArrowRight size={14} /></Link>
        </div>

        <aside className={`rounded-[18px] border p-5 ${assistantEnabled ? "border-[#9bded5] bg-[#eefaf7]" : "border-[#d9e3e3] bg-white"}`}>
          <div className="flex items-center gap-2 text-[#08758a]"><Sparkles size={18} /><p className="label">Assistance optionnelle</p></div>
          <h2 className="mt-3 text-lg font-black">{assistantEnabled ? "Synthèse prête à vérifier" : "Contrôle humain par défaut"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#667b81]">{assistantEnabled ? `La continuité du quai de ${territory.name} dépend d’abord de ${infrastructures.find((item) => item.status !== "operationnelle")?.name ?? "la disponibilité déclarée des capacités"}. La suggestion reste explicable et doit être validée.` : "L’organisation peut activer l’assistance pour résumer les signaux et préparer une note. Aucune donnée n’est transmise à un service d’IA dans cette démonstration."}</p>
          <button onClick={() => setAssistantEnabled((value) => !value)} className={assistantEnabled ? "btn-secondary mt-5 w-full" : "btn-primary mt-5 w-full"}>{assistantEnabled ? "Désactiver l’assistance" : "Activer pour cette session"}</button>
        </aside>
      </section>
    </div>
  );
}
