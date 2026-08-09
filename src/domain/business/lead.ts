export type LeadType =
  | "organisation"
  | "entreprise"
  | "institution"
  | "partenaire";


export interface Lead {

  id: string;

  name: string;

  type: LeadType;


  contactName: string;

  phone: string;

  email?: string;


  territory?: string;


  interestModules: string[];


  status:
    | "new"
    | "contacted"
    | "qualified"
    | "converted";

}