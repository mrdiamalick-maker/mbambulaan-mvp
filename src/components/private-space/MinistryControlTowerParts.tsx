"use client";

import type { ReactNode } from "react";
import type { CommunityNeed, CommunityProject, Landing, Level, MapAlert, Pirogue, Quay, TrainingProgram } from "@/data/ministryControlTowerData";

const levelLabels: Record<Level, string> = {
  normal: "Normal",
  surveillance: "À surveiller",
  urgent: "Urgent"
};

const levelStyles: Record<Level, string> = {
  normal: "border-emerald-200 bg-emerald-50 text-emerald-900",
  surveillance: "border-amber-200 bg-amber-50 text-amber-900",
  urgent: "border-rose-200 bg-rose-50 text-rose-900"
};

export const primaryButton = "inline-flex items-center justify-center rounded-full bg-cyan-800 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-cyan-900/20 transition hover:bg-cyan-900";
export const secondaryButton = "inline-flex items-center justify-center rounded-full border border-cyan-200 bg-white px-4 py-2.5 text-sm font-black text-cyan-950 transition hover:border-cyan-400 hover:bg-cyan-50";

export function Badge({ level, children }: { level?: Level; children?: ReactNode }) {
  const label = children ?? (level ? levelLabels[level] : "Info");
  const style = level ? levelStyles[level] : "border-cyan-200 bg-cyan-50 text-cyan-900";
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${style}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}

export function ShellCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-cyan-100 bg-white p-5 shadow-[0_18px_48px_rgba(8,145,178,0.08)] ${className}`}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-5">
    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
    <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-600">{description}</p>
  </div>;
}

export function ModuleTabs({ active, onChange }: { active: "map" | "community" | "tracking"; onChange: (module: "map" | "community" | "tracking") => void }) {
  const items = [
    ["map", "Carte & supervision", "Quais, pirogues, débarquements, alertes"],
    ["community", "Communautés & programmes", "Besoins terrain, projets, formations"],
    ["tracking", "Indicateurs & suivi", "Chiffres clés, actions, tendances"]
  ] as const;
  return <div className="grid gap-3 lg:grid-cols-3">
    {items.map(([id, label, description]) => <button key={id} onClick={() => onChange(id)} className={`rounded-2xl border p-4 text-left transition ${active === id ? "border-cyan-700 bg-cyan-800 text-white shadow-lg shadow-cyan-900/15" : "border-cyan-100 bg-white text-slate-800 hover:border-cyan-300 hover:bg-cyan-50"}`}>
      <p className="text-base font-black">{label}</p>
      <p className={`mt-1 text-xs font-bold ${active === id ? "text-cyan-50" : "text-slate-500"}`}>{description}</p>
    </button>)}
  </div>;
}

export function StatCard({ label, value, detail, action }: { label: string; value: string; detail: string; action?: string }) {
  return <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/60 to-emerald-50/35 p-4">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{label}</p>
    <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{detail}</p>
    {action ? <p className="mt-3 text-xs font-black text-cyan-800">Action : {action}</p> : null}
  </div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">
    {label}
    {children}
  </label>;
}

export const selectClass = "w-full rounded-2xl border border-cyan-100 bg-white px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";
export const inputClass = "w-full rounded-2xl border border-cyan-100 bg-white px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

export function MinistryMap({ quays, pirogues, alerts, selectedId, selectedKind, onSelectQuay, onSelectPirogue }: {
  quays: Quay[];
  pirogues: Pirogue[];
  alerts: MapAlert[];
  selectedId: string;
  selectedKind: "quay" | "pirogue";
  onSelectQuay: (id: string) => void;
  onSelectPirogue: (id: string) => void;
}) {
  return <div className="relative min-h-[34rem] overflow-hidden rounded-3xl border border-cyan-200 bg-[linear-gradient(135deg,#082f49_0%,#075985_40%,#0f766e_100%)] p-4 text-white shadow-2xl shadow-cyan-950/20">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:46px_46px] opacity-35" />
    <div className="absolute inset-y-7 left-[34%] w-[17%] rounded-[52%_42%_48%_55%] bg-gradient-to-b from-[#f0dfb1] via-[#a89d68] to-[#4f7f68] opacity-95" />
    <div className="absolute left-[27%] top-[10%] rounded-full border border-white/20 px-3 py-1 text-xs font-black text-cyan-50">Saint-Louis</div>
    <div className="absolute left-[41%] top-[44%] rounded-full border border-white/20 px-3 py-1 text-xs font-black text-cyan-50">Dakar / Thiès</div>
    <div className="absolute left-[20%] top-[84%] rounded-full border border-white/20 px-3 py-1 text-xs font-black text-cyan-50">Ziguinchor</div>
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-75" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M38 5 C46 20 40 35 48 50 C56 65 49 78 58 95" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="0.5" strokeDasharray="1.6 2.1" />
      <path d="M18 18 C34 28 50 45 68 76" fill="none" stroke="rgba(103,232,249,.38)" strokeWidth="0.35" strokeDasharray="2 2" />
    </svg>
    {alerts.map((alert) => {
      const quay = quays.find((item) => item.id === alert.quayId);
      if (!quay) return null;
      return <span key={alert.id} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${alert.level === "urgent" ? "border-rose-200 bg-rose-400/25" : "border-amber-200 bg-amber-300/20"}`} style={{ left: `${quay.x}%`, top: `${quay.y}%`, width: 58, height: 58 }} title={alert.title} />;
    })}
    {pirogues.map((pirogue) => <button key={pirogue.id} onClick={() => onSelectPirogue(pirogue.id)} className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[10px] font-black shadow-lg transition ${selectedKind === "pirogue" && selectedId === pirogue.id ? "border-white bg-white text-cyan-950" : "border-white/50 bg-cyan-200/85 text-cyan-950 hover:bg-white"}`} style={{ left: `${pirogue.x}%`, top: `${pirogue.y}%` }} title={pirogue.registration}>{pirogue.registration}</button>)}
    {quays.map((quay) => <button key={quay.id} onClick={() => onSelectQuay(quay.id)} className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border p-1 transition ${selectedKind === "quay" && selectedId === quay.id ? "border-white bg-cyan-300 shadow-[0_0_0_8px_rgba(34,211,238,.24),0_0_28px_rgba(34,211,238,.85)]" : quay.level === "urgent" ? "border-rose-100 bg-rose-400 shadow-[0_0_20px_rgba(251,113,133,.68)]" : quay.level === "surveillance" ? "border-amber-100 bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,.58)]" : "border-emerald-100 bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.48)]"}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} aria-label={`Sélectionner ${quay.name}`}>
      <span className="block h-3.5 w-3.5 rounded-full bg-white" />
      <span className="absolute left-5 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-white/95 px-2 py-1 text-[11px] font-black text-cyan-950 shadow sm:block">{quay.name}</span>
    </button>)}
    <div className="absolute left-4 top-4 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Carte littorale</p>
      <p className="mt-1 text-xl font-black">Quais et pirogues</p>
    </div>
    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-xs font-black">
      <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">Quai</span>
      <span className="rounded-full bg-cyan-200/85 px-3 py-2 text-cyan-950">Pirogue</span>
      <span className="rounded-full bg-amber-300/25 px-3 py-2">À surveiller</span>
      <span className="rounded-full bg-rose-400/25 px-3 py-2">Urgent</span>
    </div>
  </div>;
}

export function QuayDetail({ quay, landings, pirogues, alerts }: { quay: Quay; landings: Landing[]; pirogues: Pirogue[]; alerts: MapAlert[] }) {
  return <ShellCard className="h-full">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Quai sélectionné</p><h3 className="mt-2 text-2xl font-black text-slate-950">{quay.name}</h3><p className="text-sm font-bold text-slate-500">{quay.region} · {quay.commune}</p></div><Badge level={quay.level} /></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><DataPoint label="Coordonnées" value={`${quay.coordinates.lat.toFixed(4)}, ${quay.coordinates.lng.toFixed(4)}`} /><DataPoint label="Débarquements" value={String(quay.landingsToday)} /><DataPoint label="Volume" value={`${quay.volumeTons} t`} /><DataPoint label="Pirogues actives" value={String(quay.activePirogues)} /></div>
    <div className="mt-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Espèces principales</p><div className="mt-2 flex flex-wrap gap-2">{quay.species.map((species) => <span key={species} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{species}</span>)}</div></div>
    <div className="mt-5 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Alertes en cours" value={String(alerts.length)} /><DataRow label="Dernière mise à jour" value={quay.lastUpdated} /><DataRow label="Débarquements consultables" value={String(landings.length)} /><DataRow label="Immatriculations visibles" value={String(pirogues.length)} /></div>
    <div className="mt-5 grid gap-2">{alerts.slice(0, 2).map((alert) => <div key={alert.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-3"><p className="text-sm font-black text-amber-950">{alert.title}</p><p className="mt-1 text-xs font-bold text-amber-800">{alert.nextAction}</p></div>)}</div>
    <div className="mt-5 flex flex-wrap gap-2"><button className={primaryButton}>Voir débarquements</button><button className={secondaryButton}>Voir pirogues</button><button className={secondaryButton}>Créer une alerte</button></div>
  </ShellCard>;
}

export function PirogueDetail({ pirogue, quay }: { pirogue: Pirogue; quay: Quay }) {
  return <ShellCard className="h-full">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Pirogue sélectionnée</p><h3 className="mt-2 text-2xl font-black text-slate-950">{pirogue.registration}</h3><p className="text-sm font-bold text-slate-500">Rattachée à {quay.name}</p></div><Badge level={pirogue.level} /></div>
    <div className="mt-5 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Statut" value={pirogue.status} /><DataRow label="Dernière position" value={pirogue.lastPosition} /><DataRow label="Dernière déclaration" value={pirogue.lastDeclaration} /><DataRow label="Activité déclarée" value={pirogue.declaredActivity} /></div>
    <div className="mt-5 flex flex-wrap gap-2"><button className={primaryButton}>Voir fiche pirogue</button><button className={secondaryButton}>Demander vérification</button><button className={secondaryButton}>Associer au quai</button></div>
  </ShellCard>;
}

export function CompactQuayTable({ rows }: { rows: Array<{ quay: Quay; landings: Landing[]; pirogues: Pirogue[]; alerts: MapAlert[] }> }) {
  return <div className="overflow-x-auto rounded-2xl border border-cyan-100 bg-white">
    <table className="min-w-[760px] w-full text-left text-sm">
      <thead className="bg-cyan-50 text-xs font-black uppercase tracking-[0.12em] text-cyan-800"><tr><th className="px-4 py-3">Quai</th><th className="px-4 py-3">Région</th><th className="px-4 py-3">Débarquements</th><th className="px-4 py-3">Volume</th><th className="px-4 py-3">Pirogues actives</th><th className="px-4 py-3">Espèces</th><th className="px-4 py-3">Alertes</th><th className="px-4 py-3">Mise à jour</th></tr></thead>
      <tbody className="divide-y divide-cyan-50">{rows.map(({ quay, landings, pirogues, alerts }) => <tr key={quay.id} className="align-top"><td className="px-4 py-3 font-black text-slate-950">{quay.name}</td><td className="px-4 py-3 font-bold text-slate-600">{quay.region}</td><td className="px-4 py-3 font-bold text-slate-700">{landings.length}</td><td className="px-4 py-3 font-bold text-slate-700">{quay.volumeTons} t</td><td className="px-4 py-3 font-bold text-slate-700">{pirogues.length}</td><td className="px-4 py-3 font-bold text-slate-700">{quay.species.join(", ")}</td><td className="px-4 py-3"><Badge level={alerts.some((alert) => alert.level === "urgent") ? "urgent" : alerts.length ? "surveillance" : "normal"}>{String(alerts.length)}</Badge></td><td className="px-4 py-3 font-bold text-slate-600">{quay.lastUpdated}</td></tr>)}</tbody>
    </table>
  </div>;
}

export function NeedCard({ need }: { need: CommunityNeed }) {
  return <article className="rounded-2xl border border-cyan-100 bg-white p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-black text-slate-950">{need.need}</h3><Badge level={need.urgency} /></div><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Région" value={need.region} /><DataRow label="Lieu" value={need.place} /><DataRow label="Acteurs" value={need.actors} /><DataRow label="Statut" value={need.status} /><DataRow label="Prochaine action" value={need.nextAction} /></div></article>;
}

export function ProjectCard({ project }: { project: CommunityProject }) {
  return <article className="rounded-2xl border border-cyan-100 bg-white p-4"><h3 className="text-lg font-black text-slate-950">{project.project}</h3><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Territoire" value={project.territory} /><DataRow label="Porteur" value={project.owner} /><DataRow label="Bénéficiaires" value={String(project.beneficiaries)} /><DataRow label="Budget estimé" value={project.estimatedBudget} /><DataRow label="Statut" value={project.status} /><DataRow label="Partenaire cible" value={project.targetPartner} /></div><div className="mt-4 flex flex-wrap gap-2"><button className={primaryButton}>Préparer fiche projet</button><button className={secondaryButton}>Demander informations</button><button className={secondaryButton}>Marquer prioritaire</button></div></article>;
}

export function TrainingCard({ program }: { program: TrainingProgram }) {
  return <article className="rounded-2xl border border-cyan-100 bg-white p-4"><h3 className="text-lg font-black text-slate-950">{program.title}</h3><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Région" value={program.region} /><DataRow label="Public cible" value={program.target} /><DataRow label="Période" value={program.period} /><DataRow label="Partenaire potentiel" value={program.potentialPartner} /><DataRow label="Participants attendus" value={String(program.expectedParticipants)} /><DataRow label="Statut" value={program.status} /></div><div className="mt-4 flex flex-wrap gap-2"><button className={primaryButton}>Planifier</button><button className={secondaryButton}>Voir participants</button><button className={secondaryButton}>Préparer note</button></div></article>;
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-1.5 last:border-b-0"><span className="text-slate-500">{label}</span><span className="max-w-[68%] text-right text-slate-900">{value}</span></div>;
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-3"><p className="text-xs font-black uppercase tracking-[0.1em] text-cyan-700">{label}</p><p className="mt-1 text-base font-black text-cyan-950">{value}</p></div>;
}
