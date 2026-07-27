import type { DemoPermission } from "./demo-access-control";
import { getDemoAccessControl } from "./demo-access-registry";

export interface DemoRequestAuthorizationInput {
  request: Request;
  permission: DemoPermission;
  territoryId?: string;
  productCode?: string;
}

export function authorizeDemoRequest(input: DemoRequestAuthorizationInput) {
  const sessionId = input.request.headers.get("x-mbambulaan-demo-session")?.trim();
  if (!sessionId) {
    return {
      allowed: false as const,
      status: 401,
      error: { code: "DEMO_SESSION_REQUIRED", message: "Une session de démonstration est obligatoire." },
    };
  }

  const authorization = getDemoAccessControl().authorize({
    sessionId,
    permission: input.permission,
    territoryId: input.territoryId,
    productCode: input.productCode,
  });

  if (!authorization.allowed) {
    return {
      allowed: false as const,
      status: 403,
      error: {
        code: "DEMO_ACCESS_DENIED",
        message: `Accès refusé : ${authorization.reason}.`,
      },
    };
  }

  return {
    allowed: true as const,
    identity: authorization.identity,
    session: authorization.session,
  };
}
