import type { FundingDossierRecord, FundingOpportunity, DecisionRecord, SignalRecord, VerificationTask, ZoneReportRecord } from "@/data/ministryValueJourneyData";

export type DossierType = "Situation terrain" | "Besoin filière" | "Décision institutionnelle";
export type DossierWorkStatus = "Nouveau" | "À traiter" | "En attente" | "Bloqué" | "Terminé";
export type DossierChannel = "WhatsApp" | "Téléphone" | "Poste de quai" | "Agent territorial" | "Formulaire" | "Import" | "Document";
export type DossierAction = "request-verification" | "prepare-whatsapp" | "follow-verification" | "deposit-constat" | "validate-constat" | "generate-report" | "close-dossier" | "open-atlas" | "open-funding" | "open-pilotage" | "open-note" | "none";

export type DossierNote = { id: string; time: string; author: string; text: string };
export type DossierPiece = { id: string; type: "Photo" | "Message" | "Compte rendu d’appel" | "Document" | "Preuve"; label: string; status: "Disponible" | "Attendue" };
export type DossierHistoryEntry = { time: string; label: string; channel: DossierChannel; author: string };

export type DossierOperationnel = {
  id: string;
  type: DossierType;
  linkedObject: string;
  linkedObjectType: "Quai" | "Pirogue" | "Débarquement" | "Besoin" | "Zone";
  sourceId: string;
  quayId?: string;
  territory: string;
  workStatus: DossierWorkStatus;
  businessStatus: string;
  originChannel: DossierChannel;
  transitChannel?: DossierChannel;
  currentOwner: string;
  nextAction: string;
  action: DossierAction;
  notes: DossierNote[];
  pieces: DossierPiece[];
  history: DossierHistoryEntry[];
  finalOutput: string;
  ageDays: number;
};

export function buildOperationalDossiers({ verificationTasks, signals, fundingDossiers, opportunities, reports, decisions, closedDossierIds = [] }: {
  verificationTasks: VerificationTask[];
  signals: SignalRecord[];
  fundingDossiers: FundingDossierRecord[];
  opportunities: FundingOpportunity[];
  reports: ZoneReportRecord[];
  decisions: DecisionRecord[];
  closedDossierIds?: string[];
}): DossierOperationnel[] {
  const kayarTask = verificationTasks.find((task) => task.targetId === "kayar");
  const kayarReport = reports.find((report) => report.zone === "Kayar");
  const dossiers: DossierOperationnel[] = [
    buildKayarDossier(kayarTask, kayarReport, closedDossierIds.includes("VER-2026-0142")),
    {
      id: "INC-2026-0081", type: "Situation terrain", linkedObject: "Retour de pirogue non confirmé", linkedObjectType: "Zone", sourceId: "incident-2", quayId: "saint-louis", territory: "Saint-Louis",
      workStatus: "Bloqué", businessStatus: "Constat terrain attendu", originChannel: "Téléphone", transitChannel: "Agent territorial", currentOwner: "Cellule régionale de Saint-Louis", nextAction: "Relancer le poste officiel et consigner le résumé d’appel", action: "open-atlas", ageDays: 3,
      notes: [{ id: "note-inc-1", time: "10:18", author: "Permanence régionale", text: "Appel reçu : le retour reste à confirmer auprès du quai." }],
      pieces: [{ id: "piece-inc-1", type: "Compte rendu d’appel", label: "Résumé de l’appel initial", status: "Disponible" }, { id: "piece-inc-2", type: "Photo", label: "Constat du poste officiel", status: "Attendue" }],
      history: [{ time: "10:18", label: "Appel reçu et dossier ouvert", channel: "Téléphone", author: "Permanence régionale" }],
      finalOutput: "Incident qualifié, constat rattaché et clôture régionale."
    },
    {
      id: "RAP-2026-0022", type: "Décision institutionnelle", linkedObject: "Situation maritime de Joal-Fadiouth", linkedObjectType: "Zone", sourceId: "joal", quayId: "joal", territory: "Thiès",
      workStatus: "Terminé", businessStatus: "Rapport consolidé", originChannel: "Document", currentOwner: "Direction régionale de Thiès", nextAction: "Aucune action requise", action: "none", ageDays: 0,
      notes: [{ id: "note-rap-1", time: "09:58", author: "Agent territorial", text: "Les preuves du besoin de glace ont été rapprochées du rapport." }],
      pieces: [{ id: "piece-rap-1", type: "Document", label: "Rapport de zone Joal-Fadiouth", status: "Disponible" }, { id: "piece-rap-2", type: "Preuve", label: "Vérification du besoin de glace", status: "Disponible" }],
      history: [{ time: "09:58", label: "Rapport consolidé après validation humaine", channel: "Document", author: "Direction régionale de Thiès" }],
      finalOutput: "Rapport prêt pour archivage ou transmission manuelle."
    }
  ];

  signals.slice(0, 2).forEach((signal, index) => dossiers.push({
    id: `INC-2026-${String(90 + index).padStart(4, "0")}`, type: "Situation terrain", linkedObject: signal.title, linkedObjectType: "Zone", sourceId: signal.id, territory: signal.scope,
    workStatus: signal.status === "Clôturé" ? "Terminé" : signal.status === "Signalé" ? "Nouveau" : signal.status === "En traitement" ? "En attente" : "À traiter",
    businessStatus: `${signal.nature} · ${signal.treatmentStatus}`, originChannel: "WhatsApp", transitChannel: "Agent territorial", currentOwner: signal.receivingCell,
    nextAction: signal.status === "Signalé" ? "Qualifier le signalement" : signal.status === "Qualifié" ? "Décider du traitement" : signal.status === "En traitement" ? "Suivre le traitement" : "Consulter la clôture",
    action: "open-atlas", ageDays: signal.status === "En traitement" ? 2 : 0,
    notes: [], pieces: [{ id: `piece-${signal.id}`, type: "Message", label: signal.attachmentHint, status: "Attendue" }],
    history: [{ time: signal.createdAt, label: "Signalement reçu", channel: "WhatsApp", author: signal.sender }],
    finalOutput: "Situation qualifiée, traitée et rattachée au suivi régional."
  }));

  fundingDossiers.forEach((dossier, index) => dossiers.push({
    id: `FIN-2026-${String(31 + index).padStart(4, "0")}`, type: "Besoin filière", linkedObject: dossier.title, linkedObjectType: "Besoin", sourceId: dossier.id, territory: dossier.targetPartner,
    workStatus: dossier.status === "Financé" || dossier.status === "Décliné" ? "Terminé" : dossier.status === "Transmission à confirmer" ? "À traiter" : "En attente",
    businessStatus: dossier.status, originChannel: "Formulaire", transitChannel: dossier.transmittedAt ? "Document" : undefined, currentOwner: dossier.owner,
    nextAction: dossier.nextAction, action: "open-funding", ageDays: dossier.status === "Transmis" ? 2 : 0,
    notes: [], pieces: [{ id: `piece-${dossier.id}`, type: "Document", label: "Dossier de financement", status: "Disponible" }],
    history: [{ time: dossier.updatedAt, label: dossier.status, channel: "Formulaire", author: dossier.owner }],
    finalOutput: "Dossier financé, décliné ou archivé avec réponse partenaire."
  }));

  if (!fundingDossiers.length && opportunities[0]) {
    const opportunity = opportunities[0];
    dossiers.push({
      id: "FIN-2026-0031", type: "Besoin filière", linkedObject: opportunity.title, linkedObjectType: "Besoin", sourceId: opportunity.id, territory: opportunity.territory,
      workStatus: "À traiter", businessStatus: opportunity.status, originChannel: "Formulaire", currentOwner: "Service programmes", nextAction: "Constituer le dossier de financement", action: "open-funding", ageDays: 1,
      notes: [], pieces: [{ id: "piece-fin-31", type: "Preuve", label: "Qualification du besoin", status: "Disponible" }, { id: "piece-fin-32", type: "Document", label: "Note budgétaire", status: "Attendue" }],
      history: [{ time: "09:42", label: "Besoin déclaré éligible", channel: "Formulaire", author: "Service programmes" }],
      finalOutput: "Dossier constitué puis transmission manuelle confirmée."
    });
  }

  decisions.slice(0, 2).forEach((decision, index) => dossiers.push({
    id: `NOT-2026-${String(7 + index).padStart(4, "0")}`, type: "Décision institutionnelle", linkedObject: decision.noteTitle, linkedObjectType: "Zone", sourceId: decision.id, territory: decision.source,
    workStatus: decision.status === "Exécutée" ? "Terminé" : decision.status === "À arbitrer" ? "À traiter" : "En attente", businessStatus: decision.status,
    originChannel: "Document", currentOwner: decision.owner, nextAction: decision.nextAction, action: "open-pilotage", ageDays: 0,
    notes: [], pieces: [{ id: `piece-${decision.id}`, type: "Document", label: decision.noteTitle, status: "Disponible" }],
    history: [{ time: decision.createdAt, label: "Note créée et recommandation enregistrée", channel: "Document", author: decision.owner }],
    finalOutput: "Décision arbitrée, exécutée et inscrite au suivi institutionnel."
  }));

  return dossiers.sort((a, b) => workPriority(a.workStatus) - workPriority(b.workStatus));
}

function buildKayarDossier(task?: VerificationTask, report?: ZoneReportRecord, closed = false): DossierOperationnel {
  const status = task?.status;
  const reportReady = Boolean(report);
  const workStatus: DossierWorkStatus = closed ? "Terminé" : reportReady ? "À traiter" : !task ? "À traiter" : ["Message préparé", "Assignée", "En cours"].includes(status || "") ? "En attente" : "À traiter";
  const action: DossierAction = closed ? "none" : reportReady ? "close-dossier" : !task ? "request-verification" : status === "Demandée" ? "prepare-whatsapp" : status === "Message préparé" ? "follow-verification" : ["Assignée", "En cours"].includes(status || "") ? "deposit-constat" : status === "Constat déposé" ? "validate-constat" : "generate-report";
  const nextAction = closed ? "Aucune action requise" : reportReady ? "Relire le rapport et clôturer le dossier" : !task ? "Demander une vérification terrain" : status === "Demandée" ? "Préparer le message WhatsApp" : status === "Message préparé" ? "Suivre la vérification" : ["Assignée", "En cours"].includes(status || "") ? "Déposer le constat reçu" : status === "Constat déposé" ? "Valider le constat" : "Générer le rapport de zone";
  const pieces: DossierPiece[] = [
    { id: "piece-kayar-message", type: "Message", label: "Signal initial du poste officiel", status: "Disponible" },
    { id: "piece-kayar-photo", type: "Photo", label: "Photo de la pesée", status: status && ["Constat déposé", "Vérifiée"].includes(status) ? "Disponible" : "Attendue" },
  ];
  if (reportReady) pieces.push({ id: "piece-kayar-report", type: "Document", label: report!.title, status: "Disponible" });
  return {
    id: "VER-2026-0142", type: "Situation terrain", linkedObject: "Écart de pesée au quai de Kayar", linkedObjectType: "Quai", sourceId: "kayar", quayId: "kayar", territory: "Thiès",
    workStatus, businessStatus: closed ? "Clôturé après décision" : reportReady ? "Rapport disponible" : task?.status || "Vérification à demander", originChannel: "Poste de quai", transitChannel: task ? "WhatsApp" : undefined,
    currentOwner: !task ? "Direction régionale de Thiès" : ["Message préparé", "Assignée", "En cours"].includes(status || "") ? "Poste officiel de Kayar" : "Cellule régionale de validation",
    nextAction, action, ageDays: ["Assignée", "En cours"].includes(status || "") ? 2 : 0,
    notes: [{ id: "note-kayar-1", time: "10:05", author: "Poste officiel de Kayar", text: "Écart signalé sur le dernier débarquement ; confirmation terrain demandée." }],
    pieces,
    history: [
      { time: "10:05", label: "Signal reçu et dossier ouvert", channel: "Poste de quai", author: "Poste officiel de Kayar" },
      ...(task ? [{ time: task.dueDate, label: task.status, channel: task.channel === "WhatsApp structuré" ? "WhatsApp" as const : "Agent territorial" as const, author: task.owner }] : []),
      ...(report ? [{ time: report.generatedAt, label: "Rapport de zone généré", channel: "Document" as const, author: report.author }] : []),
      ...(closed ? [{ time: "à l’instant", label: "Rapport relu, décision enregistrée et dossier clôturé", channel: "Document" as const, author: "Agent connecté · simulation" }] : []),
    ],
    finalOutput: "Constat validé puis rapport de zone prêt à archiver ou transmettre manuellement."
  };
}

function workPriority(status: DossierWorkStatus) {
  return status === "Bloqué" ? 0 : status === "À traiter" ? 1 : status === "Nouveau" ? 2 : status === "En attente" ? 3 : 4;
}
