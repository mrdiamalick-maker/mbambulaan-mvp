import type { DemoIdentity } from "@/platform/access/demo-access-control";
import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import { getRuntimeSqlExecutor, hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import type { CommercialExecutionSnapshot } from "./commercial-financial-execution";
import { getPersistentCommercialWorkflow } from "./persistent-commercial-workflow";
import { CommercialIncidentManagement, type CommercialIncidentType } from "./commercial-incident-management";

export type CommercialIncidentCommand =
  | { type: "open"; incidentId: string; orderId: string; incidentType: CommercialIncidentType; description: string; at?: string }
  | { type: "assess"; incidentId: string; deliveredQuantityKg?: number; acceptedQuantityKg?: number; logisticsPenaltyXof?: number; platformGoodwillXof?: number; replacementLogisticsOrganizationId?: string; note: string; at?: string }
  | { type: "resolve"; incidentId: string; note: string; at?: string };

interface PersistedIncidentCommand {
  commandId: string;
  incidentId: string;
  actorIdentityId: string;
  organizationId: string;
  territoryId: string;
  command: CommercialIncidentCommand;
  occurredAt: string;
}

interface IncidentJournal {
  append(entry: PersistedIncidentCommand): Promise<void>;
  list(): Promise<PersistedIncidentCommand[]>;
}

class VolatileIncidentJournal implements IncidentJournal {
  private readonly entries: PersistedIncidentCommand[] = [];
  async append(entry: PersistedIncidentCommand) {
    if (!this.entries.some((item) => item.commandId === entry.commandId)) this.entries.push(structuredClone(entry));
  }
  async list() { return structuredClone(this.entries); }
}

class PostgresIncidentJournal implements IncidentJournal {
  constructor(private readonly executor: () => SqlExecutor) {}
  async append(entry: PersistedIncidentCommand) {
    await this.executor().query(
      `INSERT INTO mbambulaan.commercial_incident_journal
       (command_id,incident_id,command_type,actor_identity_id,organization_id,territory_id,payload,occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
       ON CONFLICT (command_id) DO NOTHING`,
      [entry.commandId, entry.incidentId, entry.command.type, entry.actorIdentityId, entry.organizationId,
       entry.territoryId, JSON.stringify(entry.command), entry.occurredAt],
    );
  }
  async list() {
    const result = await this.executor().query<{
      command_id: string; incident_id: string; actor_identity_id: string; organization_id: string;
      territory_id: string; payload: CommercialIncidentCommand; occurred_at: string;
    }>(`SELECT command_id,incident_id,actor_identity_id,organization_id,territory_id,payload,occurred_at
        FROM mbambulaan.commercial_incident_journal ORDER BY sequence_id ASC`);
    return result.rows.map((row) => ({
      commandId: row.command_id, incidentId: row.incident_id, actorIdentityId: row.actor_identity_id,
      organizationId: row.organization_id, territoryId: row.territory_id, command: row.payload,
      occurredAt: new Date(row.occurred_at).toISOString(),
    }));
  }
}

export class PersistentCommercialIncidents {
  private readonly engine = new CommercialIncidentManagement();
  private hydrated = false;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly journal: IncidentJournal) {}

  async snapshot() {
    await this.hydrate();
    return this.engine.snapshot(await getPersistentCommercialWorkflow().snapshot());
  }

  async execute(input: { commandId: string; identity: DemoIdentity; territoryId: string; command: CommercialIncidentCommand }) {
    return this.serialized(async () => {
      await this.hydrate();
      validateRole(input.identity, input.command);
      const execution = await getPersistentCommercialWorkflow().snapshot();
      const result = apply(this.engine, input.identity, input.command, execution);
      try {
        await this.journal.append({
          commandId: input.commandId, incidentId: input.command.incidentId,
          actorIdentityId: input.identity.id, organizationId: input.identity.organizationId,
          territoryId: input.territoryId, command: input.command,
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
    for (const entry of await this.journal.list()) {
      apply(this.engine, { organizationId: entry.organizationId } as DemoIdentity, entry.command, execution);
    }
    this.hydrated = true;
  }

  private serialized<T>(operation: () => Promise<T>) {
    const next = this.queue.then(operation, operation);
    this.queue = next.then(() => undefined, () => undefined);
    return next;
  }
}

function validateRole(identity: DemoIdentity, command: CommercialIncidentCommand) {
  if (command.type === "open" && !["buyer_operator", "business_operator", "cooperative_manager"].includes(identity.roleCode)) {
    throw new Error("Ce profil ne peut pas ouvrir un incident commercial.");
  }
  if ((command.type === "assess" || command.type === "resolve") && identity.roleCode !== "finance_officer") {
    throw new Error("Seul le contrôle financier peut évaluer ou résoudre un incident.");
  }
}

function apply(engine: CommercialIncidentManagement, identity: DemoIdentity, command: CommercialIncidentCommand, execution: CommercialExecutionSnapshot) {
  switch (command.type) {
    case "open": return engine.open({
      id: command.incidentId, orderId: command.orderId, type: command.incidentType,
      openedByOrganizationId: identity.organizationId, description: command.description,
      execution, at: command.at,
    });
    case "assess": return engine.assess({
      incidentId: command.incidentId, execution, deliveredQuantityKg: command.deliveredQuantityKg,
      acceptedQuantityKg: command.acceptedQuantityKg, logisticsPenaltyXof: command.logisticsPenaltyXof,
      platformGoodwillXof: command.platformGoodwillXof,
      replacementLogisticsOrganizationId: command.replacementLogisticsOrganizationId,
      note: command.note, at: command.at,
    });
    case "resolve": return engine.resolve({ incidentId: command.incidentId, note: command.note, at: command.at });
  }
}

declare global { var __mbambulaanPersistentCommercialIncidents: PersistentCommercialIncidents | undefined; }
export function getPersistentCommercialIncidents() {
  globalThis.__mbambulaanPersistentCommercialIncidents ??= new PersistentCommercialIncidents(
    hasRuntimeDatabase() ? new PostgresIncidentJournal(getRuntimeSqlExecutor) : new VolatileIncidentJournal(),
  );
  return globalThis.__mbambulaanPersistentCommercialIncidents;
}
