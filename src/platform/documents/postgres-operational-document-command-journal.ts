import { sql } from "@/platform/persistence/postgres-runtime-pool";
import type { OperationalDocumentCommand } from "./operational-document-registry";

export interface OperationalDocumentCommandJournalEntry {
  commandId: string;
  actorIdentityId: string;
  territoryId: string;
  command: OperationalDocumentCommand;
  occurredAt: string;
}

export class PostgresOperationalDocumentCommandJournal {
  async append(entry: OperationalDocumentCommandJournalEntry) {
    await sql`
      INSERT INTO mbambulaan.operational_document_command_journal (
        command_id,
        actor_identity_id,
        territory_id,
        command_type,
        payload,
        occurred_at
      ) VALUES (
        ${entry.commandId},
        ${entry.actorIdentityId},
        ${entry.territoryId},
        ${entry.command.type},
        ${JSON.stringify(entry.command)}::jsonb,
        ${entry.occurredAt}
      )
      ON CONFLICT (command_id) DO NOTHING
    `;
  }

  async has(commandId: string) {
    const rows = await sql<{ exists: boolean }>`
      SELECT EXISTS(
        SELECT 1
        FROM mbambulaan.operational_document_command_journal
        WHERE command_id = ${commandId}
      ) AS exists
    `;
    return rows[0]?.exists ?? false;
  }

  async list(): Promise<OperationalDocumentCommandJournalEntry[]> {
    const rows = await sql<{
      command_id: string;
      actor_identity_id: string;
      territory_id: string;
      payload: OperationalDocumentCommand;
      occurred_at: Date | string;
    }>`
      SELECT command_id, actor_identity_id, territory_id, payload, occurred_at
      FROM mbambulaan.operational_document_command_journal
      ORDER BY sequence_id ASC
    `;
    return rows.map((row) => ({
      commandId: row.command_id,
      actorIdentityId: row.actor_identity_id,
      territoryId: row.territory_id,
      command: row.payload,
      occurredAt: new Date(row.occurred_at).toISOString(),
    }));
  }
}
