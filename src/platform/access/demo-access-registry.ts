import { DemoAccessControl } from "./demo-access-control";

declare global {
  var __mbambulaanDemoAccessControl: DemoAccessControl | undefined;
}

export function getDemoAccessControl() {
  if (!globalThis.__mbambulaanDemoAccessControl) {
    globalThis.__mbambulaanDemoAccessControl = new DemoAccessControl();
  }
  return globalThis.__mbambulaanDemoAccessControl;
}

export function resetDemoAccessControl() {
  const access = getDemoAccessControl();
  access.reset();
  return access;
}
