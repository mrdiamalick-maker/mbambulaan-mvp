export type RelayType =
  | "terrain"
  | "organisation"
  | "institution"
  | "partenaire";


export interface Relay {

  id: string;

  actorId: string;

  type: RelayType;


  territoryIds: string[];


  responsibilities: string[];


  active: boolean;

}