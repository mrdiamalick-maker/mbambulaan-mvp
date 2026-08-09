import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { InterterritorialTransfer, TerritoryCapacityOffer } from "./interterritorial-capacity-coordination";

export type CrisisCapacityTransferCommand =
  | { type: "register_offer"; offer: TerritoryCapacityOffer }
  | { type: "plan_transfer"; transfer: InterterritorialTransfer }
  | { type: "confirm_departure"; transferId: string; departureDocumentIds: string[]; departedAt: string }
  | { type: "confirm_reception"; transferId: string; receptionDocumentIds: string[]; receivedAt: string; crisisCommandId: string };

export interface PersistedCrisisCapacityTransferCommand {
  commandId: string;
  actorIdentityId: string;
  territoryId: string;
  command: CrisisCapacityTransferCommand;
  occurredAt: string;
}

export class PostgresCrisisCapacityTransferCommandJournal {
  constructor(private readonly executor: () => SqlExecutor) {}

  async append(entry: PersistedCrisisCapacityTransferCommand) {
    await this.executor().query(
      `INSERT INTO mbambulaan.crisis_capacity_transfer_command_journal
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
      payload: CrisisCapacityTransferCommand;
      occurred_at: string;
    }>(
      `SELECT command_id, actor_identity_id, territory_id, payload, occurred_at
       FROM mbambulaan.crisis_capacity_transfer_command_journal
       ORDER BY sequence_id ASC`,
    );
    return result.rows.map((row) => ({
      commandId: row.command_id,
      actorIdentityId: row.actor_identity_id,
      territoryId: row.territory_id,
      command: row.payload,
      occurredAt: row.occurred_at,
    } satisfies PersistedCrisisCapacityTransferCommand));
  }
}
