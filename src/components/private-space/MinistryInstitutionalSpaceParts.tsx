import type { ReactNode } from "react";
import type { MinistryRegionalQuay } from "@/data/ministryRegionalSpace";

export const btn = "rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-4 py-2 text-sm font-black text-white shadow-[0_12px_24px_rgba(8,145,178,0.18)] transition hover:brightness-105";
export const softBtn = "rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-950 shadow-sm transition hover:border-cyan-300 hover:bg-white";

const card = "min-w-0 overflow-hidden rounded-[1.65rem] border border-cyan-100 bg-white/90 p-5 shadow-sm";
const tensionColor = (level: string) => level === "Critique" ? "bg-rose-500" : level === "Forte" ? "bg-amber-400" : level === "Moyenne" ? "bg-yellow-300" : "bg-emerald-400";
const badgeTone = (level: string) => level === "Critique" || level === "critique" ? "border-rose-200 bg-rose-50 text-rose-950 before:bg-rose-500" : level === "Forte" || level === "attention" ? "border-amber-200 bg-amber-50 text-amber-950 before:bg-amber-500" : level === "Moyenne" ? "border-yellow-200 bg-yellow-50 text-yellow-950 before:bg-yellow-400" : level === "info" ? "border-cyan-200 bg-cyan-50 text-cyan-950 before:bg-cyan-500" : "border-emerald-200 bg-emerald-50 text-emerald-700 before:bg-emerald-500";

function routeForAction(action: string) {
  const value = action.toLowerCase();
  if (value.includes("note") || value.includes("brouillon") || value.includes("inclure")) return "/espace-prive/etat/parcours/note-arbitrage";
  if (value.includes("financement") || value.includes("arbitrage") || value.includes("justificatif") || value.includes("prioriser") || value.includes("pièce")) return "/espace-prive/etat/parcours/financement";
  if (value.includes("vérif") || value.includes("verif") || value.includes("complément") || value.includes("relevé") || value.includes("référent") || value.includes("compte rendu") || value.includes("moyen")) return "/espace-prive/etat/parcours/verification-terrain";
  if (value.includes("synthèse") || value.includes("action") || value.includes("coordination")) return "/espace-prive/etat/parcours/coordination";
  return null;
}

function runThenRoute(action: string, onAction: (action: string) => void) {
  onAction(action);
  const route = routeForAction(action);
  if (route && typeof window !== "undefined") setTimeout(() => { window.location.href = route; }, 120);
}

export function View({ kicker, title, description, children }: { kicker: string; title: string; description: string; children: ReactNode }) {
  return <section className="grid min-w-0 gap-5 overflow-hidden rounded-[2rem] border border-cyan-100/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(236,253,245,0.56),rgba(236,254,255,0.40))] p-4 shadow-[0_18px_70px_rgba(8,145,178,0.08)] sm:p-6"><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{kicker}</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2></div><p className="max-w-xl text-sm font-semibold leading-6 text-slate-600">{description}</p></div>{children}</section>;
}

export function Panel({ title, subtitle, hint, children }: { title: string; subtitle: string; hint?: string; children: ReactNode }) {
  return <section className={card}><div className="mb-5 flex justify-between gap-3"><div><h3 className="text-lg font-black">{title}</h3><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700/70">{subtitle}</p></div>{hint && <Hint text={hint} />}</div>{children}</section>;
}

export function Hint({ text }: { text: string }) {
  return <span className="group relative inline-flex shrink-0"><span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-50 text-[0.72rem] font-black text-cyan-800 ring-1 ring-cyan-200" aria-label="Information">?</span><span className="pointer-events-none absolute right-0 top-8 z-20 hidden w-72 rounded-2xl bg-cyan-950 p-3 text-xs font-semibold leading-5 text-white shadow-xl group-hover:block">{text}</span></span>;
}

export function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="min-w-0 rounded-2xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/70 to-emerald-50/55 p-4 shadow-sm"><div className="flex justify-between gap-2"><p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-800/80">{label}</p><Hint text={hint} /></div><p className="mt-2 break-words text-2xl font-black text-cyan-950">{value}</p><div className="mt-3 h-1 rounded-full bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400" /></div>;
}

export function Map({ quays, activeId, onSelect }: { quays: MinistryRegionalQuay[]; activeId: string; onSelect: (id: string) => void }) {
  return <div className="relative min-h-[26rem] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.10),transparent_30%),linear-gradient(140deg,#ffffff,#edf8f6_52%,#fff7e8)]">{quays.map((quay) => <button key={quay.id} onClick={() => onSelect(quay.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg ${activeId === quay.id ? "h-11 w-11 ring-4 ring-cyan-900/20" : "h-7 w-7"} ${tensionColor(quay.tension)}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} />)}{quays.map((quay) => <span key={`${quay.id}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-black text-slate-700" style={{ left: `${quay.x}%`, top: `calc(${quay.y}% + 1.35rem)` }}>{quay.name}</span>)}</div>;
}

export function Gauge({ label, value }: { label: string; value: number }) {
  const tone = value >= 80 ? "from-rose-500 to-orange-400" : value >= 65 ? "from-amber-400 to-yellow-300" : "from-emerald-400 to-teal-400";
  return <div className="mb-4 rounded-2xl bg-gradient-to-br from-cyan-50/80 to-emerald-50/60 p-4 ring-1 ring-cyan-100"><div className="flex items-end justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-800">{label}</p><p className="text-3xl font-black">{value}</p></div><div className="mt-3 h-3 rounded-full bg-white ring-1 ring-cyan-100"><div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${value}%` }} /></div><p className="mt-2 text-xs font-bold text-slate-500">simulation · validation humaine</p></div>;
}

export function QuayLine({ quay, onClick }: { quay: MinistryRegionalQuay; onClick: () => void }) {
  return <button onClick={onClick} className="mb-2 grid w-full gap-2 rounded-2xl bg-cyan-50/70 p-3 text-left ring-1 ring-cyan-100"><span className="flex justify-between gap-3 text-sm font-black"><span className="truncate">{quay.name}</span><span>{quay.priorityScore}/100</span></span><span className="h-2 rounded-full bg-white"><span className={`block h-full rounded-full ${tensionColor(quay.tension)}`} style={{ width: `${quay.priorityScore}%` }} /></span></button>;
}

export function Bars({ quays, max }: { quays: MinistryRegionalQuay[]; max: number }) {
  return <div className="grid gap-3">{quays.map((quay) => <div key={quay.id} className="grid gap-2"><div className="flex justify-between text-sm font-black"><span>{quay.name}</span><span>{quay.tonnage} t</span></div><div className="h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-400" style={{ width: `${Math.max(12, (quay.tonnage / max) * 100)}%` }} /></div></div>)}</div>;
}

export function Seafood({ quay, onClick }: { quay: MinistryRegionalQuay; onClick: () => void }) {
  return <article className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm"><div className="flex justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{quay.name}</p><p className="text-xs font-bold text-slate-500">{quay.landings} débarquements · {quay.sevenDayVariation}</p></div><StatusPill label={quay.tension} /></div><p className="mt-3 text-2xl font-black text-cyan-950">{quay.tonnage} t</p><p className="mt-2 break-words text-xs font-semibold text-slate-600">{quay.mainSpecies.join(", ")}</p><SmallButton onClick={onClick}>Demander relevé</SmallButton></article>;
}

export function Signal({ quay, label, focus, onAction }: { quay: MinistryRegionalQuay; label: string; focus: boolean; onAction: (action: string) => void }) {
  return <div className={`mb-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/45 p-4 ${focus ? "ring-2 ring-amber-300" : ""}`}><div className="flex justify-between gap-3"><div><p className="font-black">{label}</p><p className="text-xs font-bold text-slate-500">{quay.name} · {quay.region}</p></div><StatusPill label={quay.tension} /></div><p className="mt-3 text-sm font-semibold text-slate-600">Signal à vérifier · données mockées · vérification humaine requise.</p><Actions primary="Vérifier" secondary={["Créer note", "Ajouter trace"]} onAction={onAction} /></div>;
}

export function Referent({ quay, status, onClick }: { quay: MinistryRegionalQuay; status: string; onClick: () => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"><div className="flex justify-between gap-3"><div><p className="text-sm font-black">{quay.referents[0]}</p><p className="text-xs font-semibold text-slate-500">{quay.name} · {quay.region}</p></div><StatusPill label={status} /></div><p className="mt-2 text-xs font-bold text-slate-600">{quay.recommendedAction}</p><SmallButton onClick={onClick}>Compte rendu</SmallButton></div>;
}

export function ProgramCard({ program, status, onAction }: { program: { name: string; partner: string; objective: string; milestone: string; quay: MinistryRegionalQuay }; status: string; onAction: (action: string) => void }) {
  return <article className="rounded-[1.4rem] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/50 to-emerald-50/40 p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-base font-black text-cyan-950">{program.name}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">{program.partner}</p></div><StatusPill label={status} /></div><div className="mt-4 grid gap-2 text-sm font-bold text-slate-700 sm:grid-cols-2"><Row label="Quai couvert" value={program.quay.name} /><Row label="Objectif" value={program.objective} /><Row label="Enveloppe" value={program.quay.pendingFunding} /><Row label="Jalon" value={program.milestone} /></div><Actions primary="Ouvrir arbitrage" secondary={["Demander justificatif", "Ajouter à la note", "Créer action de suivi"]} onAction={onAction} /></article>;
}

export function FundingCard({ quay, object, status, onAction }: { quay: MinistryRegionalQuay; object: string; status: string; onAction: (action: string) => void }) {
  const urgency = quay.tension === "Critique" ? "Critique" : quay.tension === "Forte" ? "Forte" : "Moyenne";
  return <article className="rounded-[1.35rem] border border-amber-100 bg-gradient-to-br from-white via-amber-50/45 to-cyan-50/35 p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-black">{quay.name} · {object}</p><p className="mt-1 text-xs font-bold text-slate-500">{quay.region} · justificatif {quay.proofLevel}</p></div><StatusPill label={urgency} /></div><div className="mt-3 grid gap-2 sm:grid-cols-3"><MiniStat label="Montant" value={quay.pendingFunding} /><MiniStat label="Budget" value={`${quay.budgetExecution}%`} /><MiniStat label="Statut" value={status} /></div><Actions primary="Préparer note" secondary={["Demander complément terrain", "Prioriser financement", "Marquer à vérifier"]} onAction={onAction} /></article>;
}

export function ResourceLine({ item, onAction }: { item: { resource: string; available: number; state: string; critical: number }; onAction: () => void }) {
  const level = item.state === "Critique" ? 20 : item.state === "Partiel" ? 58 : 88;
  return <div className="rounded-2xl border border-cyan-100 bg-white/85 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black">{item.resource}</p><p className="text-xs font-semibold text-slate-500">{item.available} quai(s) équipés · {item.critical} sous tension</p></div><StatusPill label={item.state} /></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400" style={{ width: `${level}%` }} /></div><SmallButton onClick={onAction}>Suivre ce moyen</SmallButton></div>;
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-cyan-100"><p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-cyan-700">{label}</p><p className="mt-1 text-sm font-black text-cyan-950">{value}</p></div>;
}

export function WatchSignal({ item, onAction }: { item: readonly [string, string, string, string, string]; onAction: (action: string) => void }) {
  return <article className={`rounded-[1.35rem] border p-4 ${badgeTone(item[3])}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{item[0]}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em]">{item[1]} · {item[2]}</p></div><StatusPill label={item[3]} /></div><p className="mt-3 text-sm font-semibold">Source : {item[4]}</p><Actions primary="Traiter le signal" secondary={["Créer note", "Demander complément", "Ajouter à la synthèse"]} onAction={onAction} /></article>;
}

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="w-full overflow-x-auto rounded-2xl border border-cyan-100"><table className="min-w-full text-left text-sm"><thead className="bg-cyan-50 text-xs font-black uppercase tracking-[0.12em] text-cyan-900"><tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-cyan-50 bg-white/80">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 font-semibold text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function Row({ label, value }: { label: string; value: string }) {
  return <p className="flex justify-between gap-3 border-b border-cyan-50 py-2 text-sm font-bold text-slate-600"><span>{label}</span><b className="text-right text-slate-900">{value}</b></p>;
}

function Actions({ primary, secondary, onAction }: { primary: string; secondary: string[]; onAction: (action: string) => void }) {
  return <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => runThenRoute(primary, onAction)} className="rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-3 py-2 text-xs font-black text-white shadow-sm">{primary}</button>{secondary.map((item) => <button key={item} onClick={() => runThenRoute(item, onAction)} className="rounded-full border border-cyan-100 bg-white px-3 py-2 text-xs font-black text-cyan-950 shadow-sm">{item}</button>)}</div>;
}

function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="mt-4 rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-3 py-2 text-xs font-black text-white shadow-sm">{children}</button>;
}

export function StatusPill({ label }: { label: string }) {
  return <span className={`relative inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em] before:h-1.5 before:w-1.5 before:rounded-full ${badgeTone(label)}`}>{label}</span>;
}
