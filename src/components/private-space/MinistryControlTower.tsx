"use client";

import { useMemo, useState } from "react";
import {
  communityNeeds,
  communityProjects,
  getQuayById,
  landings,
  mapAlerts,
  partners,
  pendingActions,
  pirogues,
  quays,
  type Level,
  type MapAlert,
  type Region,
} from "@/data/ministryControlTowerData";
import {
  formatFcfa,
  impactProofs,
  initialFundingOpportunities,
  initialGeneratedArtifacts,
  maritimeIncidents,
  needMaturityScores,
  quayTrends,
  type FundingOpportunity,
  type FundingRequest,
  type GeneratedArtifact,
  type PartnerSolicitation,
  type ProgramAssociation,
  type QualifiedNeedRecord,
  type WorkflowKind,
} from "@/data/ministryValueJourneyData";
import {
  ActionRegister,
  AppShell,
  ContextPanel,
  DataTable,
  DecisionPanel,
  EvidenceTimeline,
  ExportPanel,
  FilterField,
  FilterStrip,
  inputClass,
  MapCanvas,
  MetricRow,
  MobileWorkspaceNav,
  NavigationRail,
  primaryButton,
  StatusBadge,
  TopBar,
  WorkflowBoard,
  WorkspaceHeader,
  type MapLayerId,
  type WorkspaceId,
} from "./MinistryControlTowerParts";
import {
  AlertCreationForm,
  ArtifactRegister,
  FullRecordPanel,
  FundingRequestForm,
  InstitutionalExportForm,
  InstitutionalNoteBuilder,
  PartnerMobilizationForm,
  ProgramAssociationForm,
  QualificationForm,
  VerificationDrawer,
  ZoneExportForm,
  type WorkflowContext,
} from "./MinistryValueWorkflows";
import { artifactToDocument, DocumentPreview } from "./InstitutionalDocuments";
import { BriefingPanel, FundingOpportunityCard, ImpactProofCard, PortfolioBars, SituationBanner, ValueBanner } from "./MinistryV3Components";

type Selection = { kind: "quay" | "pirogue"; id: string } | null;
type Scope = "Nationale" | Region;
type ActiveWorkflow = { kind: WorkflowKind; context: WorkflowContext } | null;

const initialEvidence = [
  { time: "10:45", title: "Consolidation nationale", detail: "Quais, débarquements, incidents et alertes regroupés dans la situation du jour." },
  { time: "10:18", title: "Signal transmis", detail: "Retour de pirogue à confirmer par la cellule locale de Saint-Louis." },
  { time: "09:58", title: "Besoin qualifié", detail: "Besoin de glace documenté par le relais de Joal-Fadiouth." },
  { time: "09:35", title: "Incident rattaché", detail: "Panne de froid de Mbour reliée au programme de maintenance." },
];

export function MinistryControlTower() {
  const [workspace, setWorkspace] = useState<WorkspaceId>("map");
  const [scope, setScope] = useState<Scope>("Nationale");
  const [evidence, setEvidence] = useState(initialEvidence);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>(initialGeneratedArtifacts);
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>(initialFundingOpportunities);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [qualifiedNeeds, setQualifiedNeeds] = useState<QualifiedNeedRecord[]>([]);
  const [partnerSolicitations, setPartnerSolicitations] = useState<PartnerSolicitation[]>([]);
  const [programAssociations, setProgramAssociations] = useState<ProgramAssociation[]>([]);
  const [createdAlerts, setCreatedAlerts] = useState<MapAlert[]>([]);
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflow>(null);
  const [systemNotice, setSystemNotice] = useState("Dernière synchronisation · 10:45");

  function record(title: string, detail: string) {
    const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setEvidence((items) => [{ time, title, detail }, ...items].slice(0, 12));
    setSystemNotice(`${title} · registre mis à jour`);
  }

  function openWorkflow(kind: WorkflowKind, context: WorkflowContext) {
    setActiveWorkflow({ kind, context });
  }

  function completeWorkflow(artifact: GeneratedArtifact, values: Record<string, string>) {
    setArtifacts((items) => [artifact, ...items]);
    record(artifact.title, `${artifact.scope} · preuve ${artifact.id}`);
    const context = activeWorkflow?.context;
    if (artifact.kind === "verification" && context?.sourceId) setVerifiedIds((ids) => Array.from(new Set([context.sourceId!, ...ids])));
    if (artifact.kind === "alert") {
      const quayId = context?.quayId || (context?.sourceId && quays.some((quay) => quay.id === context.sourceId) ? context.sourceId : "joal");
      setCreatedAlerts((items) => [{
        id: `alert-generated-${Date.now()}`,
        quayId,
        title: values.description || context?.title || "Alerte créée",
        level: values.severity === "Critique" ? "urgent" : "surveillance",
        source: values.validator || "Agent habilité",
        updatedAt: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
        nextAction: `${values.owner || "Cellule territoriale"} · échéance ${values.dueDate || "à définir"}`,
      }, ...items]);
    }
    if (artifact.kind === "qualification") {
      setQualifiedNeeds((items) => [{
        id: `qualified-${Date.now()}`,
        sourceNeedId: context?.sourceId || "need-1",
        category: values.category,
        actorsAffected: Number(values.actorsAffected || 0),
        estimatedAmount: Number(values.estimatedAmount || 0),
        maturityScore: Number(values.maturityScore || 0),
        community: values.community,
        validator: values.validator,
        artifactId: artifact.id,
      }, ...items]);
    }
    if (artifact.kind === "funding") {
      const opportunityId = context?.sourceId || opportunities[0].id;
      setFundingRequests((items) => [{
        id: `funding-${Date.now()}`,
        opportunityId,
        title: values.sourceNeed,
        amountRequested: Number(values.amountRequested || 0),
        beneficiaryCount: Number(values.beneficiaryCount || 0),
        targetFunder: values.targetFunder,
        ministryUnit: values.ministryUnit,
        maturityScore: Number(values.maturityScore || 0),
        eligibilityStatus: "Dossier généré",
        status: "Validée",
        artifactId: artifact.id,
      }, ...items]);
      setOpportunities((items) => items.map((item) => item.id === opportunityId ? { ...item, status: "Dossier généré" } : item));
    }
    if (artifact.kind === "partner") {
      setPartnerSolicitations((items) => [{
        id: `partner-request-${Date.now()}`,
        partner: values.partner,
        supportType: values.supportType,
        requestedContribution: values.requestedContribution,
        responseDate: values.responseDate,
        owner: values.owner,
        status: "Envoyée",
        artifactId: artifact.id,
      }, ...items]);
    }
    if (artifact.kind === "program") {
      setProgramAssociations((items) => [{
        id: `program-link-${Date.now()}`,
        sourceId: context?.sourceId || "need-1",
        program: values.program,
        owner: values.owner,
        nextMilestone: values.nextMilestone,
        expectedImpact: values.expectedImpact,
        artifactId: artifact.id,
      }, ...items]);
    }
  }

  const workflowProps = activeWorkflow ? { context: activeWorkflow.context, onClose: () => setActiveWorkflow(null), onComplete: completeWorkflow } : null;
  const globalExport = () => openWorkflow("institutional-export", { title: "Situation nationale Mbàmbulaan", scope, description: "Situation, décisions, opportunités de financement et registre de preuve." });

  return <AppShell topBar={<TopBar notice={systemNotice} onExport={globalExport} />} rail={<NavigationRail active={workspace} onChange={setWorkspace} />}>
    <MobileWorkspaceNav active={workspace} onChange={setWorkspace} />
    {workspace === "map" ? <AtlasMaritime scope={scope} setScope={setScope} evidence={evidence} artifacts={artifacts} alerts={[...createdAlerts, ...mapAlerts]} verifiedIds={verifiedIds} record={record} openWorkflow={openWorkflow} /> : null}
    {workspace === "community" ? <FiliereProgrammes scope={scope} setScope={setScope} evidence={evidence} artifacts={artifacts} opportunities={opportunities} fundingRequests={fundingRequests} qualifiedNeeds={qualifiedNeeds} partnerSolicitations={partnerSolicitations} programAssociations={programAssociations} openWorkflow={openWorkflow} /> : null}
    {workspace === "tracking" ? <PilotageInstitutionnel scope={scope} setScope={setScope} evidence={evidence} artifacts={artifacts} opportunities={opportunities} fundingRequests={fundingRequests} alerts={[...createdAlerts, ...mapAlerts]} record={record} openWorkflow={openWorkflow} /> : null}
    {activeWorkflow && workflowProps ? <WorkflowRenderer kind={activeWorkflow.kind} {...workflowProps} /> : null}
  </AppShell>;
}

function WorkflowRenderer({ kind, ...props }: { kind: WorkflowKind; context: WorkflowContext; onClose: () => void; onComplete: (artifact: GeneratedArtifact, values: Record<string, string>) => void }) {
  if (kind === "verification") return <VerificationDrawer {...props} />;
  if (kind === "alert") return <AlertCreationForm {...props} />;
  if (kind === "full-record") return <FullRecordPanel {...props} />;
  if (kind === "export-zone") return <ZoneExportForm {...props} />;
  if (kind === "qualification") return <QualificationForm {...props} />;
  if (kind === "funding") return <FundingRequestForm {...props} />;
  if (kind === "program") return <ProgramAssociationForm {...props} />;
  if (kind === "partner") return <PartnerMobilizationForm {...props} />;
  if (kind === "note") return <InstitutionalNoteBuilder {...props} />;
  return <InstitutionalExportForm {...props} />;
}

function AtlasMaritime({ scope, setScope, evidence, artifacts, alerts, verifiedIds, openWorkflow }: {
  scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; artifacts: GeneratedArtifact[]; alerts: MapAlert[]; verifiedIds: string[];
  record: (title: string, detail: string) => void; openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void;
}) {
  const [mode, setMode] = useState<"quays" | "pirogues">("quays");
  const [quayFilter, setQuayFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState<"Tous" | Level>("Tous");
  const [period, setPeriod] = useState("Aujourd’hui");
  const [selection, setSelection] = useState<Selection>(null);
  const [layers, setLayers] = useState<Record<MapLayerId, boolean>>({ quays: true, pirogues: true, landings: true, alerts: true, incidents: true });
  const [briefingOpen, setBriefingOpen] = useState(false);
  const visibleQuays = useMemo(() => quays.filter((quay) => (scope === "Nationale" || quay.region === scope) && (quayFilter === "Tous" || quay.id === quayFilter) && (statusFilter === "Tous" || quay.level === statusFilter)), [quayFilter, scope, statusFilter]);
  const quayIds = useMemo(() => new Set(visibleQuays.map((quay) => quay.id)), [visibleQuays]);
  const visiblePirogues = useMemo(() => pirogues.filter((boat) => quayIds.has(boat.quayId) && (statusFilter === "Tous" || boat.level === statusFilter)), [quayIds, statusFilter]);
  const visibleLandings = useMemo(() => landings.filter((landing) => quayIds.has(landing.quayId)), [quayIds]);
  const visibleAlerts = useMemo(() => alerts.filter((alert) => quayIds.has(alert.quayId) && (statusFilter === "Tous" || alert.level === statusFilter)), [alerts, quayIds, statusFilter]);
  const visibleIncidents = maritimeIncidents.filter((incident) => quayIds.has(incident.quayId));
  const selectedBoat = selection?.kind === "pirogue" ? pirogues.find((boat) => boat.id === selection.id) ?? null : null;
  const selectedQuay = selection?.kind === "quay" ? quays.find((quay) => quay.id === selection.id) ?? null : selectedBoat ? getQuayById(selectedBoat.quayId) : null;
  const selectedLandings = selectedQuay ? landings.filter((landing) => landing.quayId === selectedQuay.id) : [];
  const selectedAlerts = selectedQuay ? alerts.filter((alert) => alert.quayId === selectedQuay.id) : [];
  const totalVolume = visibleLandings.reduce((sum, landing) => sum + landing.volumeTons, 0);
  const selectedTitle = selectedBoat?.registration ?? selectedQuay?.name ?? "Périmètre actif";
  const selectedContext: WorkflowContext = { title: selectedTitle, scope: selectedQuay?.name || scope, sourceId: selectedBoat?.id || selectedQuay?.id, quayId: selectedQuay?.id, description: selectedAlerts[0]?.title || "Information opérationnelle à instruire." };
  const contextRows: Array<[string, string]> = selectedBoat ? [["Immatriculation", selectedBoat.registration], ["Quai rattaché", selectedQuay?.name ?? "—"], ["Position", selectedBoat.lastPosition], ["Déclaration", selectedBoat.lastDeclaration], ["Activité", selectedBoat.declaredActivity]] : selectedQuay ? [["Région", selectedQuay.region], ["Commune", selectedQuay.commune], ["Débarquements", String(selectedLandings.length)], ["Volume déclaré", `${selectedLandings.reduce((sum, item) => sum + item.volumeTons, 0).toFixed(1)} t`], ["Pirogues actives", String(selectedQuay.activePirogues)], ["Preuves générées", String(artifacts.filter((item) => item.scope === selectedQuay.name).length)]] : [];
  const verified = selection?.id ? verifiedIds.includes(selection.id) : false;

  return <section className="min-h-full">
    <WorkspaceHeader title="Atlas maritime" question="Observer l’activité littorale et maritime en temps réel." scope={scope} onScopeChange={(next) => { setScope(next as Scope); setQuayFilter("Tous"); setSelection(null); }} onExport={() => openWorkflow("export-zone", { title: "Rapport de zone maritime", scope, description: "Quais, pirogues, débarquements, alertes et incidents du périmètre actif." })} />
    <SituationBanner eyebrow="Situation maritime nationale" statement="186 pirogues actives · 12 quais surveillés · 3 zones en vigilance" detail="Dernière synchronisation il y a 4 min · données simulées" actionLabel="Briefing du jour" onAction={() => setBriefingOpen(true)} />
    <FilterStrip>
      <div className="flex rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-0.5"><button onClick={() => setMode("quays")} className={`h-8 rounded-[2px] px-3 text-[11px] font-bold ${mode === "quays" ? "bg-[var(--mb-ocean-600)] text-white" : "text-[var(--mb-neutral-600)]"}`}>Vue quais</button><button onClick={() => setMode("pirogues")} className={`h-8 rounded-[2px] px-3 text-[11px] font-bold ${mode === "pirogues" ? "bg-[var(--mb-ocean-600)] text-white" : "text-[var(--mb-neutral-600)]"}`}>Vue pirogues</button></div>
      <FilterField label="Quai"><select value={quayFilter} onChange={(event) => { setQuayFilter(event.target.value); setSelection(event.target.value === "Tous" ? null : { kind: "quay", id: event.target.value }); }} className={inputClass}><option>Tous</option>{quays.filter((quay) => scope === "Nationale" || quay.region === scope).map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></FilterField>
      <FilterField label="Statut"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "Tous" | Level)} className={inputClass}><option>Tous</option><option value="normal">Vérifié</option><option value="surveillance">Vigilance</option><option value="urgent">Critique</option></select></FilterField>
      <FilterField label="Période"><select value={period} onChange={(event) => setPeriod(event.target.value)} className={inputClass}><option>Aujourd’hui</option><option>7 derniers jours</option><option>30 derniers jours</option></select></FilterField>
      <div className="ml-auto flex items-center gap-3 px-1 font-mono text-[9px] text-[var(--mb-neutral-600)]"><span>{visibleQuays.length} QUAIS</span><span>{visiblePirogues.length} PIROGUES</span><span>{visibleIncidents.length} INCIDENTS</span><span>{totalVolume.toFixed(1)} T</span></div>
    </FilterStrip>
    <div className="grid min-h-[calc(100vh-201px)] min-w-0 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-rows-[minmax(430px,1fr)_170px]">
      <div className="min-h-0 border-b border-[var(--mb-neutral-200)] xl:border-r"><MapCanvas mode={mode} layers={layers} onToggleLayer={(layer) => setLayers((current) => ({ ...current, [layer]: !current[layer] }))} quays={visibleQuays} pirogues={visiblePirogues} landings={visibleLandings} alerts={visibleAlerts} incidents={visibleIncidents} selection={selection} onSelectQuay={(id) => setSelection({ kind: "quay", id })} onSelectPirogue={(id) => setSelection({ kind: "pirogue", id })} /></div>
      <div className="min-h-0 xl:row-span-2"><ContextPanel empty={!selection || !selectedQuay} title={selectedTitle} subtitle={verified ? "Vérification humaine enregistrée" : selectedBoat ? selectedBoat.status : selectedQuay ? `Dernier signal · ${selectedQuay.lastUpdated}` : ""} level={verified ? "normal" : selectedBoat?.level ?? selectedQuay?.level} trend={selectedQuay ? quayTrends[selectedQuay.id] : undefined} rows={contextRows} actions={[
        { label: "Lancer une vérification terrain", primary: true, onClick: () => openWorkflow("verification", selectedContext) },
        { label: "Signaler une situation", onClick: () => openWorkflow("alert", selectedContext) },
        { label: "Voir le dossier complet", onClick: () => openWorkflow("full-record", selectedContext) },
        { label: "Générer un rapport de zone", onClick: () => openWorkflow("export-zone", selectedContext) },
      ]} /></div>
      <div className="grid min-h-0 overflow-auto bg-white xl:grid-cols-2 xl:border-r"><section className="border-b border-[var(--mb-neutral-200)] xl:border-b-0 xl:border-r"><div className="flex h-9 items-center justify-between border-b border-[var(--mb-neutral-200)] px-3"><h3 className="text-[11px] font-bold">Registre d’événements</h3><span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">{period}</span></div><EvidenceTimeline items={evidence.slice(0, 4)} /></section><section><div className="flex h-9 items-center border-b border-[var(--mb-neutral-200)] px-3 text-[11px] font-bold">Preuves et exports générés</div><ArtifactRegister artifacts={artifacts.slice(0, 3)} /></section></div>
    </div>
    {briefingOpen ? <BriefingPanel onClose={() => setBriefingOpen(false)} /> : null}
  </section>;
}

type WorkflowItem = { id: string; title: string; detail: string; level?: Level; kind: string; owner: string; territory: string; next: string; amount?: number; maturity?: number };

function FiliereProgrammes({ scope, setScope, evidence, artifacts, opportunities, fundingRequests, qualifiedNeeds, partnerSolicitations, programAssociations, openWorkflow }: {
  scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; artifacts: GeneratedArtifact[]; opportunities: FundingOpportunity[]; fundingRequests: FundingRequest[]; qualifiedNeeds: QualifiedNeedRecord[]; partnerSolicitations: PartnerSolicitation[]; programAssociations: ProgramAssociation[]; openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>("need-3");
  const scopedNeeds = communityNeeds.filter((need) => scope === "Nationale" || need.region === scope);
  const scopedOpportunities = opportunities.filter((item) => scope === "Nationale" || item.territory === scope);
  const selectedNeed = scopedNeeds.find((need) => need.id === selectedId) ?? scopedNeeds[0] ?? communityNeeds[0];
  const selectedOpportunity = scopedOpportunities.find((item) => item.id === selectedId) ?? scopedOpportunities[0] ?? opportunities[0];
  const totalPotential = scopedOpportunities.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const readyCount = scopedOpportunities.filter((item) => item.status !== "À qualifier").length;
  const needItems: WorkflowItem[] = scopedNeeds.map((need) => ({ id: need.id, title: need.need, detail: `${formatFcfa(opportunities.find((item) => item.needId === need.id)?.estimatedAmount || 0)} · maturité ${needMaturityScores[need.id] || 50}%`, level: need.urgency, kind: "Signal terrain", owner: need.actors, territory: need.place, next: need.nextAction, amount: opportunities.find((item) => item.needId === need.id)?.estimatedAmount, maturity: needMaturityScores[need.id] }));
  const qualifiedItems = [...needItems.filter((item) => (item.maturity || 0) >= 65).map((item) => ({ ...item, id: `qual-${item.id}`, kind: "Qualification", detail: `${formatFcfa(item.amount || 0)} · preuve requise`, next: "Constituer un dossier de financement" })), ...qualifiedNeeds.map((item) => ({ id: item.id, title: communityNeeds.find((need) => need.id === item.sourceNeedId)?.need || "Besoin qualifié", detail: `${formatFcfa(item.estimatedAmount)} · maturité ${item.maturityScore}%`, kind: "Qualification", owner: item.validator, territory: item.community, next: "Constituer un dossier de financement", amount: item.estimatedAmount, maturity: item.maturityScore }))];
  const programItems: WorkflowItem[] = [...communityProjects.map((project) => ({ id: project.id, title: project.project, detail: `${project.estimatedBudget} · ${project.status}`, kind: "Programme", owner: project.owner, territory: project.territory, next: project.nextAction })), ...programAssociations.map((item) => ({ id: item.id, title: item.program, detail: `Association validée · jalon ${item.nextMilestone}`, kind: "Programme", owner: item.owner, territory: scope, next: item.expectedImpact }))];
  const partnerItems: WorkflowItem[] = partners.slice(0, 3).map((partner) => { const solicitation = partnerSolicitations.find((item) => item.partner === partner.name); return { id: partner.id, title: partner.name, detail: solicitation ? `${solicitation.status} · réponse ${solicitation.responseDate}` : partner.usefulFor, kind: "Partenaire", owner: partner.family, territory: partner.territory, next: solicitation ? "Suivre la réponse" : "Mobiliser" }; });
  const actionItems: WorkflowItem[] = pendingActions.slice(0, 3).map((action) => ({ id: action.id, title: action.action, detail: `${action.owner} · ${action.dueDate}`, level: action.level, kind: "Action", owner: action.owner, territory: action.territory, next: "Exécuter" }));
  const impactItems: WorkflowItem[] = scopedOpportunities.slice(0, 3).map((item) => ({ id: `impact-${item.id}`, title: `${item.beneficiaries} acteurs valorisés`, detail: item.expectedImpact, kind: "Impact", owner: item.compatibleFunder, territory: item.territory, next: "Rattacher une preuve" }));
  const columns = [{ id: "signals", title: "Signal terrain", items: needItems }, { id: "qualification", title: "Qualification", items: qualifiedItems }, { id: "program", title: "Programme", items: programItems }, { id: "partner", title: "Partenaire", items: partnerItems }, { id: "action", title: "Action", items: actionItems }, { id: "impact", title: "Impact", items: impactItems }];
  const needContext: WorkflowContext = { title: selectedNeed.need, scope: selectedNeed.place, sourceId: selectedNeed.id, description: selectedNeed.nextAction, amount: String(selectedOpportunity.estimatedAmount), beneficiaries: String(selectedOpportunity.beneficiaries), partner: selectedOpportunity.compatibleFunder };
  const opportunityContext: WorkflowContext = { title: selectedOpportunity.title, scope: selectedOpportunity.territory, sourceId: selectedOpportunity.id, description: selectedOpportunity.expectedImpact, amount: String(selectedOpportunity.estimatedAmount), beneficiaries: String(selectedOpportunity.beneficiaries), partner: selectedOpportunity.compatibleFunder };

  const portfolio = ["Équipement", "Formation", "Infrastructure", "Financement direct"].map((label, index) => ({ label, amount: scopedOpportunities.filter((item) => item.category === label).reduce((sum, item) => sum + item.estimatedAmount, 0), color: ["bg-[var(--mb-ocean-600)]", "bg-[var(--mb-green-600)]", "bg-[var(--mb-navy-500)]", "bg-[var(--mb-sand-300)]"][index] }));
  return <section className="min-h-full">
    <WorkspaceHeader title="Filière & Financement" question="Valoriser la filière, structurer le financement." scope={scope} onScopeChange={(value) => setScope(value as Scope)} onExport={() => openWorkflow("institutional-export", { title: "Registre des opportunités de financement", scope, description: `${readyCount} opportunités éligibles pour ${formatFcfa(totalPotential)}.` })} />
    <ValueBanner amount={totalPotential} programs={18} partners={6} />
    <MetricRow metrics={[
      { label: "Besoins qualifiés", value: String(qualifiedItems.length + qualifiedNeeds.length), detail: "Portefeuille documenté" },
      { label: "Montant estimé", value: formatFcfa(totalPotential), detail: "Potentiel de valorisation" },
      { label: "Prêtes à financer", value: String(readyCount), detail: "Maturité suffisante", level: "normal" },
      { label: "Dossiers générés", value: String(fundingRequests.length), detail: "Validation humaine enregistrée" },
    ]} />
    <div className="grid gap-2 bg-[var(--mb-neutral-100)] p-2">
      <section className="border border-[var(--mb-neutral-200)] bg-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mb-neutral-200)] px-3 py-2"><div><h3 className="text-[12px] font-bold">Portefeuille de besoins</h3><p className="mt-0.5 text-[9px] text-[var(--mb-neutral-600)]">Besoins chiffrés, maturité et prochaine instruction.</p></div><button onClick={() => openWorkflow("qualification", needContext)} className={primaryButton}>Qualifier un besoin</button></div><div className="p-3"><PortfolioBars values={portfolio} /></div><DataTable headers={["Besoin", "Territoire", "Catégorie", "Montant estimé", "Maturité", "Action"]} rows={scopedNeeds.map((need) => { const opportunity = opportunities.find((item) => item.needId === need.id); return { id: need.id, cells: [<strong key="need">{need.need}</strong>, need.place, opportunity?.category || "À préciser", <span key="amount" className="font-mono">{formatFcfa(opportunity?.estimatedAmount || 0)}</span>, <span key="score" className="font-mono">{needMaturityScores[need.id] || 50}%</span>, <button key="action" onClick={() => { setSelectedId(need.id); openWorkflow("qualification", { ...needContext, title: need.need, scope: need.place, sourceId: need.id }); }} className="font-bold text-[var(--mb-ocean-600)]">Qualifier</button>] }; })} onRowClick={setSelectedId} /></section>
      <section className="min-w-0 border border-[var(--mb-neutral-200)] bg-white"><div className="flex h-9 items-center justify-between px-3"><h3 className="text-[11px] font-bold">Pipeline de valorisation</h3><span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">BESOIN → IMPACT</span></div><div className="overflow-x-auto"><WorkflowBoard columns={columns} selectedId={selectedId} onSelect={setSelectedId} /></div></section>
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <section className="border border-[var(--mb-neutral-200)] bg-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mb-neutral-200)] px-3 py-2"><div><h3 className="text-[12px] font-bold">Opportunités de financement</h3><p className="mt-0.5 text-[9px] text-[var(--mb-neutral-600)]">Rapprochement besoin, partenaire, montant et impact attendu.</p></div><button onClick={() => openWorkflow("partner", opportunityContext)} className={primaryButton}>Solliciter un partenaire</button></div><div className="grid gap-2 p-3 lg:grid-cols-2">{scopedOpportunities.map((item) => <FundingOpportunityCard key={item.id} opportunity={item} onSelect={() => setSelectedId(item.id)} onBuild={() => openWorkflow("funding", { title: item.title, scope: item.territory, sourceId: item.id, description: item.expectedImpact, amount: String(item.estimatedAmount), beneficiaries: String(item.beneficiaries), partner: item.compatibleFunder })} />)}</div><div className="flex flex-wrap gap-2 border-t border-[var(--mb-neutral-200)] p-3"><button onClick={() => openWorkflow("program", opportunityContext)} className={primaryButton}>Associer un programme</button><span className="self-center text-[9px] text-[var(--mb-neutral-600)]">{partnerSolicitations.length} sollicitation(s) · {programAssociations.length} association(s) programme · {fundingRequests.length} dossier(s)</span></div></section>
        <section className="border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)]"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2"><h3 className="text-[12px] font-bold">Preuves d’impact</h3><p className="mt-0.5 text-[9px] text-[var(--mb-neutral-600)]">Résultats mobilisables dans les dossiers.</p></div><div className="grid gap-px bg-[var(--mb-neutral-200)] sm:grid-cols-2 xl:grid-cols-1">{impactProofs.map((proof) => <ImpactProofCard key={proof.id} figure={proof.figure} unit={proof.unit} detail={proof.detail} />)}</div><ArtifactRegister artifacts={artifacts.filter((item) => ["qualification", "funding", "partner", "program"].includes(item.kind)).slice(0, 4)} /></section>
      </div>
    </div>
  </section>;
}

function PilotageInstitutionnel({ scope, setScope, evidence, artifacts, opportunities, fundingRequests, alerts, record, openWorkflow }: {
  scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; artifacts: GeneratedArtifact[]; opportunities: FundingOpportunity[]; fundingRequests: FundingRequest[]; alerts: MapAlert[]; record: (title: string, detail: string) => void; openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void;
}) {
  const scopedQuays = quays.filter((quay) => scope === "Nationale" || quay.region === scope);
  const scopedIds = new Set(scopedQuays.map((quay) => quay.id));
  const scopedAlerts = alerts.filter((alert) => scopedIds.has(alert.quayId));
  const scopedOpportunities = opportunities.filter((item) => scope === "Nationale" || item.territory === scope);
  const readyFunding = scopedOpportunities.filter((item) => item.status !== "À qualifier");
  const totalVolume = scopedQuays.reduce((sum, quay) => sum + quay.volumeTons, 0);
  const mapLayers: Record<MapLayerId, boolean> = { quays: true, pirogues: false, landings: false, alerts: true, incidents: true };
  const synthesis = `Situation au 13 juillet 2026 · 08h14 : activité normale sur ${Math.max(9, new Set(scopedQuays.map((quay) => quay.region)).size)} régions, ${scopedAlerts.filter((item) => item.level !== "normal").length} zones en vigilance et ${Math.max(1, fundingRequests.filter((item) => item.eligibilityStatus === "Dossier généré").length)} dossier de financement en attente d’arbitrage.`;
  const noteContext: WorkflowContext = { title: "Note d’arbitrage de la situation du jour", scope, description: `${synthesis} Prioriser les vérifications critiques et instruire les dossiers de financement les plus matures.` };
  const decisions = [
    ...scopedAlerts.slice(0, 2).map((alert) => ({ id: alert.id, title: alert.title, detail: `${getQuayById(alert.quayId).name} · ${alert.nextAction}`, level: alert.level, action: "Lancer la vérification", onAction: () => openWorkflow("verification", { title: alert.title, scope: getQuayById(alert.quayId).name, sourceId: alert.quayId, description: alert.nextAction }) })),
    ...readyFunding.slice(0, 2).map((item) => ({ id: item.id, title: `Arbitrer le financement · ${item.title}`, detail: `${formatFcfa(item.estimatedAmount)} · ${item.compatibleFunder} · maturité ${item.maturityScore}%`, level: "normal" as Level, action: "Constituer le dossier", onAction: () => openWorkflow("funding", { title: item.title, scope: item.territory, sourceId: item.id, description: item.expectedImpact, amount: String(item.estimatedAmount), beneficiaries: String(item.beneficiaries), partner: item.compatibleFunder }) })),
  ].slice(0, 4);

  return <section className="min-h-full">
    <WorkspaceHeader title="Pilotage institutionnel" question="Vue nationale et aide à la décision." scope={scope} onScopeChange={(value) => setScope(value as Scope)} onExport={() => openWorkflow("institutional-export", { title: "Dossier de synthèse institutionnelle", scope, description: synthesis })} />
    <SituationBanner eyebrow="Situation nationale consolidée" statement={synthesis} detail="Lecture fondée sur les signaux simulés, les preuves enregistrées et les dossiers en instruction." actionLabel="Générer la note au Ministre" onAction={() => openWorkflow("note", noteContext)} tone="navy" />
    <MetricRow metrics={[
      { label: "Volume débarqué", value: `${totalVolume.toFixed(1)} t`, detail: "Déclarations consolidées" },
      { label: "Alertes critiques", value: String(scopedAlerts.filter((item) => item.level === "urgent").length), detail: "Action immédiate", level: "urgent" },
      { label: "Financement prêt", value: formatFcfa(readyFunding.reduce((sum, item) => sum + item.estimatedAmount, 0)), detail: `${readyFunding.length} opportunités`, level: "normal" },
      { label: "Dossiers validés", value: String(fundingRequests.length), detail: "Preuves générées" },
    ]} />
    <div className="grid min-w-0 gap-2 bg-[var(--mb-neutral-100)] p-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
      <div className="grid min-w-0 gap-2">
        <section className="grid min-h-[290px] border border-[var(--mb-neutral-200)] bg-white lg:grid-cols-[minmax(17rem,.65fr)_minmax(0,1.35fr)]"><div className="min-h-[260px] border-b border-[var(--mb-neutral-200)] lg:border-b-0 lg:border-r"><MapCanvas mode="quays" layers={mapLayers} onToggleLayer={() => undefined} quays={scopedQuays} pirogues={[]} landings={[]} alerts={scopedAlerts} incidents={maritimeIncidents.filter((item) => scopedIds.has(item.quayId))} selection={null} onSelectQuay={(id) => record("Quai consulté", getQuayById(id).name)} onSelectPirogue={() => undefined} /></div><div className="min-w-0"><div className="flex h-9 items-center justify-between border-b border-[var(--mb-neutral-200)] px-3"><h3 className="text-[11px] font-bold">Lecture territoriale</h3><span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">VOLUME · TENDANCE</span></div><DataTable headers={["Quai", "Région", "Volume", "Tendance", "État"]} rows={scopedQuays.map((quay) => ({ id: quay.id, cells: [<strong key="name">{quay.name}</strong>, quay.region, <span key="volume" className="font-mono">{quay.volumeTons.toFixed(1)} t</span>, <span key="trend" className="font-mono text-[var(--mb-green-600)]">+{quayTrends[quay.id]?.at(-1) || 0}%</span>, <StatusBadge key="status" level={quay.level} />] }))} /></div></section>
        <section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2"><h3 className="text-[11px] font-bold">Financements en cours</h3><p className="mt-0.5 text-[9px] text-[var(--mb-neutral-600)]">Dossiers à arbitrer, valider ou transmettre.</p></div><DataTable headers={["Dossier", "Territoire", "Partenaire", "Montant", "Statut", "Décision"]} rows={readyFunding.map((item) => ({ id: item.id, cells: [<strong key="title">{item.title}</strong>, item.territory, item.compatibleFunder, <span key="amount" className="font-mono">{formatFcfa(item.estimatedAmount)}</span>, <StatusBadge key="status">{item.status}</StatusBadge>, <button key="action" onClick={() => openWorkflow("funding", { title: item.title, scope: item.territory, sourceId: item.id, description: item.expectedImpact, amount: String(item.estimatedAmount), beneficiaries: String(item.beneficiaries), partner: item.compatibleFunder })} className="font-bold text-[var(--mb-ocean-600)]">Constituer le dossier</button>] }))} /></section>
        <ExportPanel onExport={() => openWorkflow("institutional-export", { title: "Rapport de situation et de financement", scope, description: synthesis })} />
      </div>
      <aside className="grid content-start gap-2"><DecisionPanel title="Décisions à arbitrer aujourd’hui" items={decisions} /><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Dernière note institutionnelle</div>{artifacts.find((item) => item.kind === "note") ? <div className="p-2"><DocumentPreview document={artifactToDocument(artifacts.find((item) => item.kind === "note")!)} compact /></div> : <div className="p-3"><p className="text-[10px] text-[var(--mb-neutral-600)]">Aucune note générée pour ce périmètre.</p><button onClick={() => openWorkflow("note", noteContext)} className={`${primaryButton} mt-2`}>Générer la note au Ministre</button></div>}</section><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Registre des actions</div><ActionRegister items={pendingActions.map((item) => ({ id: item.id, action: item.action, owner: item.owner, due: item.dueDate, level: item.level }))} onAction={(id) => { const action = pendingActions.find((item) => item.id === id); openWorkflow("verification", { title: action?.action || id, scope: action?.territory || scope, sourceId: id, description: action?.status }); }} /></section><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Documents de décision</div><ArtifactRegister artifacts={artifacts.filter((item) => ["note", "institutional-export", "funding"].includes(item.kind)).slice(0, 5)} /></section><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Registre de preuve</div><EvidenceTimeline items={evidence.slice(0, 4)} /></section></aside>
    </div>
  </section>;
}
