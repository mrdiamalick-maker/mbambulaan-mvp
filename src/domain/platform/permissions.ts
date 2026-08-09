import type { PlatformModule } from "./modules";


export interface Permission {

  module: PlatformModule;

  actions: (
    | "view"
    | "create"
    | "update"
    | "export"
  )[];

}


export interface UserAccess {

  userId: string;

  organizationId: string;

  permissions: Permission[];

}


export function canAccess(
  access: UserAccess,
  module: PlatformModule,
  action: string
) {

  return access.permissions.some(
    (permission) =>
      permission.module === module &&
      permission.actions.includes(
        action as never
      )
  );

}