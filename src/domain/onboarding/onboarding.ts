export type OnboardingStatus =
  | "started"
  | "organization_created"
  | "modules_selected"
  | "users_invited"
  | "completed";


export interface OnboardingProcess {

  id: string;

  tenantId: string;


  status: OnboardingStatus;


  selectedModules: string[];


  territoryIds: string[];


  invitedUsers: string[];


  createdAt: string;

}