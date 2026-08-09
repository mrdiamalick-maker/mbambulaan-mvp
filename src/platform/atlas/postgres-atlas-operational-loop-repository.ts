import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { AtlasOperationalDecision, AtlasOperationalResult } from "./atlas-operational-loop";

export class PostgresAtlasOperationalLoopRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async saveDecision(decision: AtlasOperationalDecision) {
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_operational_decisions
       (id, scenario_id, workspace_id, approved_by_actor_id, territory_id, status, approved_at, completed_at, work_item_ids, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,now())
       ON CONFLICT (id) DO UPDATE SET
         status=EXCLUDED.status,
         completed_at=EXCLUDED.completed_at,
         work_item_ids=EXCLUDED.work_item_ids,
         updated_at=now()`,
      [decision.id, decision.scenarioId, decision.workspaceId, decision.approvedByActorId,
       decision.territoryId, decision.status, decision.approvedAt, decision.completedAt ?? null,
       JSON.stringify(decision.workItemIds)],
    );
  }

  async saveResult(result: AtlasOperationalResult) {
    await this.executor().query(
      `INSERT INTO mbambulaan.atlas_operational_results
       (id, decision_id, scenario_id, territory_id, completed_work_items, evidence_ids, summary, observed_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)
       ON CONFLICT (decision_id) DO UPDATE SET
         completed_work_items=EXCLUDED.completed_work_items,
         evidence_ids=EXCLUDED.evidence_ids,
         summary=EXCLUDED.summary,
         observed_at=EXCLUDED.observed_at`,
      [result.id, result.decisionId, result.scenarioId, result.territoryId,
       result.completedWorkItems, JSON.stringify(result.evidenceIds), result.summary, result.observedAt],
    );
  }

  async listDecisions() {
    const rows = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_operational_decisions ORDER BY approved_at DESC`,
    );
    return rows.rows.map((row) => ({
      id: row.id,
      scenarioId: row.scenario_id,
      workspaceId: row.workspace_id,
      approvedByActorId: row.approved_by_actor_id,
      territoryId: row.territory_id,
      status: row.status,
      approvedAt: row.approved_at,
      completedAt: row.completed_at ?? undefined,
      workItemIds: row.work_item_ids,
    } satisfies AtlasOperationalDecision));
  }

  async listResults() {
    const rows = await this.executor().query<any>(
      `SELECT * FROM mbambulaan.atlas_operational_results ORDER BY observed_at DESC`,
    );
    return rows.rows.map((row) => ({
      id: row.id,
      decisionId: row.decision_id,
      scenarioId: row.scenario_id,
      territoryId: row.territory_id,
      completedWorkItems: Number(row.completed_work_items),
      evidenceIds: row.evidence_ids,
      observedAt: row.observed_at,
      summary: row.summary,
    } satisfies AtlasOperationalResult));
  }
}
