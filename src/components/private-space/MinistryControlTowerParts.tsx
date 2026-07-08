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
  return <div className="relative min-h-[42rem] overflow-hidden rounded-[2rem] border border-cyan-200 bg-[#053047] text-white shadow-2xl shadow-cyan-950/20">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ocean" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#06364f" />
          <stop offset="48%" stopColor="#075985" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="land" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3e4b7" />
          <stop offset="52%" stopColor="#d5b56d" />
          <stop offset="100%" stopColor="#5f8b65" />
        </linearGradient>
        <filter id="softShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.3" floodColor="#042f2e" floodOpacity="0.45" />
        </filter>
      </defs>
      <rect width="100" height="100" fill="url(#ocean)" />
      <path d="M0 82 C18 74 26 63 39 55 C55 45 70 27 100 12 L100 100 L0 100 Z" fill="#0e7490" opacity="0.18" />
      <path d="M0 18 C16 24 28 34 37 45 C49 59 63 68 100 80" fill="none" stroke="#67e8f9" strokeWidth="0.28" strokeDasharray="2 2" opacity="0.38" />
      <path d="M43 2 C49 10 46 20 50 29 C56 42 50 49 57 59 C64 70 55 80 65 98 L100 98 L100 2 Z" fill="url(#land)" opacity="0.97" />
      <path d="M43 2 C49 10 46 20 50 29 C56 42 50 49 57 59 C64 70 55 80 65 98" fill="none" stroke="#f8fafc" strokeWidth="1.25" filter="url(#softShadow)" />
      <path d="M44 3 C50 12 47 20 52 29 C57 39 52 49 59 60 C64 68 58 77 66 96" fill="none" stroke="#083344" strokeWidth="0.35" strokeDasharray="1.2 1.4" opacity="0.5" />
      <path d="M54 67 L101 67 L101 76 L56 76 C58 73 58 70 54 67 Z" fill="#053047" opacity="0.42" />
      <text x="73" y="13" fill="#365314" fontSize="3.2" fontWeight="800">SÉNÉGAL</text>
      <text x="6" y="18" fill="#cffafe" fontSize="2.9" fontWeight="800">OCÉAN ATLANTIQUE</text>
      <text x="52" y="9" fill="#134e4a" fontSize="2.35" fontWeight="800">Saint-Louis</text>
      <text x="59" y="36" fill="#134e4a" fontSize="2.35" fontWeight="800">Louga</text>
      <text x="61" y="49" fill="#134e4a" fontSize="2.35" fontWeight="800">Thiès</text>
      <text x="62" y="56" fill="#134e4a" fontSize="2.35" fontWeight="800">Dakar</text>
      <text x="70" y="88" fill="#134e4a" fontSize="2.35" fontWeight="800">Casamance</text>
    </svg>

    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:52px_52px] opacity-20" />

    <div className="absolute left-4 top-4 z-40 max-w-[17rem] rounded-2xl border border-white/15 bg-slate-950/35 p-3 backdrop-blur-md">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Carte du littoral sénégalais</p>
      <p className="mt-1 text-lg font-black">Quais, pirogues et alertes</p>
      <p className="mt-2 text-xs font-bold leading-5 text-cyan-50/90">Représentation simplifiée pour la démonstration. Les coordonnées sont simulées.</p>
    </div>

    <div className="absolute right-4 top-4 z-40 rounded-2xl border border-white/15 bg-white/12 p-3 text-xs font-black backdrop-blur-md">
      <p className="text-cyan-100">N</p>
      <div className="mx-auto mt-1 h-8 w-0.5 bg-white/80" />
      <p className="mt-1 text-cyan-100">S</p>
    </div>

    {alerts.map((alert) => {
      const quay = quays.find((item) => item.id === alert.quayId);
      if (!quay) return null;
      return <span key={alert.id} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border ${alert.level === "urgent" ? "border-rose-200 bg-rose-400/25 shadow-[0_0_30px_rgba(251,113,133,.5)]" : "border-amber-200 bg-amber-300/25 shadow-[0_0_26px_rgba(252,211,77,.35)]"}`} style={{ left: `${quay.x}%`, top: `${quay.y}%`, width: 72, height: 72 }} title={alert.title} />;
    })}

    {pirogues.map((pirogue) => <button key={pirogue.id} onClick={() => onSelectPirogue(pirogue.id)} className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1.5 text-[10px] font-black shadow-lg transition ${selectedKind === "pirogue" && selectedId === pirogue.id ? "border-white bg-white text-cyan-950 shadow-[0_0_0_5px_rgba(255,255,255,.2)]" : "border-white/70 bg-cyan-100 text-cyan-950 hover:bg-white"}`} style={{ left: `${pirogue.x}%`, top: `${pirogue.y}%` }} title={pirogue.registration}>{pirogue.registration}</button>)}

    {quays.map((quay) => <button key={quay.id} onClick={() => onSelectQuay(quay.id)} className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-1.5 transition ${selectedKind === "quay" && selectedId === quay.id ? "border-white bg-cyan-300 shadow-[0_0_0_9px_rgba(34,211,238,.24),0_0_34px_rgba(34,211,238,.9)]" : quay.level === "urgent" ? "border-white bg-rose-400 shadow-[0_0_24px_rgba(251,113,133,.78)]" : quay.level === "surveillance" ? "border-white bg-amber-300 shadow-[0_0_22px_rgba(252,211,77,.6)]" : "border-white bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.52)]"}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} aria-label={`Sélectionner ${quay.name}`}>
      <span className="block h-3.5 w-3.5 rounded-full bg-white" />
      <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-cyan-100 bg-white px-2.5 py-1 text-[11px] font-black text-cyan-950 shadow-lg">{quay.name}</span>
    </button>)}

    <div className="absolute bottom-4 left-4 right-4 z-50 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-950/35 p-3 text-xs font-black backdrop-blur-md">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white px-3 py-2 text-cyan-950">Quai</span>
        <span className="rounded-full bg-cyan-100 px-3 py-2 text-cyan-950">Pirogue immatriculée</span>
        <span className="rounded-full bg-amber-300/80 px-3 py-2 text-amber-950">À surveiller</span>
        <span className="rounded-full bg-rose-400/85 px-3 py-2 text-white">Urgent</span>
      </div>
      <span className="rounded-full border border-white/20 px-3 py-2 text-cyan-50">Échelle visuelle simulée · Littoral nord-sud</span>
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
