import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { EthicalFinanceCommand } from "./ethical-finance-runtime";

export interface PersistedEthicalFinanceCommand {
  commandId: string;
  actorIdentityId: string;
  territoryId: string;
  command: EthicalFinanceCommand;
  occurredAt: string;
}

export class PostgresEthicalFinanceCommandJournal {
  constructor(private readonly executor: () => SqlExecutor) {}

  async append(entry: PersistedEthicalFinanceCommand) {
    await this.executor().query(
      `INSERT INTO mbambulaan.ethical_finance_command_journal
       (command_id, actor_identity_id, territory_id, command_type, payload, occurred_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)
       ON CONFLICT (command_id) DO NOTHING`,
      [entry.commandId, entry.actorIdentityId, entry.territoryId, entry.command.type, JSON.stringify(entry.command), entry.occurredAt],
    );
  }

  async list() {
    const result = await this.executor().query<{
      command_id: string;
      actor_identity_id: string;
      territory_id: string;
      payload: EthicalFinanceCommand;
      occurred_at: string;
    }>(
      `SELECT command_id, actor_identity_id, territory_id, payload, occurred_at
       FROM mbambulaan.ethical_finance_command_journal
       ORDER BY sequence_id ASC`,
    );
    return result.rows.map((row) => ({
      commandId: row.command_id,
      actorIdentityId: row.actor_identity_id,
      territoryId: row.territory_id,
      command: row.payload,
      occurredAt: row.occurred_at,
    } satisfies PersistedEthicalFinanceCommand));
  }
}
