"use client";

import { useMemo, useState } from "react";
import {
  communityNeeds,
  fieldReferents,
  getQuayById,
  landings,
  mapAlerts,
  pendingActions,
  pirogues,
  quayPosts,
  quays,
  type Level,
  type MapAlert,
  type Region,
} from "@/data/ministryControlTowerData";
import {
  formatFcfa,
  initialFundingOpportunities,
  initialGeneratedArtifacts,
  maritimeIncidents,
  quayTrends,
  type FundingOpportunity,
  type FundingRequest,
  type FundingDossierRecord,
  type GeneratedArtifact,
  type PartnerRelationship,
  type PartnerSolicitation,
  type ProgramAssociation,
  type QualifiedNeedRecord,
  type DecisionRecord,
  type SignalRecord,
  type VerificationTask,
  type WorkflowKind,
  type ZoneReportRecord,
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
import { BriefingPanel, SituationBanner, ValueBanner } from "./MinistryV3Components";
import { FiliereNeedsView } from "./MinistryV4Components";
import { ReferentsPanel } from "./MinistryCredibility";
import { DecisionRegister, FundingRegister, PartnerRegister, ReportRegister, RoleFrame, WhatsAppBridge, type DemoRole } from "./MinistryOperationalRegisters";
import { CoordinationBanner, ImpactDemonstrated, RisksPanel, TodayView } from "./MinistryDailyExperience";
import { OperationalDossierPanel, PosteOfficielPanel } from "./MinistryDossierExperience";
import { buildOperationalDossiers, type DossierOperationnel } from "@/lib/ministryOperationalDossiers";

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
  const [workspace, setWorkspace] = useState<WorkspaceId>("today");
  const [scope, setScope] = useState<Scope>("Nationale");
  const [evidence, setEvidence] = useState(initialEvidence);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>(initialGeneratedArtifacts);
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>(initialFundingOpportunities);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [qualifiedNeeds, setQualifiedNeeds] = useState<QualifiedNeedRecord[]>([]);
  const [, setPartnerSolicitations] = useState<PartnerSolicitation[]>([]);
  const [, setProgramAssociations] = useState<ProgramAssociation[]>([]);
  const [createdAlerts, setCreatedAlerts] = useState<MapAlert[]>([]);
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);
  const [fundingDossiers, setFundingDossiers] = useState<FundingDossierRecord[]>([]);
  const [partnerRelationships, setPartnerRelationships] = useState<PartnerRelationship[]>([]);
  const [verificationTasks, setVerificationTasks] = useState<VerificationTask[]>([]);
  const [signalRecords, setSignalRecords] = useState<SignalRecord[]>([]);
  const [decisionRecords, setDecisionRecords] = useState<DecisionRecord[]>([]);
  const [zoneReports, setZoneReports] = useState<ZoneReportRecord[]>([]);
  const [role, setRole] = useState<DemoRole>("Ministère");
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflow>(null);
  const [systemNotice, setSystemNotice] = useState("Dernière synchronisation · 10:45");
  const [selectedDossier, setSelectedDossier] = useState<DossierOperationnel | null>(null);
  const operationalDossiers = useMemo(() => buildOperationalDossiers({ verificationTasks, signals: signalRecords, fundingDossiers, opportunities, reports: zoneReports, decisions: decisionRecords }), [decisionRecords, fundingDossiers, opportunities, signalRecords, verificationTasks, zoneReports]);

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
    if (artifact.kind === "verification" && context?.sourceId) {
      setVerificationTasks((items) => [{ id: `verification-${Date.now()}`, targetId: context.sourceId!, target: context.title, scope: context.scope, recipient: values.recipient, channel: values.channel as VerificationTask["channel"], status: "Demandée", dueDate: values.dueDate, owner: "Cellule régionale", message: values.requestMessage, artifactId: artifact.id }, ...items]);
    }
    if (artifact.kind === "alert") {
      setSignalRecords((items) => [{
        id: `signal-${Date.now()}`,
        title: values.description || context?.title || "Situation signalée",
        scope: context?.scope || "Périmètre à qualifier",
        sender: values.validator || "Agent territorial",
        receivingCell: "Cellule régionale",
        messageType: values.alertType || "Signalement terrain",
        attachmentHint: "Photo / audio / position à joindre",
        criticality: (values.severity || "Vigilance") as SignalRecord["criticality"],
        trustLevel: "declared",
        status: "Signalé",
        createdAt: new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date()),
        artifactId: artifact.id,
      }, ...items]);
    }
    if (artifact.kind === "qualification") {
      setQualifiedNeeds((items) => [{
        id: `qualified-${Date.now()}`,
        sourceNeedId: context?.needId || context?.sourceId || "need-1",
        category: values.category,
        actorsAffected: Number(values.actorsAffected || 0),
        estimatedAmount: Number(values.estimatedAmount || 0),
        maturityScore: Number(values.maturityScore || 0),
        community: values.community,
        validator: values.validator,
        artifactId: artifact.id,
      }, ...items.filter((item) => item.sourceNeedId !== (context?.needId || context?.sourceId))]);
    }
    if (artifact.kind === "funding") {
      const opportunityId = context?.sourceId || opportunities[0].id;
      const needId = context?.needId || opportunities.find((item) => item.id === opportunityId)?.needId || "need-1";
      const dossierId = `dossier-${Date.now()}`;
      setFundingRequests((items) => [{
        id: dossierId,
        opportunityId,
        title: values.sourceNeed,
        amountRequested: Number(values.amountRequested || 0),
        beneficiaryCount: Number(values.beneficiaryCount || 0),
        targetFunder: values.targetFunder,
        ministryUnit: values.ministryUnit,
        maturityScore: Number(values.maturityScore || 0),
        eligibilityStatus: "Dossier constitué",
        status: "Validée",
        artifactId: artifact.id,
      }, ...items]);
      setFundingDossiers((items) => [{ id: dossierId, needId, title: values.sourceNeed, amountRequested: Number(values.amountRequested || 0), targetPartner: values.targetFunder, status: "Transmission à confirmer", owner: values.ministryUnit, updatedAt: "à l’instant", nextAction: "Confirmer la transmission manuelle", trustLevel: "verified", artifactId: artifact.id }, ...items]);
      setOpportunities((items) => items.map((item) => item.id === opportunityId ? { ...item, status: "Dossier constitué" } : item));
    }
    if (artifact.kind === "partner") {
      setPartnerSolicitations((items) => [{
        id: `partner-request-${Date.now()}`,
        partner: values.partner,
        supportType: values.supportType,
        requestedContribution: values.requestedContribution,
        responseDate: values.responseDate,
        owner: values.owner,
        status: "Brouillon",
        artifactId: artifact.id,
      }, ...items]);
      setPartnerRelationships((items) => [{ id: `relationship-${Date.now()}`, partnerName: values.partner, category: values.partnerCategory as PartnerRelationship["category"], interestTags: [values.supportType, context?.scope || "Territoire"], compatibilityReason: context?.description || "Partenaire compatible avec le besoin qualifié", status: "Sollicitation préparée", lastInteractionDate: "Préparation locale", followUpDueDate: values.responseDate, owner: values.owner, dossierId: fundingDossiers.find((dossier) => dossier.needId === context?.needId)?.id }, ...items]);
    }
    if (artifact.kind === "export-zone") {
      setZoneReports((items) => [{ id: `report-${Date.now()}`, title: artifact.title, zone: context?.scope || artifact.scope, period: values.period, author: values.validator, generatedAt: artifact.createdAt, trustLevel: "consolidated", linkedObjectsCount: 8, purpose: values.description, artifactId: artifact.id }, ...items]);
    }
    if (artifact.kind === "note") {
      const recommendations = (values.recommendations || "Arbitrer les actions prioritaires").split(/[.;]\s*/).filter(Boolean).slice(0, 3);
      setDecisionRecords((items) => [...recommendations.map((recommendation, index) => ({ id: `decision-${Date.now()}-${index}`, noteTitle: artifact.title, recommendation, status: "À arbitrer" as const, priority: index === 0 ? "Urgente" as const : "Prioritaire" as const, source: context?.scope || "Synthèse nationale", owner: "Cabinet / direction technique", createdAt: artifact.createdAt, nextAction: "Enregistrer l’arbitrage", artifactId: artifact.id })), ...items]);
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
  const confirmTransmission = (id: string, date: string, responsible: string) => {
    const dossier = fundingDossiers.find((item) => item.id === id);
    setFundingDossiers((items) => items.map((item) => item.id === id ? { ...item, status: "Transmis", transmittedAt: date, transmittedBy: responsible, updatedAt: date, nextAction: "Enregistrer la réponse du partenaire" } : item));
    setFundingRequests((items) => items.map((item) => item.id === id ? { ...item, eligibilityStatus: "Transmis", status: "Transmise" } : item));
    if (dossier) setOpportunities((items) => items.map((item) => item.needId === dossier.needId ? { ...item, status: "Transmis" } : item));
    setPartnerRelationships((items) => items.map((item) => item.dossierId === id ? { ...item, status: "Sollicité", lastInteractionDate: date } : item));
    record("Transmission confirmée", `${dossier?.title || id} · ${responsible} · ${date}`);
  };
  const recordFundingResponse = (id: string) => { setFundingDossiers((items) => items.map((item) => item.id === id ? { ...item, status: "En négociation", nextAction: "Préparer la prochaine échéance", updatedAt: "à l’instant" } : item)); record("Réponse partenaire enregistrée", id); };
  const recordPartnerResponse = (id: string) => { setPartnerRelationships((items) => items.map((item) => item.id === id ? { ...item, status: "En négociation", lastInteractionDate: "Aujourd’hui" } : item)); record("Suivi partenaire mis à jour", id); };
  const prepareWhatsApp = (id: string, message: string) => {
    navigator.clipboard?.writeText(message);
    setVerificationTasks((items) => items.map((item) => item.id === id && item.status === "Demandée" ? { ...item, status: "Message préparé" } : item));
    record("Message WhatsApp préparé", "À envoyer manuellement au référent · envoi réel non connecté");
  };
  const followVerification = (id: string) => {
    const task = verificationTasks.find((item) => item.id === id);
    setVerificationTasks((items) => items.map((item) => item.id === id && item.status === "Message préparé" ? { ...item, status: "Assignée" } : item));
    record("Vérification suivie", `${task?.target || id} · en attente du constat du référent`);
  };
  const depositConstat = (id: string) => {
    const task = verificationTasks.find((item) => item.id === id);
    setVerificationTasks((items) => items.map((item) => item.id === id ? { ...item, status: "Constat déposé" } : item));
    record("Constat reçu", `${task?.target || id} · validation humaine requise`);
  };
  const validateConstat = (id: string) => {
    const task = verificationTasks.find((item) => item.id === id);
    setVerificationTasks((items) => items.map((item) => item.id === id ? { ...item, status: "Vérifiée" } : item));
    if (task) setVerifiedIds((ids) => Array.from(new Set([task.targetId, ...ids])));
    record("Constat validé", `${task?.target || id} · confiance passée à Vérifiée`);
  };
  const qualifySignal = (id: string) => { setSignalRecords((items) => items.map((item) => item.id === id ? { ...item, status: "Qualifié", trustLevel: "declared" } : item)); record("Signalement qualifié", id); };
  const advanceSignal = (id: string) => {
    const signal = signalRecords.find((item) => item.id === id);
    setSignalRecords((items) => items.map((item) => item.id === id ? { ...item, status: item.status === "Qualifié" && item.criticality === "Critique" ? "Escaladé en alerte" : item.status === "Qualifié" ? "En traitement" : item.status === "Escaladé en alerte" ? "En traitement" : "Clôturé" } : item));
    record("Signalement mis à jour", `${signal?.title || id} · prochaine étape enregistrée`);
  };
  const advanceDecision = (id: string) => { setDecisionRecords((items) => items.map((item) => item.id === id ? { ...item, status: item.status === "À arbitrer" ? "Arbitrée" : item.status === "Arbitrée" ? "En exécution" : "Exécutée", nextAction: item.status === "À arbitrer" ? "Lancer l’exécution" : "Suivre la mise en œuvre" } : item)); record("Décision mise à jour", id); };
  const resetKayarJourney = () => {
    const taskArtifactIds = new Set(verificationTasks.filter((item) => item.targetId === "kayar").map((item) => item.artifactId));
    const reportArtifactIds = new Set(zoneReports.filter((item) => item.zone === "Kayar").map((item) => item.artifactId));
    setVerificationTasks((items) => items.filter((item) => item.targetId !== "kayar"));
    setVerifiedIds((items) => items.filter((id) => id !== "kayar"));
    setZoneReports((items) => items.filter((item) => item.zone !== "Kayar"));
    setArtifacts((items) => items.filter((item) => !taskArtifactIds.has(item.id) && !reportArtifactIds.has(item.id) && item.scope !== "Kayar"));
    record("Démonstration Kayar réinitialisée", "Écart de pesée déclaré · vérification à demander");
  };

  const handleDossierPrimary = (dossier: DossierOperationnel) => {
    const task = verificationTasks.find((item) => item.targetId === dossier.sourceId || (dossier.sourceId === "kayar" && item.targetId === "kayar"));
    setSelectedDossier(null);
    if (dossier.action === "request-verification") return openWorkflow("verification", { title: dossier.linkedObject, scope: "Kayar", sourceId: "kayar", quayId: "kayar", description: "Confirmer l’écart de pesée avant consolidation." });
    if (dossier.action === "prepare-whatsapp" && task) return prepareWhatsApp(task.id, task.message);
    if (dossier.action === "follow-verification" && task) return followVerification(task.id);
    if (dossier.action === "deposit-constat" && task) return depositConstat(task.id);
    if (dossier.action === "validate-constat" && task) return validateConstat(task.id);
    if (dossier.action === "generate-report") return openWorkflow("export-zone", { title: `Rapport de zone · ${dossier.linkedObject}`, scope: dossier.linkedObject.includes("Kayar") ? "Kayar" : dossier.territory, sourceId: dossier.sourceId, quayId: dossier.quayId, description: dossier.finalOutput });
    if (dossier.action === "open-funding") return setWorkspace("community");
    if (dossier.action === "open-pilotage") return setWorkspace("tracking");
    if (dossier.action === "open-note") return openWorkflow("note", { title: dossier.linkedObject, scope: dossier.territory, description: dossier.nextAction });
    return setWorkspace("map");
  };

  return <AppShell topBar={<TopBar notice={systemNotice} onExport={globalExport} />} rail={<NavigationRail active={workspace} onChange={setWorkspace} />}>
    <MobileWorkspaceNav active={workspace} onChange={setWorkspace} />
    <RoleFrame role={role} onChange={setRole} />
    {workspace === "today" ? <TodayView role={role} dossiers={operationalDossiers} opportunities={opportunities} onNavigate={setWorkspace} onOpenDossier={setSelectedDossier} /> : null}
    {workspace === "map" ? <AtlasMaritime scope={scope} setScope={setScope} evidence={evidence} artifacts={artifacts} alerts={[...createdAlerts, ...mapAlerts]} verifiedIds={verifiedIds} verificationTasks={verificationTasks} signalRecords={signalRecords} zoneReports={zoneReports} onPrepareWhatsApp={prepareWhatsApp} onFollowVerification={followVerification} onDepositConstat={depositConstat} onValidateConstat={validateConstat} onQualifySignal={qualifySignal} onAdvanceSignal={advanceSignal} onResetKayar={resetKayarJourney} record={record} openWorkflow={openWorkflow} operationalDossiers={operationalDossiers} onOpenDossier={setSelectedDossier} /> : null}
    {workspace === "community" ? <FiliereProgrammes scope={scope} setScope={setScope} artifacts={artifacts} opportunities={opportunities} fundingRequests={fundingRequests} qualifiedNeeds={qualifiedNeeds} fundingDossiers={fundingDossiers} partnerRelationships={partnerRelationships} onConfirmTransmission={confirmTransmission} onRecordFundingResponse={recordFundingResponse} onRecordPartnerResponse={recordPartnerResponse} openWorkflow={openWorkflow} /> : null}
    {workspace === "tracking" ? <PilotageInstitutionnel scope={scope} setScope={setScope} evidence={evidence} artifacts={artifacts} opportunities={opportunities} fundingRequests={fundingRequests} decisions={decisionRecords} zoneReports={zoneReports} onAdvanceDecision={advanceDecision} alerts={[...createdAlerts, ...mapAlerts]} record={record} openWorkflow={openWorkflow} /> : null}
    {activeWorkflow && workflowProps ? <WorkflowRenderer kind={activeWorkflow.kind} {...workflowProps} /> : null}
    {selectedDossier ? <OperationalDossierPanel dossier={selectedDossier} onClose={() => setSelectedDossier(null)} onPrimary={handleDossierPrimary} onRelance={(dossier) => record("Relance enregistrée", `${dossier.id} · ${dossier.currentOwner} · canal ${dossier.originChannel}`)} /> : null}
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

function AtlasMaritime({ scope, setScope, evidence, artifacts, alerts, verifiedIds, verificationTasks, signalRecords, zoneReports, onPrepareWhatsApp, onFollowVerification, onDepositConstat, onValidateConstat, onQualifySignal, onAdvanceSignal, onResetKayar, openWorkflow, operationalDossiers, onOpenDossier }: {
  scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; artifacts: GeneratedArtifact[]; alerts: MapAlert[]; verifiedIds: string[]; verificationTasks: VerificationTask[]; signalRecords: SignalRecord[]; zoneReports: ZoneReportRecord[];
  onPrepareWhatsApp: (id: string, message: string) => void; onFollowVerification: (id: string) => void; onDepositConstat: (id: string) => void; onValidateConstat: (id: string) => void; onQualifySignal: (id: string) => void; onAdvanceSignal: (id: string) => void; onResetKayar: () => void;
  record: (title: string, detail: string) => void; openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void; operationalDossiers: DossierOperationnel[]; onOpenDossier: (dossier: DossierOperationnel) => void;
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
  const selectedOperationalDossier = selectedQuay ? operationalDossiers.find((dossier) => dossier.quayId === selectedQuay.id && dossier.workStatus !== "Terminé") ?? operationalDossiers.find((dossier) => dossier.quayId === selectedQuay.id) : undefined;
  const selectedLandings = selectedQuay ? landings.filter((landing) => landing.quayId === selectedQuay.id) : [];
  const selectedAlerts = selectedQuay ? alerts.filter((alert) => alert.quayId === selectedQuay.id) : [];
  const totalVolume = visibleLandings.reduce((sum, landing) => sum + landing.volumeTons, 0);
  const selectedTitle = selectedBoat?.registration ?? selectedQuay?.name ?? "Périmètre actif";
  const selectedContext: WorkflowContext = { title: selectedTitle, scope: selectedQuay?.name || scope, sourceId: selectedBoat?.id || selectedQuay?.id, quayId: selectedQuay?.id, description: selectedAlerts[0]?.title || "Information opérationnelle à instruire." };
  const contextRows: Array<[string, string]> = selectedBoat ? [["Immatriculation", selectedBoat.registration], ["Quai rattaché", selectedQuay?.name ?? "—"], ["Position", selectedBoat.lastPosition], ["Déclaration", selectedBoat.lastDeclaration], ["Activité", selectedBoat.declaredActivity]] : selectedQuay ? [["Région", selectedQuay.region], ["Commune", selectedQuay.commune], ["Débarquements", String(selectedLandings.length)], ["Volume déclaré", `${selectedLandings.reduce((sum, item) => sum + item.volumeTons, 0).toFixed(1)} t`], ["Pirogues actives", String(selectedQuay.activePirogues)], ["Preuves générées", String(artifacts.filter((item) => item.scope === selectedQuay.name).length)]] : [];
  const selectedTask = selection?.id ? verificationTasks.find((task) => task.targetId === selection.id) : undefined;
  const selectedReport = selectedQuay ? zoneReports.find((report) => report.zone === selectedQuay.name) : undefined;
  const verified = Boolean(["Vérifiée", "Clôturée"].includes(selectedTask?.status || "") || (selection?.id && verifiedIds.includes(selection.id)));
  const entityLevel = verified ? "normal" : selectedBoat?.level ?? selectedQuay?.level ?? "normal";
  const entityTrust = verified ? "verified" : selectedBoat?.trustLevel ?? selectedQuay?.trustLevel ?? "raw";
  const knownSituation = selectedBoat
    ? `${selectedBoat.status}. Dernière position : ${selectedBoat.lastPosition}. Dernière déclaration : ${selectedBoat.lastDeclaration}.`
    : selectedQuay
      ? `${selectedLandings.length} débarquement(s), ${selectedLandings.reduce((sum, item) => sum + item.volumeTons, 0).toFixed(1)} t déclarées et ${selectedQuay.activePirogues} pirogues actives.`
      : "Aucune information sélectionnée.";
  const trustHelper = entityTrust === "raw" ? "Information reçue, non confirmée." : entityTrust === "declared" ? "Déclarée par un acteur identifié, à confirmer sur place." : entityTrust === "verified" ? "Confirmée par un agent ou référent mandaté." : "Consolidée pour la lecture institutionnelle.";
  const taskStatus = selectedTask?.status;
  const alreadyDone = [
    selectedTask ? "Vérification demandée" : null,
    taskStatus && ["Message préparé", "Assignée", "En cours", "Constat déposé", "Vérifiée", "Clôturée"].includes(taskStatus) ? "Message WhatsApp préparé" : null,
    taskStatus && ["Assignée", "En cours", "Constat déposé", "Vérifiée", "Clôturée"].includes(taskStatus) ? "Demande confiée au référent" : null,
    taskStatus && ["Constat déposé", "Vérifiée", "Clôturée"].includes(taskStatus) ? "Constat reçu" : null,
    taskStatus && ["Vérifiée", "Clôturée"].includes(taskStatus) ? "Constat validé" : null,
    selectedReport ? "Rapport de zone généré" : null,
  ].filter((item): item is string => Boolean(item));
  const baseSituation = selectedQuay?.id === "kayar" ? "Écart de pesée signalé sur le dernier débarquement." : selectedAlerts[0]?.title || (entityLevel === "urgent" ? "Une situation critique demande une confirmation." : entityLevel === "surveillance" ? "Une situation en vigilance a été signalée." : "La situation ne présente pas d’alerte active.");
  const journey = buildAtlasJourney({ entityType: selectedBoat ? "Pirogue" : "Quai", situation: baseSituation, known: knownSituation, trustHelper, taskStatus, alreadyDone, hasReport: Boolean(selectedReport), isVerified: verified });
  const atlasActions: Parameters<typeof ContextPanel>[0]["actions"] = [];
  const detailAction = { label: selectedBoat ? "Ouvrir la fiche pirogue" : "Ouvrir le dossier du quai", group: "consultation" as const, helper: selectedBoat ? "Consulter l’identité, le cycle et les dernières déclarations." : "Consulter le poste officiel, les référents, l’activité, les alertes et les pièces.", onClick: () => selectedBoat || !selectedOperationalDossier ? openWorkflow("full-record", selectedContext) : onOpenDossier(selectedOperationalDossier) };
  const signalAction = { label: "Signaler une nouvelle situation", group: "secondary" as const, helper: "À utiliser uniquement pour un nouveau fait distinct.", onClick: () => openWorkflow("alert", selectedContext) };
  if (selectedReport) {
    atlasActions.push({ label: "Relire le rapport de zone", group: "recommended", onClick: () => document.getElementById("zone-reports")?.scrollIntoView({ behavior: "smooth", block: "start" }) }, signalAction, detailAction);
  } else if (verified) {
    atlasActions.push({ label: "Générer un rapport de zone", group: "recommended", onClick: () => openWorkflow("export-zone", selectedContext) }, signalAction, detailAction);
  } else if (!selectedTask) {
    atlasActions.push({ label: "Demander une vérification terrain", group: "recommended", onClick: () => openWorkflow("verification", selectedContext) }, signalAction, detailAction);
  } else if (taskStatus === "Demandée") {
    atlasActions.push({ label: "Préparer le message WhatsApp", group: "recommended", onClick: () => onPrepareWhatsApp(selectedTask.id, selectedTask.message) }, signalAction, detailAction);
  } else if (taskStatus === "Message préparé") {
    atlasActions.push({ label: "Suivre la vérification", group: "recommended", onClick: () => onFollowVerification(selectedTask.id) }, { label: "Copier à nouveau le message", group: "secondary", onClick: () => onPrepareWhatsApp(selectedTask.id, selectedTask.message) }, detailAction);
  } else if (["Assignée", "En cours"].includes(taskStatus || "")) {
    atlasActions.push({ label: "Déposer le constat reçu", group: "recommended", onClick: () => onDepositConstat(selectedTask.id) }, { label: "Copier à nouveau le message", group: "secondary", onClick: () => onPrepareWhatsApp(selectedTask.id, selectedTask.message) }, detailAction);
  } else if (taskStatus === "Constat déposé") {
    atlasActions.push({ label: "Valider le constat", group: "recommended", onClick: () => onValidateConstat(selectedTask.id) }, detailAction);
  } else {
    atlasActions.push(detailAction);
  }
  if (selectedQuay?.id === "kayar" && (selectedTask || selectedReport || verified)) atlasActions.push({ label: "Recommencer la démonstration Kayar", group: "consultation", helper: "Réinitialise uniquement les étapes locales de Kayar.", onClick: onResetKayar });

  return <section className="min-h-full">
    <WorkspaceHeader title="Atlas maritime" question="Observer l’activité littorale à partir des déclarations, vérifications et consolidations disponibles." scope={scope} onScopeChange={(next) => { setScope(next as Scope); setQuayFilter("Tous"); setSelection(null); }} onExport={() => openWorkflow("export-zone", { title: "Rapport de zone maritime", scope, description: "Quais, pirogues, débarquements, alertes et incidents du périmètre actif." })} />
    <SituationBanner eyebrow="Situation maritime nationale · simulation métier" statement={`${visiblePirogues.filter((boat) => ["atSea", "expectedReturn"].includes(boat.cycleStage)).length} pirogues en mer · ${visiblePirogues.filter((boat) => boat.cycleStage === "expectedReturn").length} retours attendus avant 18h · ${visiblePirogues.filter((boat) => ["declared", "verified"].includes(boat.cycleStage)).length} débarquements déclarés ce matin · ${visibleQuays.filter((quay) => quay.level !== "normal").length} zone(s) en vigilance`} detail="Données de démonstration · niveaux de confiance visibles sur chaque dossier" actionLabel="Voir le briefing maritime" onAction={() => setBriefingOpen(true)} />
    <CoordinationBanner zones={visibleQuays.filter((quay) => quay.level !== "normal")} evidence={evidence} onSelect={(id) => setSelection({ kind: "quay", id })} />
    <FilterStrip>
      <div className="flex rounded-[3px] border border-[var(--mb-neutral-200)] bg-[var(--mb-offwhite)] p-0.5"><button onClick={() => setMode("quays")} className={`h-8 rounded-[2px] px-3 text-[11px] font-bold ${mode === "quays" ? "bg-[var(--mb-ocean-600)] text-white" : "text-[var(--mb-neutral-600)]"}`}>Vue quais</button><button onClick={() => setMode("pirogues")} className={`h-8 rounded-[2px] px-3 text-[11px] font-bold ${mode === "pirogues" ? "bg-[var(--mb-ocean-600)] text-white" : "text-[var(--mb-neutral-600)]"}`}>Vue pirogues</button></div>
      <FilterField label="Quai"><select value={quayFilter} onChange={(event) => { setQuayFilter(event.target.value); setSelection(event.target.value === "Tous" ? null : { kind: "quay", id: event.target.value }); }} className={inputClass}><option>Tous</option>{quays.filter((quay) => scope === "Nationale" || quay.region === scope).map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></FilterField>
      <FilterField label="Statut"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "Tous" | Level)} className={inputClass}><option>Tous</option><option value="normal">Vérifié</option><option value="surveillance">Vigilance</option><option value="urgent">Critique</option></select></FilterField>
      <FilterField label="Période"><select value={period} onChange={(event) => setPeriod(event.target.value)} className={inputClass}><option>Aujourd’hui</option><option>7 derniers jours</option><option>30 derniers jours</option></select></FilterField>
      <div className="ml-auto flex items-center gap-3 px-1 font-mono text-[9px] text-[var(--mb-neutral-600)]"><span>{visibleQuays.length} QUAIS</span><span>{visiblePirogues.length} PIROGUES</span><span>{visibleIncidents.length} INCIDENTS</span><span>{totalVolume.toFixed(1)} T</span></div>
    </FilterStrip>
    <div className="grid min-h-[calc(100vh-201px)] min-w-0 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-rows-[minmax(430px,1fr)_170px]">
      <div className="min-h-0 border-b border-[var(--mb-neutral-200)] xl:border-r"><MapCanvas mode={mode} layers={layers} onToggleLayer={(layer) => setLayers((current) => ({ ...current, [layer]: !current[layer] }))} quays={visibleQuays} pirogues={visiblePirogues} landings={visibleLandings} alerts={visibleAlerts} incidents={visibleIncidents} selection={selection} onSelectQuay={(id) => setSelection({ kind: "quay", id })} onSelectPirogue={(id) => setSelection({ kind: "pirogue", id })} /></div>
      <div className="min-h-0 xl:row-span-2"><ContextPanel empty={!selection || !selectedQuay} title={selectedTitle} subtitle={journey.businessStatus} level={entityLevel} trustLevel={entityTrust} journey={journey} trend={selectedQuay && !selectedBoat ? quayTrends[selectedQuay.id] : undefined} pirogue={selectedBoat} rows={contextRows} referents={selectedQuay ? <><PosteOfficielPanel poste={quayPosts.find((poste) => poste.quayId === selectedQuay.id)} /><ReferentsPanel referents={fieldReferents.filter((referent) => referent.quayId === selectedQuay.id && referent.status === "Actif")} /></> : null} actions={atlasActions} /></div>
      <div id="atlas-evidence" className="grid min-h-0 scroll-mt-20 overflow-auto bg-white xl:grid-cols-2 xl:border-r"><section className="border-b border-[var(--mb-neutral-200)] xl:border-b-0 xl:border-r"><div className="flex h-9 items-center justify-between border-b border-[var(--mb-neutral-200)] px-3"><h3 className="text-[11px] font-bold">Historique opérationnel</h3><span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">{period}</span></div><EvidenceTimeline items={evidence.slice(0, 4)} /></section><section><div className="flex h-9 items-center border-b border-[var(--mb-neutral-200)] px-3 text-[11px] font-bold">Preuves et exports générés</div><ArtifactRegister artifacts={artifacts.slice(0, 3)} /></section></div>
    </div>
    <div className="grid gap-2 border-t border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-100)] p-2 xl:grid-cols-[1.3fr_.7fr]"><WhatsAppBridge tasks={verificationTasks} signals={signalRecords} onPrepare={onPrepareWhatsApp} onDepositConstat={onDepositConstat} onValidateConstat={onValidateConstat} onQualifySignal={onQualifySignal} onAdvanceSignal={onAdvanceSignal} /><ReportRegister reports={zoneReports} /></div>
    {briefingOpen ? <BriefingPanel onClose={() => setBriefingOpen(false)} /> : null}
  </section>;
}

function buildAtlasJourney({ entityType, situation, known, trustHelper, taskStatus, alreadyDone, hasReport, isVerified }: {
  entityType: string;
  situation: string;
  known: string;
  trustHelper: string;
  taskStatus?: VerificationTask["status"];
  alreadyDone: string[];
  hasReport: boolean;
  isVerified: boolean;
}) {
  if (hasReport) return {
    entityType, situation, known, trustHelper, alreadyDone,
    businessStatus: "Situation vérifiée et rapport disponible.",
    waitingFor: "Relecture humaine avant transmission ou archivage.",
    reason: "Le rapport existe déjà : il faut maintenant le relire, pas le générer une seconde fois.",
    expectedResult: "Le rapport existant sera affiché dans la section Rapports de zone.",
    nextStep: "Décider ensuite de sa transmission manuelle ou de son archivage.",
  };
  if (isVerified || taskStatus === "Vérifiée") return {
    entityType, situation, known, trustHelper, alreadyDone,
    businessStatus: "Situation confirmée sur place.",
    waitingFor: "Production d’une synthèse transmissible.",
    reason: "Le constat est validé. La situation peut maintenant être synthétisée sans répéter la vérification.",
    expectedResult: "Un rapport daté sera ajouté au suivi des rapports de zone.",
    nextStep: "Relire le rapport avant toute transmission externe.",
  };
  if (taskStatus === "Constat déposé") return {
    entityType, situation, known, trustHelper, alreadyDone,
    businessStatus: "Un constat a été reçu et doit être validé.",
    waitingFor: "Validation par un agent habilité.",
    blockingPoint: "La confiance reste Déclarée tant que le constat n’est pas validé.",
    reason: "Le retour terrain est disponible, mais il ne peut pas encore servir de preuve vérifiée.",
    expectedResult: "La confiance passera à Vérifiée et la production du rapport deviendra possible.",
    nextStep: "Générer le rapport de zone après validation.",
  };
  if (taskStatus === "Assignée" || taskStatus === "En cours") return {
    entityType, situation, known, trustHelper, alreadyDone,
    businessStatus: "Vérification confiée au référent terrain.",
    waitingFor: "Constat, photo ou pièce du référent mandaté.",
    blockingPoint: "Aucun constat n’a encore été déposé.",
    reason: "Le retour terrain doit être rattaché à cette situation avant validation.",
    expectedResult: "Le constat reçu sera enregistré et présenté pour validation humaine.",
    nextStep: "Valider le constat après son dépôt.",
  };
  if (taskStatus === "Message préparé") return {
    entityType, situation, known, trustHelper, alreadyDone,
    businessStatus: "Message prêt à transmettre au référent.",
    waitingFor: "Envoi manuel puis retour du référent.",
    blockingPoint: "L’envoi WhatsApp réel n’est pas connecté dans cette démonstration.",
    reason: "La demande est prête ; il faut maintenant en suivre l’exécution sur le terrain.",
    expectedResult: "La vérification passera en attente de constat et restera visible dans le suivi.",
    nextStep: "Déposer le constat dès sa réception.",
  };
  if (taskStatus === "Demandée") return {
    entityType, situation, known, trustHelper, alreadyDone,
    businessStatus: "Vérification demandée, message terrain à préparer.",
    waitingFor: "Préparation du message destiné au référent.",
    blockingPoint: "Le référent n’a pas encore reçu de message préparé.",
    reason: "La demande existe déjà. Il ne faut pas la recréer, mais préparer son message terrain.",
    expectedResult: "Un message structuré sera copié et rattaché à la demande existante.",
    nextStep: "Suivre la vérification après l’envoi manuel du message.",
  };
  return {
    entityType, situation, known, trustHelper, alreadyDone,
    businessStatus: "Information à confirmer sur place.",
    waitingFor: "Création d’une demande de vérification.",
    blockingPoint: "Cette information n’a pas encore été confirmée sur place.",
    reason: "Une confirmation terrain est nécessaire avant décision ou transmission.",
    expectedResult: "Une demande sera créée et rattachée à l’élément sélectionné.",
    nextStep: "Préparer le message WhatsApp destiné au référent.",
  };
}

function FiliereProgrammes({ scope, setScope, artifacts, opportunities, fundingRequests, qualifiedNeeds, fundingDossiers, partnerRelationships, onConfirmTransmission, onRecordFundingResponse, onRecordPartnerResponse, openWorkflow }: {
  scope: Scope; setScope: (scope: Scope) => void; artifacts: GeneratedArtifact[]; opportunities: FundingOpportunity[]; fundingRequests: FundingRequest[]; qualifiedNeeds: QualifiedNeedRecord[]; fundingDossiers: FundingDossierRecord[]; partnerRelationships: PartnerRelationship[]; onConfirmTransmission: (id: string, date: string, responsible: string) => void; onRecordFundingResponse: (id: string) => void; onRecordPartnerResponse: (id: string) => void; openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void;
}) {
  const scopedNeeds = communityNeeds.filter((need) => scope === "Nationale" || need.region === scope);
  const scopedOpportunities = opportunities.filter((item) => scope === "Nationale" || item.territory === scope);
  const partnerDossierIds = new Set(partnerRelationships.map((relationship) => relationship.dossierId).filter(Boolean));
  const partnerPreparedNeedIds = fundingDossiers.filter((dossier) => partnerDossierIds.has(dossier.id)).map((dossier) => dossier.needId);
  const totalPotential = scopedOpportunities.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const readyCount = scopedOpportunities.filter((item) => item.status !== "À qualifier").length;
  return <section className="min-h-full">
    <WorkspaceHeader title="Filière & Financement" question="Valoriser la filière, structurer le financement." scope={scope} onScopeChange={(value) => setScope(value as Scope)} onExport={() => openWorkflow("institutional-export", { title: "Registre des opportunités de financement", scope, description: `${readyCount} opportunités éligibles pour ${formatFcfa(totalPotential)}.` })} />
    <ValueBanner amount={totalPotential} programs={18} partners={6} />
    <ImpactDemonstrated opportunities={scopedOpportunities} dossiers={fundingDossiers} artifacts={artifacts} />
    <MetricRow metrics={[
      { label: "Besoins suivis", value: String(scopedNeeds.length), detail: "Signaux et besoins consolidés" },
      { label: "Montant estimé", value: formatFcfa(totalPotential), detail: "Potentiel de valorisation" },
      { label: "Prêtes à financer", value: String(readyCount), detail: "Maturité suffisante", level: "normal" },
      { label: "Dossiers générés", value: String(fundingRequests.length), detail: "Validation humaine enregistrée" },
    ]} />
    <FiliereNeedsView needs={scopedNeeds} opportunities={scopedOpportunities} artifacts={artifacts} qualifiedNeedIds={qualifiedNeeds.map((item) => item.sourceNeedId)} fundingDossierNeedIds={fundingDossiers.map((item) => item.needId)} partnerPreparedNeedIds={partnerPreparedNeedIds} onOpenWorkflow={openWorkflow} />
    <div className="grid gap-2 border-t border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-100)] p-2"><FundingRegister dossiers={fundingDossiers} onConfirmTransmission={onConfirmTransmission} onRecordResponse={onRecordFundingResponse} /><PartnerRegister relationships={partnerRelationships} onRecordResponse={onRecordPartnerResponse} /></div>
  </section>;
}

function PilotageInstitutionnel({ scope, setScope, evidence, artifacts, opportunities, fundingRequests, decisions: decisionRecords, zoneReports, onAdvanceDecision, alerts, record, openWorkflow }: {
  scope: Scope; setScope: (scope: Scope) => void; evidence: typeof initialEvidence; artifacts: GeneratedArtifact[]; opportunities: FundingOpportunity[]; fundingRequests: FundingRequest[]; decisions: DecisionRecord[]; zoneReports: ZoneReportRecord[]; onAdvanceDecision: (id: string) => void; alerts: MapAlert[]; record: (title: string, detail: string) => void; openWorkflow: (kind: WorkflowKind, context: WorkflowContext) => void;
}) {
  const scopedQuays = quays.filter((quay) => scope === "Nationale" || quay.region === scope);
  const scopedIds = new Set(scopedQuays.map((quay) => quay.id));
  const scopedAlerts = alerts.filter((alert) => scopedIds.has(alert.quayId));
  const scopedOpportunities = opportunities.filter((item) => scope === "Nationale" || item.territory === scope);
  const readyFunding = scopedOpportunities.filter((item) => item.status !== "À qualifier");
  const fundingToConstitute = scopedOpportunities.filter((item) => ["Éligible au financement", "En instruction"].includes(item.status));
  const totalVolume = scopedQuays.reduce((sum, quay) => sum + quay.volumeTons, 0);
  const criticality: Record<Level, number> = { urgent: 0, surveillance: 1, normal: 2 };
  const sortedQuays = [...scopedQuays].sort((a, b) => criticality[a.level] - criticality[b.level]);
  const mapLayers: Record<MapLayerId, boolean> = { quays: true, pirogues: false, landings: false, alerts: true, incidents: true };
  const synthesis = `Situation au 13 juillet 2026 · 08h14 : activité normale sur ${Math.max(9, new Set(scopedQuays.map((quay) => quay.region)).size)} régions, ${scopedAlerts.filter((item) => item.level !== "normal").length} zones en vigilance et ${Math.max(1, fundingRequests.filter((item) => item.eligibilityStatus === "Dossier constitué").length)} dossier de financement en attente d’arbitrage.`;
  const noteContext: WorkflowContext = { title: "Note d’arbitrage de la situation du jour", scope, description: `${synthesis} Prioriser les vérifications critiques et instruire les dossiers de financement les plus matures.` };
  const decisions = [
    ...scopedAlerts.slice(0, 2).map((alert) => ({ id: alert.id, title: alert.title, detail: `${getQuayById(alert.quayId).name} · ${alert.nextAction}`, level: alert.level, action: "Lancer la vérification", onAction: () => openWorkflow("verification", { title: alert.title, scope: getQuayById(alert.quayId).name, sourceId: alert.quayId, description: alert.nextAction }) })),
    ...fundingToConstitute.slice(0, 2).map((item) => ({ id: item.id, title: `Arbitrer le financement · ${item.title}`, detail: `${formatFcfa(item.estimatedAmount)} · ${item.compatibleFunder} · maturité ${item.maturityScore}%`, level: "normal" as Level, action: "Constituer le dossier", onAction: () => openWorkflow("funding", { title: item.title, scope: item.territory, sourceId: item.id, description: item.expectedImpact, amount: String(item.estimatedAmount), beneficiaries: String(item.beneficiaries), partner: item.compatibleFunder }) })),
  ].slice(0, 4);

  return <section className="min-h-full">
    <WorkspaceHeader title="Pilotage institutionnel" question="Vue nationale et aide à la décision." scope={scope} onScopeChange={(value) => setScope(value as Scope)} onExport={() => openWorkflow("institutional-export", { title: "Dossier de synthèse institutionnelle", scope, description: synthesis })} />
    <SituationBanner eyebrow="Situation nationale consolidée" statement={synthesis} detail="Lecture fondée sur les signaux simulés, les preuves enregistrées et les dossiers en instruction." actionLabel={decisionRecords.length ? "Suivre l’arbitrage" : "Générer la note au Ministre"} onAction={() => decisionRecords.length ? document.getElementById("decision-follow-up")?.scrollIntoView({ behavior: "smooth", block: "start" }) : openWorkflow("note", noteContext)} tone="navy" />
    <MetricRow metrics={[
      { label: "Volume débarqué", value: `${totalVolume.toFixed(1)} t`, detail: "Déclarations consolidées" },
      { label: "Alertes critiques", value: String(scopedAlerts.filter((item) => item.level === "urgent").length), detail: "Action immédiate", level: "urgent" },
      { label: "Financement prêt", value: formatFcfa(readyFunding.reduce((sum, item) => sum + item.estimatedAmount, 0)), detail: `${readyFunding.length} opportunités`, level: "normal" },
      { label: "Dossiers validés", value: String(fundingRequests.length), detail: "Preuves générées" },
    ]} />
    <div className="grid min-w-0 gap-2 bg-[var(--mb-neutral-100)] p-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
      <div className="grid min-w-0 gap-2">
        <section className="grid min-h-[290px] border border-[var(--mb-neutral-200)] bg-white lg:grid-cols-[minmax(17rem,.65fr)_minmax(0,1.35fr)]"><div className="min-h-[260px] border-b border-[var(--mb-neutral-200)] lg:border-b-0 lg:border-r"><MapCanvas mode="quays" layers={mapLayers} onToggleLayer={() => undefined} quays={scopedQuays} pirogues={[]} landings={[]} alerts={scopedAlerts} incidents={maritimeIncidents.filter((item) => scopedIds.has(item.quayId))} selection={null} onSelectQuay={(id) => record("Source Atlas consultée", getQuayById(id).name)} onSelectPirogue={() => undefined} /></div><div className="min-w-0"><div className="flex h-9 items-center justify-between border-b border-[var(--mb-neutral-200)] px-3"><h3 className="text-[11px] font-bold">Synthèse régionale par criticité</h3><span className="font-mono text-[9px] text-[var(--mb-neutral-400)]">URGENT → NORMAL</span></div><DataTable headers={["Quai", "Région", "Volume", "Tendance", "État"]} rows={sortedQuays.map((quay) => ({ id: quay.id, cells: [<strong key="name">{quay.name}</strong>, quay.region, <span key="volume" className="font-mono">{quay.volumeTons.toFixed(1)} t</span>, <span key="trend" className="font-mono text-[var(--mb-green-600)]">+{quayTrends[quay.id]?.at(-1) || 0}%</span>, <StatusBadge key="status" level={quay.level} />] }))} /></div></section>
        <section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2"><h3 className="text-[11px] font-bold">Financements en cours</h3><p className="mt-0.5 text-[9px] text-[var(--mb-neutral-600)]">Une seule prochaine action est proposée selon l’état du dossier.</p></div><DataTable headers={["Dossier", "Territoire", "Partenaire", "Montant", "Statut", "Prochaine action"]} rows={readyFunding.map((item) => ({ id: item.id, cells: [<strong key="title">{item.title}</strong>, item.territory, item.compatibleFunder, <span key="amount" className="font-mono">{formatFcfa(item.estimatedAmount)}</span>, <StatusBadge key="status">{item.status}</StatusBadge>, ["Éligible au financement", "En instruction"].includes(item.status) ? <button key="action" onClick={() => openWorkflow("funding", { title: item.title, scope: item.territory, sourceId: item.id, description: item.expectedImpact, amount: String(item.estimatedAmount), beneficiaries: String(item.beneficiaries), partner: item.compatibleFunder })} className="font-bold text-[var(--mb-ocean-600)]">Constituer le dossier</button> : <span key="done" className="text-[9px] font-semibold text-[var(--mb-green-600)]">{item.status === "Dossier constitué" ? "Solliciter un partenaire" : item.status === "Transmis" ? "Suivre la réponse" : item.status}</span>] }))} /></section>
        <ExportPanel onExport={() => openWorkflow("institutional-export", { title: "Rapport de situation et de financement", scope, description: synthesis })} />
      </div>
      <aside className="grid content-start gap-2"><RisksPanel items={[{ title: "Retards possibles de vérification terrain", detail: "Les retours non confirmés peuvent retarder la consolidation régionale.", source: "Atlas · vérifications en cours", level: "urgent" }, { title: "Concentration de besoins sur la Petite Côte", detail: "Les besoins de froid et de traçabilité demandent une lecture coordonnée des financements.", source: "Filière & Financement", level: "surveillance" }, { title: "Volume déclaré encore hétérogène", detail: "Les niveaux de confiance diffèrent selon les quais et doivent rester visibles dans les synthèses.", source: "Atlas · niveaux de confiance", level: "surveillance" }]} /><DecisionPanel title="Décisions à arbitrer aujourd’hui" items={decisions} /><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2"><h3 className="text-[11px] font-bold">Blocages en attente</h3><p className="mt-1 text-[8px] text-[var(--mb-neutral-600)]">Chaque blocage ouvre sa source ou son parcours de résolution.</p></div><div className="divide-y divide-[var(--mb-neutral-100)]"><button onClick={() => openWorkflow("verification", { title: "Retours non confirmés", scope: "Saint-Louis", description: "Deux retours attendent une confirmation terrain." })} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2 text-left"><span className="text-[9px] font-semibold">2 vérifications terrain en retard</span><span className="font-mono text-[8px] text-[var(--mb-ocean-600)]">ATLAS →</span></button><button onClick={() => openWorkflow("partner", { title: "Réponses partenaires en attente", scope, description: "Relancer les partenaires des dossiers matures." })} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 py-2 text-left"><span className="text-[9px] font-semibold">1 réponse partenaire à relancer</span><span className="font-mono text-[8px] text-[var(--mb-ocean-600)]">FILIÈRE →</span></button></div></section><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Dernière note institutionnelle</div>{artifacts.find((item) => item.kind === "note") ? <div className="p-2"><DocumentPreview document={artifactToDocument(artifacts.find((item) => item.kind === "note")!)} compact /></div> : <div className="p-3"><p className="text-[10px] text-[var(--mb-neutral-600)]">Cette note reprendra la situation du jour et les décisions en attente.</p><button onClick={() => openWorkflow("note", noteContext)} className={`${primaryButton} mt-2`}>Générer la note au Ministre</button></div>}</section><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Registre des actions</div><ActionRegister items={pendingActions.map((item) => ({ id: item.id, action: item.action, owner: item.owner, due: item.dueDate, level: item.level }))} onAction={(id) => { const action = pendingActions.find((item) => item.id === id); openWorkflow("verification", { title: action?.action || id, scope: action?.territory || scope, sourceId: id, description: action?.status }); }} /></section><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Documents prêts à transmettre</div><ArtifactRegister artifacts={artifacts.filter((item) => ["note", "institutional-export", "funding"].includes(item.kind)).slice(0, 5)} /></section><section className="border border-[var(--mb-neutral-200)] bg-white"><div className="border-b border-[var(--mb-neutral-200)] px-3 py-2 text-[11px] font-bold">Registre de preuve</div><EvidenceTimeline items={evidence.slice(0, 4)} /></section></aside>
    </div>
    <div className="grid gap-2 border-t border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-100)] p-2"><DecisionRegister decisions={decisionRecords} onAdvance={onAdvanceDecision} /><ReportRegister reports={zoneReports} /></div>
  </section>;
}
