import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getEcosystemActorGovernanceRuntime, type ActorGovernanceCommand } from "@/platform/identity/ecosystem-actor-governance-runtime";
import { getPersistentActorGovernanceRuntime } from "@/platform/identity/persistent-actor-governance-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { publishEcosystemBusinessEvent } from "@/platform/runtime/publish-ecosystem-business-event";

const decisionCommands = new Set<ActorGovernanceCommand["type"]>([
  "record_review",
  "activate_mandate",
  "record_governance_action",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentActorGovernanceRuntime().snapshot()
    : getEcosystemActorGovernanceRuntime().snapshot();
  return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" });
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
    const execution = {
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    };
    const persistent = hasRuntimeDatabase();
    const result = persistent
      ? await getPersistentActorGovernanceRuntime().execute(execution)
      : getEcosystemActorGovernanceRuntime().execute(execution);

    let businessEvent: unknown;
    if (body.command.type === "activate_mandate") {
      const reference = body.command.mandate.activationDocumentIds[0];
      if (reference) {
        businessEvent = await publishEcosystemBusinessEvent({
          id: `event-mandate-${body.commandId}`,
          type: "identity.mandate.activated",
          occurredAt: body.command.mandate.validFrom,
          correlationId: `actor-${body.command.mandate.actorId}`,
          causationId: body.commandId,
          actorId: authorization.identity.id,
          organizationId: body.command.mandate.organizationId ?? authorization.identity.organizationId,
          territoryIds: body.command.mandate.territoryIds,
          entityType: "actor",
          entityId: body.command.mandate.actorId,
          payload: { mandateDecisionReference: reference, checksumSha256: reference },
        });
      }
    }

    return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory", businessEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "ACTOR_GOVERNANCE_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
