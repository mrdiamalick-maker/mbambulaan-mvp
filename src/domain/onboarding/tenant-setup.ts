import type { Tenant } from "@/domain/platform/tenant";


export interface TenantSetupInput {

  name: string;

  type: Tenant["type"];

  country: string;

  modules: string[];

}


export function createTenantSetup(
  input: TenantSetupInput
): Tenant {


  return {

    id:
      `tenant-${Date.now()}`,

    name:
      input.name,

    type:
      input.type,

    country:
      input.country,

    active:
      true

  };

}