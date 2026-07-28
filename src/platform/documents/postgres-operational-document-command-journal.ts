import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { OperationalDocumentCommand } from "./operational-document-registry";

export interface OperationalDocumentCommandJournalEntry {
  commandId: string;
  actorIdentityId: string;
  territoryId: string;
  command: OperationalDocumentCommand;
  occurredAt: string;
}

export class PostgresOperationalDocumentCommandJournal {
  constructor(private readonly executor: () => SqlExecutor) {}

  async append(entry: OperationalDocumentCommandJournalEntry) {
    await this.executor().query(
      `INSERT INTO mbambulaan.operational_document_command_journal
       (command_id, actor_identity_id, territory_id, command_type, payload, occurred_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)
       ON CONFLICT (command_id) DO NOTHING`,
      [entry.commandId, entry.actorIdentityId, entry.territoryId, entry.command.type, JSON.stringify(entry.command), entry.occurredAt],
    );
  }

  async has(commandId: string) {
    const result = await this.executor().query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM mbambulaan.operational_document_command_journal WHERE command_id = $1
       ) AS exists`,
      [commandId],
    );
    return result.rows[0]?.exists ?? false;
  }

  async list(): Promise<OperationalDocumentCommandJournalEntry[]> {
    const result = await this.executor().query<{
      command_id: string;
      actor_identity_id: string;
      territory_id: string;
      payload: OperationalDocumentCommand;
      occurred_at: Date | string;
    }>(
      `SELECT command_id, actor_identity_id, territory_id, payload, occurred_at
       FROM mbambulaan.operational_document_command_journal
       ORDER BY sequence_id ASC`,
    );
    return result.rows.map((row) => ({
      commandId: row.command_id,
      actorIdentityId: row.actor_identity_id,
      territoryId: row.territory_id,
      command: row.payload,
      occurredAt: new Date(row.occurred_at).toISOString(),
    }));
  }
}
