"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Landing, Level, MapAlert, Pirogue, Quay } from "@/data/ministryControlTowerData";

export type WorkspaceId = "map" | "community" | "tracking";
export type MapLayerId = "quays" | "pirogues" | "landings" | "alerts";

const levelLabel: Record<Level, string> = { normal: "Vérifié", surveillance: "Vigilance", urgent: "Critique" };
const levelClass: Record<Level, string> = {
  normal: "border-[var(--mb-green-600)]/25 bg-[var(--mb-green-600)]/10 text-[var(--mb-green-600)]",
  surveillance: "border-[var(--mb-amber-500)]/30 bg-[var(--mb-amber-500)]/10 text-[#805817]",
  urgent: "border-[var(--mb-red-600)]/30 bg-[var(--mb-red-600)]/10 text-[var(--mb-red-600)]",
};

export const inputClass = "h-9 min-w-0 rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-2.5 text-[12px] font-semibold text-[var(--mb-neutral-900)] outline-none transition-[border-color] duration-100 focus:border-[var(--mb-ocean-600)]";
export const primaryButton = "inline-flex h-9 items-center justify-center rounded-[3px] border border-[var(--mb-navy-700)] bg-[var(--mb-navy-700)] px-3 text-[12px] font-bold text-white transition-colors duration-100 hover:bg-[var(--mb-navy-900)]";
export const secondaryButton = "inline-flex h-9 items-center justify-center rounded-[3px] border border-[var(--mb-neutral-200)] bg-white px-3 text-[12px] font-bold text-[var(--mb-neutral-900)] transition-colors duration-100 hover:bg-[var(--mb-neutral-100)]";

export function StatusBadge({ level = "normal", children }: { level?: Level; children?: ReactNode }) {
  return <span className={`inline-flex h-6 items-center gap-1.5 rounded-[3px] border px-2 font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${levelClass[level]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children ?? levelLabel[level]}</span>;
}

export function AppShell({ topBar, rail, children }: { topBar: ReactNode; rail: ReactNode; children: ReactNode }) {
  return <main data-private-console className="h-screen overflow-hidden bg-[var(--mb-offwhite)] text-[var(--mb-neutral-900)]"><div className="grid h-full grid-rows-[52px_minmax(0,1fr)] lg:grid-cols-[72px_minmax(0,1fr)] lg:grid-rows-[52px_minmax(0,1fr)]"><div className="col-span-full">{topBar}</div><div className="hidden min-h-0 lg:block">{rail}</div><div className="min-h-0 min-w-0 overflow-auto">{children}</div></div></main>;
}

export function TopBar({ notice, onExport }: { notice: string; onExport: () => void }) {
  return <header className="flex h-[52px] items-center justify-between gap-4 border-b border-white/10 bg-[var(--mb-navy-900)] px-3 text-white sm:px-4">
    <div className="flex min-w-0 items-center gap-3"><Link href="/" className="grid h-7 w-7 shrink-0 place-items-center rounded-[2px] bg-[var(--mb-sand-300)] text-[10px] font-black text-[var(--mb-navy-900)]">Mb</Link><div className="min-w-0"><p className="truncate text-[12px] font-bold">Console de Coordination Maritime</p><p className="truncate text-[10px] text-white/55">Ministère des Pêches · Pêche artisanale sénégalaise</p></div></div>
    <div className="hidden min-w-0 items-center gap-4 md:flex"><span className="inline-flex items-center gap-2 font-mono text-[10px] text-white/70"><span className="h-1.5 w-1.5 rounded-full bg-[var(--mb-green-600)]" />Sources synchronisées</span><span className="truncate font-mono text-[10px] text-white/55">{notice}</span></div>
    <button onClick={onExport} className="h-8 shrink-0 rounded-[3px] border border-white/20 px-3 text-[11px] font-bold text-white hover:bg-white/5">Export institutionnel</button>
  </header>;
}

export function NavigationRail({ active, onChange }: { active: WorkspaceId; onChange: (id: WorkspaceId) => void }) {
  const items: Array<{ id: WorkspaceId; code: string; label: string }> = [
    { id: "map", code: "AT", label: "Atlas maritime" },
    { id: "community", code: "FP", label: "Filière & programmes" },
    { id: "tracking", code: "PI", label: "Pilotage institutionnel" },
  ];
  return <aside className="flex h-full flex-col border-r border-white/10 bg-[var(--mb-navy-700)] text-white"><nav className="grid gap-px py-2">{items.map((item) => <button key={item.id} onClick={() => onChange(item.id)} title={item.label} className={`relative grid h-[68px] place-items-center border-l-2 px-1 transition-colors duration-100 ${active === item.id ? "border-[var(--mb-ocean-400)] bg-white/10" : "border-transparent text-white/55 hover:bg-white/5 hover:text-white"}`}><span className="font-mono text-[12px] font-bold">{item.code}</span><span className="sr-only">{item.label}</span></button>)}</nav><div className="mt-auto border-t border-white/10 p-2"><Link href="/espace-prive" title="Quitter la console" className="grid h-11 place-items-center font-mono text-[10px] text-white/55 hover:text-white">←</Link></div></aside>;
}

export function MobileWorkspaceNav({ active, onChange }: { active: WorkspaceId; onChange: (id: WorkspaceId) => void }) {
  const items: Array<[WorkspaceId, string]> = [["map", "Atlas"], ["community", "Filière"], ["tracking", "Pilotage"]];
  return <nav className="grid grid-cols-3 border-b border-[var(--mb-neutral-200)] bg-[var(--mb-navy-700)] lg:hidden">{items.map(([id, label]) => <button key={id} onClick={() => onChange(id)} className={`h-10 border-b-2 text-[11px] font-bold ${active === id ? "border-[var(--mb-ocean-400)] text-white" : "border-transparent text-white/55"}`}>{label}</button>)}</nav>;
}

export function WorkspaceHeader({ title, question, scope, onScopeChange, onExport }: { title: string; question: string; scope: string; onScopeChange: (scope: string) => void; onExport: () => void }) {
  return <header className="sticky top-0 z-40 flex min-h-[58px] flex-col gap-3 border-b border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
    <div className="min-w-0"><h1 className="text-[18px] font-semibold text-[var(--mb-navy-900)]">{title}</h1><p className="mt-0.5 truncate text-[11px] text-[var(--mb-neutral-600)]">{question}</p></div>
    <div className="flex flex-wrap items-center gap-2"><label className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)]">Portée <select value={scope} onChange={(event) => onScopeChange(event.target.value)} className={`${inputClass} ml-1 w-36 normal-case tracking-normal`}><option>Nationale</option><option>Dakar</option><option>Thiès</option><option>Saint-Louis</option><option>Ziguinchor</option><option>Louga</option></select></label><span className="font-mono text-[10px] text-[var(--mb-neutral-400)]">Dernière synchronisation · 10:45</span><button onClick={onExport} className={secondaryButton}>Exporter</button></div>
  </header>;
}

export function MetricRow({ metrics }: { metrics: Array<{ label: string; value: string; detail: string; level?: Level }> }) {
  return <div className="grid border-b border-[var(--mb-neutral-200)] bg-white sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="min-w-0 border-b border-[var(--mb-neutral-100)] px-4 py-3 last:border-b-0 sm:border-r xl:border-b-0"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--mb-neutral-600)]">{metric.label}</p>{metric.level ? <StatusBadge level={metric.level} /> : null}</div><p className="mt-1 font-mono text-[28px] font-semibold leading-none text-[var(--mb-navy-900)]">{metric.value}</p><p className="mt-1.5 text-[10px] text-[var(--mb-neutral-600)]">{metric.detail}</p></div>)}</div>;
}

export function FilterStrip({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-wrap items-end gap-2 border-b border-[var(--mb-neutral-200)] bg-white px-3 py-2">{children}</div>;
}

export function FilterField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`grid min-w-0 gap-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-neutral-600)] ${wide ? "flex-1 basis-44" : "basis-32"}`}>{label}{children}</label>;
}

export function LayerControl({ layers, onToggle }: { layers: Record<MapLayerId, boolean>; onToggle: (layer: MapLayerId) => void }) {
  const entries: Array<[MapLayerId, string]> = [["quays", "Quais"], ["pirogues", "Pirogues"], ["landings", "Débarquements"], ["alerts", "Alertes"]];
  return <div className="absolute left-3 top-14 z-30 w-44 rounded-[4px] border border-white/15 bg-[var(--mb-navy-900)]/95 p-2 text-white"><p className="border-b border-white/10 px-1 pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">Couches actives</p>{entries.map(([id, label]) => <label key={id} className="flex h-8 items-center justify-between border-b border-white/5 px-1 text-[11px] last:border-b-0"><span>{label}</span><input type="checkbox" checked={layers[id]} onChange={() => onToggle(id)} className="accent-[var(--mb-ocean-400)]" /></label>)}</div>;
}

function markerClass(level: Level) {
  return level === "urgent" ? "bg-[var(--mb-red-600)]" : level === "surveillance" ? "bg-[var(--mb-amber-500)]" : "bg-[var(--mb-green-600)]";
}

export function MapCanvas({ mode, layers, onToggleLayer, quays, pirogues, landings, alerts, selection, onSelectQuay, onSelectPirogue }: {
  mode: "quays" | "pirogues"; layers: Record<MapLayerId, boolean>; onToggleLayer: (layer: MapLayerId) => void;
  quays: Quay[]; pirogues: Pirogue[]; landings: Landing[]; alerts: MapAlert[]; selection: { kind: "quay" | "pirogue"; id: string } | null;
  onSelectQuay: (id: string) => void; onSelectPirogue: (id: string) => void;
}) {
  return <div className="relative h-full min-h-[430px] overflow-hidden bg-[#a9c8d2]">
    <div className="absolute inset-0 bg-[linear-gradient(112deg,#e4d9c2_0%,#f1eee5_41%,#9bbec9_41.2%,#5c8fa3_100%)]" />
    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(11,31,51,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(11,31,51,.25)_1px,transparent_1px)] [background-size:40px_40px]" />
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M54 0 C49 11 55 20 51 31 C47 43 55 50 51 61 C47 72 57 83 52 100 L0 100 L0 0 Z" fill="#ede7d8" /><path d="M54 0 C49 11 55 20 51 31 C47 43 55 50 51 61 C47 72 57 83 52 100" fill="none" stroke="#fff" strokeWidth="1" /><path d="M55 0 C51 11 57 20 53 31 C49 43 57 50 53 61 C49 72 59 83 54 100" fill="none" stroke="#2a6f8e" strokeDasharray="1 1.4" strokeWidth=".2" opacity=".7" />{mode === "pirogues" && layers.pirogues ? pirogues.map((boat) => { const quay = quays.find((item) => item.id === boat.quayId); return quay ? <path key={boat.id} d={`M ${quay.x} ${quay.y} Q ${boat.x + 5} ${boat.y - 6} ${boat.x} ${boat.y}`} fill="none" stroke="#12314f" strokeDasharray="1 1.2" strokeWidth=".35" opacity=".65" /> : null; }) : null}</svg>
    <div className="absolute left-3 top-3 z-30 flex rounded-[3px] border border-white/20 bg-[var(--mb-navy-900)] p-0.5 text-white"><span className="px-2 py-1 font-mono text-[10px]">{mode === "quays" ? "VUE QUAIS" : "VUE PIROGUES"}</span></div>
    <LayerControl layers={layers} onToggle={onToggleLayer} />
    <div className="absolute bottom-3 left-3 z-30 rounded-[3px] bg-[var(--mb-navy-900)]/90 px-2.5 py-2 font-mono text-[9px] leading-4 text-white/75">SÉNÉGAL · LITTORAL ATLANTIQUE<br />COORDONNÉES SIMULÉES</div>
    {layers.alerts ? alerts.map((alert) => { const quay = quays.find((item) => item.id === alert.quayId); return quay ? <button key={alert.id} onClick={() => onSelectQuay(quay.id)} className="absolute z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--mb-red-600)]/50 bg-[var(--mb-red-600)]/15" style={{ left: `${quay.x}%`, top: `${quay.y}%` }} aria-label={alert.title} /> : null; }) : null}
    {layers.landings ? landings.map((landing, index) => { const quay = quays.find((item) => item.id === landing.quayId); return quay ? <button key={landing.id} onClick={() => onSelectQuay(quay.id)} className="absolute z-20 -translate-x-1/2 rounded-[2px] border border-[var(--mb-navy-500)]/20 bg-white px-1.5 py-0.5 font-mono text-[8px] font-bold text-[var(--mb-navy-900)]" style={{ left: `${quay.x + ((index % 2) * 3 - 1.5)}%`, top: `${quay.y + 4}%` }}>{landing.volumeTons} t</button> : null; }) : null}
    {layers.quays ? quays.map((quay) => <button key={quay.id} onClick={() => onSelectQuay(quay.id)} className="absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: `${quay.x}%`, top: `${quay.y}%` }}><span className={`block h-3 w-3 rounded-full border-2 border-white ${selection?.kind === "quay" && selection.id === quay.id ? "bg-[var(--mb-navy-900)] outline outline-2 outline-[var(--mb-ocean-400)]" : markerClass(quay.level)}`} /><span className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] font-bold ${selection?.kind === "quay" && selection.id === quay.id ? "border-[var(--mb-navy-900)] bg-[var(--mb-navy-900)] text-white" : "border-white/70 bg-white/90 text-[var(--mb-navy-900)]"}`}>{quay.name}</span></button>) : null}
    {layers.pirogues && mode === "pirogues" ? pirogues.map((boat) => <button key={boat.id} onClick={() => onSelectPirogue(boat.id)} className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border px-1.5 py-1 font-mono text-[8px] font-bold ${selection?.kind === "pirogue" && selection.id === boat.id ? "border-white bg-[var(--mb-navy-900)] text-white" : "border-white bg-white/90 text-[var(--mb-navy-700)]"}`} style={{ left: `${boat.x}%`, top: `${boat.y}%` }}>◢ {boat.registration}</button>) : null}
  </div>;
}

export function ContextPanel({ title, subtitle, level, rows, actions, empty = false }: { title: string; subtitle: string; level?: Level; rows: Array<[string, string]>; actions: Array<{ label: string; primary?: boolean; onClick: () => void }>; empty?: boolean }) {
  if (empty) return <aside className="grid h-full min-h-72 place-items-center border-l border-[var(--mb-neutral-200)] bg-white p-5 text-center"><div><p className="font-mono text-[10px] text-[var(--mb-neutral-400)]">AUCUNE SÉLECTION</p><p className="mt-2 text-[12px] text-[var(--mb-neutral-600)]">Sélectionnez un élément dans la vue principale.</p></div></aside>;
  return <aside className="h-full min-w-0 border-l border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-100)] px-4 py-3"><div className="flex items-start justify-between gap-2"><div><p className="font-mono text-[9px] text-[var(--mb-ocean-600)]">CONTEXTE SÉLECTIONNÉ</p><h2 className="mt-1 text-[15px] font-semibold text-[var(--mb-navy-900)]">{title}</h2><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{subtitle}</p></div>{level ? <StatusBadge level={level} /> : null}</div></div><dl className="divide-y divide-[var(--mb-neutral-100)] px-4">{rows.map(([label, value]) => <div key={label} className="grid min-h-9 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 text-[11px]"><dt className="text-[var(--mb-neutral-600)]">{label}</dt><dd className="text-right font-semibold text-[var(--mb-neutral-900)]">{value}</dd></div>)}</dl><div className="grid gap-1.5 border-t border-[var(--mb-neutral-100)] p-3">{actions.map((action) => <button key={action.label} onClick={action.onClick} className={action.primary ? primaryButton : secondaryButton}>{action.label}</button>)}</div></aside>;
}

export function DecisionPanel({ title = "Décisions à prendre", items }: { title?: string; items: Array<{ id: string; title: string; detail: string; level: Level; action: string; onAction: () => void }> }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2"><h3 className="text-[12px] font-bold text-[var(--mb-navy-900)]">{title}</h3></div><div className="divide-y divide-[var(--mb-neutral-200)]">{items.map((item) => <div key={item.id} className="grid gap-2 px-3 py-2.5"><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-semibold leading-4">{item.title}</p><StatusBadge level={item.level} /></div><p className="text-[10px] leading-4 text-[var(--mb-neutral-600)]">{item.detail}</p><button onClick={item.onAction} className="justify-self-start text-[10px] font-bold text-[var(--mb-ocean-600)] hover:underline">{item.action} →</button></div>)}</div></section>;
}

export function EvidenceTimeline({ items }: { items: Array<{ time: string; title: string; detail: string }> }) {
  return <ol className="divide-y divide-[var(--mb-neutral-100)] bg-white">{items.map((item) => <li key={`${item.time}-${item.title}`} className="grid min-h-10 grid-cols-[3.2rem_minmax(0,1fr)] gap-2 px-3 py-2"><time className="font-mono text-[9px] font-bold text-[var(--mb-ocean-600)]">{item.time}</time><div><p className="text-[10px] font-semibold text-[var(--mb-neutral-900)]">{item.title}</p><p className="mt-0.5 text-[9px] leading-3 text-[var(--mb-neutral-600)]">{item.detail}</p></div></li>)}</ol>;
}

export function DataTable({ headers, rows, onRowClick }: { headers: string[]; rows: Array<{ id: string; cells: ReactNode[] }>; onRowClick?: (id: string) => void }) {
  return <div className="min-w-0 overflow-x-auto"><table className="w-full min-w-[36rem] border-collapse text-left"><thead><tr className="h-9 border-b border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-100)]">{headers.map((header) => <th key={header} className="px-3 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-600)]">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} onClick={() => onRowClick?.(row.id)} className={`h-10 border-b border-[var(--mb-neutral-100)] text-[11px] ${index % 2 ? "bg-[var(--mb-offwhite)]/55" : "bg-white"} ${onRowClick ? "cursor-pointer hover:bg-[#edf3f5]" : ""}`}>{row.cells.map((cell, cellIndex) => <td key={cellIndex} className="px-3">{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function WorkflowBoard({ columns, selectedId, onSelect }: { columns: Array<{ id: string; title: string; items: Array<{ id: string; title: string; detail: string; level?: Level }> }>; selectedId: string | null; onSelect: (id: string) => void }) {
  return <div className="grid min-w-[60rem] grid-cols-6 border-y border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-100)]">{columns.map((column) => <section key={column.id} className="min-w-0 border-r border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] last:border-r-0"><header className="flex h-10 items-center justify-between border-b border-[var(--mb-neutral-200)] px-2"><h3 className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--mb-neutral-600)]">{column.title}</h3><span className="font-mono text-[10px] font-bold text-[var(--mb-navy-900)]">{String(column.items.length).padStart(2, "0")}</span></header><div className="divide-y divide-[var(--mb-neutral-200)]">{column.items.map((item) => <button key={item.id} onClick={() => onSelect(item.id)} className={`block w-full px-2 py-3 text-left transition-colors duration-100 ${selectedId === item.id ? "border-l-2 border-[var(--mb-ocean-600)] bg-white" : "border-l-2 border-transparent hover:bg-white"}`}><div className="flex items-start justify-between gap-1"><p className="text-[10px] font-semibold leading-4 text-[var(--mb-neutral-900)]">{item.title}</p>{item.level ? <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${markerClass(item.level)}`} /> : null}</div><p className="mt-1 text-[9px] leading-3 text-[var(--mb-neutral-600)]">{item.detail}</p></button>)}</div></section>)}</div>;
}

export function ProgramPipeline({ programs, onSelect }: { programs: Array<{ id: string; title: string; territory: string; partner: string; progress: number; due: string }>; onSelect: (id: string) => void }) {
  return <div className="divide-y divide-[var(--mb-neutral-100)]">{programs.map((program) => <button key={program.id} onClick={() => onSelect(program.id)} className="grid w-full grid-cols-[minmax(0,1fr)_6rem] gap-3 px-3 py-2.5 text-left hover:bg-[var(--mb-offwhite)]"><div><p className="text-[11px] font-semibold">{program.title}</p><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">{program.territory} · {program.partner} · {program.due}</p><div className="mt-2 h-1 bg-[var(--mb-neutral-100)]"><div className="h-full bg-[var(--mb-ocean-600)]" style={{ width: `${program.progress}%` }} /></div></div><span className="self-center text-right font-mono text-[11px] font-bold">{program.progress}%</span></button>)}</div>;
}

export function ActionRegister({ items, onAction }: { items: Array<{ id: string; action: string; owner: string; due: string; level: Level }>; onAction: (id: string) => void }) {
  return <div className="divide-y divide-[var(--mb-neutral-100)]">{items.map((item) => <button key={item.id} onClick={() => onAction(item.id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2.5 text-left hover:bg-[var(--mb-offwhite)]"><div><p className="text-[10px] font-semibold leading-4">{item.action}</p><p className="mt-1 font-mono text-[9px] text-[var(--mb-neutral-600)]">{item.owner} · {item.due}</p></div><StatusBadge level={item.level} /></button>)}</div>;
}

export function ExportPanel({ onExport }: { onExport: () => void }) {
  return <section className="grid gap-2 border border-[var(--mb-neutral-200)] bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><h3 className="text-[11px] font-bold text-[var(--mb-navy-900)]">Export institutionnel</h3><p className="mt-1 text-[9px] text-[var(--mb-neutral-600)]">Situation, décisions, actions et registre de preuve du périmètre actif.</p></div><button onClick={onExport} className={primaryButton}>Préparer l’export</button></section>;
}
