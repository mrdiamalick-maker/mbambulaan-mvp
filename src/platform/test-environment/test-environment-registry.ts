import { IntegratedTestEnvironment } from "./integrated-test-environment";

declare global {
  var __mbambulaanIntegratedTestEnvironment: IntegratedTestEnvironment | undefined;
}

export function getIntegratedTestEnvironment() {
  if (!globalThis.__mbambulaanIntegratedTestEnvironment) {
    globalThis.__mbambulaanIntegratedTestEnvironment = new IntegratedTestEnvironment();
  }
  return globalThis.__mbambulaanIntegratedTestEnvironment;
}

export function resetIntegratedTestEnvironment(at = new Date().toISOString()) {
  const environment = getIntegratedTestEnvironment();
  return environment.reset(at);
}
