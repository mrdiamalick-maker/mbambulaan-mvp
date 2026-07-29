import type { DemoIdentity, DemoPermission, DemoSession } from "./demo-access-control";
import { getDemoAccessControl } from "./demo-access-registry";

export interface DemoRequestAuthorizationInput {
  request: Request;
  permission: DemoPermission;
  territoryId?: string;
  productCode?: string;
}

export type DemoRequestAuthorizationResult =
  | {
      allowed: false;
      status: 401 | 403;
      error: { code: string; message: string };
    }
  | {
      allowed: true;
      identity: DemoIdentity;
      session: DemoSession;
    };

export function authorizeDemoRequest(input: DemoRequestAuthorizationInput): DemoRequestAuthorizationResult {
  const sessionId = input.request.headers.get("x-mbambulaan-demo-session")?.trim();
  if (!sessionId) {
    return {
      allowed: false,
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

  if (!authorization.allowed || !authorization.identity || !authorization.session) {
    return {
      allowed: false,
      status: 403,
      error: {
        code: "DEMO_ACCESS_DENIED",
        message: `Accès refusé : ${authorization.reason}.`,
      },
    };
  }

  return {
    allowed: true,
    identity: authorization.identity,
    session: authorization.session,
  };
}
