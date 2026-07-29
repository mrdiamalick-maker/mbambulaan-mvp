import type {
  AtlasBriefing,
  AtlasEvidence,
  AtlasInsight,
  AtlasQuestion,
  AtlasScenario,
  AtlasScenarioEvaluation,
  AtlasWorkspace,
} from "@/domain/infrastructures/atlas";
import type {
  CausalPath,
  KnowledgeEdge,
  KnowledgeNode,
} from "@/domain/infrastructures/atlas-knowledge-graph";
import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";

export interface AtlasQuestionResult {
  question: AtlasQuestion;
  evidence: AtlasEvidence[];
  insights: AtlasInsight[];
}

export interface AtlasDecisionAction {
  id: string;
  workspaceId: string;
  scenarioId?: string;
  briefingId?: string;
  actionType: string;
  targetEntityIds: string[];
  assignedActorId?: string;
  assignedOrganizationId?: string;
  territoryIds: string[];
  dueAt?: string;
  status: "proposed" | "approved" | "dispatched" | "in_progress" | "completed" | "cancelled" | "failed";
  runtimeEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AtlasRepository {
  saveWorkspace(workspace: AtlasWorkspace): Promise<void>;
  getWorkspace(id: string): Promise<AtlasWorkspace | undefined>;
  listWorkspaces(tenantId: string): Promise<AtlasWorkspace[]>;
  saveQuestionResult(result: AtlasQuestionResult, correlationId?: string): Promise<void>;
  getQuestionResult(questionId: string): Promise<AtlasQuestionResult | undefined>;
  saveScenario(scenario: AtlasScenario): Promise<void>;
  saveScenarioEvaluation(evaluation: AtlasScenarioEvaluation): Promise<void>;
  getScenario(id: string): Promise<AtlasScenario | undefined>;
  saveBriefing(briefing: AtlasBriefing): Promise<void>;
  saveKnowledgeGraph(input: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[]; causalPaths: CausalPath[] }): Promise<void>;
  saveDecisionAction(action: AtlasDecisionAction): Promise<void>;
  listDecisionActions(workspaceId: string): Promise<AtlasDecisionAction[]>;
}

export class PostgresAtlasRepository implements AtlasRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async saveWorkspace(workspace: AtlasWorkspace) {
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_workspaces
       (id, tenant_id, name, client_segment, territory_ids, decision_domains, capability_codes, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,
         client_segment=EXCLUDED.client_segment,
         territory_ids=EXCLUDED.territory_ids,
         decision_domains=EXCLUDED.decision_domains,
         capability_codes=EXCLUDED.capability_codes,
         status=EXCLUDED.status,
         updated_at=now()`,
      [workspace.id, workspace.tenantId, workspace.name, workspace.clientSegment, workspace.territoryIds,
       workspace.decisionDomains, workspace.capabilityCodes, workspace.status, workspace.createdAt],
    );
  }

  async getWorkspace(id: string) {
    const result = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_workspaces WHERE id=$1`,
      [id],
    );
    const row = result.rows[0];
    return row ? this.mapWorkspace(row) : undefined;
  }

  async listWorkspaces(tenantId: string) {
    const result = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_workspaces WHERE tenant_id=$1 ORDER BY created_at`,
      [tenantId],
    );
    return result.rows.map((row) => this.mapWorkspace(row));
  }

  async saveQuestionResult(result: AtlasQuestionResult, correlationId?: string) {
    const question = result.question;
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_questions
       (id, workspace_id, asked_by_actor_id, asked_at, question, decision_domain, territory_ids, horizon, objective, correlation_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'answered')
       ON CONFLICT (id) DO UPDATE SET status='answered', error=NULL`,
      [question.id, question.workspaceId, question.askedByActorId, question.askedAt, question.question,
       question.decisionDomain, question.territoryIds, question.horizon, question.objective ?? null, correlationId ?? null],
    );

    for (const evidence of result.evidence) {
      await this.executor().query(
        `INSERT INTO mbambulaan.atlas_evidence
         (id, workspace_id, question_id, source_type, source_entity_id, title, summary, observed_at,
          reliability_score, freshness_score, provenance)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           summary=EXCLUDED.summary,
           reliability_score=EXCLUDED.reliability_score,
           freshness_score=EXCLUDED.freshness_score,
           provenance=EXCLUDED.provenance`,
        [evidence.id, question.workspaceId, question.id, evidence.sourceType, evidence.sourceEntityId,
         evidence.title, evidence.summary, evidence.observedAt ?? null, evidence.reliabilityScore,
         evidence.freshnessScore, JSON.stringify({ correlationId })],
      );
    }

    for (const insight of result.insights) {
      await this.executor().query(
        `INSERT INTO mbambulaan.atlas_insights
         (id, workspace_id, question_id, decision_domain, title, statement, implication, evidence_ids,
          confidence_score, urgency, generated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           statement=EXCLUDED.statement,
           implication=EXCLUDED.implication,
           evidence_ids=EXCLUDED.evidence_ids,
           confidence_score=EXCLUDED.confidence_score,
           urgency=EXCLUDED.urgency,
           generated_at=EXCLUDED.generated_at,
           version=mbambulaan.atlas_insights.version + 1`,
        [insight.id, insight.workspaceId, insight.questionId ?? question.id, insight.decisionDomain,
         insight.title, insight.statement, insight.implication, insight.evidenceIds,
         insight.confidenceScore, insight.urgency, insight.generatedAt],
      );
    }
  }

  async getQuestionResult(questionId: string) {
    const questionResult = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_questions WHERE id=$1`,
      [questionId],
    );
    const row = questionResult.rows[0];
    if (!row) return undefined;

    const evidenceResult = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_evidence WHERE question_id=$1 ORDER BY reliability_score DESC`,
      [questionId],
    );
    const insightResult = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_insights WHERE question_id=$1 ORDER BY confidence_score DESC`,
      [questionId],
    );

    return {
      question: this.mapQuestion(row),
      evidence: evidenceResult.rows.map((item) => this.mapEvidence(item)),
      insights: insightResult.rows.map((item) => this.mapInsight(item)),
    };
  }

  async saveScenario(scenario: AtlasScenario) {
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_scenarios
       (id, workspace_id, name, decision_domain, baseline_snapshot_id, actions, assumptions, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,now())
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,
         actions=EXCLUDED.actions,
         assumptions=EXCLUDED.assumptions,
         status=EXCLUDED.status,
         updated_at=now()`,
      [scenario.id, scenario.workspaceId, scenario.name, scenario.decisionDomain,
       scenario.baselineSnapshotId ?? null, JSON.stringify(scenario.actions), scenario.assumptions,
       scenario.status, scenario.createdAt],
    );
  }

  async saveScenarioEvaluation(evaluation: AtlasScenarioEvaluation) {
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_scenario_evaluations
       (scenario_id, value_creation_score, resilience_score, coordination_score,
        financial_sustainability_score, implementation_risk_score, estimated_cost_xof,
        expected_benefits, risks, recommendation, evaluated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (scenario_id) DO UPDATE SET
         value_creation_score=EXCLUDED.value_creation_score,
         resilience_score=EXCLUDED.resilience_score,
         coordination_score=EXCLUDED.coordination_score,
         financial_sustainability_score=EXCLUDED.financial_sustainability_score,
         implementation_risk_score=EXCLUDED.implementation_risk_score,
         estimated_cost_xof=EXCLUDED.estimated_cost_xof,
         expected_benefits=EXCLUDED.expected_benefits,
         risks=EXCLUDED.risks,
         recommendation=EXCLUDED.recommendation,
         evaluated_at=EXCLUDED.evaluated_at`,
      [evaluation.scenarioId, evaluation.valueCreationScore, evaluation.resilienceScore,
       evaluation.coordinationScore, evaluation.financialSustainabilityScore,
       evaluation.implementationRiskScore, evaluation.estimatedCostXof,
       evaluation.expectedBenefits, evaluation.risks, evaluation.recommendation, evaluation.evaluatedAt],
    );
  }

  async getScenario(id: string) {
    const result = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_scenarios WHERE id=$1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      decisionDomain: row.decision_domain,
      baselineSnapshotId: row.baseline_snapshot_id ?? undefined,
      actions: row.actions,
      assumptions: row.assumptions,
      status: row.status,
      createdAt: row.created_at,
    } as AtlasScenario;
  }

  async saveBriefing(briefing: AtlasBriefing) {
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_briefings
       (id, workspace_id, generated_at, title, executive_summary, priority_signal_ids,
        priority_insight_ids, selected_scenario_ids, recommended_decisions, next_review_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         title=EXCLUDED.title,
         executive_summary=EXCLUDED.executive_summary,
         priority_signal_ids=EXCLUDED.priority_signal_ids,
         priority_insight_ids=EXCLUDED.priority_insight_ids,
         selected_scenario_ids=EXCLUDED.selected_scenario_ids,
         recommended_decisions=EXCLUDED.recommended_decisions,
         next_review_at=EXCLUDED.next_review_at`,
      [briefing.id, briefing.workspaceId, briefing.generatedAt, briefing.title, briefing.executiveSummary,
       briefing.prioritySignalIds, briefing.priorityInsightIds, briefing.selectedScenarioIds,
       briefing.recommendedDecisions, briefing.nextReviewAt ?? null],
    );
  }

  async saveKnowledgeGraph(input: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[]; causalPaths: CausalPath[] }) {
    for (const node of input.nodes) {
      await this.executor().query(
        `INSERT INTO mbambulaan.atlas_knowledge_nodes
         (id, kind, source_entity_id, label, territory_ids, attributes, confidence_score, observed_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,now())
         ON CONFLICT (id) DO UPDATE SET
           label=EXCLUDED.label,
           territory_ids=EXCLUDED.territory_ids,
           attributes=EXCLUDED.attributes,
           confidence_score=EXCLUDED.confidence_score,
           observed_at=EXCLUDED.observed_at,
           updated_at=now()`,
        [node.id, node.kind, node.sourceEntityId, node.label, node.territoryIds,
         JSON.stringify(node.attributes), node.confidenceScore, node.observedAt ?? null],
      );
    }
    for (const edge of input.edges) {
      await this.executor().query(
        `INSERT INTO mbambulaan.atlas_knowledge_edges
         (id, from_node_id, to_node_id, relation, weight, evidence_ids, valid_from, valid_until)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           weight=EXCLUDED.weight,
           evidence_ids=EXCLUDED.evidence_ids,
           valid_from=EXCLUDED.valid_from,
           valid_until=EXCLUDED.valid_until`,
        [edge.id, edge.fromNodeId, edge.toNodeId, edge.relation, edge.weight,
         edge.evidenceIds, edge.validFrom ?? null, edge.validUntil ?? null],
      );
    }
    for (const path of input.causalPaths) {
      await this.executor().query(
        `INSERT INTO mbambulaan.atlas_causal_paths
         (id, decision_domain, node_ids, edge_ids, explanation, confidence_score)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           node_ids=EXCLUDED.node_ids,
           edge_ids=EXCLUDED.edge_ids,
           explanation=EXCLUDED.explanation,
           confidence_score=EXCLUDED.confidence_score`,
        [path.id, path.decisionDomain, path.nodeIds, path.edgeIds, path.explanation, path.confidenceScore],
      );
    }
  }

  async saveDecisionAction(action: AtlasDecisionAction) {
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_decision_actions
       (id, workspace_id, scenario_id, briefing_id, action_type, target_entity_ids,
        assigned_actor_id, assigned_organization_id, territory_ids, due_at, status,
        runtime_event_id, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE SET
         assigned_actor_id=EXCLUDED.assigned_actor_id,
         assigned_organization_id=EXCLUDED.assigned_organization_id,
         due_at=EXCLUDED.due_at,
         status=EXCLUDED.status,
         runtime_event_id=EXCLUDED.runtime_event_id,
         updated_at=EXCLUDED.updated_at`,
      [action.id, action.workspaceId, action.scenarioId ?? null, action.briefingId ?? null,
       action.actionType, action.targetEntityIds, action.assignedActorId ?? null,
       action.assignedOrganizationId ?? null, action.territoryIds, action.dueAt ?? null,
       action.status, action.runtimeEventId ?? null, action.createdAt, action.updatedAt],
    );
  }

  async listDecisionActions(workspaceId: string) {
    const result = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_decision_actions WHERE workspace_id=$1 ORDER BY created_at DESC`,
      [workspaceId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      scenarioId: row.scenario_id ?? undefined,
      briefingId: row.briefing_id ?? undefined,
      actionType: row.action_type,
      targetEntityIds: row.target_entity_ids,
      assignedActorId: row.assigned_actor_id ?? undefined,
      assignedOrganizationId: row.assigned_organization_id ?? undefined,
      territoryIds: row.territory_ids,
      dueAt: row.due_at ?? undefined,
      status: row.status,
      runtimeEventId: row.runtime_event_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as AtlasDecisionAction));
  }

  private mapWorkspace(row: any): AtlasWorkspace {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      clientSegment: row.client_segment,
      territoryIds: row.territory_ids,
      decisionDomains: row.decision_domains,
      capabilityCodes: row.capability_codes,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  private mapQuestion(row: any): AtlasQuestion {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      askedByActorId: row.asked_by_actor_id,
      askedAt: row.asked_at,
      question: row.question,
      decisionDomain: row.decision_domain,
      territoryIds: row.territory_ids,
      horizon: row.horizon,
      objective: row.objective ?? undefined,
    };
  }

  private mapEvidence(row: any): AtlasEvidence {
    return {
      id: row.id,
      sourceType: row.source_type,
      sourceEntityId: row.source_entity_id,
      title: row.title,
      summary: row.summary,
      observedAt: row.observed_at ?? undefined,
      reliabilityScore: Number(row.reliability_score),
      freshnessScore: Number(row.freshness_score),
    };
  }

  private mapInsight(row: any): AtlasInsight {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      questionId: row.question_id ?? undefined,
      decisionDomain: row.decision_domain,
      title: row.title,
      statement: row.statement,
      implication: row.implication,
      evidenceIds: row.evidence_ids,
      confidenceScore: Number(row.confidence_score),
      urgency: row.urgency,
      generatedAt: row.generated_at,
    };
  }
}
