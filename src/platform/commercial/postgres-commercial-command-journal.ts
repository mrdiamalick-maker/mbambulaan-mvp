import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { CommercialActorKind, CommercialWorkflowCommand } from "./commercial-actor-workflow";

export interface PersistedCommercialCommand {
  commandId: string;
  actorKind: CommercialActorKind;
  actorIdentityId: string;
  organizationId: string;
  territoryId: string;
  command: CommercialWorkflowCommand;
  occurredAt: string;
}

export class PostgresCommercialCommandJournal {
  constructor(private readonly executor: () => SqlExecutor) {}

  async append(entry: PersistedCommercialCommand) {
    await this.executor().query(
      `INSERT INTO mbambulaan.commercial_command_journal
       (command_id, actor_kind, actor_identity_id, organization_id, territory_id, command_type, payload, occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
       ON CONFLICT (command_id) DO NOTHING`,
      [
        entry.commandId,
        entry.actorKind,
        entry.actorIdentityId,
        entry.organizationId,
        entry.territoryId,
        entry.command.type,
        JSON.stringify(entry.command),
        entry.occurredAt,
      ],
    );
  }

  async list() {
    const result = await this.executor().query<{
      command_id: string;
      actor_kind: CommercialActorKind;
      actor_identity_id: string;
      organization_id: string;
      territory_id: string;
      payload: CommercialWorkflowCommand;
      occurred_at: string;
    }>(
      `SELECT command_id, actor_kind, actor_identity_id, organization_id, territory_id, payload, occurred_at
       FROM mbambulaan.commercial_command_journal
       ORDER BY sequence_id ASC`,
    );
    return result.rows.map((row) => ({
      commandId: row.command_id,
      actorKind: row.actor_kind,
      actorIdentityId: row.actor_identity_id,
      organizationId: row.organization_id,
      territoryId: row.territory_id,
      command: row.payload,
      occurredAt: row.occurred_at,
    } satisfies PersistedCommercialCommand));
  }
}
