import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import type { EcosystemBusinessEvent } from "./ecosystem-business-event-bus";
import { NationalCoordinationSignalProjection } from "./national-coordination-signal-projection";
import { PostgresNationalCoordinationSignalRepository } from "./postgres-national-coordination-signal-repository";

export class PersistentNationalCoordinationSignalService {
  private readonly projection = new NationalCoordinationSignalProjection();
  private readonly repository = new PostgresNationalCoordinationSignalRepository(getRuntimeSqlExecutor);
  private hydrated = false;

  async project(event: EcosystemBusinessEvent) {
    await this.hydrate();
    const signal = this.projection.project(event);
    if (signal) await this.repository.upsert(signal);
    return signal;
  }

  async resolveByCorrelation(correlationId: string, resolvedAt = new Date().toISOString()) {
    await this.hydrate();
    const resolved = this.projection.resolveByCorrelation(correlationId);
    await this.repository.resolveCorrelation(correlationId, resolvedAt);
    return resolved;
  }

  async snapshot(input?: { territoryId?: string; correlationId?: string }) {
    await this.hydrate();
    return this.projection.snapshot(input);
  }

  private async hydrate() {
    if (this.hydrated) return;
    this.projection.restore(await this.repository.list());
    this.hydrated = true;
  }
}

const globalService = globalThis as typeof globalThis & {
  __mbPersistentNationalCoordinationSignalService?: PersistentNationalCoordinationSignalService;
};

export function getPersistentNationalCoordinationSignalService() {
  globalService.__mbPersistentNationalCoordinationSignalService ??= new PersistentNationalCoordinationSignalService();
  return globalService.__mbPersistentNationalCoordinationSignalService;
}
