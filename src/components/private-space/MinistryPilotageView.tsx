"use client";

import { useMemo, useState, type ReactNode } from "react";
import { quays, type MapAlert, type Region } from "@/data/ministryControlTowerData";
import type { FundingDossierRecord, FundingOpportunity, GeneratedArtifact } from "@/data/ministryValueJourneyData";
import { selectMinistrySnapshot, type MinistryFilters, type PilotagePeriod } from "@/lib/ministrySelectors";
import type { DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { DataTrustBadge, primaryButton, secondaryButton, WorkspaceHeader } from "./MinistryControlTowerParts";

type Props = {
  assistanceEnabled: boolean;
  dossiers: DossierOperationnel[];
  alerts: MapAlert[];
  artifacts: GeneratedArtifact[];
  opportunities: FundingOpportunity[];
  fundingDossiers: FundingDossierRecord[];
  onViewAtlas: (quayId: string | null) => void;
  onOpenDossier: (dossier: DossierOperationnel) => void;
  onOpenDossiers: () => void;
  onOpenCommunity: (quayId?: string | null) => void;
};

const initialFilters: MinistryFilters = {
  region: "Toutes",
  quayId: "Tous",
  species: "Toutes",
  period: "today",
};

export function MinistryPilotageView({
  assistanceEnabled,
  dossiers,
  alerts,
  artifacts,
  opportunities,
  fundingDossiers,
  onViewAtlas,
  onOpenDossier,
  onOpenDossiers,
  onOpenCommunity,
}: Props) {
  const [filters, setFilters] = useState<MinistryFilters>(initialFilters);
  const snapshot = useMemo(
    () => selectMinistrySnapshot(filters, opportunities),
    [filters, opportunities],
  );
  const selectedQuayId = filters.quayId === "Tous" ? null : filters.quayId;
  const visibleDossiers = dossiers.filter(
    (dossier) => !dossier.quayId || snapshot.quays.some((quay) => quay.id === dossier.quayId),
  );
  const priority =
    visibleDossiers.find((dossier) => dossier.workStatus === "Bloqué") ??
    visibleDossiers.find((dossier) => ["À traiter", "Nouveau"].includes(dossier.workStatus)) ??
    visibleDossiers.find((dossier) => dossier.workStatus === "En attente");
  const trusted = snapshot.quays.filter((quay) => ["verified", "consolidated"].includes(quay.trustLevel)).length;
  const species = [...new Set(quays.flatMap((quay) => quay.species))].sort((a, b) => a.localeCompare(b, "fr"));
  const activeAlerts = alerts.filter((alert) => alert.level !== "normal").length;
  const pendingFunding = fundingDossiers.filter((dossier) => !["Financé", "Décliné"].includes(dossier.status)).length;

  function updateFilter<K extends keyof MinistryFilters>(key: K, value: MinistryFilters[K]) {
    setFilters((current) => {
      if (key === "region") {
        return { ...current, region: value as MinistryFilters["region"], quayId: "Tous" };
      }
      return { ...current, [key]: value };
    });
  }

  return (
    <section className="min-h-full bg-[var(--mb-offwhite)]">
      <WorkspaceHeader
        title="Pilotage"
        question="Comparer les territoires, repérer l’attention requise et ouvrir l’action dans son dossier."
        scope={filters.region === "Toutes" ? "Nationale" : filters.region}
        onScopeChange={(value) => updateFilter("region", value === "Nationale" ? "Toutes" : value as Region)}
        onExport={() => undefined}
      />

      <div className="border-b border-[var(--mb-neutral-200)] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[86rem] flex-wrap items-end gap-3">
          <Select label="Région" value={filters.region} options={["Toutes", ...new Set(quays.map((quay) => quay.region))]} onChange={(value) => updateFilter("region", value as MinistryFilters["region"])} />
          <Select label="Quai" value={filters.quayId} options={[{ value: "Tous", label: "Tous les quais" }, ...quays.filter((quay) => filters.region === "Toutes" || quay.region === filters.region).map((quay) => ({ value: quay.id, label: quay.name }))]} onChange={(value) => updateFilter("quayId", value)} />
          <Select label="Période" value={filters.period} options={[{ value: "today", label: "Aujourd’hui" }, { value: "7d", label: "7 jours" }, { value: "30d", label: "30 jours" }]} onChange={(value) => updateFilter("period", value as PilotagePeriod)} />
          <Select label="Espèce" value={filters.species} options={["Toutes", ...species]} onChange={(value) => updateFilter("species", value)} />
          <button type="button" onClick={() => setFilters(initialFilters)} className="h-9 px-3 text-[10px] font-bold text-[var(--mb-ocean-600)]">Réinitialiser</button>
          <p className="ml-auto text-[9px] text-[var(--mb-neutral-500)]">Dernière donnée locale : {snapshot.latestUpdate}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[86rem] px-4 py-5 sm:px-6">
        <header className="grid gap-4 border-l-2 border-[var(--mb-ocean-600)] bg-white p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Situation de pilotage</p>
            <h2 className="mt-2 text-[22px] font-semibold text-[var(--mb-navy-900)]">{filters.quayId === "Tous" ? `${snapshot.quays.length} quais dans le périmètre` : snapshot.quays[0]?.name ?? "Aucun quai"}</h2>
            <p className="mt-2 max-w-3xl text-[10px] leading-5 text-[var(--mb-neutral-600)]">{snapshot.attentionCount} quai(s) en vigilance ou critique, {activeAlerts} alerte(s) terrain active(s) et {visibleDossiers.filter((item) => item.workStatus !== "Terminé").length} dossier(s) ouverts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {priority ? <button type="button" onClick={() => onOpenDossier(priority)} className={primaryButton}>{priority.nextAction}</button> : null}
            <button type="button" onClick={onOpenDossiers} className={secondaryButton}>Voir tous les dossiers</button>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-2 border border-[var(--mb-neutral-200)] bg-white md:grid-cols-3 xl:grid-cols-6" aria-label="Indicateurs clés de pilotage">
          <Metric label="Quais actifs" value={`${snapshot.activeQuays}/${snapshot.quays.length}`} detail="Avec débarquement" />
          <Metric label="Pirogues actives" value={String(snapshot.activePirogues)} detail={`${snapshot.atSeaPirogues} suivies en mer`} />
          <Metric label="Débarquements" value={String(snapshot.landingCount)} detail="Sur la période" />
          <Metric label="Volume déclaré" value={`${snapshot.totalVolume.toFixed(1)} t`} detail="Données locales" />
          <Metric label="Espèces observées" value={String(snapshot.speciesCount)} detail="Dans le périmètre" />
          <Metric label="Quais en attention" value={String(snapshot.attentionCount)} detail="Vigilance ou critique" critical={snapshot.attentionCount > 0} />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(21rem,.85fr)]">
          <Chart title="Tendance d’activité" helper="Évolution des volumes déclarés sur la période sélectionnée"><LineTrend items={snapshot.periodSeries} /></Chart>
          <Chart title="Répartition des situations" helper="Normal, vigilance et critique"><LevelBars items={snapshot.situationLevels} /></Chart>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Chart title="Volumes par quai" helper="Cliquez une barre pour ouvrir explicitement le quai dans l’Atlas"><HorizontalBars items={snapshot.quayVolumes.map((item) => ({ label: item.name, value: item.volume, id: item.id }))} onClick={onViewAtlas} suffix="t" /></Chart>
          <Chart title="Espèces observées" helper="Cliquez une espèce pour filtrer cette lecture"><Donut items={snapshot.speciesVolumes.slice(0, 6).map((item) => ({ label: item.species, value: item.volume }))} onClick={(label) => updateFilter("species", label)} /></Chart>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,.7fr)]">
          <Chart title="Cycle des pirogues détaillées" helper="État des unités documentées dans le référentiel local"><Stacked items={snapshot.pirogueStatuses} /></Chart>
          <section className="border border-[var(--mb-neutral-200)] bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Filière et financements</p>
            <h3 className="mt-2 text-[15px] font-semibold text-[var(--mb-navy-900)]">{snapshot.qualifiedNeeds} besoins qualifiés · {snapshot.activePrograms} programmes actifs</h3>
            <p className="mt-2 text-[10px] leading-5 text-[var(--mb-neutral-600)]">{money(snapshot.remainingBudget)} restent à mobiliser. {pendingFunding} dossier(s) de financement restent en cours.</p>
            <button type="button" onClick={() => onOpenCommunity(selectedQuayId)} className={`${primaryButton} mt-4`}>Voir dans Communautés & Programmes</button>
          </section>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.55fr)]">
          <div className="border border-[var(--mb-neutral-200)] bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Documents récents</p>
            <div className="mt-3 divide-y divide-[var(--mb-neutral-100)]">
              {artifacts.slice(0, 4).map((artifact) => <p key={artifact.id} className="py-2 text-[10px]"><strong>{artifact.title}</strong><span className="ml-2 text-[var(--mb-neutral-500)]">{artifact.scope} · {artifact.createdAt}</span></p>)}
              {!artifacts.length ? <p className="py-3 text-[10px] text-[var(--mb-neutral-500)]">Aucun document généré.</p> : null}
            </div>
          </div>
          <div className="border border-[var(--mb-neutral-200)] bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Confiance</p>
            <p className="mt-3 font-mono text-[24px] font-semibold text-[var(--mb-navy-900)]">{trusted}/{snapshot.quays.length}</p>
            <p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">quais vérifiés ou consolidés</p>
            <div className="mt-3"><DataTrustBadge level={trusted === snapshot.quays.length ? "consolidated" : "verified"} source="Déclarations locales et validations simulées du périmètre sélectionné." /></div>
          </div>
        </section>

        {assistanceEnabled ? <section className="mt-5 border-l-2 border-[var(--mb-ocean-600)] bg-[var(--mb-foam)] p-4"><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Assistance Mbàmbulaan · proposition à valider</p><h3 className="mt-2 text-[13px] font-semibold text-[var(--mb-navy-900)]">{priority ? `Prioriser ${priority.id} : ${priority.nextAction.toLocaleLowerCase("fr")}.` : "Aucune action prioritaire détectée dans la sélection."}</h3><p className="mt-2 text-[10px] leading-5 text-[var(--mb-neutral-600)]">Périmètre : {filters.region}, {filters.quayId === "Tous" ? "tous les quais" : snapshot.quays[0]?.name}. Calcul local déterministe, validation humaine obligatoire.</p>{priority ? <button type="button" onClick={() => onOpenDossier(priority)} className={`${secondaryButton} mt-3`}>Relire le dossier source</button> : null}</section> : null}
      </div>
    </section>
  );
}

function Metric({ label, value, detail, critical = false }: { label: string; value: string; detail: string; critical?: boolean }) {
  return <article className="min-w-0 border-b border-r border-[var(--mb-neutral-200)] p-3"><span className="text-[9px] font-semibold text-[var(--mb-neutral-600)]">{label}</span><strong className={`mt-2 block font-mono text-[20px] ${critical ? "text-[var(--mb-red-600)]" : "text-[var(--mb-navy-900)]"}`}>{value}</strong><span className="mt-1 block text-[9px] text-[var(--mb-neutral-500)]">{detail}</span></article>;
}

function Chart({ title, helper, children }: { title: string; helper: string; children: ReactNode }) {
  return <section className="min-h-[15rem] border border-[var(--mb-neutral-200)] bg-white p-4"><h3 className="text-[13px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><p className="mt-1 text-[9px] text-[var(--mb-neutral-500)]">{helper}</p><div className="mt-5">{children}</div></section>;
}

function LineTrend({ items }: { items: Array<{ label: string; value: number }> }) {
  const width = 640;
  const height = 180;
  const paddingX = 28;
  const paddingY = 22;
  const max = Math.max(...items.map((item) => item.value), 1);
  const denominator = Math.max(items.length - 1, 1);
  const points = items.map((item, index) => ({
    ...item,
    x: paddingX + (index / denominator) * (width - paddingX * 2),
    y: height - paddingY - (item.value / max) * (height - paddingY * 2),
  }));
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return <div className="overflow-x-auto"><svg viewBox={`0 0 ${width} ${height + 28}`} className="h-52 min-w-[34rem] w-full" role="img" aria-label="Tendance des volumes déclarés"><line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" className="text-[var(--mb-neutral-200)]" /><polyline points={polyline} fill="none" stroke="var(--mb-ocean-600)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />{points.map((point) => <g key={point.label}><circle cx={point.x} cy={point.y} r="5" fill="white" stroke="var(--mb-ocean-600)" strokeWidth="3" /><text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-[var(--mb-navy-900)] text-[9px] font-bold">{point.value}</text><text x={point.x} y={height + 12} textAnchor="middle" className="fill-[var(--mb-neutral-500)] text-[9px]">{point.label}</text></g>)}</svg></div>;
}

function HorizontalBars({ items, onClick, suffix = "" }: { items: Array<{ label: string; value: number; id: string }>; onClick: (id: string) => void; suffix?: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="grid gap-3">{items.map((item) => <button type="button" key={item.id} onClick={() => onClick(item.id)} className="grid grid-cols-[7rem_minmax(0,1fr)_4rem] items-center gap-2 text-left"><span className="truncate text-[9px] font-semibold">{item.label}</span><span className="h-2 bg-[var(--mb-neutral-100)]"><i className="block h-full bg-[var(--mb-ocean-600)]" style={{ width: `${item.value / max * 100}%` }} /></span><strong className="text-right font-mono text-[9px]">{item.value} {suffix}</strong></button>)}</div>;
}

function LevelBars({ items }: { items: Array<{ label: string; value: number }> }) {
  const colors = ["bg-[var(--mb-red-600)]", "bg-[var(--mb-amber-500)]", "bg-[var(--mb-green-600)]"];
  const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1);
  return <div className="grid gap-5">{items.map((item, index) => <div key={item.label}><div className="flex justify-between text-[10px]"><span>{item.label}</span><strong>{item.value}</strong></div><div className="mt-2 h-3 bg-[var(--mb-neutral-100)]"><i className={`block h-full ${colors[index] ?? colors[0]}`} style={{ width: `${Math.max(3, item.value / total * 100)}%` }} /></div></div>)}</div>;
}

function Stacked({ items }: { items: Array<{ label: string; value: number }> }) {
  const colors = ["#167f9e", "#1fa7a3", "#48a978", "#d2a74d"];
  const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1);
  return <><div className="flex h-5 overflow-hidden">{items.map((item, index) => <i key={item.label} style={{ width: `${item.value / total * 100}%`, background: colors[index] ?? colors[0] }} />)}</div><div className="mt-4 grid gap-2 sm:grid-cols-2">{items.map((item, index) => <p key={item.label} className="flex items-center justify-between text-[9px]"><span className="flex items-center gap-2"><i className="h-2 w-2" style={{ background: colors[index] ?? colors[0] }} />{item.label}</span><strong>{item.value}</strong></p>)}</div></>;
}

function Donut({ items, onClick }: { items: Array<{ label: string; value: number }>; onClick: (label: string) => void }) {
  const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1);
  let cursor = 0;
  const colors = ["#0d516d", "#167f9e", "#1fa7a3", "#48a978", "#d2a74d", "#e87d67"];
  const stops = items.map((item, index) => {
    const start = cursor;
    cursor += item.value / total * 100;
    return `${colors[index] ?? colors[0]} ${start}% ${cursor}%`;
  }).join(",");
  return <div className="grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center"><div className="mx-auto h-32 w-32 rounded-full" style={{ background: `radial-gradient(circle at center, white 0 48%, transparent 49%), conic-gradient(${stops || "#e5e7eb 0 100%"})` }} role="img" aria-label="Répartition des volumes par espèce" /><div className="grid gap-1">{items.map((item, index) => <button type="button" key={item.label} onClick={() => onClick(item.label)} className="flex min-h-7 items-center justify-between text-left text-[9px] hover:text-[var(--mb-ocean-600)]"><span className="flex items-center gap-2"><i className="h-2 w-2" style={{ background: colors[index] ?? colors[0] }} />{item.label}</span><strong>{Math.round(item.value / total * 100)} %</strong></button>)}</div></div>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<string | { value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="grid gap-1 text-[9px] font-bold text-[var(--mb-neutral-600)]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 min-w-36 border border-[var(--mb-neutral-200)] bg-white px-2 text-[10px] font-semibold text-[var(--mb-navy-900)]">{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option>; })}</select></label>;
}

function money(value: number) {
  return value >= 1_000_000_000
    ? `${(value / 1_000_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Md FCFA`
    : `${Math.round(value / 1_000_000).toLocaleString("fr-FR")} M FCFA`;
}
