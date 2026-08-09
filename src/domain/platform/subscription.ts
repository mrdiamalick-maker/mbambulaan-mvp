import type {
  PlatformModule
} from "./modules";


export interface Subscription {

  id: string;

  planId: string;


  tenantId: string;


  modules: PlatformModule[];


  status:
    | "active"
    | "suspended"
    | "trial";



  startedAt: string;

  expiresAt?: string;

}