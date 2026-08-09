export type MetricCategory =
  | "activity"
  | "coordination"
  | "trust"
  | "market"
  | "impact";


export interface Metric {

  id: string;

  category: MetricCategory;

  name: string;

  value: number;

  unit?: string;

  territoryId?: string;

  period: string;

  source: string;

}