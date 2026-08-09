export type PilotStatus =
  | "planned"
  | "active"
  | "completed"
  | "paused";


export interface Pilot {

  id: string;


  name: string;


  territoryIds: string[];


  organizationIds: string[];


  status: PilotStatus;


  startDate: string;


  endDate?: string;


  objectives: string[];


  indicators: PilotIndicator[];

}


export interface PilotIndicator {

  name: string;


  target: number;


  current: number;


  unit: string;

}