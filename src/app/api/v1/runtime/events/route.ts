import { NextResponse } from "next/server";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";
import type { RuntimeEvent, RuntimeEventType } from "@/platform/runtime/integrated-platform-runtime";

const supportedTypes = new Set<RuntimeEventType>([
  "operational.flow.blocked",
  "operational.flow.completed",
  "atlas.question.requested",
]);

function isRuntimeEvent(value: unknown): value is RuntimeEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<RuntimeEvent>;
  return Boolean(
    event.id &&
    event.type &&
    supportedTypes.has(event.type) &&
    event.occurredAt &&
    event.correlationId &&
    event.tenantId &&
    event.territoryId &&
    event.payload &&
    typeof event.payload === "object",
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  if (!isRuntimeEvent(body)) {
    return NextResponse.json(
      { error: { code: "INVALID_RUNTIME_EVENT", message: "L'événement runtime est invalide." } },
      { status: 400 },
    );
  }

  const runtime = getIntegratedPlatformRuntime();
  const accepted = runtime.publish(body);
  return NextResponse.json(
    { accepted, eventId: body.id, duplicate: !accepted },
    { status: accepted ? 202 : 200 },
  );
}
