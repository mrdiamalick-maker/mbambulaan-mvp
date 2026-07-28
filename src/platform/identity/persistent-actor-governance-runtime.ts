import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { EcosystemActorGovernanceRuntime, type ActorGovernanceCommand } from "./ecosystem-actor-governance-runtime";
import { PostgresActorGovernanceCommandJournal } from "./postgres-actor-governance-command-journal";

export class PersistentActorGovernanceRuntime {
  private runtime = new EcosystemActorGovernanceRuntime();
  private hydrated = false;
  private readonly journal = new PostgresActorGovernanceCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: ActorGovernanceCommand; occurredAt?: string }) {
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
    const restored = new EcosystemActorGovernanceRuntime();
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

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentActorGovernanceRuntime?: PersistentActorGovernanceRuntime };
export function getPersistentActorGovernanceRuntime() {
  globalRuntime.__mbPersistentActorGovernanceRuntime ??= new PersistentActorGovernanceRuntime();
  return globalRuntime.__mbPersistentActorGovernanceRuntime;
}
