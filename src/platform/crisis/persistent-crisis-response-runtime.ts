import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { EcosystemCrisisResponseRuntime, type CrisisCommand } from "./ecosystem-crisis-response-runtime";
import { PostgresCrisisResponseCommandJournal } from "./postgres-crisis-response-command-journal";

export class PersistentCrisisResponseRuntime {
  private runtime = new EcosystemCrisisResponseRuntime();
  private hydrated = false;
  private readonly journal = new PostgresCrisisResponseCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: CrisisCommand; occurredAt?: string }) {
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
    const restored = new EcosystemCrisisResponseRuntime();
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

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentCrisisResponseRuntime?: PersistentCrisisResponseRuntime };
export function getPersistentCrisisResponseRuntime() {
  globalRuntime.__mbPersistentCrisisResponseRuntime ??= new PersistentCrisisResponseRuntime();
  return globalRuntime.__mbPersistentCrisisResponseRuntime;
}
