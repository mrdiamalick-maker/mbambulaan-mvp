export type DataScope =
  | "own"
  | "organization"
  | "territory"
  | "national";


export interface DataPolicy {

  role: string;


  allowedScopes: DataScope[];


  sensitiveData: boolean;

}


export const defaultPolicies: DataPolicy[] = [

  {
    role:
      "terrain",

    allowedScopes:
      [
        "own"
      ],

    sensitiveData:
      false
  },


  {
    role:
      "organization",

    allowedScopes:
      [
        "organization",
        "territory"
      ],

    sensitiveData:
      false
  },


  {
    role:
      "institution",

    allowedScopes:
      [
        "territory",
        "national"
      ],

    sensitiveData:
      true
  }

];