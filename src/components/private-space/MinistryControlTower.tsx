"use client";

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
import { ProductShell } from "./ProductShell";
import {
  Badge,
  CompactQuayTable,
  Field,
  MinistryMap,
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
  const selectedPirogueLandings = selectedPirogue ? filteredLandings.filter((landing) => landing.pirogueIds.includes(selectedPirogue.id)) : [];
  const declaredSpecies = new Set(filteredLandings.flatMap((landing) => landing.species));

  const tableRows = visibleQuays.map((quay) => ({
    quay,
    landings: filteredLandings.filter((landing) => landing.quayId === quay.id),
    pirogues: filteredPirogues.filter((pirogue) => pirogue.quayId === quay.id),
    alerts: filteredAlerts.filter((alert) => alert.quayId === quay.id)
  }));

  const shellKpis = [
    { label: "Quais", value: String(quays.length), detail: "Littoral pilote suivi" },
    { label: "Débarquements", value: String(landings.length), detail: "Déclarations récentes" },
    { label: "Alertes", value: String(mapAlerts.length), detail: "Situations à vérifier" }
  ];

  function resetFilters() {
    setSearch("");
    setRegion(allRegions);
    setQuayId(allQuays);
    setMapType("Tous");
    setLevel("Tous");
    setSpecies(allSpecies);
    setSelected(null);
  }

  return <ProductShell activeModule={activeModule} onModuleChange={setActiveModule} kpis={shellKpis}>
    {activeModule === "map" ? <MapModule search={search} setSearch={setSearch} region={region} setRegion={setRegion} quayId={quayId} setQuayId={setQuayId} mapType={mapType} setMapType={setMapType} level={level} setLevel={setLevel} species={species} setSpecies={setSpecies} resetFilters={resetFilters} visibleQuays={visibleQuays} visiblePirogues={visiblePirogues} visibleAlerts={visibleAlerts} filteredLandings={filteredLandings} selected={selected} setSelected={setSelected} selectedQuay={selectedQuay} selectedPirogue={selectedPirogue} selectedPirogueLandings={selectedPirogueLandings} selectedQuayLandings={selectedQuayLandings} selectedQuayPirogues={selectedQuayPirogues} selectedQuayAlerts={selectedQuayAlerts} tableRows={tableRows} mapStats={{ quays: visibleQuays.length, landings: filteredLandings.length, pirogues: filteredPirogues.length, alerts: filteredAlerts.length, species: declaredSpecies.size }} /> : null}
    {activeModule === "community" ? <CommunityModule /> : null}
    {activeModule === "tracking" ? <TrackingModule /> : null}
  </ProductShell>;
}

function MapModule({ search, setSearch, region, setRegion, quayId, setQuayId, mapType, setMapType, level, setLevel, species, setSpecies, resetFilters, visibleQuays, visiblePirogues, visibleAlerts, filteredLandings, selected, setSelected, selectedQuay, selectedPirogue, selectedPirogueLandings, selectedQuayLandings, selectedQuayPirogues, selectedQuayAlerts, tableRows, mapStats }: {
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
    <SectionHeader eyebrow="Cartographie high-level" title="Lire la filière sur le littoral" description="Vue quais pour comprendre l’activité à terre. Vue pirogues pour suivre les immatriculations et les déclarations en mer. La carte reste prête pour une future intégration Leaflet ou MapLibre." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Quais affichés" value={String(mapStats.quays)} detail="Selon les filtres actifs." /><StatCard label="Débarquements" value={String(mapStats.landings)} detail="Déclarations consultables." /><StatCard label="Pirogues actives" value={String(mapStats.pirogues)} detail="Immatriculations visibles." /><StatCard label="Alertes" value={String(mapStats.alerts)} detail="Situations à vérifier." /><StatCard label="Espèces" value={String(mapStats.species)} detail="Espèces déclarées." /></div>
    <ShellCard className="bg-white/92">
      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-end">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button onClick={chooseQuayView} className={`rounded-2xl border p-4 text-left transition ${mapView === "quays" ? "border-[#0b3142] bg-[#0b3142] text-white shadow-lg shadow-cyan-950/15" : "border-slate-200 bg-slate-50 text-slate-950 hover:border-cyan-300"}`}><p className="text-base font-black">Vue quais</p><p className="mt-1 text-xs font-semibold opacity-85">Volumes, espèces et débarquements par quai.</p></button>
          <button onClick={choosePirogueView} className={`rounded-2xl border p-4 text-left transition ${mapView === "pirogues" ? "border-[#0b3142] bg-[#0b3142] text-white shadow-lg shadow-cyan-950/15" : "border-slate-200 bg-slate-50 text-slate-950 hover:border-cyan-300"}`}><p className="text-base font-black">Vue pirogues</p><p className="mt-1 text-xs font-semibold opacity-85">Positions, immatriculations et déclarations.</p></button>
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
    <div className="grid min-w-0 gap-5">
      <MinistryMap viewMode={mapView} quays={visibleQuays} pirogues={visiblePirogues} alerts={visibleAlerts} landings={filteredLandings} selectedId={selected?.id ?? ""} selectedKind={selected?.kind ?? "quay"} onSelectQuay={(id) => setSelected({ kind: "quay", id })} onSelectPirogue={(id) => setSelected({ kind: "pirogue", id })} />
      {selected ? <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Détail sélectionné</p>
          <button onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-black text-slate-800 hover:bg-slate-50">Fermer</button>
        </div>
        {selected.kind === "pirogue" && selectedPirogue ? <PirogueDetail pirogue={selectedPirogue} quay={selectedQuay} landings={selectedPirogueLandings} /> : <QuayDetail quay={selectedQuay} landings={selectedQuayLandings} pirogues={selectedQuayPirogues} alerts={selectedQuayAlerts} />}
      </div> : <p className="rounded-[1.15rem] border border-dashed border-slate-300 bg-white/70 p-4 text-sm font-bold text-slate-700">Cliquez sur un quai ou une pirogue sur la carte pour afficher le panneau de détail.</p>}
      <ShellCard><SectionHeader eyebrow="Liste filtrée" title="Quais et activité du jour" description="La table reprend les quais visibles avec leurs débarquements, volumes, pirogues, espèces et alertes." /><CompactQuayTable rows={tableRows} /></ShellCard>
    </div>
  </section>;
}

function CommunityModule() {
  const urgentNeeds = [...communityNeeds].sort((a, b) => Number(b.urgency === "urgent") - Number(a.urgency === "urgent"));
  const pipeline = [
    { label: "Besoin terrain", count: communityNeeds.length, detail: "Signal remonté" },
    { label: "Qualification", count: communityNeeds.filter((need) => need.status.includes("documenter") || need.status.includes("cadrer")).length + 1, detail: "Priorité établie" },
    { label: "Programme", count: communityProjects.length, detail: "Réponse structurée" },
    { label: "Partenaire", count: partners.length, detail: "Ressource mobilisable" },
    { label: "Action", count: communityProjects.filter((project) => project.status === "Documenté" || project.status === "Prioritaire").length, detail: "Suivi impact" }
  ];

  return <section className="grid gap-6">
    <SectionHeader eyebrow="Valorisation communautaire" title="Transformer les besoins terrain en programmes suivis" description="Le module relie besoin, qualification, programme, partenaire, action et suivi d’impact sans créer une marketplace." />
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)_23rem]">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Priorités terrain</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Besoins à traiter</h3>
        <div className="mt-5 grid gap-3">
          {urgentNeeds.slice(0, 5).map((need) => <article key={need.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3"><h4 className="text-base font-black text-slate-950">{need.need}</h4><Badge level={need.urgency} /></div>
            <p className="mt-2 text-sm font-semibold text-slate-600">{need.place} · {need.actors}</p>
            <p className="mt-3 rounded-lg border-l-4 border-amber-500 bg-white px-3 py-2 text-xs font-black text-slate-800">Prochaine action : {need.nextAction}</p>
          </article>)}
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Workflow de valorisation</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">Du besoin à l’action</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {pipeline.map((step, index) => <div key={step.label} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-black text-slate-950">{step.count}</p>
              <p className="mt-2 text-sm font-black text-slate-950">{step.label}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{step.detail}</p>
              {index < pipeline.length - 1 ? <span className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-slate-200 bg-slate-50 md:block" /> : null}
            </div>)}
          </div>
        </ShellCard>

        <ShellCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Programmes actifs</p><h3 className="mt-2 text-2xl font-black text-slate-950">Actions à préparer</h3></div>
            <button className={primaryButton}>Préparer une fiche programme</button>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {communityProjects.map((project) => <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3"><h4 className="text-lg font-black text-slate-950">{project.project}</h4><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{project.status}</span></div>
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
        <ShellCard className="border-[#0b3142] bg-[#0b3142] text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Prochaine décision</p>
          <h3 className="mt-2 text-2xl font-black">Prioriser sécurité et froid</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50">Les besoins urgents à Saint-Louis, Kayar et Mbour doivent être transformés en notes courtes avec partenaire cible.</p>
          <div className="mt-5 grid gap-2">
            <button className="rounded-xl border border-white bg-white px-4 py-3 text-sm font-black text-slate-950">Créer une note d'action</button>
            <button className="rounded-xl border border-white/25 px-4 py-3 text-sm font-black text-white">Voir les besoins urgents</button>
          </div>
        </ShellCard>
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Partenaires mobilisables</p>
          <div className="mt-4 grid gap-3">
            {partners.slice(0, 5).map((partner) => <article key={partner.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-black text-slate-950">{partner.name}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{partner.usefulFor}</p>
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
    <SectionHeader eyebrow="Pilotage high-level" title="Suivre la journée et préparer l’export" description="KPI, alertes, volumes, actions, synthèse et export sont regroupés dans un poste de pilotage lisible." />
    <ShellCard className="border-[#0b3142] bg-[#0b3142] text-white">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Situation du jour</p>
          <h3 className="mt-3 text-4xl font-black tracking-tight">{landings.length} débarquements déclarés · {totalVolume.toFixed(1)} tonnes suivies</h3>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-cyan-50">Les volumes sont concentrés sur Mbour, Joal et Kayar. Les alertes urgentes restent liées à Saint-Louis et à la validation de certaines déclarations.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {dashboardMetrics.slice(2, 5).map((metric) => <div key={metric.id} className="rounded-xl border border-white/15 bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-100">{metric.label}</p><p className="mt-1 text-2xl font-black">{metric.value}</p><p className="mt-1 text-xs font-semibold text-cyan-50">{metric.action}</p></div>)}
        </div>
      </div>
    </ShellCard>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Volumes par quai</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Activité de pêche</h3>
        <div className="mt-5 grid gap-4">
          {quays.map((quay) => <div key={quay.id} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm font-black"><span>{quay.name}</span><span>{quay.volumeTons} t · {quay.landingsToday} débarq.</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#0b3142] to-cyan-500" style={{ width: `${Math.round((quay.volumeTons / maxVolume) * 100)}%` }} /></div>
          </div>)}
        </div>
      </ShellCard>

      <div className="grid gap-6">
        <ShellCard className="border-rose-200 bg-rose-50/70">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Alertes prioritaires</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{urgentAlerts.length} alerte urgente</h3>
          <div className="mt-4 grid gap-3">
            {[...urgentAlerts, ...watchAlerts].slice(0, 4).map((alert) => <article key={alert.id} className="rounded-xl border border-white bg-white p-3">
              <div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-slate-950">{alert.title}</p><Badge level={alert.level} /></div>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{alert.nextAction}</p>
            </article>)}
          </div>
        </ShellCard>
        <ShellCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Actions en retard</p>
          <div className="mt-4 grid gap-3">
            {urgentActions.map((action) => <article key={action.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-slate-950">{action.action}</p><Badge level={action.level} /></div>
              <p className="mt-2 text-xs font-semibold text-slate-500">{action.owner} · {action.dueDate}</p>
            </article>)}
          </div>
        </ShellCard>
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Débarquements récents</p>
        <div className="mt-4 grid gap-3">
          {landings.map((landing) => {
            const quay = getQuayById(landing.quayId);
            return <article key={landing.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[7rem_minmax(0,1fr)_7rem] sm:items-center">
              <p className="text-lg font-black text-slate-950">{landing.time}</p>
              <div><p className="font-black text-slate-950">{quay.name}</p><p className="text-sm font-semibold text-slate-500">{landing.species.join(", ")}</p></div>
              <p className="text-right text-sm font-black text-slate-700">{landing.volumeTons} t</p>
            </article>;
          })}
        </div>
      </ShellCard>
      <ShellCard>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Synthèse opérationnelle</p>
        <div className="mt-4 grid gap-3">
          {["Confirmer le retour de SL-PI-1188 avant fin de journée.", "Prioriser la panne froid de Mbour avant extension aux mareyeurs.", "Préparer une fiche courte sur le besoin de glace Joal / Mbour.", "Vérifier les débarquements incomplets avant export de synthèse."].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-black leading-6 text-slate-900">{item}</div>)}
        </div>
      </ShellCard>
    </div>
  </section>;
}

function DataPair({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-1.5 last:border-b-0"><span className="text-slate-500">{label}</span><span className="max-w-[65%] text-right text-slate-900">{value}</span></div>;
}
