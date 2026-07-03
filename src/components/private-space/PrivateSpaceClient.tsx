"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MapPoint, PrivateRecord, PrivateSpaceConfig } from "@/data/privateSpaces";
import { ecosystemMapPoints, ecosystemProfiles, privateTerritories } from "@/data/privateSpaces";
import type { Tone } from "@/data/mockMbambulaan";

const toneClass: Record<Tone, string> = {
  blue: "border-cyan-200 bg-cyan-50 text-cyan-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  slate: "border-slate-200 bg-stone-50 text-slate-800"
};

const nextStatus = ["Ouvert", "En cours", "Prioritaire", "Realise", "Archive"];
const payerRoles = ["etat", "ong", "collectivite", "exportateur", "organisation", "investisseur"];

function tensionDotClass(tension: MapPoint["tension"]) {
  if (tension === "Critique") return "bg-rose-500";
  if (tension === "Forte") return "bg-amber-400";
  if (tension === "Moyenne") return "bg-yellow-300";
  return "bg-emerald-400";
}

function normalizeMenu(item: string) {
  const lower = item.toLowerCase();
  if (lower.includes("carte") || lower.includes("territoire") || lower.includes("zone") || lower.includes("commune") || lower.includes("quai")) return "map";
  if (lower.includes("admin") || lower.includes("param")) return "admin";
  if (lower.includes("preuve") || lower.includes("trace") || lower.includes("data room")) return "proofs";
  if (lower.includes("note") || lower.includes("report") || lower.includes("rapport") || lower.includes("memo") || lower.includes("decision")) return "reports";
  if (lower.includes("tension") || lower.includes("risque") || lower.includes("alerte")) return "alerts";
  if (lower.includes("programme") || lower.includes("financement") || lower.includes("bailleur") || lower.includes("offre") || lower.includes("revenu")) return "portfolio";
  if (lower.includes("statut") || lower.includes("signal") || lower.includes("demande") || lower.includes("lot") || lower.includes("flux") || lower.includes("membre") || lower.includes("opportunite") || lower.includes("supply")) return "operations";
  return "summary";
}

export function PrivateSpaceClient({ config }: { config: PrivateSpaceConfig }) {
  const ecosystem = ecosystemProfiles[config.key];
  const navItems = useMemo(() => {
    const adminLabel = config.key === "pecheur" ? null : config.key === "mareyeur" ? "Parametres" : "Admin";
    return adminLabel && !config.sidebar.includes(adminLabel) ? [...config.sidebar, adminLabel] : config.sidebar;
  }, [config.key, config.sidebar]);
  const [activeNav, setActiveNav] = useState(navItems[0]);
  const [territory, setTerritory] = useState(config.territoryDefault);
  const [tensionFilter, setTensionFilter] = useState("Toutes");
  const [selected, setSelected] = useState<PrivateRecord>(config.records[0]);
  const [selectedMapPoint, setSelectedMapPoint] = useState<MapPoint>(ecosystemMapPoints.find((point) => point.name === config.territoryDefault) ?? ecosystemMapPoints[0]);
  const [records, setRecords] = useState(config.records);
  const [secondaryRecords, setSecondaryRecords] = useState(ecosystem.secondaryRecords);
  const [selectedSecondary, setSelectedSecondary] = useState(ecosystem.secondaryRecords[0]);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [priorityId, setPriorityId] = useState<string>(config.records[0].id);
  const [permissionLevel, setPermissionLevel] = useState("Brouillon");
  const [message, setMessage] = useState("Simulation MVP - action non connectee au backend");
  const [synthesis, setSynthesis] = useState("");

  const moduleKind = normalizeMenu(activeNav);
  const filteredRecords = useMemo(() => records.filter((record) => territory === "Tous" || record.territory === territory), [records, territory]);
  const filteredSecondaryRecords = useMemo(() => secondaryRecords.filter((record) => territory === "Tous" || record.territory === territory), [secondaryRecords, territory]);
  const filteredMapPoints = useMemo(() => ecosystemMapPoints.filter((point) => tensionFilter === "Toutes" || point.tension === tensionFilter), [tensionFilter]);

  function rotateStatus(record: PrivateRecord) {
    const currentIndex = nextStatus.indexOf(record.status);
    const status = nextStatus[(currentIndex + 1 + nextStatus.length) % nextStatus.length];
    setRecords((items) => items.map((item) => (item.id === record.id ? { ...item, status } : item)));
    setSelected((item) => (item.id === record.id ? { ...item, status } : item));
    setMessage(`Statut mis a jour en simulation: ${status}. Simulation MVP - action non connectee au backend`);
  }

  function rotateSecondaryStatus(record: PrivateRecord) {
    const currentIndex = nextStatus.indexOf(record.status);
    const status = nextStatus[(currentIndex + 1 + nextStatus.length) % nextStatus.length];
    setSecondaryRecords((items) => items.map((item) => (item.id === record.id ? { ...item, status } : item)));
    setSelectedSecondary((item) => (item.id === record.id ? { ...item, status } : item));
    setMessage(`Workflow avance: ${status}. Simulation MVP - action non connectee au backend`);
  }

  function addNote() {
    if (!note.trim()) return;
    setNotes((items) => [note.trim(), ...items]);
    setNote("");
    setMessage("Note temporaire ajoutee en session. Simulation MVP - action non connectee au backend");
  }

  function markPriority(record: PrivateRecord) {
    setPriorityId(record.id);
    setMessage(`Action prioritaire marquee: ${record.title}. Simulation MVP - action non connectee au backend`);
  }

  function generateSynthesis() {
    setSynthesis(config.synthesis);
    setMessage("Synthese generee localement. Simulation MVP - action non connectee au backend");
  }

  return (
    <div className="min-h-screen bg-[#f6fbfb] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[18rem_1fr]">
        <aside className="hidden border-r border-cyan-100 bg-gradient-to-b from-cyan-950 via-cyan-900 to-emerald-900 p-5 text-white xl:block">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-100 text-sm font-black text-cyan-950">Mb</span>
            <span><span className="block font-black">Mbàmbulaan</span><span className="text-xs font-bold text-cyan-100/70">{config.organization}</span></span>
          </Link>
          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => (
              <button key={item} type="button" onClick={() => setActiveNav(item)} className={`rounded-2xl px-3 py-2 text-left text-sm font-bold transition ${activeNav === item ? "bg-white text-cyan-950" : "text-cyan-50/80 hover:bg-white/10 hover:text-white"}`}>{item}</button>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-100/55">Private OS</p>
            <p className="mt-2 text-sm font-bold text-white">{config.roleLabel}</p>
            <p className="mt-3 text-xs font-bold leading-5 text-cyan-50/65">Modules actives, permissions et actions restent simules localement.</p>
          </div>
        </aside>

        <main>
          <header className="border-b border-cyan-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{config.organization}</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{config.title}</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{config.intro}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-5 py-3 text-center text-sm font-black text-cyan-950">Portail espaces</Link>
                <button onClick={generateSynthesis} className="rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white shadow-sm shadow-cyan-900/20">{config.topbarCta}</button>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6 sm:px-8">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-900">{message}</div>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {config.kpis.map((kpi, index) => <AnalyticsKpi key={kpi.label} label={kpi.label} value={kpi.value} detail={kpi.detail} tone={kpi.tone} index={index} onClick={() => setMessage(`${kpi.label} filtre en simulation. Simulation MVP - action non connectee au backend`)} />)}
            </section>
            <section>{renderModule()}</section>
          </div>
        </main>
      </div>
    </div>
  );

  function renderModule() {
    if (moduleKind === "map") return <MapModule large={config.key === "etat"} />;
    if (moduleKind === "admin") return <AdminModule />;
    if (moduleKind === "proofs") return <ProofModule />;
    if (moduleKind === "reports") return <ReportModule />;
    if (moduleKind === "alerts") return <AlertsModule />;
    if (moduleKind === "portfolio") return <PortfolioModule />;
    if (moduleKind === "operations") return <OperationsModule />;
    return <SummaryModule />;
  }

  function SummaryModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title={`Synthese - ${activeNav}`} subtitle="Vue decisionnelle inspirée BI, adaptee au role actif">
          <div className="grid gap-4 md:grid-cols-2">
            {ecosystem.capabilities.map((capability) => (
              <div key={capability.title} className={`rounded-[1.25rem] border p-5 ${toneClass[capability.tone]}`}>
                <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{capability.title}</p>
                <p className="mt-4 text-2xl font-black">{capability.metric}</p>
                <p className="mt-2 text-sm font-bold leading-6 opacity-75">{capability.description}</p>
                <button onClick={() => setMessage(`${capability.title} ouvert. Simulation MVP - action non connectee au backend`)} className="mt-4 rounded-full bg-white px-3 py-2 text-xs font-black text-slate-800">Explorer</button>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={ecosystem.decisionRoomTitle} subtitle="Ce que cet espace aide a decider">
          <div className="grid gap-3">{ecosystem.decisionBullets.map((bullet, index) => <div key={bullet} className="flex gap-3 rounded-2xl bg-cyan-50 p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-700 text-xs font-black text-white">{index + 1}</span><p className="text-sm font-bold leading-6 text-slate-700">{bullet}</p></div>)}</div>
        </Panel>
      </div>
    );
  }

  function MapModule({ large }: { large: boolean }) {
    return (
      <div className={`grid gap-6 ${large ? "xl:grid-cols-[1.35fr_0.65fr]" : "xl:grid-cols-[1.05fr_0.95fr]"}`}>
        <Panel title={ecosystem.mapTitle} subtitle={`${ecosystem.mapSubtitle} Coordonnees lat/lng mockees, pretes pour API geoloc.`}>
          <div className="mb-4 flex flex-wrap gap-2">
            {["Toutes", "Critique", "Forte", "Moyenne", "Faible"].map((item) => <button key={item} onClick={() => setTensionFilter(item)} className={`rounded-full border px-4 py-2 text-xs font-black ${tensionFilter === item ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-200 bg-white text-cyan-900"}`}>{item}</button>)}
          </div>
          <div className={`grid gap-5 ${large ? "lg:grid-cols-[1fr_19rem]" : "lg:grid-cols-[1fr_17rem]"}`}>
            <div className={`${large ? "min-h-[34rem]" : "min-h-[24rem]"} relative overflow-hidden rounded-[1.5rem] border border-cyan-200 bg-[radial-gradient(circle_at_16%_18%,rgba(20,184,166,0.22),transparent_30%),linear-gradient(140deg,#f8fafc,#dff7f4_46%,#f7e7c3)] p-4`}>
              <div className="absolute left-[22%] top-8 h-[86%] w-8 rounded-full border-l-4 border-cyan-300/80" />
              <div className="absolute bottom-6 right-8 rounded-2xl bg-white/85 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-800 shadow-sm">Littoral pilote</div>
              {filteredMapPoints.map((point) => <button key={point.name} type="button" onClick={() => { setSelectedMapPoint(point); setTerritory(point.name); setMessage(`${point.name} selectionne sur la carte. Simulation MVP - action non connectee au backend`); }} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${selectedMapPoint.name === point.name ? "h-9 w-9 ring-4 ring-cyan-800/20" : "h-6 w-6"} ${tensionDotClass(point.tension)}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} aria-label={`Selectionner ${point.name}`} />)}
              {filteredMapPoints.map((point) => <span key={`${point.name}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/85 px-2 py-1 text-[0.68rem] font-black text-slate-700 shadow-sm" style={{ left: `${point.x}%`, top: `calc(${point.y}% + 1.25rem)` }}>{point.name}</span>)}
            </div>
            <MapDetail />
          </div>
        </Panel>
        <Panel title="Actions cartographiques" subtitle="Priorisation, verification et note locale">
          <div className="grid gap-3">{["Prioriser ce territoire", "Demander verification", "Generer note", "Ouvrir territoire"].map((action) => <button key={action} onClick={() => setMessage(`${action} - ${selectedMapPoint.name}. Simulation MVP - action non connectee au backend`)} className="rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-left text-sm font-black text-cyan-950 hover:border-cyan-700">{action}</button>)}</div>
          <div className="mt-5 rounded-2xl bg-stone-50 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Legende</p><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700">{["Critique", "Forte", "Moyenne", "Faible"].map((item) => <span key={item} className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${tensionDotClass(item as MapPoint["tension"])}`} /> {item}</span>)}</div></div>
        </Panel>
      </div>
    );
  }

  function MapDetail() {
    return <div className="rounded-[1.25rem] border border-cyan-100 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{selectedMapPoint.zone}</p><h3 className="mt-1 text-2xl font-black text-slate-950">{selectedMapPoint.name}</h3></div><Badge>{selectedMapPoint.tension}</Badge></div><dl className="mt-5 grid gap-3 text-sm font-bold text-slate-700"><div className="flex justify-between gap-4"><dt>Latitude</dt><dd>{selectedMapPoint.lat}</dd></div><div className="flex justify-between gap-4"><dt>Longitude</dt><dd>{selectedMapPoint.lng}</dd></div><div className="flex justify-between gap-4"><dt>Signaux</dt><dd>{selectedMapPoint.signals}</dd></div><div className="flex justify-between gap-4"><dt>Programmes</dt><dd>{selectedMapPoint.programs}</dd></div><div className="flex justify-between gap-4"><dt>Financement</dt><dd>{selectedMapPoint.funding}</dd></div></dl><div className="mt-5 flex flex-wrap gap-2">{selectedMapPoint.actors.map((actor) => <span key={actor} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{actor}</span>)}</div><p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">{selectedMapPoint.priority}</p></div>;
  }

  function OperationsModule() {
    return <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]"><RecordTable title={config.recordsTitle} records={filteredRecords} selectedId={selected.id} onSelect={setSelected} onPrimary={markPriority} primaryLabel="Prioriser" /><DetailPanel record={selected} onStatus={() => rotateStatus(selected)} /></div>;
  }

  function PortfolioModule() {
    return <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]"><RecordList title={ecosystem.secondaryTitle} records={filteredSecondaryRecords} selectedId={selectedSecondary.id} onSelect={setSelectedSecondary} /><Panel title="Portefeuille actif" subtitle="Programmes, financements, offres ou dossiers selon le profil"><div className="rounded-2xl bg-white p-4 ring-1 ring-cyan-100"><p className="text-xl font-black text-slate-950">{selectedSecondary.title}</p><p className="mt-2 text-sm font-semibold text-slate-600">{selectedSecondary.territory} · {selectedSecondary.owner}</p><div className="mt-4 grid gap-2 text-sm font-bold text-slate-700"><p>Statut: {selectedSecondary.status}</p><p>Priorite: {selectedSecondary.priority}</p><p>Preuve: {selectedSecondary.proof}</p></div><button onClick={() => rotateSecondaryStatus(selectedSecondary)} className="mt-4 rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Avancer workflow</button></div></Panel></div>;
  }

  function AlertsModule() {
    return <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><Panel title="Alertes et risques" subtitle="Severite, responsable, statut et prochaine action"><div className="grid gap-3">{[...records, ...secondaryRecords].slice(0, 5).map((record) => <div key={record.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-amber-950">{record.title}</p><p className="mt-1 text-sm font-bold text-amber-800">{record.owner} · {record.territory}</p></div><Badge>{record.priority}</Badge></div><button onClick={() => markPriority(record)} className="mt-4 rounded-full bg-amber-500 px-4 py-2 text-sm font-black text-white">Traiter en priorite</button></div>)}</div></Panel><MapModule large={false} /></div>;
  }

  function ProofModule() {
    return <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]"><Panel title="Preuves, sources et validation" subtitle="Niveau de confiance, origine et statut exploitable"><div className="grid gap-3">{[...records, ...secondaryRecords].map((record) => <div key={record.id} className="rounded-2xl border border-cyan-100 bg-white p-4"><p className="font-black text-slate-950">{record.title}</p><p className="mt-1 text-sm font-semibold text-slate-600">{record.proof}</p><div className="mt-3 h-2 rounded-full bg-cyan-50"><div className="h-2 rounded-full bg-emerald-400" style={{ width: record.proof.includes("Val") ? "88%" : record.proof.includes("Systeme") ? "74%" : "58%" }} /></div></div>)}</div></Panel><NotePanel /></div>;
  }

  function ReportModule() {
    return <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><Panel title="Rapports et notes" subtitle="Generation locale d'une synthese ou note de decision"><div className="grid gap-3">{config.reports.map((report) => <div key={report.title} className="rounded-2xl border border-cyan-100 bg-white p-4"><p className="font-black text-slate-950">{report.title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{report.audience}</p><Badge>{report.status}</Badge><button onClick={generateSynthesis} className="mt-4 rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Preparer rapport</button></div>)}</div></Panel><Panel title="Synthese generee" subtitle="Apercu local, non connecte"><p className="text-sm font-semibold leading-7 text-slate-700">{synthesis || "Cliquez sur preparer rapport pour generer un aperçu simulé."}</p><NotePanel compact /></Panel></div>;
  }

  function AdminModule() {
    const adminRows = payerRoles.includes(config.key) ? ["Administrateur", "Lecture decision", "Contributeur terrain", "Validateur preuve"] : ["Compte utilisateur", "Relais autorise"];
    return <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><Panel title="Admin et permissions" subtitle="Simulation roles, modules actives et droits d'acces"><div className="grid gap-3">{adminRows.map((role, index) => <div key={role} className="rounded-2xl border border-cyan-100 bg-white p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-black text-slate-950">{role}</p><p className="mt-1 text-sm font-semibold text-slate-500">{index + 2} modules autorises</p></div><button onClick={() => setPermissionLevel(permissionLevel === "Valide" ? "Archive" : "Valide")} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white">Modifier</button></div></div>)}</div></Panel><Panel title="Historique d'action" subtitle="Journal simule de l'espace payeur"><div className="grid gap-3">{[`Permission passee en ${permissionLevel}`, `Module ${activeNav} consulte`, "Note temporaire ajoutee", "Rapport prepare"].map((item) => <div key={item} className="rounded-2xl bg-cyan-50 p-4 text-sm font-bold text-cyan-950">{item}</div>)}</div></Panel></div>;
  }

  function RecordTable({ title, records: rows, selectedId, onSelect, onPrimary, primaryLabel }: { title: string; records: PrivateRecord[]; selectedId: string; onSelect: (record: PrivateRecord) => void; onPrimary: (record: PrivateRecord) => void; primaryLabel: string }) {
    return <Panel title={title} subtitle={`Module actif: ${activeNav}`}><div className="mb-4 flex flex-wrap gap-2">{["Tous", ...privateTerritories].map((item) => <FilterButton key={item} item={item} />)}</div><div className="overflow-hidden rounded-2xl border border-cyan-100"><table className="w-full min-w-[46rem] border-collapse text-left text-sm"><thead className="bg-cyan-50 text-xs uppercase tracking-[0.12em] text-cyan-900"><tr><th className="p-4">Objet</th><th className="p-4">Territoire</th><th className="p-4">Responsable</th><th className="p-4">Statut</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y divide-cyan-100 bg-white">{rows.map((record) => <tr key={record.id} className={priorityId === record.id || selectedId === record.id ? "bg-amber-50/70" : undefined}><td className="p-4"><button onClick={() => onSelect(record)} className="text-left font-black text-slate-950 hover:text-cyan-700">{record.title}</button><p className="mt-1 text-xs font-bold text-slate-500">{record.next}</p></td><td className="p-4 font-semibold text-slate-600">{record.territory}</td><td className="p-4 font-semibold text-slate-600">{record.owner}</td><td className="p-4"><Badge>{record.status}</Badge></td><td className="p-4"><button onClick={() => onPrimary(record)} className="rounded-full bg-cyan-700 px-3 py-2 text-xs font-black text-white">{primaryLabel}</button></td></tr>)}</tbody></table></div></Panel>;
  }

  function RecordList({ title, records: rows, selectedId, onSelect }: { title: string; records: PrivateRecord[]; selectedId: string; onSelect: (record: PrivateRecord) => void }) {
    return <Panel title={title} subtitle="Registre dynamique propre au menu actif"><div className="grid gap-3">{rows.map((record) => <button key={record.id} type="button" onClick={() => onSelect(record)} className={`rounded-2xl border p-4 text-left transition hover:border-cyan-400 ${selectedId === record.id ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-100 bg-white text-slate-900"}`}><p className="font-black">{record.title}</p><p className={`mt-1 text-sm font-semibold ${selectedId === record.id ? "text-white/70" : "text-slate-500"}`}>{record.territory} · {record.owner}</p><p className={`mt-3 text-sm font-bold ${selectedId === record.id ? "text-white/80" : "text-slate-600"}`}>{record.next}</p></button>)}</div></Panel>;
  }

  function DetailPanel({ record, onStatus }: { record: PrivateRecord; onStatus: () => void }) {
    return <Panel title={config.detailLabel} subtitle="Detail, statut, preuve et note"><div className="rounded-2xl bg-cyan-50 p-4"><p className="text-xl font-black text-slate-950">{record.title}</p><p className="mt-2 text-sm font-semibold text-slate-600">{record.territory} · {record.owner}</p><div className="mt-4 grid gap-2 text-sm font-bold text-slate-700"><p>Priorite: {record.priority}</p><p>Preuve: {record.proof}</p><p>Prochaine etape: {record.next}</p></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button onClick={onStatus} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Changer statut</button><button onClick={generateSynthesis} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">Generer synthese</button></div></div><NotePanel compact /></Panel>;
  }

  function NotePanel({ compact = false }: { compact?: boolean }) {
    return <div className={compact ? "mt-4" : ""}><label className="text-sm font-black text-slate-800">Note temporaire</label><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={config.notePlaceholder} className="mt-2 min-h-24 w-full rounded-2xl border border-cyan-100 p-4 text-sm font-semibold outline-none focus:border-cyan-400" /><button onClick={addNote} className="mt-3 rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Ajouter note</button>{notes.length ? <div className="mt-4 grid gap-2">{notes.map((item, index) => <div key={`${item}-${index}`} className="rounded-2xl bg-stone-50 p-3 text-sm font-semibold text-slate-700">{item}</div>)}</div> : null}</div>;
  }

  function FilterButton({ item }: { item: string }) {
    return <button type="button" onClick={() => setTerritory(item)} className={`rounded-full border px-4 py-2 text-xs font-black ${territory === item ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-200 bg-white text-cyan-900"}`}>{item}</button>;
  }
}

function AnalyticsKpi({ label, value, detail, tone, index, onClick }: { label: string; value: string; detail: string; tone: Tone; index: number; onClick: () => void }) {
  const width = `${54 + ((index * 11) % 36)}%`;
  return <button onClick={onClick} className={`rounded-[1.25rem] border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass[tone]}`}><div className="flex items-start justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p><span className="rounded-full bg-white/80 px-2 py-1 text-[0.68rem] font-black">+{index + 4}%</span></div><p className="mt-4 text-3xl font-black">{value}</p><p className="mt-2 text-sm font-bold opacity-75">{detail}</p><div className="mt-4 h-2 rounded-full bg-white/70"><div className="h-2 rounded-full bg-current opacity-60" style={{ width }} /></div></button>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[1.5rem] border border-cyan-100 bg-white p-5 shadow-sm"><div className="mb-5"><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p></div>{children}</section>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="mt-2 inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-black text-cyan-900">{children}</span>;
}
