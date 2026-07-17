"use client";

import { useMemo, useState } from "react";
import {
  fieldReferents,
  getQuayActivitySnapshot,
  getQuayAlerts,
  getQuayIncidents,
  getQuayLandings,
  getQuayOpenDossiers,
  getQuayPirogues,
  getQuaySpeciesSnapshot,
  quayPosts,
  type Landing,
  type MapAlert,
  type Pirogue,
  type PirogueCycleStage,
  type Quay,
} from "@/data/ministryControlTowerData";
import type { GeneratedArtifact, IncidentRecord, VerificationTask, ZoneReportRecord } from "@/data/ministryValueJourneyData";
import type { DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { CycleTimeline, DataTrustBadge, primaryButton, secondaryButton, StatusBadge } from "./MinistryControlTowerParts";
import { PosteOfficielPanel } from "./MinistryDossierExperience";
import { ReferentsPanel } from "./MinistryCredibility";
import type { WorkflowContext } from "./MinistryValueWorkflows";
import type { WorkflowKind } from "@/data/ministryValueJourneyData";

type TabId = "summary" | "activity" | "pirogues" | "species" | "records";
export type SelectedAtlasEntity =
  | { kind: "pirogue"; id: string }
  | { kind: "landing"; id: string }
  | { kind: "incident"; id: string }
  | { kind: "alert"; id: string }
  | { kind: "verification"; id: string }
  | null;

type Props = {
  quay: Quay;
  alerts: MapAlert[];
  incidents: IncidentRecord[];
  dossiers: DossierOperationnel[];
  artifacts: GeneratedArtifact[];
  verificationTasks: VerificationTask[];
  verifiedIds: string[];
  zoneReports: ZoneReportRecord[];
  selectedEntity: SelectedAtlasEntity;
  onSelectEntity: (entity: SelectedAtlasEntity) => void;
  onClose: () => void;
  onOpenDossier: (dossier: DossierOperationnel) => void;
  openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void;
  onResetKayar: () => void;
};

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "summary", label: "Synthèse" },
  { id: "activity", label: "Activité du jour" },
  { id: "pirogues", label: "Pirogues" },
  { id: "species", label: "Espèces & volumes" },
  { id: "records", label: "Dossiers & preuves" },
];

export function QuayProfileSheet(props: Props) {
  const { quay, selectedEntity, onSelectEntity, onClose } = props;
  const [tab, setTab] = useState<TabId>(selectedEntity?.kind === "pirogue" ? "pirogues" : selectedEntity?.kind === "landing" ? "activity" : "summary");
  const [stage, setStage] = useState<PirogueCycleStage | "all">("all");
  const snapshot = getQuayActivitySnapshot(quay.id, props.alerts);
  const quayAlerts = getQuayAlerts(quay.id, props.alerts);
  const quayIncidents = getQuayIncidents(quay.id, props.incidents);
  const quayPirogues = getQuayPirogues(quay.id);
  const quayLandings = getQuayLandings(quay.id);
  const openDossiers = getQuayOpenDossiers(quay.id, props.dossiers);
  const effectiveTrust = props.verifiedIds.includes(quay.id) ? "verified" : quay.trustLevel;
  const relatedDossiers = props.dossiers.filter((dossier) => dossier.quayId === quay.id);
  const selectedPirogue = selectedEntity?.kind === "pirogue" ? quayPirogues.find((item) => item.id === selectedEntity.id) : undefined;
  const selectedLanding = selectedEntity?.kind === "landing" ? quayLandings.find((item) => item.id === selectedEntity.id) : undefined;

  const context: WorkflowContext = {
    title: quay.name,
    scope: quay.name,
    sourceId: quay.id,
    quayId: quay.id,
    description: quayAlerts[0]?.title ?? quayIncidents[0]?.title ?? "Situation du quai à documenter.",
  };

  return <div className="fixed inset-0 z-[90] bg-[var(--mb-navy-900)]/35" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto border-t border-[var(--mb-neutral-300)] bg-white shadow-[0_-18px_45px_rgba(8,35,55,.18)] lg:inset-y-0 lg:left-auto lg:w-[min(47rem,58vw)] lg:max-h-none lg:border-l lg:border-t-0">
      <header className="sticky top-0 z-20 border-b border-[var(--mb-neutral-200)] bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mb-ocean-600)]">Fiche métier du quai</p><h2 className="mt-1 text-[22px] font-semibold text-[var(--mb-navy-900)]">{quay.name}</h2><p className="mt-1 text-[11px] text-[var(--mb-neutral-600)]">{quay.commune} · Région de {quay.region} · mise à jour {snapshot.lastUpdate}</p></div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--mb-neutral-200)] text-lg" aria-label="Fermer la fiche">×</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge level={quay.level}>{quay.level === "urgent" ? "Critique" : quay.level === "surveillance" ? "Vigilance" : "Situation normale"}</StatusBadge><DataTrustBadge level={effectiveTrust} source="Niveau issu des déclarations et vérifications locales simulées." /><span className="text-[10px] font-semibold text-[var(--mb-neutral-600)]">{openDossiers.length} dossier(s) actif(s)</span></div>
        <nav className="-mx-4 mt-4 flex overflow-x-auto border-t border-[var(--mb-neutral-100)] px-4 pt-2 sm:-mx-6 sm:px-6" aria-label="Rubriques de la fiche quai">{tabs.map((item) => <button key={item.id} onClick={() => { setTab(item.id); onSelectEntity(null); }} className={`min-h-9 shrink-0 border-b-2 px-3 text-[11px] font-bold ${tab === item.id ? "border-[var(--mb-ocean-600)] text-[var(--mb-ocean-600)]" : "border-transparent text-[var(--mb-neutral-600)] hover:text-[var(--mb-navy-900)]"}`}>{item.label}</button>)}</nav>
      </header>

      <div className="p-4 sm:p-6">
        {tab === "summary" ? <SummaryTab {...props} snapshot={snapshot} quayAlerts={quayAlerts} quayIncidents={quayIncidents} relatedDossiers={relatedDossiers} context={context} /> : null}
        {tab === "activity" ? <ActivityTab pirogues={quayPirogues} landings={quayLandings} stage={stage} onStage={setStage} selectedLanding={selectedLanding} onSelectLanding={(landing) => onSelectEntity({ kind: "landing", id: landing.id })} /> : null}
        {tab === "pirogues" ? <PiroguesTab pirogues={quayPirogues} selected={selectedPirogue} onSelect={(pirogue) => onSelectEntity({ kind: "pirogue", id: pirogue.id })} /> : null}
        {tab === "species" ? <SpeciesTab quayId={quay.id} /> : null}
        {tab === "records" ? <RecordsTab {...props} quayAlerts={quayAlerts} quayIncidents={quayIncidents} dossiers={relatedDossiers} /> : null}
      </div>
    </aside>
  </div>;
}

function SummaryTab({ quay, snapshot, quayAlerts, quayIncidents, relatedDossiers, artifacts, zoneReports, onOpenDossier, openWorkflow, onResetKayar, context }: Props & {
  snapshot: ReturnType<typeof getQuayActivitySnapshot>;
  quayAlerts: MapAlert[];
  quayIncidents: IncidentRecord[];
  relatedDossiers: DossierOperationnel[];
  context: WorkflowContext;
}) {
  const priorityDossier = relatedDossiers.find((item) => item.workStatus !== "Terminé") ?? relatedDossiers[0];
  const report = zoneReports.find((item) => item.zone === quay.name || (quay.id === "kayar" && item.zone === "Kayar"));
  const metrics = [
    ["Débarquements", String(snapshot.landingsCount)],
    ["Volume déclaré", `${snapshot.declaredVolumeTons.toFixed(1)} t`],
    ["Pirogues en mer", String(snapshot.piroguesAtSea)],
    ["Situations actives", String(quayAlerts.length + quayIncidents.filter((item) => item.status !== "Résolu").length)],
  ];
  return <div className="grid gap-5">
    <section className="grid grid-cols-2 border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] sm:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="border-b border-r border-[var(--mb-neutral-200)] p-3 last:border-r-0 sm:border-b-0"><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-500)]">{label}</p><p className="mt-2 font-mono text-[21px] font-semibold text-[var(--mb-navy-900)]">{value}</p></div>)}</section>
    <section className="border-l-4 border-[var(--mb-ocean-600)] bg-[#edf6f8] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Action recommandée</p><h3 className="mt-2 text-[15px] font-semibold text-[var(--mb-navy-900)]">{priorityDossier?.nextAction ?? "Documenter la situation du quai"}</h3><p className="mt-2 text-[11px] leading-5 text-[var(--mb-neutral-600)]">{priorityDossier ? `${priorityDossier.businessStatus}. L’action ouvre le dossier ${priorityDossier.id} et conserve la trace du traitement.` : "Aucun dossier actif : créer un signalement uniquement si un fait nouveau doit être instruit."}</p><div className="mt-4 flex flex-wrap gap-2">{priorityDossier ? <button onClick={() => onOpenDossier(priorityDossier)} className={primaryButton}>Ouvrir le dossier prioritaire</button> : null}<button onClick={() => openWorkflow("alert", context)} className={secondaryButton}>Signaler une nouvelle situation</button></div></section>
    <section className="grid gap-4 border-y border-[var(--mb-neutral-200)] py-4 sm:grid-cols-2"><PosteOfficielPanel poste={quayPosts.find((poste) => poste.quayId === quay.id)} /><ReferentsPanel referents={fieldReferents.filter((referent) => referent.quayId === quay.id && referent.status === "Actif")} /></section>
    <section className="flex flex-wrap items-center justify-between gap-3 border border-[var(--mb-neutral-200)] p-4"><div><h3 className="text-[12px] font-semibold text-[var(--mb-navy-900)]">Consultation & transmission</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{report ? "Un rapport existe déjà et peut être relu." : `${artifacts.filter((item) => item.scope === quay.name).length} preuve(s) ou export(s) rattaché(s).`}</p></div><button onClick={() => openWorkflow("export-zone", context)} className={secondaryButton}>{report ? "Relire ou actualiser le rapport" : "Préparer le rapport du quai"}</button></section>
    {quay.id === "kayar" ? <button onClick={onResetKayar} className="justify-self-start text-[10px] font-bold text-[var(--mb-ocean-600)] hover:underline">Recommencer le scénario Kayar</button> : null}
  </div>;
}

const cycleStages: Array<{ id: PirogueCycleStage; label: string }> = [
  { id: "preparation", label: "Préparation" }, { id: "departure", label: "Départ" }, { id: "atSea", label: "En mer" }, { id: "expectedReturn", label: "Retour attendu" }, { id: "returned", label: "Retour" }, { id: "landing", label: "Débarquement" }, { id: "declared", label: "Déclaré" }, { id: "verified", label: "Vérifié" },
];

function ActivityTab({ pirogues, landings, stage, onStage, selectedLanding, onSelectLanding }: { pirogues: Pirogue[]; landings: Landing[]; stage: PirogueCycleStage | "all"; onStage: (stage: PirogueCycleStage | "all") => void; selectedLanding?: Landing; onSelectLanding: (landing: Landing) => void }) {
  const filtered = stage === "all" ? pirogues : pirogues.filter((item) => item.cycleStage === stage);
  return <div className="grid gap-5"><section><h3 className="text-[13px] font-semibold text-[var(--mb-navy-900)]">Cycle opérationnel agrégé</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">Sélectionnez une étape pour filtrer les opérations du quai.</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{cycleStages.map((item) => { const count = pirogues.filter((pirogue) => pirogue.cycleStage === item.id).length; return <button key={item.id} onClick={() => onStage(stage === item.id ? "all" : item.id)} className={`border p-3 text-left ${stage === item.id ? "border-[var(--mb-ocean-600)] bg-[#edf6f8]" : "border-[var(--mb-neutral-200)] bg-white hover:border-[var(--mb-ocean-400)]"}`}><span className="font-mono text-[18px] font-semibold text-[var(--mb-navy-900)]">{count}</span><span className="mt-1 block text-[10px] font-semibold text-[var(--mb-neutral-600)]">{item.label}</span></button>; })}</div></section><EntityList title={`${filtered.length} opération(s) dans la sélection`} items={filtered.map((item) => ({ id: item.id, title: item.registration, detail: `${item.status} · ${item.lastCycleEvent}`, trust: item.trustLevel }))} />
    <section><h3 className="text-[13px] font-semibold text-[var(--mb-navy-900)]">Derniers débarquements</h3><div className="mt-3 divide-y divide-[var(--mb-neutral-100)] border-y border-[var(--mb-neutral-200)]">{landings.map((landing) => <button key={landing.id} onClick={() => onSelectLanding(landing)} className={`grid w-full gap-2 px-3 py-3 text-left sm:grid-cols-[5rem_minmax(0,1fr)_auto] ${selectedLanding?.id === landing.id ? "bg-[#edf6f8]" : "hover:bg-[var(--mb-offwhite)]"}`}><span className="font-mono text-[11px] font-bold text-[var(--mb-ocean-600)]">{landing.time}</span><span><strong className="block text-[11px]">{landing.species.join(" · ")}</strong><small className="mt-1 block text-[10px] text-[var(--mb-neutral-600)]">{landing.status} · {landing.pirogueIds.join(", ")}</small></span><span className="font-mono text-[12px] font-bold">{landing.volumeTons.toFixed(1)} t</span></button>)}</div></section>
    {selectedLanding ? <LandingProfile landing={selectedLanding} pirogues={pirogues} /> : null}
  </div>;
}

function PiroguesTab({ pirogues, selected, onSelect }: { pirogues: Pirogue[]; selected?: Pirogue; onSelect: (pirogue: Pirogue) => void }) {
  return <div className="grid gap-4"><EntityList title={`${pirogues.length} pirogue(s) rattachée(s)`} items={pirogues.map((item) => ({ id: item.id, title: item.registration, detail: `${item.status} · ${item.lastPosition}`, trust: item.trustLevel, level: item.level }))} onSelect={(id) => { const pirogue = pirogues.find((item) => item.id === id); if (pirogue) onSelect(pirogue); }} />{selected ? <PirogueProfile pirogue={selected} /> : <p className="border border-dashed border-[var(--mb-neutral-300)] p-5 text-center text-[11px] text-[var(--mb-neutral-600)]">Sélectionnez une pirogue pour consulter son cycle et ses dernières informations.</p>}</div>;
}

function PirogueProfile({ pirogue }: { pirogue: Pirogue }) {
  return <section className="border border-[var(--mb-neutral-200)] bg-white"><header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--mb-neutral-200)] p-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Fiche pirogue</p><h3 className="mt-1 text-[16px] font-semibold">{pirogue.registration}</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{pirogue.lastPosition} · déclaration {pirogue.lastDeclaration}</p></div><DataTrustBadge level={pirogue.trustLevel} source="Dernière information du cycle simulé." /></header><CycleTimeline pirogue={pirogue} /><dl className="grid gap-3 p-4 text-[11px] sm:grid-cols-2"><Fact label="Situation" value={pirogue.status} /><Fact label="Activité déclarée" value={pirogue.declaredActivity} /><Fact label="Départ" value={pirogue.departureTime ?? "Non renseigné"} /><Fact label="Retour attendu" value={pirogue.expectedReturnTime ?? "Non renseigné"} /></dl></section>;
}

function LandingProfile({ landing, pirogues }: { landing: Landing; pirogues: Pirogue[] }) {
  return <section className="border-l-4 border-[var(--mb-ocean-400)] bg-[#f3f8f9] p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mb-ocean-600)]">Fiche débarquement</p><h3 className="mt-1 text-[15px] font-semibold">{landing.id} · {landing.time}</h3></div><DataTrustBadge level={landing.trustLevel} /></div><dl className="mt-4 grid gap-3 text-[11px] sm:grid-cols-2"><Fact label="Volume" value={`${landing.volumeTons.toFixed(1)} tonnes`} /><Fact label="Espèces" value={landing.species.join(", ")} /><Fact label="Statut" value={landing.status} /><Fact label="Pirogues" value={landing.pirogueIds.map((id) => pirogues.find((item) => item.id === id)?.registration ?? id).join(", ")} /></dl></section>;
}

function SpeciesTab({ quayId }: { quayId: string }) {
  const snapshot = getQuaySpeciesSnapshot(quayId);
  const max = Math.max(...snapshot.map((item) => item.volumeTons), 1);
  return <section><h3 className="text-[13px] font-semibold text-[var(--mb-navy-900)]">Volumes déclarés par espèce</h3><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">Répartition indicative des débarquements locaux, croisée avec le référentiel métier.</p><div className="mt-4 grid gap-3">{snapshot.map((item) => <article key={item.species} className="border border-[var(--mb-neutral-200)] p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-[12px] font-semibold">{item.species}</h4><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{item.landingCount} débarquement(s) · {item.regulatoryStatus}</p></div><StatusBadge level={item.alertLevel}>{item.volumeTons.toFixed(1)} t</StatusBadge></div><div className="mt-3 h-2 overflow-hidden bg-[var(--mb-neutral-100)]"><div className="h-full bg-[var(--mb-ocean-600)]" style={{ width: `${Math.max(5, item.volumeTons / max * 100)}%` }} /></div></article>)}{!snapshot.length ? <p className="border border-dashed border-[var(--mb-neutral-300)] p-5 text-center text-[11px] text-[var(--mb-neutral-600)]">Aucun volume détaillé pour ce quai dans le jeu de données local.</p> : null}</div></section>;
}

function RecordsTab({ quay, quayAlerts, quayIncidents, dossiers, verificationTasks, artifacts, zoneReports, onOpenDossier }: Props & { quayAlerts: MapAlert[]; quayIncidents: IncidentRecord[]; dossiers: DossierOperationnel[] }) {
  const verifications = verificationTasks.filter((item) => item.targetId === quay.id || getQuayPirogues(quay.id).some((pirogue) => pirogue.id === item.targetId));
  const documents = [...artifacts.filter((item) => item.scope === quay.name || (quay.id === "kayar" && item.scope === "Kayar")), ...zoneReports.filter((item) => item.zone === quay.name || (quay.id === "kayar" && item.zone === "Kayar"))];
  return <div className="grid gap-5"><RecordSection title="Situations en attention" count={quayAlerts.length}>{quayAlerts.map((item) => <RecordRow key={item.id} title={item.title} detail={`${item.source} · ${item.updatedAt}`} level={item.level} trust={item.trustLevel} />)}</RecordSection><RecordSection title="Incidents" count={quayIncidents.length}>{quayIncidents.map((item) => <RecordRow key={item.id} title={item.title} detail={`${item.status} · ${item.owner} · ${item.nextAction}`} level={item.level} trust={item.trustLevel} />)}</RecordSection><RecordSection title="Vérifications" count={verifications.length}>{verifications.map((item) => <RecordRow key={item.id} title={item.target} detail={`${item.status} · ${item.owner}`} level={item.status === "Vérifiée" || item.status === "Clôturée" ? "normal" : "surveillance"} trust={item.status === "Vérifiée" || item.status === "Clôturée" ? "verified" : "declared"} />)}</RecordSection><RecordSection title="Dossiers opérationnels" count={dossiers.length}>{dossiers.map((item) => <button key={item.id} onClick={() => onOpenDossier(item)} className="grid w-full gap-1 border-b border-[var(--mb-neutral-100)] px-3 py-3 text-left hover:bg-[var(--mb-offwhite)]"><span className="font-mono text-[10px] font-bold text-[var(--mb-ocean-600)]">{item.id}</span><strong className="text-[11px]">{item.linkedObject}</strong><span className="text-[10px] text-[var(--mb-neutral-600)]">{item.workStatus} · prochaine action : {item.nextAction}</span></button>)}</RecordSection><RecordSection title="Preuves et documents" count={documents.length}>{documents.map((item) => <div key={item.id} className="border-b border-[var(--mb-neutral-100)] px-3 py-3"><strong className="text-[11px]">{item.title}</strong><p className="mt-1 text-[10px] text-[var(--mb-neutral-600)]">{("createdAt" in item ? item.createdAt : item.generatedAt)} · document local de démonstration</p></div>)}</RecordSection></div>;
}

function EntityList({ title, items, onSelect }: { title: string; items: Array<{ id: string; title: string; detail: string; trust: Pirogue["trustLevel"]; level?: Pirogue["level"] }>; onSelect?: (id: string) => void }) {
  return <section><h3 className="text-[13px] font-semibold text-[var(--mb-navy-900)]">{title}</h3><div className="mt-3 divide-y divide-[var(--mb-neutral-100)] border-y border-[var(--mb-neutral-200)]">{items.map((item) => <button key={item.id} disabled={!onSelect} onClick={() => onSelect?.(item.id)} className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left enabled:hover:bg-[var(--mb-offwhite)]"><span><strong className="block text-[11px]">{item.title}</strong><small className="mt-1 block text-[10px] leading-4 text-[var(--mb-neutral-600)]">{item.detail}</small></span><span className="flex shrink-0 items-center gap-2">{item.level ? <StatusBadge level={item.level} /> : null}<DataTrustBadge level={item.trust} compact /></span></button>)}</div></section>;
}

function RecordSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return <section className="border border-[var(--mb-neutral-200)]"><header className="flex items-center justify-between bg-[var(--mb-offwhite)] px-3 py-2"><h3 className="text-[11px] font-bold">{title}</h3><span className="font-mono text-[10px] text-[var(--mb-neutral-500)]">{count}</span></header>{count ? children : <p className="px-3 py-4 text-[10px] text-[var(--mb-neutral-500)]">Aucun élément dans cette catégorie.</p>}</section>;
}

function RecordRow({ title, detail, level, trust }: { title: string; detail: string; level: Pirogue["level"]; trust: Pirogue["trustLevel"] }) {
  return <div className="grid gap-2 border-b border-[var(--mb-neutral-100)] px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"><div><strong className="text-[11px]">{title}</strong><p className="mt-1 text-[10px] leading-4 text-[var(--mb-neutral-600)]">{detail}</p></div><div className="flex items-start gap-2"><StatusBadge level={level} /><DataTrustBadge level={trust} compact /></div></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--mb-neutral-500)]">{label}</dt><dd className="mt-1 font-semibold text-[var(--mb-navy-900)]">{value}</dd></div>;
}
