export type EvidenceType =
  | "photo"
  | "document"
  | "weighing"
  | "gps"
  | "declaration"
  | "administrative_record"
  | "report";


export interface Evidence {

  id: string;

  type: EvidenceType;

  source: string;

  reference?: string;

  createdAt: string;

  description?: string;

}