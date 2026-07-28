import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { RequiredDocumentRule } from "./document-work-queue-projector";

export class PostgresRequiredDocumentRuleRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async upsert(rule: RequiredDocumentRule) {
    await this.executor().query(
      `INSERT INTO mbambulaan.required_document_rule (
        rule_id, related_entity_type, related_entity_id, required_document_types,
        responsible_organization_id, responsible_actor_id, territory_id,
        due_at, reason, status, updated_at
      ) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9,'active',NOW())
      ON CONFLICT (rule_id) DO UPDATE SET
        related_entity_type = EXCLUDED.related_entity_type,
        related_entity_id = EXCLUDED.related_entity_id,
        required_document_types = EXCLUDED.required_document_types,
        responsible_organization_id = EXCLUDED.responsible_organization_id,
        responsible_actor_id = EXCLUDED.responsible_actor_id,
        territory_id = EXCLUDED.territory_id,
        due_at = EXCLUDED.due_at,
        reason = EXCLUDED.reason,
        status = 'active',
        updated_at = NOW()`,
      [
        rule.id,
        rule.relatedEntityType,
        rule.relatedEntityId,
        JSON.stringify(rule.requiredDocumentTypes),
        rule.responsibleOrganizationId,
        rule.responsibleActorId ?? null,
        rule.territoryId,
        rule.dueAt,
        rule.reason,
      ],
    );
    return structuredClone(rule);
  }

  async deactivate(ruleId: string) {
    await this.executor().query(
      `UPDATE mbambulaan.required_document_rule
       SET status = 'inactive', updated_at = NOW()
       WHERE rule_id = $1`,
      [ruleId],
    );
  }

  async listActive(input?: { territoryId?: string; relatedEntityType?: string; relatedEntityId?: string }) {
    const clauses = ["status = 'active'"];
    const values: unknown[] = [];
    const add = (clause: string, value: unknown) => {
      values.push(value);
      clauses.push(clause.replace("?", `$${values.length}`));
    };
    if (input?.territoryId) add("territory_id = ?", input.territoryId);
    if (input?.relatedEntityType) add("related_entity_type = ?", input.relatedEntityType);
    if (input?.relatedEntityId) add("related_entity_id = ?", input.relatedEntityId);

    const result = await this.executor().query<{
      rule_id: string;
      related_entity_type: RequiredDocumentRule["relatedEntityType"];
      related_entity_id: string;
      required_document_types: RequiredDocumentRule["requiredDocumentTypes"];
      responsible_organization_id: string;
      responsible_actor_id: string | null;
      territory_id: string;
      due_at: Date | string;
      reason: string;
    }>(
      `SELECT rule_id, related_entity_type, related_entity_id, required_document_types,
              responsible_organization_id, responsible_actor_id, territory_id, due_at, reason
       FROM mbambulaan.required_document_rule
       WHERE ${clauses.join(" AND ")}
       ORDER BY due_at ASC, rule_id ASC`,
      values,
    );

    return result.rows.map((row) => ({
      id: row.rule_id,
      relatedEntityType: row.related_entity_type,
      relatedEntityId: row.related_entity_id,
      requiredDocumentTypes: row.required_document_types,
      responsibleOrganizationId: row.responsible_organization_id,
      responsibleActorId: row.responsible_actor_id ?? undefined,
      territoryId: row.territory_id,
      dueAt: new Date(row.due_at).toISOString(),
      reason: row.reason,
    } satisfies RequiredDocumentRule));
  }
}
