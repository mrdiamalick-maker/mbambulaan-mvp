import type { PlatformModule } from "./modules";
import type { PremiumSession } from "./session";


export function hasModuleAccess(
  session: PremiumSession,
  module: PlatformModule
): boolean {

  return session.enabledModules.includes(
    module
  );

}