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
  NeedCard,
  PirogueDetail,
  ProjectCard,
  QuayDetail,
  SectionHeader,
  ShellCard,
  StatCard,
  TrainingCard,
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

      {activeModule === "map" ? <MapModule search={search} setSearch={setSearch} region={region} setRegion={setRegion} quayId={quayId} setQuayId={setQuayId} mapType={mapType} setMapType={setMapType} level={level} setLevel={setLevel} species={species} setSpecies={setSpecies} resetFilters={resetFilters} visibleQuays={visibleQuays} visiblePirogues={visiblePirogues} visibleAlerts={visibleAlerts} selected={selected} setSelected={setSelected} selectedQuay={selectedQuay} selectedPirogue={selectedPirogue} selectedQuayLandings={selectedQuayLandings} selectedQuayPirogues={selectedQuayPirogues} selectedQuayAlerts={selectedQuayAlerts} tableRows={tableRows} mapStats={{ quays: visibleQuays.length, landings: filteredLandings.length, pirogues: filteredPirogues.length, alerts: filteredAlerts.length, species: declaredSpecies.size }} /> : null}
      {activeModule === "community" ? <CommunityModule /> : null}
      {activeModule === "tracking" ? <TrackingModule /> : null}
    </section>
  </main>;
}

function MapModule({ search, setSearch, region, setRegion, quayId, setQuayId, mapType, setMapType, level, setLevel, species, setSpecies, resetFilters, visibleQuays, visiblePirogues, visibleAlerts, selected, setSelected, selectedQuay, selectedPirogue, selectedQuayLandings, selectedQuayPirogues, selectedQuayAlerts, tableRows, mapStats }: {
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
  return <section className="grid gap-6">
    <SectionHeader eyebrow="Carte & supervision" title="Voir la filière sur une carte" description="Filtrer les régions, quais, pirogues, débarquements, espèces et alertes. Le détail s'affiche uniquement après sélection d'un point sur la carte." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Quais affichés" value={String(mapStats.quays)} detail="Selon les filtres actifs." /><StatCard label="Débarquements du jour" value={String(mapStats.landings)} detail="Déclarations consultables." /><StatCard label="Pirogues actives" value={String(mapStats.pirogues)} detail="Immatriculations visibles." /><StatCard label="Alertes en cours" value={String(mapStats.alerts)} detail="Alertes à vérifier." /><StatCard label="Espèces déclarées" value={String(mapStats.species)} detail="Espèces présentes dans les débarquements." /></div>
    <ShellCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <Field label="Recherche"><input value={search} onChange={(event) => setSearch(event.target.value)} className={inputClass} placeholder="Rechercher un quai ou une pirogue" /></Field>
        <Field label="Région"><select value={region} onChange={(event) => setRegion(event.target.value as RegionFilter)} className={selectClass}><option>{allRegions}</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Quai"><select value={quayId} onChange={(event) => setQuayId(event.target.value)} className={selectClass}><option value={allQuays}>Tous</option>{quays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></Field>
        <Field label="Type"><select value={mapType} onChange={(event) => setMapType(event.target.value as MapItemType)} className={selectClass}>{mapTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Niveau"><select value={level} onChange={(event) => setLevel(event.target.value as LevelFilter)} className={selectClass}>{levelOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Espèce"><select value={species} onChange={(event) => setSpecies(event.target.value)} className={selectClass}><option>{allSpecies}</option>{speciesOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <div className="flex items-end"><button onClick={resetFilters} className={`${secondaryButton} w-full`}>Réinitialiser</button></div>
      </div>
    </ShellCard>
    <div className="grid min-w-0 gap-5">
      <MinistryMap quays={visibleQuays} pirogues={visiblePirogues} alerts={visibleAlerts} selectedId={selected?.id ?? ""} selectedKind={selected?.kind ?? "quay"} onSelectQuay={(id) => setSelected({ kind: "quay", id })} onSelectPirogue={(id) => setSelected({ kind: "pirogue", id })} />
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
  return <section className="grid gap-6">
    <SectionHeader eyebrow="Communautés & programmes" title="Voir les besoins terrain et organiser les actions" description="Cette section est séparée de la carte. Elle sert à suivre les besoins, projets, formations et partenaires liés aux communautés." />
    <ShellCard><SectionHeader eyebrow="Besoins terrain" title="Demandes remontées par les quais et communautés" description="Chaque besoin indique les acteurs concernés, l'urgence, le statut et la prochaine action." /><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{communityNeeds.map((need) => <NeedCard key={need.id} need={need} />)}</div></ShellCard>
    <ShellCard><SectionHeader eyebrow="Projets communautaires" title="Actions à préparer ou à financer" description="Les projets sont décrits avec territoire, porteur, bénéficiaires, budget estimé, statut et partenaire cible." /><div className="grid gap-4 lg:grid-cols-2">{communityProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></ShellCard>
    <ShellCard><SectionHeader eyebrow="Formations & sensibilisation" title="Programmes utiles pour les acteurs terrain" description="Sécurité en mer, hygiène, chaîne de froid, traçabilité, métiers bleus, pêche durable et référents communautaires." /><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{trainingPrograms.map((program) => <TrainingCard key={program.id} program={program} />)}</div></ShellCard>
    <ShellCard><SectionHeader eyebrow="Partenaires" title="Organisations mobilisables" description="ONG, collectivités, bailleurs, entreprises privées, programmes publics et organisations professionnelles." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{partners.map((partner) => <article key={partner.id} className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4"><p className="text-base font-black text-cyan-950">{partner.name}</p><p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{partner.family}</p><p className="mt-3 text-sm font-bold leading-6 text-slate-600">{partner.usefulFor}</p><p className="mt-3 text-xs font-black text-slate-500">{partner.territory}</p></article>)}</div></ShellCard>
  </section>;
}

function TrackingModule() {
  const volumeByQuay = quays.slice(0, 6);
  const maxVolume = Math.max(...volumeByQuay.map((quay) => quay.volumeTons));
  const projectStatuses = ["Prioritaire", "À cadrer", "Documenté", "À compléter"];
  return <section className="grid gap-6">
    <SectionHeader eyebrow="Indicateurs & suivi" title="Suivre les chiffres clés et l'avancement" description="Chaque indicateur est relié à une action ou à un détail opérationnel. L'objectif est de suivre la journée, pas de décorer la page." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{dashboardMetrics.map((metric) => <StatCard key={metric.id} label={metric.label} value={metric.value} detail={metric.detail} action={metric.action} />)}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <ShellCard><SectionHeader eyebrow="Activité de pêche" title="Volumes par quai" description="Lecture simple des volumes déclarés aujourd'hui." /><div className="grid gap-3">{volumeByQuay.map((quay) => <div key={quay.id} className="grid gap-2"><div className="flex justify-between text-sm font-black"><span>{quay.name}</span><span>{quay.volumeTons} t</span></div><div className="h-3 overflow-hidden rounded-full bg-cyan-50"><div className="h-full rounded-full bg-gradient-to-r from-cyan-700 to-emerald-500" style={{ width: `${Math.round((quay.volumeTons / maxVolume) * 100)}%` }} /></div></div>)}</div></ShellCard>
      <ShellCard><SectionHeader eyebrow="Alertes" title="Répartition par niveau" description="Les alertes urgentes doivent déclencher une vérification terrain." /><div className="grid gap-3"><StatusLine label="Urgent" value={mapAlerts.filter((alert) => alert.level === "urgent").length} level="urgent" /><StatusLine label="À surveiller" value={mapAlerts.filter((alert) => alert.level === "surveillance").length} level="surveillance" /><StatusLine label="Normal" value={mapAlerts.filter((alert) => alert.level === "normal").length} level="normal" /></div></ShellCard>
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <ShellCard><SectionHeader eyebrow="Besoins & projets" title="Statut des projets communautaires" description="Suivi rapide des projets à préparer, prioriser ou compléter." /><div className="grid gap-3">{projectStatuses.map((status) => <div key={status} className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-white p-3"><span className="text-sm font-black text-slate-800">{status}</span><span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-black text-cyan-900">{communityProjects.filter((project) => project.status === status).length}</span></div>)}</div></ShellCard>
      <ShellCard><SectionHeader eyebrow="Formations & campagnes" title="Planning des prochaines sessions" description="Sessions à planifier ou confirmer avec les partenaires." /><div className="grid gap-3">{trainingPrograms.slice(0, 5).map((program) => <div key={program.id} className="rounded-2xl border border-cyan-100 bg-white p-3"><p className="text-sm font-black text-slate-950">{program.title}</p><p className="mt-1 text-xs font-bold text-slate-500">{program.region} · {program.period} · {program.expectedParticipants} participants</p></div>)}</div></ShellCard>
    </div>
    <ShellCard><SectionHeader eyebrow="Actions en attente" title="Actions à reprendre cette semaine" description="Liste courte pour que l'agent sache quoi traiter après consultation." /><div className="grid gap-3 lg:grid-cols-2">{pendingActions.map((action) => <article key={action.id} className="rounded-2xl border border-cyan-100 bg-white p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-base font-black text-slate-950">{action.action}</h3><Badge level={action.level} /></div><p className="mt-2 text-sm font-bold text-slate-600">{action.owner} · {action.territory}</p><p className="mt-3 text-xs font-black text-cyan-800">Échéance : {action.dueDate} · {action.status}</p></article>)}</div></ShellCard>
    <ShellCard className="bg-slate-50"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Aide à la synthèse - bientôt</p><p className="mt-2 text-sm font-bold leading-6 text-slate-600">L'assistance IA n'est pas au centre de cette V1. Elle pourra plus tard aider à préparer une synthèse, toujours avec validation humaine.</p></ShellCard>
  </section>;
}

function StatusLine({ label, value, level }: { label: string; value: number; level: Level }) {
  return <div className="flex items-center justify-between rounded-2xl border border-cyan-100 bg-white p-3"><span className="text-sm font-black text-slate-800">{label}</span><Badge level={level}>{String(value)}</Badge></div>;
}
