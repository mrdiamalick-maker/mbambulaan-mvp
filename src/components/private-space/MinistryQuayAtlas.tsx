"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getQuayActivitySnapshot,
  pirogues,
  quays,
  type MapAlert,
  type Pirogue,
  type Quay,
  type Region,
} from "@/data/ministryControlTowerData";
import { maritimeIncidents, type GeneratedArtifact, type VerificationTask, type WorkflowKind, type ZoneReportRecord } from "@/data/ministryValueJourneyData";
import type { DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { DataTrustBadge, FilterField, FilterStrip, inputClass, StatusBadge, WorkspaceHeader } from "./MinistryControlTowerParts";
import { QuayProfileSheet, type SelectedAtlasEntity } from "./QuayProfileSheet";
import type { WorkflowContext } from "./MinistryValueWorkflows";

type Scope = "Nationale" | Region;
type AtlasMode = "quays" | "sea";

type Props = {
  scope: Scope;
  focusQuayId?: string | null;
  setScope: (scope: Scope) => void;
  artifacts: GeneratedArtifact[];
  alerts: MapAlert[];
  verifiedIds: string[];
  verificationTasks: VerificationTask[];
  zoneReports: ZoneReportRecord[];
  operationalDossiers: DossierOperationnel[];
  onOpenDossier: (dossier: DossierOperationnel) => void;
  onResetKayar: () => void;
  openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void;
};

export function MinistryQuayAtlas({ scope, focusQuayId, setScope, artifacts, alerts, verifiedIds, verificationTasks, zoneReports, operationalDossiers, onOpenDossier, onResetKayar, openWorkflow }: Props) {
  const [mode, setMode] = useState<AtlasMode>("quays");
  const [quayFilter, setQuayFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [situationFilter, setSituationFilter] = useState<"Tous" | "Normal" | "Vigilance" | "Critique">("Tous");
  const [recentOnly, setRecentOnly] = useState(false);
  const [selectedQuayId, setSelectedQuayId] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<SelectedAtlasEntity>(null);
  const [selectedBoatId, setSelectedBoatId] = useState<string | null>(null);

  const visibleQuays = useMemo(() => quays.filter((quay) => {
    const inScope = scope === "Nationale" || quay.region === scope;
    const matchesQuay = quayFilter === "Tous" || quay.id === quayFilter;
    const matchesSearch = !search.trim() || [quay.name, quay.region, quay.commune, ...quay.species].join(" ").toLocaleLowerCase("fr").includes(search.trim().toLocaleLowerCase("fr"));
    const matchesSituation = situationFilter === "Tous" || (situationFilter === "Normal" && quay.level === "normal") || (situationFilter === "Vigilance" && quay.level === "surveillance") || (situationFilter === "Critique" && quay.level === "urgent");
    return inScope && matchesQuay && matchesSearch && matchesSituation && (!recentOnly || quay.landingsToday > 0);
  }), [quayFilter, recentOnly, scope, search, situationFilter]);
  const visibleQuayIds = useMemo(() => new Set(visibleQuays.map((quay) => quay.id)), [visibleQuays]);
  const visiblePirogues = useMemo(() => pirogues.filter((pirogue) => visibleQuayIds.has(pirogue.quayId)), [visibleQuayIds]);
  const selectedQuay = selectedQuayId ? quays.find((quay) => quay.id === selectedQuayId) : undefined;
  const atSeaCount = visiblePirogues.filter((pirogue) => ["atSea", "expectedReturn"].includes(pirogue.cycleStage)).length;
  const activeSituationCount = visibleQuays.reduce((total, quay) => total + alerts.filter((item) => item.quayId === quay.id).length + maritimeIncidents.filter((item) => item.quayId === quay.id && item.status !== "Résolu").length, 0);

  useEffect(() => {
    if (!focusQuayId) return;
    setQuayFilter(focusQuayId);
    setSelectedQuayId(focusQuayId);
    setSelectedEntity(null);
  }, [focusQuayId]);

  const selectQuay = (id: string) => {
    setSelectedQuayId(id);
    setSelectedEntity(null);
    setSelectedBoatId(null);
  };

  const selectPirogue = (pirogue: Pirogue) => {
    setSelectedBoatId(pirogue.id);
    setSelectedQuayId(pirogue.quayId);
    setSelectedEntity({ kind: "pirogue", id: pirogue.id });
  };

  return <section className="min-h-full bg-[var(--mb-offwhite)]">
    <WorkspaceHeader title="Atlas maritime" question="Lire l’activité par quai, ouvrir une fiche métier, puis agir dans le dossier approprié." scope={scope} onScopeChange={(value) => { setScope(value as Scope); setQuayFilter("Tous"); setSelectedQuayId(null); }} onExport={() => openWorkflow("export-zone", { title: "Rapport de zone maritime", scope, description: "Synthèse des quais et situations du périmètre actif." })} />
    <div className="border-b border-[var(--mb-neutral-200)] bg-[linear-gradient(105deg,var(--mb-navy-900),#174e68)] px-4 py-4 text-white sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[var(--mb-ocean-400)]">Situation littorale · données de démonstration</p><h2 className="mt-1 text-[17px] font-semibold">{visibleQuays.length} quais observés · {atSeaCount} pirogues suivies en mer · {activeSituationCount} situations à traiter</h2><p className="mt-1 text-[11px] text-white/70">Le quai est le point d’entrée permanent. Alertes, incidents et vérifications restent des situations rattachées.</p></div><div className="flex items-center gap-3 text-[10px]"><LegendDot color="bg-[var(--mb-green-600)]" label="Normal" /><LegendDot color="bg-[var(--mb-amber-500)]" label="Vigilance" /><LegendDot color="bg-[var(--mb-red-600)]" label="Critique" /></div></div>
    </div>
    <FilterStrip>
      <div className="flex border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-0.5"><ModeButton active={mode === "quays"} onClick={() => setMode("quays")}>Quais & activité</ModeButton><ModeButton active={mode === "sea"} onClick={() => setMode("sea")}>Suivi en mer</ModeButton></div>
      <FilterField label="Recherche"><input className={`${inputClass} w-44`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Quai, région, espèce" /></FilterField>
      <FilterField label="Quai"><select className={inputClass} value={quayFilter} onChange={(event) => { const id = event.target.value; setQuayFilter(id); if (id !== "Tous") selectQuay(id); }}><option>Tous</option>{quays.filter((quay) => scope === "Nationale" || quay.region === scope).map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></FilterField>
      <FilterField label="Situation"><select className={inputClass} value={situationFilter} onChange={(event) => setSituationFilter(event.target.value as typeof situationFilter)}><option>Tous</option><option>Normal</option><option>Vigilance</option><option>Critique</option></select></FilterField>
      <label className="flex h-9 items-center gap-2 border border-[var(--mb-neutral-200)] bg-white px-3 text-[11px] font-bold text-[var(--mb-neutral-700)]"><input type="checkbox" checked={recentOnly} onChange={(event) => setRecentOnly(event.target.checked)} className="accent-[var(--mb-ocean-600)]" />Activité du jour</label>
      <p className="ml-auto self-center text-[10px] text-[var(--mb-neutral-500)]">Cliquez un quai pour ouvrir sa fiche métier.</p>
    </FilterStrip>
    <AtlasMap mode={mode} quays={visibleQuays} pirogues={visiblePirogues} alerts={alerts} selectedBoatId={selectedBoatId} onSelectQuay={selectQuay} onSelectPirogue={selectPirogue} />
    {selectedQuay ? <QuayProfileSheet quay={selectedQuay} alerts={alerts} incidents={maritimeIncidents} dossiers={operationalDossiers} artifacts={artifacts} verifiedIds={verifiedIds} verificationTasks={verificationTasks} zoneReports={zoneReports} selectedEntity={selectedEntity} onSelectEntity={setSelectedEntity} onClose={() => { setSelectedQuayId(null); setSelectedEntity(null); }} onOpenDossier={onOpenDossier} openWorkflow={openWorkflow} onResetKayar={onResetKayar} /> : null}
  </section>;
}

function AtlasMap({ mode, quays: visibleQuays, pirogues: visiblePirogues, alerts, selectedBoatId, onSelectQuay, onSelectPirogue }: { mode: AtlasMode; quays: Quay[]; pirogues: Pirogue[]; alerts: MapAlert[]; selectedBoatId: string | null; onSelectQuay: (id: string) => void; onSelectPirogue: (pirogue: Pirogue) => void }) {
  const selectedBoat = visiblePirogues.find((item) => item.id === selectedBoatId);
  return <div className="relative min-h-[560px] overflow-hidden bg-[#0f4663] lg:min-h-[calc(100vh-238px)]">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,#f4f0e7_0%,#f4f0e7_42%,#d7bd89_42.2%,#d7bd89_47%,#84c4cf_47.4%,#2e7c9b_68%,#123653_100%)]" />
    <div className="absolute inset-y-0 right-0 w-[53%] opacity-25 [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:56px_56px]" />
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M47 0 C43 13 50 21 45 34 C41 45 49 53 44 64 C41 75 52 86 46 100 L0 100 L0 0 Z" fill="#f4f0e7" /><path d="M49 0 C45 13 52 21 47 34 C43 45 51 53 46 64 C43 75 54 86 48 100" fill="none" stroke="#f6e6bd" strokeWidth="5" /><path d="M48 0 C44 13 51 21 46 34 C42 45 50 53 45 64 C42 75 53 86 47 100" fill="none" stroke="#a98349" strokeWidth=".8" />{mode === "sea" ? visiblePirogues.map((pirogue) => { const quay = visibleQuays.find((item) => item.id === pirogue.quayId); if (!quay) return null; return <path key={pirogue.id} d={`M ${quay.x} ${quay.y} Q ${pirogue.x + 7} ${pirogue.y - 8} ${pirogue.x} ${pirogue.y}`} fill="none" stroke={selectedBoat?.id === pirogue.id ? "#ffffff" : "#b9e4eb"} strokeWidth={selectedBoat?.id === pirogue.id ? ".7" : ".3"} strokeDasharray={selectedBoat?.id === pirogue.id ? "none" : "1 1.4"} opacity={selectedBoat?.id === pirogue.id ? 1 : .58} />; }) : null}</svg>
    <div className="absolute left-4 top-4 z-20 border border-white/20 bg-[var(--mb-navy-900)]/92 px-3 py-2 text-white backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-[0.08em]">{mode === "quays" ? "Quais & activité" : "Suivi en mer"}</p><p className="mt-1 text-[10px] text-white/60">Terre · plage · littoral atlantique</p></div>
    {visibleQuays.map((quay) => <QuayMarker key={quay.id} quay={quay} alerts={alerts} onClick={() => onSelectQuay(quay.id)} />)}
    {mode === "sea" ? visiblePirogues.map((pirogue) => <button key={pirogue.id} onClick={() => onSelectPirogue(pirogue)} className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 border px-2 py-1 text-[10px] font-bold ${selectedBoatId === pirogue.id ? "border-white bg-[var(--mb-navy-900)] text-white outline outline-2 outline-[var(--mb-ocean-400)]" : "border-white/80 bg-white/90 text-[var(--mb-navy-900)] hover:bg-white"}`} style={{ left: `${pirogue.x}%`, top: `${pirogue.y}%` }} aria-label={`Ouvrir la pirogue ${pirogue.registration}`}><span aria-hidden="true">◢</span> {pirogue.registration}</button>) : null}
    {!visibleQuays.length ? <div className="absolute inset-0 z-40 grid place-items-center bg-[var(--mb-navy-900)]/55 p-6 text-center text-white"><div><p className="text-[15px] font-semibold">Aucun quai dans cette sélection</p><p className="mt-2 text-[11px] text-white/70">Élargissez la région, la recherche ou le niveau de situation.</p></div></div> : null}
  </div>;
}

function QuayMarker({ quay, alerts, onClick }: { quay: Quay; alerts: MapAlert[]; onClick: () => void }) {
  const snapshot = getQuayActivitySnapshot(quay.id, alerts);
  const incidentCount = maritimeIncidents.filter((item) => item.quayId === quay.id && item.status !== "Résolu").length;
  const situations = snapshot.activeSituations + incidentCount;
  const color = quay.level === "urgent" ? "bg-[var(--mb-red-600)]" : quay.level === "surveillance" ? "bg-[var(--mb-amber-500)]" : "bg-[var(--mb-green-600)]";
  return <div className="group absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: `${quay.x}%`, top: `${quay.y}%` }}><button onClick={onClick} className="relative flex items-center gap-2" aria-label={`Ouvrir la fiche du quai de ${quay.name}`}><span className={`h-4 w-4 rotate-45 border-2 border-white shadow-[0_0_0_3px_rgba(7,34,54,.22)] ${color}`} /><span className="whitespace-nowrap border border-white/80 bg-white/95 px-2 py-1 text-[10px] font-bold text-[var(--mb-navy-900)] shadow-sm">{quay.name}{situations ? <strong className="ml-1.5 text-[var(--mb-red-600)]">{situations}</strong> : null}</span></button><div className="pointer-events-none absolute bottom-full left-2 z-50 mb-3 hidden w-64 border border-white/20 bg-[var(--mb-navy-900)] p-3 text-white shadow-xl group-hover:block"><div className="flex items-start justify-between gap-2"><div><strong className="text-[12px]">{quay.name}</strong><p className="mt-1 text-[10px] text-white/60">Région de {quay.region}</p></div><StatusBadge level={quay.level} /></div><dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]"><MiniFact label="Débarquements" value={String(snapshot.landingsCount)} /><MiniFact label="Volume" value={`${snapshot.declaredVolumeTons.toFixed(1)} t`} /><MiniFact label="En mer" value={String(snapshot.piroguesAtSea)} /><MiniFact label="Situations" value={String(situations)} /></dl><div className="mt-3"><DataTrustBadge level={quay.trustLevel} compact /></div></div></div>;
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`h-8 px-3 text-[11px] font-bold ${active ? "bg-[var(--mb-ocean-600)] text-white" : "text-[var(--mb-neutral-600)] hover:bg-white"}`}>{children}</button>;
}

function LegendDot({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>; }
function MiniFact({ label, value }: { label: string; value: string }) { return <div><dt className="text-white/55">{label}</dt><dd className="mt-0.5 font-mono font-bold">{value}</dd></div>; }
