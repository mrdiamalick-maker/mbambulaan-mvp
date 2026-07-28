import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { OperationalDocumentRegistry, type OperationalDocumentCommand } from "./operational-document-registry";
import { PostgresOperationalDocumentCommandJournal } from "./postgres-operational-document-command-journal";

export class PersistentOperationalDocumentRegistry {
  private runtime = new OperationalDocumentRegistry();
  private hydrated = false;
  private readonly journal = new PostgresOperationalDocumentCommandJournal(getRuntimeSqlExecutor);

  async execute(input: {
    commandId: string;
    actorId: string;
    activeTerritoryId: string;
    command: OperationalDocumentCommand;
    occurredAt?: string;
  }) {
    await this.hydrate();
    if (await this.journal.has(input.commandId)) {
      return this.runtime.execute(input);
    }
    const result = this.runtime.execute(input);
    await this.journal.append({
      commandId: input.commandId,
      actorIdentityId: input.actorId,
      territoryId: input.activeTerritoryId,
      command: input.command,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
    });
    return result;
  }

  async snapshot(at?: string) {
    await this.hydrate();
    return this.runtime.snapshot(at);
  }

  private async hydrate() {
    if (this.hydrated) return;
    const restored = new OperationalDocumentRegistry();
    for (const entry of await this.journal.list()) {
      restored.execute({
        commandId: entry.commandId,
        actorId: entry.actorIdentityId,
        activeTerritoryId: entry.territoryId,
        command: entry.command,
      });
    }
    this.runtime = restored;
    this.hydrated = true;
  }
}

const globalRuntime = globalThis as typeof globalThis & {
  __mbPersistentOperationalDocumentRegistry?: PersistentOperationalDocumentRegistry;
};

export function getPersistentOperationalDocumentRegistry() {
  globalRuntime.__mbPersistentOperationalDocumentRegistry ??= new PersistentOperationalDocumentRegistry();
  return globalRuntime.__mbPersistentOperationalDocumentRegistry;
}
