export type IntegrationType =
  | "api"
  | "file"
  | "webhook"
  | "manual";


export type IntegrationStatus =
  | "active"
  | "inactive"
  | "error";


export interface IntegrationSource {

  id: string;

  name: string;


  type: IntegrationType;


  provider?: string;


  status: IntegrationStatus;


  lastSync?: string;

}