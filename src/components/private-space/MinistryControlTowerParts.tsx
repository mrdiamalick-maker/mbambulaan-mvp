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

const pointStyles: Record<Level, string> = {
  normal: "border-emerald-100 bg-emerald-400 text-emerald-950 shadow-[0_0_28px_rgba(52,211,153,0.42)]",
  surveillance: "border-amber-100 bg-amber-300 text-amber-950 shadow-[0_0_30px_rgba(251,191,36,0.48)]",
  urgent: "border-rose-100 bg-rose-500 text-white shadow-[0_0_38px_rgba(244,63,94,0.52)]"
};

export const primaryButton = "inline-flex items-center justify-center rounded-xl border border-[#0b3142] bg-[#0b3142] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:border-[#062330] hover:bg-[#062330]";
export const secondaryButton = "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50";

export function Badge({ level, children }: { level?: Level; children?: ReactNode }) {
  const label = children ?? (level ? levelLabels[level] : "Info");
  const style = level ? levelStyles[level] : "border-cyan-200 bg-cyan-50 text-cyan-900";
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${style}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}

export function ShellCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[1.35rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] ${className}`}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-5">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
    <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
  </div>;
}

export function ModuleTabs({ active, onChange }: { active: "map" | "community" | "tracking"; onChange: (module: "map" | "community" | "tracking") => void }) {
  const items = [
    ["map", "Carte & supervision", "Quais, pirogues, débarquements, alertes"],
    ["community", "Communautés & programmes", "Besoins terrain, projets, formations"],
    ["tracking", "Indicateurs & suivi", "Situation du jour, actions, tendances"]
  ] as const;
  return <div className="grid gap-2 lg:grid-cols-3">
    {items.map(([id, label, description]) => <button key={id} onClick={() => onChange(id)} className={`rounded-2xl border p-4 text-left transition ${active === id ? "border-[#0b3142] bg-[#0b3142] text-white shadow-lg shadow-cyan-950/15" : "border-slate-200 bg-white text-slate-800 hover:border-cyan-300 hover:bg-cyan-50/70"}`}>
      <p className="text-base font-black">{label}</p>
      <p className={`mt-1 text-xs font-semibold ${active === id ? "text-cyan-50" : "text-slate-500"}`}>{description}</p>
    </button>)}
  </div>;
}

export function StatCard({ label, value, detail, action }: { label: string; value: string; detail: string; action?: string }) {
  return <div className="rounded-[1.15rem] border border-slate-200 bg-gradient-to-br from-white via-white to-cyan-50/45 p-4 shadow-sm">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
    <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{detail}</p>
    {action ? <p className="mt-3 text-xs font-black text-cyan-900">Action : {action}</p> : null}
  </div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">
    {label}
    {children}
  </label>;
}

export const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";
export const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold normal-case tracking-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

type MapViewMode = "quays" | "pirogues";

function sumLandingVolume(items: Landing[]) {
  return items.reduce((total, landing) => total + landing.volumeTons, 0).toFixed(1);
}

function getQuayVolume(quayId: string, landings: Landing[]) {
  return landings.filter((landing) => landing.quayId === quayId).reduce((total, landing) => total + landing.volumeTons, 0);
}

function formatCoordinate(value: number, axis: "lat" | "lng") {
  const suffix = axis === "lat" ? (value >= 0 ? "N" : "S") : (value >= 0 ? "E" : "O");
  return `${Math.abs(value).toFixed(3)}° ${suffix}`;
}

function MapChip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${active ? "border-cyan-200 bg-cyan-100 text-cyan-950" : "border-white/15 bg-white/10 text-slate-200"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}

function MapStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">{label}</p>
    <p className="mt-1 text-lg font-black text-white">{value}</p>
  </div>;
}

export function MinistryMap({ viewMode, quays, pirogues, alerts, landings, selectedId, selectedKind, onSelectQuay, onSelectPirogue }: {
  viewMode: MapViewMode;
  quays: Quay[];
  pirogues: Pirogue[];
  alerts: MapAlert[];
  landings: Landing[];
  selectedId: string;
  selectedKind: "quay" | "pirogue";
  onSelectQuay: (id: string) => void;
  onSelectPirogue: (id: string) => void;
}) {
  const selectedPirogue = selectedKind === "pirogue" ? pirogues.find((pirogue) => pirogue.id === selectedId) ?? null : null;
  const selectedQuay = selectedKind === "quay" ? quays.find((quay) => quay.id === selectedId) ?? null : selectedPirogue ? quays.find((quay) => quay.id === selectedPirogue.quayId) ?? null : null;
  const totalVolume = sumLandingVolume(landings);
  const activeSpecies = Array.from(new Set(landings.flatMap((landing) => landing.species))).slice(0, 4);

  return <div className="relative min-h-[48rem] overflow-hidden rounded-[1.75rem] border border-cyan-950/20 bg-[#061827] text-white shadow-[0_34px_100px_rgba(15,23,42,0.32)]">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="mapOceanGlow" cx="28%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#155e75" />
          <stop offset="46%" stopColor="#0c4a6e" />
          <stop offset="100%" stopColor="#031826" />
        </radialGradient>
        <linearGradient id="mapLand" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0dfb7" />
          <stop offset="44%" stopColor="#b9a36c" />
          <stop offset="100%" stopColor="#4f745f" />
        </linearGradient>
        <filter id="mapShadow">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.5" floodColor="#020617" floodOpacity="0.5" />
        </filter>
      </defs>
      <rect width="100" height="100" fill="url(#mapOceanGlow)" />
      <path d="M0 14 H100 M0 28 H100 M0 42 H100 M0 56 H100 M0 70 H100 M0 84 H100 M14 0 V100 M28 0 V100 M42 0 V100 M56 0 V100 M70 0 V100 M84 0 V100" stroke="#bae6fd" strokeWidth="0.08" opacity="0.24" />
      <path d="M4 19 C19 24 30 34 40 46 C51 59 66 73 95 86" fill="none" stroke="#dbeafe" strokeWidth="0.22" strokeDasharray="1.2 1.8" opacity="0.58" />
      <path d="M8 30 C22 35 32 43 42 55 C54 68 70 80 96 91" fill="none" stroke="#67e8f9" strokeWidth="0.18" strokeDasharray="1.1 2.2" opacity="0.42" />
      <path d="M45 1 C51 10 47 20 52 31 C58 43 51 51 58 61 C65 72 57 81 66 99 L100 99 L100 1 Z" fill="url(#mapLand)" />
      <path d="M45 1 C51 10 47 20 52 31 C58 43 51 51 58 61 C65 72 57 81 66 99" fill="none" stroke="#f8fafc" strokeWidth="1.25" filter="url(#mapShadow)" />
      <path d="M47 2 C52 12 49 22 54 32 C59 42 53 51 60 62 C65 70 60 79 68 98" fill="none" stroke="#0f172a" strokeWidth="0.28" strokeDasharray="1.1 1.5" opacity="0.52" />
      <path d="M49 16 C58 21 67 28 78 35" fill="none" stroke="#1f2937" strokeWidth="0.16" opacity="0.35" />
      <path d="M58 51 C68 53 79 58 91 66" fill="none" stroke="#1f2937" strokeWidth="0.16" opacity="0.35" />
      {viewMode === "pirogues" ? pirogues.map((pirogue) => {
        const quay = quays.find((item) => item.id === pirogue.quayId);
        if (!quay) return null;
        return <path key={`track-${pirogue.id}`} d={`M ${quay.x} ${quay.y} C ${quay.x - 7} ${quay.y - 3}, ${pirogue.x + 5} ${pirogue.y + 2}, ${pirogue.x} ${pirogue.y}`} fill="none" stroke={pirogue.level === "urgent" ? "#fecdd3" : "#bfdbfe"} strokeWidth="0.42" strokeDasharray="1.2 1.8" opacity="0.86" />;
      }) : null}
      <text x="73" y="13" fill="#1f2937" fontSize="3.2" fontWeight="900">SÉNÉGAL</text>
      <text x="6" y="17" fill="#e0f2fe" fontSize="2.5" fontWeight="900">ATLANTIQUE</text>
      <text x="50" y="10" fill="#1f2937" fontSize="2.15" fontWeight="900">Saint-Louis</text>
      <text x="58" y="36" fill="#1f2937" fontSize="2.15" fontWeight="900">Louga</text>
      <text x="61" y="48" fill="#1f2937" fontSize="2.15" fontWeight="900">Thiès</text>
      <text x="62" y="57" fill="#1f2937" fontSize="2.15" fontWeight="900">Dakar</text>
      <text x="69" y="88" fill="#1f2937" fontSize="2.15" fontWeight="900">Casamance</text>
    </svg>

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_70%_72%,rgba(45,212,191,0.14),transparent_30%)]" />

    <div className="absolute left-4 right-4 top-4 z-40 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="max-w-2xl rounded-2xl border border-white/15 bg-slate-950/60 p-4 backdrop-blur-md">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">{viewMode === "quays" ? "Vue quais" : "Vue pirogues"}</p>
        <h3 className="mt-1 text-xl font-black tracking-tight text-white">{viewMode === "quays" ? "Activité à terre et débarquements" : "Pirogues en mer et trajectoires déclarées"}</h3>
        <p className="mt-2 text-xs font-semibold leading-5 text-slate-300">Prototype cartographique sans dépendance payante. Les données conservent lat/lng et coordonnées visuelles pour une future intégration Leaflet ou MapLibre.</p>
      </div>
      <div className="flex flex-wrap items-start gap-2 rounded-2xl border border-white/15 bg-slate-950/50 p-3 backdrop-blur-md lg:justify-end">
        <MapChip active>Quais</MapChip>
        <MapChip active={viewMode === "pirogues"}>Pirogues</MapChip>
        <MapChip active={landings.length > 0}>Débarquements</MapChip>
        <MapChip active={alerts.length > 0}>Alertes</MapChip>
      </div>
    </div>

    <div className="absolute left-4 top-[9.2rem] z-40 grid max-w-[30rem] grid-cols-2 gap-2 sm:grid-cols-4">
      <MapStat label="Quais" value={String(quays.length)} />
      <MapStat label="Pirogues" value={String(pirogues.length)} />
      <MapStat label="Volume" value={`${totalVolume} t`} />
      <MapStat label="Alertes" value={String(alerts.length)} />
    </div>

    <div className="absolute right-4 top-[9.2rem] z-40 hidden rounded-2xl border border-white/15 bg-slate-950/50 p-3 text-center text-xs font-black backdrop-blur-md sm:block">
      <p className="text-slate-300">N</p>
      <div className="mx-auto my-1 h-10 w-0.5 bg-white/70" />
      <p className="text-slate-300">S</p>
    </div>

    {alerts.map((alert) => {
      const quay = quays.find((item) => item.id === alert.quayId);
      if (!quay) return null;
      return <button key={alert.id} onClick={() => onSelectQuay(quay.id)} className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border transition hover:scale-105 ${alert.level === "urgent" ? "border-rose-100 bg-rose-500/25 shadow-[0_0_42px_rgba(244,63,94,.56)]" : "border-amber-100 bg-amber-300/20 shadow-[0_0_34px_rgba(245,158,11,.4)]"}`} style={{ left: `${quay.x}%`, top: `${quay.y}%`, width: 88, height: 88 }} title={alert.title} aria-label={`Alerte ${alert.title}`} />;
    })}

    {landings.map((landing, index) => {
      const quay = quays.find((item) => item.id === landing.quayId);
      if (!quay) return null;
      const xOffset = (index % 3) * 1.7 - 1.7;
      const yOffset = 4 + (index % 2) * 2;
      return <button key={landing.id} onClick={() => onSelectQuay(quay.id)} className="absolute z-30 -translate-x-1/2 rounded-lg border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-950 shadow-lg shadow-sky-950/15 transition hover:scale-105" style={{ left: `${quay.x + xOffset}%`, top: `${quay.y + yOffset}%` }} title={`${landing.time} · ${landing.volumeTons} t · ${landing.species.join(", ")}`}>
        {landing.time} · {landing.volumeTons} t
      </button>;
    })}

    {quays.map((quay) => {
      const quayLandings = landings.filter((landing) => landing.quayId === quay.id);
      const quayVolume = getQuayVolume(quay.id, landings);
      const isSelected = selectedKind === "quay" && selectedId === quay.id;
      return <button key={quay.id} onClick={() => onSelectQuay(quay.id)} className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-xl border p-1.5 transition hover:scale-105 ${viewMode === "pirogues" ? "opacity-80" : "opacity-100"} ${isSelected ? "border-white bg-white text-slate-950 shadow-[0_0_0_9px_rgba(226,232,240,.22),0_0_34px_rgba(255,255,255,.65)]" : pointStyles[quay.level]}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} aria-label={`Sélectionner ${quay.name}`}>
        <span className="block h-3.5 w-3.5 rounded-md bg-white/95" />
        <span className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-md shadow-slate-950/10">{quay.name}</span>
        {viewMode === "quays" ? <span className="absolute left-7 top-8 whitespace-nowrap rounded-xl border border-white/15 bg-slate-950/90 px-2 py-1 text-[10px] font-black text-white shadow-sm">{quayLandings.length} débarq. · {quayVolume.toFixed(1)} t · {quay.activePirogues} pirogues</span> : null}
      </button>;
    })}

    {viewMode === "pirogues" ? pirogues.map((pirogue) => {
      const landing = landings.find((item) => item.pirogueIds.includes(pirogue.id));
      const isSelected = selectedKind === "pirogue" && selectedId === pirogue.id;
      return <button key={pirogue.id} onClick={() => onSelectPirogue(pirogue.id)} className={`absolute z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-[10px] font-black shadow-lg transition hover:scale-105 ${isSelected ? "border-white bg-white text-slate-950 shadow-[0_0_0_7px_rgba(255,255,255,.22)]" : pirogue.level === "urgent" ? "border-rose-100 bg-rose-100 text-rose-950" : pirogue.level === "surveillance" ? "border-amber-100 bg-amber-100 text-amber-950" : "border-sky-100 bg-sky-50 text-sky-950"}`} style={{ left: `${pirogue.x}%`, top: `${pirogue.y}%` }} title={pirogue.registration}>
        <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-current opacity-70" />{pirogue.registration}
        {landing ? <span className="ml-1 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] text-white">{landing.time}</span> : null}
      </button>;
    }) : null}

    {selectedQuay ? <div className="absolute bottom-20 right-4 z-50 hidden w-[22rem] rounded-2xl border border-white/15 bg-white/95 p-4 text-slate-950 shadow-2xl shadow-slate-950/25 backdrop-blur-md xl:block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Panneau carte</p>
          <h3 className="mt-1 text-xl font-black">{selectedPirogue ? selectedPirogue.registration : selectedQuay.name}</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">{formatCoordinate(selectedQuay.coordinates.lat, "lat")} · {formatCoordinate(selectedQuay.coordinates.lng, "lng")}</p>
        </div>
        <Badge level={selectedPirogue?.level ?? selectedQuay.level} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <DataPoint label="Volume quai" value={`${getQuayVolume(selectedQuay.id, landings).toFixed(1)} t`} />
        <DataPoint label="Débarq." value={String(landings.filter((landing) => landing.quayId === selectedQuay.id).length)} />
      </div>
      <p className="mt-4 text-xs font-bold leading-5 text-slate-600">{selectedPirogue ? selectedPirogue.declaredActivity : selectedQuay.species.join(", ")}</p>
    </div> : null}

    <div className="absolute bottom-4 left-4 right-4 z-50 grid gap-3 rounded-2xl border border-white/15 bg-slate-950/65 p-3 text-xs font-black backdrop-blur-md xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg bg-white px-3 py-2 text-slate-950">Quai sur littoral</span>
        {viewMode === "pirogues" ? <span className="rounded-lg bg-sky-100 px-3 py-2 text-sky-950">Pirogue en mer</span> : <span className="rounded-lg bg-sky-100 px-3 py-2 text-sky-950">Débarquement</span>}
        <span className="rounded-lg bg-emerald-300 px-3 py-2 text-emerald-950">Normal</span>
        <span className="rounded-lg bg-amber-300 px-3 py-2 text-amber-950">À surveiller</span>
        <span className="rounded-lg bg-rose-500 px-3 py-2 text-white">Urgent</span>
      </div>
      <div className="flex flex-wrap gap-2 text-slate-200">
        <span className="rounded-lg border border-white/20 px-3 py-2">Espèces : {activeSpecies.length ? activeSpecies.join(", ") : "aucune"}</span>
        <span className="rounded-lg border border-white/20 px-3 py-2">Échelle visuelle simulée</span>
      </div>
    </div>
  </div>;
}

export function QuayDetail({ quay, landings, pirogues, alerts }: { quay: Quay; landings: Landing[]; pirogues: Pirogue[]; alerts: MapAlert[] }) {
  return <ShellCard className="h-full border-cyan-100">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Quai sélectionné</p><h3 className="mt-2 text-2xl font-black text-slate-950">{quay.name}</h3><p className="text-sm font-bold text-slate-500">{quay.region} · {quay.commune}</p></div><Badge level={quay.level} /></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><DataPoint label="Coordonnées" value={`${quay.coordinates.lat.toFixed(4)}, ${quay.coordinates.lng.toFixed(4)}`} /><DataPoint label="Débarquements" value={String(quay.landingsToday)} /><DataPoint label="Volume" value={`${quay.volumeTons} t`} /><DataPoint label="Pirogues actives" value={String(quay.activePirogues)} /></div>
    <div className="mt-5"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Espèces principales</p><div className="mt-2 flex flex-wrap gap-2">{quay.species.map((species) => <span key={species} className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{species}</span>)}</div></div>
    <div className="mt-5 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Alertes en cours" value={String(alerts.length)} /><DataRow label="Dernière mise à jour" value={quay.lastUpdated} /><DataRow label="Débarquements consultables" value={String(landings.length)} /><DataRow label="Immatriculations visibles" value={String(pirogues.length)} /></div>
    <div className="mt-5 grid gap-2">{alerts.slice(0, 2).map((alert) => <div key={alert.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-black text-amber-950">{alert.title}</p><p className="mt-1 text-xs font-bold text-amber-800">{alert.nextAction}</p></div>)}</div>
    <div className="mt-5 flex flex-wrap gap-2"><button className={primaryButton}>Voir débarquements</button><button className={secondaryButton}>Voir pirogues</button><button className={secondaryButton}>Créer une alerte</button></div>
  </ShellCard>;
}

export function PirogueDetail({ pirogue, quay, landings = [] }: { pirogue: Pirogue; quay: Quay; landings?: Landing[] }) {
  return <ShellCard className="h-full border-cyan-100">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pirogue sélectionnée</p><h3 className="mt-2 text-2xl font-black text-slate-950">{pirogue.registration}</h3><p className="text-sm font-bold text-slate-500">Rattachée à {quay.name}</p></div><Badge level={pirogue.level} /></div>
    <div className="mt-5 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Statut" value={pirogue.status} /><DataRow label="Dernière position" value={pirogue.lastPosition} /><DataRow label="Dernière déclaration" value={pirogue.lastDeclaration} /><DataRow label="Activité déclarée" value={pirogue.declaredActivity} /></div>
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Débarquement associé</p>{landings.length ? <div className="mt-2 grid gap-2">{landings.map((landing) => <p key={landing.id} className="text-sm font-bold text-slate-800">{landing.time} · {landing.volumeTons} t · {landing.species.join(", ")} · {landing.status}</p>)}</div> : <p className="mt-2 text-sm font-semibold text-slate-500">Aucun débarquement associé dans les données filtrées.</p>}</div>
    <div className="mt-5 flex flex-wrap gap-2"><button className={primaryButton}>Voir fiche pirogue</button><button className={secondaryButton}>Demander vérification</button><button className={secondaryButton}>Associer au quai</button></div>
  </ShellCard>;
}

export function CompactQuayTable({ rows }: { rows: Array<{ quay: Quay; landings: Landing[]; pirogues: Pirogue[]; alerts: MapAlert[] }> }) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table className="min-w-[760px] w-full text-left text-sm">
      <thead className="bg-slate-100 text-xs font-black uppercase tracking-[0.12em] text-slate-600"><tr><th className="px-4 py-3">Quai</th><th className="px-4 py-3">Région</th><th className="px-4 py-3">Débarquements</th><th className="px-4 py-3">Volume</th><th className="px-4 py-3">Pirogues actives</th><th className="px-4 py-3">Espèces</th><th className="px-4 py-3">Alertes</th><th className="px-4 py-3">Mise à jour</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map(({ quay, landings, pirogues, alerts }) => <tr key={quay.id} className="align-top hover:bg-slate-50"><td className="px-4 py-3 font-black text-slate-950">{quay.name}</td><td className="px-4 py-3 font-bold text-slate-600">{quay.region}</td><td className="px-4 py-3 font-bold text-slate-700">{landings.length}</td><td className="px-4 py-3 font-bold text-slate-700">{quay.volumeTons} t</td><td className="px-4 py-3 font-bold text-slate-700">{pirogues.length}</td><td className="px-4 py-3 font-bold text-slate-700">{quay.species.join(", ")}</td><td className="px-4 py-3"><Badge level={alerts.some((alert) => alert.level === "urgent") ? "urgent" : alerts.length ? "surveillance" : "normal"}>{String(alerts.length)}</Badge></td><td className="px-4 py-3 font-bold text-slate-600">{quay.lastUpdated}</td></tr>)}</tbody>
    </table>
  </div>;
}

export function NeedCard({ need }: { need: CommunityNeed }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-black text-slate-950">{need.need}</h3><Badge level={need.urgency} /></div><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Région" value={need.region} /><DataRow label="Lieu" value={need.place} /><DataRow label="Acteurs" value={need.actors} /><DataRow label="Statut" value={need.status} /><DataRow label="Prochaine action" value={need.nextAction} /></div></article>;
}

export function ProjectCard({ project }: { project: CommunityProject }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-lg font-black text-slate-950">{project.project}</h3><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Territoire" value={project.territory} /><DataRow label="Porteur" value={project.owner} /><DataRow label="Bénéficiaires" value={String(project.beneficiaries)} /><DataRow label="Budget estimé" value={project.estimatedBudget} /><DataRow label="Statut" value={project.status} /><DataRow label="Partenaire cible" value={project.targetPartner} /></div><div className="mt-4 flex flex-wrap gap-2"><button className={primaryButton}>Préparer fiche projet</button><button className={secondaryButton}>Demander informations</button><button className={secondaryButton}>Marquer prioritaire</button></div></article>;
}

export function TrainingCard({ program }: { program: TrainingProgram }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-lg font-black text-slate-950">{program.title}</h3><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700"><DataRow label="Région" value={program.region} /><DataRow label="Public cible" value={program.target} /><DataRow label="Période" value={program.period} /><DataRow label="Partenaire potentiel" value={program.potentialPartner} /><DataRow label="Participants attendus" value={String(program.expectedParticipants)} /><DataRow label="Statut" value={program.status} /></div><div className="mt-4 flex flex-wrap gap-2"><button className={primaryButton}>Planifier</button><button className={secondaryButton}>Voir participants</button><button className={secondaryButton}>Préparer note</button></div></article>;
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-1.5 last:border-b-0"><span className="text-slate-500">{label}</span><span className="max-w-[68%] text-right text-slate-900">{value}</span></div>;
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</p><p className="mt-1 text-base font-black text-slate-950">{value}</p></div>;
}
