import { IntegratedPlatformRuntime } from "./integrated-platform-runtime";

declare global {
  var __mbambulaanIntegratedRuntime: IntegratedPlatformRuntime | undefined;
}

export function getIntegratedPlatformRuntime() {
  if (!globalThis.__mbambulaanIntegratedRuntime) {
    const runtime = new IntegratedPlatformRuntime();
    runtime.start(new Date().toISOString());
    globalThis.__mbambulaanIntegratedRuntime = runtime;
  }
  return globalThis.__mbambulaanIntegratedRuntime;
}

export function resetIntegratedPlatformRuntime(startedAt = new Date().toISOString()) {
  const runtime = new IntegratedPlatformRuntime();
  runtime.start(startedAt);
  globalThis.__mbambulaanIntegratedRuntime = runtime;
  return runtime;
}
