import type { PlatformModule } from "./modules";


export interface PremiumSession {

  userId: string;

  tenantId: string;


  tenantName: string;


  planId: string;


  enabledModules: PlatformModule[];


  permissions: string[];

}