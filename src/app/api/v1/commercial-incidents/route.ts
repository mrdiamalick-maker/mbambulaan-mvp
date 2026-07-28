import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getPersistentCommercialIncidents, type CommercialIncidentCommand } from "@/platform/commercial/persistent-commercial-incidents";
import { publishEcosystemBusinessEvent } from "@/platform/runtime/publish-ecosystem-business-event";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    return NextResponse.json(await getPersistentCommercialIncidents().snapshot());
  } catch (error) {
    return NextResponse.json({ error: { code: "COMMERCIAL_INCIDENTS_READ_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: CommercialIncidentCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_INCIDENT_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }
  const permission = body.command.type === "open" ? "trade.write" : "finance.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    const result = await getPersistentCommercialIncidents().execute({
      commandId: body.commandId,
      identity: authorization.identity,
      territoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });

    const occurredAt = body.command.at ?? new Date().toISOString();
    let businessEvent: unknown;
    if (body.command.type === "open") {
      businessEvent = await publishEcosystemBusinessEvent({
        id: `event-commercial-incident-${body.commandId}`,
        type: "commerce.incident.reported",
        occurredAt,
        correlationId: `commercial-order-${body.command.orderId}`,
        causationId: body.commandId,
        actorId: authorization.identity.id,
        organizationId: authorization.identity.organizationId,
        territoryIds: [authorization.session.activeTerritoryId],
        entityType: "commercial_incident",
        entityId: body.command.incidentId,
        payload: {
          orderId: body.command.orderId,
          incidentType: body.command.incidentType,
          summary: body.command.description,
          critical: ["cold_chain_break", "delivery_refused"].includes(body.command.incidentType),
        },
      });
    } else if (body.command.type === "assess") {
      const adjustmentXof = (body.command.logisticsPenaltyXof ?? 0) + (body.command.platformGoodwillXof ?? 0);
      businessEvent = await publishEcosystemBusinessEvent({
        id: `event-finance-adjustment-${body.commandId}`,
        type: "finance.adjustment.approved",
        occurredAt,
        correlationId: `commercial-incident-${body.command.incidentId}`,
        causationId: body.commandId,
        actorId: authorization.identity.id,
        organizationId: authorization.identity.organizationId,
        territoryIds: [authorization.session.activeTerritoryId],
        entityType: "commercial_incident",
        entityId: body.command.incidentId,
        payload: {
          summary: body.command.note,
          authorizedAmountXof: adjustmentXof,
          affectedQuantityKg: body.command.deliveredQuantityKg,
          replacementLogisticsOrganizationId: body.command.replacementLogisticsOrganizationId,
          adjustmentNature: "contractual_compensation",
        },
      });
    }

    return NextResponse.json({ ...result, businessEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "COMMERCIAL_INCIDENT_COMMAND_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
