export type TrustDimension =
  | "identity"
  | "activity"
  | "commitment"
  | "data_quality"
  | "compliance";


export interface TrustScore {

  actorId: string;

  overall: number;

  dimensions: {

    dimension: TrustDimension;

    score: number;

    evidence: string[];

  }[];

  updatedAt: string;

}