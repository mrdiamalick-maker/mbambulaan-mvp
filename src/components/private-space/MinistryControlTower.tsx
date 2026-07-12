"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  communityNeeds,
  communityProjects,
  dashboardMetrics,
  getQuayById,
  landings,
  mapAlerts,
  partners,
  pendingActions,
  pirogues,
  quays,
  regions,
  trainingPrograms,
  type ModuleId,
  type Region,
} from "@/data/ministryControlTowerData";
import {
  controlClass,
  EvidenceTimeline,
  Field,
  FilterBar,
  MapWorkspace,
  MetricBlock,
  ObjectInspector,
  Panel,
  PanelHeading,
  primaryActionClass,
  secondaryActionClass,
  StatusPill,
  WorkspaceHeader,
} from "./MinistryControlTowerParts";

type Selection = { kind: "quay" | "pirogue"; id: string };
type MapMode = "quays" | "pirogues";
type RegionFilter = Region | "Toutes";

const workspaces: Array<{ id: ModuleId; number: string; label: string; caption: string }> = [
  { id: "map", number: "01", label: "Atlas maritime", caption: "Observer et vérifier" },
  { id: "community", number: "02", label: "Filière & programmes", caption: "Qualifier et mobiliser" },
  { id: "tracking", number: "03", label: "Pilotage institutionnel", caption: "Arbitrer et transmettre" },
];

const initialTrace = [
  { time: "10:45", title: "Situation consolidée", detail: "8 quais et 5 alertes intégrés à la lecture nationale." },
  { time: "10:18", title: "Vérification demandée", detail: "Retour de pirogue à confirmer à Saint-Louis." },
  { time: "09:58", title: "Signal terrain qualifié", detail: "Besoin de glace documenté à Joal-Fadiouth." },
];

export function MinistryControlTower() {
  const [activeModule, setActiveModule] = useState<ModuleId>("map");
  const [region, setRegion] = useState<RegionFilter>("Toutes");
  const [quayId, setQuayId] = useState("Tous");
  const [mode, setMode] = useState<MapMode>("quays");
  const [selection, setSelection] = useState<Selection>({ kind: "quay", id: "joal" });
  const [trace, setTrace] = useState(initialTrace);
  const [notice, setNotice] = useState("Les données sont simulées. Toute décision reste soumise à validation humaine.");

  const filteredQuays = useMemo(() => quays.filter((quay) => (region === "Toutes" || quay.region === region) && (quayId === "Tous" || quay.id === quayId)), [quayId, region]);
  const quayIds = useMemo(() => new Set(filteredQuays.map((quay) => quay.id)), [filteredQuays]);
  const filteredPirogues = useMemo(() => pirogues.filter((boat) => quayIds.has(boat.quayId)), [quayIds]);
  const filteredLandings = useMemo(() => landings.filter((landing) => quayIds.has(landing.quayId)), [quayIds]);
  const filteredAlerts = useMemo(() => mapAlerts.filter((alert) => quayIds.has(alert.quayId)), [quayIds]);
  const selectedBoat = selection.kind === "pirogue" ? pirogues.find((boat) => boat.id === selection.id) ?? null : null;
  const selectedQuay = selection.kind === "quay" ? getQuayById(selection.id) : selectedBoat ? getQuayById(selectedBoat.quayId) : filteredQuays[0] ?? quays[0];
  const visibleVolume = filteredLandings.reduce((sum, landing) => sum + landing.volumeTons, 0);

  function record(title: string, detail: string) {
    const now = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setTrace((items) => [{ time: now, title, detail }, ...items].slice(0, 6));
    setNotice(`${title} · trace ajoutée au registre de démonstration.`);
  }

  function changeRegion(value: RegionFilter) {
    setRegion(value);
    setQuayId("Tous");
    const next = value === "Toutes" ? quays[0] : quays.find((quay) => quay.region === value) ?? quays[0];
    setSelection({ kind: "quay", id: next.id });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef2f2] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <WorkspaceRail active={activeModule} onChange={setActiveModule} />
        <div className="min-w-0">
          <InstitutionalTopBar notice={notice} onExport={() => record("Synthèse préparée", "Export institutionnel simulé à partir du périmètre actif.")} />
          <div className="min-w-0 p-3 sm:p-4 lg:p-5">
            <div className="mx-auto max-w-[106rem] overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,42,55,.08)]">
              {activeModule === "map" ? <AtlasMaritime region={region} setRegion={changeRegion} quayId={quayId} setQuayId={setQuayId} mode={mode} setMode={setMode} selection={selection} setSelection={setSelection} quaysVisible={filteredQuays} boatsVisible={filteredPirogues} landingsVisible={filteredLandings} alertsVisible={filteredAlerts} selectedQuay={selectedQuay} selectedBoat={selectedBoat} volume={visibleVolume} record={record} trace={trace} /> : null}
              {activeModule === "community" ? <FiliereProgrammes record={record} trace={trace} /> : null}
              {activeModule === "tracking" ? <PilotageInstitutionnel record={record} trace={trace} /> : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function WorkspaceRail({ active, onChange }: { active: ModuleId; onChange: (module: ModuleId) => void }) {
  return <aside className="border-b border-white/10 bg-[#062330] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5"><Link href="/" className="grid h-9 w-9 place-items-center border border-white/20 bg-white text-xs font-black text-[#062330]">Mb</Link><div><p className="font-semibold">Mbàmbulaan</p><p className="text-[10px] uppercase tracking-[0.13em] text-slate-300">Coordination maritime</p></div></div>
      <div className="border-b border-white/10 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Organisation</p><p className="mt-2 text-sm font-semibold">Ministère des Pêches</p><p className="mt-1 text-xs text-slate-400">Démonstration nationale</p></div>
      <nav className="flex gap-2 overflow-x-auto p-3 lg:grid lg:gap-1 lg:overflow-visible lg:p-3">
        {workspaces.map((workspace) => <button key={workspace.id} onClick={() => onChange(workspace.id)} className={`min-w-[13rem] border-l-2 px-4 py-3 text-left transition lg:min-w-0 ${active === workspace.id ? "border-[#66c5c9] bg-white/10" : "border-transparent hover:bg-white/5"}`}><span className={`text-[10px] font-bold ${active === workspace.id ? "text-[#8ed8d5]" : "text-slate-500"}`}>{workspace.number}</span><span className="mt-1 block text-sm font-semibold">{workspace.label}</span><span className="mt-1 block text-[11px] text-slate-400">{workspace.caption}</span></button>)}
      </nav>
      <div className="mt-auto hidden border-t border-white/10 p-4 lg:block"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Cadre de confiance</p><p className="mt-2 text-xs leading-5 text-slate-400">Simulation sur données locales. Les agents vérifient, documentent et valident.</p><Link href="/espace-prive" className="mt-4 inline-flex text-xs font-bold text-[#8ed8d5]">Quitter l’espace →</Link></div>
    </div>
  </aside>;
}

function InstitutionalTopBar({ notice, onExport }: { notice: string; onExport: () => void }) {
  return <header className="border-b border-slate-200 bg-white"><div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0f6b7a]">Situation nationale · 12 juillet 2026</p><p className="truncate text-sm font-semibold text-slate-600">{notice}</p></div><div className="flex gap-2"><button onClick={onExport} className={primaryActionClass}>Préparer la synthèse</button><Link href="/espace-prive" className={secondaryActionClass}>Accès</Link></div></div></header>;
}

function AtlasMaritime({ region, setRegion, quayId, setQuayId, mode, setMode, selection, setSelection, quaysVisible, boatsVisible, landingsVisible, alertsVisible, selectedQuay, selectedBoat, volume, record, trace }: {
  region: RegionFilter; setRegion: (value: RegionFilter) => void; quayId: string; setQuayId: (value: string) => void;
  mode: MapMode; setMode: (value: MapMode) => void; selection: Selection; setSelection: (value: Selection) => void;
  quaysVisible: typeof quays; boatsVisible: typeof pirogues; landingsVisible: typeof landings; alertsVisible: typeof mapAlerts;
  selectedQuay: typeof quays[number]; selectedBoat: typeof pirogues[number] | null; volume: number; record: (title: string, detail: string) => void; trace: typeof initialTrace;
}) {
  const selectedLandings = landingsVisible.filter((item) => item.quayId === selectedQuay.id);
  const selectedAlerts = alertsVisible.filter((item) => item.quayId === selectedQuay.id);
  const rows: Array<[string, string]> = selectedBoat ? [
    ["Quai rattaché", selectedQuay.name], ["Position", selectedBoat.lastPosition], ["Déclaration", selectedBoat.lastDeclaration], ["Activité", selectedBoat.declaredActivity],
  ] : [
    ["Région", selectedQuay.region], ["Débarquements", String(selectedLandings.length)], ["Volume déclaré", `${selectedLandings.reduce((sum, item) => sum + item.volumeTons, 0).toFixed(1)} t`], ["Pirogues actives", String(selectedQuay.activePirogues)], ["Espèces", selectedQuay.species.join(", ")],
  ];
  return <>
    <WorkspaceHeader eyebrow="Espace 01 · Observation littorale" title="Atlas maritime" description="Localiser l’activité, vérifier un signal et engager l’action appropriée depuis une lecture géographique commune.">
      <button onClick={() => setMode("quays")} className={mode === "quays" ? primaryActionClass : secondaryActionClass}>Vue quais</button>
      <button onClick={() => { setMode("pirogues"); const boat = boatsVisible[0]; if (boat) setSelection({ kind: "pirogue", id: boat.id }); }} className={mode === "pirogues" ? primaryActionClass : secondaryActionClass}>Vue pirogues</button>
    </WorkspaceHeader>
    <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4"><MetricBlock label="Périmètre" value={region === "Toutes" ? "National" : region} detail={`${quaysVisible.length} quais actifs`} /><MetricBlock label="Volume visible" value={`${volume.toFixed(1)} t`} detail="Débarquements déclarés" tone="lagoon" /><MetricBlock label="Pirogues suivies" value={String(boatsVisible.length)} detail="Positions déclaratives" tone="sand" /><MetricBlock label="Alertes ouvertes" value={String(alertsVisible.length)} detail="Vérification requise" tone={alertsVisible.length ? "alert" : "ocean"} /></div>
    <FilterBar><Field label="Région"><select value={region} onChange={(event) => setRegion(event.target.value as RegionFilter)} className={controlClass}><option>Toutes</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Quai"><select value={quayId} onChange={(event) => { setQuayId(event.target.value); if (event.target.value !== "Tous") setSelection({ kind: "quay", id: event.target.value }); }} className={controlClass}><option>Tous</option>{quays.filter((quay) => region === "Toutes" || quay.region === region).map((quay) => <option value={quay.id} key={quay.id}>{quay.name}</option>)}</select></Field><div className="ml-auto flex items-center gap-3 py-2 text-[11px] font-semibold text-slate-500"><span className="text-emerald-700">● Normal</span><span className="text-amber-700">● Vigilance</span><span className="text-red-700">● Urgent</span></div></FilterBar>
    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <MapWorkspace mode={mode} quays={quaysVisible} pirogues={boatsVisible} landings={landingsVisible} alerts={alertsVisible} selectedKind={selection.kind} selectedId={selection.id} onSelectQuay={(id) => setSelection({ kind: "quay", id })} onSelectPirogue={(id) => setSelection({ kind: "pirogue", id })} />
      <aside className="min-w-0 border-t border-slate-200 xl:border-l xl:border-t-0"><ObjectInspector title={selectedBoat?.registration ?? selectedQuay.name} subtitle={selectedBoat ? selectedBoat.status : `${selectedQuay.commune} · actualisé à ${selectedQuay.lastUpdated}`} level={selectedBoat?.level ?? selectedQuay.level} rows={rows} actions={[{ label: "Demander une vérification", primary: true, onClick: () => record("Vérification demandée", selectedBoat?.registration ?? selectedQuay.name) }, { label: "Créer une alerte", onClick: () => record("Alerte créée", `Signal associé à ${selectedQuay.name}`) }, { label: "Exporter cette zone", onClick: () => record("Zone exportée", selectedQuay.name) }]} /><Panel className="border-x-0 border-b-0"><PanelHeading eyebrow="Décision" title="Prochaine action" /><div className="p-4">{selectedAlerts.length ? selectedAlerts.map((alert) => <div key={alert.id} className="mb-3 border-l-2 border-amber-500 bg-amber-50 p-3"><p className="text-xs font-bold text-amber-950">{alert.title}</p><p className="mt-1 text-[11px] leading-4 text-amber-800">{alert.nextAction}</p></div>) : <p className="text-xs leading-5 text-slate-500">Aucune alerte ouverte. Maintenir la veille terrain.</p>}</div></Panel><Panel className="border-x-0 border-b-0"><PanelHeading eyebrow="Registre" title="Traces récentes" /><EvidenceTimeline items={trace.slice(0, 3)} /></Panel></aside>
    </div>
  </>;
}

function FiliereProgrammes({ record, trace }: { record: (title: string, detail: string) => void; trace: typeof initialTrace }) {
  const stages = [{ label: "Signals reçus", value: communityNeeds.length }, { label: "Qualifiés", value: 4 }, { label: "Programmes", value: communityProjects.length }, { label: "Partenaires", value: partners.length }, { label: "Bénéficiaires", value: communityProjects.reduce((sum, item) => sum + item.beneficiaries, 0) }];
  return <>
    <WorkspaceHeader eyebrow="Espace 02 · Transformation du signal" title="Filière & programmes" description="Passer d’un besoin remonté par le terrain à une réponse qualifiée, financée, suivie et documentée."><button onClick={() => record("Fiche action créée", "Nouveau cadrage ouvert depuis la file des besoins.")} className={primaryActionClass}>Créer une fiche action</button></WorkspaceHeader>
    <div className="grid border-b border-slate-200 sm:grid-cols-5">{stages.map((stage, index) => <div key={stage.label} className="relative border-b border-slate-100 px-4 py-4 sm:border-b-0 sm:border-r"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">0{index + 1} · {stage.label}</p><p className="mt-2 text-2xl font-semibold text-[#062330]">{stage.value}</p></div>)}</div>
    <div className="grid min-w-0 xl:grid-cols-[19rem_minmax(0,1fr)_21rem]">
      <Panel className="border-0 border-r"><PanelHeading eyebrow="File terrain" title="Besoins à qualifier" />{communityNeeds.map((need) => <button key={need.id} onClick={() => record("Besoin sélectionné", `${need.need} · ${need.place}`)} className="block w-full border-b border-slate-100 px-4 py-4 text-left hover:bg-[#f5faf9]"><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold text-[#102a43]">{need.need}</p><StatusPill level={need.urgency} /></div><p className="mt-2 text-xs text-slate-500">{need.place} · {need.actors}</p><p className="mt-2 text-[11px] font-semibold text-[#0f6b7a]">{need.nextAction} →</p></button>)}</Panel>
      <Panel className="border-0 border-r"><PanelHeading eyebrow="Programmes" title="Réponses en structuration" /><div className="overflow-x-auto"><table className="w-full min-w-[42rem] border-collapse text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Programme</th><th className="px-4 py-3">Territoire</th><th className="px-4 py-3">Partenaire</th><th className="px-4 py-3">Budget</th><th className="px-4 py-3">État</th></tr></thead><tbody className="divide-y divide-slate-100">{communityProjects.map((project) => <tr key={project.id} className="hover:bg-[#f5faf9]"><td className="px-4 py-4 font-bold text-[#102a43]">{project.project}</td><td className="px-4 py-4">{project.territory}</td><td className="px-4 py-4">{project.targetPartner}</td><td className="px-4 py-4 font-semibold">{project.estimatedBudget}</td><td className="px-4 py-4"><button onClick={() => record("Programme priorisé", project.project)} className="font-bold text-[#0f6b7a]">{project.status} →</button></td></tr>)}</tbody></table></div><PanelHeading eyebrow="Renforcement" title="Formations programmables" /><div className="grid gap-px bg-slate-100 sm:grid-cols-2">{trainingPrograms.map((program) => <div key={program.id} className="bg-white p-4"><p className="text-sm font-bold text-[#102a43]">{program.title}</p><p className="mt-1 text-xs text-slate-500">{program.region} · {program.expectedParticipants} participants</p><p className="mt-3 text-[11px] font-semibold text-[#0f6b7a]">{program.status}</p></div>)}</div></Panel>
      <aside><Panel className="border-0 border-b"><PanelHeading eyebrow="Mobilisation" title="Partenaires activables" />{partners.map((partner) => <div key={partner.id} className="border-b border-slate-100 px-4 py-3"><p className="text-xs font-bold text-[#102a43]">{partner.name}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{partner.usefulFor}</p></div>)}</Panel><Panel className="border-0"><PanelHeading eyebrow="Preuve" title="Dernières traces" /><EvidenceTimeline items={trace.slice(0, 4)} /></Panel></aside>
    </div>
  </>;
}

function PilotageInstitutionnel({ record, trace }: { record: (title: string, detail: string) => void; trace: typeof initialTrace }) {
  const totalVolume = quays.reduce((sum, quay) => sum + quay.volumeTons, 0);
  const maxVolume = Math.max(...quays.map((quay) => quay.volumeTons));
  return <>
    <WorkspaceHeader eyebrow="Espace 03 · Décision publique" title="Pilotage institutionnel" description="Lire la situation du jour, isoler les risques, suivre les décisions et produire une synthèse transmissible."><button onClick={() => record("Note d’arbitrage préparée", "Synthèse simulée soumise à validation humaine.")} className={primaryActionClass}>Préparer une note</button></WorkspaceHeader>
    <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4"><MetricBlock label="Volume suivi" value={`${totalVolume.toFixed(1)} t`} detail="8 quais consolidés" /><MetricBlock label="Alertes urgentes" value={String(mapAlerts.filter((item) => item.level === "urgent").length)} detail="Décision attendue" tone="alert" /><MetricBlock label="Programmes actifs" value={String(communityProjects.length)} detail="4 territoires" tone="lagoon" /><MetricBlock label="Actions en retard" value="3" detail="À reprendre cette semaine" tone="sand" /></div>
    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
      <div className="min-w-0 border-r border-slate-200"><Panel className="border-0 border-b"><PanelHeading eyebrow="Situation du jour" title="Volumes déclarés par quai" /><div className="grid gap-4 p-5">{quays.map((quay) => <div key={quay.id} className="grid grid-cols-[8rem_minmax(0,1fr)_4rem] items-center gap-3"><span className="truncate text-xs font-semibold text-slate-700">{quay.name}</span><div className="h-2 overflow-hidden bg-slate-100"><div className="h-full bg-[#0f6b7a]" style={{ width: `${Math.round((quay.volumeTons / maxVolume) * 100)}%` }} /></div><span className="text-right text-xs font-bold text-[#062330]">{quay.volumeTons} t</span></div>)}</div></Panel><Panel className="border-0"><PanelHeading eyebrow="Opérations" title="Débarquements récents" /><div className="overflow-x-auto"><table className="w-full min-w-[38rem] border-collapse text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Heure</th><th className="px-4 py-3">Quai</th><th className="px-4 py-3">Espèces</th><th className="px-4 py-3">Volume</th><th className="px-4 py-3">État</th></tr></thead><tbody className="divide-y divide-slate-100">{landings.map((landing) => <tr key={landing.id}><td className="px-4 py-4 font-bold">{landing.time}</td><td className="px-4 py-4">{getQuayById(landing.quayId).name}</td><td className="px-4 py-4">{landing.species.join(", ")}</td><td className="px-4 py-4 font-bold">{landing.volumeTons} t</td><td className="px-4 py-4 text-[#0f6b7a]">{landing.status}</td></tr>)}</tbody></table></div></Panel></div>
      <aside className="min-w-0"><Panel className="border-0 border-b"><PanelHeading eyebrow="Priorités" title="Actions à engager" />{pendingActions.map((action) => <button key={action.id} onClick={() => record("Action engagée", action.action)} className="block w-full border-b border-slate-100 px-4 py-4 text-left hover:bg-[#f5faf9]"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold leading-5 text-[#102a43]">{action.action}</p><StatusPill level={action.level} /></div><p className="mt-2 text-[11px] text-slate-500">{action.owner} · {action.dueDate}</p></button>)}</Panel><Panel className="border-0"><PanelHeading eyebrow="Traçabilité" title="Registre de décision" /><EvidenceTimeline items={trace} /></Panel></aside>
    </div>
  </>;
}
