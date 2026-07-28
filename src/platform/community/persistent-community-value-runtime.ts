import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { CommunityValueLoopRuntime, type CommunityCommand } from "./community-value-loop-runtime";
import { PostgresCommunityValueCommandJournal } from "./postgres-community-value-command-journal";

export class PersistentCommunityValueRuntime {
  private runtime = new CommunityValueLoopRuntime();
  private hydrated = false;
  private readonly journal = new PostgresCommunityValueCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: CommunityCommand; occurredAt?: string }) {
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
    const restored = new CommunityValueLoopRuntime();
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

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentCommunityValueRuntime?: PersistentCommunityValueRuntime };

export function getPersistentCommunityValueRuntime() {
  globalRuntime.__mbPersistentCommunityValueRuntime ??= new PersistentCommunityValueRuntime();
  return globalRuntime.__mbPersistentCommunityValueRuntime;
}
