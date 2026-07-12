"use client";

import type { ReactNode } from "react";
import type { Landing, Level, MapAlert, Pirogue, Quay } from "@/data/ministryControlTowerData";

const labels: Record<Level, string> = { normal: "Situation normale", surveillance: "Vigilance", urgent: "Action urgente" };
const pills: Record<Level, string> = {
  normal: "border-emerald-200 bg-emerald-50 text-emerald-800",
  surveillance: "border-amber-200 bg-amber-50 text-amber-900",
  urgent: "border-red-200 bg-red-50 text-red-800",
};

export const controlClass = "h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0f6b7a] focus:ring-2 focus:ring-[#0f6b7a]/10";
export const primaryActionClass = "inline-flex h-10 items-center justify-center rounded-lg bg-[#0b3142] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#062330]";
export const secondaryActionClass = "inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50";

export function StatusPill({ level = "normal", children }: { level?: Level; children?: ReactNode }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold ${pills[level]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children ?? labels[level]}</span>;
}

export function WorkspaceHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 lg:flex-row lg:items-end lg:justify-between lg:px-7"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f6b7a]">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#062330] sm:text-3xl">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p></div>{children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}</header>;
}

export function MetricBlock({ label, value, detail, tone = "ocean" }: { label: string; value: string; detail: string; tone?: "ocean" | "lagoon" | "sand" | "alert" }) {
  const tones = { ocean: "border-[#0f6b7a] bg-[#edf7f8]", lagoon: "border-emerald-600 bg-emerald-50", sand: "border-amber-500 bg-[#fbf7eb]", alert: "border-red-500 bg-red-50" };
  return <div className={`min-w-0 border-l-2 px-4 py-3 ${tones[tone]}`}><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-[#062330]">{value}</p><p className="mt-1 text-xs leading-4 text-slate-600">{detail}</p></div>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`min-w-0 border border-slate-200 bg-white ${className}`}>{children}</section>;
}

export function PanelHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5"><div>{eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0f6b7a]">{eyebrow}</p> : null}<h3 className="mt-0.5 text-sm font-bold text-[#102a43]">{title}</h3></div>{action}</div>;
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-wrap items-end gap-2 border-b border-slate-200 bg-[#f8fafb] px-4 py-3">{children}</div>;
}

export function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`grid min-w-0 gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 ${wide ? "flex-1 basis-48" : "basis-36"}`}>{label}{children}</label>;
}

function marker(level: Level) {
  return level === "urgent" ? "bg-red-500 ring-red-200" : level === "surveillance" ? "bg-amber-400 ring-amber-100" : "bg-emerald-500 ring-emerald-100";
}

export function MapWorkspace({ mode, quays, pirogues, landings, alerts, selectedKind, selectedId, onSelectQuay, onSelectPirogue }: {
  mode: "quays" | "pirogues"; quays: Quay[]; pirogues: Pirogue[]; landings: Landing[]; alerts: MapAlert[];
  selectedKind: "quay" | "pirogue"; selectedId: string; onSelectQuay: (id: string) => void; onSelectPirogue: (id: string) => void;
}) {
  return <div className="relative min-h-[34rem] overflow-hidden bg-[#8cbec7] lg:min-h-[calc(100vh-18rem)]">
    <div className="absolute inset-0 bg-[linear-gradient(115deg,#edf1df_0%,#dfe9df_42%,#b8d5da_42.2%,#82b7c2_100%)]" />
    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,107,122,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(15,107,122,.18)_1px,transparent_1px)] [background-size:42px_42px]" />
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d="M54 0 C49 11 55 20 51 31 C47 43 55 50 51 61 C47 72 57 83 52 100 L0 100 L0 0 Z" fill="#eef2df" opacity=".94" />
      <path d="M54 0 C49 11 55 20 51 31 C47 43 55 50 51 61 C47 72 57 83 52 100" fill="none" stroke="#fff" strokeWidth="1.2" />
      <path d="M55 1 C51 12 57 21 53 32 C49 44 57 51 53 62 C49 73 59 84 54 99" fill="none" stroke="#0f6b7a" strokeWidth=".2" strokeDasharray="1 1.5" opacity=".6" />
      {mode === "pirogues" ? pirogues.map((boat) => { const quay = quays.find((item) => item.id === boat.quayId); return quay ? <path key={boat.id} d={`M ${quay.x} ${quay.y} Q ${boat.x + 4} ${boat.y - 6} ${boat.x} ${boat.y}`} fill="none" stroke="#155e75" strokeWidth=".35" strokeDasharray="1 1.2" opacity=".72" /> : null; }) : null}
    </svg>
    <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2"><MapLabel>{quays.length} quais</MapLabel><MapLabel>{landings.length} débarquements</MapLabel><MapLabel alert>{alerts.length} alertes</MapLabel></div>
    <div className="absolute bottom-4 left-4 z-20 rounded-md border border-white/60 bg-[#062330]/90 px-3 py-2 text-[10px] font-semibold leading-4 text-white shadow-lg">Données géographiques simulées<br />Consolidation · 10 h 45</div>
    {alerts.map((alert) => { const quay = quays.find((item) => item.id === alert.quayId); return quay ? <button key={alert.id} onClick={() => onSelectQuay(quay.id)} className="absolute z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-400/50 bg-red-400/15 ring-8 ring-red-100/25" style={{ left: `${quay.x}%`, top: `${quay.y}%` }} aria-label={alert.title} /> : null; })}
    {quays.map((quay) => { const active = selectedKind === "quay" && selectedId === quay.id; return <button key={quay.id} onClick={() => onSelectQuay(quay.id)} className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 text-left transition hover:scale-105 ${mode === "pirogues" ? "opacity-60" : ""}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }}><span className={`block h-3.5 w-3.5 rounded-full border-2 border-white ring-4 ${active ? "bg-[#062330] ring-[#0f6b7a]/30" : marker(quay.level)}`} /><span className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-bold shadow-sm ${active ? "border-[#0b3142] bg-[#0b3142] text-white" : "border-white/80 bg-white/90 text-slate-800"}`}>{quay.name}</span></button>; })}
    {mode === "pirogues" ? pirogues.map((boat) => <button key={boat.id} onClick={() => onSelectPirogue(boat.id)} className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-1 text-[9px] font-bold shadow-md ${selectedKind === "pirogue" && selectedId === boat.id ? "border-[#062330] bg-[#062330] text-white" : "border-white bg-white/95 text-[#0b5260]"}`} style={{ left: `${boat.x}%`, top: `${boat.y}%` }}>◢ {boat.registration}</button>) : null}
  </div>;
}

function MapLabel({ children, alert = false }: { children: ReactNode; alert?: boolean }) {
  return <span className={`rounded-md border border-white/70 bg-white/90 px-2.5 py-1.5 text-[11px] font-bold shadow-sm ${alert ? "text-red-700" : "text-[#0b3142]"}`}>{children}</span>;
}

export function ObjectInspector({ title, subtitle, level, rows, actions }: { title: string; subtitle: string; level: Level; rows: Array<[string, string]>; actions: Array<{ label: string; primary?: boolean; onClick?: () => void }> }) {
  return <div className="min-w-0 bg-white"><div className="border-b border-slate-100 px-5 py-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0f6b7a]">Objet sélectionné</p><h3 className="mt-1 text-xl font-semibold text-[#062330]">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><StatusPill level={level} /></div></div><dl className="divide-y divide-slate-100 px-5">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-3 text-xs"><dt className="font-semibold text-slate-500">{label}</dt><dd className="text-right font-bold text-slate-800">{value}</dd></div>)}</dl><div className="grid gap-2 border-t border-slate-100 p-4">{actions.map((action) => <button key={action.label} onClick={action.onClick} className={action.primary ? primaryActionClass : secondaryActionClass}>{action.label}</button>)}</div></div>;
}

export function EvidenceTimeline({ items }: { items: Array<{ time: string; title: string; detail: string }> }) {
  return <ol className="divide-y divide-slate-100">{items.map((item) => <li key={`${item.time}-${item.title}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 px-4 py-3"><time className="text-[11px] font-bold text-[#0f6b7a]">{item.time}</time><div><p className="text-xs font-bold text-slate-800">{item.title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{item.detail}</p></div></li>)}</ol>;
}
