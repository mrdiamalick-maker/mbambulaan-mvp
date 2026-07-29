import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { EthicalFinanceRuntime, type EthicalFinanceCommand } from "./ethical-finance-runtime";
import { PostgresEthicalFinanceCommandJournal } from "./postgres-ethical-finance-command-journal";

export class PersistentEthicalFinanceRuntime {
  private runtime = new EthicalFinanceRuntime();
  private hydrated = false;
  private readonly journal = new PostgresEthicalFinanceCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: EthicalFinanceCommand; occurredAt?: string }) {
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

  async snapshot() {
    await this.hydrate();
    return this.runtime.snapshot();
  }

  private async hydrate() {
    if (this.hydrated) return;
    const restored = new EthicalFinanceRuntime();
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

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentEthicalFinanceRuntime?: PersistentEthicalFinanceRuntime };
export function getPersistentEthicalFinanceRuntime() {
  globalRuntime.__mbPersistentEthicalFinanceRuntime ??= new PersistentEthicalFinanceRuntime();
  return globalRuntime.__mbPersistentEthicalFinanceRuntime;
}
