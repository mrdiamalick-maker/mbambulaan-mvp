import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { InterterritorialCapacityCoordination } from "./interterritorial-capacity-coordination";
import { PostgresCrisisCapacityTransferCommandJournal, type CrisisCapacityTransferCommand } from "./postgres-crisis-capacity-transfer-command-journal";

export class PersistentInterterritorialCapacityCoordination {
  private runtime = new InterterritorialCapacityCoordination();
  private hydrated = false;
  private readonly journal = new PostgresCrisisCapacityTransferCommandJournal(getRuntimeSqlExecutor);

  async execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: CrisisCapacityTransferCommand; occurredAt?: string }) {
    await this.hydrate();
    const result = this.apply(input.command);
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

  private apply(command: CrisisCapacityTransferCommand) {
    switch (command.type) {
      case "register_offer": return this.runtime.registerOffer(command.offer);
      case "plan_transfer": return this.runtime.planTransfer(command.transfer);
      case "confirm_departure": return this.runtime.confirmDeparture(command);
      case "confirm_reception": return this.runtime.confirmReception({
        transferId: command.transferId,
        receptionDocumentIds: command.receptionDocumentIds,
        receivedAt: command.receivedAt,
        commandId: command.crisisCommandId,
      });
    }
  }

  private async hydrate() {
    if (this.hydrated) return;
    const restored = new InterterritorialCapacityCoordination();
    this.runtime = restored;
    for (const entry of await this.journal.list()) this.apply(entry.command);
    this.hydrated = true;
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbPersistentCapacityCoordination?: PersistentInterterritorialCapacityCoordination };
export function getPersistentInterterritorialCapacityCoordination() {
  globalThis.__mbPersistentCapacityCoordination ??= new PersistentInterterritorialCapacityCoordination();
  return globalThis.__mbPersistentCapacityCoordination;
}
