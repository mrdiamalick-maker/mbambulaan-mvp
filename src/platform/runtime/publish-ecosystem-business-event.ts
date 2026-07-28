import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import type { EcosystemBusinessEvent } from "./ecosystem-business-event-bus";
import { getConfiguredEcosystemBusinessEventBus } from "./ecosystem-business-event-registry";
import { getPersistentEcosystemBusinessEventService } from "./persistent-ecosystem-business-event-service";

export async function publishEcosystemBusinessEvent(event: EcosystemBusinessEvent) {
  return hasRuntimeDatabase()
    ? getPersistentEcosystemBusinessEventService().publish(event, new Date().toISOString())
    : getConfiguredEcosystemBusinessEventBus().publish(event, new Date().toISOString());
}
