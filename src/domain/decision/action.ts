export type ActionType =
  | "create_coordination"
  | "notify_actor"
  | "verify_information"
  | "assign_responsibility"
  | "create_report";


export interface RecommendedAction {

  id: string;

  type: ActionType;

  title: string;

  description: string;


  targetActorIds: string[];


  status:
    | "suggested"
    | "accepted"
    | "completed";


}