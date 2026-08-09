import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { createCrisisCommandFromTrigger, type CrisisTriggerInput } from "@/platform/crisis/crisis-intake";
import { getEcosystemCrisisResponseRuntime } from "@/platform/crisis/ecosystem-crisis-response-runtime";
import { getPersistentCrisisResponseRuntime } from "@/platform/crisis/persistent-crisis-response-runtime";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const body = await request.json().catch(() => undefined) as CrisisTriggerInput | undefined;
  if (!body?.triggerId || !body.sourceType) {
    return NextResponse.json({ error: { code: "INVALID_CRISIS_TRIGGER", message: "Le signal et son origine sont obligatoires." } }, { status: 400 });
  }

  try {
    const prepared = createCrisisCommandFromTrigger(body);
    const input = {
      commandId: prepared.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: prepared.command,
      occurredAt: body.occurredAt,
    };
    const persistence = hasRuntimeDatabase() ? "postgres" : "memory";
    const result = persistence === "postgres"
      ? await getPersistentCrisisResponseRuntime().execute(input)
      : getEcosystemCrisisResponseRuntime().execute(input);

    return NextResponse.json({
      ...result,
      persistence,
      institutionalContext: prepared.institutionalContext,
      message: prepared.institutionalContext
        ? "La contrainte institutionnelle est enregistrée comme contexte imposé et non comme recommandation Mbàmbulaan."
        : "Le signal grave est enregistré dans la gestion de crise.",
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "CRISIS_TRIGGER_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
