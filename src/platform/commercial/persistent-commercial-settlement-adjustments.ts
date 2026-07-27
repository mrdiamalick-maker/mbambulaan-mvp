import type { DemoIdentity } from "@/platform/access/demo-access-control";
import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import { getRuntimeSqlExecutor, hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { getPersistentCommercialWorkflow } from "./persistent-commercial-workflow";
import { getPersistentCommercialIncidents } from "./persistent-commercial-incidents";
import { CommercialSettlementAdjustments, type SettlementAdjustmentType } from "./commercial-settlement-adjustments";

export type SettlementAdjustmentCommand =
  | { type: "request"; adjustmentId: string; orderId: string; adjustmentType: SettlementAdjustmentType; amountXof?: number; reason: string; incidentId?: string; targetOrganizationId?: string; replacementLogisticsOrganizationId?: string; at?: string }
  | { type: "approve"; adjustmentId: string; note: string; at?: string }
  | { type: "execute"; adjustmentId: string; reference: string; at?: string }
  | { type: "cancel"; adjustmentId: string; at?: string };

interface PersistedAdjustmentCommand {
  commandId: string;
  adjustmentId: string;
  actorIdentityId: string;
  organizationId: string;
  territoryId: string;
  command: SettlementAdjustmentCommand;
  occurredAt: string;
}

interface AdjustmentJournal {
  append(entry: PersistedAdjustmentCommand): Promise<void>;
  list(): Promise<PersistedAdjustmentCommand[]>;
}

class VolatileAdjustmentJournal implements AdjustmentJournal {
  private readonly entries: PersistedAdjustmentCommand[] = [];
  async append(entry: PersistedAdjustmentCommand) {
    if (!this.entries.some((item) => item.commandId === entry.commandId)) this.entries.push(structuredClone(entry));
  }
  async list() { return structuredClone(this.entries); }
}

class PostgresAdjustmentJournal implements AdjustmentJournal {
  constructor(private readonly executor: () => SqlExecutor) {}
  async append(entry: PersistedAdjustmentCommand) {
    await this.executor().query(
      `INSERT INTO mbambulaan.commercial_settlement_adjustment_journal
       (command_id,adjustment_id,command_type,actor_identity_id,organization_id,territory_id,payload,occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
       ON CONFLICT (command_id) DO NOTHING`,
      [entry.commandId, entry.adjustmentId, entry.command.type, entry.actorIdentityId, entry.organizationId,
       entry.territoryId, JSON.stringify(entry.command), entry.occurredAt],
    );
  }
  async list() {
    const result = await this.executor().query<{
      command_id: string; adjustment_id: string; actor_identity_id: string; organization_id: string;
      territory_id: string; payload: SettlementAdjustmentCommand; occurred_at: string;
    }>(`SELECT command_id,adjustment_id,actor_identity_id,organization_id,territory_id,payload,occurred_at
        FROM mbambulaan.commercial_settlement_adjustment_journal ORDER BY sequence_id ASC`);
    return result.rows.map((row) => ({
      commandId: row.command_id,
      adjustmentId: row.adjustment_id,
      actorIdentityId: row.actor_identity_id,
      organizationId: row.organization_id,
      territoryId: row.territory_id,
      command: row.payload,
      occurredAt: new Date(row.occurred_at).toISOString(),
    }));
  }
}

export class PersistentCommercialSettlementAdjustments {
  private readonly engine = new CommercialSettlementAdjustments();
  private hydrated = false;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly journal: AdjustmentJournal) {}

  async snapshot() {
    await this.hydrate();
    return this.engine.snapshot(await getPersistentCommercialWorkflow().snapshot());
  }

  async execute(input: { commandId: string; identity: DemoIdentity; territoryId: string; command: SettlementAdjustmentCommand }) {
    return this.serialized(async () => {
      await this.hydrate();
      validateRole(input.identity, input.command);
      const execution = await getPersistentCommercialWorkflow().snapshot();
      const incidents = await getPersistentCommercialIncidents().snapshot();
      const result = apply(this.engine, input.identity.organizationId, input.command, execution, incidents);
      try {
        await this.journal.append({
          commandId: input.commandId,
          adjustmentId: input.command.adjustmentId,
          actorIdentityId: input.identity.id,
          organizationId: input.identity.organizationId,
          territoryId: input.territoryId,
          command: input.command,
          occurredAt: input.command.at ?? new Date().toISOString(),
        });
      } catch (error) {
        this.hydrated = false;
        await this.hydrate();
        throw error;
      }
      return { result, snapshot: this.engine.snapshot(execution) };
    });
  }

  private async hydrate() {
    if (this.hydrated) return;
    this.engine.reset();
    const execution = await getPersistentCommercialWorkflow().snapshot();
    const incidents = await getPersistentCommercialIncidents().snapshot();
    for (const entry of await this.journal.list()) {
      apply(this.engine, entry.organizationId, entry.command, execution, incidents);
    }
    this.hydrated = true;
  }

  private serialized<T>(operation: () => Promise<T>) {
    const next = this.queue.then(operation, operation);
    this.queue = next.then(() => undefined, () => undefined);
    return next;
  }
}

function validateRole(identity: DemoIdentity, command: SettlementAdjustmentCommand) {
  if (command.type === "request" && !["buyer_operator", "cooperative_manager", "business_operator", "finance_officer"].includes(identity.roleCode)) {
    throw new Error("Ce profil ne peut pas demander un ajustement commercial.");
  }
  if ((command.type === "approve" || command.type === "execute") && identity.roleCode !== "finance_officer") {
    throw new Error("Seul le contrôle financier peut approuver ou exécuter un ajustement.");
  }
  if (command.type === "cancel" && !["finance_officer", "buyer_operator", "cooperative_manager"].includes(identity.roleCode)) {
    throw new Error("Ce profil ne peut pas annuler un ajustement.");
  }
}

function apply(
  engine: CommercialSettlementAdjustments,
  organizationId: string,
  command: SettlementAdjustmentCommand,
  execution: Awaited<ReturnType<ReturnType<typeof getPersistentCommercialWorkflow>["snapshot"]>>,
  incidents: Awaited<ReturnType<ReturnType<typeof getPersistentCommercialIncidents>["snapshot"]>>,
) {
  switch (command.type) {
    case "request":
      return engine.request({
        id: command.adjustmentId,
        orderId: command.orderId,
        type: command.adjustmentType,
        requestedByOrganizationId: organizationId,
        amountXof: command.amountXof,
        reason: command.reason,
        incidentId: command.incidentId,
        targetOrganizationId: command.targetOrganizationId,
        replacementLogisticsOrganizationId: command.replacementLogisticsOrganizationId,
        execution,
        incidents,
        at: command.at,
      });
    case "approve": return engine.approve({ adjustmentId: command.adjustmentId, note: command.note, at: command.at });
    case "execute": return engine.execute({ adjustmentId: command.adjustmentId, reference: command.reference, at: command.at });
    case "cancel": return engine.cancel({ adjustmentId: command.adjustmentId, at: command.at });
  }
}

declare global { var __mbambulaanPersistentSettlementAdjustments: PersistentCommercialSettlementAdjustments | undefined; }
export function getPersistentCommercialSettlementAdjustments() {
  globalThis.__mbambulaanPersistentSettlementAdjustments ??= new PersistentCommercialSettlementAdjustments(
    hasRuntimeDatabase() ? new PostgresAdjustmentJournal(getRuntimeSqlExecutor) : new VolatileAdjustmentJournal(),
  );
  return globalThis.__mbambulaanPersistentSettlementAdjustments;
}
