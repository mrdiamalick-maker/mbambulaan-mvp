export type WorkflowStatus =
  | "created"
  | "running"
  | "completed"
  | "cancelled";


export interface Workflow {

  id: string;

  type: string;

  territoryId?: string;

  situationId?: string;

  status: WorkflowStatus;


  createdAt: string;


  steps: WorkflowStep[];

}


export interface WorkflowStep {

  id: string;

  action: string;

  responsibleId?: string;

  status:
    | "pending"
    | "done";

  completedAt?: string;

}