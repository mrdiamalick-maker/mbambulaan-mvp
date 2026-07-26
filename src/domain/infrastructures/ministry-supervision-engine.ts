import type { EntityId, ISODateTime } from "./types";

export type SupervisionScope = "national" | "region" | "territory" | "landing_site" | "cooperative";
export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type ComplianceStatus = "compliant" | "partially_compliant" | "non_compliant" | "unknown";

export interface SupervisionIndicator {
  id: EntityId;
  code: string;
  label: string;
  scope: SupervisionScope;
  scopeId: EntityId;
  category: "resource" | "economic" | "social" | "operational" | "quality" | "compliance" | "finance" | "infrastructure";
  value: number;
  unit: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  observedAt: ISODateTime;
  sourceEngine: string;
  sourceReferenceId?: EntityId;
  confidenceScore: number;
  metadata: Record<string, unknown>;
}

export interface SupervisionAlert {
  id: EntityId;
  scope: SupervisionScope;
  scopeId: EntityId;
  category: SupervisionIndicator["category"];
  severity: AlertSeverity;
  title: string;
  description: string;
  indicatorIds: EntityId[];
  recommendedActions: string[];
  status: "open" | "acknowledged" | "in_progress" | "resolved" | "dismissed";
  openedAt: ISODateTime;
  acknowledgedAt?: ISODateTime;
  resolvedAt?: ISODateTime;
  assignedAuthorityActorId?: EntityId;
}

export interface ComplianceAssessment {
  id: EntityId;
  scope: SupervisionScope;
  scopeId: EntityId;
  frameworkCode: string;
  requirementCode: string;
  requirementLabel: string;
  status: ComplianceStatus;
  evidenceIds: EntityId[];
  gaps: string[];
  correctiveActions: string[];
  assessedAt: ISODateTime;
  nextReviewAt?: ISODateTime;
  assessedByActorId?: EntityId;
}

export interface PublicProgram {
  id: EntityId;
  code: string;
  name: string;
  objective: string;
  scope: SupervisionScope;
  scopeIds: EntityId[];
  budgetXof?: number;
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  status: "planned" | "active" | "suspended" | "completed" | "cancelled";
  targetIndicators: Array<{
    indicatorCode: string;
    targetValue: number;
    unit: string;
  }>;
  responsibleAuthorityActorId?: EntityId;
}

export interface PublicProgramProgress {
  programId: EntityId;
  progressPercent: number;
  targetAchievementPercent: number;
  budgetExecutionPercent?: number;
  risks: string[];
  recommendations: string[];
  generatedAt: ISODateTime;
}

export interface MinistryBriefing {
  id: EntityId;
  scope: SupervisionScope;
  scopeId: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  headline: string;
  keyFindings: string[];
  criticalAlerts: SupervisionAlert[];
  complianceSummary: {
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    unknown: number;
  };
  priorityDecisions: string[];
  programProgress: PublicProgramProgress[];
  generatedAt: ISODateTime;
}

export class MinistrySupervisionEngine {
  private readonly indicators = new Map<EntityId, SupervisionIndicator>();
  private readonly alerts = new Map<EntityId, SupervisionAlert>();
  private readonly complianceAssessments = new Map<EntityId, ComplianceAssessment>();
  private readonly programs = new Map<EntityId, PublicProgram>();

  registerIndicator(input: SupervisionIndicator) {
    if (input.confidenceScore < 0 || input.confidenceScore > 100) throw new Error("Le score de confiance doit être compris entre 0 et 100.");
    this.indicators.set(input.id, structuredClone(input));
    this.evaluateIndicatorForAlerts(input);
    return structuredClone(input);
  }

  createAlert(input: SupervisionAlert) {
    if (this.alerts.has(input.id)) throw new Error(`L'alerte ${input.id} existe déjà.`);
    this.alerts.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  acknowledgeAlert(input: { alertId: EntityId; acknowledgedAt: ISODateTime; authorityActorId: EntityId }) {
    const alert = this.requireAlert(input.alertId);
    if (alert.status !== "open") throw new Error("Seule une alerte ouverte peut être prise en charge.");
    alert.status = "acknowledged";
    alert.acknowledgedAt = input.acknowledgedAt;
    alert.assignedAuthorityActorId = input.authorityActorId;
    this.alerts.set(alert.id, alert);
    return structuredClone(alert);
  }

  resolveAlert(input: { alertId: EntityId; resolvedAt: ISODateTime }) {
    const alert = this.requireAlert(input.alertId);
    if (["resolved", "dismissed"].includes(alert.status)) return structuredClone(alert);
    alert.status = "resolved";
    alert.resolvedAt = input.resolvedAt;
    this.alerts.set(alert.id, alert);
    return structuredClone(alert);
  }

  recordComplianceAssessment(input: ComplianceAssessment) {
    if (this.complianceAssessments.has(input.id)) throw new Error(`L'évaluation ${input.id} existe déjà.`);
    this.complianceAssessments.set(input.id, structuredClone(input));
    if (input.status === "non_compliant") {
      this.createAlert({
        id: `alert:compliance:${input.id}`,
        scope: input.scope,
        scopeId: input.scopeId,
        category: "compliance",
        severity: "critical",
        title: `Non-conformité ${input.frameworkCode}/${input.requirementCode}`,
        description: input.requirementLabel,
        indicatorIds: [],
        recommendedActions: input.correctiveActions,
        status: "open",
        openedAt: input.assessedAt,
      });
    }
    return structuredClone(input);
  }

  registerPublicProgram(input: PublicProgram) {
    if (this.programs.has(input.id)) throw new Error(`Le programme ${input.id} existe déjà.`);
    if (input.endsAt && input.endsAt <= input.startsAt) throw new Error("La période du programme est invalide.");
    if (input.budgetXof !== undefined && input.budgetXof < 0) throw new Error("Le budget ne peut pas être négatif.");
    this.programs.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  assessProgramProgress(input: { programId: EntityId; generatedAt: ISODateTime; budgetSpentXof?: number }): PublicProgramProgress {
    const program = this.requireProgram(input.programId);
    const relevantIndicators = [...this.indicators.values()].filter((indicator) =>
      program.scopeIds.includes(indicator.scopeId) &&
      program.targetIndicators.some((target) => target.indicatorCode === indicator.code),
    );
    const targetScores = program.targetIndicators.map((target) => {
      const observations = relevantIndicators.filter((indicator) => indicator.code === target.indicatorCode);
      if (!observations.length || target.targetValue === 0) return 0;
      const latest = observations.sort((a, b) => b.observedAt.localeCompare(a.observedAt))[0];
      return Math.min(100, (latest.value / target.targetValue) * 100);
    });
    const targetAchievementPercent = targetScores.length
      ? Math.round(targetScores.reduce((sum, value) => sum + value, 0) / targetScores.length)
      : 0;
    const totalDuration = program.endsAt
      ? new Date(program.endsAt).getTime() - new Date(program.startsAt).getTime()
      : undefined;
    const elapsed = new Date(input.generatedAt).getTime() - new Date(program.startsAt).getTime();
    const progressPercent = totalDuration && totalDuration > 0
      ? Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)))
      : program.status === "completed" ? 100 : 0;
    const budgetExecutionPercent = program.budgetXof && input.budgetSpentXof !== undefined
      ? Math.round((input.budgetSpentXof / program.budgetXof) * 10000) / 100
      : undefined;
    const risks: string[] = [];
    const recommendations: string[] = [];
    if (targetAchievementPercent + 15 < progressPercent) {
      risks.push("Les résultats sont en retard par rapport à l'avancement temporel du programme.");
      recommendations.push("Recentrer les moyens sur les indicateurs les plus en retard.");
    }
    if (budgetExecutionPercent !== undefined && budgetExecutionPercent > progressPercent + 20) {
      risks.push("La consommation budgétaire est plus rapide que l'avancement du programme.");
      recommendations.push("Revoir les engagements budgétaires et les coûts unitaires.");
    }
    if (budgetExecutionPercent !== undefined && budgetExecutionPercent + 20 < progressPercent) {
      risks.push("Le budget est sous-exécuté par rapport au calendrier.");
      recommendations.push("Accélérer les décaissements utiles et débloquer les achats prioritaires.");
    }
    return {
      programId: program.id,
      progressPercent,
      targetAchievementPercent,
      budgetExecutionPercent,
      risks,
      recommendations,
      generatedAt: input.generatedAt,
    };
  }

  buildBriefing(input: { id: EntityId; scope: SupervisionScope; scopeId: EntityId; periodStart: ISODateTime; periodEnd: ISODateTime; generatedAt: ISODateTime; budgetSpentByProgramId?: Record<EntityId, number> }): MinistryBriefing {
    const indicators = [...this.indicators.values()].filter((item) =>
      item.scope === input.scope && item.scopeId === input.scopeId && item.observedAt >= input.periodStart && item.observedAt <= input.periodEnd,
    );
    const alerts = [...this.alerts.values()].filter((item) =>
      item.scope === input.scope && item.scopeId === input.scopeId && item.openedAt >= input.periodStart && item.openedAt <= input.periodEnd && !["resolved", "dismissed"].includes(item.status),
    );
    const compliance = [...this.complianceAssessments.values()].filter((item) =>
      item.scope === input.scope && item.scopeId === input.scopeId && item.assessedAt >= input.periodStart && item.assessedAt <= input.periodEnd,
    );
    const programProgress = [...this.programs.values()]
      .filter((program) => program.scope === input.scope && program.scopeIds.includes(input.scopeId) && ["active", "completed"].includes(program.status))
      .map((program) => this.assessProgramProgress({
        programId: program.id,
        generatedAt: input.generatedAt,
        budgetSpentXof: input.budgetSpentByProgramId?.[program.id],
      }));
    const criticalAlerts = alerts.filter((item) => ["critical", "emergency"].includes(item.severity));
    const keyFindings: string[] = [];
    const resourceIndicators = indicators.filter((item) => item.category === "resource");
    const economicIndicators = indicators.filter((item) => item.category === "economic");
    if (resourceIndicators.length) keyFindings.push(`${resourceIndicators.length} indicateur(s) de ressource suivis sur la période.`);
    if (economicIndicators.length) keyFindings.push(`${economicIndicators.length} indicateur(s) économiques consolidés.`);
    if (criticalAlerts.length) keyFindings.push(`${criticalAlerts.length} alerte(s) critique(s) nécessitent une décision.`);
    if (compliance.some((item) => item.status === "non_compliant")) keyFindings.push("Des non-conformités ouvertes ont été détectées.");
    const priorityDecisions = [
      ...criticalAlerts.flatMap((alert) => alert.recommendedActions),
      ...compliance.filter((item) => item.status === "non_compliant").flatMap((item) => item.correctiveActions),
      ...programProgress.flatMap((item) => item.recommendations),
    ];
    return {
      id: input.id,
      scope: input.scope,
      scopeId: input.scopeId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      headline: criticalAlerts.length
        ? `${criticalAlerts.length} situation(s) critique(s) à arbitrer`
        : "Situation sous contrôle, avec surveillance active",
      keyFindings: [...new Set(keyFindings)],
      criticalAlerts: criticalAlerts.map((item) => structuredClone(item)),
      complianceSummary: {
        compliant: compliance.filter((item) => item.status === "compliant").length,
        partiallyCompliant: compliance.filter((item) => item.status === "partially_compliant").length,
        nonCompliant: compliance.filter((item) => item.status === "non_compliant").length,
        unknown: compliance.filter((item) => item.status === "unknown").length,
      },
      priorityDecisions: [...new Set(priorityDecisions)],
      programProgress,
      generatedAt: input.generatedAt,
    };
  }

  getNationalCommandCenter() {
    const openAlerts = [...this.alerts.values()].filter((item) => !["resolved", "dismissed"].includes(item.status));
    const latestIndicators = new Map<string, SupervisionIndicator>();
    for (const indicator of this.indicators.values()) {
      const key = `${indicator.scope}:${indicator.scopeId}:${indicator.code}`;
      const current = latestIndicators.get(key);
      if (!current || current.observedAt < indicator.observedAt) latestIndicators.set(key, indicator);
    }
    return {
      activeProgramCount: [...this.programs.values()].filter((item) => item.status === "active").length,
      openAlertCount: openAlerts.length,
      criticalAlertCount: openAlerts.filter((item) => ["critical", "emergency"].includes(item.severity)).length,
      unresolvedNonComplianceCount: [...this.complianceAssessments.values()].filter((item) => item.status === "non_compliant").length,
      latestIndicators: [...latestIndicators.values()].map((item) => structuredClone(item)),
      alertsBySeverity: {
        info: openAlerts.filter((item) => item.severity === "info").length,
        warning: openAlerts.filter((item) => item.severity === "warning").length,
        critical: openAlerts.filter((item) => item.severity === "critical").length,
        emergency: openAlerts.filter((item) => item.severity === "emergency").length,
      },
    };
  }

  snapshot() {
    return {
      indicators: [...this.indicators.values()].map((item) => structuredClone(item)),
      alerts: [...this.alerts.values()].map((item) => structuredClone(item)),
      complianceAssessments: [...this.complianceAssessments.values()].map((item) => structuredClone(item)),
      programs: [...this.programs.values()].map((item) => structuredClone(item)),
    };
  }

  private evaluateIndicatorForAlerts(indicator: SupervisionIndicator) {
    let severity: AlertSeverity | undefined;
    if (indicator.criticalThreshold !== undefined && indicator.value >= indicator.criticalThreshold) severity = "critical";
    else if (indicator.warningThreshold !== undefined && indicator.value >= indicator.warningThreshold) severity = "warning";
    if (!severity) return;
    const alertId = `alert:indicator:${indicator.id}`;
    if (this.alerts.has(alertId)) return;
    this.alerts.set(alertId, {
      id: alertId,
      scope: indicator.scope,
      scopeId: indicator.scopeId,
      category: indicator.category,
      severity,
      title: `${indicator.label} au-dessus du seuil`,
      description: `${indicator.value} ${indicator.unit} observé(s).`,
      indicatorIds: [indicator.id],
      recommendedActions: ["Vérifier la qualité de la donnée.", "Analyser les causes.", "Déclencher un plan de réponse si la tendance est confirmée."],
      status: "open",
      openedAt: indicator.observedAt,
    });
  }

  private requireAlert(id: EntityId) {
    const item = this.alerts.get(id);
    if (!item) throw new Error(`Alerte introuvable : ${id}.`);
    return item;
  }

  private requireProgram(id: EntityId) {
    const item = this.programs.get(id);
    if (!item) throw new Error(`Programme introuvable : ${id}.`);
    return item;
  }
}
