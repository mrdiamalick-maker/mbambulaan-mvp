import { CommercialCatalog } from "./commercial-catalog";

declare global {
  var __mbambulaanCommercialCatalog: CommercialCatalog | undefined;
}

export function getCommercialCatalog() {
  globalThis.__mbambulaanCommercialCatalog ??= new CommercialCatalog();
  return globalThis.__mbambulaanCommercialCatalog;
}

export function resetCommercialCatalog() {
  getCommercialCatalog().reset();
}
