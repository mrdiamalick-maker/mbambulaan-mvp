import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getEcosystemActorGovernanceRuntime, type ActorGovernanceCommand } from "@/platform/identity/ecosystem-actor-governance-runtime";

const decisionCommands = new Set<ActorGovernanceCommand["type"]>([
  "record_review",
  "activate_mandate",
  "record_governance_action",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getEcosystemActorGovernanceRuntime().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: ActorGovernanceCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_ACTOR_GOVERNANCE_ACTION", message: "L'action et son identifiant sont obligatoires." } }, { status: 400 });
  }

  const permission = decisionCommands.has(body.command.type) ? "government.write" : "government.read";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const result = getEcosystemActorGovernanceRuntime().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "ACTOR_GOVERNANCE_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
