export type TenantType =
  | "organisation_professionnelle"
  | "entreprise"
  | "institution"
  | "partenaire";


export interface Tenant {

  id: string;

  name: string;

  type: TenantType;


  country: string;


  active: boolean;


  subscriptionId?: string;

}