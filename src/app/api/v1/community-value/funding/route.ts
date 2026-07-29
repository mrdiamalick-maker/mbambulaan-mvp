import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { convertFundingEventToCommunityContribution, type CommunityFundingEvent } from "@/platform/community/community-funding-intake";
import { getPersistentCommunityValueRuntime } from "@/platform/community/persistent-community-value-runtime";
import { getCommunityValueLoopRuntime } from "@/platform/community/community-value-loop-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const body = await request.json().catch(() => undefined) as { commandId?: string; event?: CommunityFundingEvent } | undefined;
  if (!body?.commandId || !body.event) {
    return NextResponse.json({ error: { code: "INVALID_COMMUNITY_FUNDING", message: "L'identifiant de l'action et le financement reçu sont obligatoires." } }, { status: 400 });
  }

  try {
    const contribution = convertFundingEventToCommunityContribution(body.event);
    const execution = {
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: { type: "record_contribution" as const, contribution },
    };
    const persistent = hasRuntimeDatabase();
    const result = persistent
      ? await getPersistentCommunityValueRuntime().execute({ ...execution, occurredAt: body.event.occurredAt })
      : getCommunityValueLoopRuntime().execute(execution);
    return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "COMMUNITY_FUNDING_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
