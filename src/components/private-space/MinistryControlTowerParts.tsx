"use client";

import type { ReactNode } from "react";
import type { AssistedInsight, CommunityNeed, ImpactProject, LiveSignal, Partner, PartnerOpportunity, PilotPirogue, PreventionSignal, Quay, SensitiveZone, SignalLevel, TrainingProgram, TensionLevel } from "@/data/ministryControlTowerData";

const tensionLabels: Record<TensionLevel, string> = {
  faible: "Faible",
  moderee: "Moderee",
  forte: "Forte",
  critique: "Critique"
};

const levelStyles: Record<SignalLevel | TensionLevel, string> = {
  info: "border-cyan-200 bg-cyan-50 text-cyan-900",
  attention: "border-amber-200 bg-amber-50 text-amber-900",
  prioritaire: "border-rose-200 bg-rose-50 text-rose-900",
  faible: "border-emerald-200 bg-emerald-50 text-emerald-900",
  moderee: "border-cyan-200 bg-cyan-50 text-cyan-900",
  forte: "border-amber-200 bg-amber-50 text-amber-900",
  critique: "border-rose-200 bg-rose-50 text-rose-900"
};

export const primaryButton = "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-cyan-900/20 transition hover:from-cyan-800 hover:to-emerald-700";
export const secondaryButton = "inline-flex items-center justify-center rounded-full border border-cyan-200 bg-white/85 px-5 py-3 text-sm font-black text-cyan-950 shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50";

export function Badge({ children, tone = "info" }: { children: ReactNode; tone?: SignalLevel | TensionLevel }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${levelStyles[tone]}`}>{children}</span>;
}

export function ShellCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[2rem] border border-cyan-100 bg-white/88 p-5 shadow-[0_18px_55px_rgba(8,145,178,0.10)] ${className}`}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
      <h2 className="mt-2 max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-slate-600">{description}</p>
    </div>
  </div>;
}

export function StatCard({ label, value, detail, tone = "info" }: { label: string; value: string; detail: string; tone?: SignalLevel | TensionLevel }) {
  return <div className="rounded-[1.35rem] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/55 to-emerald-50/45 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{label}</p><Badge tone={tone}>{tensionLabels[tone as TensionLevel] ?? tone}</Badge></div>
    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{detail}</p>
  </div>;
}

export function ModuleTabs({ active, onChange }: { active: "map" | "community" | "proof"; onChange: (module: "map" | "community" | "proof") => void }) {
  const items = [
    ["map", "Carte nationale", "Voir, detecter, qualifier"],
    ["community", "Communautes & impact", "Transformer le terrain en programmes"],
    ["proof", "Pilotage & preuve", "Mesurer, arbitrer, prouver"]
  ] as const;
  return <div className="grid gap-3 lg:grid-cols-3">
    {items.map(([id, label, description]) => <button key={id} onClick={() => onChange(id)} className={`rounded-[1.4rem] border p-4 text-left transition ${active === id ? "border-cyan-400 bg-gradient-to-br from-cyan-800 via-teal-700 to-emerald-600 text-white shadow-lg shadow-cyan-900/20" : "border-cyan-100 bg-white/80 text-slate-800 hover:border-cyan-300 hover:bg-cyan-50"}`}>
      <p className="text-base font-black">{label}</p>
      <p className={`mt-1 text-xs font-bold ${active === id ? "text-cyan-50" : "text-slate-500"}`}>{description}</p>
    </button>)}
  </div>;
}

export function ControlMap({ quays, pirogues, zones, selectedId, onSelect }: { quays: Quay[]; pirogues: PilotPirogue[]; zones: SensitiveZone[]; selectedId: string; onSelect: (id: string) => void }) {
  return <div className="relative min-h-[34rem] overflow-hidden rounded-[2.4rem] border border-cyan-200 bg-[radial-gradient(circle_at_22%_25%,rgba(34,211,238,0.28),transparent_26%),radial-gradient(circle_at_70%_78%,rgba(16,185,129,0.18),transparent_24%),linear-gradient(145deg,#06263f_0%,#073854_42%,#0e746d_100%)] p-5 text-white shadow-2xl shadow-cyan-950/20">
    <div className="absolute inset-y-0 left-[33%] w-[17%] rounded-[52%_42%_48%_55%] bg-gradient-to-b from-[#e7d8aa]/90 via-[#bba66c]/85 to-[#6f8d6d]/80 opacity-90 blur-[0.5px]" />
    <div className="absolute inset-y-5 left-[38%] w-[9%] rounded-[55%_45%_50%_54%] border border-white/20 bg-[#163f37]/35" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M38 5 C46 20 40 35 48 50 C56 65 49 78 58 95" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="0.45" strokeDasharray="1.5 2" />
      <path d="M25 18 C38 28 47 42 62 68" fill="none" stroke="rgba(103,232,249,.36)" strokeWidth="0.35" strokeDasharray="2 2" />
      <path d="M35 82 C48 68 61 56 77 41" fill="none" stroke="rgba(167,243,208,.32)" strokeWidth="0.35" strokeDasharray="2 3" />
    </svg>
    {zones.map((zone) => <div key={zone.id} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${zone.level === "prioritaire" ? "border-rose-300/70 bg-rose-400/18" : "border-amber-200/60 bg-amber-300/14"}`} style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.radius * 2}px`, height: `${zone.radius * 2}px`, boxShadow: "0 0 45px rgba(34,211,238,.22)" }} title={zone.reason} />)}
    {pirogues.map((pirogue) => <div key={pirogue.id} className="absolute h-2 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75 shadow-[0_0_18px_rgba(255,255,255,.55)]" style={{ left: `${pirogue.x}%`, top: `${pirogue.y}%`, transform: "translate(-50%, -50%) rotate(-18deg)" }} title={`${pirogue.registration} · ${pirogue.status}`} />)}
    {quays.map((quay) => {
      const selected = quay.id === selectedId;
      return <button key={quay.id} onClick={() => onSelect(quay.id)} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border p-1 transition ${selected ? "border-white bg-cyan-300 shadow-[0_0_0_8px_rgba(34,211,238,.22),0_0_30px_rgba(34,211,238,.9)]" : quay.tension === "critique" ? "border-rose-200 bg-rose-400 shadow-[0_0_22px_rgba(251,113,133,.72)]" : quay.tension === "forte" ? "border-amber-100 bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,.55)]" : "border-emerald-100 bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.48)]"}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} aria-label={`Selectionner ${quay.name}`}>
        <span className="block h-3 w-3 rounded-full bg-white" />
      </button>;
    })}
    <div className="absolute left-5 top-5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Carte nationale</p>
      <p className="mt-2 text-2xl font-black">Supervision littorale</p>
      <p className="mt-2 max-w-sm text-xs font-bold leading-5 text-cyan-50">La cartographie devient le point d'entree de la coordination.</p>
    </div>
    <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2 text-xs font-black">
      <span className="rounded-full bg-white/12 px-3 py-2 backdrop-blur">Quais</span>
      <span className="rounded-full bg-white/12 px-3 py-2 backdrop-blur">Pirogues pilotes</span>
      <span className="rounded-full bg-white/12 px-3 py-2 backdrop-blur">Zones sensibles</span>
      <span className="rounded-full bg-white/12 px-3 py-2 backdrop-blur">Signaux a qualifier</span>
    </div>
  </div>;
}

export function QuayPanel({ quay, onCommunity, onProof }: { quay: Quay; onCommunity: () => void; onProof: () => void }) {
  return <ShellCard className="h-full">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Quai selectionne</p><h3 className="mt-2 text-3xl font-black text-slate-950">{quay.name}</h3><p className="text-sm font-bold text-slate-500">{quay.region} · {quay.commune}</p></div><Badge tone={quay.tension}>{tensionLabels[quay.tension]}</Badge></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><DataPoint label="Activite" value={`${quay.volumeTons} t`} /><DataPoint label="Debarquements" value={String(quay.landings)} /><DataPoint label="Pirogues actives" value={String(quay.activePirogues)} /><DataPoint label="Alertes" value={String(quay.alerts)} /></div>
    <div className="mt-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Especes principales</p><div className="mt-2 flex flex-wrap gap-2">{quay.mainSpecies.map((species) => <span key={species} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{species}</span>)}</div></div>
    <div className="mt-5 rounded-2xl bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-amber-800">Besoin communautaire prioritaire</p><p className="mt-2 text-sm font-bold leading-6 text-amber-950">{quay.communityNeed}</p></div>
    <div className="mt-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Signaux a qualifier</p><ul className="mt-2 grid gap-2">{quay.signalsToQualify.map((signal) => <li key={signal} className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-xs font-bold text-cyan-950">{signal}</li>)}</ul></div>
    <div className="mt-5 rounded-2xl bg-gradient-to-br from-cyan-700 to-teal-700 p-4 text-white"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-100">Recommandation ministere</p><p className="mt-2 text-sm font-bold leading-6">{quay.ministryRecommendation}</p></div>
    <div className="mt-5 flex flex-wrap gap-2"><button onClick={onCommunity} className={secondaryButton}>Voir le besoin</button><button onClick={onProof} className={primaryButton}>Preparer preuve</button></div>
  </ShellCard>;
}

export function LiveFeed({ items }: { items: LiveSignal[] }) {
  return <ShellCard><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Flux temps reel simule</p><div className="mt-4 grid gap-3">{items.map((item) => <div key={item.id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-2xl border border-cyan-100 bg-white/75 p-3"><span className="text-sm font-black text-cyan-800">{item.time}</span><div><p className="text-sm font-black text-slate-900">{item.label}</p><p className="text-xs font-semibold text-slate-500">{item.territory}</p></div><Badge tone={item.level}>{item.level}</Badge></div>)}</div></ShellCard>;
}

export function AssistedPanel({ insight }: { insight: AssistedInsight }) {
  return <ShellCard className="bg-gradient-to-br from-white via-cyan-50/75 to-emerald-50/70"><div className="flex flex-wrap items-center gap-2"><Badge tone="info">Lecture assistee</Badge><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">V1 simulee</span></div><h3 className="mt-3 text-xl font-black text-slate-950">{insight.title}</h3><p className="mt-3 text-sm font-bold leading-6 text-slate-600">{insight.body}</p><p className="mt-4 rounded-2xl bg-white/85 p-3 text-sm font-black leading-6 text-cyan-950">Proposition a valider : {insight.recommendation}</p><p className="mt-3 text-xs font-bold text-slate-500">En V1, Mbàmbulaan prefigure une lecture assistee. L'humain valide chaque decision.</p></ShellCard>;
}

export function NeedCard({ need }: { need: CommunityNeed }) {
  return <article className="rounded-[1.6rem] border border-cyan-100 bg-white/88 p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{need.category}</p><h3 className="mt-2 text-lg font-black text-slate-950">{need.territory}</h3></div><Badge tone={need.urgency}>{tensionLabels[need.urgency]}</Badge></div><p className="mt-3 text-sm font-bold leading-6 text-slate-600">{need.summary}</p><div className="mt-4 grid gap-2 text-xs font-bold text-slate-600"><DataRow label="Public" value={need.audience} /><DataRow label="Beneficiaires" value={`${need.beneficiaries} estimes`} /><DataRow label="Statut" value={need.status} /><DataRow label="Partenaire" value={need.partner} /></div><div className="mt-4 flex flex-wrap gap-2"><button className={primaryButton}>Qualifier le besoin</button><button className={secondaryButton}>Transformer en projet</button><button className={secondaryButton}>Preparer note</button></div></article>;
}

export function ProjectCard({ project }: { project: ImpactProject }) {
  return <article className="rounded-[1.8rem] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/45 to-emerald-50/35 p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="text-xl font-black text-slate-950">{project.name}</h3><Badge tone={project.urgency}>{tensionLabels[project.urgency]}</Badge></div><p className="mt-2 text-sm font-bold text-slate-500">{project.territory} · {project.owner}</p><p className="mt-4 text-sm font-bold leading-6 text-slate-700">{project.problem}</p><div className="mt-4 grid gap-2 text-xs font-bold text-slate-600"><DataRow label="Impact attendu" value={project.expectedImpact} /><DataRow label="Budget" value={project.budget} /><DataRow label="Statut" value={project.status} /><DataRow label="Partenaire cible" value={project.partnerTarget} /><DataRow label="Maturite" value={project.maturity} /></div><div className="mt-5 flex flex-wrap gap-2"><button className={primaryButton}>Preparer fiche partenaire</button><button className={secondaryButton}>Classer prioritaire</button><button className={secondaryButton}>Demander complement</button></div></article>;
}

export function ProgramCard({ program }: { program: TrainingProgram }) {
  return <article className="rounded-[1.6rem] border border-cyan-100 bg-white/88 p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-black text-slate-950">{program.title}</h3><Badge tone={program.status.includes("Prioritaire") ? "attention" : "info"}>{program.status}</Badge></div><p className="mt-3 text-sm font-bold leading-6 text-slate-600">{program.objective}</p><div className="mt-4 grid gap-2 text-xs font-bold text-slate-600"><DataRow label="Territoire" value={program.territory} /><DataRow label="Public" value={program.audience} /><DataRow label="Partenaire" value={program.partner} /><DataRow label="Periode" value={program.period} /><DataRow label="Participants" value={`${program.participants} attendus`} /><DataRow label="Impact" value={program.impactIndicator} /></div><div className="mt-4 flex flex-wrap gap-2"><button className={primaryButton}>Planifier session</button><button className={secondaryButton}>Preparer note partenaire</button><button className={secondaryButton}>Suivre participation</button></div></article>;
}

export function PreventionSignalCard({ signal }: { signal: PreventionSignal }) {
  return <article className="rounded-[1.4rem] border border-cyan-100 bg-white/88 p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-base font-black text-slate-950">{signal.label}</h3><Badge tone={signal.level}>{signal.level}</Badge></div><p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-cyan-700">{signal.territory} · {signal.type}</p><p className="mt-3 text-sm font-bold leading-6 text-slate-600">{signal.recommendedAction}</p><p className="mt-3 text-xs font-semibold text-slate-500">Source mockee : {signal.source}. Situation a qualifier, sans accusation automatique.</p></article>;
}

export function PartnerCard({ partner }: { partner: Partner }) {
  return <article className="rounded-[1.4rem] border border-cyan-100 bg-white/85 p-4"><p className="text-sm font-black text-cyan-950">{partner.family}</p><p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{partner.role}</p><p className="mt-3 text-sm font-bold leading-6 text-slate-600">{partner.potentialContribution}</p></article>;
}

export function PartnerOpportunityCard({ opportunity }: { opportunity: PartnerOpportunity }) {
  return <article className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-base font-black text-emerald-950">{opportunity.title}</p><p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">{opportunity.partnerFamily} · {opportunity.territory}</p><p className="mt-3 text-sm font-bold leading-6 text-slate-700">{opportunity.expectedValue}</p></article>;
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-1.5 last:border-b-0"><span className="text-slate-500">{label}</span><span className="max-w-[68%] text-right text-slate-900">{value}</span></div>;
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-3"><p className="text-xs font-black uppercase tracking-[0.1em] text-cyan-700">{label}</p><p className="mt-1 text-xl font-black text-cyan-950">{value}</p></div>;
}
