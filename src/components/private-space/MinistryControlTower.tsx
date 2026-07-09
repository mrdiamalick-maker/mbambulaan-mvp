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
  Field,
  MinistryMap,
  PirogueDetail,
  QuayDetail,
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

const moduleCards: Array<{ id: ModuleId; label: string; subtitle: string; value: string }> = [
  { id: "map", label: "Cartographie", subtitle: "Quais, pirogues, débarquements", value: "01" },
  { id: "community", label: "Valorisation", subtitle: "Besoins, programmes, partenaires", value: "02" },
  { id: "tracking", label: "Pilotage", subtitle: "KPI, alertes, preuves", value: "03" }
];

export function MinistryControlTower() {
  const [activeModule, setActiveModule] = useState<ModuleId>("map");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<RegionFilter>(allRegions);
  const [quayId, setQuayId] = useState<QuayFilter>(allQuays);
  const [mapType, setMapType] = useState<MapItemType>("Tous");
  const [level, setLevel] = useState<LevelFilter>("Tous");
  const [species, setSpecies] = useState<SpeciesFilter>(allSpecies);
  const [selected, setSelected] = useState<SelectedItem>({ kind: "quay", id: "joal" });

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
  const selectedPirogueLandings = selectedPirogue ? filteredLandings.filter((landing) => landing.pirogueIds.includes(selectedPirogue.id)) : [];
  const declaredSpecies = new Set(filteredLandings.flatMap((landing) => landing.species));
  const totalFilteredVolume = filteredLandings.reduce((total, landing) => total + landing.volumeTons, 0);

  function resetFilters() {
    setSearch("");
    setRegion(allRegions);
    setQuayId(allQuays);
    setMapType("Tous");
    setLevel("Tous");
    setSpecies(allSpecies);
    setSelected({ kind: "quay", id: "joal" });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#edf6f4] text-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(45,212,191,0.22),transparent_28%),radial-gradient(circle_at_88%_4%,rgba(14,116,144,0.2),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#edf6f4_48%,#f7efdf_100%)]" />

      <header className="sticky top-0 z-50 border-b border-cyan-950/10 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[100rem] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-[#07384a] text-sm font-black text-white shadow-sm">Mb</Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Espace Ministère · simulation privée</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Console maritime de coordination</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={primaryButton}>Créer une alerte</button>
            <button className={secondaryButton}>Exporter la synthèse</button>
            <Link href="/espace-prive" className={secondaryButton}>Retour accès</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[100rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.75rem] border border-cyan-950/10 bg-white/92 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="px-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Modules</p>
            <nav className="mt-4 grid gap-2">
              {moduleCards.map((module) => (
                <button key={module.id} onClick={() => setActiveModule(module.id)} className={`rounded-2xl border p-4 text-left transition ${activeModule === module.id ? "border-[#07384a] bg-[#07384a] text-white shadow-xl shadow-cyan-950/15" : "border-slate-200 bg-white text-slate-800 hover:border-cyan-300 hover:bg-cyan-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-black">{module.label}</p>
                      <p className={`mt-1 text-xs font-semibold leading-5 ${activeModule === module.id ? "text-cyan-50" : "text-slate-500"}`}>{module.subtitle}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${activeModule === module.id ? "bg-white/15 text-cyan-50" : "bg-cyan-50 text-cyan-800"}`}>{module.value}</span>
                  </div>
                </button>
              ))}
            </nav>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Périmètre actif</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{region === allRegions ? "National" : region}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{filteredQuays.length} quais · {filteredPirogues.length} pirogues · {filteredAlerts.length} alertes.</p>
            </div>
          </div>
        </aside>

        <section className="grid min-w-0 gap-6">
          <HeroPanel activeModule={activeModule} volume={totalFilteredVolume} alerts={filteredAlerts.length} quaysCount={filteredQuays.length} />

          {activeModule === "map" ? <MapModule search={search} setSearch={setSearch} region={region} setRegion={setRegion} quayId={quayId} setQuayId={setQuayId} mapType={mapType} setMapType={setMapType} level={level} setLevel={setLevel} species={species} setSpecies={setSpecies} resetFilters={resetFilters} visibleQuays={visibleQuays} visiblePirogues={visiblePirogues} visibleAlerts={visibleAlerts} filteredLandings={filteredLandings} selected={selected} setSelected={setSelected} selectedQuay={selectedQuay} selectedPirogue={selectedPirogue} selectedPirogueLandings={selectedPirogueLandings} selectedQuayLandings={selectedQuayLandings} selectedQuayPirogues={selectedQuayPirogues} selectedQuayAlerts={selectedQuayAlerts} mapStats={{ quays: visibleQuays.length, landings: filteredLandings.length, pirogues: filteredPirogues.length, alerts: filteredAlerts.length, species: declaredSpecies.size }} /> : null}
          {activeModule === "community" ? <CommunityModule /> : null}
          {activeModule === "tracking" ? <TrackingModule /> : null}
        </section>
      </section>
    </main>
  );
}

function HeroPanel({ activeModule, volume, alerts, quaysCount }: { activeModule: ModuleId; volume: number; alerts: number; quaysCount: number }) {
  const title = activeModule === "map" ? "Voir le littoral, puis décider." : activeModule === "community" ? "Transformer les signaux terrain en programmes." : "Suivre les volumes, actions et preuves.";
  const description = activeModule === "map" ? "La carte est le premier niveau de lecture : quais à terre, pirogues en mer, débarquements récents et alertes à traiter." : activeModule === "community" ? "Les besoins remontés sont qualifiés, associés à des partenaires et transformés en actions documentées." : "Le pilotage consolide les KPI, les alertes, les actions en retard et une synthèse prête à exporter.";

  return <section className="overflow-hidden rounded-[1.8rem] border border-cyan-950/10 bg-white/92 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
    <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
      <div>
        <Badge>Operating System de coordination</Badge>
        <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <MetricPill label="Quais filtrés" value={String(quaysCount)} />
        <MetricPill label="Volume visible" value={`${volume.toFixed(1)} t`} />
        <MetricPill label="Alertes" value={String(alerts)} />
      </div>
    </div>
  </section>;
}

function MapModule({ search, setSearch, region, setRegion, quayId, setQuayId, mapType, setMapType, level, setLevel, species, setSpecies, resetFilters, visibleQuays, visiblePirogues, visibleAlerts, filteredLandings, selected, setSelected, selectedQuay, selectedPirogue, selectedPirogueLandings, selectedQuayLandings, selectedQuayPirogues, selectedQuayAlerts, mapStats }: {
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
  selectedPirogueLandings: typeof landings;
  selectedQuayLandings: typeof landings;
  selectedQuayPirogues: typeof pirogues;
  selectedQuayAlerts: typeof mapAlerts;
  mapStats: { quays: number; landings: number; pirogues: number; alerts: number; species: number };
}) {
  const [mapView, setMapView] = useState<MapViewMode>("quays");

  function chooseQuayView() {
    setMapView("quays");
    if (mapType === "Pirogues") setMapType("Tous");
    setSelected({ kind: "quay", id: selectedQuay.id });
  }

  function choosePirogueView() {
    setMapView("pirogues");
    setMapType("Pirogues");
    const firstPirogue = visiblePirogues[0];
    setSelected(firstPirogue ? { kind: "pirogue", id: firstPirogue.id } : { kind: "quay", id: selectedQuay.id });
  }

  return <section className="grid gap-6">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Quais affichés" value={String(mapStats.quays)} detail="Selon les filtres actifs." />
      <StatCard label="Débarquements" value={String(mapStats.landings)} detail="Déclarations consultables." />
      <StatCard label="Pirogues actives" value={String(mapStats.pirogues)} detail="Immatriculations visibles." />
      <StatCard label="Alertes" value={String(mapStats.alerts)} detail="Situations à vérifier." />
      <StatCard label="Espèces" value={String(mapStats.species)} detail="Espèces déclarées." />
    </div>

    <ShellCard className="bg-white/92">
      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-end">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button onClick={chooseQuayView} className={`rounded-2xl border p-4 text-left transition ${mapView === "quays" ? "border-[#07384a] bg-[#07384a] text-white shadow-lg shadow-cyan-950/15" : "border-slate-200 bg-slate-50 text-slate-950 hover:border-cyan-300"}`}><p className="text-base font-black">Vue quais</p><p className="mt-1 text-xs font-semibold opacity-85">Volumes, espèces et débarquements par quai.</p></button>
          <button onClick={choosePirogueView} className={`rounded-2xl border p-4 text-left transition ${mapView === "pirogues" ? "border-[#07384a] bg-[#07384a] text-white shadow-lg shadow-cyan-950/15" : "border-slate-200 bg-slate-50 text-slate-950 hover:border-cyan-300"}`}><p className="text-base font-black">Vue pirogues</p><p className="mt-1 text-xs font-semibold opacity-85">Positions, immatriculations et déclarations.</p></button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <Field label="Recherche"><input value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass} placeholder="Rechercher un quai ou une pirogue" /></Field>
          <Field label="Région"><select value={region} onChange={(event) => setRegion(event.target.value as RegionFilter)} className={selectClass}><option>{allRegions}</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Quai"><select value={quayId} onChange={(event) => setQuayId(event.target.value)} className={selectClass}><option value={allQuays}>Tous</option>{quays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></Field>
          <Field label="Type"><select value={mapType} onChange={(event) => { const next = event.target.value as MapItemType; setMapType(next); if (next === "Pirogues") setMapView("pirogues"); if (next === "Quais" || next === "Débarquements" || next === "Espèces") setMapView("quays"); }} className={selectClass}>{mapTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Niveau"><select value={level} onChange={(event) => setLevel(event.target.value as LevelFilter)} className={selectClass}>{levelOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Espèce"><select value={species} onChange={(event) => setSpecies(event.target.value)} className={selectClass}><option>{allSpecies}</option>{speciesOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <div className="flex items-end"><button onClick={resetFilters} className={`${secondaryButton} w-full`}>Réinitialiser</button></div>
        </div>
      </div>
    </ShellCard>

    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <MinistryMap viewMode={mapView} quays={visibleQuays} pirogues={visiblePirogues} alerts={visibleAlerts} landings={filteredLandings} selectedId={selected?.id ?? ""} selectedKind={selected?.kind ?? "quay"} onSelectQuay={(id) => setSelected({ kind: "quay", id })} onSelectPirogue={(id) => setSelected({ kind: "pirogue", id })} />
      <div className="grid gap-5 xl:content-start">
        {selected?.kind === "pirogue" && selectedPirogue ? <PirogueDetail pirogue={selectedPirogue} quay={selectedQuay} landings={selectedPirogueLandings} /> : <QuayDetail quay={selectedQuay} landings={selectedQuayLandings} pirogues={selectedQuayPirogues} alerts={selectedQuayAlerts} />}
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Lecture rapide</p>
          <div className="mt-4 grid gap-3">
            {selectedQuayAlerts.slice(0, 3).map((alert) => <article key={alert.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-amber-950">{alert.title}</p><Badge level={alert.level} /></div><p className="mt-2 text-xs font-bold text-amber-800">{alert.nextAction}</p></article>)}
            {!selectedQuayAlerts.length ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-900">Aucune alerte filtrée sur ce quai.</p> : null}
          </div>
        </ShellCard>
      </div>
    </div>
  </section>;
}

function CommunityModule() {
  const priorityNeeds = [...communityNeeds].sort((a, b) => Number(b.urgency === "urgent") - Number(a.urgency === "urgent"));
  const pipeline = [
    { label: "Besoin terrain", count: communityNeeds.length, detail: "Signaux remontés" },
    { label: "Qualification", count: communityNeeds.filter((need) => need.status.includes("documenter") || need.status.includes("cadrer") || need.status.includes("consolidé")).length, detail: "Dossiers à compléter" },
    { label: "Programme", count: communityProjects.length, detail: "Réponses structurées" },
    { label: "Partenaire", count: partners.length, detail: "Acteurs mobilisables" },
    { label: "Impact", count: communityProjects.reduce((sum, project) => sum + project.beneficiaries, 0), detail: "Bénéficiaires potentiels" }
  ];

  return <section className="grid gap-6">
    <div className="grid gap-4 lg:grid-cols-5">
      {pipeline.map((step) => <div key={step.label} className="rounded-[1.25rem] border border-cyan-950/10 bg-white p-4 shadow-sm"><p className="text-3xl font-black text-slate-950">{step.count}</p><p className="mt-2 text-sm font-black text-slate-950">{step.label}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{step.detail}</p></div>)}
    </div>

    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)_24rem]">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">File terrain</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Besoins à qualifier</h3>
        <div className="mt-5 grid gap-3">
          {priorityNeeds.map((need) => <article key={need.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3"><h4 className="text-base font-black text-slate-950">{need.need}</h4><Badge level={need.urgency} /></div>
            <p className="mt-2 text-sm font-semibold leading-5 text-slate-600">{need.place} · {need.actors}</p>
            <p className="mt-3 rounded-xl border-l-4 border-cyan-600 bg-white px-3 py-2 text-xs font-black text-slate-800">{need.nextAction}</p>
          </article>)}
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Programmes</p><h3 className="mt-2 text-2xl font-black text-slate-950">Réponses à structurer</h3></div>
            <button className={primaryButton}>Préparer une fiche programme</button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {communityProjects.map((project) => <article key={project.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><h4 className="text-lg font-black text-slate-950">{project.project}</h4><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{project.status}</span></div>
              <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                <DataPair label="Territoire" value={project.territory} />
                <DataPair label="Porteur" value={project.owner} />
                <DataPair label="Budget" value={project.estimatedBudget} />
                <DataPair label="Partenaire" value={project.targetPartner} />
              </div>
              <button className={`${secondaryButton} mt-4 w-full`}>{project.nextAction}</button>
            </article>)}
          </div>
        </ShellCard>

        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Formations</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {trainingPrograms.map((program) => <article key={program.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="font-black text-slate-950">{program.title}</p><p className="mt-1 text-xs font-bold text-slate-500">{program.region} · {program.target}</p><p className="mt-3 text-sm font-black text-cyan-900">{program.period}</p></article>)}
          </div>
        </ShellCard>
      </div>

      <ShellCard className="border-[#07384a] bg-[#07384a] text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Décision recommandée</p>
        <h3 className="mt-2 text-2xl font-black">Prioriser froid, sécurité et pesée</h3>
        <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50">Les signaux de Saint-Louis, Kayar, Mbour et Joal doivent être convertis en notes courtes avec porteur, budget indicatif et partenaire cible.</p>
        <div className="mt-5 grid gap-2">
          {partners.slice(0, 4).map((partner) => <div key={partner.id} className="rounded-2xl border border-white/10 bg-white/10 p-3"><p className="text-sm font-black">{partner.name}</p><p className="mt-1 text-xs font-semibold text-cyan-50">{partner.usefulFor}</p></div>)}
        </div>
      </ShellCard>
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
    <ShellCard className="border-[#07384a] bg-[#07384a] text-white">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
        <div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Synthèse de journée</p><h3 className="mt-3 text-4xl font-black tracking-tight">{landings.length} débarquements · {totalVolume.toFixed(1)} tonnes suivies</h3><p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-cyan-50">Les alertes urgentes portent sur Saint-Louis et la validation terrain. Les actions de froid, sécurité et pesée doivent être documentées avant export.</p></div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{dashboardMetrics.slice(2, 5).map((metric) => <div key={metric.id} className="rounded-xl border border-white/15 bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-100">{metric.label}</p><p className="mt-1 text-2xl font-black">{metric.value}</p><p className="mt-1 text-xs font-semibold text-cyan-50">{metric.action}</p></div>)}</div>
      </div>
    </ShellCard>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Volumes</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Répartition par quai</h3>
        <div className="mt-5 grid gap-4">
          {quays.map((quay) => <div key={quay.id} className="grid gap-2"><div className="flex items-center justify-between gap-3 text-sm font-black"><span>{quay.name}</span><span>{quay.volumeTons} t · {quay.landingsToday} débarq.</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#07384a] via-cyan-500 to-teal-400" style={{ width: `${Math.round((quay.volumeTons / maxVolume) * 100)}%` }} /></div></div>)}
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard className="border-rose-200 bg-rose-50/70">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Alertes</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{urgentAlerts.length} urgence · {watchAlerts.length} surveillances</h3>
          <div className="mt-4 grid gap-3">{[...urgentAlerts, ...watchAlerts].slice(0, 4).map((alert) => <article key={alert.id} className="rounded-xl border border-white bg-white p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-slate-950">{alert.title}</p><Badge level={alert.level} /></div><p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{alert.nextAction}</p></article>)}</div>
        </ShellCard>
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Actions</p>
          <div className="mt-4 grid gap-3">{urgentActions.map((action) => <article key={action.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-slate-950">{action.action}</p><Badge level={action.level} /></div><p className="mt-2 text-xs font-semibold text-slate-500">{action.owner} · {action.dueDate}</p></article>)}</div>
        </ShellCard>
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Débarquements récents</p>
        <div className="mt-4 grid gap-3">{landings.map((landing) => { const quay = getQuayById(landing.quayId); return <article key={landing.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[7rem_minmax(0,1fr)_7rem] sm:items-center"><p className="text-lg font-black text-slate-950">{landing.time}</p><div><p className="font-black text-slate-950">{quay.name}</p><p className="text-sm font-semibold text-slate-500">{landing.species.join(", ")}</p></div><p className="text-right text-sm font-black text-slate-700">{landing.volumeTons} t</p></article>; })}</div>
      </ShellCard>
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Export de preuve</p>
        <div className="mt-4 grid gap-3">{["Confirmer le retour de SL-PI-1188.", "Documenter la panne froid de Mbour.", "Préparer la note besoin de glace Joal / Mbour.", "Vérifier les débarquements incomplets avant synthèse."].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-black leading-6 text-slate-900">{item}</div>)}</div>
        <button className={`${primaryButton} mt-5 w-full`}>Générer la synthèse simulée</button>
      </ShellCard>
    </div>
  </section>;
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-cyan-950/10 bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p></div>;
}

function DataPair({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-1.5 last:border-b-0"><span className="text-slate-500">{label}</span><span className="max-w-[65%] text-right text-slate-900">{value}</span></div>;
}
