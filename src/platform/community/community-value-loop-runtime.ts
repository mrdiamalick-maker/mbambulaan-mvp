export type CommunityObjective =
  | "food_security"
  | "women_income"
  | "youth_employment"
  | "shared_equipment"
  | "local_processing"
  | "safety"
  | "environment";

export interface CommunityNeed {
  id: string;
  territoryId: string;
  title: string;
  description: string;
  objective: CommunityObjective;
  affectedActorIds: string[];
  evidenceIds: string[];
  priorityScore: number;
  status: "reported" | "qualified" | "rejected" | "converted";
  reportedByActorId: string;
  reportedAt: string;
}

export interface CommunityInitiativeCase {
  id: string;
  needId: string;
  territoryId: string;
  title: string;
  objective: CommunityObjective;
  governanceOrganizationId: string;
  beneficiaryOrganizationIds: string[];
  targetBeneficiaryCount: number;
  targetAmountXof: number;
  platformFeeBps: number;
  status: "draft" | "voting" | "approved" | "funding" | "funded" | "executing" | "completed" | "suspended";
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface CommunityVote {
  id: string;
  initiativeId: string;
  voterActorId: string;
  voterOrganizationId: string;
  choice: "approve" | "reject" | "abstain";
  rationale?: string;
  evidenceIds: string[];
  votedAt: string;
}

export interface CommunityContribution {
  id: string;
  initiativeId: string;
  contributorActorId: string;
  contributorOrganizationId: string;
  sourceType: "transaction_share" | "cooperative" | "public_program" | "donation" | "partner";
  amountXof: number;
  evidenceIds: string[];
  contributedAt: string;
}

export interface CommunityAllocation {
  id: string;
  initiativeId: string;
  beneficiaryOrganizationId: string;
  purpose: string;
  amountXof: number;
  approvedByActorId: string;
  evidenceIds: string[];
  status: "approved" | "disbursed" | "delivered" | "rejected";
  approvedAt: string;
  deliveredAt?: string;
}

export interface CommunityDeliveryProof {
  id: string;
  allocationId: string;
  deliveredByActorId: string;
  beneficiaryActorIds: string[];
  description: string;
  monetaryValueXof: number;
  evidenceIds: string[];
  deliveredAt: string;
  acceptedAt?: string;
}

export interface CommunityOutcome {
  id: string;
  initiativeId: string;
  beneficiaryCount: number;
  womenBeneficiaryCount: number;
  youthBeneficiaryCount: number;
  jobsCreated: number;
  incomeCreatedXof: number;
  collectiveAssetValueXof: number;
  valueProtectedXof: number;
  platformRevenueXof: number;
  evidenceIds: string[];
  confidenceScore: number;
  measuredAt: string;
}

export type CommunityCommand =
  | { type: "report_need"; need: CommunityNeed }
  | { type: "qualify_need"; needId: string }
  | { type: "create_initiative"; initiative: CommunityInitiativeCase }
  | { type: "open_vote"; initiativeId: string }
  | { type: "cast_vote"; vote: CommunityVote }
  | { type: "close_vote"; initiativeId: string; at: string }
  | { type: "record_contribution"; contribution: CommunityContribution }
  | { type: "approve_allocation"; allocation: CommunityAllocation }
  | { type: "record_delivery"; proof: CommunityDeliveryProof }
  | { type: "record_outcome"; outcome: CommunityOutcome };

export class CommunityValueLoopRuntime {
  private readonly needs: CommunityNeed[] = [];
  private readonly initiatives: CommunityInitiativeCase[] = [];
  private readonly votes: CommunityVote[] = [];
  private readonly contributions: CommunityContribution[] = [];
  private readonly allocations: CommunityAllocation[] = [];
  private readonly proofs: CommunityDeliveryProof[] = [];
  private readonly outcomes: CommunityOutcome[] = [];
  private readonly processedCommands = new Map<string, unknown>();

  execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: CommunityCommand }) {
    const previous = this.processedCommands.get(input.commandId);
    if (previous) return structuredClone(previous);
    const command = input.command;
    let result: unknown;

    switch (command.type) {
      case "report_need":
        this.assertTerritory(command.need.territoryId, input.activeTerritoryId);
        this.ensureUnique(command.need.id, this.needs, "besoin");
        if (!command.need.evidenceIds.length) throw new Error("Une preuve du besoin collectif est obligatoire.");
        this.assertScore(command.need.priorityScore, "priorité");
        this.needs.push(structuredClone(command.need));
        result = command.need;
        break;
      case "qualify_need": {
        const need = this.requireNeed(command.needId);
        if (need.status !== "reported") throw new Error("Seul un besoin signalé peut être qualifié.");
        need.status = "qualified";
        result = need;
        break;
      }
      case "create_initiative": {
        const need = this.requireNeed(command.initiative.needId);
        this.assertTerritory(command.initiative.territoryId, input.activeTerritoryId);
        if (need.status !== "qualified") throw new Error("Le besoin doit être qualifié avant création de l'initiative.");
        if (need.territoryId !== command.initiative.territoryId) throw new Error("L'initiative doit rester dans le territoire du besoin.");
        if (!command.initiative.beneficiaryOrganizationIds.length) throw new Error("Au moins une organisation bénéficiaire est obligatoire.");
        if (command.initiative.targetAmountXof <= 0 || command.initiative.targetBeneficiaryCount <= 0) throw new Error("Les objectifs de l'initiative doivent être positifs.");
        if (command.initiative.platformFeeBps < 0 || command.initiative.platformFeeBps > 1_000) throw new Error("Les frais plateforme doivent être compris entre 0 et 1 000 points de base.");
        this.ensureUnique(command.initiative.id, this.initiatives, "initiative");
        this.initiatives.push(structuredClone(command.initiative));
        need.status = "converted";
        result = command.initiative;
        break;
      }
      case "open_vote": {
        const initiative = this.requireInitiative(command.initiativeId);
        if (initiative.status !== "draft") throw new Error("Seule une initiative en brouillon peut être soumise au vote.");
        initiative.status = "voting";
        result = initiative;
        break;
      }
      case "cast_vote": {
        const initiative = this.requireInitiative(command.vote.initiativeId);
        if (initiative.status !== "voting") throw new Error("Le vote n'est pas ouvert.");
        if (!command.vote.evidenceIds.length) throw new Error("Une preuve de participation est obligatoire.");
        if (this.votes.some((item) => item.initiativeId === command.vote.initiativeId && item.voterOrganizationId === command.vote.voterOrganizationId)) throw new Error("Cette organisation a déjà voté.");
        this.ensureUnique(command.vote.id, this.votes, "vote");
        this.votes.push(structuredClone(command.vote));
        result = command.vote;
        break;
      }
      case "close_vote": {
        const initiative = this.requireInitiative(command.initiativeId);
        if (initiative.status !== "voting") throw new Error("Le vote n'est pas ouvert.");
        const votes = this.votes.filter((item) => item.initiativeId === initiative.id);
        const approvals = votes.filter((item) => item.choice === "approve").length;
        const rejections = votes.filter((item) => item.choice === "reject").length;
        if (approvals <= rejections) throw new Error("L'initiative ne dispose pas d'une majorité favorable.");
        initiative.status = "funding";
        initiative.approvedAt = command.at;
        result = initiative;
        break;
      }
      case "record_contribution": {
        const initiative = this.requireInitiative(command.contribution.initiativeId);
        if (!['funding', 'funded', 'executing'].includes(initiative.status)) throw new Error("L'initiative n'accepte pas de contribution dans son état actuel.");
        if (command.contribution.amountXof <= 0 || !command.contribution.evidenceIds.length) throw new Error("Une contribution positive et prouvée est obligatoire.");
        this.ensureUnique(command.contribution.id, this.contributions, "contribution");
        this.contributions.push(structuredClone(command.contribution));
        if (this.totalContributions(initiative.id) >= initiative.targetAmountXof) initiative.status = "funded";
        result = command.contribution;
        break;
      }
      case "approve_allocation": {
        const initiative = this.requireInitiative(command.allocation.initiativeId);
        if (!['funded', 'executing'].includes(initiative.status)) throw new Error("L'initiative doit être financée avant affectation.");
        if (!initiative.beneficiaryOrganizationIds.includes(command.allocation.beneficiaryOrganizationId)) throw new Error("L'organisation n'est pas bénéficiaire de l'initiative.");
        if (command.allocation.amountXof <= 0 || !command.allocation.evidenceIds.length) throw new Error("Une affectation positive et prouvée est obligatoire.");
        const available = this.totalContributions(initiative.id) - this.totalAllocated(initiative.id);
        if (command.allocation.amountXof > available) throw new Error("L'affectation dépasse les fonds disponibles.");
        this.ensureUnique(command.allocation.id, this.allocations, "affectation");
        this.allocations.push(structuredClone(command.allocation));
        initiative.status = "executing";
        result = command.allocation;
        break;
      }
      case "record_delivery": {
        const allocation = this.requireAllocation(command.proof.allocationId);
        if (allocation.status !== "approved" && allocation.status !== "disbursed") throw new Error("L'affectation ne peut pas encore être livrée.");
        if (!command.proof.evidenceIds.length || !command.proof.beneficiaryActorIds.length) throw new Error("La livraison doit identifier les bénéficiaires et les preuves.");
        if (command.proof.monetaryValueXof > allocation.amountXof) throw new Error("La valeur livrée dépasse l'affectation.");
        this.ensureUnique(command.proof.id, this.proofs, "preuve");
        this.proofs.push(structuredClone(command.proof));
        allocation.status = "delivered";
        allocation.deliveredAt = command.proof.deliveredAt;
        result = command.proof;
        break;
      }
      case "record_outcome": {
        const initiative = this.requireInitiative(command.outcome.initiativeId);
        if (!this.allocations.some((item) => item.initiativeId === initiative.id && item.status === "delivered")) throw new Error("Au moins une affectation doit être livrée avant mesure d'impact.");
        if (!command.outcome.evidenceIds.length) throw new Error("Une preuve d'impact est obligatoire.");
        this.assertScore(command.outcome.confidenceScore, "confiance");
        this.ensureUnique(command.outcome.id, this.outcomes, "résultat");
        this.outcomes.push(structuredClone(command.outcome));
        initiative.status = "completed";
        initiative.completedAt = command.outcome.measuredAt;
        result = command.outcome;
        break;
      }
      default:
        throw new Error("Commande Community inconnue.");
    }

    const response = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processedCommands.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot() {
    const totalContributionsXof = this.contributions.reduce((sum, item) => sum + item.amountXof, 0);
    const totalAllocatedXof = this.allocations.reduce((sum, item) => sum + item.amountXof, 0);
    return structuredClone({
      needs: this.needs,
      initiatives: this.initiatives,
      votes: this.votes,
      contributions: this.contributions,
      allocations: this.allocations,
      proofs: this.proofs,
      outcomes: this.outcomes,
      metrics: {
        qualifiedNeedCount: this.needs.filter((item) => ["qualified", "converted"].includes(item.status)).length,
        approvedInitiativeCount: this.initiatives.filter((item) => ["funding", "funded", "executing", "completed"].includes(item.status)).length,
        completedInitiativeCount: this.initiatives.filter((item) => item.status === "completed").length,
        totalContributionsXof,
        totalAllocatedXof,
        availableBalanceXof: totalContributionsXof - totalAllocatedXof,
        beneficiaryCount: this.outcomes.reduce((sum, item) => sum + item.beneficiaryCount, 0),
        womenBeneficiaryCount: this.outcomes.reduce((sum, item) => sum + item.womenBeneficiaryCount, 0),
        youthBeneficiaryCount: this.outcomes.reduce((sum, item) => sum + item.youthBeneficiaryCount, 0),
        jobsCreated: this.outcomes.reduce((sum, item) => sum + item.jobsCreated, 0),
        incomeCreatedXof: this.outcomes.reduce((sum, item) => sum + item.incomeCreatedXof, 0),
        collectiveAssetValueXof: this.outcomes.reduce((sum, item) => sum + item.collectiveAssetValueXof, 0),
        valueProtectedXof: this.outcomes.reduce((sum, item) => sum + item.valueProtectedXof, 0),
        platformRevenueXof: this.outcomes.reduce((sum, item) => sum + item.platformRevenueXof, 0),
      },
    });
  }

  private totalContributions(initiativeId: string) { return this.contributions.filter((item) => item.initiativeId === initiativeId).reduce((sum, item) => sum + item.amountXof, 0); }
  private totalAllocated(initiativeId: string) { return this.allocations.filter((item) => item.initiativeId === initiativeId && item.status !== "rejected").reduce((sum, item) => sum + item.amountXof, 0); }
  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) { if (values.some((item) => item.id === id)) throw new Error(`${label} déjà existant : ${id}.`); }
  private assertScore(value: number, label: string) { if (value < 0 || value > 100) throw new Error(`Le score de ${label} doit être compris entre 0 et 100.`); }
  private assertTerritory(value: string, active: string) { if (active !== "territory-national" && value !== active) throw new Error("Le territoire actif ne permet pas cette opération."); }
  private requireNeed(id: string) { const value = this.needs.find((item) => item.id === id); if (!value) throw new Error(`Besoin introuvable : ${id}.`); return value; }
  private requireInitiative(id: string) { const value = this.initiatives.find((item) => item.id === id); if (!value) throw new Error(`Initiative introuvable : ${id}.`); return value; }
  private requireAllocation(id: string) { const value = this.allocations.find((item) => item.id === id); if (!value) throw new Error(`Affectation introuvable : ${id}.`); return value; }
}

const globalRuntime = globalThis as typeof globalThis & { __mbCommunityValueLoopRuntime?: CommunityValueLoopRuntime };
export function getCommunityValueLoopRuntime() {
  globalRuntime.__mbCommunityValueLoopRuntime ??= new CommunityValueLoopRuntime();
  return globalRuntime.__mbCommunityValueLoopRuntime;
}
