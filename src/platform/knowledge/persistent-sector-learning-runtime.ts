import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { PostgresSectorLearningCommandJournal } from "./postgres-sector-learning-command-journal";
import { SectorLearningRuntime, type SectorLearningCommand } from "./sector-learning-runtime";

export class PersistentSectorLearningRuntime {
  private runtime = new SectorLearningRuntime();
  private hydrated = false;
  private readonly journal = new PostgresSectorLearningCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: SectorLearningCommand; occurredAt?: string }) {
    await this.hydrate();
    const result = this.runtime.execute({
      commandId: input.commandId,
      actorId: input.actorId,
      activeTerritoryId: input.activeTerritoryId,
      command: input.command,
    });
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
    const entries = await this.journal.list();
    const restored = new SectorLearningRuntime();
    for (const entry of entries) {
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

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentSectorLearningRuntime?: PersistentSectorLearningRuntime };

export function getPersistentSectorLearningRuntime() {
  globalRuntime.__mbPersistentSectorLearningRuntime ??= new PersistentSectorLearningRuntime();
  return globalRuntime.__mbPersistentSectorLearningRuntime;
}
