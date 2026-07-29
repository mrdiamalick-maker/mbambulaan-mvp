import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { OperationalContractRuntime, type OperationalContractCommand } from "./operational-contract-runtime";
import { PostgresOperationalContractCommandJournal } from "./postgres-operational-contract-command-journal";

type OperationalContractExecutionResult = ReturnType<OperationalContractRuntime["execute"]>;

export class PersistentOperationalContractRuntime {
  private runtime = new OperationalContractRuntime();
  private hydrated = false;
  private readonly journal = new PostgresOperationalContractCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: OperationalContractCommand; occurredAt?: string }): Promise<OperationalContractExecutionResult> {
    await this.hydrate();
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

  async snapshot(at?: string): Promise<ReturnType<OperationalContractRuntime["snapshot"]>> {
    await this.hydrate();
    return this.runtime.snapshot(at);
  }

  private async hydrate() {
    if (this.hydrated) return;
    const restored = new OperationalContractRuntime();
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

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentOperationalContractRuntime?: PersistentOperationalContractRuntime };
export function getPersistentOperationalContractRuntime() {
  globalRuntime.__mbPersistentOperationalContractRuntime ??= new PersistentOperationalContractRuntime();
  return globalRuntime.__mbPersistentOperationalContractRuntime;
}
