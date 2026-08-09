export type CrisisSituationType =
  | "cold_chain_breakdown"
  | "fuel_shortage"
  | "transport_disruption"
  | "sanitary_risk"
  | "weather_disruption"
  | "market_disruption"
  | "resource_pressure"
  | "social_tension"
  | "combined_crisis";

export type CrisisSituationStatus =
  | "reported"
  | "qualified"
  | "response_organized"
  | "actions_underway"
  | "stabilized"
  | "recovery_underway"
  | "closed";

export interface CrisisSituation {
  id: string;
  title: string;
  type: CrisisSituationType;
  territoryIds: string[];
  severity: "moderate" | "high" | "critical" | "national_emergency";
  description: string;
  reportedByActorId: string;
  reportedAt: string;
  situationDocumentIds: string[];
  status: CrisisSituationStatus;
}

export interface TerritoryCrisisImpact {
  id: string;
  crisisId: string;
  territoryId: string;
  affectedActorCount: number;
  exposedVolumeKg: number;
  exposedValueXof: number;
  jobsAtRisk: number;
  continuityScore: number;
  urgentNeeds: string[];
  localContactActorId: string;
  situationDocumentIds: string[];
  assessedAt: string;
}

export interface CrisisResponseCell {
  id: string;
  crisisId: string;
  nationalCoordinatorActorId: string;
  territorialCoordinatorActorIds: string[];
  technicalContactActorIds: string[];
  logisticsContactActorIds: string[];
  publicDecisionMakerActorIds: string[];
  partnerOrganizationIds: string[];
  responsibilitiesNoteId: string;
  activatedAt: string;
  status: "active" | "stood_down";
}

export interface CrisisPriorityNeed {
  id: string;
  crisisId: string;
  territoryId: string;
  needType: "ice" | "cold_storage" | "transport" | "fuel" | "quality_control" | "processing" | "food_support" | "solidarity_support" | "communication" | "human_support";
  requiredQuantity: number;
  availableQuantity: number;
  mobilizedQuantity: number;
  unit: string;
  priority: "high" | "critical";
  latestRequiredAt: string;
  status: "identified" | "partially_covered" | "covered" | "unavailable";
  supportingDocumentIds: string[];
}

export interface CrisisDecisionRecord {
  id: string;
  crisisId: string;
  territoryIds: string[];
  decisionType: "activate_response" | "move_capacity" | "redirect_supply" | "temporary_storage" | "organize_transport" | "release_public_support" | "activate_solidarity_support" | "protect_resource" | "inform_actors" | "start_recovery" | "close_crisis";
  decidedByActorId: string;
  reason: string;
  conditions: string[];
  authorizedBudgetXof: number;
  decisionDocumentIds: string[];
  decidedAt: string;
}

export interface CrisisCommitment {
  id: string;
  crisisId: string;
  decisionId: string;
  ownerActorId: string;
  partnerActorIds: string[];
  territoryIds: string[];
  actionDescription: string;
  relatedNeedIds: string[];
  committedQuantity?: number;
  committedUnit?: string;
  committedBudgetXof: number;
  dueAt: string;
  status: "committed" | "in_progress" | "blocked" | "fulfilled" | "failed";
  progressNote?: string;
  completionDocumentIds: string[];
  completedAt?: string;
}

export interface CrisisRecoveryResult {
  id: string;
  crisisId: string;
  territoryId: string;
  commitmentId: string;
  actorsProtectedCount: number;
  volumeSavedKg: number;
  valueProtectedXof: number;
  jobsProtectedCount: number;
  continuityScoreAfter: number;
  responseTimeHours: number;
  lossAvoidedKg: number;
  resultDocumentIds: string[];
  lessons: string[];
  measuredAt: string;
}

export type CrisisCommand =
  | { type: "report_crisis"; crisis: CrisisSituation }
  | { type: "assess_territory_impact"; impact: TerritoryCrisisImpact }
  | { type: "qualify_crisis"; crisisId: string }
  | { type: "activate_response_cell"; cell: CrisisResponseCell }
  | { type: "register_priority_need"; need: CrisisPriorityNeed }
  | { type: "record_decision"; decision: CrisisDecisionRecord }
  | { type: "record_commitment"; commitment: CrisisCommitment }
  | { type: "update_commitment"; commitmentId: string; status: CrisisCommitment["status"]; progressNote: string; completionDocumentIds?: string[]; completedAt?: string }
  | { type: "mobilize_need"; needId: string; quantity: number; supportingDocumentIds: string[] }
  | { type: "record_recovery_result"; result: CrisisRecoveryResult }
  | { type: "advance_crisis"; crisisId: string; status: CrisisSituationStatus };

export class EcosystemCrisisResponseRuntime {
  private readonly crises: CrisisSituation[] = [];
  private readonly impacts: TerritoryCrisisImpact[] = [];
  private readonly cells: CrisisResponseCell[] = [];
  private readonly needs: CrisisPriorityNeed[] = [];
  private readonly decisions: CrisisDecisionRecord[] = [];
  private readonly commitments: CrisisCommitment[] = [];
  private readonly results: CrisisRecoveryResult[] = [];
  private readonly processed = new Map<string, unknown>();

  execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: CrisisCommand }) {
    const previous = this.processed.get(input.commandId);
    if (previous) return structuredClone(previous);
    const command = input.command;
    let result: unknown;

    switch (command.type) {
      case "report_crisis":
        this.ensureUnique(command.crisis.id, this.crises, "situation de crise");
        if (!command.crisis.territoryIds.length) throw new Error("Au moins un territoire concerné doit être indiqué.");
        if (!command.crisis.situationDocumentIds.length) throw new Error("Un constat terrain, un compte rendu ou une confirmation officielle est obligatoire.");
        this.assertTerritoryAccess(command.crisis.territoryIds, input.activeTerritoryId);
        this.crises.push(structuredClone(command.crisis));
        result = command.crisis;
        break;
      case "assess_territory_impact": {
        const crisis = this.requireCrisis(command.impact.crisisId);
        if (!crisis.territoryIds.includes(command.impact.territoryId)) throw new Error("Ce territoire n'est pas rattaché à la crise.");
        if (!command.impact.situationDocumentIds.length) throw new Error("L'évaluation territoriale doit être appuyée par un constat local.");
        if (command.impact.continuityScore < 0 || command.impact.continuityScore > 100) throw new Error("Le niveau de continuité doit être compris entre 0 et 100.");
        this.ensureUnique(command.impact.id, this.impacts, "évaluation territoriale");
        this.impacts.push(structuredClone(command.impact));
        result = command.impact;
        break;
      }
      case "qualify_crisis": {
        const crisis = this.requireCrisis(command.crisisId);
        if (crisis.status !== "reported") throw new Error("Seule une situation signalée peut être qualifiée.");
        const impacts = this.impacts.filter((item) => item.crisisId === crisis.id);
        if (impacts.length < crisis.territoryIds.length) throw new Error("Chaque territoire concerné doit avoir une évaluation avant qualification.");
        crisis.status = "qualified";
        result = crisis;
        break;
      }
      case "activate_response_cell": {
        const crisis = this.requireCrisis(command.cell.crisisId);
        if (crisis.status !== "qualified") throw new Error("La crise doit être qualifiée avant activation de la cellule de réponse.");
        if (!command.cell.territorialCoordinatorActorIds.length || !command.cell.publicDecisionMakerActorIds.length || !command.cell.responsibilitiesNoteId) throw new Error("La cellule doit identifier les responsables territoriaux, les décideurs publics et la répartition des responsabilités.");
        this.ensureUnique(command.cell.id, this.cells, "cellule de réponse");
        this.cells.push(structuredClone(command.cell));
        crisis.status = "response_organized";
        result = command.cell;
        break;
      }
      case "register_priority_need": {
        const crisis = this.requireCrisis(command.need.crisisId);
        if (!crisis.territoryIds.includes(command.need.territoryId)) throw new Error("Le besoin prioritaire appartient à un autre territoire.");
        if (command.need.requiredQuantity <= 0 || command.need.availableQuantity < 0 || command.need.mobilizedQuantity < 0) throw new Error("Les quantités du besoin sont invalides.");
        if (!command.need.supportingDocumentIds.length) throw new Error("Le besoin doit être appuyé par une fiche terrain ou un relevé de capacité.");
        this.ensureUnique(command.need.id, this.needs, "besoin prioritaire");
        this.needs.push(structuredClone(command.need));
        result = command.need;
        break;
      }
      case "record_decision": {
        const crisis = this.requireCrisis(command.decision.crisisId);
        if (!this.cells.some((cell) => cell.crisisId === crisis.id && cell.status === "active")) throw new Error("La cellule de réponse doit être active avant une décision de crise.");
        if (!command.decision.reason.trim() || !command.decision.decisionDocumentIds.length) throw new Error("La décision doit comporter son motif et le compte rendu signé.");
        if (command.decision.authorizedBudgetXof < 0) throw new Error("Le budget autorisé ne peut pas être négatif.");
        this.ensureUnique(command.decision.id, this.decisions, "décision");
        this.decisions.push(structuredClone(command.decision));
        result = command.decision;
        break;
      }
      case "record_commitment": {
        const decision = this.requireDecision(command.commitment.decisionId);
        if (decision.crisisId !== command.commitment.crisisId) throw new Error("L'engagement ne correspond pas à la décision de crise.");
        if (!command.commitment.actionDescription.trim() || command.commitment.committedBudgetXof < 0) throw new Error("L'engagement doit décrire l'action et son budget.");
        if (command.commitment.committedBudgetXof > decision.authorizedBudgetXof) throw new Error("L'engagement dépasse le budget autorisé par la décision.");
        this.ensureUnique(command.commitment.id, this.commitments, "engagement");
        this.commitments.push(structuredClone(command.commitment));
        this.requireCrisis(command.commitment.crisisId).status = "actions_underway";
        result = command.commitment;
        break;
      }
      case "update_commitment": {
        const commitment = this.requireCommitment(command.commitmentId);
        if (!command.progressNote.trim()) throw new Error("Une note d'avancement est obligatoire.");
        if (command.status === "fulfilled" && !(command.completionDocumentIds?.length)) throw new Error("Un bon de réception, un relevé d'exécution ou une confirmation terrain est obligatoire pour clôturer l'engagement.");
        commitment.status = command.status;
        commitment.progressNote = command.progressNote;
        if (command.completionDocumentIds) commitment.completionDocumentIds = [...new Set([...commitment.completionDocumentIds, ...command.completionDocumentIds])];
        if (command.completedAt) commitment.completedAt = command.completedAt;
        result = commitment;
        break;
      }
      case "mobilize_need": {
        const need = this.requireNeed(command.needId);
        if (command.quantity <= 0) throw new Error("La quantité mobilisée doit être positive.");
        if (!command.supportingDocumentIds.length) throw new Error("Le transfert ou la mise à disposition doit être confirmé par un bon, une photo ou un relevé terrain.");
        need.mobilizedQuantity += command.quantity;
        need.supportingDocumentIds = [...new Set([...need.supportingDocumentIds, ...command.supportingDocumentIds])];
        need.status = need.availableQuantity + need.mobilizedQuantity >= need.requiredQuantity ? "covered" : "partially_covered";
        result = need;
        break;
      }
      case "record_recovery_result": {
        const crisis = this.requireCrisis(command.result.crisisId);
        const commitment = this.requireCommitment(command.result.commitmentId);
        if (commitment.status !== "fulfilled") throw new Error("L'engagement doit être exécuté avant mesure du résultat.");
        if (!command.result.resultDocumentIds.length) throw new Error("Le résultat doit être appuyé par un relevé de reprise ou un constat terrain.");
        if (command.result.continuityScoreAfter < 0 || command.result.continuityScoreAfter > 100) throw new Error("Le niveau de continuité doit être compris entre 0 et 100.");
        this.ensureUnique(command.result.id, this.results, "résultat de reprise");
        this.results.push(structuredClone(command.result));
        crisis.status = "recovery_underway";
        result = command.result;
        break;
      }
      case "advance_crisis": {
        const crisis = this.requireCrisis(command.crisisId);
        if (command.status === "closed") {
          const openCommitments = this.commitments.filter((item) => item.crisisId === crisis.id && !["fulfilled", "failed"].includes(item.status));
          if (openCommitments.length) throw new Error("La crise ne peut pas être clôturée tant que des engagements restent ouverts.");
          if (!this.results.some((item) => item.crisisId === crisis.id)) throw new Error("Au moins un résultat de reprise doit être enregistré avant clôture.");
        }
        crisis.status = command.status;
        result = crisis;
        break;
      }
      default:
        throw new Error("Action de crise inconnue.");
    }

    const response = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processed.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot() {
    const affectedActorCount = this.impacts.reduce((sum, item) => sum + item.affectedActorCount, 0);
    const exposedVolumeKg = this.impacts.reduce((sum, item) => sum + item.exposedVolumeKg, 0);
    const exposedValueXof = this.impacts.reduce((sum, item) => sum + item.exposedValueXof, 0);
    return structuredClone({
      crises: this.crises,
      territoryImpacts: this.impacts,
      responseCells: this.cells,
      priorityNeeds: this.needs,
      decisions: this.decisions,
      commitments: this.commitments,
      recoveryResults: this.results,
      metrics: {
        activeCrisisCount: this.crises.filter((item) => item.status !== "closed").length,
        affectedActorCount,
        exposedVolumeKg,
        exposedValueXof,
        priorityNeedCoveragePercent: this.needs.length === 0 ? 0 : Math.round(this.needs.reduce((sum, item) => sum + Math.min(1, (item.availableQuantity + item.mobilizedQuantity) / item.requiredQuantity), 0) / this.needs.length * 100),
        fulfilledCommitmentCount: this.commitments.filter((item) => item.status === "fulfilled").length,
        blockedCommitmentCount: this.commitments.filter((item) => item.status === "blocked").length,
        actorsProtectedCount: this.results.reduce((sum, item) => sum + item.actorsProtectedCount, 0),
        volumeSavedKg: this.results.reduce((sum, item) => sum + item.volumeSavedKg, 0),
        valueProtectedXof: this.results.reduce((sum, item) => sum + item.valueProtectedXof, 0),
        jobsProtectedCount: this.results.reduce((sum, item) => sum + item.jobsProtectedCount, 0),
        averageResponseTimeHours: this.results.length === 0 ? 0 : this.results.reduce((sum, item) => sum + item.responseTimeHours, 0) / this.results.length,
      },
    });
  }

  private assertTerritoryAccess(territoryIds: string[], activeTerritoryId: string) {
    if (activeTerritoryId !== "territory-national" && !territoryIds.every((id) => id === activeTerritoryId)) throw new Error("Le territoire actif ne permet pas de déclarer cette situation.");
  }
  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) { if (values.some((item) => item.id === id)) throw new Error(`${label} déjà existant : ${id}.`); }
  private requireCrisis(id: string) { const value = this.crises.find((item) => item.id === id); if (!value) throw new Error(`Crise introuvable : ${id}.`); return value; }
  private requireDecision(id: string) { const value = this.decisions.find((item) => item.id === id); if (!value) throw new Error(`Décision introuvable : ${id}.`); return value; }
  private requireCommitment(id: string) { const value = this.commitments.find((item) => item.id === id); if (!value) throw new Error(`Engagement introuvable : ${id}.`); return value; }
  private requireNeed(id: string) { const value = this.needs.find((item) => item.id === id); if (!value) throw new Error(`Besoin prioritaire introuvable : ${id}.`); return value; }
}

const globalRuntime = globalThis as typeof globalThis & { __mbCrisisResponseRuntime?: EcosystemCrisisResponseRuntime };
export function getEcosystemCrisisResponseRuntime() {
  globalRuntime.__mbCrisisResponseRuntime ??= new EcosystemCrisisResponseRuntime();
  return globalRuntime.__mbCrisisResponseRuntime;
}
