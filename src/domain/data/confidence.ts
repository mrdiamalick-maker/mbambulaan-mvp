export type ConfidenceLevel =
  | "faible"
  | "declaree"
  | "verifiee"
  | "officielle";


export interface Confidence {

  level: ConfidenceLevel;

  score: number;

  source: string;

  verifiedAt?: string;

  verifiedBy?: string;

}


export const confidenceScores: Record<ConfidenceLevel, number> = {

  faible: 25,

  declaree: 50,

  verifiee: 75,

  officielle: 100

};