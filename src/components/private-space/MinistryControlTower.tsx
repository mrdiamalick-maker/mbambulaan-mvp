"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  communityNeeds,
  communityProjects,
  dashboardMetrics,
  getQuayById,
  landings,
  levelOptions,
  mapAlerts,
  mapTypes,
  partners,
  pendingActions,
  pirogues,
  quays,
  regions,
  speciesOptions,
  trainingPrograms,
  type Level,
  type MapItemType,
  type ModuleId,
  type Region
} from "@/data/ministryControlTowerData";
import {
  Badge,
  CompactQuayTable,
  Field,
  MinistryMap,
  ModuleTabs,
  PirogueDetail,
  QuayDetail,
  SectionHeader,
  ShellCard,
  StatCard,
  inputClass,
  primaryButton,
  secondaryButton,
  selectClass
} from "./MinistryControlTowerParts";

const allRegions = "Toutes";
const allQuays = "Tous";
const allSpecies = "Toutes";

type RegionFilter = Region | typeof allRegions;
type QuayFilter = string | typeof allQuays;
type SpeciesFilter = string | typeof allSpecies;
type LevelFilter = "Tous" | "Normal" | "À surveiller" | "Urgent";
type MapViewMode = "quays" | "pirogues";

type SelectedItem = {
  kind: "quay" | "pirogue";
  id: string;
} | null;

const levelByLabel: Record<Exclude<LevelFilter, "Tous">, Level> = {
  Normal: "normal",
  "À surveiller": "surveillance",
  Urgent: "urgent"
};

export function MinistryControlTower() {
  const [activeModule, setActiveModule] = useState<ModuleId>("map");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<RegionFilter>(allRegions);
  const [quayId, setQuayId] = useState<QuayFilter>(allQuays);
  const [mapType, setMapType] = useState<MapItemType>("Tous");
  const [level, setLevel] = useState<LevelFilter>("Tous");
  const [species, setSpecies] = useState<SpeciesFilter>(allSpecies);
  const [selected, setSelected] = useState<SelectedItem>(null);

  const selectedLevel = level === "Tous" ? null : levelByLabel[level];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredQuays = useMemo(() => quays.filter((quay) => {
    const matchRegion = region === allRegions || quay.region === region;
    const matchQuay = quayId === allQuays || quay.id === quayId;
    const matchLevel = !selectedLevel || quay.level === selectedLevel;
    const matchSpecies = species === allSpecies || quay.species.includes(species);
    const matchSearch = !normalizedSearch || [quay.name, quay.region, quay.commune, ...quay.species].join(" ").toLowerCase().includes(normalizedSearch);
    return matchRegion && matchQuay && matchLevel && matchSpecies && matchSearch;
  }), [normalizedSearch, quayId, region, selectedLevel, species]);

  const filteredQuayIds = useMemo(() => new Set(filteredQuays.map((quay) => quay.id)), [filteredQuays]);

  const filteredPirogues = useMemo(() => pirogues.filter((pirogue) => {
    const quay = getQuayById(pirogue.quayId);
    const matchBase = filteredQuayIds.has(pirogue.quayId);
    const matchLevel = !selectedLevel || pirogue.level === selectedLevel;
    const matchSearch = !normalizedSearch || [pirogue.registration, pirogue.status, pirogue.lastPosition, pirogue.declaredActivity, quay.name].join(" ").toLowerCase().includes(normalizedSearch);
    return matchBase && matchLevel && matchSearch;
  }), [filteredQuayIds, normalizedSearch, selectedLevel]);

  const filteredLandings = useMemo(() => landings.filter((landing) => {
    const quay = getQuayById(landing.quayId);
    const matchBase = filteredQuayIds.has(landing.quayId);
    const matchSpecies = species === allSpecies || landing.species.includes(species);
    const matchSearch = !normalizedSearch || [landing.status, quay.name, ...landing.species].join(" ").toLowerCase().includes(normalizedSearch);
    return matchBase && matchSpecies && matchSearch;
  }), [filteredQuayIds, normalizedSearch, species]);

  const filteredAlerts = useMemo(() => mapAlerts.filter((alert) => {
    const quay = getQuayById(alert.quayId);
    const matchBase = filteredQuayIds.has(alert.quayId);
    const matchLevel = !selectedLevel || alert.level === selectedLevel;
    const matchSearch = !normalizedSearch || [alert.title, alert.source, alert.nextAction, quay.name].join(" ").toLowerCase().includes(normalizedSearch);
    return matchBase && matchLevel && matchSearch;
  }), [filteredQuayIds, normalizedSearch, selectedLevel]);

  const visibleQuays = mapType === "Pirogues" ? filteredQuays.filter((quay) => filteredPirogues.some((pirogue) => pirogue.quayId === quay.id)) : filteredQuays;
  const visiblePirogues = mapType === "Quais" || mapType === "Débarquements" || mapType === "Espèces" ? [] : filteredPirogues;
  const visibleAlerts = mapType === "Alertes" || mapType === "Tous" ? filteredAlerts : [];
  const selectedPirogue = selected?.kind === "pirogue" ? pirogues.find((pirogue) => pirogue.id === selected.id) ?? null : null;
  const selectedQuay = selected?.kind === "quay" ? getQuayById(selected.id) : selectedPirogue ? getQuayById(selectedPirogue.quayId) : getQuayById("joal");
  const selectedQuayLandings = filteredLandings.filter((landing) => landing.quayId === selectedQuay.id);
  const selectedQuayPirogues = filteredPirogues.filter((pirogue) => pirogue.quayId === selectedQuay.id);
  const selectedQuayAlerts = filteredAlerts.filter((alert) => alert.quayId === selectedQuay.id);
  const declaredSpecies = new Set(filteredLandings.flatMap((landing) => landing.species));

  const tableRows = visibleQuays.map((quay) => ({
    quay,
    landings: filteredLandings.filter((landing) => landing.quayId === quay.id),
    pirogues: filteredPirogues.filter((pirogue) => pirogue.quayId === quay.id),
    alerts: filteredAlerts.filter((alert) => alert.quayId === quay.id)
  }));

  function resetFilters() {
    setSearch("");
    setRegion(allRegions);
    setQuayId(allQuays);
    setMapType("Tous");
    setLevel("Tous");
    setSpecies(allSpecies);
    setSelected(null);
  }

  return <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_42%,#fff7ed_100%)] text-slate-950">
    <header className="border-b border-cyan-100 bg-white/92 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-800 text-sm font-black text-white">Mb</Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Ministère des Pêches</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Suivi des quais de pêche artisanale</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={primaryButton}>Créer une alerte</button>
          <button className={secondaryButton}>Exporter la synthèse</button>
          <Link href="/espace-prive" className={secondaryButton}>Retour accès</Link>
        </div>
      </div>
    </header>

    <section className="mx-auto grid w-full max-w-[96rem] gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <ShellCard className="bg-gradient-to-br from-white via-cyan-50 to-emerald-50">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
          <div>
            <Badge>Application métier</Badge>
            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">Carte des quais, pirogues, débarquements et alertes terrain.</h2>
            <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-600">Cette interface aide un agent ministère à voir la situation du jour, filtrer les informations, consulter un quai ou une pirogue, puis organiser les besoins terrain et le suivi des actions.</p>
          </div>
          <div className="rounded-3xl border border-cyan-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Aujourd'hui</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{quays.length} quais suivis</p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">Données locales simulées pour démonstration. Les décisions restent validées par les services compétents.</p>
          </div>
        </div>
        <div className="mt-6"><ModuleTabs active={activeModule} onChange={setActiveModule} /></div>
      </ShellCard>

      {activeModule === "map" ? <MapModule search={search} setSearch={setSearch} region={region} setRegion={setRegion} quayId={quayId} setQuayId={setQuayId} mapType={mapType} setMapType={setMapType} level={level} setLevel={setLevel} species={species} setSpecies={setSpecies} resetFilters={resetFilters} visibleQuays={visibleQuays} visiblePirogues={visiblePirogues} visibleAlerts={visibleAlerts} filteredLandings={filteredLandings} selected={selected} setSelected={setSelected} selectedQuay={selectedQuay} selectedPirogue={selectedPirogue} selectedQuayLandings={selectedQuayLandings} selectedQuayPirogues={selectedQuayPirogues} selectedQuayAlerts={selectedQuayAlerts} tableRows={tableRows} mapStats={{ quays: visibleQuays.length, landings: filteredLandings.length, pirogues: filteredPirogues.length, alerts: filteredAlerts.length, species: declaredSpecies.size }} /> : null}
      {activeModule === "community" ? <CommunityModule /> : null}
      {activeModule === "tracking" ? <TrackingModule /> : null}
    </section>
  </main>;
}

function MapModule({ search, setSearch, region, setRegion, quayId, setQuayId, mapType, setMapType, level, setLevel, species, setSpecies, resetFilters, visibleQuays, visiblePirogues, visibleAlerts, filteredLandings, selected, setSelected, selectedQuay, selectedPirogue, selectedQuayLandings, selectedQuayPirogues, selectedQuayAlerts, tableRows, mapStats }: {
  search: string;
  setSearch: (value: string) => void;
  region: RegionFilter;
  setRegion: (value: RegionFilter) => void;
  quayId: QuayFilter;
  setQuayId: (value: QuayFilter) => void;
  mapType: MapItemType;
  setMapType: (value: MapItemType) => void;
  level: LevelFilter;
  setLevel: (value: LevelFilter) => void;
  species: SpeciesFilter;
  setSpecies: (value: SpeciesFilter) => void;
  resetFilters: () => void;
  visibleQuays: typeof quays;
  visiblePirogues: typeof pirogues;
  visibleAlerts: typeof mapAlerts;
  filteredLandings: typeof landings;
  selected: SelectedItem;
  setSelected: (value: SelectedItem) => void;
  selectedQuay: typeof quays[number];
  selectedPirogue: typeof pirogues[number] | null;
  selectedQuayLandings: typeof landings;
  selectedQuayPirogues: typeof pirogues;
  selectedQuayAlerts: typeof mapAlerts;
  tableRows: Array<{ quay: typeof quays[number]; landings: typeof landings; pirogues: typeof pirogues; alerts: typeof mapAlerts }>;
  mapStats: { quays: number; landings: number; pirogues: number; alerts: number; species: number };
}) {
  const [mapView, setMapView] = useState<MapViewMode>("quays");

  function chooseQuayView() {
    setMapView("quays");
    if (mapType === "Pirogues") setMapType("Tous");
    setSelected(null);
  }

  function choosePirogueView() {
    setMapView("pirogues");
    setMapType("Pirogues");
    setSelected(null);
  }

  return <section className="grid gap-6">
    <SectionHeader eyebrow="Carte & supervision" title="Voir la filière sur une carte" description="Vue quais pour lire l'activité des points de débarquement. Vue pirogues pour suivre les immatriculations, positions simulées et déclarations." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Quais affichés" value={String(mapStats.quays)} detail="Selon les filtres actifs." /><StatCard label="Débarquements du jour" value={String(mapStats.landings)} detail="Déclarations consultables." /><StatCard label="Pirogues actives" value={String(mapStats.pirogues)} detail="Immatriculations visibles." /><StatCard label="Alertes en cours" value={String(mapStats.alerts)} detail="Alertes à vérifier." /><StatCard label="Espèces déclarées" value={String(mapStats.species)} detail="Espèces présentes dans les débarquements." /></div>
    <ShellCard>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <button onClick={chooseQuayView} className={`rounded-2xl border p-4 text-left transition ${mapView === "quays" ? "border-cyan-700 bg-cyan-800 text-white" : "border-cyan-100 bg-cyan-50 text-cyan-950"}`}><p className="text-base font-black">Vue quais</p><p className="mt-1 text-xs font-bold opacity-85">Quais, espèces, volumes et débarquements par quai.</p></button>
        <button onClick={choosePirogueView} className={`rounded-2xl border p-4 text-left transition ${mapView === "pirogues" ? "border-cyan-700 bg-cyan-800 text-white" : "border-cyan-100 bg-cyan-50 text-cyan-950"}`}><p className="text-base font-black">Vue pirogues</p><p className="mt-1 text-xs font-bold opacity-85">Immatriculations, positions simulées, trajectoires et déclarations.</p></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <Field label="Recherche"><input value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass} placeholder="Rechercher un quai ou une pirogue" /></Field>
        <Field label="Région"><select value={region} onChange={(event) => setRegion(event.target.value as RegionFilter)} className={selectClass}><option>{allRegions}</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Quai"><select value={quayId} onChange={(event) => setQuayId(event.target.value)} className={selectClass}><option value={allQuays}>Tous</option>{quays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></Field>
        <Field label="Type"><select value={mapType} onChange={(event) => { const next = event.target.value as MapItemType; setMapType(next); if (next === "Pirogues") setMapView("pirogues"); if (next === "Quais" || next === "Débarquements" || next === "Espèces") setMapView("quays"); }} className={selectClass}>{mapTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Niveau"><select value={level} onChange={(event) => setLevel(event.target.value as LevelFilter)} className={selectClass}>{levelOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Espèce"><select value={species} onChange={(event) => setSpecies(event.target.value)} className={selectClass}><option>{allSpecies}</option>{speciesOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <div className="flex items-end"><button onClick={resetFilters} className={`${secondaryButton} w-full`}>Réinitialiser</button></div>
      </div>
    </ShellCard>
    <div className="grid min-w-0 gap-5">
      <MinistryMap viewMode={mapView} quays={visibleQuays} pirogues={visiblePirogues} alerts={visibleAlerts} landings={filteredLandings} selectedId={selected?.id ?? ""} selectedKind={selected?.kind ?? "quay"} onSelectQuay={(id) => setSelected({ kind: "quay", id })} onSelectPirogue={(id) => setSelected({ kind: "pirogue", id })} />
      {selected ? <div className="grid gap-3 rounded-3xl border border-cyan-100 bg-white p-4 shadow-[0_18px_48px_rgba(8,145,178,0.10)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Détail sélectionné</p>
          <button onClick={() => setSelected(null)} className="rounded-full border border-cyan-100 px-3 py-1 text-xs font-black text-cyan-900">Fermer</button>
        </div>
        {selected.kind === "pirogue" && selectedPirogue ? <PirogueDetail pirogue={selectedPirogue} quay={selectedQuay} /> : <QuayDetail quay={selectedQuay} landings={selectedQuayLandings} pirogues={selectedQuayPirogues} alerts={selectedQuayAlerts} />}
      </div> : <p className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-4 text-sm font-bold text-cyan-950">Cliquez sur un quai ou une pirogue sur la carte pour afficher le détail.</p>}
      <ShellCard><SectionHeader eyebrow="Liste filtrée" title="Quais et activité du jour" description="La table reprend uniquement les quais visibles avec leurs débarquements, volumes, pirogues, espèces et alertes." /><CompactQuayTable rows={tableRows} /></ShellCard>
    </div>
  </section>;
}

function CommunityModule() {
  const urgentNeeds = [...communityNeeds].sort((a, b) => Number(b.urgency === "urgent") - Number(a.urgency === "urgent"));
  const pipeline = [
    { label: "Besoin remonté", count: communityNeeds.length, detail: "Demandes terrain à qualifier" },
    { label: "À documenter", count: communityNeeds.filter((need) => need.status.includes("documenter") || need.status.includes("cadrer")).length + 1, detail: "Informations à compléter" },
    { label: "À financer", count: communityProjects.filter((project) => project.status.includes("cadrer") || project.status.includes("compléter")).length, detail: "Dossiers à présenter" },
    { label: "Planifié", count: trainingPrograms.filter((program) => program.status.includes("planifier") || program.status.includes("confirmer")).length, detail: "Formations à caler" },
    { label: "En cours", count: communityProjects.filter((project) => project.status === "Documenté" || project.status === "Prioritaire").length, detail: "Actions prêtes" }
  ];

  return <section className="grid gap-6">
    <SectionHeader eyebrow="Communautés & programmes" title="Transformer les besoins terrain en actions" description="Un besoin remonte du terrain, il est qualifié, transformé en programme, relié à un partenaire puis suivi jusqu'à l'action." />
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)_23rem]">
      <ShellCard className="bg-gradient-to-b from-white to-amber-50/50">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Priorités terrain</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Besoins à traiter</h3>
        <div className="mt-5 grid gap-3">
          {urgentNeeds.slice(0, 5).map((need) => <article key={need.id} className="rounded-2xl border border-amber-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3"><h4 className="text-base font-black text-slate-950">{need.need}</h4><Badge level={need.urgency} /></div>
            <p className="mt-2 text-sm font-bold text-slate-600">{need.place} · {need.actors}</p>
            <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-950">Prochaine action : {need.nextAction}</p>
          </article>)}
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Pipeline programmes</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">Du besoin à l'action</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {pipeline.map((step, index) => <div key={step.label} className="relative rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
              <p className="text-3xl font-black text-cyan-950">{step.count}</p>
              <p className="mt-2 text-sm font-black text-slate-950">{step.label}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{step.detail}</p>
              {index < pipeline.length - 1 ? <span className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-cyan-200 bg-cyan-50 md:block" /> : null}
            </div>)}
          </div>
        </ShellCard>

        <ShellCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Programmes actifs</p><h3 className="mt-2 text-2xl font-black text-slate-950">Actions à préparer</h3></div>
            <button className={primaryButton}>Préparer une fiche programme</button>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {communityProjects.map((project) => <article key={project.id} className="rounded-2xl border border-cyan-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3"><h4 className="text-lg font-black text-slate-950">{project.project}</h4><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{project.status}</span></div>
              <div className="mt-3 grid gap-2 text-sm font-bold text-slate-700">
                <DataPair label="Territoire" value={project.territory} />
                <DataPair label="Porteur" value={project.owner} />
                <DataPair label="Budget" value={project.estimatedBudget} />
                <DataPair label="Partenaire cible" value={project.targetPartner} />
              </div>
            </article>)}
          </div>
        </ShellCard>
      </div>

      <div className="grid gap-6">
        <ShellCard className="bg-gradient-to-br from-cyan-950 to-emerald-800 text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Prochaine décision</p>
          <h3 className="mt-2 text-2xl font-black">Prioriser les besoins sécurité et froid</h3>
          <p className="mt-3 text-sm font-bold leading-6 text-cyan-50">Les besoins urgents à Saint-Louis, Kayar et Mbour doivent être transformés en notes courtes avec partenaire cible.</p>
          <div className="mt-5 grid gap-2">
            <button className="rounded-full bg-white px-4 py-3 text-sm font-black text-cyan-950">Créer une note d'action</button>
            <button className="rounded-full border border-white/25 px-4 py-3 text-sm font-black text-white">Voir les besoins urgents</button>
          </div>
        </ShellCard>
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Partenaires mobilisables</p>
          <div className="mt-4 grid gap-3">
            {partners.slice(0, 5).map((partner) => <article key={partner.id} className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-3">
              <p className="text-sm font-black text-cyan-950">{partner.name}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{partner.usefulFor}</p>
            </article>)}
          </div>
        </ShellCard>
      </div>
    </div>
  </section>;
}

function TrackingModule() {
  const totalVolume = quays.reduce((total, quay) => total + quay.volumeTons, 0);
  const urgentAlerts = mapAlerts.filter((alert) => alert.level === "urgent");
  const watchAlerts = mapAlerts.filter((alert) => alert.level === "surveillance");
  const maxVolume = Math.max(...quays.map((quay) => quay.volumeTons));
  const urgentActions = pendingActions.filter((action) => action.level !== "normal");

  return <section className="grid gap-6">
    <SectionHeader eyebrow="Indicateurs & suivi" title="Suivre la journée et traiter les priorités" description="Cette page sert à savoir ce qui se passe, ce qui bloque et ce qu'il faut reprendre maintenant." />
    <ShellCard className="bg-gradient-to-br from-cyan-950 via-cyan-800 to-emerald-700 text-white">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Situation du jour</p>
          <h3 className="mt-3 text-4xl font-black tracking-tight">{landings.length} débarquements déclarés · {totalVolume.toFixed(1)} tonnes suivies</h3>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-cyan-50">Les volumes sont concentrés sur Mbour, Joal et Kayar. Les alertes urgentes restent liées à Saint-Louis et à la validation de certaines déclarations.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {dashboardMetrics.slice(2, 5).map((metric) => <div key={metric.id} className="rounded-2xl bg-white/12 p-4 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-100">{metric.label}</p><p className="mt-1 text-2xl font-black">{metric.value}</p><p className="mt-1 text-xs font-bold text-cyan-50">{metric.action}</p></div>)}
        </div>
      </div>
    </ShellCard>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Activité pêche</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Volumes par quai</h3>
        <div className="mt-5 grid gap-4">
          {quays.map((quay) => <div key={quay.id} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm font-black"><span>{quay.name}</span><span>{quay.volumeTons} t · {quay.landingsToday} débarq.</span></div>
            <div className="h-4 overflow-hidden rounded-full bg-cyan-50"><div className="h-full rounded-full bg-gradient-to-r from-cyan-700 to-emerald-500" style={{ width: `${Math.round((quay.volumeTons / maxVolume) * 100)}%` }} /></div>
          </div>)}
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard className="border-rose-100 bg-rose-50/50">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">À traiter maintenant</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{urgentAlerts.length} alerte urgente</h3>
          <div className="mt-4 grid gap-3">
            {[...urgentAlerts, ...watchAlerts].slice(0, 4).map((alert) => <article key={alert.id} className="rounded-2xl border border-white bg-white p-3">
              <div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-slate-950">{alert.title}</p><Badge level={alert.level} /></div>
              <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{alert.nextAction}</p>
            </article>)}
          </div>
        </ShellCard>
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Actions en retard</p>
          <div className="mt-4 grid gap-3">
            {urgentActions.map((action) => <article key={action.id} className="rounded-2xl border border-cyan-100 bg-white p-3">
              <div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-slate-950">{action.action}</p><Badge level={action.level} /></div>
              <p className="mt-2 text-xs font-bold text-slate-500">{action.owner} · {action.dueDate}</p>
            </article>)}
          </div>
        </ShellCard>
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Débarquements récents</p>
        <div className="mt-4 grid gap-3">
          {landings.map((landing) => {
            const quay = getQuayById(landing.quayId);
            return <article key={landing.id} className="grid gap-3 rounded-2xl border border-cyan-100 bg-white p-4 sm:grid-cols-[7rem_minmax(0,1fr)_7rem] sm:items-center">
              <p className="text-lg font-black text-cyan-900">{landing.time}</p>
              <div><p className="font-black text-slate-950">{quay.name}</p><p className="text-sm font-bold text-slate-500">{landing.species.join(", ")}</p></div>
              <p className="text-right text-sm font-black text-slate-700">{landing.volumeTons} t</p>
            </article>;
          })}
        </div>
      </ShellCard>
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Synthèse opérationnelle</p>
        <div className="mt-4 grid gap-3">
          {["Confirmer le retour de SL-PI-1188 avant fin de journée.", "Prioriser la panne froid de Mbour avant extension aux mareyeurs.", "Préparer une fiche courte sur le besoin de glace Joal / Mbour.", "Vérifier les débarquements incomplets avant export de synthèse."].map((item) => <div key={item} className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm font-black leading-6 text-cyan-950">{item}</div>)}
        </div>
      </ShellCard>
    </div>
  </section>;
}

function DataPair({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-1.5 last:border-b-0"><span className="text-slate-500">{label}</span><span className="max-w-[65%] text-right text-slate-900">{value}</span></div>;
}
