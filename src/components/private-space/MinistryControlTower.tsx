"use client";

import { useMemo, useState } from "react";
import {
  mapAlerts,
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
  AppShell,
  MobileWorkspaceNav,
  NavigationRail,
  TopBar,
  type WorkspaceId,
} from "./MinistryControlTowerParts";
import {
  AlertCreationForm,
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
import { OperationalDossierPanel } from "./MinistryDossierExperience";
import { buildOperationalDossiers, type DossierNote, type DossierOperationnel } from "@/lib/ministryOperationalDossiers";
import { MinistryQuayAtlas } from "./MinistryQuayAtlas";
import { MinistryDossiersView } from "./MinistryDossiersView";
import { MinistryPilotageView } from "./MinistryPilotageView";

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
  const [scope, setScope] = useState<Scope>("Nationale");
  const [, setEvidence] = useState(initialEvidence);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>(initialGeneratedArtifacts);
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>(initialFundingOpportunities);
  const [, setFundingRequests] = useState<FundingRequest[]>([]);
  const [, setQualifiedNeeds] = useState<QualifiedNeedRecord[]>([]);
  const [, setPartnerSolicitations] = useState<PartnerSolicitation[]>([]);
  const [, setProgramAssociations] = useState<ProgramAssociation[]>([]);
  const [createdAlerts, setCreatedAlerts] = useState<MapAlert[]>([]);
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);
  const [fundingDossiers, setFundingDossiers] = useState<FundingDossierRecord[]>([]);
  const [, setPartnerRelationships] = useState<PartnerRelationship[]>([]);
  const [verificationTasks, setVerificationTasks] = useState<VerificationTask[]>([]);
  const [signalRecords, setSignalRecords] = useState<SignalRecord[]>([]);
  const [decisionRecords, setDecisionRecords] = useState<DecisionRecord[]>([]);
  const [zoneReports, setZoneReports] = useState<ZoneReportRecord[]>([]);
  const [atlasFocusQuayId, setAtlasFocusQuayId] = useState<string | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflow>(null);
  const [systemNotice, setSystemNotice] = useState("Dernière synchronisation · 10:45");
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [closedDossierIds, setClosedDossierIds] = useState<string[]>([]);
  const [dossierNotes, setDossierNotes] = useState<Record<string, DossierNote[]>>({});
  const baseDossiers = useMemo(() => buildOperationalDossiers({ verificationTasks, signals: signalRecords, fundingDossiers, opportunities, reports: zoneReports, decisions: decisionRecords, closedDossierIds }), [closedDossierIds, decisionRecords, fundingDossiers, opportunities, signalRecords, verificationTasks, zoneReports]);
  const operationalDossiers = useMemo(() => baseDossiers.map((dossier) => ({ ...dossier, notes: [...dossier.notes, ...(dossierNotes[dossier.id] || [])] })), [baseDossiers, dossierNotes]);
  const selectedDossier = selectedDossierId ? operationalDossiers.find((dossier) => dossier.id === selectedDossierId) ?? null : null;
  const openDossier = (dossier: DossierOperationnel) => setSelectedDossierId(dossier.id);

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
  const resetKayarJourney = () => {
    const taskArtifactIds = new Set(verificationTasks.filter((item) => item.targetId === "kayar").map((item) => item.artifactId));
    const reportArtifactIds = new Set(zoneReports.filter((item) => item.zone === "Kayar").map((item) => item.artifactId));
    setVerificationTasks((items) => items.filter((item) => item.targetId !== "kayar"));
    setVerifiedIds((items) => items.filter((id) => id !== "kayar"));
    setZoneReports((items) => items.filter((item) => item.zone !== "Kayar"));
    setClosedDossierIds((items) => items.filter((id) => id !== "VER-2026-0142"));
    setDossierNotes((items) => ({ ...items, "VER-2026-0142": [] }));
    setArtifacts((items) => items.filter((item) => !taskArtifactIds.has(item.id) && !reportArtifactIds.has(item.id) && item.scope !== "Kayar"));
    record("Démonstration Kayar réinitialisée", "Écart de pesée déclaré · vérification à demander");
  };

  const handleDossierPrimary = (dossier: DossierOperationnel) => {
    const task = verificationTasks.find((item) => item.targetId === dossier.sourceId || (dossier.sourceId === "kayar" && item.targetId === "kayar"));
    if (dossier.action === "request-verification") return openWorkflow("verification", { title: dossier.linkedObject, scope: "Kayar", sourceId: "kayar", quayId: "kayar", description: "Confirmer l’écart de pesée avant consolidation." });
    if (dossier.action === "prepare-whatsapp" && task) return prepareWhatsApp(task.id, task.message);
    if (dossier.action === "follow-verification" && task) return followVerification(task.id);
    if (dossier.action === "deposit-constat" && task) return depositConstat(task.id);
    if (dossier.action === "validate-constat" && task) return validateConstat(task.id);
    if (dossier.action === "generate-report") return openWorkflow("export-zone", { title: `Rapport de zone · ${dossier.linkedObject}`, scope: dossier.linkedObject.includes("Kayar") ? "Kayar" : dossier.territory, sourceId: dossier.sourceId, quayId: dossier.quayId, description: dossier.finalOutput });
    if (dossier.action === "close-dossier") {
      setClosedDossierIds((items) => Array.from(new Set([...items, dossier.id])));
      record("Dossier clôturé", `${dossier.id} · rapport relu et décision enregistrée`);
      return;
    }
    if (dossier.action === "open-funding") {
      const opportunity = opportunities.find((item) => item.id === dossier.sourceId) ?? opportunities[0];
      return openWorkflow("funding", { title: dossier.linkedObject, scope: dossier.territory, sourceId: opportunity?.id, needId: opportunity?.needId, description: opportunity?.expectedImpact ?? dossier.finalOutput, amount: String(opportunity?.estimatedAmount ?? 0), beneficiaries: String(opportunity?.beneficiaries ?? 0), partner: opportunity?.compatibleFunder });
    }
    if (dossier.action === "open-pilotage") return setWorkspace("pilotage");
    if (dossier.action === "open-note") return openWorkflow("note", { title: dossier.linkedObject, scope: dossier.territory, description: dossier.nextAction });
    if (dossier.quayId) setAtlasFocusQuayId(dossier.quayId);
    return setWorkspace("atlas");
  };

  return <AppShell topBar={<TopBar notice={systemNotice} onExport={globalExport} />} rail={<NavigationRail active={workspace} onChange={setWorkspace} />}>
    <MobileWorkspaceNav active={workspace} onChange={setWorkspace} />
    {workspace === "atlas" ? <MinistryQuayAtlas focusQuayId={atlasFocusQuayId} scope={scope} setScope={setScope} artifacts={artifacts} alerts={[...createdAlerts, ...mapAlerts]} verifiedIds={verifiedIds} verificationTasks={verificationTasks} zoneReports={zoneReports} onResetKayar={resetKayarJourney} openWorkflow={openWorkflow} operationalDossiers={operationalDossiers} onOpenDossier={openDossier} /> : null}
    {workspace === "dossiers" ? <MinistryDossiersView dossiers={operationalDossiers} onOpenDossier={openDossier} /> : null}
    {workspace === "pilotage" ? <MinistryPilotageView dossiers={operationalDossiers} alerts={[...createdAlerts, ...mapAlerts]} artifacts={artifacts} opportunities={opportunities} fundingDossiers={fundingDossiers} onViewAtlas={(quayId) => { setAtlasFocusQuayId(quayId); setWorkspace("atlas"); }} onOpenDossier={openDossier} onOpenDossiers={() => setWorkspace("dossiers")} /> : null}
    {activeWorkflow && workflowProps ? <WorkflowRenderer kind={activeWorkflow.kind} {...workflowProps} /> : null}
    {selectedDossier ? <OperationalDossierPanel dossier={selectedDossier} onClose={() => setSelectedDossierId(null)} onPrimary={handleDossierPrimary} onAddNote={(dossier, note) => setDossierNotes((items) => ({ ...items, [dossier.id]: [...(items[dossier.id] || []), note] }))} onRelance={(dossier) => record("Relance enregistrée", `${dossier.id} · ${dossier.currentOwner} · canal ${dossier.originChannel}`)} /> : null}
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
