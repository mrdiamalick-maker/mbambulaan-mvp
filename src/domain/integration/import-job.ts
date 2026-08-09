export type ImportStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";


export interface ImportJob {

  id: string;


  sourceId: string;


  fileName: string;


  status: ImportStatus;


  rowsProcessed: number;


  createdAt: string;


  completedAt?: string;

}