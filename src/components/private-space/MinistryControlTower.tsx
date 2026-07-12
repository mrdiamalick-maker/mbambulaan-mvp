"use client";

import { useMemo, useState } from "react";
import {
  communityNeeds,
  communityProjects,
  getQuayById,
  landings,
  mapAlerts,
  partners,
  pendingActions,
  pirogues,
  quays,
  type Level,
  type Region,
} from "@/data/ministryControlTowerData";
import {
  ActionRegister,
  AppShell,
  ContextPanel,
  DataTable,
  DecisionPanel,
  EvidenceTimeline,
  ExportPanel,
  FilterField,
  FilterStrip,
  inputClass,
  MapCanvas,
  MetricRow,
  MobileWorkspaceNav,
  NavigationRail,
  primaryButton,
  ProgramPipeline,
  StatusBadge,
  TopBar,
  WorkflowBoard,
  WorkspaceHeader,
  type MapLayerId,
  type WorkspaceId,
} from "./MinistryControlTowerParts";

type Selection = { kind: "quay" | "pirogue"; id: string } | null;
type Scope = "Nationale" | Region;

const initialEvidence = [
  { time: "10:45", title: "Consolidation nationale", detail: "Quais, débarquements et alertes regroupés dans la situation du jour." },
  { time: "10:18", title: "Signal transmis", detail: "Retour de pirogue à confirmer par la cellule locale de Saint-Louis." },
  { time: "09:58", title: "Besoin qualifié", detail: "Besoin de glace documenté par le relais de Joal-Fadiouth." },
  { time: "09:35", title: "Incident rattaché", detail: "Panne de froid de Mbour reliée au programme de maintenance." },
];

export function MinistryControlTower() {
  const [workspace, setWorkspace] = useState<WorkspaceId>("map");
  const [scope, setScope] = useState<Scope>("Nationale");
  const [evidence, setEvidence] = useState(initialEvidence);
  const [systemNotice, setSystemNotice] = useState("Dernière synchronisation · 10:45");

  function record(title: string, detail: string) {
    const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setEvidence((items) => [{ time, title, detail }, ...items].slice(0, 8));
    setSystemNotice(`${title} · action tracée`);
  }

  function exportScope() {
    record("Export préparé", `Périmètre ${scope} · validation humaine requise avant transmission.`);
  }

  return <AppShell topBar={<TopBar notice={systemNotice} onExport={exportScope} />} rail={<NavigationRail active={workspace} onChange={setWorkspace} />}>
    <MobileWorkspaceNav active={workspace} onChange={setWorkspace} />
    {workspace === "map" ? <AtlasMaritime scope={scope} setScope={setScope} evidence={evidence} record={record} onExport={exportScope} /> : null}
    {workspace === "community" ? <FiliereProgrammes scope={scope} setScope={setScope} evidence={evidence} record={record} onExport={exportScope} /> : null}
    {workspace === "tracking" ? <PilotageInstitutionnel scope={scope} setScope={setScope} evidence={evidence} record={record} onExport={exportScope} /> : null}
  </AppShell>;
}

function AtlasMaritime({ scope, setScope, evidence, record, onExport }: { scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; record: (title: string, detail: string) => void; onExport: () => void }) {
  const [mode, setMode] = useState<"quays" | "pirogues">("quays");
  const [quayFilter, setQuayFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState<"Tous" | Level>("Tous");
  const [period, setPeriod] = useState("Aujourd’hui");
  const [selection, setSelection] = useState<Selection>(null);
  const [layers, setLayers] = useState<Record<MapLayerId, boolean>>({ quays: true, pirogues: true, landings: true, alerts: true });

  const visibleQuays = useMemo(() => quays.filter((quay) => (scope === "Nationale" || quay.region === scope) && (quayFilter === "Tous" || quay.id === quayFilter) && (statusFilter === "Tous" || quay.level === statusFilter)), [quayFilter, scope, statusFilter]);
  const quayIds = useMemo(() => new Set(visibleQuays.map((quay) => quay.id)), [visibleQuays]);
  const visiblePirogues = useMemo(() => pirogues.filter((boat) => quayIds.has(boat.quayId) && (statusFilter === "Tous" || boat.level === statusFilter)), [quayIds, statusFilter]);
  const visibleLandings = useMemo(() => landings.filter((landing) => quayIds.has(landing.quayId)), [quayIds]);
  const visibleAlerts = useMemo(() => mapAlerts.filter((alert) => quayIds.has(alert.quayId) && (statusFilter === "Tous" || alert.level === statusFilter)), [quayIds, statusFilter]);

  const selectedBoat = selection?.kind === "pirogue" ? pirogues.find((boat) => boat.id === selection.id) ?? null : null;
  const selectedQuay = selection?.kind === "quay" ? quays.find((quay) => quay.id === selection.id) ?? null : selectedBoat ? getQuayById(selectedBoat.quayId) : null;
  const selectedLandings = selectedQuay ? landings.filter((landing) => landing.quayId === selectedQuay.id) : [];
  const selectedAlerts = selectedQuay ? mapAlerts.filter((alert) => alert.quayId === selectedQuay.id) : [];
  const totalVolume = visibleLandings.reduce((sum, landing) => sum + landing.volumeTons, 0);

  function toggleLayer(layer: MapLayerId) {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }

  function changeScope(next: string) {
    setScope(next as Scope);
    setQuayFilter("Tous");
    setSelection(null);
  }

  const contextRows: Array<[string, string]> = selectedBoat ? [
    ["Immatriculation", selectedBoat.registration],
    ["Quai rattaché", selectedQuay?.name ?? "—"],
    ["Position", selectedBoat.lastPosition],
    ["Déclaration", selectedBoat.lastDeclaration],
    ["Activité", selectedBoat.declaredActivity],
  ] : selectedQuay ? [
    ["Région", selectedQuay.region],
    ["Commune", selectedQuay.commune],
    ["Débarquements", String(selectedLandings.length)],
    ["Volume déclaré", `${selectedLandings.reduce((sum, item) => sum + item.volumeTons, 0).toFixed(1)} t`],
    ["Pirogues actives", String(selectedQuay.activePirogues)],
    ["Espèces", selectedQuay.species.join(", ")],
  ] : [];

  return <section className="min-h-full">
    <WorkspaceHeader title="Atlas maritime" question="Que se passe-t-il sur le littoral et en mer ?" scope={scope} onScopeChange={changeScope} onExport={onExport} />
    <FilterStrip>
      <div className="flex rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-0.5">
        <button onClick={() => setMode("quays")} className={`h-8 rounded-[2px] px-3 text-[11px] font-bold ${mode === "quays" ? "bg-[var(--mb-navy-700)] text-white" : "text-[var(--mb-neutral-600)]"}`}>Vue quais</button>
        <button onClick={() => setMode("pirogues")} className={`h-8 rounded-[2px] px-3 text-[11px] font-bold ${mode === "pirogues" ? "bg-[var(--mb-navy-700)] text-white" : "text-[var(--mb-neutral-600)]"}`}>Vue pirogues</button>
      </div>
      <FilterField label="Quai"><select value={quayFilter} onChange={(event) => { setQuayFilter(event.target.value); setSelection(event.target.value === "Tous" ? null : { kind: "quay", id: event.target.value }); }} className={inputClass}><option>Tous</option>{quays.filter((quay) => scope === "Nationale" || quay.region === scope).map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></FilterField>
      <FilterField label="Statut"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "Tous" | Level)} className={inputClass}><option>Tous</option><option value="normal">Vérifié</option><option value="surveillance">Vigilance</option><option value="urgent">Critique</option></select></FilterField>
      <FilterField label="Période"><select value={period} onChange={(event) => setPeriod(event.target.value)} className={inputClass}><option>Aujourd’hui</option><option>7 derniers jours</option><option>30 derniers jours</option></select></FilterField>
      <div className="ml-auto flex items-center gap-3 px-1 font-mono text-[9px] text-[var(--mb-neutral-600)]"><span>{visibleQuays.length} QUAIS</span><span>{visiblePirogues.length} PIROGUES</span><span>{totalVolume.toFixed(1)} T</span></div>
    </FilterStrip>

    <div className="grid min-h-[calc(100vh-201px)] min-w-0 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-rows-[minmax(430px,1fr)_150px]">
      <div className="min-h-0 border-b border-[var(--mb-neutral-200)] xl:border-r"><MapCanvas mode={mode} layers={layers} onToggleLayer={toggleLayer} quays={visibleQuays} pirogues={visiblePirogues} landings={visibleLandings} alerts={visibleAlerts} selection={selection} onSelectQuay={(id) => setSelection({ kind: "quay", id })} onSelectPirogue={(id) => setSelection({ kind: "pirogue", id })} /></div>
      <div className="min-h-0 xl:row-span-2"><ContextPanel empty={!selection || !selectedQuay} title={selectedBoat?.registration ?? selectedQuay?.name ?? ""} subtitle={selectedBoat ? selectedBoat.status : selectedQuay ? `Dernier signal · ${selectedQuay.lastUpdated}` : ""} level={selectedBoat?.level ?? selectedQuay?.level} rows={contextRows} actions={[
        { label: "Vérifier", primary: true, onClick: () => record("Vérification demandée", selectedBoat?.registration ?? selectedQuay?.name ?? "") },
        { label: "Créer une alerte", onClick: () => record("Alerte créée", `${selectedQuay?.name ?? ""} · ${selectedAlerts[0]?.title ?? "signal à documenter"}`) },
        { label: "Ouvrir la fiche complète", onClick: () => record("Fiche consultée", selectedBoat?.registration ?? selectedQuay?.name ?? "") },
        { label: "Exporter la zone", onClick: onExport },
      ]} /></div>
      <div className="min-h-0 overflow-auto bg-white xl:border-r"><div className="flex h-9 items-center justify-between border-b border-[var(--mb-neutral-200)] px-3"><h3 className="text-[11px] font-bold text-[var(--mb-navy-900)]">Registre d’événements</h3><span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">{period}</span></div><EvidenceTimeline items={evidence.slice(0, 4)} /></div>
    </div>
  </section>;
}

type WorkflowItem = { id: string; title: string; detail: string; level?: Level; kind: string; owner: string; territory: string; next: string };

function FiliereProgrammes({ scope, setScope, evidence, record, onExport }: { scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; record: (title: string, detail: string) => void; onExport: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>("need-3");
  const needItems: WorkflowItem[] = communityNeeds.filter((need) => scope === "Nationale" || need.region === scope).map((need) => ({ id: need.id, title: need.need, detail: `${need.place} · ${need.status}`, level: need.urgency, kind: "Signal terrain", owner: need.actors, territory: need.place, next: need.nextAction }));
  const qualified: WorkflowItem[] = needItems.slice(0, 3).map((item, index) => ({ ...item, id: `qual-${index}`, kind: "Qualification", detail: index === 0 ? "Preuve terrain reçue" : "Vérification en cours", next: "Qualifier" }));
  const programItems: WorkflowItem[] = communityProjects.filter((project) => scope === "Nationale" || project.territory.includes(scope)).map((project) => ({ id: project.id, title: project.project, detail: `${project.territory} · ${project.status}`, kind: "Programme", owner: project.owner, territory: project.territory, next: project.nextAction }));
  const partnerItems: WorkflowItem[] = partners.slice(0, 3).map((partner) => ({ id: partner.id, title: partner.name, detail: partner.usefulFor, kind: "Partenaire", owner: partner.family, territory: partner.territory, next: "Mobiliser" }));
  const actionItems: WorkflowItem[] = pendingActions.slice(0, 3).map((action) => ({ id: action.id, title: action.action, detail: `${action.owner} · ${action.dueDate}`, level: action.level, kind: "Action", owner: action.owner, territory: action.territory, next: "Exécuter" }));
  const impactItems: WorkflowItem[] = communityProjects.slice(0, 2).map((project) => ({ id: `impact-${project.id}`, title: `${project.beneficiaries} acteurs ciblés`, detail: project.project, kind: "Impact", owner: project.owner, territory: project.territory, next: "Documenter la preuve" }));
  const columns = [
    { id: "signals", title: "Signal terrain", items: needItems },
    { id: "qualification", title: "Qualification", items: qualified },
    { id: "program", title: "Programme", items: programItems },
    { id: "partner", title: "Partenaire", items: partnerItems },
    { id: "action", title: "Action", items: actionItems },
    { id: "impact", title: "Impact", items: impactItems },
  ];
  const allItems = columns.flatMap((column) => column.items);
  const selected = allItems.find((item) => item.id === selectedId) ?? null;
  const programs = communityProjects.map((project, index) => ({ id: project.id, title: project.project, territory: project.territory, partner: project.targetPartner, progress: [35, 68, 82, 44][index] ?? 50, due: ["30 j", "12 j", "7 j", "45 j"][index] ?? "30 j" }));

  return <section className="min-h-full">
    <WorkspaceHeader title="Filière & programmes" question="Comment transformer un signal terrain en programme et impact ?" scope={scope} onScopeChange={(value) => setScope(value as Scope)} onExport={onExport} />
    <MetricRow metrics={[
      { label: "Signaux ouverts", value: String(needItems.length), detail: "Remontées terrain" },
      { label: "À qualifier", value: String(qualified.length), detail: "Vérification attendue", level: "surveillance" },
      { label: "Programmes actifs", value: String(programItems.length), detail: "Réponses structurées" },
      { label: "Acteurs ciblés", value: String(communityProjects.reduce((sum, item) => sum + item.beneficiaries, 0)), detail: "Impact estimé" },
    ]} />
    <div className="grid min-h-[calc(100vh-234px)] min-w-0 xl:grid-cols-[minmax(0,1fr)_330px] xl:grid-rows-[minmax(310px,1fr)_220px]">
      <div className="min-w-0 overflow-x-auto border-b border-[var(--mb-neutral-200)] xl:border-r"><div className="flex h-9 items-center justify-between bg-white px-3"><h3 className="text-[11px] font-bold text-[var(--mb-navy-900)]">Flux de coordination</h3><button onClick={() => record("Signal qualifié", selected?.title ?? "Élément sélectionné")} className={primaryButton}>Qualifier</button></div><WorkflowBoard columns={columns} selectedId={selectedId} onSelect={setSelectedId} /></div>
      <div className="min-h-0 xl:row-span-2"><ContextPanel empty={!selected} title={selected?.title ?? ""} subtitle={selected ? `${selected.kind} · ${selected.territory}` : ""} level={selected?.level} rows={selected ? [["Responsable", selected.owner], ["Territoire", selected.territory], ["Étape", selected.kind], ["Prochaine action", selected.next]] : []} actions={[
        { label: selected?.kind === "Signal terrain" ? "Qualifier" : "Valider l’étape", primary: true, onClick: () => record("Étape validée", selected?.title ?? "") },
        { label: "Réassigner", onClick: () => record("Responsable réassigné", selected?.title ?? "") },
        { label: "Rattacher une preuve", onClick: () => record("Preuve rattachée", selected?.title ?? "") },
      ]} /></div>
      <div className="grid min-h-0 overflow-auto bg-white xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)] xl:border-r">
        <section className="border-b border-[var(--mb-neutral-200)] xl:border-b-0 xl:border-r"><div className="flex h-9 items-center border-b border-[var(--mb-neutral-200)] px-3"><h3 className="text-[11px] font-bold">Programmes actifs</h3></div><ProgramPipeline programs={programs} onSelect={setSelectedId} /></section>
        <div className="grid content-start gap-2 p-2"><DecisionPanel items={needItems.slice(0, 2).map((item) => ({ id: item.id, title: item.title, detail: item.next, level: item.level ?? "normal", action: "Arbitrer", onAction: () => record("Arbitrage enregistré", item.title) }))} /><section className="border border-[var(--mb-neutral-200)]"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Registre de preuve</div><EvidenceTimeline items={evidence.slice(0, 3)} /></section></div>
      </div>
    </div>
  </section>;
}

function PilotageInstitutionnel({ scope, setScope, evidence, record, onExport }: { scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; record: (title: string, detail: string) => void; onExport: () => void }) {
  const scopedQuays = quays.filter((quay) => scope === "Nationale" || quay.region === scope);
  const scopedIds = new Set(scopedQuays.map((quay) => quay.id));
  const scopedLandings = landings.filter((landing) => scopedIds.has(landing.quayId));
  const scopedAlerts = mapAlerts.filter((alert) => scopedIds.has(alert.quayId));
  const totalVolume = scopedQuays.reduce((sum, quay) => sum + quay.volumeTons, 0);
  const mapLayers: Record<MapLayerId, boolean> = { quays: true, pirogues: false, landings: false, alerts: true };
  const tableRows = scopedQuays.map((quay) => ({ id: quay.id, cells: [<strong key="name">{quay.name}</strong>, quay.region, <span key="volume" className="font-mono">{quay.volumeTons.toFixed(1)} t</span>, <span key="boats" className="font-mono">{quay.activePirogues}</span>, <StatusBadge key="status" level={quay.level} />] }));
  const decisions = scopedAlerts.slice(0, 3).map((alert) => ({ id: alert.id, title: alert.title, detail: `${getQuayById(alert.quayId).name} · ${alert.nextAction}`, level: alert.level, action: "Arbitrer", onAction: () => record("Arbitrage enregistré", alert.title) }));

  return <section className="min-h-full">
    <WorkspaceHeader title="Pilotage institutionnel" question="Quelle décision prendre aujourd’hui ?" scope={scope} onScopeChange={(value) => setScope(value as Scope)} onExport={onExport} />
    <MetricRow metrics={[
      { label: "Volume débarqué", value: `${totalVolume.toFixed(1)} t`, detail: "Déclarations consolidées" },
      { label: "Quais actifs", value: String(scopedQuays.length), detail: "Périmètre sélectionné" },
      { label: "Alertes critiques", value: String(scopedAlerts.filter((item) => item.level === "urgent").length), detail: "Action immédiate", level: "urgent" },
      { label: "Programmes en cours", value: String(communityProjects.length), detail: "Suivi interterritorial" },
    ]} />
    <div className="grid min-w-0 gap-2 bg-[var(--mb-neutral-100)] p-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,.65fr)]">
      <div className="grid min-w-0 gap-2">
        <section className="grid min-h-[290px] border border-[var(--mb-neutral-200)] bg-white lg:grid-cols-[minmax(17rem,.7fr)_minmax(0,1.3fr)]">
          <div className="min-h-[260px] border-b border-[var(--mb-neutral-200)] lg:border-b-0 lg:border-r"><MapCanvas mode="quays" layers={mapLayers} onToggleLayer={() => undefined} quays={scopedQuays} pirogues={[]} landings={[]} alerts={scopedAlerts} selection={null} onSelectQuay={(id) => record("Quai consulté", getQuayById(id).name)} onSelectPirogue={() => undefined} /></div>
          <div className="min-w-0"><div className="flex h-9 items-center justify-between border-b border-[var(--mb-neutral-200)] px-3"><h3 className="text-[11px] font-bold">Volumes et activité par quai</h3><span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">TRI · VOLUME</span></div><DataTable headers={["Quai", "Région", "Volume", "Pirogues", "État"]} rows={tableRows} onRowClick={(id) => record("Quai consulté", getQuayById(id).name)} /></div>
        </section>
        <section className="border border-[var(--mb-red-600)]/25 bg-[var(--mb-red-600)]/5"><div className="flex h-9 items-center justify-between border-b border-[var(--mb-red-600)]/20 px-3"><h3 className="text-[11px] font-bold text-[var(--mb-red-600)]">Alertes critiques</h3><span className="font-mono text-[10px] text-[var(--mb-red-600)]">{scopedAlerts.length} OUVERTES</span></div><DataTable headers={["Alerte", "Quai", "Source", "Actualisation", "Action requise"]} rows={scopedAlerts.map((alert) => ({ id: alert.id, cells: [<span key="alert" className="font-semibold">{alert.title}</span>, getQuayById(alert.quayId).name, alert.source, <span key="time" className="font-mono">{alert.updatedAt}</span>, <button key="action" onClick={() => record("Alerte traitée", alert.title)} className="font-bold text-[var(--mb-ocean-600)]">Vérifier</button>] }))} /></section>
        <ExportPanel onExport={onExport} />
      </div>
      <aside className="grid content-start gap-2">
        <DecisionPanel title="Actions prioritaires" items={decisions} />
        <section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Registre des actions</div><ActionRegister items={pendingActions.map((item) => ({ id: item.id, action: item.action, owner: item.owner, due: item.dueDate, level: item.level }))} onAction={(id) => record("Action mise à jour", pendingActions.find((item) => item.id === id)?.action ?? id)} /></section>
        <section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Registre de preuve</div><EvidenceTimeline items={evidence.slice(0, 5)} /></section>
      </aside>
    </div>
  </section>;
}
