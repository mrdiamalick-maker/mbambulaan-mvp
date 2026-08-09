export interface Responsibility {

  id: string;

  actorId: string;

  territoryId: string;


  capability:
    | "coordination"
    | "verification"
    | "reporting"
    | "field_collection";


  active: boolean;

}