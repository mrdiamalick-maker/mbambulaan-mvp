"use client";

import { useMemo, useState } from "react";
import {
  mapAlerts,
  quays,
  type MapAlert,
  type Region,
} from "@/data/ministryControlTowerData";
import {
  initialFundingOpportunities,
  initialGeneratedArtifacts,
  type FundingOpportunity,
  type FundingRequest,
  type FundingDossierRecord,
  type GeneratedArtifact,
  type DecisionRecord,
  type SignalRecord,
  type VerificationTask,
  type WorkflowKind,
  type ZoneReportRecord,
} from "@/data/ministryValueJourneyData";
import {
  AppShell,
  MobileWorkspaceNav,
  NavigationRail,
  TopBar,
  type WorkspaceId,
} from "./MinistryControlTowerParts";
import {
  AlertCreationForm,
  FundingRequestForm,
  InstitutionalExportForm,
  InstitutionalNoteBuilder,
  VerificationDrawer,
  ZoneExportForm,
  type WorkflowContext,
} from "./MinistryValueWorkflows";
import { OperationalDossierPanel } from "./MinistryDossierExperience";
import { buildOperationalDossiers, type DossierNote, type DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { mergeOperationalDossiers } from "@/lib/publicContributionOperationalDossiers";
import { MinistryQuayAtlas } from "./MinistryQuayAtlas";
import { MinistryDossiersView } from "./MinistryDossiersView";
import { MinistryPilotageView } from "./MinistryPilotageView";
import { MinistryCommunityProgramsView } from "./MinistryCommunityProgramsView";

type Scope = "Nationale" | Region;
type ActiveWorkflow = { kind: WorkflowKind; context: WorkflowContext } | null;

const initialEvidence = [
  { time: "10:45", title: "Consolidation nationale", detail: "Quais, débarquements, incidents et alertes regroupés dans la situation du jour." },
  { time: "10:18", title: "Signal transmis", detail: "Retour de pirogue à confirmer par la cellule locale de Saint-Louis." },
  { time: "09:58", title: "Besoin qualifié", detail: "Besoin de glace documenté par le relais de Joal-Fadiouth." },
  { time: "09:35", title: "Incident rattaché", detail: "Panne de froid de Mbour reliée au programme de maintenance." },
];

export function MinistryControlTower() {
  const [workspace, setWorkspace] = useState<WorkspaceId>("pilotage");
  const [dossierInboxOpen, setDossierInboxOpen] = useState(false);
  const [assistanceEnabled, setAssistanceEnabled] = useState(false);
  const [scope, setScope] = useState<Scope>("Nationale");
  const [, setEvidence] = useState(initialEvidence);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>(initialGeneratedArtifacts);
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>(initialFundingOpportunities);
  const [, setFundingRequests] = useState<FundingRequest[]>([]);
  const [createdAlerts, setCreatedAlerts] = useState<MapAlert[]>([]);
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);
  const [fundingDossiers, setFundingDossiers] = useState<FundingDossierRecord[]>([]);
  const [verificationTasks, setVerificationTasks] = useState<VerificationTask[]>([]);
  const [signalRecords, setSignalRecords] = useState<SignalRecord[]>([]);
  const [decisionRecords, setDecisionRecords] = useState<DecisionRecord[]>([]);
  const [zoneReports, setZoneReports] = useState<ZoneReportRecord[]>([]);
  const [atlasFocusQuayId, setAtlasFocusQuayId] = useState<string | null>(null);
  const [communityFocusQuayId, setCommunityFocusQuayId] = useState<string | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflow>(null);
  const [systemNotice, setSystemNotice] = useState("Dernière synchronisation · 10:45");
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [closedDossierIds, setClosedDossierIds] = useState<string[]>([]);
  const [dossierNotes, setDossierNotes] = useState<Record<string, DossierNote[]>>({});
  const baseDossiers = useMemo(() => mergeOperationalDossiers(buildOperationalDossiers({ verificationTasks, signals: signalRecords, fundingDossiers, opportunities, reports: zoneReports, decisions: decisionRecords, closedDossierIds })), [closedDossierIds, decisionRecords, fundingDossiers, opportunities, signalRecords, verificationTasks, zoneReports]);
  const operationalDossiers = useMemo(() => baseDossiers.map((dossier) => ({ ...dossier, notes: [...dossier.notes, ...(dossierNotes[dossier.id] || [])] })), [baseDossiers, dossierNotes]);
  const selectedDossier = selectedDossierId ? operationalDossiers.find((dossier) => dossier.id === selectedDossierId) ?? null : null;
  const activeDossierCount = operationalDossiers.filter((dossier) => dossier.workStatus !== "Terminé").length;
  const openDossier = (dossier: DossierOperationnel) => { setDossierInboxOpen(false); setSelectedDossierId(dossier.id); };

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
        nature: values.alertType === "Incident" ? "Incident" : values.alertType === "Besoin filière" ? "Besoin filière" : "Information",
        treatmentStatus: "Signalée",
        criticality: (values.severity || "Vigilance") as SignalRecord["criticality"],
        trustLevel: "declared",
        status: "Signalé",
        createdAt: new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date()),
        artifactId: artifact.id,
      }, ...items]);
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
    if (artifact.kind === "export-zone") {
      setZoneReports((items) => [{ id: `report-${Date.now()}`, title: artifact.title, zone: context?.scope || artifact.scope, period: values.period, author: values.validator, generatedAt: artifact.createdAt, trustLevel: "consolidated", linkedObjectsCount: 8, purpose: values.description, artifactId: artifact.id }, ...items]);
    }
    if (artifact.kind === "note") {
      const recommendations = (values.recommendations || "Arbitrer les actions prioritaires").split(/[.;]\s*/).filter(Boolean).slice(0, 3);
      setDecisionRecords((items) => [...recommendations.map((recommendation, index) => ({ id: `decision-${Date.now()}-${index}`, noteTitle: artifact.title, recommendation, status: "À arbitrer" as const, priority: index === 0 ? "Urgente" as const : "Prioritaire" as const, source: context?.scope || "Synthèse nationale", owner: "Cabinet / direction technique", createdAt: artifact.createdAt, nextAction: "Enregistrer l’arbitrage", artifactId: artifact.id })), ...items]);
    }
  }

  const workflowProps = activeWorkflow ? { context: activeWorkflow.context, onClose: () => setActiveWorkflow(null), onComplete: completeWorkflow } : null;
  const globalExport = () => openWorkflow("institutional-export", { title: "Situation nationale Mbàmbulaan", scope, description: "Situation, décisions, opportunités de financement et registre de preuve." });
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
  const qualifySignal = (id: string) => { setSignalRecords((items) => items.map((item) => item.id === id ? { ...item, status: "Qualifié", treatmentStatus: "À traiter", trustLevel: "declared" } : item)); record("Signalement qualifié", id); };
  const advanceSignal = (id: string) => {
    const signal = signalRecords.find((item) => item.id === id);
    setSignalRecords((items) => items.map((item) => {
      if (item.id !== id) return item;
      const status: SignalRecord["status"] = item.status === "Qualifié" && item.criticality === "Critique" ? "Escaladé en alerte" : item.status === "Qualifié" ? "En traitement" : item.status === "Escaladé en alerte" ? "En traitement" : "Clôturé";
      const treatmentStatus: SignalRecord["treatmentStatus"] = status === "Clôturé" ? "Clôturée" : status === "En traitement" ? "En vérification" : "À traiter";
      return { ...item, status, treatmentStatus };
    }));
    record("Signalement mis à jour", `${signal?.title || id} · prochaine étape enregistrée`);
  };
  const handleDossierPrimary = (dossier: DossierOperationnel) => {
    const task = verificationTasks.find((item) => item.targetId === dossier.sourceId);
    const quay = quays.find((item) => item.id === dossier.quayId);
    if (dossier.action === "request-verification") return openWorkflow("verification", { title: dossier.linkedObject, scope: quay?.name ?? dossier.territory, sourceId: dossier.sourceId, quayId: dossier.quayId, description: `Confirmer la situation de ${quay?.name ?? dossier.territory} avant consolidation.` });
    if (dossier.action === "prepare-whatsapp" && task) return prepareWhatsApp(task.id, task.message);
    if (dossier.action === "follow-verification" && task) return followVerification(task.id);
    if (dossier.action === "deposit-constat" && task) return depositConstat(task.id);
    if (dossier.action === "validate-constat" && task) return validateConstat(task.id);
    if (dossier.action === "generate-report") return openWorkflow("export-zone", { title: `Rapport de zone · ${quay?.name ?? dossier.territory}`, scope: quay?.name ?? dossier.territory, sourceId: dossier.sourceId, quayId: dossier.quayId, description: dossier.finalOutput });
    if (dossier.action === "close-dossier") {
      setClosedDossierIds((items) => Array.from(new Set([...items, dossier.id])));
      record("Dossier clôturé", `${dossier.id} · rapport relu et décision enregistrée`);
      return;
    }
    if (dossier.action === "open-funding") {
      const opportunity = opportunities.find((item) => item.id === dossier.sourceId) ?? opportunities[0];
      return openWorkflow("funding", { title: dossier.linkedObject, scope: dossier.territory, sourceId: opportunity?.id, needId: opportunity?.needId, description: opportunity?.expectedImpact ?? dossier.finalOutput, amount: String(opportunity?.estimatedAmount ?? 0), beneficiaries: String(opportunity?.beneficiaries ?? 0), partner: opportunity?.compatibleFunder });
    }
    if (dossier.action === "open-community") return openCommunity(dossier.quayId);
    if (dossier.action === "open-pilotage") return setWorkspace("pilotage");
    if (dossier.action === "open-note") return openWorkflow("note", { title: dossier.linkedObject, scope: dossier.territory, description: dossier.nextAction });
    if (dossier.quayId) setAtlasFocusQuayId(dossier.quayId);
    return setWorkspace("atlas");
  };

  const openCommunity = (quayId?: string | null) => { setCommunityFocusQuayId(quayId ?? null); setWorkspace("community"); };
  const constituteFunding = (opportunity: FundingOpportunity) => openWorkflow("funding", { title: opportunity.title, scope: opportunity.territory, sourceId: opportunity.id, needId: opportunity.needId, description: opportunity.expectedImpact, amount: String(opportunity.estimatedAmount), beneficiaries: String(opportunity.beneficiaries), partner: opportunity.compatibleFunder });
  const confirmFundingTransmission = (id: string, date: string, responsible: string) => {
    setFundingDossiers((items) => items.map((dossier) => dossier.id === id ? { ...dossier, status: "Transmis", transmittedAt: date, transmittedBy: responsible, updatedAt: "à l’instant", nextAction: "Enregistrer la réponse du partenaire" } : dossier));
    record("Transmission manuelle confirmée", `${id} · responsable ${responsible} · aucune transmission externe simulée`);
  };
  const recordFundingResponse = (id: string) => {
    setFundingDossiers((items) => items.map((dossier) => dossier.id === id ? { ...dossier, status: "En négociation", updatedAt: "à l’instant", nextAction: "Suivre l’échange avec le partenaire" } : dossier));
    record("Réponse partenaire enregistrée", `${id} · suivi ajouté au dossier local`);
  };

  return <AppShell topBar={<TopBar notice={systemNotice} activeDossiers={activeDossierCount} assistanceEnabled={assistanceEnabled} onOpenDossiers={() => setDossierInboxOpen(true)} onToggleAssistance={() => setAssistanceEnabled((enabled) => !enabled)} onExport={globalExport} />} rail={<NavigationRail active={workspace} onChange={setWorkspace} />}>
    <MobileWorkspaceNav active={workspace} onChange={setWorkspace} />
    {workspace === "atlas" ? <MinistryQuayAtlas assistanceEnabled={assistanceEnabled} focusQuayId={atlasFocusQuayId} scope={scope} setScope={setScope} artifacts={artifacts} alerts={[...createdAlerts, ...mapAlerts]} verifiedIds={verifiedIds} verificationTasks={verificationTasks} zoneReports={zoneReports} openWorkflow={openWorkflow} operationalDossiers={operationalDossiers} onOpenDossier={openDossier} onViewCommunity={openCommunity} /> : null}
    {workspace === "community" ? <MinistryCommunityProgramsView focusQuayId={communityFocusQuayId} assistanceEnabled={assistanceEnabled} dossiers={operationalDossiers} opportunities={opportunities} fundingDossiers={fundingDossiers} artifacts={artifacts} onOpenDossier={openDossier} onConstituteFunding={constituteFunding} onConfirmTransmission={confirmFundingTransmission} onRecordPartnerResponse={recordFundingResponse} onViewAtlas={(quayId) => { setAtlasFocusQuayId(quayId); setWorkspace("atlas"); }} /> : null}
    {workspace === "pilotage" ? <MinistryPilotageView assistanceEnabled={assistanceEnabled} dossiers={operationalDossiers} alerts={[...createdAlerts, ...mapAlerts]} artifacts={artifacts} opportunities={opportunities} fundingDossiers={fundingDossiers} onViewAtlas={(quayId) => { setScope(quayId ? quays.find((item) => item.id === quayId)?.region ?? "Nationale" : "Nationale"); setAtlasFocusQuayId(quayId); setWorkspace("atlas"); }} onOpenDossier={openDossier} onOpenDossiers={() => setDossierInboxOpen(true)} onOpenCommunity={(quayId) => openCommunity(quayId)} /> : null}
    {activeWorkflow && workflowProps ? <WorkflowRenderer kind={activeWorkflow.kind} {...workflowProps} /> : null}
    {dossierInboxOpen ? <div className="fixed inset-0 z-[80] bg-[var(--mb-navy-900)]/40" onMouseDown={(event) => { if (event.target === event.currentTarget) setDossierInboxOpen(false); }}><aside className="ml-auto h-full w-full max-w-[74rem] overflow-y-auto border-l border-[var(--mb-neutral-300)] bg-[var(--mb-offwhite)]"><MinistryDossiersView embedded dossiers={operationalDossiers} onClose={() => setDossierInboxOpen(false)} onOpenDossier={openDossier} /></aside></div> : null}
    {selectedDossier ? <OperationalDossierPanel dossier={selectedDossier} assistanceEnabled={assistanceEnabled} onClose={() => setSelectedDossierId(null)} onPrimary={handleDossierPrimary} onAddNote={(dossier, note) => setDossierNotes((items) => ({ ...items, [dossier.id]: [...(items[dossier.id] || []), note] }))} onRelance={(dossier) => record("Relance enregistrée", `${dossier.id} · ${dossier.currentOwner} · canal ${dossier.originChannel}`)} /> : null}
  </AppShell>;
}

function WorkflowRenderer({ kind, ...props }: { kind: WorkflowKind; context: WorkflowContext; onClose: () => void; onComplete: (artifact: GeneratedArtifact, values: Record<string, string>) => void }) {
  if (kind === "verification") return <VerificationDrawer {...props} />;
  if (kind === "alert") return <AlertCreationForm {...props} />;
  if (kind === "export-zone") return <ZoneExportForm {...props} />;
  if (kind === "funding") return <FundingRequestForm {...props} />;
  if (kind === "note") return <InstitutionalNoteBuilder {...props} />;
  return <InstitutionalExportForm {...props} />;
}
