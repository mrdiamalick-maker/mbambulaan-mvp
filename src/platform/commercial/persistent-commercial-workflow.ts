import type { DemoIdentity } from "@/platform/access/demo-access-control";
import { getRuntimeSqlExecutor, hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { CommercialActorWorkflow, type CommercialActorKind, type CommercialWorkflowCommand } from "./commercial-actor-workflow";
import { getCommercialFinancialExecution, resetCommercialFinancialExecution } from "./commercial-financial-registry";
import { PostgresCommercialCommandJournal, type PersistedCommercialCommand } from "./postgres-commercial-command-journal";

export interface CommercialCommandJournal {
  append(entry: PersistedCommercialCommand): Promise<void>;
  list(): Promise<PersistedCommercialCommand[]>;
}

class VolatileCommercialCommandJournal implements CommercialCommandJournal {
  private readonly entries: PersistedCommercialCommand[] = [];
  async append(entry: PersistedCommercialCommand) {
    if (!this.entries.some((item) => item.commandId === entry.commandId)) this.entries.push(structuredClone(entry));
  }
  async list() { return structuredClone(this.entries); }
}

export class PersistentCommercialWorkflow {
  private readonly workflow = new CommercialActorWorkflow();
  private hydrated = false;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly journal: CommercialCommandJournal) {}

  async snapshot() {
    await this.hydrate();
    return getCommercialFinancialExecution().snapshot();
  }

  async execute(input: {
    commandId: string;
    identity: DemoIdentity;
    territoryId: string;
    actorKind?: CommercialActorKind;
    command: CommercialWorkflowCommand;
  }) {
    return this.serialized(async () => {
      await this.hydrate();
      const actorKind = input.actorKind ?? actorKindForIdentity(input.identity);
      validateCommandOwnership(input.identity, actorKind, input.command);
      const snapshot = this.workflow.execute(actorKind, input.command);
      try {
        await this.journal.append({
          commandId: input.commandId,
          actorKind,
          actorIdentityId: input.identity.id,
          organizationId: input.identity.organizationId,
          territoryId: input.territoryId,
          command: input.command,
          occurredAt: commandOccurredAt(input.command),
        });
      } catch (error) {
        this.hydrated = false;
        await this.hydrate();
        throw error;
      }
      return snapshot;
    });
  }

  private async hydrate() {
    if (this.hydrated) return;
    resetCommercialFinancialExecution();
    const entries = await this.journal.list();
    for (const entry of entries) this.workflow.execute(entry.actorKind, entry.command);
    this.hydrated = true;
  }

  private serialized<T>(operation: () => Promise<T>) {
    const next = this.queue.then(operation, operation);
    this.queue = next.then(() => undefined, () => undefined);
    return next;
  }
}

function actorKindForIdentity(identity: DemoIdentity): CommercialActorKind {
  switch (identity.roleCode) {
    case "cooperative_manager": return "seller";
    case "buyer_operator": return "buyer";
    case "business_operator": return "logistics";
    case "finance_officer": return "finance";
    default: throw new Error(`Le profil ${identity.roleCode} n'est pas un acteur commercial d'exécution.`);
  }
}

function validateCommandOwnership(identity: DemoIdentity, actorKind: CommercialActorKind, command: CommercialWorkflowCommand) {
  if (actorKind === "seller" && command.type === "publish_offer" && command.sellerOrganizationId !== identity.organizationId) {
    throw new Error("Le vendeur ne peut publier une offre que pour sa propre organisation.");
  }
  if (actorKind === "buyer" && command.type === "place_order" && command.buyerOrganizationId !== identity.organizationId) {
    throw new Error("L'acheteur ne peut commander que pour sa propre organisation.");
  }
  if (actorKind === "buyer" && command.type === "request_payment" && command.payerOrganizationId && command.payerOrganizationId !== identity.organizationId) {
    throw new Error("L'acheteur ne peut payer que pour sa propre organisation.");
  }
  if ((actorKind === "seller" || actorKind === "buyer") && command.type === "open_dispute" && command.openedByOrganizationId !== identity.organizationId) {
    throw new Error("Un litige doit être ouvert au nom de l'organisation connectée.");
  }
}

function commandOccurredAt(command: CommercialWorkflowCommand) {
  return "at" in command && command.at ? command.at : new Date().toISOString();
}

declare global {
  var __mbambulaanPersistentCommercialWorkflow: PersistentCommercialWorkflow | undefined;
}

export function getPersistentCommercialWorkflow() {
  if (!globalThis.__mbambulaanPersistentCommercialWorkflow) {
    const journal: CommercialCommandJournal = hasRuntimeDatabase()
      ? new PostgresCommercialCommandJournal(getRuntimeSqlExecutor)
      : new VolatileCommercialCommandJournal();
    globalThis.__mbambulaanPersistentCommercialWorkflow = new PersistentCommercialWorkflow(journal);
  }
  return globalThis.__mbambulaanPersistentCommercialWorkflow;
}
