export type ReportType =
  | "operational"
  | "territory"
  | "organization"
  | "institutional";


export interface Report {

  id: string;

  type: ReportType;


  title: string;


  period: string;


  generatedAt: string;


  indicators: ReportIndicator[];

}


export interface ReportIndicator {

  label: string;

  value: string;

  source: string;

}