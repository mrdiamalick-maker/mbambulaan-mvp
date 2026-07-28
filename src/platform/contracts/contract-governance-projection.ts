import type { OperationalContractRuntime } from "./operational-contract-runtime";

export interface ContractGovernanceProjection {
  generatedAt: string;
  metrics: {
    activeContracts: number;
    atRiskContracts: number;
    dueObligations: number;
    breachedObligations: number;
    openCorrectivePlans: number;
    expiringWithin60Days: number;
  };
  atRiskContracts: Array<{ contractId: string; code: string; title: string; breachedObligationIds: string[]; openPlanIds: string[] }>;
  upcomingExpirations: Array<{ contractId: string; code: string; title: string; expiresAt: string; recommendation: "renew" | "renew_with_conditions" | "renegotiate" | "do_not_renew"; reasons: string[] }>;
  overdueObligations: Array<{ obligationId: string; contractId: string; responsibleActorId: string; dueAt?: string; description: string }>;
}

export function buildContractGovernanceProjection(runtime: OperationalContractRuntime, at = new Date().toISOString()): ContractGovernanceProjection {
  const snapshot = runtime.snapshot(at);
  return projectContractGovernance(snapshot, at);
}

export function projectContractGovernance(snapshot: ReturnType<OperationalContractRuntime["snapshot"]>, at = new Date().toISOString()): ContractGovernanceProjection {
  const expirationLimit = Date.parse(at) + 60 * 86_400_000;
  const breachedByContract = new Map<string, string[]>();
  for (const obligation of snapshot.obligations.filter((item) => item.status === "breached")) {
    breachedByContract.set(obligation.contractId, [...(breachedByContract.get(obligation.contractId) ?? []), obligation.id]);
  }
  const plansByContract = new Map<string, string[]>();
  for (const plan of snapshot.correctivePlans.filter((item) => item.status === "planned" || item.status === "in_progress" || item.status === "overdue")) {
    plansByContract.set(plan.contractId, [...(plansByContract.get(plan.contractId) ?? []), plan.id]);
  }

  const upcomingExpirations = snapshot.contracts
    .filter((item) => item.expiresAt && Date.parse(item.expiresAt) >= Date.parse(at) && Date.parse(item.expiresAt) <= expirationLimit)
    .map((contract) => {
      const obligations = snapshot.obligations.filter((item) => item.contractId === contract.id);
      const breached = obligations.filter((item) => item.status === "breached").length;
      const fulfilled = obligations.filter((item) => item.status === "fulfilled").length;
      const openPlans = snapshot.correctivePlans.filter((item) => item.contractId === contract.id && item.status !== "completed").length;
      const reasons: string[] = [];
      let recommendation: "renew" | "renew_with_conditions" | "renegotiate" | "do_not_renew" = "renew";
      if (breached > 0 && openPlans === 0) {
        recommendation = "do_not_renew";
        reasons.push("Rupture contractuelle sans plan correctif ouvert.");
      } else if (breached > 0 || openPlans > 0) {
        recommendation = "renew_with_conditions";
        reasons.push("Le renouvellement doit intégrer la clôture des écarts et un suivi renforcé.");
      } else if (obligations.length > 0 && fulfilled / obligations.length < 0.7) {
        recommendation = "renegotiate";
        reasons.push("Le niveau d'exécution observé est insuffisant pour un renouvellement à l'identique.");
      } else {
        reasons.push("Les engagements suivis ne présentent pas de rupture ouverte.");
      }
      return { contractId: contract.id, code: contract.code, title: contract.title, expiresAt: contract.expiresAt!, recommendation, reasons };
    })
    .sort((left, right) => Date.parse(left.expiresAt) - Date.parse(right.expiresAt));

  return {
    generatedAt: at,
    metrics: {
      activeContracts: snapshot.metrics.activeContractCount,
      atRiskContracts: snapshot.metrics.atRiskContractCount,
      dueObligations: snapshot.metrics.dueObligationCount,
      breachedObligations: snapshot.metrics.breachedObligationCount,
      openCorrectivePlans: snapshot.metrics.correctivePlanOpenCount,
      expiringWithin60Days: upcomingExpirations.length,
    },
    atRiskContracts: snapshot.contracts
      .filter((item) => item.status === "at_risk")
      .map((item) => ({ contractId: item.id, code: item.code, title: item.title, breachedObligationIds: breachedByContract.get(item.id) ?? [], openPlanIds: plansByContract.get(item.id) ?? [] })),
    upcomingExpirations,
    overdueObligations: snapshot.obligations
      .filter((item) => item.status === "due")
      .map((item) => ({ obligationId: item.id, contractId: item.contractId, responsibleActorId: item.responsibleActorId, dueAt: item.dueAt, description: item.description })),
  };
}
