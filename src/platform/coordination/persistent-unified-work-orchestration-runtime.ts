import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { PostgresUnifiedWorkCommandJournal } from "./postgres-unified-work-command-journal";
import { UnifiedWorkOrchestrationRuntime, type UnifiedWorkCommand } from "./unified-work-orchestration-runtime";

export class PersistentUnifiedWorkOrchestrationRuntime {
  private runtime = new UnifiedWorkOrchestrationRuntime();
  private hydrated = false;
  private readonly journal = new PostgresUnifiedWorkCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: UnifiedWorkCommand; occurredAt?: string }) {
    await this.hydrate();
    const result = this.runtime.execute({ commandId: input.commandId, command: input.command });
    await this.journal.append({
      commandId: input.commandId,
      actorIdentityId: input.actorId,
      territoryId: input.activeTerritoryId,
      command: input.command,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
    });
    return result;
  }

  async planNotifications(at: string) {
    await this.hydrate();
    return this.runtime.planNotifications(at);
  }

  async snapshot(at?: string) {
    await this.hydrate();
    return this.runtime.snapshot(at);
  }

  private async hydrate() {
    if (this.hydrated) return;
    const restored = new UnifiedWorkOrchestrationRuntime();
    for (const entry of await this.journal.list()) {
      restored.execute({ commandId: entry.commandId, command: entry.command });
    }
    this.runtime = restored;
    this.hydrated = true;
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentUnifiedWorkRuntime?: PersistentUnifiedWorkOrchestrationRuntime };
export function getPersistentUnifiedWorkOrchestrationRuntime() {
  globalRuntime.__mbPersistentUnifiedWorkRuntime ??= new PersistentUnifiedWorkOrchestrationRuntime();
  return globalRuntime.__mbPersistentUnifiedWorkRuntime;
}
