import type {
  DataScope
} from "./policy";


export interface SecurityContext {

  userId: string;


  role: string;


  organizationId?: string;


  territoryIds: string[];


  scopes: DataScope[];

}