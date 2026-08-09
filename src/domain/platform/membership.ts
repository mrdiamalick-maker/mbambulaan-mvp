export type MembershipRole =
  | "owner"
  | "manager"
  | "operator"
  | "viewer";


export interface Membership {

  id: string;

  userId: string;

  tenantId: string;


  role: MembershipRole;


  active: boolean;

}