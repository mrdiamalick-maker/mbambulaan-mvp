import { AtlasOperationalLoop } from "./atlas-operational-loop";

declare global {
  var __mbambulaanAtlasOperationalLoop: AtlasOperationalLoop | undefined;
}

export function getAtlasOperationalLoop() {
  if (!globalThis.__mbambulaanAtlasOperationalLoop) {
    globalThis.__mbambulaanAtlasOperationalLoop = new AtlasOperationalLoop();
  }
  return globalThis.__mbambulaanAtlasOperationalLoop;
}

export function resetAtlasOperationalLoop() {
  globalThis.__mbambulaanAtlasOperationalLoop = new AtlasOperationalLoop();
  return globalThis.__mbambulaanAtlasOperationalLoop;
}
