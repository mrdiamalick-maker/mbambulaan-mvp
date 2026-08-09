export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "approve";


export interface AuditEntry {

  id: string;


  actorId: string;


  action: AuditAction;


  entityType: string;


  entityId: string;


  description: string;


  createdAt: string;

}