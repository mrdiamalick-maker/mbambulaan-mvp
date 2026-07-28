import { getEcosystemBusinessEventBus } from "./ecosystem-business-event-bus";
import { buildDefaultBusinessEventHandlers } from "./ecosystem-business-event-handlers";

let initialized = false;

export function getConfiguredEcosystemBusinessEventBus() {
  const bus = getEcosystemBusinessEventBus();
  if (!initialized) {
    for (const handler of buildDefaultBusinessEventHandlers()) bus.subscribe(handler);
    initialized = true;
  }
  return bus;
}
